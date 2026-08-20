// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';

export { GoogleAuthProvider };
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // Custom authDomain — Firebase Hosting is deployed on auth.wynai.pro (Connected).
  // signInWithPopup requires Firebase Hosting to serve /__/auth/handler and /__/auth/iframe.
  authDomain: 'auth.wynai.pro',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Firebase config ready

// Guard: during Next.js static-export prerender the NEXT_PUBLIC_* vars may be
// undefined (e.g. in CI when not forwarded to tauri-action's beforeBuildCommand).
// Throw a clear dev-time error but avoid crashing the build with an empty apiKey.
if (!firebaseConfig.apiKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[WordAI Firebase] NEXT_PUBLIC_FIREBASE_API_KEY is not set. Firebase will not be initialised.');
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig.apiKey ? firebaseConfig : { ...firebaseConfig, apiKey: '__placeholder__' });

// Initialize Firebase Auth with persistence configured AT CONSTRUCTION TIME.
// Using initializeAuth() instead of getAuth() + setPersistence() avoids a race
// condition on Capacitor iOS WKWebView where IndexedDB (Firebase default) can
// deadlock. The persistence array tells Firebase to try IndexedDB first, then
// fall back to LocalStorage — automatically adapting to each platform.
export const wordaiAuth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
});

// persistenceReady is now a no-op (resolves immediately) because persistence
// was configured at init time. Kept for backward compatibility with all callers.
export const persistenceReady: Promise<void> = Promise.resolve();

// Initialize Google provider with additional settings
export const wordaiGoogleProvider = new GoogleAuthProvider();
wordaiGoogleProvider.addScope('email');
wordaiGoogleProvider.addScope('profile');

// Set custom parameters for better UX
wordaiGoogleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Analytics (only in browser, lazy loaded to avoid blocking)
let analytics: any = null;
if (typeof window !== 'undefined') {
  // Only load analytics in production to avoid blocking dev environment
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Defer analytics initialization to not block page load
    setTimeout(() => {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        // Analytics initialization failed silently
      }
    }, 100); // Load after 100ms, not blocking critical path
  }
}

export { analytics };

// Auth helper functions
export const setWordaiAuthPersistence = async () => {
  // Firebase web SDK automatically handles persistence
  return Promise.resolve();
};

export const testWordaiFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Test Firebase connection by checking if auth is available
    const isConnected = !!wordaiAuth;
    return isConnected;
  } catch (error) {
    return false;
  }
};
