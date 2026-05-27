import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Booking } from '../types';
import { Map, Marker } from '../components/SmartMapView';
import { RouteDisplay } from '../components/MapFeatures';
import { Power, MapPin, Navigation, IndianRupee, ShieldCheck, CheckCircle2, User, Star, TrendingUp, Compass, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BottomNav from '../components/BottomNav';

export default function CaptainDashboard() {
  const { currentUser } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [activeRequest, setActiveRequest] = useState<Booking | null>(null);
  const [currentRide, setCurrentRide] = useState<Booking | null>(null);

  // Daily earnings mock
  const earnings = 540;
  const ridesCompleted = 8;
  const rating = 4.9;

  // Listen for incoming requests when online
  useEffect(() => {
    if (!currentUser || !isOnline || currentRide) {
      if (!isOnline) setActiveRequest(null);
      return;
    }

    const q = query(collection(db, 'bookings'), where('status', '==', 'searching'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => d.data() as Booking);
      if (docs.length > 0) {
        setActiveRequest(docs[0]);
      } else {
        setActiveRequest(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser, isOnline, currentRide]);

  // Listen for current active ride
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'bookings'), 
      where('assignedRiderId', '==', currentUser.uid),
      where('status', '==', 'accepted')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => d.data() as Booking);
      if (docs.length > 0) {
        setCurrentRide(docs[0]);
        setActiveRequest(null);
      } else {
        setCurrentRide(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAcceptRide = async (bookingId: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'accepted',
        assignedRiderId: currentUser.uid,
        assignedRiderName: currentUser.name
      });
    } catch (err) {
      console.error("Failed to accept ride", err);
    }
  };

  const handleCompleteRide = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'completed'
      });
      setCurrentRide(null);
    } catch (err) {
      console.error("Failed to complete ride", err);
    }
  };

  return (
    <div className="flex-1 bg-[#050505] min-h-screen font-sans">
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#0A0A0A] shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative flex flex-col pb-24 overflow-x-hidden">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-0 right-[-100px] w-[350px] h-[350px] bg-green-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-[-100px] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

      {/* Header */}
      <header className="bg-[#0A0A0A]/80 backdrop-blur-3xl border-b border-white/5 p-6 z-40 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#121212] rounded-[20px] flex items-center justify-center border border-white/10 relative overflow-hidden shadow-inner">
               <img src="/favicon.svg" alt="Profile" className="w-10 h-10 opacity-90 rounded-full" />
               <motion.div 
                 animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-[2.5px] border-[#0A0A0A] ${isOnline ? 'bg-[#00DF89] shadow-[0_0_10px_#00DF89]' : 'bg-red-500'}`}
               ></motion.div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">{currentUser?.name?.split(' ')[0] || 'Captain'}</h1>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-white/50 font-black tracking-widest uppercase bg-white/5 px-2 py-0.5 rounded-full border border-white/5 w-fit">
                <Star className="w-3 h-3 text-[#FFD000] fill-[#FFD000]" /> {rating} Rating
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isOnline 
                ? 'bg-[#00DF89]/10 text-[#00DF89] border border-[#00DF89]/30 hover:bg-[#00DF89]/20 shadow-[0_0_20px_rgba(0,223,137,0.2)]' 
                : 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20'
            }`}
          >
            <Power className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto no-scrollbar">
        
        {/* Earnings Dashboard (Hide when riding) */}
        {!currentRide && !activeRequest && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
            <div className="bg-[#121212] border border-white/5 rounded-[36px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group">
               <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-green-500/10 rounded-full blur-[40px] group-hover:bg-green-500/20 transition-all"></div>
               <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingUp className="w-3 h-3 text-[#00DF89]" /> Daily Goal Progress</p>
               <h2 className="text-6xl font-black text-white tracking-tighter flex items-center gap-2 drop-shadow-md">
                 <span className="text-[#00DF89]">₹</span>{earnings}
               </h2>
               
               <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                 <div className="bg-[#0A0A0A] rounded-[20px] p-4 border border-white/5 shadow-inner">
                   <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1.5">Trips Comp.</p>
                   <p className="text-2xl font-black text-white">{ridesCompleted}</p>
                 </div>
                 <div className="bg-[#0A0A0A] rounded-[20px] p-4 border border-white/5 shadow-inner">
                   <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1.5">Online Hours</p>
                   <p className="text-2xl font-black text-white">4.5h</p>
                 </div>
               </div>
            </div>

            {isOnline ? (
               <div className="h-64 rounded-[36px] border border-white/5 flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#00DF89]/5 to-transparent pointer-events-none"></div>
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute w-[200px] h-[200px] border-2 border-[#00DF89]/30 rounded-full"
                  ></motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                    className="absolute w-[100px] h-[100px] border-2 border-[#00DF89]/50 rounded-full"
                  ></motion.div>
                  
                  <div className="w-16 h-16 bg-[#00DF89]/10 rounded-full flex items-center justify-center mb-6 border border-[#00DF89]/30 shadow-[0_0_20px_rgba(0,223,137,0.2)] z-10">
                     <Compass className="w-8 h-8 text-[#00DF89] animate-spin-slow" style={{ animationDuration: '4s' }} />
                  </div>
                  <p className="text-[#00DF89] font-black uppercase tracking-widest text-xs z-10">Scanning Zone Area...</p>
               </div>
            ) : (
               <div className="h-64 rounded-[36px] border border-white/5 flex flex-col items-center justify-center bg-[#0A0A0A] shadow-inner">
                  <ShieldCheck className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-white/30 font-black uppercase tracking-widest text-[10px] text-center px-8">System Offline.<br/>Engage to receive dispatch.</p>
               </div>
            )}
          </motion.div>
        )}

        {/* Incoming Request Card */}
        <AnimatePresence>
          {activeRequest && !currentRide && (
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col"
            >
              <div className="flex-1 relative bg-[#1A1A1A]">
                <Map 
                   defaultCenter={{lat: 25.7796, lng: 84.7499}}
                   defaultZoom={13}
                   disableDefaultUI={true}
                   gestureHandling="none"
                   internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                >
                  <Marker position={{lat: 25.7796, lng: 84.7499}} />
                </Map>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent pointer-events-none"></div>
                <div className="absolute top-10 flex justify-center w-full pointer-events-none">
                  <div className="bg-[#FFD000] text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-[0_10px_25px_rgba(255,208,0,0.4)] animate-bounce border border-black/10">
                     New Dispatch Request
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0A0A] p-8 flex flex-col rounded-t-[48px] -mt-12 relative z-20 border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.6)]">
                <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-8">
                  <div>
                    <h3 className="text-5xl font-black text-[#FFD000] tracking-tighter drop-shadow-md">₹{activeRequest.fare || 'TBD'}</h3>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">Est. Payout</p>
                  </div>
                  <div className="text-right bg-[#121212] py-3 px-5 rounded-[20px] border border-white/5 shadow-inner">
                    <p className="text-white text-xl font-black">{activeRequest.distanceKm || '12'} <span className="text-[12px]">km</span></p>
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-1">Distance</p>
                  </div>
                </div>

                <div className="space-y-8 mb-10 flex-1 relative">
                  <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#00DF89] to-[#FFD000] border-dashed"></div>
                  
                  <div className="flex gap-5 items-start relative z-10">
                     <div className="w-8 h-8 rounded-full bg-[#121212] border-2 border-[#00DF89] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,223,137,0.2)]">
                       <div className="w-2.5 h-2.5 bg-[#00DF89] rounded-full"></div>
                     </div>
                     <div>
                       <p className="text-[#00DF89]/60 text-[9px] font-black uppercase tracking-widest mb-1">Pickup Location</p>
                       <p className="text-white font-bold text-sm tracking-wide leading-tight">{activeRequest.pickupName}</p>
                     </div>
                  </div>
                  
                  <div className="flex gap-5 items-start relative z-10">
                     <div className="w-8 h-8 rounded-full bg-[#121212] border-2 border-[#FFD000] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,208,0,0.2)]">
                       <div className="w-2.5 h-2.5 bg-[#FFD000] rounded-full"></div>
                     </div>
                     <div>
                       <p className="text-[#FFD000]/60 text-[9px] font-black uppercase tracking-widest mb-1">Drop Location</p>
                       <p className="text-white font-bold text-sm tracking-wide leading-tight">{activeRequest.dropName}</p>
                     </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveRequest(null)}
                    className="flex-1 py-5 bg-[#121212] text-white border border-white/10 font-black text-[11px] uppercase tracking-widest rounded-[24px] hover:bg-white/5 active:scale-95 transition-all shadow-inner"
                  >
                    Decline
                  </button>
                  <button 
                    onClick={() => handleAcceptRide(activeRequest.bookingId)}
                    className="flex-[2] py-5 bg-gradient-to-r from-[#FFD000] to-[#F5B700] text-black font-black text-[11px] uppercase tracking-widest rounded-[24px] shadow-[0_15px_30px_rgba(255,208,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2 group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                    Accept Dispatch <Navigation className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Ride UI */}
        <AnimatePresence>
          {currentRide && (
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col"
            >
               <div className="flex-1 relative bg-[#1A1A1A]">
                  <Map 
                    defaultCenter={{lat: 25.7796, lng: 84.7499}}
                    defaultZoom={15}
                    disableDefaultUI={true}
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  >
                    <Marker position={{lat: 25.7796, lng: 84.7499}} />
                  </Map>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none"></div>
                  
                  {/* Floating directions header */}
                  <div className="absolute top-10 left-6 right-6 bg-[#0A0A0A]/95 backdrop-blur-xl rounded-[28px] p-5 border border-[#00DF89]/30 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                     <div>
                       <p className="text-[#00DF89] font-black uppercase tracking-widest text-[10px] mb-1">Navigating to Drop</p>
                       <p className="text-white font-bold text-sm truncate max-w-[200px]">{currentRide.dropName}</p>
                     </div>
                     <div className="w-14 h-14 bg-[#00DF89]/10 rounded-full flex items-center justify-center border border-[#00DF89]/20">
                        <Navigation className="w-6 h-6 text-[#00DF89]" />
                     </div>
                  </div>
               </div>

               <div className="bg-[#0A0A0A] p-8 flex flex-col rounded-t-[48px] -mt-12 relative z-20 border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.6)]">
                  <div className="flex justify-between items-center mb-8 bg-[#121212] p-4 rounded-[28px] border border-white/5 shadow-inner">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#FFD000] to-[#F5B700] rounded-[20px] p-[2px] shadow-[0_0_15px_rgba(255,208,0,0.3)]">
                         <div className="w-full h-full bg-[#1A1A1A] rounded-[18px] flex items-center justify-center border border-[#121212]">
                            <User className="w-6 h-6 text-[#FFD000]" />
                         </div>
                      </div>
                      <div>
                        <h4 className="text-white font-black text-lg">{currentRide.customerName}</h4>
                        <p className="text-[#FFD000] text-[9px] font-black uppercase tracking-widest mt-1 bg-[#FFD000]/10 px-2 py-0.5 rounded-md inline-block">Passenger</p>
                      </div>
                    </div>
                    <a href={`tel:${currentRide.customerMobile}`} className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 hover:bg-blue-500/20 active:scale-95 transition-all shadow-lg group">
                       <PhoneCall className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="bg-gradient-to-br from-[#121212] to-[#1A1A1A] rounded-[28px] p-6 border border-white/5 shadow-[0_10px_20px_rgba(0,0,0,0.3)] text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full blur-[20px]"></div>
                        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">Collect Cash</p>
                        <p className="text-4xl font-black text-white tracking-tighter">₹{currentRide.fare}</p>
                     </div>
                     <div className="bg-gradient-to-br from-[#121212] to-[#1A1A1A] rounded-[28px] p-6 border border-white/5 shadow-[0_10px_20px_rgba(0,0,0,0.3)] text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFD000]/5 rounded-full blur-[20px]"></div>
                        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">OTP PIN</p>
                        <p className="text-4xl font-black font-mono text-[#FFD000] drop-shadow-md">{currentRide.rideOtp}</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => handleCompleteRide(currentRide.bookingId)}
                    className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-black text-[12px] uppercase tracking-widest rounded-[24px] shadow-[0_15px_30px_rgba(34,197,94,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2 group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                    <CheckCircle2 className="w-5 h-5 mr-1" /> Mark Trip Completed
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      <BottomNav />
      </div>
    </div>
  );
}
