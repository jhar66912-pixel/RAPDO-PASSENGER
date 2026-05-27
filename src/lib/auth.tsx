import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as AppUser } from '../types';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  login: (role: AppUser['role']) => Promise<void>;
  loginDemo: (role: AppUser['role']) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback demo local login to bypass any Firebase login restrictions inside sandbox iframes
  const loginDemo = async (role: AppUser['role']) => {
    setLoading(true);
    const mockUser: AppUser = {
      uid: 'demo-user-888',
      name: 'Riddhi Sen (Bihar Demo)',
      mobile: '+91 94314 88888',
      role: role,
      createdAt: Date.now(),
      savedAddresses: [
        { id: 'addr-1', label: 'Home (Patna Jn)', address: 'Near Platform 1, Patna Junction Railway Station, Bihar' },
        { id: 'addr-2', label: 'Work (Mithanpura)', address: 'Mithanpura Chowk, Muzaffarpur, Bihar' }
      ],
      emergencyContacts: [
        { id: 'cont-1', name: 'Papa (Home)', phone: '+91 94310 12345' },
        { id: 'cont-2', name: 'RAHI Safety Helpline', phone: '1800-345-6789' }
      ],
      paymentMethods: [
        { id: 'pay-1', type: 'upi', details: 'rahi@axis', isDefault: true },
        { id: 'pay-2', type: 'card', details: '•••• •••• •••• 5678', isDefault: false }
      ],
      rewards: [
        { id: 'rew-1', title: 'Patna Local Ride Cashback', desc: 'Suno bhaiya, scratch to claim your cashback offer!', value: 50, status: 'unscratched', createdAt: Date.now() },
        { id: 'rew-2', title: 'Swadeshi Samastipur Route Reward', desc: 'Claim ₹30 bonus for daily fixed commutes', value: 30, status: 'unscratched', createdAt: Date.now() },
        { id: 'rew-3', title: 'Bhojpuri Swag Welcome Coupon', desc: 'Instant discount for parcel runs', value: 20, status: 'unscratched', createdAt: Date.now() }
      ],
      currentLanguage: 'en',
      avatar: '🧑🏽'
    };
    setCurrentUser(mockUser);
    setLoading(false);
  };

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        unsubscribeUserDoc = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as AppUser;
            const enriched: AppUser = {
              ...data,
              savedAddresses: data.savedAddresses || [
                { id: 'addr-1', label: 'Home (Patna Jn)', address: 'Near Platform 1, Patna Junction Railway Station, Bihar' },
                { id: 'addr-2', label: 'Work (Mithanpura)', address: 'Mithanpura Chowk, Muzaffarpur, Bihar' }
              ],
              emergencyContacts: data.emergencyContacts || [
                { id: 'cont-1', name: 'Papa (Home)', phone: '+91 94310 12345' },
                { id: 'cont-2', name: 'RAHI Safety Helpline', phone: '1800-345-6789' }
              ],
              paymentMethods: data.paymentMethods || [
                { id: 'pay-1', type: 'upi', details: 'rahi@axis', isDefault: true },
                { id: 'pay-2', type: 'card', details: '•••• •••• •••• 5678', isDefault: false }
              ],
              rewards: data.rewards || [
                { id: 'rew-1', title: 'Patna Local Ride Cashback', desc: 'Suno bhaiya, scratch to claim your cashback offer!', value: 50, status: 'unscratched', createdAt: Date.now() },
                { id: 'rew-2', title: 'Swadeshi Samastipur Route Reward', desc: 'Claim ₹30 bonus for daily fixed commutes', value: 30, status: 'unscratched', createdAt: Date.now() },
                { id: 'rew-3', title: 'Bhojpuri Swag Welcome Coupon', desc: 'Instant discount for parcel runs', value: 20, status: 'unscratched', createdAt: Date.now() }
              ],
              currentLanguage: data.currentLanguage || 'en',
              avatar: data.avatar || '🧑🏽'
            };
            setCurrentUser(enriched);
          } else {
            // First time login - let snapshot wait for initial login creation or write it ourselves
            setLoading(false);
          }
          setLoading(false);
        }, (error) => {
          if (error?.code !== 'unavailable') {
            console.error("Firestore real-time user doc listener error:", error);
          }
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        cachedAccessToken = null;
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const login = async (role: AppUser['role']) => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    provider.setCustomParameters({ prompt: 'consent' });

    try {
      isSigningIn = true;
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
         cachedAccessToken = credential.accessToken;
      }
      const firebaseUser = result.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      let appUser: AppUser;

      try {
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          appUser = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            mobile: firebaseUser.phoneNumber || '1234567890',
            role: role,
            createdAt: Date.now(),
          };
          await setDoc(userDocRef, appUser);
        } else {
          appUser = userDoc.data() as AppUser;
          if (appUser.role !== role) {
             appUser.role = role;
             await setDoc(userDocRef, appUser, { merge: true });
          }
        }
      } catch (dbError: any) {
        console.warn("Firestore error during login, proceeding with local mock:", dbError);
        appUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          mobile: firebaseUser.phoneNumber || '1234567890',
          role: role,
          createdAt: Date.now(),
        };
      }
      
      setCurrentUser(appUser);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error?.code === 'auth/cancelled-popup-request' || error?.code === 'auth/popup-closed-by-user') {
         throw new Error('Google Sign-In popup was closed or blocked. If you are in the preview iframe, please open the app in a new tab.');
      }
      throw error;
    } finally {
      isSigningIn = false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    cachedAccessToken = null;
    setCurrentUser(null);
  };

  const getAccessToken = () => cachedAccessToken;

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, loginDemo, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

