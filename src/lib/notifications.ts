import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app } from './firebase';

export type NotificationCategory = 'ride' | 'parcel' | 'wallet' | 'offer' | 'safety' | 'system';

export interface Notification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  isRead: boolean;
  timestamp: number;
  data?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

export const useNotifications = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      
      addNotification: (notif) => {
        const newNotif: Notification = {
          ...notif,
          id: Math.random().toString(36).substring(2, 9),
          isRead: false,
          timestamp: Date.now(),
        };
        set((state) => {
          const newNotifications = [newNotif, ...state.notifications].slice(0, 50);
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter((n) => !n.isRead).length,
          };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const newNotifications = state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter((n) => !n.isRead).length,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      },

      deleteNotification: (id) => {
         set((state) => {
           const newNotifications = state.notifications.filter((n) => n.id !== id);
           return {
             notifications: newNotifications,
             unreadCount: newNotifications.filter((n) => !n.isRead).length,
           };
         });
      }
    }),
    {
      name: 'rapdo-notifications-store',
    }
  )
);

export const initFCM = async () => {
  if (useNotifications.getState().notifications.length === 0) {
    useNotifications.getState().addNotification({
      title: 'Welcome to RAPDO Elite!',
      body: 'Your premium logistics and ride network is active. Enjoy exclusive early access rewards in Bihar.',
      category: 'offer'
    });
  }

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("FCM is not supported in this browser environment.");
      return;
    }
    
    // Using a try-catch for getToken to silently handle missing VAPID key in development
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      try {
         const messaging = getMessaging(app);
         await getToken(messaging);
         
         onMessage(messaging, (payload) => {
            console.log('Message received in foreground. ', payload);
            
            useNotifications.getState().addNotification({
               title: payload.notification?.title || 'RAPDO Update',
               body: payload.notification?.body || '',
               category: (payload.data?.category as NotificationCategory) || 'system',
               data: payload.data,
            });
            
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(payload.notification?.title || 'RAPDO', {
                 body: payload.notification?.body || '',
                 icon: '/icon-192x192.png'
              });
            }
         });
      } catch (e) {
          console.warn("FCM messaging restricted or missing config, skipping setup.", e);
      }
    }
  } catch (error) {
    console.error("FCM Initialization Error:", error);
  }
};
