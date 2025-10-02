
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, darkColors, commonStyles } from '@/styles/commonStyles';
import { getProgressData, saveProgressData, resetProgressData, calculateDaysSinceStart, addNote, calculateTimeUntilQuit, ProgressData } from '@/utils/storage';
import { IconSymbol } from '@/components/IconSymbol';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentColors = isDark ? darkColors : colors;

  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [daysSinceStart, setDaysSinceStart] = useState(0);
  const [noteText, setNoteText] = useState('');
  const [selectedMood, setSelectedMood] = useState<'good' | 'neutral' | 'difficult' | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    loadProgressData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (progressData?.quitDate) {
      const updateCountdown = () => {
        const timeLeft = calculateTimeUntilQuit(progressData.quitDate!);
        setCountdown(timeLeft);
      };
      
      updateCountdown(); // Initial update
      interval = setInterval(updateCountdown, 1000); // Update every second
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [progressData?.quitDate]);

  const loadProgressData = async () => {
    try {
      const data = await getProgressData();
      if (data) {
        setProgressData(data);
        const days = calculateDaysSinceStart(data.startDate);
        setDaysSinceStart(days);
      } else {
        // Initialize with current date if no data exists
        const newData: ProgressData = {
          startDate: new Date().toISOString(),
          notes: [],
        };
        await saveProgressData(newData);
        setProgressData(newData);
        setDaysSinceStart(0);
      }
    } catch (error) {
      console.log('Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите текст заметки');
      return;
    }

    try {
      await addNote(noteText.trim(), selectedMood);
      setNoteText('');
      setSelectedMood(undefined);
      await loadProgressData(); // Reload to get updated notes
      Alert.alert('Успех', 'Заметка добавлена!');
    } catch (error) {
      console.log('Error adding note:', error);
      Alert.alert('Ошибка', 'Не удалось добавить заметку');
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Сброс прогресса',
      'Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetProgressData();
              await loadProgressData();
              Alert.alert('Успех', 'Прогресс сброшен');
            } catch (error) {
              console.log('Error resetting progress:', error);
              Alert.alert('Ошибка', 'Не удалось сбросить прогресс');
            }
          },
        },
      ]
    );
  };

  const getMoodIcon = (mood: 'good' | 'neutral' | 'difficult') => {
    switch (mood) {
      case 'good':
        return 'face.smiling';
      case 'neutral':
        return 'minus.circle';
      case 'difficult':
        return 'exclamationmark.triangle';
      default:
        return 'circle';
    }
  };

  const getMoodColor = (mood: 'good' | 'neutral' | 'difficult') => {
    switch (mood) {
      case 'good':
        return currentColors.success;
      case 'neutral':
        return currentColors.secondary;
      case 'difficult':
        return currentColors.warning;
      default:
        return currentColors.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={commonStyles.centerContent}>
          <Text style={[commonStyles.text, { color: currentColors.text }]}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Card */}
        <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
          <Text style={[commonStyles.title, { color: currentColors.text }]}>
            Дней без снюса
          </Text>
          <View style={styles.progressCircle}>
            <Text style={[styles.progressNumber, { color: currentColors.primary }]}>
              {daysSinceStart}
            </Text>
            <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
              {daysSinceStart === 1 ? 'день' : daysSinceStart < 5 ? 'дня' : 'дней'}
            </Text>
          </View>
          
          {daysSinceStart > 0 && (
            <View style={styles.milestoneContainer}>
              <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                {daysSinceStart >= 30 ? '🎉 Отличная работа! Месяц без снюса!' :
                 daysSinceStart >= 7 ? '👏 Неделя позади!' :
                 daysSinceStart >= 3 ? '💪 Продолжайте в том же духе!' :
                 '🌟 Каждый день важен!'}
              </Text>
            </View>
          )}
        </View>

        {/* Countdown Timer Card */}
        {progressData?.quitDate && (
          <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
            <Text style={[commonStyles.title, { color: currentColors.text }]}>
              {countdown.isExpired ? 'Время отказа наступило!' : 'Обратный отсчет до отказа'}
            </Text>
            
            {!countdown.isExpired ? (
              <View style={styles.countdownContainer}>
                <View style={styles.countdownGrid}>
                  <View style={[styles.countdownItem, { backgroundColor: currentColors.highlight }]}>
                    <Text style={[styles.countdownNumber, { color: currentColors.primary }]}>
                      {countdown.days}
                    </Text>
                    <Text style={[styles.countdownLabel, { color: currentColors.textSecondary }]}>
                      дней
                    </Text>
                  </View>
                  <View style={[styles.countdownItem, { backgroundColor: currentColors.highlight }]}>
                    <Text style={[styles.countdownNumber, { color: currentColors.primary }]}>
                      {countdown.hours}
                    </Text>
                    <Text style={[styles.countdownLabel, { color: currentColors.textSecondary }]}>
                      часов
                    </Text>
                  </View>
                  <View style={[styles.countdownItem, { backgroundColor: currentColors.highlight }]}>
                    <Text style={[styles.countdownNumber, { color: currentColors.primary }]}>
                      {countdown.minutes}
                    </Text>
                    <Text style={[styles.countdownLabel, { color: currentColors.textSecondary }]}>
                      минут
                    </Text>
                  </View>
                  <View style={[styles.countdownItem, { backgroundColor: currentColors.highlight }]}>
                    <Text style={[styles.countdownNumber, { color: currentColors.primary }]}>
                      {countdown.seconds}
                    </Text>
                    <Text style={[styles.countdownLabel, { color: currentColors.textSecondary }]}>
                      секунд
                    </Text>
                  </View>
                </View>
                <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary, textAlign: 'center', marginTop: 20 }]}>
                  📅 Запланированное время: {new Date(progressData.quitDate).toLocaleString('ru-RU')}
                </Text>
              </View>
            ) : (
              <View style={styles.expiredContainer}>
                <Text style={[styles.expiredText, { color: currentColors.success }]}>
                  🎉 Время пришло!
                </Text>
                <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary, textAlign: 'center' }]}>
                  Начните свой путь к жизни без снюса прямо сейчас!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Add Note Card */}
        <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
          <Text style={[commonStyles.subtitle, { color: currentColors.text }]}>
            Добавить заметку
          </Text>
          
          {/* Mood Selection */}
          <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary, marginBottom: 12 }]}>
            Как вы себя чувствуете?
          </Text>
          <View style={styles.moodContainer}>
            {(['good', 'neutral', 'difficult'] as const).map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.moodButton,
                  { backgroundColor: currentColors.background },
                  selectedMood === mood && { 
                    backgroundColor: currentColors.primary,
                    transform: [{ scale: 1.05 }],
                  },
                ]}
                onPress={() => setSelectedMood(mood)}
              >
                <IconSymbol
                  name={getMoodIcon(mood)}
                  size={24}
                  color={selectedMood === mood ? currentColors.card : getMoodColor(mood)}
                />
                <Text style={[
                  styles.moodText, 
                  { color: selectedMood === mood ? currentColors.card : currentColors.textSecondary }
                ]}>
                  {mood === 'good' ? 'Хорошо' : mood === 'neutral' ? 'Нормально' : 'Трудно'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[commonStyles.input, { 
              backgroundColor: currentColors.background,
              borderColor: currentColors.textSecondary,
              color: currentColors.text,
            }]}
            placeholder="Опишите свои чувства и прогресс..."
            placeholderTextColor={currentColors.textSecondary}
            value={noteText}
            onChangeText={setNoteText}
            multiline
            numberOfLines={4}
          />
          
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: currentColors.primary, marginTop: 16 }]}
            onPress={handleAddNote}
          >
            <Text style={[commonStyles.buttonText, { color: currentColors.card }]}>
              Добавить заметку
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Notes */}
        {progressData && progressData.notes.length > 0 && (
          <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
            <Text style={[commonStyles.subtitle, { color: currentColors.text }]}>
              Последние заметки
            </Text>
            {progressData.notes.slice(-3).reverse().map((note) => (
              <View key={note.id} style={[styles.noteItem, { borderBottomColor: currentColors.highlight }]}>
                <View style={styles.noteHeader}>
                  {note.mood && (
                    <IconSymbol
                      name={getMoodIcon(note.mood)}
                      size={16}
                      color={getMoodColor(note.mood)}
                    />
                  )}
                  <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                    {new Date(note.date).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
                <Text style={[commonStyles.text, { color: currentColors.text }]}>
                  {note.text}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Reset Button */}
        <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
          <TouchableOpacity
            style={[commonStyles.buttonDanger, { backgroundColor: currentColors.error }]}
            onPress={handleResetProgress}
          >
            <Text style={[commonStyles.buttonText, { color: currentColors.card }]}>
              Сбросить прогресс
            </Text>
          </TouchableOpacity>
          <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary, textAlign: 'center', marginTop: 12 }]}>
            Используйте только в случае необходимости
          </Text>
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
    paddingBottom: 100, // Extra padding for floating tab bar
  },
  progressCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  progressNumber: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  milestoneContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  moodButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 90,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  moodText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  noteItem: {
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  countdownContainer: {
    marginVertical: 24,
  },
  countdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  countdownItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  countdownNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  countdownLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  expiredContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  expiredText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
