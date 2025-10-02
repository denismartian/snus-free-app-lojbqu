
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, darkColors, commonStyles } from '@/styles/commonStyles';
import { resetProgressData } from '@/utils/storage';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'app_theme';

export default function SettingsScreen() {
  const systemColorScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isLoading, setIsLoading] = useState(false);

  // Determine current theme
  const isDark = userTheme === 'dark' || (userTheme === 'system' && systemColorScheme === 'dark');
  const currentColors = isDark ? darkColors : colors;

  React.useEffect(() => {
    loadThemePreference();
  }, []);

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
});
