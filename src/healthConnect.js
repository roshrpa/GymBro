import { Platform } from 'react-native';
import { normalizeSessions } from './utils/healthImport';

// Reads the day's exercise sessions that Samsung Health (or any app) shared to Health Connect.
// Returns { items } or { error }.
export async function fetchHealthActivities(dateKey, weightKg) {
  if (Platform.OS !== 'android') return { error: 'Health Connect is only available on Android phones.' };
  let HC;
  try {
    HC = require('react-native-health-connect');
  } catch {
    return { error: 'Health Connect is not part of this build.' };
  }
  try {
    const status = await HC.getSdkStatus();
    const available = HC.SdkAvailabilityStatus ? HC.SdkAvailabilityStatus.SDK_AVAILABLE : 3;
    if (status !== available) return { error: 'Health Connect is not installed or needs an update. Get it from the Play Store.' };
    await HC.initialize();
    const granted = await HC.requestPermission(
      ['ExerciseSession', 'TotalCaloriesBurned', 'Distance'].map((recordType) => ({ accessType: 'read', recordType }))
    );
    if (!granted || !granted.some((g) => g.recordType === 'ExerciseSession')) {
      return { error: 'Permission was not given. Allow GymBro to read exercise data in Health Connect.' };
    }
    const [y, m, d] = dateKey.split('-').map(Number);
    const range = {
      timeRangeFilter: {
        operator: 'between',
        startTime: new Date(y, m - 1, d, 0, 0, 0).toISOString(),
        endTime: new Date(y, m - 1, d, 23, 59, 59).toISOString(),
      },
    };
    const list = (r) => (Array.isArray(r) ? r : (r && r.records) || []);
    const sessions = list(await HC.readRecords('ExerciseSession', range));
    const safe = async (t) => {
      try {
        return list(await HC.readRecords(t, range));
      } catch {
        return [];
      }
    };
    const calories = await safe('TotalCaloriesBurned');
    const distances = await safe('Distance');
    return { items: normalizeSessions({ sessions, calories, distances, weightKg }) };
  } catch (e) {
    return { error: 'Could not read Health Connect data. Make sure Samsung Health is sharing data to Health Connect.' };
  }
}
