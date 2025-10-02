
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
import { getProgressData, saveProgressData, resetProgressData, calculateDaysSinceStart, addNote, ProgressData } from '@/utils/storage';
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

  useEffect(() => {
    loadProgressData();
  }, []);

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

        {/* Add Note Card */}
        <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
          <Text style={[commonStyles.subtitle, { color: currentColors.text }]}>
            Добавить заметку
          </Text>
          
          {/* Mood Selection */}
          <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary, marginBottom: 8 }]}>
            Как вы себя чувствуете?
          </Text>
          <View style={styles.moodContainer}>
            {(['good', 'neutral', 'difficult'] as const).map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.moodButton,
                  selectedMood === mood && { backgroundColor: currentColors.highlight },
                ]}
                onPress={() => setSelectedMood(mood)}
              >
                <IconSymbol
                  name={getMoodIcon(mood)}
                  size={24}
                  color={getMoodColor(mood)}
                />
                <Text style={[styles.moodText, { color: currentColors.textSecondary }]}>
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
            style={[commonStyles.button, { backgroundColor: currentColors.primary }]}
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
              <View key={note.id} style={styles.noteItem}>
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
          <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
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
  },
  progressCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  progressNumber: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  milestoneContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  moodText: {
    fontSize: 12,
    marginTop: 4,
  },
  noteItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.highlight,
    paddingVertical: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
});
