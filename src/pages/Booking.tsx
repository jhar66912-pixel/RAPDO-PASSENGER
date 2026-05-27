import React, { useState, useEffect } from 'react';
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
  const { currentUser, loading: authLoading, getAccessToken } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleServiceType, setScheduleServiceType] = useState<'bike' | 'parcel'>('bike');

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
     if (!geocodingLib || !e.detail.latLng) return;
     const latLng = e.detail.latLng;
     
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
         if (selectionMode === 'pickup') { setPickupCoords(latLng); setCustomPickup(addr); setSelectionMode('drop'); }
         else { setDropCoords(latLng); setCustomDrop(addr); }
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
       alert("RAHI service abhi sirf 30km locality tak available hai.");
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
        alert("Bhaiya, pehle destination route select kijiye!");
        return;
      }
    } else {
      if (!customPickup || !customDrop) {
        alert("Bhaiya, pehle pickup aur drop coordinates click karke add kijiye!");
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
      alert("Kripa karke valid date aur time chunien!");
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
          alert("Coordinates entry incomplete!");
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

      alert(`🎉 Waah bhaiya! Aapka ${scheduleServiceType === 'bike' ? 'Ride' : 'Parcel Delivery'} safaltapoorvak schedule ho gaya hai!\n\n📅 Date: ${scheduleDate}\n⏰ Time: ${scheduleTime}\n💵 Est Fare: ₹${estFare}\n\nAap details 'Activity' tab me check kar sakte hain.`);
      setShowScheduleModal(false);
    } catch (err) {
      console.error(err);
      alert("Error writing schedule to Firestore");
    } finally {
      setIsScheduling(false);
    }
  };

  const submitRating = () => {
     alert(`Rating submitted! Stars: ${ratingVal}, Comment: ${comment}`);
     setShowRating(false);
     setBookingStatus(null);
     setActiveBookingId(null);
  };

  const showSkeleton = authLoading || isInitializing;

  if (showSkeleton) {
    return (
      <div className="flex-1 bg-[#0A0A0A] min-h-screen pt-4 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite linear;
          }
        `}</style>
        <div className="max-w-md mx-auto min-h-[85vh] bg-[#121212] rounded-[48px] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden relative flex flex-col mt-4">
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
    <div className="flex-1 bg-[#0A0A0A] min-h-screen pt-4 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Mobile Frame Simulation for Web */}
      <div className="max-w-md mx-auto min-h-[85vh] bg-[#121212] rounded-[48px] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden relative flex flex-col mt-4">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FFD000]/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay"></div>

        <div className="p-8 relative z-10 flex-1 overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">Kahan jana hai?</p>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1">Hello, {currentUser?.name?.split(' ')[0] || 'Dost'}</h1>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-[#FFD000] to-[#F5B700] p-[2px] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,208,0,0.3)]">
               <div className="bg-[#121212] w-full h-full rounded-full flex items-center justify-center border-2 border-[#121212]">
                  <span className="text-2xl">🧑🏽</span>
               </div>
            </div>
          </div>

          {/* AI Suggestion Pill */}
          {!bookingStatus && (
            <div className="bg-[#1A1A1A] border border-[#FFD000]/20 hover:bg-white/[0.04] rounded-3xl p-5 flex items-center gap-5 mb-8 shadow-lg relative overflow-hidden transition-all duration-300 group cursor-pointer">
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#FFD000]/10 rounded-full blur-xl group-hover:bg-[#FFD000]/20 transition-all"></div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFD000]/20 to-transparent rounded-[18px] flex items-center justify-center shrink-0 border border-[#FFD000]/30 group-hover:scale-110 transition-transform">
                 <Sparkles className="text-[#FFD000] w-6 h-6" />
              </div>
              <div className="relative z-10">
                 <p className="text-[10px] text-[#FFD000] uppercase tracking-widest font-black mb-1">AI Recommended</p>
                 <p className="text-sm text-white font-bold tracking-wide">Office ride available in 2 mins</p>
              </div>
            </div>
          )}

          {bookingStatus ? (
            <div className="animate-in fade-in slide-in-from-bottom flex-1 flex flex-col h-full">
               {/* Map View for active/searching ride */}
               <div className="flex-1 min-h-[350px] w-full rounded-[36px] overflow-hidden border border-white/5 shadow-2xl relative mb-6">
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
                 <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#121212] to-transparent pointer-events-none" />
               </div>

               <div className="bg-[#1A1A1A] border border-white/5 rounded-[36px] p-8 shadow-2xl text-center relative mt-auto">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#121212] border border-white/10 rounded-full flex items-center justify-center shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/5">
                        <Search className={`w-8 h-8 text-[#FFD000] ${bookingStatus.status === 'searching' ? 'animate-pulse' : ''}`} />
                    </div>
                  </div>
                  <div className="pt-10">
                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                       {bookingStatus.status === 'searching' && 'Finding your Captain...'}
                       {bookingStatus.status === 'accepted' && 'Captain is arriving!'}
                       {bookingStatus.status === 'completed' && 'Ride Completed!'}
                    </h2>
                    
                    <div className="bg-[#121212] rounded-[24px] p-6 mt-8 border border-white/5 shadow-inner">
                       <div className="flex justify-between items-center pb-4 border-b border-white/5">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Ride PIN</span>
                          <span className="text-3xl font-mono tracking-widest text-[#FFD000] font-black">{bookingStatus.rideOtp}</span>
                       </div>
                       <div className="flex justify-between items-center pt-4">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Fare Est.</span>
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
                 }} className="w-full mt-8 py-5 bg-red-500/10 text-red-500 font-black text-sm uppercase tracking-widest rounded-[20px] hover:bg-red-500/20 active:scale-95 transition-all">Cancel Dispatch</button>
               </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              
              {/* Category selector */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <button className="bg-[#1A1A1A] border border-white/5 p-5 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-[#FFD000]/30 transition-all group group-hover:-translate-y-1 shadow-lg">
                    <div className="w-14 h-14 bg-[#FFD000]/10 rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                       <Bike className="text-[#FFD000] w-7 h-7" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide">Bike Ride</span>
                 </button>
                 <button className="bg-[#1A1A1A] border border-white/5 p-5 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-blue-500/30 transition-all group group-hover:-translate-y-1 shadow-lg">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                       <PackageOpen className="text-blue-400 w-7 h-7" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide">Send Parcel</span>
                 </button>
              </div>

              {/* Booking Form */}
              <div className="bg-[#1A1A1A] border border-white/5 rounded-[36px] p-8 shadow-2xl">
                <div className="flex gap-2 mb-8 p-1.5 bg-[#121212] rounded-[24px] border border-white/5 shadow-inner">
                  <button 
                    className={`flex-1 py-3.5 rounded-[20px] text-xs uppercase tracking-widest font-black transition-all duration-300 ${mode === 'fixed' ? 'bg-[#FFD000] text-black shadow-lg scale-[1.02]' : 'text-white/40 hover:text-white'}`}
                    onClick={() => setMode('fixed')}
                  >
                    Routes
                  </button>
                  <button 
                    className={`flex-1 py-3.5 rounded-[20px] text-xs uppercase tracking-widest font-black transition-all duration-300 ${mode === 'custom' ? 'bg-[#FFD000] text-black shadow-lg scale-[1.02]' : 'text-white/40 hover:text-white'}`}
                    onClick={() => setMode('custom')}
                  >
                    Custom Map
                  </button>
                </div>

                {mode === 'fixed' ? (
                  <form onSubmit={handleBookFixed} className="space-y-6">
                    <div className="relative">
                      <select 
                        required
                        value={selectedRouteId}
                        onChange={(e) => setSelectedRouteId(e.target.value)}
                        className="block w-full px-5 py-5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.06] text-white rounded-[24px] text-sm font-medium tracking-wide outline-none appearance-none transition-colors"
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
                      <div className="bg-[#FFD000]/10 p-6 rounded-[24px] border border-[#FFD000]/20 flex justify-between items-center animate-in fade-in zoom-in-95 duration-300 group">
                         <div>
                           <p className="text-[10px] font-black text-[#FFD000] uppercase tracking-widest mb-1">Guaranteed Fare</p>
                           <p className="text-4xl font-black text-white tracking-tighter">₹{selectedRoute.fare}</p>
                         </div>
                         <div className="w-14 h-14 bg-[#FFD000]/20 rounded-full flex items-center justify-center shrink-0 border border-[#FFD000]/30 shadow-[0_0_15px_rgba(255,208,0,0.2)] group-hover:scale-110 transition-transform">
                            <span className="text-2xl drop-shadow-md">💰</span>
                         </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3 mt-8">
                       <button
                         type="submit"
                         disabled={!selectedRouteId}
                         className="flex-1 group relative overflow-hidden py-5 bg-gradient-to-br from-[#FFD000] to-[#F5B700] text-black font-black text-[11px] uppercase tracking-widest rounded-[20px] shadow-[0_10px_30px_rgba(255,208,0,0.3)] hover:shadow-[0_10px_40px_rgba(255,208,0,0.5)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                       >
                         <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                         Initialize Ride
                       </button>
                       <button
                         type="button"
                         onClick={handleScheduleClick}
                         disabled={!selectedRouteId || isScheduling}
                         className="flex-1 group relative overflow-hidden py-5 bg-[#1A1A1A] text-white border border-[#FFD000]/30 font-black text-[11px] uppercase tracking-widest rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-[#FFD000]/10 hover:border-[#FFD000]/60 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                       >
                         {isScheduling ? 'Scheduling...' : <><Calendar className="w-4 h-4 text-[#FFD000]"/> Schedule</>}
                       </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleBookCustom} className="space-y-6">
                    <div className="h-48 w-full rounded-[24px] overflow-hidden border border-white/5 relative shadow-lg group cursor-pointer">
                       <div className="absolute inset-0 bg-white/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"></div>
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
                       <div className="absolute top-4 left-4 right-4 bg-[#121212]/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center font-bold text-[10px] uppercase tracking-widest pointer-events-none text-white shadow-lg">
                          {selectionMode === 'pickup' ? '📍 Tap map to set Pickup' : '📍 Tap map to set Drop'}
                       </div>
                    </div>
 
                    <div className="space-y-4">
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                         </div>
                         <input 
                           type="text" required
                           value={customPickup} onChange={e => setCustomPickup(e.target.value)}
                           onFocus={() => setSelectionMode('pickup')}
                           placeholder="Select Pickup Coordinates"
                           className="block w-full pl-16 pr-4 py-5 border-none bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.06] text-white rounded-[24px] text-sm font-medium tracking-wide outline-none transition-all placeholder:text-white/30"
                         />
                      </div>
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#FFD000]/10 rounded-full flex items-center justify-center">
                            <Navigation className="w-5 h-5 text-[#FFD000] group-focus-within:scale-110 transition-transform" />
                         </div>
                         <input 
                           type="text" required
                           value={customDrop} onChange={e => setCustomDrop(e.target.value)}
                           onFocus={() => setSelectionMode('drop')}
                           placeholder="Select Drop Coordinates"
                           className="block w-full pl-16 pr-4 py-5 border-none bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.06] text-white rounded-[24px] text-sm font-medium tracking-wide outline-none transition-all placeholder:text-white/30"
                         />
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-8">
                       <button
                         type="submit"
                         disabled={!customPickup || !customDrop}
                         className="flex-[2] group relative overflow-hidden py-5 bg-gradient-to-br from-[#FFD000] to-[#F5B700] text-black font-black text-xs uppercase tracking-widest rounded-[20px] shadow-[0_10px_30px_rgba(255,208,0,0.3)] hover:shadow-[0_10px_40px_rgba(255,208,0,0.5)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                       >
                         <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                         Initialize Ride
                       </button>
                       <button
                         type="button"
                         onClick={handleScheduleClick}
                         disabled={!customPickup || !customDrop || isScheduling}
                         className="flex-1 group relative overflow-hidden py-5 bg-[#1A1A1A] text-white border border-[#FFD000]/30 font-black text-[11px] uppercase tracking-widest rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-[#FFD000]/10 hover:border-[#FFD000]/60 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                       >
                         <Calendar className="w-4 h-4 text-[#FFD000]"/>
                       </button>
                    </div>
                  </form>
                )}
              </div>
              
              {/* Voice Booking Mock */}
              <div className="mt-8 p-5 rounded-[28px] bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 flex items-center gap-5 hover:bg-white/5 transition-colors backdrop-blur-md cursor-pointer group shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                 <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[20px] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <Mic className="w-6 h-6 text-white" />
                 </div>
                 <div>
                    <h4 className="text-white font-black tracking-wide mb-1 flex items-center gap-2">Voice AI <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span></h4>
                    <p className="text-blue-200/50 text-xs italic tracking-wide">"Bhaiya Station chalna hai..."</p>
                 </div>
              </div>
 
            </div>
          )}
        </div>
        <BottomNav />
      </div>
      
      {/* Rating Modal Overlap */}
      {showRating && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-[#121212] rounded-[48px] p-10 max-w-sm w-full shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5 transform scale-100 transition-transform relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-[#FFD000]/20 via-[#FFD000] to-[#FFD000]/20" />
              <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-[#FFD000]/10 rounded-full blur-[40px]"></div>
 
              <h3 className="text-3xl font-black text-white text-center mb-2 tracking-tight">Trip Evaluation</h3>
              <p className="text-center text-white/40 text-[10px] font-bold uppercase tracking-widest mb-10">Rate Captain</p>
              
              <div className="flex justify-center gap-3 mb-10">
                 {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setRatingVal(s)} className="hover:scale-125 transition-transform duration-300">
                       <Star className={`w-12 h-12 ${ratingVal >= s ? 'text-[#FFD000] fill-[#FFD000] drop-shadow-[0_0_15px_rgba(255,208,0,0.5)]' : 'text-white/5'}`} />
                    </button>
                 ))}
              </div>
              
              <textarea 
                placeholder="Share your experience intel..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/5 text-white placeholder:text-white/20 rounded-[24px] p-5 min-h-[120px] mb-8 focus:ring-2 focus:ring-[#FFD000] transition-all resize-none shadow-inner text-sm tracking-wide"
              />
              <button onClick={submitRating} className="w-full py-5 bg-gradient-to-br from-[#FFD000] to-[#F5B700] text-black font-black text-sm uppercase tracking-widest rounded-[20px] shadow-[0_10px_30px_rgba(255,208,0,0.3)] hover:scale-[1.02] active:scale-95 transition-transform">
                 Submit Review
              </button>
           </div>
         </div>
      )}

      {/* Custom Native Date/Time Schedule Picker Overlay */}
      {showScheduleModal && (
         <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#121212] rounded-[42px] border border-[#FFD000]/25 p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(255,208,0,0.15)] relative overflow-hidden flex flex-col">
               <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#FFD000] via-[#F5B700] to-[#FFD000]"></div>
               <button 
                 type="button" onClick={() => setShowScheduleModal(false)}
                 className="absolute top-4 right-4 text-white/40 hover:text-white w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
               >
                  <X className="w-4 h-4" />
               </button>
               
               <h3 className="text-2xl font-black text-white mb-2 mt-4 tracking-tight">Schedule Dispatch</h3>
               <p className="text-[#FFD000] text-[9px] font-black uppercase tracking-widest mb-6">Select date and local Bihar timezone</p>
 
               <form onSubmit={handleNativeSchedule} className="space-y-5 text-left">
                  <div>
                     <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">Service Portfolio</label>
                     <div className="grid grid-cols-2 gap-2 p-1 bg-[#1A1A1A] rounded-xl border border-white/5">
                        <button 
                          type="button" onClick={() => setScheduleServiceType('bike')}
                          className={`py-2 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${scheduleServiceType === 'bike' ? 'bg-[#FFD000] text-black font-black' : 'text-white/40'}`}
                        >
                           🏍️ BIKE RIDE
                        </button>
                        <button 
                          type="button" onClick={() => setScheduleServiceType('parcel')}
                          className={`py-2 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${scheduleServiceType === 'parcel' ? 'bg-[#FFD000] text-black font-black' : 'text-white/40'}`}
                        >
                           📦 PARCEL RUN
                        </button>
                     </div>
                  </div>
 
                  <div>
                     <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-1.5 font-bold">Pick Date</label>
                     <input 
                       type="date"
                       required
                       min={new Date().toISOString().split("T")[0]}
                       value={scheduleDate}
                       onChange={e => setScheduleDate(e.target.value)}
                       className="block w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-xs font-mono font-bold outline-none text-white focus:border-[#FFD000]"
                       style={{ colorScheme: 'dark' }}
                     />
                  </div>
 
                  <div>
                     <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-1.5 font-bold">Pick Departure Time</label>
                     <input 
                       type="time"
                       required
                       value={scheduleTime}
                       onChange={e => setScheduleTime(e.target.value)}
                       className="block w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-xs font-mono font-bold outline-none text-white focus:border-[#FFD000]"
                       style={{ colorScheme: 'dark' }}
                     />
                  </div>
 
                  <div className="pt-4 flex gap-3">
                     <button 
                       type="button" 
                       onClick={() => setShowScheduleModal(false)}
                       className="flex-1 py-4 bg-[#1A1A1A] border border-white/10 rounded-xl text-white/60 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
                     >
                        Cancel
                     </button>
                     <button 
                       type="submit"
                       disabled={isScheduling}
                       className="flex-[2] py-4 bg-gradient-to-r from-[#FFD000] to-[#F5B700] text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_5px_15px_rgba(255,208,0,0.3)] hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1"
                     >
                        Confirm Booking
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}

