import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase';

export function watchAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

export const signUp = (email, password) => createUserWithEmailAndPassword(auth, email.trim(), password);
export const signIn = (email, password) => signInWithEmailAndPassword(auth, email.trim(), password);
export const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim());
export const signOut = () => fbSignOut(auth);

export function friendlyError(e) {
  const code = (e && e.code) || '';
  const map = {
    'auth/invalid-email': 'That email address looks wrong.',
    'auth/missing-password': 'Please enter your password.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/email-already-in-use': 'An account with this email already exists. Try logging in.',
    'auth/user-not-found': 'No account found for this email.',
    'auth/wrong-password': 'Wrong password.',
    'auth/invalid-credential': 'Wrong email or password.',
    'auth/too-many-requests': 'Too many attempts. Please wait a bit and try again.',
    'auth/network-request-failed': 'No internet connection. Please try again.',
    'auth/operation-not-allowed': 'Email login is not enabled in Firebase yet.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}
