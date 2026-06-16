import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Map, useMapsLibrary } from '../components/SmartMapView';
import { LiveCaptains } from '../components/LiveCaptains';
import { LocationSearchInput } from '../components/LocationSearchInput';
import { VoiceSearchModal } from '../components/VoiceSearchModal';
import { searchBiharLocations, BiharLocation } from '../lib/locationDb';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { ActiveRideTrackingCard } from '../components/ActiveRideTrackingCard';
import {
  MapPin, PhoneCall, ShieldCheck, Zap, Navigation, Sparkles, ArrowRight,
  Package, Database, Search, Clock, CarTaxiFront, LocateFixed,
  CloudSun, Bell, Mic, Briefcase, Wallet, Heart, History, Bookmark,
  ChevronRight, TrendingUp, CircleAlert, Map as MapIcon,
  Crown, Bike, PackageOpen, X
} from "lucide-react";
import { useAuth } from "../lib/auth";
import BottomNav from "../components/BottomNav";
import { Bike3D } from "../components/Bike3D";
import { WeatherWidget } from "../components/WeatherWidget";
import { NotificationCenter } from "../components/NotificationCenter";
import { useNotifications, initFCM } from "../lib/notifications";
import { CinematicLoader } from '../components/CinematicLoader';
import { CinematicHero3D } from '../components/CinematicHero3D';

