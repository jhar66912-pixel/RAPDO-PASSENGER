export const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || '',
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || 'rapdo-production.firebaseapp.com',
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || 'rapdo-production',
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || 'rapdo-production.firebasestorage.app',
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || '700054395539',
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || '1:700054395539:web:10a4880d8d4b81bce0cb66',
};
