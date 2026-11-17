import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'gymbuddy.profile.v1';

export async function loadProfile() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(profile) {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}
