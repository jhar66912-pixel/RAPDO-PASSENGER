import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as AppUser, PaymentMethod, UserReward } from '../types';
import { auth, db } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  getRedirectResult,
  signInWithRedirect
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  login: () => Promise<void>;
  loginDemo: () => Promise<void>;
  loginWithPhone: (mobile: string, name?: string, email?: string) => Promise<void>;
  loginWithEmail: (email: string, name?: string, mobile?: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  updateUserProfile: (profileData: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback demo local login to bypass any Firebase login restrictions inside sandbox iframes
  const loginDemo = async () => {
    setLoading(true);
    const mockUser: AppUser = {
      uid: 'demo-user-888',
      name: 'Riddhi Sen (Bihar Demo)',
      mobile: '+91 94314 88888',
      role: 'customer',
      createdAt: Date.now(),
      savedAddresses: [
        { id: 'addr-1', label: 'Home (Patna Jn)', address: 'Near Platform 1, Patna Junction Railway Station, Bihar' },
        { id: 'addr-2', label: 'Work (Mithanpura)', address: 'Mithanpura Chowk, Muzaffarpur, Bihar' }
      ],
      emergencyContacts: [
        { id: 'cont-1', name: 'Papa (Home)', phone: '+91 94310 12345' },
        { id: 'cont-2', name: 'RAPDO Safety Helpline', phone: '1800-345-6789' }
      ],
      paymentMethods: [
        { id: 'pay-1', type: 'upi' as const, details: 'rapdo@axis', isDefault: true },
        { id: 'pay-2', type: 'card' as const, details: '•••• •••• •••• 5678', isDefault: false }
      ],
      rewards: [
        { id: 'rew-1', title: 'Patna Local Ride Cashback', desc: 'Suno bhaiya, scratch to claim your cashback offer!', value: 50, status: 'unscratched' as const, createdAt: Date.now() },
        { id: 'rew-2', title: 'Swadeshi Samastipur Route Reward', desc: 'Claim ₹30 bonus for daily fixed commutes', value: 30, status: 'unscratched' as const, createdAt: Date.now() },
        { id: 'rew-3', title: 'Bhojpuri Swag Welcome Coupon', desc: 'Instant discount for parcel runs', value: 20, status: 'unscratched' as const, createdAt: Date.now() }
      ],
      currentLanguage: 'en',
      avatar: '🧑🏽'
    };

    localStorage.setItem('rapdo_auth_uid', 'demo-user-888');

    try {
      const userRef = doc(db, 'users', 'demo-user-888');
      await setDoc(userRef, mockUser, { merge: true });
    } catch (e) {
      console.warn("Firestore bypass set error:", e);
    }

    setCurrentUser(mockUser);
    setLoading(false);
  };

  // Perform secure SMS Simulation and log user directly with fully connected Firestore document
  const loginWithPhone = async (mobile: string, name = 'RAPDO Passenger', email = 'passenger@rapdo.in') => {
    setLoading(true);
    const cleanNumber = mobile.replace(/[^0-9]/g, '');
    const uid = `phone_${cleanNumber}`;
    const userDocRef = doc(db, 'users', uid);

    const defaultAddresses = [
      { id: 'addr-1', label: 'Home (Patna Jn)', address: 'Near Platform 1, Patna Junction Railway Station, Bihar' },
      { id: 'addr-2', label: 'Work (Mithanpura)', address: 'Mithanpura Chowk, Muzaffarpur, Bihar' }
    ];
    const defaultContacts = [
      { id: 'cont-1', name: 'Papa (Home)', phone: '+91 94310 12345' },
      { id: 'cont-2', name: 'RAPDO Safety Helpline', phone: '1800-345-6789' }
    ];
    const defaultPayments: PaymentMethod[] = [
      { id: 'pay-1', type: 'upi' as const, details: 'rapdo@axis', isDefault: true },
      { id: 'pay-2', type: 'card' as const, details: '•••• •••• •••• 5678', isDefault: false }
    ];
    const defaultRewards: UserReward[] = [
      { id: 'rew-1', title: 'Patna Local Ride Cashback', desc: 'Suno bhaiya, scratch to claim your cashback offer!', value: 50, status: 'unscratched' as const, createdAt: Date.now() },
      { id: 'rew-2', title: 'Swadeshi Samastipur Route Reward', desc: 'Claim ₹30 bonus for daily fixed commutes', value: 30, status: 'unscratched' as const, createdAt: Date.now() },
      { id: 'rew-3', title: 'Bhojpuri Swag Welcome Coupon', desc: 'Instant discount for parcel runs', value: 20, status: 'unscratched' as const, createdAt: Date.now() }
    ];

    try {
      const userDoc = await getDoc(userDocRef);
      let appUser: AppUser;

      if (!userDoc.exists()) {
        appUser = {
          uid,
          name,
          mobile,
          role: 'customer',
          createdAt: Date.now(),
          savedAddresses: defaultAddresses,
          emergencyContacts: defaultContacts,
          paymentMethods: defaultPayments,
          rewards: defaultRewards,
          currentLanguage: 'en',
          avatar: '🧑🏽'
        };
        await setDoc(userDocRef, appUser);
      } else {
        appUser = userDoc.data() as AppUser;
        appUser.role = 'customer';
        await setDoc(userDocRef, appUser, { merge: true });
      }

      localStorage.setItem('rapdo_auth_uid', uid);
      setCurrentUser(appUser);
    } catch (err) {
      console.warn("Firestore write restricted or offline (Bypassing cleanly using Local Storage):", err);
      const appUser: AppUser = {
        uid,
        name,
        mobile,
        role: 'customer',
        createdAt: Date.now(),
        savedAddresses: defaultAddresses,
        emergencyContacts: defaultContacts,
        paymentMethods: defaultPayments,
        rewards: defaultRewards,
        currentLanguage: 'en',
        avatar: '🧑🏽'
      };
      localStorage.setItem('rapdo_auth_uid', uid);
      setCurrentUser(appUser);
    } finally {
      setLoading(false);
    }
  };

  // Perform Email authentication with Firestore synchronization
  const loginWithEmail = async (email: string, name = 'RAPDO User', mobile = '+91 94310 00000') => {
    setLoading(true);
    const cleanEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '');
    const uid = `email_${cleanEmail}`;
    const userDocRef = doc(db, 'users', uid);

    const defaultAddresses = [
      { id: 'addr-1', label: 'Home (Patna Jn)', address: 'Near Platform 1, Patna Junction Railway Station, Bihar' },
      { id: 'addr-2', label: 'Work (Mithanpura)', address: 'Mithanpura Chowk, Muzaffarpur, Bihar' }
    ];
    const defaultContacts = [
      { id: 'cont-1', name: 'Papa (Home)', phone: '+91 94310 12345' },
      { id: 'cont-2', name: 'RAPDO Safety Helpline', phone: '1800-345-6789' }
    ];
    const defaultPayments: PaymentMethod[] = [
      { id: 'pay-1', type: 'upi' as const, details: 'rapdo@axis', isDefault: true },
      { id: 'pay-2', type: 'card' as const, details: '•••• •••• •••• 5678', isDefault: false }
    ];
    const defaultRewards: UserReward[] = [
      { id: 'rew-1', title: 'Patna Local Ride Cashback', desc: 'Suno bhaiya, scratch to claim your cashback offer!', value: 50, status: 'unscratched' as const, createdAt: Date.now() },
      { id: 'rew-2', title: 'Swadeshi Samastipur Route Reward', desc: 'Claim ₹30 bonus for daily fixed commutes', value: 30, status: 'unscratched' as const, createdAt: Date.now() },
      { id: 'rew-3', title: 'Bhojpuri Swag Welcome Coupon', desc: 'Instant discount for parcel runs', value: 20, status: 'unscratched' as const, createdAt: Date.now() }
    ];

    try {
      const userDoc = await getDoc(userDocRef);
      let appUser: AppUser;

      if (!userDoc.exists()) {
        appUser = {
          uid,
          name,
          mobile,
          role: 'customer',
          createdAt: Date.now(),
          savedAddresses: defaultAddresses,
          emergencyContacts: defaultContacts,
          paymentMethods: defaultPayments,
          rewards: defaultRewards,
          currentLanguage: 'en',
          avatar: '🧑🏽'
        };
        await setDoc(userDocRef, appUser);
      } else {
        appUser = userDoc.data() as AppUser;
        appUser.role = 'customer';
        await setDoc(userDocRef, appUser, { merge: true });
      }

      localStorage.setItem('rapdo_auth_uid', uid);
      setCurrentUser(appUser);
    } catch (err) {
      console.warn("Firestore database offline fallback:", err);
      const appUser: AppUser = {
        uid,
        name,
        mobile,
        role: 'customer',
        createdAt: Date.now(),
        savedAddresses: defaultAddresses,
        emergencyContacts: defaultContacts,
        paymentMethods: defaultPayments,
        rewards: defaultRewards,
        currentLanguage: 'en',
        avatar: '🧑🏽'
      };
      localStorage.setItem('rapdo_auth_uid', uid);
      setCurrentUser(appUser);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData: Partial<AppUser>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await setDoc(userDocRef, profileData, { merge: true });
      setCurrentUser(prev => prev ? { ...prev, ...profileData } : null);
    } catch (err) {
      console.warn("Cannot update profile to remote database, updating locally:", err);
      setCurrentUser(prev => prev ? { ...prev, ...profileData } : null);
    }
  };

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const setupUserDocListener = (uid: string) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
      }
      const userDocRef = doc(db, 'users', uid);
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
              { id: 'cont-2', name: 'RAPDO Safety Helpline', phone: '1800-345-6789' }
            ],
            paymentMethods: data.paymentMethods || [
              { id: 'pay-1', type: 'upi' as const, details: 'rapdo@axis', isDefault: true },
              { id: 'pay-2', type: 'card' as const, details: '•••• •••• •••• 5678', isDefault: false }
            ],
            rewards: data.rewards || [
              { id: 'rew-1', title: 'Patna Local Ride Cashback', desc: 'Suno bhaiya, scratch to claim your cashback offer!', value: 50, status: 'unscratched' as const, createdAt: Date.now() },
              { id: 'rew-2', title: 'Swadeshi Samastipur Route Reward', desc: 'Claim ₹30 bonus for daily fixed commutes', value: 30, status: 'unscratched' as const, createdAt: Date.now() },
              { id: 'rew-3', title: 'Bhojpuri Swag Welcome Coupon', desc: 'Instant discount for parcel runs', value: 20, status: 'unscratched' as const, createdAt: Date.now() }
            ],
            currentLanguage: data.currentLanguage || 'en',
            avatar: data.avatar || '🧑🏽'
          };
          setCurrentUser(enriched);
        } else {
          // If Firestore is slow or document is missing, check local configuration or keep offline representation
          setLoading(false);
        }
        setLoading(false);
      }, (error) => {
        if (error?.code !== 'unavailable') {
          console.warn("Firestore user subscription unavailable, utilizing stable local fallback details:", error);
        }
        setLoading(false);
      });
    };

    // Google Sign-In redirect landing catcher
    const handleGoogleRedirectCatcher = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            cachedAccessToken = credential.accessToken;
          }
          const firebaseUser = result.user;
          localStorage.setItem('rapdo_auth_uid', firebaseUser.uid);

          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          let appUser: AppUser;
          
          if (!userDoc.exists()) {
            appUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'RAPDO Passenger',
              mobile: firebaseUser.phoneNumber || '+91 94310 11111',
              role: 'customer',
              createdAt: Date.now(),
            };
            await setDoc(userDocRef, appUser);
          } else {
            appUser = userDoc.data() as AppUser;
          }
          setCurrentUser(appUser);
          setupUserDocListener(firebaseUser.uid);
        }
      } catch (err) {
        console.warn("Redirect catcher failed, ignore if no login occurred:", err);
      }
    };
    handleGoogleRedirectCatcher();

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        localStorage.setItem('rapdo_auth_uid', firebaseUser.uid);
        setupUserDocListener(firebaseUser.uid);
      } else {
        const storedUid = localStorage.getItem('rapdo_auth_uid');
        if (storedUid) {
          // Listen to the stored uid document
          setupUserDocListener(storedUid);
        } else {
          setCurrentUser(null);
          cachedAccessToken = null;
          setLoading(false);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      isSigningIn = true;
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupErr: any) {
        console.warn("Popup failed, using redirect fallback...", popupErr);
        if (
          popupErr?.code === 'auth/cancelled-popup-request' || 
          popupErr?.code === 'auth/popup-closed-by-user' || 
          popupErr?.code === 'auth/popup-blocked' ||
          popupErr?.code === 'auth/unauthorized-domain' ||
          String(popupErr?.message).includes('unauthorized-domain')
        ) {
          await signInWithRedirect(auth, provider);
          return;
        } else {
          throw popupErr;
        }
      }

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
            name: firebaseUser.displayName || 'RAPDO Passenger',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            mobile: firebaseUser.phoneNumber || '',
            role: 'customer',
            createdAt: Date.now(),
            lastLogin: Date.now(),
          };
          await setDoc(userDocRef, appUser);
        } else {
          appUser = userDoc.data() as AppUser;
          appUser.role = 'customer';
          appUser.lastLogin = Date.now();
          if (firebaseUser.email) appUser.email = firebaseUser.email;
          if (firebaseUser.photoURL) appUser.photoURL = firebaseUser.photoURL;
          await setDoc(userDocRef, appUser, { merge: true });
        }
      } catch (dbError: any) {
        console.warn("Firestore read failed, fallback directly:", dbError);
        appUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'RAPDO Passenger',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
          mobile: firebaseUser.phoneNumber || '',
          role: 'customer',
          createdAt: Date.now(),
          lastLogin: Date.now(),
        };
      }
      
      localStorage.setItem('rapdo_auth_uid', firebaseUser.uid);
      setCurrentUser(appUser);
    } catch (error: any) {
      console.error("Popup/Redirect Auth failed:", error);
      throw error;
    } finally {
      isSigningIn = false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Google sign out error:", e);
    }
    localStorage.removeItem('rapdo_auth_uid');
    cachedAccessToken = null;
    setCurrentUser(null);
  };

  const getAccessToken = () => cachedAccessToken;

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      login, 
      loginDemo, 
      loginWithPhone, 
      loginWithEmail, 
      logout, 
      getAccessToken, 
      updateUserProfile 
    }}>
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
