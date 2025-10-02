
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProgressData {
  startDate: string;
  notes: Note[];
}

export interface Note {
  id: string;
  text: string;
  date: string;
  mood?: 'good' | 'neutral' | 'difficult';
}

const STORAGE_KEY = 'snus_progress_data';

export const getProgressData = async (): Promise<ProgressData | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.log('Error getting progress data:', error);
    return null;
  }
};

export const saveProgressData = async (data: ProgressData): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Progress data saved successfully');
  } catch (error) {
    console.log('Error saving progress data:', error);
  }
};

export const resetProgressData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('Progress data reset successfully');
  } catch (error) {
    console.log('Error resetting progress data:', error);
  }
};

export const calculateDaysSinceStart = (startDate: string): number => {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const addNote = async (noteText: string, mood?: 'good' | 'neutral' | 'difficult'): Promise<void> => {
  try {
    const existingData = await getProgressData();
    if (!existingData) {
      console.log('No existing data found when trying to add note');
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      text: noteText,
      date: new Date().toISOString(),
      mood,
    };

    const updatedData: ProgressData = {
      ...existingData,
      notes: [...existingData.notes, newNote],
    };

    await saveProgressData(updatedData);
    console.log('Note added successfully');
  } catch (error) {
    console.log('Error adding note:', error);
  }
};
