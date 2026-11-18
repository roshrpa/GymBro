import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase web config (these values are public identifiers, not secrets;
// access is protected by Firestore security rules).
const firebaseConfig = {
  apiKey: 'AIzaSyD1cbwLZA37uoPCzrwRyEYg6HirW0rxPVQ',
  authDomain: 'gymbro-6f182.firebaseapp.com',
  projectId: 'gymbro-6f182',
  storageBucket: 'gymbro-6f182.firebasestorage.app',
  messagingSenderId: '162139495591',
  appId: '1:162139495591:web:ab49251c6f77957c4e0f82',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  // keeps the user logged in between app launches
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  auth = getAuth(app); // already initialised (fast refresh)
}

export { app, auth };
export const db = getFirestore(app);
