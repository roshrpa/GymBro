import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';
import { GOOGLE_WEB_CLIENT_ID } from './config';

export const googleEnabled = !!GOOGLE_WEB_CLIENT_ID && GOOGLE_WEB_CLIENT_ID.includes('.apps.googleusercontent.com');

// Returns the Firebase user credential, or null if the user cancelled.
export async function signInWithGoogle() {
  // required lazily so the app still starts where the native module is missing (e.g. Expo Go)
  const { GoogleSignin, statusCodes } = require('@react-native-google-signin/google-signin');
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const res = await GoogleSignin.signIn();
    if (res && res.type === 'cancelled') return null;
    const idToken = (res && res.data && res.data.idToken) || (res && res.idToken);
    if (!idToken) throw new Error('google-no-token');
    return await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
  } catch (e) {
    if (e && (e.code === statusCodes.SIGN_IN_CANCELLED || e.code === statusCodes.IN_PROGRESS)) return null;
    throw e;
  }
}

export function googleErrorMessage(e) {
  const code = (e && e.code) || '';
  const msg = (e && e.message) || '';
  if (code === 'auth/account-exists-with-different-credential') return 'This email already has an account. Log in with email and password.';
  if (code === 'auth/network-request-failed') return 'No internet connection. Please try again.';
  if (/DEVELOPER_ERROR|10:/.test(msg) || code === '10') return 'Google sign-in is not set up correctly (SHA-1 / client ID). Check the Firebase settings.';
  if (/PLAY_SERVICES/.test(code)) return 'Google Play Services is not available on this phone.';
  return 'Google sign-in failed. Please try again.';
}
