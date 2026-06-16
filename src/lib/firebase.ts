import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
import { firebaseConfig } from './firebase-config';

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const auth = getAuth(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

// Initialize conditionally to handle non-browser environments just in case
export let analytics;
export let messaging;
export let perf;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    messaging = getMessaging(app);
    perf = getPerformance(app);
  } catch(e) {
    console.error("Firebase analytics/messaging initialization error", e);
  }
}
