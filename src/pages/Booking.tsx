import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { DEMO_ROUTES, Booking } from '../types';
import { 
  MapPin, Search, Navigation, Star, PhoneCall, Sparkles, Bike, 
  PackageOpen, Mic, Calendar, X, LocateFixed, Target, Compass, 
  ShieldCheck, Activity, Heart, Clock, ArrowRight, ChevronRight, 
  Check, Volume2, Info, Landmark, HelpCircle, RefreshCw, History
} from 'lucide-react';
import { searchBiharLocations, BiharLocation } from '../lib/locationDb';
import { Map, Marker, useMapsLibrary, MapCameraHandler } from '../components/SmartMapView';
import { RouteDisplay } from '../components/MapFeatures';
import { collection, query, where, onSnapshot, setDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import BottomNav from '../components/BottomNav';

type VehicleCategory = 'bike' | 'auto' | 'mini' | 'parcel';

interface SavedPlace {
  label: string;
  address: string;
  lat: number;
  lng: number;
  icon: string;
}

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading: authLoading, getAccessToken } = useAuth();
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleServiceType, setScheduleServiceType] = useState<VehicleCategory>('bike');

  // New Futuristic Interactive States
  const [vehicle, setVehicle] = useState<VehicleCategory>('bike');
  const [activeTab, setActiveTabTab] = useState<'request' | 'history'>('request');
  const [searchFocused, setSearchFocused] = useState<'pickup' | 'drop' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [voiceQuery, setVoiceQuery] = useState('');
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [voicePlaybackMode, setVoicePlaybackMode] = useState(false);
  const [recentTranscripts, setRecentTranscripts] = useState<string[]>([
    "Patna Junction le chalo bhaiya",
    "Boring Road chauraha jana hai",
    "Samastipur railway station",
    "Mithila Art Village, Jitwarpur"
  ]);

  // Real-time server ping terminal entries for gamified premium experience
  const [matchingStep, setMatchingStep] = useState(0);
  const [matchingLogs, setMatchingLogs] = useState<string[]>([]);

  // Bihar Saved Places Database
  const SAVED_PLACES: SavedPlace[] = [
    { label: "Home (Patna)", address: "Patna Junction, Patna, Bihar", lat: 25.6024, lng: 85.1376, icon: "🏠" },
    { label: "Coaching Gate", address: "Boring Road, Patna, Bihar", lat: 25.6133, lng: 85.1111, icon: "📚" },
    { label: "Mithila Hub", address: "Samastipur Junction, Samastipur, Bihar", lat: 25.8624, lng: 85.7831, icon: "🎨" },
    { label: "Darbhanga Air", address: "Darbhanga Airport, Darbhanga, Bihar", lat: 26.1950, lng: 85.9180, icon: "✈️" }
  ];

  // Simulated Past Rides History
  const [pastRides, setPastRides] = useState([
    { id: 'R1', date: 'Yesterday', from: 'Kankarbagh Sports Club', to: 'Patna Junction', fare: 85, mode: 'Bike' },
    { id: 'R2', date: '2 days ago', from: 'Kashipur Chowk', to: 'Station Chowk Samastipur', fare: 20, mode: 'Bike' },
    { id: 'R3', date: 'May 24', from: 'Motijheel Market', to: 'Bairia Bus Stand', fare: 52, mode: 'Auto' }
  ]);

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
    }, 1000); // Premium brief loading pause
    return () => clearTimeout(timer);
  }, [authLoading]);

  // Extract navigation parameters passed from other components/overlays
  useEffect(() => {
    if (location.state) {
      if (location.state.mode) {
        setMode(location.state.mode);
      }
      if (location.state.pickup) {
        setCustomPickup(location.state.pickup);
      }
      if (location.state.drop) {
        setCustomDrop(location.state.drop);
      }
      if (location.state.pickupCoords) {
        setPickupCoords(location.state.pickupCoords);
      }
      if (location.state.dropCoords) {
        setDropCoords(location.state.dropCoords);
      }
      if (location.state.selectionMode) {
        setSelectionMode(location.state.selectionMode);
      }
    }
  }, [location]);

  const [mode, setMode] = useState<'custom' | 'fixed'>('custom');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  
  const [customPickup, setCustomPickup] = useState('Current Live Location');
  const [customDrop, setCustomDrop] = useState('');
  
  const [bookingStatus, setBookingStatus] = useState<Booking | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [comment, setComment] = useState('');

  const selectedRoute = DEMO_ROUTES.find(r => r.routeId === selectedRouteId);

  // Map selection state
  const geocodingLib = useMapsLibrary('geocoding');
  const [pickupCoords, setPickupCoords] = useState<google.maps.LatLngLiteral | null>({ lat: 25.5941, lng: 85.1376 }); // Patna as starting default
  const [dropCoords, setDropCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectionMode, setSelectionMode] = useState<'pickup' | 'drop'>('drop');
  const [riderLocation, setRiderLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  // Auto-resolve typed location coordinates from local search system if not explicitly selected
  useEffect(() => {
    if (!pickupCoords && customPickup.trim() && customPickup !== 'Current Live Location') {
      const matches = searchBiharLocations(customPickup);
      if (matches.length > 0) {
        setPickupCoords({ lat: matches[0].lat, lng: matches[0].lng });
      }
    }
  }, [customPickup, pickupCoords]);

  useEffect(() => {
    if (!dropCoords && customDrop.trim()) {
      const matches = searchBiharLocations(customDrop);
      if (matches.length > 0) {
        setDropCoords({ lat: matches[0].lat, lng: matches[0].lng });
      }
    }
  }, [customDrop, dropCoords]);

  // Listen for existing active bookings
  useEffect(() => {
    if (!currentUser) return;
    
    const q = query(collection(db, 'bookings'), where('customerId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => d.data() as Booking);
      const active = docs.find(d => ['searching', 'accepted'].includes(d.status));
      if (active) {
        setActiveBookingId(active.bookingId);
        setBookingStatus(active);
      } else {
        if (bookingStatus?.status === 'accepted' && docs.find(d => d.bookingId === bookingStatus.bookingId)?.status === 'completed') {
           setBookingStatus({...bookingStatus, status: 'completed'});
           setShowRating(true);
        }
      }
    }, (err) => {
      console.warn("Bookings real-time listener restricted or offline:", err);
    });
    
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Simulated live captain match console updates
  useEffect(() => {
    if (!bookingStatus || bookingStatus.status !== 'searching') {
      setMatchingStep(0);
      return;
    }

    const updates = [
      "📡 Connected to RAPDO Hyperlocal Server...",
      "🔗 Broadlink verified on Gola Road Superhub",
      "🚗 Auto-routing request dynamically via state grid",
      "⚡ Analyzing traffic density across bypass channels",
      "🔎 Scanning 12 nearest verified Bihar Captains...",
      "🤝 In negotiating handshake with Captain Rajesh",
      "🎉 Booking confirmed! Captain Rajesh is assigned."
    ];

    setMatchingLogs([updates[0]]);
    
    const interval = setInterval(() => {
      setMatchingStep(prev => {
        const next = prev + 1;
        if (next < updates.length) {
          setMatchingLogs(l => [...l, updates[next]]);
          return next;
        }
        clearInterval(interval);
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [bookingStatus?.status]);

  // Mock checking ride status updates (Simulate rider answering) 
  useEffect(() => {
    if (!activeBookingId || !bookingStatus) return;

    let timer: any;
    let locationTimer: any;

    if (bookingStatus.status === 'searching') {
       timer = setTimeout(() => {
           updateDoc(doc(db, 'bookings', activeBookingId), {
               status: 'accepted',
               assignedRiderId: 'RIDER1'
           });
       }, 14000); // 14 seconds match simulator
    } else if (bookingStatus.status === 'accepted') {
       if (!riderLocation && pickupCoords) {
           setRiderLocation({ lat: pickupCoords.lat - 0.005, lng: pickupCoords.lng - 0.005 });
       }
       locationTimer = setInterval(() => {
           setRiderLocation(prev => {
               if (!prev) return pickupCoords || {lat: 25.5941, lng: 85.1376};
               if (!pickupCoords) return { lat: prev.lat + 0.0003, lng: prev.lng + 0.0003 };
               
               const dLat = pickupCoords.lat - prev.lat;
               const dLng = pickupCoords.lng - prev.lng;
               if (Math.abs(dLat) < 0.0002 && Math.abs(dLng) < 0.0002) {
                   return prev;
               }
               return { lat: prev.lat + dLat * 0.15, lng: prev.lng + dLng * 0.15 };
           });
       }, 1500);

       timer = setTimeout(() => {
          updateDoc(doc(db, 'bookings', activeBookingId), {
             status: 'completed'
          });
       }, 30000); // Ride simulation completed
    }
    
    return () => {
       clearTimeout(timer);
       clearInterval(locationTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingStatus?.status, activeBookingId, pickupCoords]);

  // Marker SVGs - Highly styled glow aesthetics
  const pickupIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="rgba(255,193,7,0.15)" stroke="#FFC107" stroke-width="2"/><circle cx="20" cy="20" r="10" fill="#121212" stroke="#FFC107" stroke-width="2"/><circle cx="20" cy="20" r="4" fill="#FFC107"/></svg>`)}`;
  const dropIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="rgba(59,130,246,0.15)" stroke="#3B82F6" stroke-width="2"/><circle cx="20" cy="20" r="10" fill="#121212" stroke="#3B82F6" stroke-width="2"/><circle cx="20" cy="20" r="4" fill="#3B82F6"/></svg>`)}`;
  const bikeIconSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg width="50" height="50" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="22" fill="#121212" stroke="#FFC107" stroke-width="3"/><text x="24" y="32" font-size="24" text-anchor="middle">🏍️</text></svg>`)}`;

  // Auto-locate implementation with GPS sensor
  const triggerAutoLocate = () => {
    if (!navigator.geolocation) {
      showToast("GPS locator not supported by your browser.", "error");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(loc);
        setPickupCoords(loc);
        
        if (geocodingLib) {
          const geocoder = getSafeGeocoder(geocodingLib);
          geocoder.geocode({ location: loc }).then(res => {
            const addr = res.results[0]?.formatted_address || "My Live Location";
            setCustomPickup(addr);
          }).catch(err => {
            console.warn("Reverse geocoding lock location fail", err);
            setCustomPickup("My GPS Coordinates");
          });
        } else {
          setCustomPickup("My GPS Coordinates");
        }
        showToast("📍 Accurately locked live location!", "success");
        setIsLocating(false);
      },
      (error) => {
        console.warn("Location error", error);
        // Safe fallback in Patna
        const fallbackLoc = { lat: 25.5941, lng: 85.1376 };
        setCurrentLocation(fallbackLoc);
        setPickupCoords(fallbackLoc);
        setCustomPickup("Patna Junction Area, Patna");
        showToast("📍 Set to comfortable city fallback.", "info");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Draggable / Tap Map click handoff
  const handleMapClick = (e: any) => {
     if (!geocodingLib || !e) return;
     
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
     const geocoder = getSafeGeocoder(geocodingLib);
     
     geocoder.geocode({ location: latLng }).then(res => {
         const addr = res.results[0]?.formatted_address || `${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`;
         if (selectionMode === 'pickup') {
             setPickupCoords(latLng);
             setCustomPickup(addr);
             setSelectionMode('drop');
             showToast("Pickup confirmed! Now tap to select drop-off.", "success");
         } else {
             setDropCoords(latLng);
             setCustomDrop(addr);
         }
     }).catch(() => {
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

  // Dynamically calculate straight line distance with scaling multiplier
  const getCalculatedDistanceAndFare = () => {
    if (!pickupCoords || !dropCoords) return { dist: 0, fare: 0 };
    const R = 6371; // Earth radius in km
    const dLat = (dropCoords.lat - pickupCoords.lat) * (Math.PI / 180);
    const dLon = (dropCoords.lng - pickupCoords.lng) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pickupCoords.lat * (Math.PI / 180)) * Math.cos(dropCoords.lat * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    let distanceKm = R * c * 1.25; // accounts for winding Bihar roads

    distanceKm = Math.max(distanceKm, 0.4); // min distance limit

    // RAPDO Pricing Structure
    // Base Rates: Bike=20, Auto=30, Mini=40, Parcel=15
    // Per KM Rates: Bike=8, Auto=10, Mini=12, Parcel=7
    let base = 20;
    let multiplier = 8;
    if (vehicle === 'auto') { base = 30; multiplier = 10; }
    if (vehicle === 'mini') { base = 40; multiplier = 12; }
    if (vehicle === 'parcel') { base = 15; multiplier = 7; }

    let fare = base;
    if (distanceKm > 3) {
      fare += (distanceKm - 3) * multiplier;
    }
    
    return {
      dist: parseFloat(distanceKm.toFixed(1)),
      fare: Math.ceil(fare)
    };
  };

  const activeTripMetrics = getCalculatedDistanceAndFare();

  const handleBookFixed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteId || !selectedRoute) return;
    
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
    if (!customPickup || !customDrop || !pickupCoords || !dropCoords) {
      showToast("Kripa karke pickup aur drop dono set kijiye!", "error");
      return;
    }
    
    const { dist, fare } = activeTripMetrics;

    if (dist > 120) {
       showToast("RAPDO services are capped up to 120km within Bihar.", "error");
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
      distanceKm: dist,
      fare: fare,
      status: 'searching',
      rideOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: Date.now()
    };
    
    await setDoc(doc(db, 'bookings', newBooking.bookingId), newBooking);
    setActiveBookingId(newBooking.bookingId);
    showToast("🚀 Initiating high-speed dispatch search!", "success");
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
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
    setScheduleTime('10:00');
    setScheduleServiceType(vehicle);
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
        pickupStr = customPickup;
        dropStr = customDrop;
        estFare = activeTripMetrics.fare;
      }

      setIsScheduling(true);

      const scheduledBooking: Booking = {
        bookingId: 'SCH-' + Math.random().toString(36).substr(2, 9),
        customerId: currentUser?.uid || '',
        customerName: currentUser?.name || 'Guest',
        customerMobile: currentUser?.mobile || '',
        bookingType: mode,
        pickupName: pickupStr,
        dropName: dropStr,
        fare: estFare,
        status: 'scheduled' as any,
        rideOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        createdAt: Date.now(),
        scheduledTime: `${scheduleDate} @ ${scheduleTime}` as any
      };

      if (mode === 'fixed') {
        scheduledBooking.selectedRouteId = selectedRouteId;
      }

      await setDoc(doc(db, 'bookings', scheduledBooking.bookingId), scheduledBooking);
      
      const txnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
      await setDoc(doc(db, 'transactions', txnId), {
        transactionId: txnId,
        customerId: currentUser?.uid || '',
        title: `${scheduleServiceType.toUpperCase()} pre-arranged booking`,
        amount: `-₹${estFare}`,
        type: 'scheduled',
        date: `${scheduleDate}, ${scheduleTime}`,
        createdAt: Date.now()
      });

      showToast(`🎉 Rapdo ${scheduleServiceType.toUpperCase()} scheduled for ${scheduleDate} @ ${scheduleTime}!`, "success");
      setShowScheduleModal(false);
    } catch (err) {
      console.error(err);
      showToast("Error writing schedule to service grid", "error");
    } finally {
      setIsScheduling(false);
    }
  };

  // Microphone Voice Assistant simulation with Hindi/English/Hinglish search
  const handleSubmitVoiceQuery = () => {
    if (!voiceQuery.trim()) return;
    
    const inputStr = voiceQuery.trim();
    // Simulate vocal recognition logic checking Bihar location DB
    const results = searchBiharLocations(inputStr);
    
    if (results.length > 0) {
      const match = results[0];
      setCustomDrop(`${match.name}, ${match.city}, Bihar`);
      setDropCoords({ lat: match.lat, lng: match.lng });
      setMode('custom');
      showToast(`🎙️ Recognised destination: "${match.name}"!`, "success");
      setShowVoiceOverlay(false);
      setVoiceQuery('');
    } else {
      // Partial matching or typing drop-off directly
      setCustomDrop(inputStr);
      showToast(`🎙️ Searching coordinates for: "${inputStr}"`, "info");
      setShowVoiceOverlay(false);
      setVoiceQuery('');
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
      <div className="flex-1 bg-[#050505] min-h-screen font-sans">
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2.5s infinite linear;
          }
        `}</style>
        <div className="w-full max-w-md mx-auto min-h-screen bg-[#070707] shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative flex flex-col">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FFC107]/5 rounded-full blur-[90px] pointer-events-none" />
          
          <div className="p-6 relative z-10 flex-1 overflow-y-auto no-scrollbar flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-3">
                <div className="w-20 h-3 bg-white/5 rounded-full relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                </div>
                <div className="w-44 h-8 bg-white/5 rounded-xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                </div>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-full relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </div>
            </div>

            <div className="w-full h-20 bg-white/5 rounded-[24px] mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="h-24 bg-white/5 rounded-[24px] relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
               </div>
               <div className="h-24 bg-white/5 rounded-[24px] relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
               </div>
            </div>

            <div className="flex-1 bg-white/[0.03] rounded-[32px] p-6 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-30" />
            </div>
          </div>
          <BottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#050505] min-h-screen font-sans antialiased text-white">
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#070707] shadow-[0_45px_90px_rgba(0,0,0,0.9)] relative flex flex-col pb-24 overflow-x-hidden border-x border-white/5">
        
        {/* Futuristic Glassmorphic Toast */}
        <AnimatePresence>
          {toast.type && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 20, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-16 left-4 right-4 z-[999] p-4 rounded-2xl bg-[#0F0F0FF2] backdrop-blur-2xl border border-[#FFC107]/30 shadow-[0_15px_40px_rgba(255,193,7,0.15)] flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FFC107]/10 flex items-center justify-center text-[#FFC107] shrink-0 border border-[#FFC107]/20">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-black tracking-wide">{toast.message}</p>
              </div>
              <button onClick={() => setToast({ message: '', type: null })} className="text-white/40 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Floating Glass Background Gradients */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-[#FFC107]/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-[90px] pointer-events-none" />

        {/* Real-time Matching / Active Ride Screen */}
        <AnimatePresence mode="wait">
          {bookingStatus ? (
            <motion.div 
              key="active-booking"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="px-6 pt-6 flex-1 flex flex-col relative z-20"
            >
              {/* Active Trip Live Map Display */}
              <div className="w-full h-[280px] rounded-[32px] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative mb-5 group">
                <Map 
                  defaultCenter={pickupCoords || riderLocation || {lat: 25.5941, lng: 85.1376}}
                  center={riderLocation || pickupCoords || {lat: 25.5941, lng: 85.1376}}
                  defaultZoom={15}
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  disableDefaultUI={true}
                  gestureHandling="greedy"
                >
                  <MapCameraHandler center={riderLocation || pickupCoords || null} />
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
                    <Marker position={riderLocation} icon={bikeIconSvg} />
                  )}
                </Map>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Visual Radar Pulse Overlay during searching */}
                {bookingStatus.status === 'searching' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="absolute w-64 h-64 border border-[#FFC107]/30 rounded-full animate-ping opacity-45 delay-300" />
                    <div className="absolute w-44 h-44 border border-[#FFC107]/20 rounded-full animate-ping opacity-60" />
                    <div className="absolute w-20 h-20 bg-[#FFC107]/10 border border-[#FFC107]/50 rounded-full flex items-center justify-center">
                      <Compass className="w-8 h-8 text-[#FFC107] animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic matching information terminal */}
              <div className="bg-[#0F0F0FF2] backdrop-blur-3xl border border-white/10 rounded-[30px] p-6 shadow-2xl space-y-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-black text-[#FFC107] tracking-[0.2em] bg-[#FFC107]/10 px-3 py-1 rounded-full border border-[#FFC107]/20 flex items-center gap-1">
                        <Activity className="w-3 h-3 animate-pulse" /> Realtime Dispatch
                      </span>
                      <h2 className="text-xl font-black mt-2">
                        {bookingStatus.status === 'searching' && 'Request Broadcasted'}
                        {bookingStatus.status === 'accepted' && 'Captain is En Route'}
                        {bookingStatus.status === 'completed' && 'Welcome Destination'}
                      </h2>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FFC107]">
                      {bookingStatus.status === 'searching' ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </div>

                  {/* Booking Metadata Card */}
                  <div className="bg-[#151515] p-4 rounded-2xl border border-white/5 space-y-3 mt-4 shadow-inner">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40 font-bold">OTP Passcode</span>
                      <span className="font-mono text-[#FFC107] text-lg font-black tracking-widest">{bookingStatus.rideOtp}</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40 font-bold">Guaranteed Fare</span>
                      <span className="text-[#FFC107] font-black text-base">₹{bookingStatus.fare}</span>
                    </div>
                  </div>

                  {/* Pulsing Loading Skeletons for Driver Match */}
                  {bookingStatus.status === 'searching' && (
                    <div className="mt-4 bg-[#141414] p-4 rounded-2xl border border-white/5 flex items-center gap-3 relative overflow-hidden">
                       <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse shrink-0 border border-white/10" />
                       <div className="flex-1 space-y-2">
                          <div className="w-1/3 h-2 bg-white/10 animate-pulse rounded-full" />
                          <div className="w-2/3 h-3 bg-white/10 animate-pulse rounded-full" />
                          <div className="w-1/2 h-2 bg-white/5 animate-pulse rounded-full" />
                       </div>
                       <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse shrink-0" />
                       
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC107]/5 to-transparent animate-[shimmer_2s_infinite]" />
                    </div>
                  )}

                  {/* Assigned Captain Information Mock */}
                  {bookingStatus.status === 'accepted' && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-4 flex flex-col gap-3"
                    >
                      {/* Active Progress Bar */}
                      <div className="bg-[#141414] p-4 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                          <span className="text-[#FFC107]">Pickup</span>
                          <span className="text-white/40">Drop-off</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "65%" }}
                            transition={{ duration: 15, ease: "linear" }}
                            className="absolute top-0 left-0 h-full bg-[#FFC107] rounded-full"
                          />
                        </div>
                        <p className="text-white/50 text-[10px] text-center font-bold uppercase tracking-wider">Captain is on the way</p>
                      </div>

                      <div className="bg-[#141414] p-4 rounded-2xl border border-[#FFC107]/20 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#FFC107]/30 flex items-center justify-center text-xl">
                          🧑🏽‍✈️
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] uppercase text-[#FFC107] tracking-wider font-extrabold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#FFC107] text-[#FFC107]" /> 4.9 Rated Captain
                          </p>
                          <h4 className="text-white font-black text-sm truncate">Captain Rajesh Kumar</h4>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mt-0.5">Hero Splendor • BR-09A-4831</p>
                        </div>
                        <a href="tel:9999999999" className="w-10 h-10 rounded-full bg-[#FFC107] text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                          <PhoneCall className="w-4 h-4 text-black" />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-3 mt-4">
                  {/* Cancel Ride Action */}
                  <button 
                    onClick={() => {
                        if (activeBookingId) {
                           updateDoc(doc(db, 'bookings', activeBookingId), { status: 'cancelled' });
                        }
                        setBookingStatus(null);
                        setActiveBookingId(null);
                        showToast("Ride dispatch request cancelled.", "info");
                    }} 
                    className="w-full py-4.5 bg-red-500/10 text-red-500 font-extrabold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-500/20 active:scale-98 transition-all border border-red-500/20"
                  >
                    Cancel Dispatch Request
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            // Form, search overlays, and options selector view
            <motion.div 
              key="booking-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Header section */}
              <div className="px-6 pt-6 mb-4 flex justify-between items-center relative z-20">
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-[#FFC107] tracking-widest">
                    RAPDO HYPER-MOBILITY
                  </span>
                  <h1 className="text-2xl font-black text-white leading-tight flex items-center gap-2">
                    Book Ride
                    <span className="text-[#FFC107]">.</span>
                  </h1>
                </div>
                {/* Locate me button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={triggerAutoLocate}
                  className="px-3.5 py-2 rounded-xl bg-[#121212] hover:bg-[#1A1A1A] border border-white/5 hover:border-[#FFC107]/40 text-xs text-white/80 hover:text-white font-bold transition-all flex items-center gap-2 shadow-md shrink-0"
                >
                  <LocateFixed className={`w-3.5 h-3.5 text-[#FFC107] ${isLocating ? 'animate-spin' : ''}`} />
                  GPS Confirm
                </motion.button>
              </div>

              {/* Sub navigation bar */}
              <div className="px-6 mb-5 flex gap-2">
                <button 
                  onClick={() => setActiveTabTab('request')}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'request' ? 'bg-[#FFC107] text-black shadow-lg shadow-[#FFC107]/10' : 'text-white/40 hover:text-white'}`}
                >
                  Ride Options
                </button>
                <button 
                  onClick={() => setActiveTabTab('history')}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'history' ? 'bg-[#FFC107] text-black shadow-lg shadow-[#FFC107]/10' : 'text-white/40 hover:text-white'}`}
                >
                  Recent Bookings
                </button>
              </div>

              {activeTab === 'history' ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 space-y-4"
                >
                  <div className="bg-[#121212] border border-white/5 rounded-3xl p-5 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-black text-white/80 uppercase tracking-wider">Your Ride Log</h3>
                      <History className="w-4 h-4 text-[#FFC107]" />
                    </div>
                    {pastRides.map((ride) => (
                      <div key={ride.id} className="py-3 border-b border-white/5 last:border-0 flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <p className="text-white font-black">{ride.from}</p>
                          <p className="text-white/40 flex items-center gap-1">
                            <ArrowRight className="w-3 h-3 text-[#FFC107]" /> {ride.to}
                          </p>
                          <span className="inline-block text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-white/50">{ride.date} • {ride.mode}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[#FFC107] font-black text-sm">₹{ride.fare}</p>
                          <button 
                            onClick={() => {
                              setCustomPickup(ride.from);
                              setCustomDrop(ride.to);
                              // Lookup coordinate matches
                              const pMatch = searchBiharLocations(ride.from);
                              const dMatch = searchBiharLocations(ride.to);
                              if (pMatch.length > 0) setPickupCoords({ lat: pMatch[0].lat, lng: pMatch[0].lng });
                              if (dMatch.length > 0) setDropCoords({ lat: dMatch[0].lat, lng: dMatch[0].lng });
                              setMode('custom');
                              setActiveTabTab('request');
                              showToast("Loaded repeat ride details!", "success");
                            }}
                            className="text-[10px] text-blue-400 hover:underline mt-1 block font-bold"
                          >
                            Rebook Ride
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-br from-[#121212] to-blue-900/10 border border-white/5 rounded-3xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black">All Rides Verified & Monitored</h4>
                      <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">Every captain undergoes a thorough verification. Real-time path tracing is enabled.</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Custom map block with selection pointer */}
                  <div className="px-6 mb-5 relative group">
                    <div className="h-[180px] w-full rounded-[28px] overflow-hidden border border-white/10 relative shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
                      <Map 
                        defaultCenter={currentLocation || pickupCoords || {lat: 25.5941, lng: 85.1376}}
                        center={selectionMode === 'pickup' ? (pickupCoords || currentLocation || {lat: 25.5941, lng: 85.1376}) : (dropCoords || pickupCoords || currentLocation || {lat: 25.5941, lng: 85.1376})}
                        defaultZoom={selectionMode === 'pickup' ? 14 : 11}
                        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                        onClick={handleMapClick}
                        disableDefaultUI={true}
                        gestureHandling="greedy"
                      >
                        <MapCameraHandler center={selectionMode === 'pickup' ? (pickupCoords || currentLocation || null) : (dropCoords || pickupCoords || currentLocation || null)} />
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
                      
                      {/* Interactive Instruction Pill on Map header */}
                      <div className="absolute top-3 inset-x-3 bg-black/80 backdrop-blur-md py-2.5 px-3 rounded-2xl border border-[#FFC107]/20 text-center text-[10px] font-black uppercase tracking-widest text-[#FFC107] pointer-events-none shadow-md">
                        {selectionMode === 'pickup' ? '📍 Tap map to position Pickup Point' : '📍 Tap map to pin Drop Destination'}
                      </div>

                      {/* Map Interaction Buttons Overlay */}
                      <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-30">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectionMode(selectionMode === 'pickup' ? 'drop' : 'pickup');
                          }}
                          className="w-9 h-9 bg-black/95 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-[#FFC107]"
                        >
                          <Target className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            if (pickupCoords) {
                               setPickupCoords(null);
                               setCustomPickup('');
                               setSelectionMode('pickup');
                               showToast("Cleared pickup point.", "info");
                            }
                          }}
                          className="w-9 h-9 bg-black/95 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Mode Selector (Dynamic Custom vs Standard Fixed Routes) */}
                  <div className="px-6 mb-5">
                    <div className="p-1 bg-[#121212] rounded-2xl border border-white/5 flex gap-1 shadow-inner">
                      <button 
                        onClick={() => setMode('custom')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'custom' ? 'bg-[#FFC107] text-black font-extrabold shadow-md' : 'text-white/40 hover:text-white'}`}
                      >
                        Custom Coordinates
                      </button>
                      <button 
                        onClick={() => setMode('fixed')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'fixed' ? 'bg-[#FFC107] text-black font-extrabold shadow-md' : 'text-white/40 hover:text-white'}`}
                      >
                        Verified Express Routes
                      </button>
                    </div>
                  </div>

                  {/* Booking Fields & Search Module */}
                  <div className="px-6 space-y-4">
                    {mode === 'custom' ? (
                      <div className="relative space-y-4">
                         
                         {/* Visual linking bar */}
                         <div className="absolute left-[34px] top-[46px] bottom-[46px] w-[2px] bg-gradient-to-b from-[#FFC107]/40 to-[#3B82F6]/40 border-dashed pointer-events-none z-0" />

                         {/* Pickup Input Field */}
                         <div className="relative group z-10">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black border border-[#FFC107]/40 flex items-center justify-center">
                             <div className="w-1.5 h-1.5 bg-[#FFC107] rounded-full" />
                           </div>
                           <input 
                             type="text"
                             required
                             value={customPickup}
                             onChange={(e) => {
                               setCustomPickup(e.target.value);
                               setSearchTerm(e.target.value);
                               setSearchFocused('pickup');
                             }}
                             onFocus={() => {
                               setSelectionMode('pickup');
                               setSearchFocused('pickup');
                               setSearchTerm(customPickup === 'Current Live Location' ? '' : customPickup);
                             }}
                             placeholder="Select pickup point..."
                             className="w-full bg-[#1A1A1A] hover:bg-[#1E1E1E] focus:bg-[#1E1E1E] border border-white/5 hover:border-white/10 rounded-2xl pl-14 pr-10 py-4.5 text-xs text-white font-black tracking-wide outline-none focus:ring-2 focus:ring-[#FFC107]/30 transition-all shadow-inner"
                           />
                           {customPickup && (
                             <button 
                               onClick={() => { setCustomPickup(''); setPickupCoords(null); }}
                               className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-1"
                             >
                               <X className="w-3.5 h-3.5" />
                             </button>
                           )}
                         </div>

                         {/* Destination input card with Voice Assistant link */}
                         <div className="relative group z-10">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black border border-blue-500/40 flex items-center justify-center">
                             <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                           </div>
                           <input 
                             type="text"
                             required
                             value={customDrop}
                             onChange={(e) => {
                               setCustomDrop(e.target.value);
                               setSearchTerm(e.target.value);
                               setSearchFocused('drop');
                             }}
                             onFocus={() => {
                               setSelectionMode('drop');
                               setSearchFocused('drop');
                               setSearchTerm(customDrop);
                             }}
                             placeholder="Search drop destination..."
                             className="w-full bg-[#1A1A1A] hover:bg-[#1E1E1E] focus:bg-[#1E1E1E] border border-white/5 hover:border-white/10 rounded-2xl pl-14 pr-12 py-4.5 text-xs text-white font-black tracking-wide outline-none focus:ring-2 focus:ring-[#FFC107]/30 transition-all shadow-inner"
                           />
                           <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                             {customDrop && (
                               <button 
                                 onClick={() => { setCustomDrop(''); setDropCoords(null); }}
                                 className="text-white/30 hover:text-white p-1"
                               >
                                 <X className="w-3.5 h-3.5" />
                               </button>
                             )}
                             <button 
                               type="button"
                               onClick={() => setShowVoiceOverlay(true)}
                               className="w-7 h-7 rounded-full bg-[#FFC107]/10 flex items-center justify-center hover:bg-[#FFC107]/20 text-[#FFC107] border border-[#FFC107]/30"
                             >
                               <Mic className="w-3.5 h-3.5" />
                             </button>
                           </div>
                         </div>

                         {/* Active Search Predictions Overlay Panel */}
                         <AnimatePresence>
                           {searchFocused && searchTerm.trim().length > 0 && (
                             <motion.div 
                               initial={{ opacity: 0, y: -10 }}
                               animate={{ opacity: 1, y: 0 }}
                               exit={{ opacity: 0 }}
                               className="absolute left-0 right-0 top-full bg-[#121212] border border-white/10 rounded-2xl mt-1 shadow-2xl overflow-hidden z-50 max-h-56 overflow-y-auto no-scrollbar"
                             >
                               {searchBiharLocations(searchTerm).slice(0, 5).map((loc, idx) => (
                                 <button
                                   key={idx}
                                   type="button"
                                   onClick={() => {
                                     const formatted = `${loc.name}, ${loc.city}, Bihar`;
                                     if (searchFocused === 'pickup') {
                                       setCustomPickup(formatted);
                                       setPickupCoords({ lat: loc.lat, lng: loc.lng });
                                     } else {
                                       setCustomDrop(formatted);
                                       setDropCoords({ lat: loc.lat, lng: loc.lng });
                                     }
                                     setSearchFocused(null);
                                     setSearchTerm('');
                                   }}
                                   className="w-full px-4 py-3 border-b border-white/5 last:border-0 hover:bg-[#FFC107]/10 text-left flex items-start gap-3 transition-colors"
                                 >
                                   <MapPin className="w-4 h-4 text-[#FFC107] shrink-0 mt-0.5" />
                                   <div className="min-w-0">
                                     <p className="text-white text-xs font-bold truncate">{loc.name}</p>
                                     <p className="text-white/40 text-[10px] mt-0.5">{loc.city}, Bihar • {loc.desc}</p>
                                   </div>
                                 </button>
                               ))}
                             </motion.div>
                           )}
                         </AnimatePresence>
                      </div>
                    ) : (
                      <div className="relative">
                        <select 
                          required
                          value={selectedRouteId}
                          onChange={(e) => {
                            setSelectedRouteId(e.target.value);
                            const matched = DEMO_ROUTES.find(r => r.routeId === e.target.value);
                            if (matched) {
                              setCustomPickup(matched.pickupName);
                              setCustomDrop(matched.dropName);
                            }
                          }}
                          className="block w-full px-5 py-4 border border-white/5 bg-[#1A1A1A] hover:bg-[#1E1E1E] focus:bg-[#1E1E1E] text-white rounded-2xl text-xs font-black tracking-wide outline-none appearance-none transition-all focus:ring-2 focus:ring-[#FFC107]/20"
                        >
                          <option value="">-- Choose Verified Bihar Route --</option>
                          {DEMO_ROUTES.map(r => (
                            <option key={r.routeId} value={r.routeId}>
                              {r.pickupName} → {r.dropName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Draggable Saved Places Quick Links */}
                    <div className="grid grid-cols-4 gap-2.5 mt-2 overflow-x-auto no-scrollbar scroll-smooth">
                      {SAVED_PLACES.map((place, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCustomDrop(place.address);
                            setDropCoords({ lat: place.lat, lng: place.lng });
                            setSelectionMode('pickup');
                            showToast(`Selected "${place.label}" drop-off!`, "info");
                          }}
                          className="py-2.5 px-3 rounded-2xl bg-[#121212]/80 hover:bg-[#1A1A1A] border border-white/5 hover:border-[#FFC107]/40 text-center text-[10px] font-black tracking-wide transition-all shrink-0 flex flex-col items-center gap-1 group relative overflow-hidden"
                        >
                          <span className="text-sm group-hover:scale-110 transition-transform">{place.icon}</span>
                          <span className="text-white/70 group-hover:text-white truncate max-w-full">{place.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Premium Ride Category Selection Cards */}
                    <div className="mt-4">
                      <span className="text-[10px] text-white/40 uppercase font-black tracking-widest block mb-3 px-1">Select Ride Module</span>
                      <div className="grid grid-cols-4 gap-2.5">
                        
                        {/* Bike option */}
                        <button
                          onClick={() => setVehicle('bike')}
                          className={`py-4 px-2 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-center border relative overflow-hidden group ${vehicle === 'bike' ? 'bg-gradient-to-b from-[#FFC107]/15 to-[#FFC107]/5 border-[#FFC107] shadow-lg shadow-[#FFC107]/5' : 'bg-[#121212]/80 border-white/5 hover:border-white/10'}`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${vehicle === 'bike' ? 'bg-[#FFC107]/10 border-[#FFC107]/30 text-[#FFC107]' : 'bg-white/5 border-white/10 text-white/50'}`}>
                            <Bike className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black block text-white">Bike</span>
                            <span className="text-[9px] text-[#FFC107] font-black mt-0.5 block leading-none">₹20+</span>
                          </div>
                        </button>

                        {/* Auto option */}
                        <button
                          onClick={() => setVehicle('auto')}
                          className={`py-4 px-2 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-center border relative overflow-hidden group ${vehicle === 'auto' ? 'bg-gradient-to-b from-[#FFC107]/15 to-[#FFC107]/5 border-[#FFC107] shadow-lg shadow-[#FFC107]/5' : 'bg-[#121212]/80 border-white/5 hover:border-white/10'}`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${vehicle === 'auto' ? 'bg-[#FFC107]/10 border-[#FFC107]/30 text-[#FFC107]' : 'bg-white/5 border-white/10 text-white/50'}`}>
                            <span className="text-base font-bold">🛺</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-black block text-white">Auto</span>
                            <span className="text-[9px] text-[#FFC107] font-black mt-0.5 block leading-none">₹30+</span>
                          </div>
                        </button>

                        {/* Mini option */}
                        <button
                          onClick={() => setVehicle('mini')}
                          className={`py-4 px-2 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-center border relative overflow-hidden group ${vehicle === 'mini' ? 'bg-gradient-to-b from-[#FFC107]/15 to-[#FFC107]/5 border-[#FFC107] shadow-lg shadow-[#FFC107]/5' : 'bg-[#121212]/80 border-white/5 hover:border-white/10'}`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${vehicle === 'mini' ? 'bg-[#FFC107]/10 border-[#FFC107]/30 text-[#FFC107]' : 'bg-white/5 border-white/10 text-white/50'}`}>
                            <span className="text-base font-bold">🚗</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-black block text-white">Mini</span>
                            <span className="text-[9px] text-[#FFC107] font-black mt-0.5 block leading-none">₹40+</span>
                          </div>
                        </button>

                        {/* Parcel option */}
                        <button
                          onClick={() => setVehicle('parcel')}
                          className={`py-4 px-2 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-center border relative overflow-hidden group ${vehicle === 'parcel' ? 'bg-gradient-to-b from-[#FFC107]/15 to-[#FFC107]/5 border-[#FFC107] shadow-lg shadow-[#FFC107]/5' : 'bg-[#121212]/80 border-white/5 hover:border-white/10'}`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${vehicle === 'parcel' ? 'bg-[#FFC107]/10 border-[#FFC107]/30 text-[#FFC107]' : 'bg-white/5 border-white/10 text-white/50'}`}>
                            <PackageOpen className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black block text-white">Parcel</span>
                            <span className="text-[9px] text-[#FFC107] font-black mt-0.5 block leading-none">₹15+</span>
                          </div>
                        </button>

                      </div>
                    </div>

                    {/* Real-time Fare Breakdown Card with smart metrics */}
                    {((mode === 'custom' && pickupCoords && dropCoords) || (mode === 'fixed' && selectedRoute)) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-3xl bg-gradient-to-br from-[#121212] via-[#121212] to-[#FFC107]/5 border border-[#FFC107]/30 relative overflow-hidden"
                      >
                         <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC107]/5 blur-[35px] rounded-full pointer-events-none" />
                         
                         <div className="flex justify-between items-start">
                           <div>
                             <span className="text-[9px] font-black uppercase text-[#FFC107] tracking-widest flex items-center gap-1">
                               <Sparkles className="w-3 h-3 animate-spin" /> Bihar Fare Lock
                             </span>
                             <h4 className="text-3xl font-black text-white mt-1">
                               ₹{mode === 'custom' ? activeTripMetrics.fare : (selectedRoute ? selectedRoute.fare : 0)}
                             </h4>
                             <p className="text-[10px] text-white/50 mt-1 uppercase font-bold tracking-wider">
                               {mode === 'custom' ? `${activeTripMetrics.dist} KM Route` : 'Verified Route Flat Price'}
                             </p>
                           </div>
                           <div className="text-right flex flex-col justify-between h-full">
                             <div className="text-right text-[10px] text-[#00DF89] font-black uppercase tracking-wider flex items-center gap-1.5 justify-end">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#00DF89] animate-pulse" /> Lowest Rate
                             </div>
                             <span className="text-[9px] text-white/30 uppercase mt-4 block leading-none font-medium">Auto-surge bypassed</span>
                           </div>
                         </div>

                         {/* Speed / ETA Info strip */}
                         <div className="grid grid-cols-2 gap-4 mt-5 pt-3 border-t border-white/5 text-xs text-white/50">
                           <div className="flex items-center gap-2">
                             <Clock className="w-3.5 h-3.5 text-[#FFC107]" />
                             <span>ETA: <strong className="text-white">
                               {vehicle === 'bike' ? '2 mins' : vehicle === 'auto' ? '4 mins' : vehicle === 'mini' ? '6 mins' : '3 mins'}
                             </strong></span>
                           </div>
                           <div className="flex items-center gap-2 justify-end">
                             <ShieldCheck className="w-3.5 h-3.5 text-[#FFC107]" />
                             <span>Safety: <strong className="text-white">Active</strong></span>
                           </div>
                         </div>
                      </motion.div>
                    )}

                    {/* Action Dispatch Triggers */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={mode === 'custom' ? handleBookCustom : handleBookFixed}
                        disabled={mode === 'custom' ? (!customPickup || !customDrop) : !selectedRouteId}
                        className="flex-1 group relative overflow-hidden py-4.5 bg-gradient-to-r from-[#FFC107] to-[#FFB300] text-black font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_15px_30px_rgba(255,193,7,0.25)] hover:shadow-[0_20px_40px_rgba(255,193,7,0.35)] hover:scale-[1.01] active:scale-98 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                      >
                        <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1.4s] ease-in-out skew-x-12" />
                        Find Captain
                      </button>
                      <button
                        type="button"
                        onClick={handleScheduleClick}
                        className="px-5 bg-[#121212] hover:bg-[#1A1A1A] text-[#FFC107] border border-white/5 hover:border-[#FFC107]/40 rounded-2xl shadow-inner active:scale-95 transition-all flex items-center justify-center"
                      >
                        <Calendar className="w-5 h-5"/>
                      </button>
                    </div>

                    {/* Trust/Safety Strip */}
                    <div className="bg-[#121212]/40 rounded-3xl p-5 border border-white/5 flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-[#FFC107]/10 flex items-center justify-center text-[#FFC107] border border-[#FFC107]/20 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-white/90">Instant Trip Safeguards</h4>
                        <p className="text-[10px] text-white/40 leading-relaxed mt-0.5">Your ride includes up and down real-time OTP checks and an instant SOS panel with rapid support linkage.</p>
                      </div>
                    </div>

                  </div>
                </>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        <BottomNav />
      </div>

      {/* Futuristic Fullscreen Voice Search Overlay */}
      <AnimatePresence>
        {showVoiceOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#070707FB] backdrop-blur-3xl z-[1000] flex flex-col justify-between p-7 text-center select-none"
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-black uppercase text-[#FFC107] tracking-widest bg-[#FFC107]/10 border border-[#FFC107]/20 px-3.5 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#FFC107] animate-pulse" /> RAPDO VOICE AI
              </span>
              <button 
                onClick={() => {
                  setShowVoiceOverlay(false);
                  setVoiceQuery('');
                }} 
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated interactive glowing sphere waveform */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-9">
              <div className="relative">
                {/* Glowing interactive orbits */}
                <span className="absolute inset-0 rounded-full bg-[#FFC107]/20 blur-xl scale-125 animate-pulse" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FFC107] to-[#FFB300] flex items-center justify-center text-black shadow-2xl relative z-10 hover:scale-105 transition-transform duration-300">
                  <Mic className="w-10 h-10 text-black animate-pulse" />
                </div>
                {/* Soundwaves arcs */}
                <div className="absolute -inset-10 border border-[#FFC107]/20 rounded-full animate-ping opacity-30 pointer-events-none delay-100" />
                <div className="absolute -inset-20 border border-[#FFC107]/10 rounded-full animate-ping opacity-20 pointer-events-none delay-300" />
              </div>

              <div className="space-y-3 px-6 max-w-xs">
                <h3 className="text-xl font-black text-white">Sunaee de rha hai...</h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  Boliye: "Samastipur Junction" ya "Boring Road bypass"
                </p>
              </div>

              {/* Dynamic Transcript input & controller fallback in case device iframe blocks direct mic */}
              <div className="w-full max-w-sm bg-white/5 border border-white/5 p-4 rounded-3xl text-left space-y-3 shadow-inner">
                <label className="text-[9px] uppercase tracking-wider text-[#FFC107]/80 font-black flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" /> Mic Input & Fallback Sandbox
                </label>
                
                <input 
                  type="text"
                  value={voiceQuery}
                  onChange={(e) => setVoiceQuery(e.target.value)}
                  placeholder="Type simulated oral command here..."
                  className="w-full bg-[#1A1A1A] border border-white/5 p-3 rounded-xl text-white font-black text-xs outline-none focus:border-[#FFC107]/40"
                />

                {/* Popular sample prompts */}
                <div className="pt-2 font-black">
                  <p className="text-[9px] text-white/45 mb-2 uppercase">Or tap to simulate talking:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {recentTranscripts.map((r, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setVoiceQuery(r);
                          showToast(`Simulating spoken trigger: "${r}"`, "info");
                        }}
                        className="py-1 px-2.5 rounded-lg bg-white/5 hover:bg-[#FFC107]/10 hover:text-white border border-white/5 text-[9px] font-bold text-white/60 transition-all truncate max-w-full"
                      >
                        "{r}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmitVoiceQuery}
              disabled={!voiceQuery.trim()}
              className="w-full py-4.5 bg-gradient-to-r from-[#FFC107] to-[#FFB300] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.01] transition-all disabled:opacity-40"
            >
              Analyze Speech Input
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trip Rating Modal */}
      {showRating && (
         <div className="fixed inset-0 bg-[#0A0A0A]/95 backdrop-blur-3xl z-[999] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-[#121212] rounded-[40px] p-8 max-w-sm w-full shadow-[0_40px_80px_rgba(0,0,0,1)] border border-white/5 text-center relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 left-0 w-full h-[6px] bg-[#FFC107]" />
  
              <div className="w-16 h-16 bg-[#1A1A1A] rounded-full border border-[#FFC107]/20 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(255,193,7,0.1)]">
                 <Star className="w-8 h-8 text-[#FFC107] fill-[#FFC107]" />
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight">Trip Evaluation</h3>
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-6">Rate your RAPDO Captain</p>
              
              <div className="flex justify-center gap-2.5 mb-6">
                 {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setRatingVal(s)} className="hover:scale-125 hover:-translate-y-1 transition-all duration-300 p-1">
                       <Star className={`w-8 h-8 transition-colors ${ratingVal >= s ? 'text-[#FFC107] fill-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]' : 'text-white/5'}`} />
                    </button>
                 ))}
              </div>
              
              <textarea 
                placeholder="Write any helpful feedback, bhaiya..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/5 text-white placeholder:text-white/20 rounded-2xl p-4 min-h-[90px] mb-6 focus:ring-1 focus:ring-[#FFC107]/30 transition-all resize-none shadow-inner text-xs outline-none font-bold"
              />
              <button onClick={submitRating} className="w-full py-4.5 bg-gradient-to-r from-[#FFC107] to-[#FFB300] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:scale-[1.01] transition-all">
                 Submit Evaluation
              </button>
           </div>
         </div>
      )}

      {/* Date/Time Booking Schedule Picker Overlay */}
      {showScheduleModal && (
         <div className="fixed inset-0 bg-[#0A0A09F5] backdrop-blur-3xl z-[999] flex items-center justify-center p-4">
            <div className="bg-[#121212] rounded-[40px] border border-white/15 p-7 max-w-sm w-full text-center shadow-2xl relative overflow-hidden flex flex-col">
               <button 
                 type="button" onClick={() => setShowScheduleModal(false)}
                 className="absolute top-5 right-5 text-white/40 hover:text-white w-9 h-9 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all"
               >
                  <X className="w-4 h-4" />
               </button>
               
               <h3 className="text-2xl font-black text-white mt-4">Schedule Dispatch</h3>
               <p className="text-[#FFC107] text-[10px] uppercase tracking-wider font-extrabold mb-6">RAPDO Advance Reservation</p>
 
               <form onSubmit={handleNativeSchedule} className="space-y-5 text-left">
                  <div className="bg-[#1A1A1A] p-4.5 rounded-[24px] border border-white/5 shadow-inner">
                     <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-2.5 text-center">Vehicle Selected</label>
                     <div className="grid grid-cols-2 gap-2 p-1 bg-[#0A0A0A] rounded-[18px]">
                        <button 
                          type="button" onClick={() => setScheduleServiceType('bike')}
                          className={`py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${scheduleServiceType === 'bike' ? 'bg-[#FFC107] text-black font-extrabold shadow' : 'text-white/30'}`}
                        >
                           🏍️ BIKE
                        </button>
                        <button 
                          type="button" onClick={() => setScheduleServiceType('parcel')}
                          className={`py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${scheduleServiceType === 'parcel' ? 'bg-[#FFC107] text-black font-extrabold shadow' : 'text-white/30'}`}
                        >
                           📦 PARCEL
                        </button>
                     </div>
                  </div>
 
                  <div className="flex gap-3">
                    <div className="flex-1">
                       <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-1.5 px-2 font-bold">Pick Date</label>
                       <input 
                         type="date"
                         required
                         min={new Date().toISOString().split("T")[0]}
                         value={scheduleDate}
                         onChange={e => setScheduleDate(e.target.value)}
                         className="block w-full px-4 py-3.5 bg-[#1A1A1A] border border-white/5 rounded-2xl text-[11px] font-mono font-bold outline-none text-white focus:border-[#FFC107]/40 shadow-inner hover:bg-[#1C1C1C]"
                         style={{ colorScheme: 'dark' }}
                       />
                    </div>
    
                    <div className="flex-1">
                       <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-1.5 px-2 font-bold">Pick Time</label>
                       <input 
                         type="time"
                         required
                         value={scheduleTime}
                         onChange={e => setScheduleTime(e.target.value)}
                         className="block w-full px-4 py-3.5 bg-[#1A1A1A] border border-white/5 rounded-2xl text-[11px] font-mono font-bold outline-none text-white focus:border-[#FFC107]/40 shadow-inner hover:bg-[#1C1C1C]"
                         style={{ colorScheme: 'dark' }}
                       />
                    </div>
                  </div>
 
                  <div className="pt-3">
                     <button 
                       type="submit"
                       disabled={isScheduling}
                       className="w-full py-4.5 bg-gradient-to-r from-[#FFC107] to-[#FFB300] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:scale-[1.01] transition-all"
                     >
                        Finalize Reservation
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}

function getSafeGeocoder(geocodingLib: any) {
  try {
    if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
      return new (window as any).google.maps.Geocoder();
    }
  } catch (e) {
    console.warn("Global Geocoder instantiation failed:", e);
  }
  try {
    if (geocodingLib && geocodingLib.Geocoder) {
      return new geocodingLib.Geocoder();
    }
  } catch (e) {
    console.warn("Library Geocoder instantiation failed:", e);
  }
  // Safe mock fallback
  return {
    geocode: ({ location, address, placeId }: any) => {
      const displayAddr = address || (location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Patna, Bihar");
      return Promise.resolve({
        results: [{
          geometry: { location: location || { lat: 25.5941, lng: 85.1376 } },
          formatted_address: displayAddr
        }]
      });
    }
  };
}
