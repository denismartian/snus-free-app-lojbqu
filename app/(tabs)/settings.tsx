
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, darkColors, commonStyles } from '@/styles/commonStyles';
import { resetProgressData, getProgressData, setQuitDate } from '@/utils/storage';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const THEME_KEY = 'app_theme';

export default function SettingsScreen() {
  const systemColorScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isLoading, setIsLoading] = useState(false);
  const [quitDate, setQuitDateState] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentQuitDate, setCurrentQuitDate] = useState<string | null>(null);

  // Determine current theme
  const isDark = userTheme === 'dark' || (userTheme === 'system' && systemColorScheme === 'dark');
  const currentColors = isDark ? darkColors : colors;

  React.useEffect(() => {
    loadThemePreference();
    loadQuitDate();
  }, []);

  const loadQuitDate = async () => {
    try {
      const data = await getProgressData();
      if (data?.quitDate) {
        setCurrentQuitDate(data.quitDate);
        setQuitDateState(new Date(data.quitDate));
      }
    } catch (error) {
      console.log('Error loading quit date:', error);
    }
  };

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme) {
        setUserTheme(savedTheme as 'light' | 'dark' | 'system');
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (theme: 'light' | 'dark' | 'system') => {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
      setUserTheme(theme);
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Удалить все данные',
      'Вы уверены, что хотите удалить все данные приложения? Это действие нельзя отменить. Будут удалены:\n\n• Прогресс отказа от снюса\n• Все заметки\n• Настройки приложения',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await resetProgressData();
              await AsyncStorage.removeItem(THEME_KEY);
              setUserTheme('system');
              Alert.alert('Успех', 'Все данные удалены');
            } catch (error) {
              console.log('Error deleting all data:', error);
              Alert.alert('Ошибка', 'Не удалось удалить данные');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Сброс прогресса',
      'Вы уверены, что хотите сбросить только прогресс отказа от снюса? Заметки и настройки будут сохранены.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await resetProgressData();
              Alert.alert('Успех', 'Прогресс сброшен');
            } catch (error) {
              console.log('Error resetting progress:', error);
              Alert.alert('Ошибка', 'Не удалось сбросить прогресс');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDate = new Date(quitDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setQuitDateState(newDate);
      
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(quitDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setQuitDateState(newDate);
    }
  };

  const saveQuitDate = async () => {
    try {
      await setQuitDate(quitDate.toISOString());
      setCurrentQuitDate(quitDate.toISOString());
      Alert.alert('Успех', 'Дата и время отказа сохранены!');
    } catch (error) {
      console.log('Error saving quit date:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить дату отказа');
    }
  };

  const clearQuitDate = async () => {
    Alert.alert(
      'Удалить дату отказа',
      'Вы уверены, что хотите удалить запланированную дату отказа?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const data = await getProgressData();
              if (data) {
                const updatedData = { ...data };
                delete updatedData.quitDate;
                await resetProgressData();
                // Re-save data without quit date
                if (data.startDate || data.notes.length > 0) {
                  const { saveProgressData } = await import('@/utils/storage');
                  await saveProgressData(updatedData);
                }
              }
              setCurrentQuitDate(null);
              Alert.alert('Успех', 'Дата отказа удалена');
            } catch (error) {
              console.log('Error clearing quit date:', error);
              Alert.alert('Ошибка', 'Не удалось удалить дату отказа');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    description, 
    onPress, 
    rightElement, 
    iconName, 
    iconColor = currentColors.accent 
  }: {
    title: string;
    description?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    iconName: string;
    iconColor?: string;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: currentColors.highlight }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <IconSymbol name={iconName} size={24} color={iconColor} />
        <View style={styles.settingText}>
          <Text style={[commonStyles.text, { color: currentColors.text }]}>
            {title}
          </Text>
          {description && (
            <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      {rightElement && (
        <View style={styles.settingRight}>
          {rightElement}
        </View>
      )}
      {onPress && !rightElement && (
        <IconSymbol name="chevron.right" size={16} color={currentColors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Info */}
        <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
          <View style={styles.appHeader}>
            <View style={[styles.appIcon, { backgroundColor: currentColors.primary }]}>
              <IconSymbol name="heart.fill" size={32} color={currentColors.card} />
            </View>
            <View>
              <Text style={[commonStyles.title, { color: currentColors.text, fontSize: 20 }]}>
                Без снюса
              </Text>
              <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                Трекер прогресса
              </Text>
            </View>
          </View>
        </View>

        {/* Quit Date Settings */}
        <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
          <Text style={[commonStyles.subtitle, { color: currentColors.text }]}>
            Планирование отказа
          </Text>
          
          {currentQuitDate ? (
            <View style={styles.quitDateInfo}>
              <Text style={[commonStyles.text, { color: currentColors.text }]}>
                Запланированная дата отказа:
              </Text>
              <Text style={[styles.quitDateText, { color: currentColors.primary }]}>
                {new Date(currentQuitDate).toLocaleString('ru-RU')}
              </Text>
              <View style={styles.quitDateButtons}>
                <TouchableOpacity
                  style={[styles.quitDateButton, { backgroundColor: currentColors.primary }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.quitDateButtonText, { color: currentColors.card }]}>
                    Изменить
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quitDateButton, { backgroundColor: currentColors.error }]}
                  onPress={clearQuitDate}
                >
                  <Text style={[styles.quitDateButtonText, { color: currentColors.card }]}>
                    Удалить
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noQuitDate}>
              <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                Установите дату и время, когда планируете отказаться от снюса
              </Text>
              <TouchableOpacity
                style={[styles.setQuitDateButton, { backgroundColor: currentColors.primary }]}
                onPress={() => setShowDatePicker(true)}
              >
                <IconSymbol name="calendar" size={20} color={currentColors.card} />
                <Text style={[styles.setQuitDateButtonText, { color: currentColors.card }]}>
                  Установить дату отказа
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Theme Settings */}
        <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
          <Text style={[commonStyles.subtitle, { color: currentColors.text }]}>
            Внешний вид
          </Text>
          
          <SettingItem
            title="Светлая тема"
            description="Использовать светлую тему"
            iconName="sun.max.fill"
            iconColor={currentColors.secondary}
            rightElement={
              <Switch
                value={userTheme === 'light'}
                onValueChange={(value) => saveThemePreference(value ? 'light' : 'system')}
                trackColor={{ false: currentColors.textSecondary, true: currentColors.primary }}
                thumbColor={currentColors.card}
              />
            }
          />
          
          <SettingItem
            title="Темная тема"
            description="Использовать темную тему"
            iconName="moon.fill"
            iconColor={currentColors.accent}
            rightElement={
              <Switch
                value={userTheme === 'dark'}
                onValueChange={(value) => saveThemePreference(value ? 'dark' : 'system')}
                trackColor={{ false: currentColors.textSecondary, true: currentColors.primary }}
                thumbColor={currentColors.card}
              />
            }
          />
          
          <SettingItem
            title="Системная тема"
            description="Следовать настройкам системы"
            iconName="gear"
            rightElement={
              <Switch
                value={userTheme === 'system'}
                onValueChange={(value) => saveThemePreference(value ? 'system' : 'light')}
                trackColor={{ false: currentColors.textSecondary, true: currentColors.primary }}
                thumbColor={currentColors.card}
              />
            }
          />
        </View>

        {/* Data Management */}
        <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
          <Text style={[commonStyles.subtitle, { color: currentColors.text }]}>
            Управление данными
          </Text>
          
          <SettingItem
            title="Сбросить прогресс"
            description="Начать отсчет заново, сохранив заметки"
            iconName="arrow.clockwise"
            iconColor={currentColors.warning}
            onPress={handleResetProgress}
          />
          
          <SettingItem
            title="Удалить все данные"
            description="Полная очистка приложения"
            iconName="trash.fill"
            iconColor={currentColors.error}
            onPress={handleDeleteAllData}
          />
        </View>

        {/* About */}
        <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
          <Text style={[commonStyles.subtitle, { color: currentColors.text }]}>
            О приложении
          </Text>
          
          <View style={styles.aboutText}>
            <Text style={[commonStyles.text, { color: currentColors.text }]}>
              Это приложение поможет вам отслеживать прогресс в отказе от использования снюса.
            </Text>
            <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary, marginTop: 8 }]}>
              • Отслеживание дней без снюса
            </Text>
            <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
              • Ведение заметок о самочувствии
            </Text>
            <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
              • Статистика и достижения
            </Text>
            <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
              • Без регистрации и рекламы
            </Text>
          </View>
        </View>

        {/* Support */}
        <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
          <Text style={[commonStyles.subtitle, { color: currentColors.text }]}>
            Поддержка
          </Text>
          
          <View style={styles.supportText}>
            <Text style={[commonStyles.text, { color: currentColors.text }]}>
              Помните: отказ от снюса - это процесс, и каждый день важен. 
              Не сдавайтесь, если случился срыв - просто начните заново.
            </Text>
            <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary, marginTop: 12 }]}>
              💪 Вы сильнее своих привычек!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={quitDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={quitDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}

      {/* iOS Date/Time Picker Confirmation */}
      {Platform.OS === 'ios' && (showDatePicker || showTimePicker) && (
        <View style={styles.iosPickerContainer}>
          <View style={[styles.iosPickerContent, { backgroundColor: currentColors.card }]}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity onPress={() => {
                setShowDatePicker(false);
                setShowTimePicker(false);
              }}>
                <Text style={[styles.iosPickerButton, { color: currentColors.textSecondary }]}>
                  Отмена
                </Text>
              </TouchableOpacity>
              <Text style={[styles.iosPickerTitle, { color: currentColors.text }]}>
                {showDatePicker ? 'Выберите дату' : 'Выберите время'}
              </Text>
              <TouchableOpacity onPress={() => {
                if (showDatePicker) {
                  setShowDatePicker(false);
                  setShowTimePicker(true);
                } else {
                  setShowTimePicker(false);
                  saveQuitDate();
                }
              }}>
                <Text style={[styles.iosPickerButton, { color: currentColors.primary }]}>
                  {showDatePicker ? 'Далее' : 'Готово'}
                </Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={quitDate}
              mode={showDatePicker ? 'date' : 'time'}
              display="spinner"
              onChange={showDatePicker ? handleDateChange : handleTimeChange}
              minimumDate={showDatePicker ? new Date() : undefined}
            />
          </View>
        </View>
      )}

      {/* Android Save Button */}
      {Platform.OS === 'android' && !showDatePicker && !showTimePicker && quitDate && (
        currentQuitDate !== quitDate.toISOString() && (
          <View style={styles.androidSaveContainer}>
            <TouchableOpacity
              style={[styles.androidSaveButton, { backgroundColor: currentColors.primary }]}
              onPress={saveQuitDate}
            >
              <Text style={[styles.androidSaveButtonText, { color: currentColors.card }]}>
                Сохранить дату отказа
              </Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingText: {
    flex: 1,
  },
  settingRight: {
    marginLeft: 16,
  },
  aboutText: {
    marginTop: 8,
  },
  supportText: {
    marginTop: 8,
  },
  quitDateInfo: {
    marginTop: 16,
  },
  quitDateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 16,
  },
  quitDateButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quitDateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  quitDateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noQuitDate: {
    marginTop: 16,
    alignItems: 'center',
  },
  setQuitDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  setQuitDateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  iosPickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  iosPickerContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.highlight,
  },
  iosPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  iosPickerButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  androidSaveContainer: {
    position: 'absolute',
    bottom: 34,
    left: 16,
    right: 16,
  },
  androidSaveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  androidSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
