import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { DEMO_ROUTES, Booking } from '../types';
import { MapPin, Search, Navigation, Star, PhoneCall, Sparkles, Bike, PackageOpen, Mic, Calendar, X } from 'lucide-react';
import { validateDistance } from '../lib/maps';
import { Map, Marker, useMapsLibrary } from '../components/SmartMapView';
import { RouteDisplay } from '../components/MapFeatures';
import { collection, query, where, onSnapshot, setDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import BottomNav from '../components/BottomNav';

export default function BookingPage() {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, getAccessToken } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleServiceType, setScheduleServiceType] = useState<'bike' | 'parcel'>('bike');

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | null }>({ message: '', type: null });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 4500);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authLoading) setIsInitializing(false);
    }, 1200); // Premium brief loading pause
    return () => clearTimeout(timer);
  }, [authLoading]);

  const [mode, setMode] = useState<'fixed' | 'custom'>('fixed');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  
  const [customPickup, setCustomPickup] = useState('');
  const [customDrop, setCustomDrop] = useState('');
  
  const [bookingStatus, setBookingStatus] = useState<Booking | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [comment, setComment] = useState('');

  const selectedRoute = DEMO_ROUTES.find(r => r.routeId === selectedRouteId);

  // Map selection state
  const geocodingLib = useMapsLibrary('geocoding');
  const [pickupCoords, setPickupCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [dropCoords, setDropCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectionMode, setSelectionMode] = useState<'pickup' | 'drop'>('pickup');
  const [riderLocation, setRiderLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  // Listen for existing active bookings
  useEffect(() => {
    if (!currentUser) return;
    
    // Using a simpler query to avoid index requirements, then filtering locally
    const q = query(collection(db, 'bookings'), where('customerId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => d.data() as Booking);
      // Find latest active booking
      const active = docs.find(d => ['searching', 'accepted'].includes(d.status));
      if (active) {
        setActiveBookingId(active.bookingId);
        setBookingStatus(active);
      } else {
        // If we had an active class that just completed
        if (bookingStatus?.status === 'accepted' && docs.find(d => d.bookingId === bookingStatus.bookingId)?.status === 'completed') {
           setBookingStatus({...bookingStatus, status: 'completed'});
           setShowRating(true);
        }
      }
    });
    
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Mock checking ride status updates (Simulate rider answering) 
  useEffect(() => {
    if (!activeBookingId || !bookingStatus) return;

    let timer: any;
    let locationTimer: any;

    if (bookingStatus.status === 'searching') {
       // Simulate Rider accepting
       timer = setTimeout(() => {
           updateDoc(doc(db, 'bookings', activeBookingId), {
               status: 'accepted',
               assignedRiderId: 'RIDER1'
           });
       }, 3000);
    } else if (bookingStatus.status === 'accepted') {
       // Simulate Rider moving
       if (!riderLocation && pickupCoords) {
           setRiderLocation({ lat: pickupCoords.lat - 0.005, lng: pickupCoords.lng - 0.005 });
       }
       locationTimer = setInterval(() => {
           setRiderLocation(prev => {
               if (!prev) return pickupCoords || {lat: 25.7796, lng: 84.7499};
               return { lat: prev.lat + 0.0005, lng: prev.lng + 0.0005 };
           });
       }, 1000);

       // Simulate completed after some time for demo
       timer = setTimeout(() => {
          updateDoc(doc(db, 'bookings', activeBookingId), {
             status: 'completed'
          });
       }, 15000);
    }
    
    return () => {
       clearTimeout(timer);
       clearInterval(locationTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingStatus?.status, activeBookingId, pickupCoords]);

  // Marker SVGs
  const pickupIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#121212" stroke="#FAFAFA" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="#fff"/></svg>`)}`;
  const dropIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#FFD000" stroke="#121212" stroke-width="2"/><circle cx="16" cy="16" r="4" fill="#000"/></svg>`)}`;
  const bikeIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="22" fill="#121212" stroke="#FFD000" stroke-width="4"/><text x="24" y="32" font-size="24" text-anchor="middle">🏍️</text></svg>`)}`;

  const handleMapClick = (e: any) => {
     if (!geocodingLib || !e) return;
     
     // Robust extraction of coordinates supporting both real Google maps (detail.latLng)
     // and custom simulated maps (latLng) structures, handling functions vs raw values
     let rawLatLng = null;
     if (e.detail && e.detail.latLng) {
        rawLatLng = e.detail.latLng;
     } else if (e.latLng) {
        rawLatLng = e.latLng;
     }
     
     if (!rawLatLng) return;

     let latVal = 0;
     if (typeof rawLatLng.lat === 'function') {
        latVal = rawLatLng.lat();
     } else if (typeof rawLatLng.lat === 'number') {
        latVal = rawLatLng.lat;
     } else {
        return;
     }

     let lngVal = 0;
     if (typeof rawLatLng.lng === 'function') {
        lngVal = rawLatLng.lng();
     } else if (typeof rawLatLng.lng === 'number') {
        lngVal = rawLatLng.lng;
     } else {
        return;
     }

     const latLng = { lat: latVal, lng: lngVal };
     
     const geocoder = new geocodingLib.Geocoder();
     geocoder.geocode({ location: latLng }).then(res => {
         const addr = res.results[0]?.formatted_address || `${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`;
         if (selectionMode === 'pickup') {
             setPickupCoords(latLng);
             setCustomPickup(addr);
             setSelectionMode('drop');
         } else {
             setDropCoords(latLng);
             setCustomDrop(addr);
         }
     }).catch(err => {
         console.warn("Geocode failed", err);
         const addr = `${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`;
         if (selectionMode === 'pickup') { 
             setPickupCoords(latLng); 
             setCustomPickup(addr); 
             setSelectionMode('drop'); 
         } else { 
             setDropCoords(latLng); 
             setCustomDrop(addr); 
         }
     });
  };

  const handleBookFixed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteId || !selectedRoute) return;
    
    // Write booking creation to Firestore
    const newBooking: Booking = {
      bookingId: Math.random().toString(36).substr(2, 9),
      customerId: currentUser?.uid || '',
      customerName: currentUser?.name || 'Guest',
      customerMobile: currentUser?.mobile || '',
      bookingType: 'fixed',
      selectedRouteId: selectedRoute.routeId,
      pickupName: selectedRoute.pickupName,
      dropName: selectedRoute.dropName,
      fare: selectedRoute.fare,
      status: 'searching',
      rideOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: Date.now()
    };
    
    await setDoc(doc(db, 'bookings', newBooking.bookingId), newBooking);
    setActiveBookingId(newBooking.bookingId);
  };

  const handleBookCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPickup || !customDrop) return;
    
    // Mock distance validation logic
    const distanceKm = customDrop.toLowerCase().includes('far') ? 40 : 15;
    
    if (distanceKm > 30) {
       showToast("RAHI service abhi sirf 30km locality tak available hai.", "error");
       return;
    }
    
    const newBooking: Booking = {
      bookingId: Math.random().toString(36).substr(2, 9),
      customerId: currentUser?.uid || '',
      customerName: currentUser?.name || 'Guest',
      customerMobile: currentUser?.mobile || '',
      bookingType: 'custom',
      pickupName: customPickup,
      dropName: customDrop,
      distanceKm: distanceKm,
      status: 'searching',
      rideOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: Date.now()
    };
    
    await setDoc(doc(db, 'bookings', newBooking.bookingId), newBooking);
    setActiveBookingId(newBooking.bookingId);
  };

  const handleScheduleClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'fixed') {
      if (!selectedRouteId || !selectedRoute) {
        showToast("Bhaiya, pehle destination route select kijiye!", "error");
        return;
      }
    } else {
      if (!customPickup || !customDrop) {
        showToast("Bhaiya, pehle pickup aur drop coordinates click karke add kijiye!", "error");
        return;
      }
    }
    // Preload defaults
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
    setScheduleTime('10:00');
    setShowScheduleModal(true);
  };

  const handleNativeSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate || !scheduleTime) {
      showToast("Kripa karke valid date aur time chunien!", "error");
      return;
    }

    try {
      let pickupStr = '';
      let dropStr = '';
      let estFare = 45;

      if (mode === 'fixed' && selectedRoute) {
        pickupStr = selectedRoute.pickupName;
        dropStr = selectedRoute.dropName;
        estFare = selectedRoute.fare;
      } else {
        if (!customPickup || !customDrop) {
          showToast("Coordinates entry incomplete!", "error");
          return;
        }
        pickupStr = customPickup;
        dropStr = customDrop;
        estFare = customDrop.toLowerCase().includes('far') ? 95 : 55;
      }

      setIsScheduling(true);

      const scheduledBooking: Booking = {
        bookingId: 'SCH-' + Math.random().toString(36).substr(2, 9),
        customerId: currentUser?.uid || '',
        customerName: currentUser?.name || 'Guest',
        customerMobile: currentUser?.mobile || '',
        bookingType: mode,
        selectedRouteId: mode === 'fixed' ? selectedRouteId : undefined,
        pickupName: pickupStr,
        dropName: dropStr,
        fare: estFare,
        status: 'scheduled' as any,
        rideOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        createdAt: Date.now(),
        scheduledTime: `${scheduleDate} @ ${scheduleTime}` as any
      };

      await setDoc(doc(db, 'bookings', scheduledBooking.bookingId), scheduledBooking);
      
      // Save txn trace
      const txnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
      await setDoc(doc(db, 'transactions', txnId), {
        transactionId: txnId,
        customerId: currentUser?.uid || '',
        title: `${scheduleServiceType === 'bike' ? 'Scheduled Ride' : 'Scheduled Parcel'} Reserved`,
        amount: `-₹${estFare}`,
        type: 'scheduled',
        date: `${scheduleDate}, ${scheduleTime}`,
        createdAt: Date.now()
      });

      // Show native calendar alert if requested, else browser success
      const token = getAccessToken();
      if (token) {
        try {
          const startTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

          const event = {
            summary: `🏍️ RAHI Dispatch: ${pickupStr} to ${dropStr}`,
            description: `Scheduled via RAHI AI Super App. Estimated Fare: ₹${estFare}`,
            start: { dateTime: startTime.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
            end: { dateTime: endTime.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
            colorId: '5'
          };

          await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
          });
        } catch (calErr) {
          console.warn("Google Calendar sync skipped or offline:", calErr);
        }
      }

      showToast(`🎉 Waah bhaiya! Aapka ${scheduleServiceType === 'bike' ? 'Ride' : 'Parcel'}-taxi safaltapoorvak schedule ho gaya hai! check 'Activity' tab.`, "success");
      setShowScheduleModal(false);
    } catch (err) {
      console.error(err);
      showToast("Error writing schedule to Firestore", "error");
    } finally {
      setIsScheduling(false);
    }
  };

  const submitRating = () => {
     showToast(`Dhanyawad bhaiya! Rating submitted: ${ratingVal} Stars`, "success");
     setShowRating(false);
     setBookingStatus(null);
     setActiveBookingId(null);
  };

  const showSkeleton = authLoading || isInitializing;

  if (showSkeleton) {
    return (
      <div className="flex-1 bg-[#0A0A0A] min-h-screen font-sans">
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite linear;
          }
        `}</style>
        <div className="w-full max-w-md mx-auto min-h-screen bg-[#121212] shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative flex flex-col">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FFD000]/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
          
          <div className="p-8 relative z-10 flex-1 overflow-y-auto no-scrollbar flex flex-col">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-10">
              <div className="space-y-3">
                <div className="w-24 h-3 bg-white/5 rounded-full relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>
                <div className="w-40 h-8 bg-white/5 rounded-xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>
              </div>
              <div className="w-14 h-14 bg-white/5 rounded-full relative overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* AI Pill Skeleton */}
             <div className="w-full h-24 bg-[#1A1A1A] rounded-[24px] mb-8 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
             </div>

            {/* Category Selector Skeleton */}
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="h-32 bg-[#1A1A1A] rounded-[32px] relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
               </div>
               <div className="h-32 bg-[#1A1A1A] rounded-[32px] relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
               </div>
            </div>

            {/* Main Form Box Skeleton */}
            <div className="flex-1 bg-[#1A1A1A] rounded-[36px] p-8 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer opacity-50" />
            </div>

          </div>
          <BottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#050505] min-h-screen font-sans">
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#0A0A0A] shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative flex flex-col pb-24 overflow-x-hidden">
        
        {/* Custom Glassmorphic Toast banner */}
        <AnimatePresence>
          {toast.type && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 16, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="absolute top-20 left-4 right-4 z-[99] p-4 rounded-2xl bg-[#121212]/95 backdrop-blur-2xl border border-[#FFD000]/20 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex items-center gap-3 animate-in fade-in"
            >
              <div className="w-8 h-8 rounded-full bg-[#FFD000]/10 border border-[#FFD000]/30 flex items-center justify-center text-[#FFD000] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-white text-xs font-bold leading-snug">{toast.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Cinematic Background Layer */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src={bookingStatus 
              ? "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" 
              : "https://images.unsplash.com/photo-1622185135505-2d795003994a?auto=format&fit=crop&q=80&w=800"
            }
            alt="Cinematic Background Backdrop" 
            className="w-full h-full object-cover opacity-15 mix-blend-luminosity scale-105 pointer-events-none transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/85 via-[#0A0A0A]/95 to-[#0A0A0A] pointer-events-none" />
        </div>

        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-[-100px] w-[400px] h-[400px] bg-gradient-to-bl from-[#FFD000]/10 to-blue-500/5 rounded-full blur-[90px] pointer-events-none mix-blend-screen z-10" />
        <div className="absolute bottom-0 left-[-100px] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none mix-blend-screen z-10" />

        <div className="p-8 relative z-20 flex-1 overflow-y-auto no-scrollbar">
          {/* Header */}
          <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex justify-between items-center mb-8"
          >
            <div>
              <p className="text-white/40 text-[10px] font-black tracking-[0.2em] uppercase">Kahan jana hai?</p>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                 Hello, {currentUser?.name?.split(' ')[0] || 'Dost'}
                 <motion.span animate={{ rotate: [0, 15, -5, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>👋</motion.span>
              </h1>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-[#FFD000] to-[#F5B700] p-[2px] rounded-[20px] flex items-center justify-center shadow-[0_0_30px_rgba(255,208,0,0.3)] transform-gpu hover:scale-105 transition-all">
               <div className="bg-[#0A0A0A] w-full h-full rounded-[18px] flex items-center justify-center">
                  <span className="text-2xl drop-shadow-md">🧑🏽</span>
               </div>
            </div>
          </motion.div>

          {/* AI Suggestion Pill */}
          {!bookingStatus && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               whileHover={{ scale: 1.02 }}
               className="bg-[#121212]/80 backdrop-blur-xl border border-[#FFD000]/30 hover:bg-[#1A1A1A] rounded-[28px] p-5 flex items-center gap-5 mb-8 shadow-[0_20px_40px_rgba(255,208,0,0.05)] relative overflow-hidden transition-all duration-300 group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFD000]/0 via-[#FFD000]/5 to-[#FFD000]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#FFD000]/15 rounded-full blur-[20px] group-hover:bg-[#FFD000]/25 transition-all duration-500"></div>
              
              <div className="w-12 h-12 bg-[#FFD000]/10 rounded-[18px] flex items-center justify-center shrink-0 border border-[#FFD000]/30 group-hover:scale-110 shadow-inner transition-transform duration-300">
                 <Sparkles className="text-[#FFD000] w-6 h-6 animate-pulse" />
              </div>
              <div className="relative z-10 w-full flex justify-between items-center">
                 <div>
                    <p className="text-[9px] text-[#FFD000] uppercase tracking-widest font-black mb-1">RAHI AI Insight</p>
                    <p className="text-sm text-white font-bold tracking-wide">Fares 15% lower now</p>
                 </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {bookingStatus ? (
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="flex-1 flex flex-col h-full"
              >
                 {/* Map View for active/searching ride */}
                 <div className="flex-1 min-h-[350px] w-full rounded-[36px] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative mb-6">
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none z-10 mix-blend-overlay"></div>
                   <Map 
                     defaultCenter={pickupCoords || riderLocation || {lat: 25.7796, lng: 84.7499}}
                     center={riderLocation || pickupCoords || {lat: 25.7796, lng: 84.7499}}
                     defaultZoom={15}
                     internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                     disableDefaultUI={true}
                     gestureHandling="greedy"
                   >
                     {pickupCoords && dropCoords && (
                       <RouteDisplay origin={pickupCoords} destination={dropCoords} />
                     )}
                     {pickupCoords && (
                       <Marker position={pickupCoords} icon={pickupIcon} />
                     )}
                     {dropCoords && (
                       <Marker position={dropCoords} icon={dropIcon} />
                     )}
                     {riderLocation && bookingStatus.status === 'accepted' && (
                       <Marker position={riderLocation} icon={bikeIcon} />
                     )}
                   </Map>
                   <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent pointer-events-none z-20" />
                 </div>

                 <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="bg-[#121212]/90 backdrop-blur-2xl border border-white/10 rounded-[36px] p-8 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] text-center relative mt-auto z-30"
                 >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#0A0A0A] border border-white/10 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                      <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/5 shadow-inner">
                          {bookingStatus.status === 'searching' 
                             ? <Search className="w-8 h-8 text-[#FFD000] animate-ping" />
                             : <Bike className="w-8 h-8 text-[#00DF89]" />
                          }
                      </div>
                    </div>
                    <div className="pt-10">
                      <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
                         {bookingStatus.status === 'searching' && 'Locating Captain...'}
                         {bookingStatus.status === 'accepted' && 'Captain Arriving!'}
                         {bookingStatus.status === 'completed' && 'Ride Completed!'}
                      </h2>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-6 border border-white/5 inline-block px-3 py-1 bg-white/5 rounded-full">Secure Transport</p>
                      
                      <div className="bg-[#1A1A1A] rounded-[24px] p-6 mt-4 border border-white/5 shadow-inner flex flex-col gap-4">
                         <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-black flex items-center gap-2"><Sparkles className="w-3 h-3 text-[#FFD000]" /> OTP PIN</span>
                            <span className="text-4xl font-mono tracking-widest text-[#FFD000] font-black drop-shadow-[0_0_10px_rgba(255,208,0,0.4)]">{bookingStatus.rideOtp}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Total Fare</span>
                            <span className="text-2xl font-black text-white">₹{bookingStatus.fare || 'TBD'}</span>
                         </div>
                      </div>
                   </div>

                   <button onClick={() => {
                       if (activeBookingId) {
                          updateDoc(doc(db, 'bookings', activeBookingId), { status: 'cancelled' });
                       }
                       setBookingStatus(null);
                       setActiveBookingId(null);
                   }} className="w-full mt-6 py-5 bg-red-500/10 text-red-500 font-black text-[11px] uppercase tracking-widest rounded-[20px] hover:bg-red-500/20 active:scale-95 transition-all shadow-inner border border-red-500/20">Cancel Dispatch</button>
                 </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="duration-500"
              >
                
                {/* Category selector */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <button className="bg-[#121212] border border-white/5 p-5 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-[#FFD000]/30 transition-all group shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(255,208,0,0.1)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFD000]/5 rounded-full blur-[30px] group-hover:bg-[#FFD000]/10 transition-all"></div>
                      <div className="w-14 h-14 bg-[#1A1A1A] rounded-[20px] shadow-inner flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-300 border border-white/5">
                         <Bike className="text-[#FFD000] w-7 h-7 drop-shadow-md" />
                      </div>
                      <span className="text-white font-black text-sm tracking-wide">Bike Ride</span>
                   </button>
                   <button onClick={() => navigate('/parcel')} className="bg-[#121212] border border-white/5 p-5 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-blue-500/30 transition-all group shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.1)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-[30px] group-hover:bg-blue-500/10 transition-all"></div>
                      <div className="w-14 h-14 bg-[#1A1A1A] rounded-[20px] shadow-inner flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-300 border border-white/5">
                         <PackageOpen className="text-blue-400 w-7 h-7 drop-shadow-md" />
                      </div>
                      <span className="text-white font-black text-sm tracking-wide">Send Parcel</span>
                   </button>
                </div>

                {/* Booking Form */}
                <div className="bg-[#121212] border border-white/5 rounded-[36px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
                  
                  <div className="flex gap-2 mb-8 p-1.5 bg-[#0A0A0A] rounded-[24px] border border-white/5 shadow-inner relative z-10">
                    <button 
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] text-xs uppercase tracking-widest font-black transition-all duration-300 ${mode === 'fixed' ? 'bg-[#FFD000] text-black shadow-[0_5px_15px_rgba(255,208,0,0.3)] scale-[1.02]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                      onClick={() => setMode('fixed')}
                    >
                      Routes
                    </button>
                    <button 
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] text-xs uppercase tracking-widest font-black transition-all duration-300 ${mode === 'custom' ? 'bg-[#FFD000] text-black shadow-[0_5px_15px_rgba(255,208,0,0.3)] scale-[1.02]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                      onClick={() => setMode('custom')}
                    >
                      <Search className="w-4 h-4" /> Custom Map
                    </button>
                  </div>

                  {mode === 'fixed' ? (
                    <form onSubmit={handleBookFixed} className="space-y-6 relative z-10">
                      <div className="relative group">
                        <select 
                          required
                          value={selectedRouteId}
                          onChange={(e) => setSelectedRouteId(e.target.value)}
                          className="block w-full px-5 py-5 border border-white/5 bg-[#1A1A1A] hover:bg-[#1f1f1f] focus:bg-[#1f1f1f] text-white rounded-[24px] text-sm font-bold tracking-wide outline-none appearance-none transition-all shadow-inner focus:ring-2 focus:ring-[#FFD000]/30"
                          style={{ colorScheme: 'dark' }}
                        >
                          <option value="" className="bg-[#1A1A1A]">-- Select Destination --</option>
                          {DEMO_ROUTES.map(r => (
                            <option key={r.routeId} value={r.routeId} className="bg-[#1A1A1A] text-white font-medium my-2">
                              {r.pickupName} → {r.dropName}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {selectedRoute && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="bg-gradient-to-br from-[#FFD000]/10 to-[#121212] p-6 rounded-[24px] border border-[#FFD000]/30 flex justify-between items-center shadow-[0_10px_30px_rgba(255,208,0,0.1)] group relative overflow-hidden"
                        >
                           <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD000]/10 blur-[40px] rounded-full"></div>
                           <div className="relative z-10">
                             <p className="text-[10px] font-black text-[#FFD000] uppercase tracking-widest mb-1 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Guaranteed Fare</p>
                             <p className="text-4xl font-black text-white tracking-tighter drop-shadow-md">₹{selectedRoute.fare}</p>
                           </div>
                           <div className="relative z-10 w-14 h-14 bg-gradient-to-tr from-[#FFD000] to-[#F5B700] p-[1px] rounded-full shadow-[0_0_20px_rgba(255,208,0,0.3)] group-hover:scale-110 transition-transform">
                              <div className="w-full h-full bg-[#121212] rounded-full flex items-center justify-center shadow-inner">
                                <span className="text-xl">💰</span>
                              </div>
                           </div>
                        </motion.div>
                      )}
                      
                      <div className="flex gap-4 mt-8">
                         <button
                           type="submit"
                           disabled={!selectedRouteId}
                           className="flex-[2] group relative overflow-hidden py-5 bg-gradient-to-r from-[#FFD000] to-[#F5B700] text-black font-black text-[11px] uppercase tracking-widest rounded-[20px] shadow-[0_15px_30px_rgba(255,208,0,0.3)] hover:shadow-[0_20px_40px_rgba(255,208,0,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                         >
                           <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1.5s] ease-in-out skew-x-12" />
                           Initialize Ride
                         </button>
                         <button
                           type="button"
                           onClick={handleScheduleClick}
                           disabled={!selectedRouteId || isScheduling}
                           className="flex-[1] group relative overflow-hidden py-5 bg-[#0A0A0A] text-white border border-white/10 font-black text-[11px] uppercase tracking-widest rounded-[20px] shadow-inner hover:bg-[#1A1A1A] hover:border-[#FFD000]/50 hover:text-[#FFD000] hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                         >
                           {isScheduling ? '...' : <Calendar className="w-5 h-5"/>}
                         </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleBookCustom} className="space-y-6 relative z-10">
                      <div className="h-56 w-full rounded-[24px] overflow-hidden border border-white/10 relative shadow-[0_10px_30px_rgba(0,0,0,0.5)] group cursor-pointer group-hover:border-[#FFD000]/30 transition-colors">
                         <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent mix-blend-overlay opacity-50 z-20 pointer-events-none"></div>
                         <Map 
                           defaultCenter={{lat: 25.7796, lng: 84.7499}}
                           defaultZoom={12}
                           internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                           onClick={handleMapClick}
                           disableDefaultUI={true}
                           gestureHandling="greedy"
                         >
                           {pickupCoords && dropCoords && (
                             <RouteDisplay origin={pickupCoords} destination={dropCoords} />
                           )}
                           {pickupCoords && (
                             <Marker position={pickupCoords} icon={pickupIcon} />
                           )}
                           {dropCoords && (
                             <Marker position={dropCoords} icon={dropIcon} />
                           )}
                         </Map>
                         <div className="absolute top-4 left-4 right-4 bg-[#0A0A0A]/90 backdrop-blur-xl px-4 py-3 rounded-2xl border border-[#FFD000]/20 text-center font-black text-[10px] uppercase tracking-widest pointer-events-none text-[#FFD000] shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                            {selectionMode === 'pickup' ? '📍 Tap map to set Pickup' : '📍 Tap map to set Drop'}
                         </div>
                      </div>
   
                      <div className="space-y-4 relative">
                        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-white/20 to-[#FFD000]/50 border-dashed z-0"></div>
                        <div className="relative group z-10">
                           <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#121212] border border-white/20 rounded-full flex items-center justify-center shadow-inner group-focus-within:border-white/50 transition-colors">
                              <div className="w-2 h-2 rounded-full bg-white/50 group-focus-within:bg-white"></div>
                           </div>
                           <input 
                             type="text" required
                             value={customPickup} onChange={e => setCustomPickup(e.target.value)}
                             onFocus={() => setSelectionMode('pickup')}
                             placeholder="Select Pickup Coordinates"
                             className="block w-full pl-16 pr-4 py-5 border border-white/5 bg-[#1A1A1A] hover:bg-[#1f1f1f] focus:bg-[#1f1f1f] text-white rounded-[24px] text-sm font-bold tracking-wide outline-none transition-all placeholder:text-white/30 focus:ring-2 focus:ring-white/10 shadow-inner"
                           />
                        </div>
                        <div className="relative group z-10">
                           <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#121212] border border-[#FFD000]/30 rounded-full flex items-center justify-center shadow-inner group-focus-within:border-[#FFD000] transition-colors">
                              <div className="w-2 h-2 rounded-full bg-[#FFD000]"></div>
                           </div>
                           <input 
                             type="text" required
                             value={customDrop} onChange={e => setCustomDrop(e.target.value)}
                             onFocus={() => setSelectionMode('drop')}
                             placeholder="Select Drop Coordinates"
                             className="block w-full pl-16 pr-4 py-5 border border-white/5 bg-[#1A1A1A] hover:bg-[#1f1f1f] focus:bg-[#1f1f1f] text-white rounded-[24px] text-sm font-bold tracking-wide outline-none transition-all placeholder:text-white/30 focus:ring-2 focus:ring-[#FFD000]/20 shadow-inner"
                           />
                        </div>
                      </div>
                      
                      <div className="flex gap-4 mt-8">
                         <button
                           type="submit"
                           disabled={!customPickup || !customDrop}
                           className="flex-[2] group relative overflow-hidden py-5 bg-gradient-to-r from-[#FFD000] to-[#F5B700] text-black font-black text-[11px] uppercase tracking-widest rounded-[20px] shadow-[0_15px_30px_rgba(255,208,0,0.3)] hover:shadow-[0_20px_40px_rgba(255,208,0,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                         >
                           <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1.5s] ease-in-out skew-x-12" />
                           Initialize Ride
                         </button>
                         <button
                           type="button"
                           onClick={handleScheduleClick}
                           disabled={!customPickup || !customDrop || isScheduling}
                           className="flex-[1] group relative overflow-hidden py-5 bg-[#0A0A0A] text-white border border-white/10 font-black text-[11px] uppercase tracking-widest rounded-[20px] shadow-inner hover:bg-[#1A1A1A] hover:border-[#FFD000]/50 hover:text-[#FFD000] hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                         >
                           <Calendar className="w-5 h-5"/>
                         </button>
                      </div>
                    </form>
                  )}
                </div>
                
                {/* Voice Booking Mock */}
                <motion.div 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="mt-8 p-5 rounded-[28px] bg-[#121212]/80 border border-white/5 flex items-center gap-5 hover:border-blue-500/30 transition-all backdrop-blur-md cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.2)] relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 mix-blend-screen pointer-events-none"></div>
                   <div className="w-14 h-14 bg-[#1A1A1A] border border-blue-500/30 rounded-[20px] flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-blue-400 group-hover:bg-blue-500/10 transition-all">
                      <Mic className="w-6 h-6 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                   </div>
                   <div className="relative z-10">
                      <h4 className="text-white font-black tracking-wide mb-1 flex items-center gap-2 text-sm">Voice Interface <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-ping"></span></h4>
                      <p className="text-blue-200/40 text-xs italic tracking-wide font-medium">"Bhaiya Station chalna hai..."</p>
                   </div>
                </motion.div>
   
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <BottomNav />
      </div>

      {/* Rating Modal Overlap */}
      {showRating && (
         <div className="fixed inset-0 bg-[#0A0A0A]/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-[#121212] rounded-[48px] p-10 max-w-sm w-full shadow-[0_40px_80px_rgba(0,0,0,1)] border border-white/5 transform scale-100 transition-transform relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-[#FFD000]/20 via-[#FFD000] to-[#FFD000]/20" />
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-[#FFD000]/10 rounded-full blur-[50px] pointer-events-none"></div>
 
              <div className="w-20 h-20 bg-[#1A1A1A] rounded-full border border-[#FFD000]/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,208,0,0.1)]">
                 <Star className="w-10 h-10 text-[#FFD000] fill-[#FFD000]" />
              </div>

              <h3 className="text-3xl font-black text-white text-center mb-1 tracking-tight">Trip Evaluation</h3>
              <p className="text-center text-white/40 text-[10px] font-black uppercase tracking-widest mb-8">Rate your Captain</p>
              
              <div className="flex justify-center gap-2 mb-10">
                 {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setRatingVal(s)} className="hover:scale-125 hover:-translate-y-2 transition-all duration-300 p-2">
                       <Star className={`w-10 h-10 transition-colors ${ratingVal >= s ? 'text-[#FFD000] fill-[#FFD000] drop-shadow-[0_0_15px_rgba(255,208,0,0.5)]' : 'text-white/5'}`} />
                    </button>
                 ))}
              </div>
              
              <textarea 
                placeholder="Share your experience intel..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/5 text-white placeholder:text-white/20 rounded-[24px] p-5 min-h-[120px] mb-8 focus:ring-2 focus:ring-[#FFD000]/30 transition-all resize-none shadow-inner text-sm tracking-wide outline-none"
              />
              <button onClick={submitRating} className="w-full py-5 bg-gradient-to-r from-[#FFD000] to-[#F5B700] text-black font-black text-sm uppercase tracking-widest rounded-[20px] shadow-[0_15px_40px_rgba(255,208,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
                 Confirm Rating
              </button>
           </div>
         </div>
      )}

      {/* Custom Native Date/Time Schedule Picker Overlay */}
      {showScheduleModal && (
         <div className="fixed inset-0 bg-[#0A0A0A]/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#121212] rounded-[42px] border border-[#FFD000]/25 p-8 max-w-sm w-full text-center shadow-[0_30px_80px_rgba(255,208,0,0.15)] relative overflow-hidden flex flex-col">
               <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#FFD000] via-[#F5B700] to-[#FFD000]"></div>
               <button 
                 type="button" onClick={() => setShowScheduleModal(false)}
                 className="absolute top-6 right-6 text-white/40 hover:text-white w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center shadow-inner hover:bg-white/5 transition-colors"
               >
                  <X className="w-5 h-5" />
               </button>
               
               <h3 className="text-3xl font-black text-white mb-2 mt-4 tracking-tight">Schedule Dispatch</h3>
               <p className="text-[#FFD000] text-[9px] font-black uppercase tracking-widest mb-8">AI Timing Synchronization</p>
 
               <form onSubmit={handleNativeSchedule} className="space-y-6 text-left">
                  <div className="bg-[#1A1A1A] p-5 rounded-[28px] border border-white/5 shadow-inner">
                     <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-3 text-center">Service Type</label>
                     <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#0A0A0A] rounded-[20px] border border-white/5">
                        <button 
                          type="button" onClick={() => setScheduleServiceType('bike')}
                          className={`py-3 px-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${scheduleServiceType === 'bike' ? 'bg-[#FFD000] text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
                        >
                           🏍️ RIDE
                        </button>
                        <button 
                          type="button" onClick={() => setScheduleServiceType('parcel')}
                          className={`py-3 px-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${scheduleServiceType === 'parcel' ? 'bg-[#FFD000] text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
                        >
                           📦 PARCEL
                        </button>
                     </div>
                  </div>
 
                  <div className="flex gap-4">
                    <div className="flex-1">
                       <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-2 px-2">Date</label>
                       <input 
                         type="date"
                         required
                         min={new Date().toISOString().split("T")[0]}
                         value={scheduleDate}
                         onChange={e => setScheduleDate(e.target.value)}
                         className="block w-full px-5 py-4 bg-[#1A1A1A] border border-white/5 rounded-[20px] text-xs font-mono font-bold outline-none text-white focus:border-[#FFD000]/50 focus:ring-1 focus:ring-[#FFD000]/50 shadow-inner transition-all hover:bg-[#1f1f1f]"
                         style={{ colorScheme: 'dark' }}
                       />
                    </div>
   
                    <div className="flex-1">
                       <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-2 px-2">Time</label>
                       <input 
                         type="time"
                         required
                         value={scheduleTime}
                         onChange={e => setScheduleTime(e.target.value)}
                         className="block w-full px-5 py-4 bg-[#1A1A1A] border border-white/5 rounded-[20px] text-xs font-mono font-bold outline-none text-white focus:border-[#FFD000]/50 focus:ring-1 focus:ring-[#FFD000]/50 shadow-inner transition-all hover:bg-[#1f1f1f]"
                         style={{ colorScheme: 'dark' }}
                       />
                    </div>
                  </div>
 
                  <div className="pt-6">
                     <button 
                       type="submit"
                       disabled={isScheduling}
                       className="w-full py-5 bg-gradient-to-r from-[#FFD000] to-[#F5B700] text-black font-black text-[11px] uppercase tracking-widest rounded-[20px] transition-all shadow-[0_15px_30px_rgba(255,208,0,0.2)] hover:shadow-[0_20px_40px_rgba(255,208,0,0.4)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group overflow-hidden relative"
                     >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-12" />
                        <Calendar className="w-4 h-4" /> Finalize Schedule
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}