export default function Home() {
  const { currentUser, loading: authLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [homePickup, setHomePickup] = useState('');
  const [homeDrop, setHomeDrop] = useState('');
  const [homePickupCoords, setHomePickupCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [homeDropCoords, setHomeDropCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [isAutoLocating, setIsAutoLocating] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'pickup' | 'drop'>('drop');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [currentCityName, setCurrentCityName] = useState("Samastipur, BR");

  const { unreadCount } = useNotifications();
  const geocodingLib = useMapsLibrary('geocoding');
  const [activeBooking, setActiveBooking] = useState<any | null>(null);

  // Subscribe to any active bookings of this customer (searching, assigned, arrived, in_trip)
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'bookings'),
      where('customerId', '==', currentUser.uid),
      where('status', 'in', ['searching', 'assigned', 'arrived', 'in_trip']),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveBooking(snapshot.docs[0].data());
      } else {
        setActiveBooking(null);
      }
    }, (error) => {
      console.warn("Active bookings snapshot failed:", error);
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    initFCM();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let city = 'Patna, BR';
        if (lat > 25.8 && lng > 85.7) city = 'Samastipur, BR';
        else if (lat > 26.1) city = 'Darbhanga, BR';
        else if (lat > 26.0 && lng < 85.5) city = 'Muzaffarpur, BR';
        else if (lat > 25.4 && lng > 86.0) city = 'Begusarai, BR';
        else if (lat > 25.6 && lat < 25.8 && lng > 85.1 && lng < 85.3) city = 'Hajipur, BR';
        else if (lat < 24.8) city = 'Gaya, BR';
        else city = 'Samastipur, BR';
        setCurrentCityName(city);
      }, () => {
        setCurrentCityName("Samastipur, BR");
      });
    } else {
      setCurrentCityName("Samastipur, BR");
    }
  }, []);

  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      setHomePickup("Samastipur Junction, Samastipur, Bihar");
      setHomePickupCoords({ lat: 25.8624, lng: 85.7831 });
      return;
    }
    setIsAutoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setHomePickupCoords(loc);
          if (geocodingLib) {
          const geocoder = getSafeGeocoder(geocodingLib);
          geocoder.geocode({ location: loc }).then(res => {
            const addr = res?.results?.[0]?.formatted_address || "Current Live Location";
            setHomePickup(addr);
          }).catch(() => {
            setHomePickup("Current Live Location");
          });
        } else {
          setHomePickup("Current Live Location");
        }
        setIsAutoLocating(false);
      },
      (error) => {
        console.error("GPS error", error);
        setIsAutoLocating(false);
        setHomePickupCoords({ lat: 25.8624, lng: 85.7831 });
        setHomePickup("Samastipur Junction, Samastipur, Bihar");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    if (isSearchOverlayOpen && !homePickup) {
      detectLiveLocation();
    }
  }, [isSearchOverlayOpen]);

  const handleVoiceComplete = (text: string, matchedLoc: BiharLocation | null) => {
    const defaultPickup = "Kankarbagh, Patna, Bihar";
    const defaultPickupCoords = { lat: 25.5978, lng: 85.1583 };
    
    if (matchedLoc) {
      const pName = homePickup || defaultPickup;
      const pCoords = homePickupCoords || defaultPickupCoords;
      const dName = `${matchedLoc.name}, ${matchedLoc.city}, Bihar`;
      const dCoords = { lat: matchedLoc.lat, lng: matchedLoc.lng };
      
      setHomeDrop(dName);
      setHomeDropCoords(dCoords);
      setIsSearchOverlayOpen(false);
      setIsVoiceOpen(false);

      navigate('/book', {
        state: {
          mode: 'custom',
          pickup: pName,
          drop: dName,
          pickupCoords: pCoords,
          dropCoords: dCoords,
          selectionMode: 'drop'
        }
      });
    } else {
      setHomeDrop(text);
      setIsVoiceOpen(false);
      setIsSearchOverlayOpen(true);
    }
  };

  useEffect(() => {
    // Only drop auth loading if not authLoading, leave initialising for cinematic loader
    if (!authLoading && isInitializing === false) {
       // already disabled
    }
  }, [authLoading]);

  return (
    <div className="flex-1 bg-black min-h-screen font-sans">
      <AnimatePresence>
        {(isInitializing || authLoading) && (
          <CinematicLoader onComplete={() => setIsInitializing(false)} />
        )}
      </AnimatePresence>

      {!isInitializing && !authLoading && (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 1.5, ease: "easeInOut" }}
           className="w-full max-w-md mx-auto min-h-screen bg-[#0D0D0D] shadow-[0_40px_80px_rgba(0,0,0,0.9)] relative flex flex-col pb-24 overflow-x-hidden"
        >
        
        {/* Cinematic Live Map Background Header */}
        <div className="absolute top-0 left-0 w-full h-[450px] z-0 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}>
           <CinematicHero3D />
           <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D]/10 via-[#0D0D0D]/60 to-[#0D0D0D] backdrop-blur-[1px]" />
        </div>

        {/* Floating Ambient Glows */}
        <div className="absolute top-[-50px] right-[-50px] w-[350px] h-[350px] bg-[#FFC107]/15 rounded-full blur-[100px] pointer-events-none mix-blend-screen z-0" />
        <div className="absolute bottom-[20%] left-[-100px] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen z-0" />

        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-20">
          
          {/* 1. TOP HEADER AREA */}
          <div className="px-6 pt-12 pb-6 flex justify-between items-center relative">
            <div className="flex items-center gap-4">
               <motion.div 
                 whileHover={{ scale: 1.05 }}
                 className="w-14 h-14 bg-gradient-to-br from-[#FFC107] to-[#FFB300] rounded-[24px] p-[2px] shadow-[0_10px_25px_rgba(255,193,7,0.3)] cursor-pointer"
               >
                 <div className="w-full h-full bg-[#1E1E1E] rounded-[22px] flex items-center justify-center border border-black overflow-hidden relative">
                    <img src={`https://ui-avatars.com/api/?name=${currentUser?.name || 'R'}&background=1E1E1E&color=FFC107&bold=true`} alt="Avatar" className="w-full h-full object-cover" />
                 </div>
               </motion.div>
               <div>
                 <p className="text-[#FFC107] text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 drop-shadow-md">
                   <LocateFixed className="w-3.5 h-3.5" /> {currentCityName}
                 </p>
                 <h1 className="text-2xl font-black text-[#F5F5F5] tracking-tight flex items-center gap-2 drop-shadow-md">
                   {currentUser?.name ? `Hi, ${currentUser.name.split(" ")[0]}` : "Good Evening"} 
                   <motion.span 
                      animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className="text-xl origin-bottom-right inline-block"
                   >👋</motion.span>
                 </h1>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
               <WeatherWidget />
               <motion.div whileTap={{ scale: 0.9 }} onClick={() => setIsNotifOpen(true)} className="w-11 h-11 bg-[#1E1E1E]/80 backdrop-blur-xl rounded-[18px] border border-white/10 flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.5)] relative cursor-pointer hover:bg-white/10 transition-colors">
                 <Bell className="w-5 h-5 text-[#F5F5F5]" />
                 {unreadCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center text-white border-2 border-[#1E1E1E]">
                     {unreadCount}
                   </span>
                 )}
               </motion.div>
            </div>
          </div>

          {/* 2. HERO / SEARCH SECTION */}
          <div className="px-6 py-2">
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               whileTap={{ scale: 0.97 }}
               onClick={() => setIsSearchOverlayOpen(true)}
               className="w-full bg-black/40 backdrop-blur-3xl border border-white/10 hover:border-[#FFC107]/50 rounded-[32px] p-5 flex items-center gap-5 shadow-[0_20px_40px_rgba(0,0,0,0.8)] cursor-text group relative overflow-hidden transition-all h-[90px]"
               id="home-where-to-btn"
             >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,193,7,0.05),transparent)] -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out z-0"></div>
                <div className="w-14 h-14 bg-white/5 rounded-[20px] flex items-center justify-center border border-white/10 group-hover:bg-[#FFC107] group-hover:border-[#FFC107] group-hover:shadow-[0_0_20px_rgba(255,193,7,0.4)] transition-all z-10 shrink-0">
                  <Search className="w-6 h-6 text-[#FFC107] group-hover:text-black transition-colors" />
                </div>
                <div className="flex-1 col-span-1 z-10">
                  <p className="text-white font-black text-2xl tracking-tight">Where to?</p>
                  <p className="text-[#FFC107] text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-1 drop-shadow-md mt-0.5"><Sparkles className="w-3 h-3 text-[#FFC107]" /> Set Destination</p>
                </div>
                <button
                  type="button"
                  id="home-mic-btn"
                  onClick={(e) => {
                     e.stopPropagation();
                     setIsVoiceOpen(true);
                  }}
                  className="w-12 h-12 bg-white/5 rounded-[18px] flex items-center justify-center border border-white/10 hover:bg-white/10 hover:text-white transition-all shrink-0 cursor-pointer text-white/50 z-10"
                >
                   <Mic className="w-5 h-5" />
                </button>
             </motion.div>

             {/* Ride Favorites */}
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="flex gap-3 mt-5 overflow-x-auto no-scrollbar pl-1"
             >
                <button
                  onClick={() => {
                    navigate('/book', {
                      state: {
                        mode: 'custom',
                        pickup: "Current Live Location",
                        drop: "Home, Patna, Bihar",
                        pickupCoords: homePickupCoords || { lat: 25.5978, lng: 85.1583 },
                        dropCoords: { lat: 25.6024, lng: 85.1376 },
                        selectionMode: 'drop'
                      }
                    });
                  }}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/5 hover:border-[#FFC107]/40 rounded-full px-4 py-2.5 transition-all text-[#F5F5F5] shrink-0"
                >
                  <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center">
                     <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  </div>
                  <span className="font-bold text-sm tracking-wide">Home</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/book', {
                      state: {
                        mode: 'custom',
                        pickup: "Current Live Location",
                        drop: "Work, Patna, Bihar",
                        pickupCoords: homePickupCoords || { lat: 25.5978, lng: 85.1583 },
                        dropCoords: { lat: 25.6133, lng: 85.1111 },
                        selectionMode: 'drop'
                      }
                    });
                  }}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/5 hover:border-[#FFC107]/40 rounded-full px-4 py-2.5 transition-all text-[#F5F5F5] shrink-0"
                >
                  <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center">
                     <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <span className="font-bold text-sm tracking-wide">Work</span>
                </button>
             </motion.div>
          </div>

          <div className="px-6 space-y-5 mt-8 relative z-20">
            
            {/* ACTIVE RIDE TRACKING CARD */}
            <AnimatePresence>
              {activeBooking && (
                <ActiveRideTrackingCard initialBooking={activeBooking} />
              )}
            </AnimatePresence>
            
            {/* 3. MAIN SERVICES (Floating 3D Cards) */}
            <h2 className="text-[10px] text-[#FFC107] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-2"><Crown className="w-3.5 h-3.5 text-[#FFC107]"/> Ecosystem Services</h2>
            <div className="grid grid-cols-2 gap-4">
               {/* 1. BIKE RIDE */}
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 whileHover={{ y: -5, scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => navigate('/book')}
                 className="col-span-2 bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-[#FFC107]/50 rounded-[32px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_rgba(255,193,7,0.2)] relative group h-[260px] flex flex-col justify-end p-8"
               >
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#FFC1070A_1px,transparent_1px),linear-gradient(to_bottom,#FFC1070A_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
                 
                 {/* 3D Floating Bike / Vehicle */}
                 <div onClick={(e) => e.stopPropagation()} className="absolute top-0 right-0 w-[80%] h-full pointer-events-auto mix-blend-screen opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 origin-bottom-right">
                    <Suspense fallback={null}>
                       <Bike3D />
                    </Suspense>
                 </div>
                 
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none"></div>
                 <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10 pointer-events-none"></div>
                 
                 <div className="relative z-20 w-fit">
                   <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-[20px] flex items-center justify-center mb-6 border border-white/10 group-hover:border-[#FFC107] group-hover:bg-[#FFC107] group-hover:shadow-[0_0_30px_rgba(255,193,7,0.5)] transition-all duration-500">
                     <Bike className="w-8 h-8 text-[#FFC107] group-hover:text-black transition-colors" />
                   </div>
                   <h3 className="text-white text-4xl font-black tracking-tight mb-2 drop-shadow-md">Ride</h3>
                   <div className="flex items-center gap-3">
                     <p className="text-white/60 text-sm font-bold tracking-wide">Hyperlocal Mobility</p>
                     <div className="bg-[#FFC107]/20 border border-[#FFC107]/40 rounded-full px-2.5 py-1 text-[#FFC107] text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(255,193,7,0.4)]">Go Now</div>
                   </div>
                 </div>
               </motion.div>

               {/* 2. PARCEL DELIVERY */}
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "100px" }}
                 whileHover={{ y: -5, scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => navigate('/parcel')}
                 className="bg-gradient-to-b from-blue-900/20 to-black/60 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 rounded-[32px] overflow-hidden shadow-2xl relative group cursor-pointer min-h-[220px]"
               >
                 <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop" alt="Parcel" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                 <div className="relative z-20 p-6 flex flex-col justify-end h-full">
                    <div className="w-14 h-14 bg-white/5 backdrop-blur-md border border-white/10 rounded-[20px] flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:border-blue-400 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
                        <Package className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-white font-black text-2xl tracking-tight mb-1">Parcel</h3>
                    <p className="text-[#F5F5F5]/50 text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-blue-300 transition-colors">Instant Send</p>
                 </div>
               </motion.div>

               {/* 3. BUSINESS LOGISTICS */}
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "100px" }}
                 transition={{ delay: 0.1 }}
                 whileHover={{ y: -5, scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => navigate('/logistics')}
                 className="bg-gradient-to-b from-purple-900/20 to-black/60 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 rounded-[32px] overflow-hidden shadow-2xl relative group cursor-pointer min-h-[220px]"
               >
                 <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <img src="https://images.unsplash.com/photo-1586528116311-ad8ed3c84a0f?q=80&w=800&auto=format&fit=crop" alt="Logistics" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen group-hover:scale-110 transition-transform duration-1000 ease-out" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                 <div className="relative z-20 p-6 flex flex-col justify-end h-full">
                    <div className="w-14 h-14 bg-white/5 backdrop-blur-md border border-white/10 rounded-[20px] flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:border-purple-400 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all">
                        <Database className="w-6 h-6 text-purple-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-white font-black text-2xl tracking-tight mb-1">B2B</h3>
                    <p className="text-[#F5F5F5]/50 text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-purple-300 transition-colors">Logistics Fleet</p>
                 </div>
               </motion.div>
            </div>

            {/* 4. LIVE FLEET EXPERIENCE */}
            <h2 className="text-[10px] text-[#FFC107] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-2 mt-12"><Navigation className="w-3.5 h-3.5 text-[#FFC107]"/> Live Bihar Network</h2>
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "100px" }}
               className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative h-[250px] group cursor-pointer hover:border-blue-500/50 transition-colors"
               onClick={() => navigate('/book')}
            >
                <div className="absolute top-[30%] left-[-20%] w-[150%] h-[150%] pointer-events-none z-0 rotate-12 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="absolute inset-0 z-0 pointer-events-none opacity-80" style={{ maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)' }}>
                   <Map 
                     defaultCenter={{lat: 25.6024, lng: 85.1376}}
                     defaultZoom={13}
                     disableDefaultUI={true}
                     gestureHandling="none"
                     styles={[
                       { elementType: "geometry", stylers: [{ color: "#000000" }] },
                       { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
                       { elementType: "labels.text.fill", stylers: [{ color: "#3B82F6" }] },
                       { featureType: "road", elementType: "geometry", stylers: [{ color: "#0D0D0D" }] },
                       { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#3B82F6", weight: 1 }] },
                       { featureType: "water", elementType: "geometry", stylers: [{ color: "#050505" }] }
                     ]}
                   >
                     <LiveCaptains />
                   </Map>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none"></div>
                <div className="relative z-20 p-6 flex flex-col justify-end h-full">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-blue-500/10 backdrop-blur-xl rounded-[24px] border border-blue-500/30 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(59,130,246,0.2)] group-hover:bg-blue-500/30 group-hover:border-blue-400 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all">
                          <LocateFixed className="w-8 h-8 text-blue-400 animate-pulse group-hover:text-white" />
                       </div>
                       <div>
                         <h3 className="text-white font-black text-3xl tracking-tight mb-1">Live Maps</h3>
                         <p className="text-[#F5F5F5]/50 text-[11px] font-black uppercase tracking-[0.2em] group-hover:text-blue-300 transition-colors">7,500+ Active Captains</p>
                       </div>
                    </div>
                </div>
            </motion.div>

            {/* 5. AI SMART ASSISTANT */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/ai-help')}
              className="mt-6 bg-gradient-to-r from-cyan-900/20 to-black/60 border border-cyan-500/30 hover:border-cyan-500/60 rounded-[32px] shadow-2xl relative overflow-hidden group cursor-pointer flex items-center backdrop-blur-xl transition-all duration-500 min-h-[140px]"
            >
               <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" alt="AI" className="absolute inset-0 w-[120%] h-full object-cover opacity-20 mix-blend-screen group-hover:scale-110 group-hover:opacity-40 transition-all duration-1000 ease-out origin-center" />
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10 pointer-events-none"></div>
               
               <div className="relative z-20 flex items-center gap-6 p-6 w-full">
                 <div className="relative shrink-0">
                   <div className="absolute inset-0 bg-cyan-500/40 rounded-[24px] blur-xl group-hover:animate-pulse"></div>
                   <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-[24px] flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] relative z-10 border border-cyan-500/40 group-hover:bg-cyan-500 group-hover:border-cyan-400 transition-all">
                      <Zap className="w-7 h-7 text-cyan-400 group-hover:text-white transition-colors" />
                   </div>
                 </div>
                 <div className="flex-1">
                    <h4 className="text-white font-black text-2xl tracking-tight mb-1 flex items-center gap-2 drop-shadow-md">RAPDO Voice</h4>
                    <p className="text-cyan-400/80 text-[10px] font-black tracking-[0.2em] uppercase drop-shadow-md group-hover:text-cyan-300 transition-colors">Holographic AI Booking</p>
                 </div>
                 <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-[20px] flex items-center justify-center backdrop-blur-md group-hover:bg-cyan-500 group-hover:border-transparent group-hover:text-white text-white/50 shadow-lg transition-all">
                   <ArrowRight className="w-5 h-5" />
                 </div>
               </div>
            </motion.div>

            {/* 6. WALLET & OFFERS SECTION */}
            <h2 className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-12 mb-2 flex items-center gap-2 pl-2"><Sparkles className="w-3.5 h-3.5 text-[#FFC107]"/> App Premium</h2>
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "100px" }}
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => navigate('/wallet')}
               className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-[#FFC107]/40 rounded-[32px] overflow-hidden shadow-2xl relative group cursor-pointer transition-all duration-500 min-h-[180px]"
            >
               <div className="absolute inset-0 bg-[#FFC107]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop" alt="Premium Card" className="absolute right-0 top-0 w-3/4 h-full object-cover opacity-30 mix-blend-screen group-hover:opacity-50 transition-opacity duration-1000 ease-out object-right" />
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none"></div>

               <div className="relative z-20 p-8 flex flex-col justify-between h-full">
                 <div className="flex justify-between items-start mb-8">
                   <div>
                     <p className="text-[#FFC107] text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5 drop-shadow-md">RAPDO Wallet</p>
                     <h3 className="text-white text-5xl font-black tracking-tighter drop-shadow-lg">₹450<span className="text-2xl text-white/40">.00</span></h3>
                   </div>
                   <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-[24px] flex items-center justify-center border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-hover:border-[#FFC107]/50 group-hover:bg-[#FFC107] hover:shadow-[0_0_30px_rgba(255,193,7,0.5)] transition-all">
                     <Wallet className="w-7 h-7 text-[#FFC107] group-hover:text-black transition-colors" />
                   </div>
                 </div>
                 
                 <div className="flex gap-4 mt-auto pt-6 border-t border-white/10">
                    <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-5 py-3 rounded-[20px] text-[10px] font-black text-emerald-400 flex items-center gap-2 uppercase tracking-[0.2em] shadow-sm">
                       <TrendingUp className="w-4 h-4" /> +120 PTS
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 px-5 py-3 rounded-[20px] text-[10px] font-black text-white/60 flex items-center gap-2 uppercase tracking-[0.2em] shadow-sm group-hover:bg-[#FFC107]/10 group-hover:text-[#FFC107] group-hover:border-[#FFC107]/30 transition-colors">
                       Diamond <Crown className="w-4 h-4" />
                    </div>
                 </div>
               </div>
            </motion.div>

            {/* 7. SAFETY SECTION */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "100px" }}
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => navigate('/safety')}
               className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-red-500/50 rounded-[32px] overflow-hidden shadow-2xl relative group cursor-pointer transition-all duration-500 mt-6 min-h-[140px] mb-8"
            >
               <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop" alt="Safety shield blur" className="absolute right-0 top-0 w-2/3 h-full object-cover opacity-20 mix-blend-screen group-hover:opacity-40 transition-opacity duration-1000 ease-out" />
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none"></div>

               <div className="relative z-20 p-6 flex flex-col justify-center h-full">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-[24px] flex items-center justify-center border border-white/10 group-hover:border-red-500/50 group-hover:bg-red-500 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                      <ShieldCheck className="w-8 h-8 text-red-500 drop-shadow-md group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-black text-2xl tracking-tight mb-1 drop-shadow-md">Safety Center</h3>
                      <p className="text-red-400 text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-md text-nowrap">24/7 SOS Protection</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md w-12 h-12 rounded-[20px] flex items-center justify-center border border-white/10 group-hover:bg-red-500 group-hover:border-transparent transition-colors">
                       <CircleAlert className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                    </div>
                 </div>
               </div>
            </motion.div>

          </div>
        </div>
        
        <BottomNav />
      </motion.div>
      )}

      <NotificationCenter 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
      />

      <VoiceSearchModal 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)} 
        onTranscriptionComplete={handleVoiceComplete} 
      />

      <AnimatePresence>
        {isSearchOverlayOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 bg-[#0A0A0A]/98 backdrop-blur-3xl z-[1000] flex flex-col font-sans p-6 overflow-y-auto"
            id="home-search-overlay-container"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-[#FFC107]/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Header section */}
            <div className="flex justify-between items-center mb-8 relative z-10 pt-4">
              <div>
                <span className="text-[#FFC107] text-[10px] font-black uppercase tracking-[0.2em] block mb-1">Set Route</span>
                <h2 className="text-white text-3xl font-black tracking-tight flex items-center gap-2">
                  Plan Your Ride <Sparkles className="w-5 h-5 text-[#FFC107] animate-pulse" />
                </h2>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSearchOverlayOpen(false)}
                className="w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center justify-center transition-colors shadow-lg"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Interactive Search inputs with connectivity layout */}
            <div className="relative bg-[#121212]/90 border border-white/5 p-6 rounded-[32px] shadow-[0_15px_35px_rgba(0,0,0,0.8)] mb-8 z-[200]">
               {/* Vertical Connectivity indicator */}
               <div className="absolute left-10 top-[60px] bottom-[60px] w-[2px] bg-gradient-to-b from-[#3B82F6] via-[#FFC107]/40 to-[#FFC107] pointer-events-none"></div>
               
               <div className="space-y-6 relative">
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 pl-4">📍 Pickup Point (A)</p>
                   <LocationSearchInput
                     value={homePickup}
                     onChange={setHomePickup}
                     onSelect={(coord: any) => setHomePickupCoords(coord)}
                     placeholder="Enter pickup address or locating GPS..."
                     focusColor={{
                       border: "border-blue-500/20",
                       activeBorder: "border-blue-400",
                       dot: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]",
                       ring: "focus:ring-blue-500/30"
                     }}
                     setSelectionMode={setSelectionMode}
                     mode="pickup"
                   />
                 </div>

                 {isAutoLocating && (
                   <div className="flex items-center gap-2 px-6 justify-start text-[10px] font-black text-[#FFC107] uppercase tracking-wider animate-pulse pt-1">
                     <LocateFixed className="w-4 h-4 animate-spin text-blue-400" /> Auto-detecting live GPS coordinates...
                   </div>
                 )}

                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#FFC107] mb-2 pl-4">🏁 Drop Point (B)</p>
                   <LocationSearchInput
                     value={homeDrop}
                     onChange={setHomeDrop}
                     onSelect={(coord: any) => setHomeDropCoords(coord)}
                     placeholder="Search drop-off destination..."
                     focusColor={{
                       border: "border-yellow-500/20",
                       activeBorder: "border-yellow-400",
                       dot: "bg-yellow-400 shadow-[0_0_8px_rgba(255,193,7,0.8)]",
                       ring: "focus:ring-yellow-400/30"
                     }}
                     setSelectionMode={setSelectionMode}
                     mode="drop"
                   />
                 </div>
               </div>
            </div>

            {/* Quick Favorites & Bihar Regional Hotspots */}
            <div className="relative z-10 flex-grow mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 pl-1">📌 Popular Stops & Recent Searches</p>
              <div className="grid grid-cols-1 gap-3.5 max-h-[320px] overflow-y-auto no-scrollbar pr-1">
                {[
                  { title: "Patna Junction", city: "Patna", subName: "Main Railway Station Terminus", lat: 25.6024, lng: 85.1376 },
                  { title: "Samastipur Junction", city: "Samastipur", subName: "Central Station Gate Area", lat: 25.8624, lng: 85.7831 },
                  { title: "Darbhanga Tower", city: "Darbhanga", subName: "Iconic commercial crossroad", lat: 26.1558, lng: 85.8970 },
                  { title: "Gandhi Maidan", city: "Patna", subName: "Socio-political central park", lat: 25.6174, lng: 85.1432 },
                  { title: "Boring Road crossing", city: "Patna", subName: "Premium student & commercial hub", lat: 25.6133, lng: 85.1111 },
                  { title: "Motijheel Market", city: "Muzaffarpur", subName: "Primary retail bazaar", lat: 26.1215, lng: 85.3940 },
                  { title: "Bodh Gaya temple", city: "Gaya", subName: "World heritage monastery site", lat: 24.6961, lng: 84.9912 }
                ].map((item, id) => (
                  <motion.div
                    key={id}
                    whileHover={{ scale: 1.02, x: 4, backgroundColor: "rgba(255,193,7,0.15)", borderColor: "rgba(255,193,7,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.2 }}
                    onClick={() => {
                      const completeStr = `${item.title}, ${item.city}, Bihar`;
                      if (selectionMode === 'pickup') {
                        setHomePickup(completeStr);
                        setHomePickupCoords({ lat: item.lat, lng: item.lng });
                        setSelectionMode('drop');
                      } else {
                        setHomeDrop(completeStr);
                        setHomeDropCoords({ lat: item.lat, lng: item.lng });
                      }
                    }}
                    className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 bg-[#FFC107]/10 hover:bg-[#FFC107]/20 border border-[#FFC107]/20 text-[#FFC107] rounded-xl flex items-center justify-center shrink-0 transition-colors">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-white font-bold text-sm block truncate tracking-wide">{item.title}</span>
                        <span className="text-white/40 text-[10px] truncate block">{item.subName}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white/10 text-white/60 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono shadow-sm shrink-0">{item.city}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Glowing Confirm Button */}
            <div className="mt-auto relative z-10 pt-4 pb-6">
              <motion.button
                type="button"
                whileHover={homeDrop ? { scale: 1.02 } : {}}
                whileTap={homeDrop ? { scale: 0.98 } : {}}
                disabled={!homeDrop}
                onClick={() => {
                  if (!homeDrop) return;
                  const finalPickup = homePickup || "Current Live Location";
                  
                  // Deduce coordinates for pickup if it was typed but not clicked via suggestion
                  let finalPickupCoords = homePickupCoords;
                  if (!finalPickupCoords) {
                    if (homePickup) {
                      const fall = searchBiharLocations(homePickup);
                      if (fall.length > 0) {
                        finalPickupCoords = { lat: fall[0].lat, lng: fall[0].lng };
                      } else {
                        finalPickupCoords = { lat: 25.5978, lng: 85.1583 }; // Kankarbagh Patna default
                      }
                    } else {
                      finalPickupCoords = { lat: 25.5978, lng: 85.1583 }; // Default
                    }
                  }
                  
                  // Deduce coordinates for drop if it was typed but not clicked via suggestion
                  let finalDropCoords = homeDropCoords;
                  if (!finalDropCoords) {
                     // Check direct dataset fallback for coordinate lookup
                     const fall = searchBiharLocations(homeDrop);
                     if (fall.length > 0) {
                       finalDropCoords = { lat: fall[0].lat, lng: fall[0].lng };
                     } else {
                       // Settle a default inside our radius
                       finalDropCoords = { lat: 25.6024, lng: 85.1376 }; // Patna Junction default
                     }
                  }

                  navigate('/book', {
                     state: {
                       mode: 'custom',
                       pickup: finalPickup,
                       drop: homeDrop,
                       pickupCoords: finalPickupCoords,
                       dropCoords: finalDropCoords,
                       selectionMode: 'drop'
                     }
                  });
                  setIsSearchOverlayOpen(false);
                }}
                className={`w-full py-5 rounded-[24px] text-base font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-3 ${
                  homeDrop 
                    ? "bg-gradient-to-r from-[#FFC107] to-[#FFB300] text-black shadow-[#FFC107]/20 border-t border-white/20"
                    : "bg-white/5 border border-white/5 text-white/20 cursor-not-allowed"
                }`}
              >
                Estimate Fare • Search Captains <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

