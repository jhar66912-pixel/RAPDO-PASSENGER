import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Booking } from '../types';
import { Map, Marker } from '../components/SmartMapView';
import { RouteDisplay } from '../components/MapFeatures';
import { Power, MapPin, Navigation, IndianRupee, ShieldCheck, CheckCircle2, User, Star } from 'lucide-react';
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
        // Just take the first one for demo
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
    <div className="flex-1 bg-[#050505] min-h-screen text-white font-sans flex flex-col relative overflow-hidden pb-24">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-green-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-[-20vw] w-[60vw] h-[60vw] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Header */}
      <header className="bg-[#0A0A0A]/80 backdrop-blur-3xl border-b border-white/5 p-4 z-40 sticky top-0 md:top-28">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 relative overflow-hidden">
               <img src="https://i.ibb.co/ZzL02NFj/c3e39448-0850-4dca-9c25-f6dd3b1bba6a.png" alt="Profile" className="w-8 h-8 opacity-80" />
               <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0A0A0A] ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">{currentUser?.name?.split(' ')[0] || 'Captain'}</h1>
              <div className="flex items-center gap-1 text-[10px] text-white/50 font-bold tracking-widest uppercase">
                <Star className="w-3 h-3 text-[#FFD000] fill-[#FFD000]" /> {rating} Rating
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${
              isOnline 
                ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                : 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:bg-green-400 hover:scale-105 active:scale-95'
            }`}
          >
            <Power className="w-4 h-4" />
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col pt-8 relative z-10">
        
        {/* Earnings Dashboard (Hide when riding) */}
        {!currentRide && !activeRequest && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD000]/10 rounded-full blur-[40px]"></div>
               <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Today's Earnings</p>
               <h2 className="text-5xl font-black text-white tracking-tighter flex items-center gap-2">
                 <IndianRupee className="w-8 h-8 text-[#FFD000]" />
                 {earnings}
               </h2>
               
               <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                 <div>
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Rides Completed</p>
                   <p className="text-2xl font-black text-white">{ridesCompleted}</p>
                 </div>
                 <div>
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Online Time</p>
                   <p className="text-2xl font-black text-white">4h 20m</p>
                 </div>
               </div>
            </div>

            {isOnline ? (
               <div className="h-64 rounded-[32px] border border-white/5 flex flex-col items-center justify-center bg-[#181818] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                  <div className="absolute w-full h-full border-4 border-green-500/20 rounded-[32px] animate-pulse"></div>
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                     <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <p className="text-green-400 font-bold tracking-wide">Searching for rides nearby...</p>
               </div>
            ) : (
               <div className="h-64 rounded-[32px] border border-white/5 flex flex-col items-center justify-center bg-[#121212]">
                  <ShieldCheck className="w-12 h-12 text-white/20 mb-4" />
                  <p className="text-white/40 font-bold tracking-wide">You are offline. Go online to earn.</p>
               </div>
            )}
          </motion.div>
        )}

        {/* Incoming Request Card */}
        <AnimatePresence>
          {activeRequest && !currentRide && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121212] border border-[#FFD000]/30 rounded-[36px] shadow-[0_30px_60px_rgba(255,208,0,0.15)] overflow-hidden flex flex-col absolute inset-x-4 top-8 bottom-4 z-50"
            >
              <div className="h-1/2 relative bg-[#1A1A1A]">
                <Map 
                   defaultCenter={{lat: 25.7796, lng: 84.7499}}
                   defaultZoom={13}
                   disableDefaultUI={true}
                   gestureHandling="none"
                   internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                >
                  <Marker position={{lat: 25.7796, lng: 84.7499}} />
                </Map>
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent pointer-events-none"></div>
                <div className="absolute top-6 flex justify-center w-full pointer-events-none">
                  <div className="bg-[#FFD000] text-black px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg animate-bounce">
                     New Ride Request
                  </div>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">₹{activeRequest.fare || 'TBD'}</h3>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Est. Payout</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-lg font-bold">{activeRequest.distanceKm || '12'} km</p>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Total Dist.</p>
                  </div>
                </div>

                <div className="space-y-6 mb-8 flex-1">
                  <div className="flex gap-4 items-start relative">
                     <div className="absolute left-3 top-6 bottom-[-20px] w-0.5 bg-gradient-to-b from-[#FFD000] to-transparent border-dashed"></div>
                     <div className="w-6 h-6 rounded-full bg-white/5 border border-[#FFD000] flex items-center justify-center shrink-0 z-10 mt-1">
                       <div className="w-2 h-2 bg-[#FFD000] rounded-full"></div>
                     </div>
                     <div>
                       <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Pickup</p>
                       <p className="text-white font-bold">{activeRequest.pickupName}</p>
                     </div>
                  </div>
                  <div className="flex gap-4 items-start z-10 relative">
                     <div className="w-6 h-6 rounded-full bg-white/5 border border-white/20 flex items-center justify-center shrink-0 mt-1">
                       <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                     </div>
                     <div>
                       <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Drop</p>
                       <p className="text-white font-bold">{activeRequest.dropName}</p>
                     </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-auto">
                  <button 
                    onClick={() => setActiveRequest(null)}
                    className="flex-1 py-5 bg-[#1A1A1A] text-white border border-white/10 font-black text-xs uppercase tracking-widest rounded-[20px] hover:bg-white/10 active:scale-95 transition-all"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAcceptRide(activeRequest.bookingId)}
                    className="flex-[2] py-5 bg-gradient-to-r from-[#FFD000] to-[#F5B700] text-black font-black text-xs uppercase tracking-widest rounded-[20px] shadow-[0_10px_30px_rgba(255,208,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2"
                  >
                    Accept Ride <Navigation className="w-4 h-4" />
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
              initial={{ y: 50, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              className="flex-1 flex flex-col relative h-full bg-[#121212] rounded-[36px] overflow-hidden shadow-2xl border border-white/10"
            >
               <div className="flex-1 relative">
                  <Map 
                    defaultCenter={{lat: 25.7796, lng: 84.7499}}
                    defaultZoom={15}
                    disableDefaultUI={true}
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  >
                    <Marker position={{lat: 25.7796, lng: 84.7499}} />
                  </Map>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent pointer-events-none"></div>
                  
                  {/* Floating directions header */}
                  <div className="absolute top-4 left-4 right-4 bg-[#0A0A0A]/90 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between shadow-2xl">
                     <div>
                       <p className="text-green-400 font-bold tracking-wide">Navigating to Drop...</p>
                       <p className="text-white/50 text-xs truncate max-w-[200px] mt-1">{currentRide.dropName}</p>
                     </div>
                     <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <Navigation className="w-6 h-6 text-green-400" />
                     </div>
                  </div>
               </div>

               <div className="bg-[#1A1A1A] p-8 rounded-t-[36px] border-t border-white/10 -mt-10 relative z-20">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FFD000]/10 rounded-full flex items-center justify-center border border-[#FFD000]/20 text-[#FFD000]">
                         <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">{currentRide.customerName}</h4>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-0.5 border border-white/10 px-2 py-0.5 rounded-full inline-block">Passenger</p>
                      </div>
                    </div>
                    <a href={`tel:${currentRide.customerMobile}`} className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 text-blue-400 hover:scale-105 active:scale-95 transition-transform">
                       📞
                    </a>
                  </div>

                  <div className="bg-[#121212] rounded-[24px] p-5 mb-8 border border-white/5 flex justify-between items-center">
                     <div>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">To Collect</p>
                        <p className="text-3xl font-black text-white">₹{currentRide.fare}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Ride PIN</p>
                        <p className="text-3xl font-black font-mono text-[#FFD000]">{currentRide.rideOtp}</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => handleCompleteRide(currentRide.bookingId)}
                    className="w-full py-5 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-black text-sm uppercase tracking-widest rounded-[20px] shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2"
                  >
                    Mark Ride Completed <CheckCircle2 className="w-5 h-5" />
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      <BottomNav />
    </div>
  );
}
