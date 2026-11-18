import AsyncStorage from '@react-native-async-storage/async-storage';
import { migrateProfile } from './profileModel';

// Local storage "repository". To move to Firebase later, keep these two function
// signatures and change the bodies to read/write Firestore `users/{uid}`.
const KEY = 'gymbuddy.profile.v1';

export async function loadProfile() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? migrateProfile(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(profile) {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}

// Workout logs: array of sessions (see src/utils/logs.js). Firebase later: `users/{uid}/sessions`.
const LOGS_KEY = 'gymbuddy.logs.v1';

export async function loadLogs() {
  try {
    const raw = await AsyncStorage.getItem(LOGS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function saveLogs(logs) {
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}
