import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Map } from '../components/SmartMapView';
import { LiveCaptains } from '../components/LiveCaptains';
import {
  MapPin, PhoneCall, ShieldCheck, Zap, Navigation, Sparkles, ArrowRight,
  Package, Database, Search, Clock, CarTaxiFront, LocateFixed,
  CloudSun, Bell, Mic, Briefcase, Wallet, Heart, History, Bookmark,
  ChevronRight, TrendingUp, CircleAlert, Map as MapIcon,
  Crown, Bike, PackageOpen
} from "lucide-react";
import { useAuth } from "../lib/auth";
import BottomNav from "../components/BottomNav";

export default function Home() {
  const { currentUser, loading: authLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authLoading) setIsInitializing(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [authLoading]);

  // Loading shimmer state
  if (authLoading || isInitializing) {
     return (
        <div className="flex-1 bg-[#050505] min-h-screen pt-4 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
           <div className="max-w-md mx-auto min-h-[85vh] bg-[#0A0A0A] rounded-[48px] shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-white/5 overflow-hidden relative flex flex-col mt-4">
             <div className="flex-1 p-6 flex flex-col gap-6 animate-pulse mt-8">
               <div className="flex justify-between items-center mb-4">
                 <div className="w-14 h-14 bg-white/5 rounded-[20px]" />
                 <div className="w-32 h-6 bg-white/5 rounded-full" />
               </div>
               <div className="w-48 h-10 bg-white/5 rounded-full mb-6" />
               <div className="w-full h-20 bg-white/5 rounded-[28px]" />
               <div className="w-full h-48 bg-white/5 rounded-[36px]" />
               <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-white/5 rounded-[28px]" />
                  <div className="h-32 bg-white/5 rounded-[28px]" />
               </div>
             </div>
           </div>
        </div>
     );
  }

  return (
    <div className="flex-1 bg-[#050505] min-h-screen pt-4 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md mx-auto min-h-[85vh] bg-[#0A0A0A] rounded-[48px] shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-white/5 overflow-hidden relative flex flex-col mt-4">
        
        {/* Cinematic Live Map Background Header */}
        <div className="absolute top-0 left-0 w-full h-[350px] z-0 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}>
           <Map 
             defaultCenter={{lat: 25.5941, lng: 85.1376}} // Patna
             defaultZoom={14}
             disableDefaultUI={true}
             gestureHandling="none"
             internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
             styles={[
               { elementType: "geometry", stylers: [{ color: "#000000" }] },
               { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
               { elementType: "labels.text.fill", stylers: [{ color: "#FFD000" }] },
               { featureType: "road", elementType: "geometry", stylers: [{ color: "#1A1A1A" }] },
               { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#FFD000", weight: 0.5 }] },
               { featureType: "water", elementType: "geometry", stylers: [{ color: "#050505" }] }
             ]}
           >
             <LiveCaptains />
           </Map>
           <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-[#0A0A0A]/80 to-[#0A0A0A] backdrop-blur-[2px]" />
        </div>

        {/* Floating Ambient Glows */}
        <div className="absolute top-0 right-[-50px] w-[300px] h-[300px] bg-[#FFD000]/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen z-0" />
        <div className="absolute bottom-[20%] left-[-100px] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none mix-blend-screen z-0" />

        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-20">
          
          {/* 1. TOP HEADER AREA */}
          <div className="px-6 pt-10 pb-4 flex justify-between items-center relative">
            <div className="flex items-center gap-3">
               <motion.div 
                 whileHover={{ scale: 1.05 }}
                 className="w-14 h-14 bg-gradient-to-br from-[#FFD000] to-[#F5B700] rounded-[20px] p-[2px] shadow-[0_10px_20px_rgba(255,208,0,0.2)] cursor-pointer"
               >
                 <div className="w-full h-full bg-[#1A1A1A] rounded-[18px] flex items-center justify-center border border-[#121212] overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${currentUser?.name || 'R'}&background=1A1A1A&color=FFD000&bold=true`} alt="Avatar" className="w-full h-full object-cover" />
                 </div>
               </motion.div>
               <div>
                 <p className="text-[#FFD000] text-[9px] font-black tracking-widest uppercase flex items-center gap-1">
                   <LocateFixed className="w-3 h-3" /> Patna, BR
                 </p>
                 <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                   {currentUser?.name ? `Hi, ${currentUser.name.split(" ")[0]}` : "Good Evening"} <span className="text-lg">👋</span>
                 </h1>
               </div>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="w-10 h-10 bg-[#121212]/80 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center shadow-inner relative cursor-pointer hover:bg-white/5 transition-colors">
                 <CloudSun className="w-4 h-4 text-white/70" />
                 <span className="absolute -top-1 -right-1 text-[8px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded-full">28°</span>
               </div>
               <div className="w-10 h-10 bg-[#121212]/80 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center shadow-inner relative cursor-pointer hover:bg-white/5 transition-colors">
                 <Bell className="w-4 h-4 text-white/70" />
                 <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#121212]"></span>
               </div>
            </div>
          </div>

          {/* 2. HERO / SEARCH SECTION */}
          <div className="px-6 py-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => navigate('/book')}
               className="w-full bg-[#121212]/90 backdrop-blur-2xl border border-white/10 hover:border-[#FFD000]/50 rounded-[28px] p-4 flex items-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] cursor-text group relative overflow-hidden transition-all"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFD000]/0 via-[#FFD000]/5 to-[#FFD000]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-inner border border-white/5 group-hover:bg-[#FFD000]/10 transition-colors shrink-0">
                  <Search className="w-5 h-5 text-[#FFD000]" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-black text-lg tracking-tight">Kahan jana hai?</p>
                  <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase">Search destination</p>
                </div>
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors shrink-0">
                   <MapIcon className="w-4 h-4 text-white/50" />
                </div>
             </motion.div>

             {/* Quick Actions Base */}
             <div className="flex gap-3 mt-5 overflow-x-auto no-scrollbar pb-2">
                {[
                  { icon: <MapPin className="w-4 h-4" />, label: 'Home', sub: 'Kankarbagh' },
                  { icon: <Briefcase className="w-4 h-4" />, label: 'Work', sub: 'Frazer Rd' },
                  { icon: <History className="w-4 h-4" />, label: 'Recent', sub: 'PMCH' }
                ].map((action, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    key={i}
                    onClick={() => navigate('/book')}
                    className="flex-shrink-0 bg-[#1A1A1A]/80 backdrop-blur-md border border-white/5 hover:bg-white/5 rounded-[20px] p-3 flex items-center gap-3 cursor-pointer min-w-[140px] shadow-sm hover:shadow-md transition-shadow"
                  >
                     <div className="w-10 h-10 bg-[#121212] rounded-full flex items-center justify-center shadow-inner border border-white/5 text-white/70">
                       {action.icon}
                     </div>
                     <div>
                       <p className="text-white font-bold text-sm tracking-wide">{action.label}</p>
                       <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">{action.sub}</p>
                     </div>
                  </motion.div>
                ))}
             </div>
          </div>

          <div className="px-6 space-y-6 mt-2">
            
            {/* 3. MAIN SERVICES (Floating 3D Cards) */}
            <h2 className="text-[10px] text-white/40 font-black uppercase tracking-widest pl-2 flex items-center gap-2"><Sparkles className="w-3 h-3 text-[#FFD000]"/> RAHI Services</h2>
                     <div className="grid grid-cols-2 gap-4">
               {/* 1. BIKE RIDE */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 whileHover={{ y: -5 }}
                 onClick={() => navigate('/book')}
                 className="col-span-2 bg-[#121212] border border-[#FFD000]/20 rounded-[32px] overflow-hidden shadow-[0_20px_40px_rgba(255,208,0,0.05)] relative group cursor-pointer"
               >
                 <div className="absolute inset-0 bg-[#0A0A0A]/40 z-10 group-hover:bg-[#0A0A0A]/20 transition-all duration-500 pointer-events-none"></div>
                 <img src="https://images.unsplash.com/photo-1622185135505-2d795003994a?auto=format&fit=crop&q=80&w=800" alt="Bike Ride Background" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-700 ease-out" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10 pointer-events-none"></div>
                 <div className="absolute inset-0 bg-gradient-to-r from-[#FFD000]/20 to-transparent mix-blend-overlay z-10 pointer-events-none group-hover:opacity-100 transition-opacity"></div>
                 
                 <div className="relative z-20 p-6 flex flex-col justify-end h-full min-h-[220px]">
                   <div className="w-14 h-14 bg-black/50 backdrop-blur-md rounded-[20px] flex items-center justify-center mb-4 shadow-[0_4px_20px_rgba(255,208,0,0.2)] border border-[#FFD000]/50 group-hover:bg-[#FFD000] transition-colors duration-300">
                     <Bike className="w-7 h-7 text-[#FFD000] drop-shadow-md group-hover:text-black transition-colors" />
                   </div>
                   <h3 className="text-white text-3xl font-black tracking-tight mb-2 drop-shadow-md">Book Ride</h3>
                   <p className="text-white/80 text-sm font-medium tracking-wide max-w-[70%] drop-shadow-lg">Fast, affordable premium bike rides in minutes.</p>
                 </div>
               </motion.div>

               {/* 2. PARCEL DELIVERY */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 whileHover={{ y: -5 }}
                 onClick={() => navigate('/parcel')}
                 className="bg-[#121212] border border-blue-500/20 rounded-[32px] overflow-hidden shadow-lg relative group cursor-pointer min-h-[200px]"
               >
                 <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-all duration-500"></div>
                 <img src="https://images.unsplash.com/photo-1566576912321-d58edd7a28fa?auto=format&fit=crop&q=80&w=600" alt="Parcel Delivery" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-700 ease-out" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 pointer-events-none"></div>

                 <div className="relative z-20 p-5 flex flex-col justify-end h-full">
                    <div className="w-12 h-12 bg-black/50 backdrop-blur-md border border-blue-500/50 rounded-[16px] flex items-center justify-center mb-3 shadow-inner group-hover:bg-blue-500 transition-colors">
                        <PackageOpen className="w-6 h-6 text-blue-400 group-hover:text-white drop-shadow-md transition-colors" />
                    </div>
                    <h3 className="text-white font-black text-xl tracking-tight mb-1 drop-shadow-md">Send Parcel</h3>
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest drop-shadow-md">Instant Delivery</p>
                 </div>
               </motion.div>

               {/* 3. BUSINESS DELIVERY */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 whileHover={{ y: -5 }}
                 onClick={() => navigate('/parcel')}
                 className="bg-[#121212] border border-purple-500/20 rounded-[32px] overflow-hidden shadow-lg relative group cursor-pointer min-h-[200px]"
               >
                 <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-all duration-500"></div>
                 <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600" alt="Business Logistics" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-700 ease-out" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 pointer-events-none"></div>

                 <div className="relative z-20 p-5 flex flex-col justify-end h-full">
                    <div className="w-12 h-12 bg-black/50 backdrop-blur-md border border-purple-500/50 rounded-[16px] flex items-center justify-center mb-3 shadow-inner group-hover:bg-purple-500 transition-colors">
                        <Briefcase className="w-6 h-6 text-purple-400 group-hover:text-white drop-shadow-md transition-colors" />
                    </div>
                    <h3 className="text-white font-black text-xl tracking-tight mb-1 drop-shadow-md">Business</h3>
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest drop-shadow-md">Logistics Fleet</p>
                 </div>
               </motion.div>

               {/* 4. SCHEDULE RIDE */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 whileHover={{ y: -5 }}
                 onClick={() => navigate('/book')}
                 className="col-span-2 bg-[#121212] border border-emerald-500/20 rounded-[32px] overflow-hidden shadow-lg relative group cursor-pointer h-[140px]"
               >
                 <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-all duration-500"></div>
                 <img src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800" alt="Schedule Ride" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 object-center transition-all duration-700 ease-out" />
                 <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none"></div>

                 <div className="relative z-20 p-5 flex items-center h-full gap-4">
                    <div className="w-14 h-14 bg-black/50 backdrop-blur-md border border-emerald-500/50 rounded-[16px] flex items-center justify-center shadow-inner group-hover:bg-emerald-500 transition-colors">
                        <Clock className="w-7 h-7 text-emerald-400 group-hover:text-white drop-shadow-md transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-2xl tracking-tight mb-1 drop-shadow-md">Schedule Ride</h3>
                      <p className="text-white/70 text-[10px] font-black uppercase tracking-widest drop-shadow-md">Plan perfect departures</p>
                    </div>
                 </div>
               </motion.div>
            </div>

            {/* 4. AI SMART ASSISTANT */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/ai-help')}
              className="mt-6 bg-[#121212] border border-blue-500/30 hover:border-blue-500/50 rounded-[32px] shadow-[0_20px_40px_rgba(59,130,246,0.15)] relative overflow-hidden group cursor-pointer flex items-center backdrop-blur-md transition-all duration-300 min-h-[120px]"
            >
               <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-all duration-500"></div>
               <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800" alt="AI Orb" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen group-hover:scale-110 transition-all duration-700 ease-out" />
               <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-900/40 to-transparent z-10 pointer-events-none"></div>
               
               <div className="relative z-20 flex items-center gap-5 p-6 w-full">
                 <div className="relative shrink-0">
                   <div className="absolute inset-0 bg-blue-500/50 rounded-[20px] blur-md animate-ping"></div>
                   <div className="w-14 h-14 bg-black/40 backdrop-blur-md rounded-[20px] flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] relative z-10 border border-blue-500/50 group-hover:bg-blue-500/20 transition-colors">
                      <Zap className="w-6 h-6 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                   </div>
                 </div>
                 <div className="flex-1">
                    <h4 className="text-white font-black text-xl tracking-tight mb-1 flex items-center gap-2 drop-shadow-md">RAHI AI <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-pulse"></span></h4>
                    <p className="text-blue-100 text-xs font-medium italic drop-shadow-md">Holographic voice assistant</p>
                 </div>
                 <ChevronRight className="w-5 h-5 text-blue-400/80 group-hover:translate-x-1 transition-transform" />
               </div>
            </motion.div>

            {/* 5. WALLET & OFFERS SECTION */}
            <h2 className="text-[10px] text-white/40 font-black uppercase tracking-widest pl-2 mt-8 mb-4">Wallet & Rewards</h2>
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               onClick={() => navigate('/wallet')}
               className="bg-[#0A0A0A] border border-[#FFD000]/30 hover:border-[#FFD000]/50 rounded-[32px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.6)] relative group cursor-pointer transition-colors min-h-[160px]"
            >
               <div className="absolute inset-0 bg-black/60 z-10 transition-all duration-500"></div>
               <img src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800" alt="Premium Card" referrerPolicy="no-referrer" className="absolute right-0 top-0 w-2/3 h-full object-cover opacity-50 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-700 ease-out object-right" />
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none"></div>

               <div className="relative z-20 p-6">
                 <div className="flex justify-between items-start mb-6">
                   <div>
                     <p className="text-[#FFD000] text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1 drop-shadow-md"><Sparkles className="w-3 h-3 text-[#FFD000]" /> RAHI Wallet</p>
                     <h3 className="text-white text-4xl font-black tracking-tighter drop-shadow-md">₹450<span className="text-xl text-white/50">.00</span></h3>
                   </div>
                   <div className="w-14 h-14 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-[#FFD000]/40 shadow-[0_4px_15px_rgba(255,208,0,0.15)] group-hover:bg-[#FFD000] transition-colors">
                     <Wallet className="w-6 h-6 text-[#FFD000] group-hover:text-black transition-colors" />
                   </div>
                 </div>
                 
                 <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                    <div className="bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-[16px] text-xs font-bold text-white flex items-center gap-2 tracking-wide shadow-sm">
                       <TrendingUp className="w-4 h-4 text-[#00DF89]" /> +120 PTS
                    </div>
                    <div className="bg-[#FFD000]/10 backdrop-blur-md border border-[#FFD000]/30 px-4 py-2.5 rounded-[16px] text-xs font-black text-[#FFD000] flex items-center gap-2 uppercase tracking-widest shadow-sm group-hover:bg-[#FFD000]/20 transition-colors">
                       Premium <Crown className="w-4 h-4" />
                    </div>
                 </div>
               </div>
            </motion.div>

            {/* 6. SAFETY SECTION */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => window.location.href = "tel:8252988672"}
               className="bg-[#121212] border border-red-500/20 hover:border-red-500/40 rounded-[32px] overflow-hidden shadow-[0_20px_40px_rgba(239,68,68,0.05)] relative group cursor-pointer transition-all mt-6 mb-8 min-h-[100px]"
            >
               <div className="absolute inset-0 bg-red-900/10 z-10 transition-all duration-500"></div>
               <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" alt="Safety shield blur" referrerPolicy="no-referrer" className="absolute right-0 top-0 w-1/2 h-full object-cover opacity-30 mix-blend-screen group-hover:scale-105 transition-all duration-700 ease-out" />
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none"></div>

               <div className="relative z-20 p-5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-[18px] flex items-center justify-center border border-red-500/50 group-hover:bg-red-500 transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.2)]">
                      <ShieldCheck className="w-6 h-6 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-lg tracking-tight mb-0.5 drop-shadow-md">Safety Center</h3>
                      <p className="text-white/60 text-[9px] font-black uppercase tracking-widest drop-shadow-md">24/7 SOS Protection</p>
                    </div>
                 </div>
                 <div className="bg-black/50 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center border border-white/10 group-hover:border-red-500/30 transition-colors">
                    <CircleAlert className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                 </div>
               </div>
            </motion.div>

          </div>
        </div>
        
        <BottomNav />
      </div>
    </div>
  );
}

