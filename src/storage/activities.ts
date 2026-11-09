import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity } from '../types';

const KEY = 'family-app/activities';

export async function loadActivities(): Promise<Activity[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Activity[]) : [];
}

export async function saveActivities(items: Activity[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}
