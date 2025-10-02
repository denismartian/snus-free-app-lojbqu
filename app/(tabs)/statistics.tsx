
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, darkColors, commonStyles } from '@/styles/commonStyles';
import { getProgressData, calculateDaysSinceStart, ProgressData, Note } from '@/utils/storage';
import { IconSymbol } from '@/components/IconSymbol';

const { width } = Dimensions.get('window');

export default function StatisticsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentColors = isDark ? darkColors : colors;

  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [daysSinceStart, setDaysSinceStart] = useState(0);
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
      }
    } catch (error) {
      console.log('Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeeklyProgress = () => {
    if (!progressData) return [];
    
    const weeks = [];
    const startDate = new Date(progressData.startDate);
    const currentDate = new Date();
    
    let weekStart = new Date(startDate);
    let weekNumber = 1;
    
    while (weekStart <= currentDate) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const notesInWeek = progressData.notes.filter(note => {
        const noteDate = new Date(note.date);
        return noteDate >= weekStart && noteDate <= weekEnd;
      });
      
      weeks.push({
        weekNumber,
        startDate: new Date(weekStart),
        endDate: weekEnd > currentDate ? currentDate : weekEnd,
        notesCount: notesInWeek.length,
        goodMoodCount: notesInWeek.filter(note => note.mood === 'good').length,
        difficultMoodCount: notesInWeek.filter(note => note.mood === 'difficult').length,
      });
      
      weekStart.setDate(weekStart.getDate() + 7);
      weekNumber++;
    }
    
    return weeks;
  };

  const getMoodStats = () => {
    if (!progressData || progressData.notes.length === 0) {
      return { good: 0, neutral: 0, difficult: 0 };
    }

    const total = progressData.notes.length;
    const good = progressData.notes.filter(note => note.mood === 'good').length;
    const difficult = progressData.notes.filter(note => note.mood === 'difficult').length;
    const neutral = total - good - difficult;

    return {
      good: Math.round((good / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      difficult: Math.round((difficult / total) * 100),
    };
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (daysSinceStart >= 1) achievements.push({ title: 'Первый день', icon: 'star.fill', color: currentColors.secondary });
    if (daysSinceStart >= 3) achievements.push({ title: '3 дня', icon: 'flame.fill', color: currentColors.warning });
    if (daysSinceStart >= 7) achievements.push({ title: 'Неделя', icon: 'trophy.fill', color: currentColors.primary });
    if (daysSinceStart >= 14) achievements.push({ title: '2 недели', icon: 'medal.fill', color: currentColors.accent });
    if (daysSinceStart >= 30) achievements.push({ title: 'Месяц', icon: 'crown.fill', color: currentColors.success });
    if (daysSinceStart >= 90) achievements.push({ title: '3 месяца', icon: 'diamond.fill', color: currentColors.primary });
    if (daysSinceStart >= 365) achievements.push({ title: 'Год', icon: 'sparkles', color: currentColors.secondary });
    
    return achievements;
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

  if (!progressData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={commonStyles.centerContent}>
          <Text style={[commonStyles.text, { color: currentColors.text }]}>
            Нет данных для отображения
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const weeklyProgress = getWeeklyProgress();
  const moodStats = getMoodStats();
  const achievements = getAchievements();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Overview Card */}
        <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
          <Text style={[commonStyles.title, { color: currentColors.text }]}>
            Статистика
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: currentColors.primary }]}>
                {daysSinceStart}
              </Text>
              <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                Дней без снюса
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: currentColors.accent }]}>
                {progressData.notes.length}
              </Text>
              <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                Заметок
              </Text>
            </View>
          </View>
        </View>

        {/* Mood Statistics */}
        {progressData.notes.length > 0 && (
          <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
            <Text style={[commonStyles.subtitle, { color: currentColors.text }]}>
              Настроение
            </Text>
            
            <View style={styles.moodStatsContainer}>
              <View style={styles.moodStatItem}>
                <IconSymbol name="face.smiling" size={24} color={currentColors.success} />
                <Text style={[commonStyles.text, { color: currentColors.text }]}>
                  {moodStats.good}%
                </Text>
                <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                  Хорошо
                </Text>
              </View>
              
              <View style={styles.moodStatItem}>
                <IconSymbol name="minus.circle" size={24} color={currentColors.secondary} />
                <Text style={[commonStyles.text, { color: currentColors.text }]}>
                  {moodStats.neutral}%
                </Text>
                <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                  Нормально
                </Text>
              </View>
              
              <View style={styles.moodStatItem}>
                <IconSymbol name="exclamationmark.triangle" size={24} color={currentColors.warning} />
                <Text style={[commonStyles.text, { color: currentColors.text }]}>
                  {moodStats.difficult}%
                </Text>
                <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                  Трудно
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
            <Text style={[commonStyles.subtitle, { color: currentColors.text }]}>
              Достижения
            </Text>
            
            <View style={styles.achievementsContainer}>
              {achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementItem}>
                  <IconSymbol
                    name={achievement.icon}
                    size={32}
                    color={achievement.color}
                  />
                  <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                    {achievement.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Weekly Progress */}
        {weeklyProgress.length > 1 && (
          <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
            <Text style={[commonStyles.subtitle, { color: currentColors.text }]}>
              Прогресс по неделям
            </Text>
            
            {weeklyProgress.slice(-4).map((week, index) => (
              <View key={week.weekNumber} style={styles.weekItem}>
                <View style={styles.weekHeader}>
                  <Text style={[commonStyles.text, { color: currentColors.text }]}>
                    Неделя {week.weekNumber}
                  </Text>
                  <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                    {week.notesCount} заметок
                  </Text>
                </View>
                
                <View style={styles.weekStats}>
                  <View style={styles.weekStatItem}>
                    <IconSymbol name="face.smiling" size={16} color={currentColors.success} />
                    <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                      {week.goodMoodCount}
                    </Text>
                  </View>
                  
                  <View style={styles.weekStatItem}>
                    <IconSymbol name="exclamationmark.triangle" size={16} color={currentColors.warning} />
                    <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                      {week.difficultMoodCount}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* All Notes */}
        {progressData.notes.length > 0 && (
          <View style={[commonStyles.card, { backgroundColor: currentColors.card }]}>
            <Text style={[commonStyles.subtitle, { color: currentColors.text }]}>
              Все заметки ({progressData.notes.length})
            </Text>
            
            {progressData.notes.slice().reverse().map((note) => (
              <View key={note.id} style={styles.noteItem}>
                <View style={styles.noteHeader}>
                  <Text style={[commonStyles.textSecondary, { color: currentColors.textSecondary }]}>
                    {new Date(note.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  {note.mood && (
                    <IconSymbol
                      name={note.mood === 'good' ? 'face.smiling' : 
                            note.mood === 'difficult' ? 'exclamationmark.triangle' : 'minus.circle'}
                      size={16}
                      color={note.mood === 'good' ? currentColors.success :
                             note.mood === 'difficult' ? currentColors.warning : currentColors.secondary}
                    />
                  )}
                </View>
                <Text style={[commonStyles.text, { color: currentColors.text }]}>
                  {note.text}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  moodStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  moodStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 16,
    gap: 16,
  },
  achievementItem: {
    alignItems: 'center',
    gap: 4,
  },
  weekItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.highlight,
    paddingVertical: 12,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekStats: {
    flexDirection: 'row',
    gap: 16,
  },
  weekStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.highlight,
    paddingVertical: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});
