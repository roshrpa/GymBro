import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { migrateProfile } from './profileModel';

// Repository: Firestore is the source of truth when a user is logged in; AsyncStorage is an
// offline cache (and keeps the app usable without internet).
//   users/{uid}              -> profile
//   users/{uid}/data/logs    -> { sessions: [...] }
let uid = null;
export const setStorageUser = (id) => {
  uid = id || null;
};

const LEGACY_PROFILE = 'gymbuddy.profile.v1';
const LEGACY_LOGS = 'gymbuddy.logs.v1';
const pKey = () => (uid ? `gymbro.${uid}.profile` : LEGACY_PROFILE);
const lKey = () => (uid ? `gymbro.${uid}.logs` : LEGACY_LOGS);
const CLOUD_MAX_SESSIONS = 300; // keeps the document well under Firestore's 1 MB limit

const clean = (o) => JSON.parse(JSON.stringify(o)); // Firestore rejects `undefined`
const readJson = async (k) => {
  try {
    const raw = await AsyncStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const profileRef = () => doc(db, 'users', uid);
const logsRef = () => doc(db, 'users', uid, 'data', 'logs');

export async function loadProfile() {
  if (uid) {
    try {
      const snap = await getDoc(profileRef());
      if (snap.exists()) {
        const p = migrateProfile(snap.data());
        await AsyncStorage.setItem(pKey(), JSON.stringify(p));
        return p;
      }
    } catch {
      /* offline: fall through to cache */
    }
  }
  let local = await readJson(pKey());
  // first login on a device that already had local-only data: adopt it
  if (!local && uid) {
    local = await readJson(LEGACY_PROFILE);
    if (local) await saveProfile(migrateProfile(local));
  }
  return local ? migrateProfile(local) : null;
}

export async function saveProfile(profile) {
  await AsyncStorage.setItem(pKey(), JSON.stringify(profile));
  if (uid) {
    try {
      await setDoc(profileRef(), clean(profile));
    } catch {
      /* will sync on the next save */
    }
  }
}

export async function loadLogs() {
  if (uid) {
    try {
      const snap = await getDoc(logsRef());
      if (snap.exists() && Array.isArray(snap.data().sessions)) {
        const s = snap.data().sessions;
        await AsyncStorage.setItem(lKey(), JSON.stringify(s));
        return s;
      }
    } catch {
      /* offline */
    }
  }
  let local = await readJson(lKey());
  if (!local && uid) {
    local = await readJson(LEGACY_LOGS);
    if (Array.isArray(local) && local.length) await saveLogs(local);
  }
  return Array.isArray(local) ? local : [];
}

export async function saveLogs(logs) {
  await AsyncStorage.setItem(lKey(), JSON.stringify(logs));
  if (uid) {
    try {
      await setDoc(logsRef(), clean({ sessions: logs.slice(-CLOUD_MAX_SESSIONS), updatedAt: Date.now() }));
    } catch {
      /* will sync on the next save */
    }
  }
}
