import { Link } from "react-router-dom";
import { DEMO_ROUTES } from "../types";
import { RAHI_40_ROUTES } from "../data/pricingDatabase";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Map } from '../components/SmartMapView';
import { LiveCaptains } from '../components/LiveCaptains';
import {
  MapPin,
  PhoneCall,
  ShieldCheck,
  Zap,
  Navigation,
  Sparkles,
  ArrowRight,
  Package,
  Database,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import BottomNav from "../components/BottomNav";

export default function Home() {
  const { currentUser, loading: authLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authLoading) setIsInitializing(false);
    }, 1200); // Premium brief loading pause
    return () => clearTimeout(timer);
  }, [authLoading]);

  const showSkeleton = authLoading || isInitializing;

  if (showSkeleton) {
    return (
      <div className="flex flex-col flex-1 bg-[#0F0F0F] overflow-hidden relative font-sans text-white min-h-screen">
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite linear;
          }
        `}</style>
        
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-[#FACC15]/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-[20%] left-[-20vw] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center justify-center z-10 min-h-[90vh]">
          <div className="text-center space-y-8 mt-12 w-full max-w-4xl mx-auto flex flex-col items-center">
            
            <div className="w-48 h-8 rounded-full bg-white/5 border border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </div>
            
            <div className="space-y-4 flex flex-col items-center w-full mt-8">
               <div className="w-3/4 md:w-1/2 h-16 md:h-20 bg-white/5 rounded-2xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer w-full" />
               </div>
               <div className="w-1/2 md:w-1/3 h-6 md:h-8 bg-white/5 rounded-xl mt-4 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 w-full max-w-4xl mx-auto">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-56 bg-[#1A1A1A]/80 border border-white/5 rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between">
                    <div className="w-14 h-14 bg-white/5 rounded-[20px] mb-6 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    </div>
                    <div>
                      <div className="w-3/4 h-8 bg-white/5 rounded-xl mb-3 relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                      </div>
                      <div className="w-1/2 h-4 bg-white/5 rounded-lg relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                      </div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="pt-12 w-full">
               <div className="w-full max-w-lg mx-auto h-24 bg-[#1A1A1A]/50 rounded-[20px] border border-white/5 overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
               </div>
            </div>

          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-[#0A0A0A] overflow-hidden relative font-sans text-white pb-24">
      {/* Live Map Background */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen overflow-hidden mask-image-gradient">
         <Map 
           defaultCenter={{lat: 25.7796, lng: 84.7499}}
           defaultZoom={14}
           disableDefaultUI={true}
           gestureHandling="none"
           internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
         >
           <LiveCaptains />
         </Map>
         <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-[#0A0A0A]" />
      </div>

      {/* Dynamic Animated Background */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-[#FACC15]/5 rounded-full blur-[150px] pointer-events-none animate-pulse duration-10000 z-0" />
      <div className="absolute top-[20%] left-[-20vw] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay z-0"></div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center justify-center z-10 min-h-[90vh]">
        <div className="text-center space-y-8 mt-12 w-full max-w-4xl mx-auto">
          {/* Location and AI Pills */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A1A]/80 border border-white/10 shadow-sm text-white text-xs font-bold tracking-widest uppercase cursor-default backdrop-blur-md relative overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Current: <span className="text-white/60">Patna Junction</span>
             </div>
             
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-sm text-white/80 text-xs font-bold tracking-widest uppercase hover:bg-white/10 transition-colors cursor-default backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-[#FACC15]" /> Premium Passenger Network
             </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
              Kahan jana hai aaj?
            </h1>
            <p className="text-xl md:text-2xl text-white/50 font-medium">
              {currentUser?.name
                ? `Welcome back, ${currentUser.name.split(" ")[0]} 👋`
                : "Bihar's fastest hyperlocal mobility ecosystem."}
            </p>
          </div>

          {/* Premium Main Action Cards (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 w-full max-w-5xl mx-auto">
            {/* Bike Ride Card */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
               whileHover={{ y: -8 }}
               whileTap={{ scale: 0.98 }}
               className="relative group p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-[#FACC15]/40 transition-colors duration-500"
            >
              <Link
                to="/book"
                className="flex flex-col h-full bg-[#1A1A1A] rounded-[23px] p-6 items-start justify-between relative overflow-hidden transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FACC15]/10 rounded-full blur-[40px] group-hover:bg-[#FACC15]/20 group-hover:scale-150 transition-all duration-700"></div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FACC15] to-[#F5B700] flex items-center justify-center shadow-lg shadow-[#FACC15]/20 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                  <Navigation className="w-7 h-7 text-black transform group-hover:rotate-45 transition-transform duration-500" />
                </div>
                <div className="relative z-10 text-left w-full flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      Bike Ride
                    </h3>
                    <p className="text-white/50 text-sm font-medium">
                      Fastest
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Parcel Card */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
               whileHover={{ y: -8 }}
               whileTap={{ scale: 0.98 }}
               className="relative group p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-blue-500/40 transition-colors duration-500"
            >
              <Link
                to="/parcel"
                className="flex flex-col h-full bg-[#1A1A1A] rounded-[23px] p-6 items-start justify-between relative overflow-hidden transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] group-hover:bg-blue-500/20 group-hover:scale-150 transition-all duration-700"></div>
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:bg-blue-500 transition-colors duration-300">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div className="relative z-10 text-left w-full flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      Parcel
                    </h3>
                    <p className="text-white/50 text-sm font-medium">
                      Delivery
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            {/* Schedule Card */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
               whileHover={{ y: -8 }}
               whileTap={{ scale: 0.98 }}
               className="relative group p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-orange-500/40 transition-colors duration-500"
            >
              <Link
                to="/book"
                className="flex flex-col h-full bg-[#1A1A1A] rounded-[23px] p-6 items-start justify-between relative overflow-hidden transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] group-hover:bg-orange-500/20 group-hover:scale-150 transition-all duration-700"></div>
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:bg-orange-500 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
                </div>
                <div className="relative z-10 text-left w-full flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      Schedule
                    </h3>
                    <p className="text-white/50 text-sm font-medium">
                      Later
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Biz Card */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
               whileHover={{ y: -8 }}
               whileTap={{ scale: 0.98 }}
               className="relative group p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-purple-500/40 transition-colors duration-500"
            >
              <Link
                to="/contact"
                className="flex flex-col h-full bg-[#1A1A1A] rounded-[23px] p-6 items-start justify-between relative overflow-hidden transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] group-hover:bg-purple-500/20 group-hover:scale-150 transition-all duration-700"></div>
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:bg-purple-500 transition-colors duration-300">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div className="relative z-10 text-left w-full flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      Business
                    </h3>
                    <p className="text-white/50 text-sm font-medium">
                      B2B
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* AI Smart Suggestion */}
          <div className="pt-8">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-[#FACC15]/20 rounded-2xl p-4 shadow-[0_0_30px_rgba(250,204,21,0.05)] w-full max-w-lg mx-auto flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 bg-[#FACC15]/20 rounded-xl flex items-center justify-center shrink-0 border border-[#FACC15]/30">
                <Zap className="w-6 h-6 text-[#FACC15]" />
              </div>
              <div className="text-left flex-1">
                <h4 className="text-white font-bold text-sm">
                  Smart Suggestion
                </h4>
                <p className="text-white/60 text-xs">
                  Based on current traffic, taking a bike to Station road will
                  save you 20 mins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fare List Section */}
      <section
        id="fare-list"
        className="py-24 bg-[#1A1A1A] relative z-10 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFD000]/10 border border-[#FFD000]/20 text-xs font-bold text-[#FFD000] uppercase tracking-widest mb-4">
              <Database className="w-3.5 h-3.5" /> Golden Route database
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-sm mb-4">
              Bihar Local - Smart Routes
            </h2>
            <p className="text-xl text-white/50 font-medium max-w-2xl mx-auto">
              Transparent, affordable fixed pricing for daily commutes across Bihar. Driven by low-overhead micro-tariffs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {RAHI_40_ROUTES.slice(0, 4).map((route, i) => (
              <div
                key={route.id}
                className="group relative bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 shadow-xl hover:border-white/20 hover:shadow-[0_0_40px_rgba(250,204,21,0.05)] transition-all duration-300 text-left"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] uppercase font-bold py-1.5 px-3 rounded-full bg-white/5 text-white/50 border border-white/5">
                    Route {route.id}
                  </span>
                  <span className="bg-[#FFD000] text-black px-4 py-1.5 rounded-full font-black text-lg shadow-sm flex-shrink-0">
                    ₹{route.fare}
                  </span>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start relative">
                      <div className="absolute left-3 top-6 bottom-[-20px] w-0.5 bg-gradient-to-b from-[#FFD000] to-transparent border-dashed"></div>
                      <div className="w-6 h-6 rounded-full bg-white/5 border border-[#FFD000] flex items-center justify-center shrink-0 z-10 mt-1">
                        <div className="w-2 h-2 bg-[#FFD000] rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                          Pickup
                        </p>
                        <p className="text-white text-lg font-bold">
                          {route.pickup}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start z-10 relative">
                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/20 flex items-center justify-center shrink-0 mt-1">
                        <div className="w-2 h-2 bg-white/50 rounded-full hover:bg-[#FFD000] transition-colors"></div>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                          Drop
                        </p>
                        <p className="text-white text-lg font-bold">
                          {route.drop}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
                    <Link
                      to={`/book?route=route-${parseInt(route.id, 10)}`}
                      className="flex-1 py-3.5 bg-gradient-to-r from-[#FFD000] to-[#FACC15] text-black uppercase rounded-xl font-bold text-xs tracking-wider text-center shadow-lg shadow-[#FFD000]/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Pricing Jumbotron Redirect */}
          <div className="mt-12 bg-gradient-to-r from-purple-950/20 via-[#121212]/90 to-amber-950/20 border border-[#FFD000]/10 rounded-[40px] p-8 sm:p-12 text-left relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD000]/5 rounded-full blur-[80px]" />
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-400 text-[9px] font-black tracking-widest uppercase">
                      <Zap className="w-3 h-3 text-[#FFD000] animate-pulse" /> Algorithmic price Sandbox
                   </div>
                   <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none uppercase">
                      Interactive Fares & Earning Analytics
                   </h3>
                   <p className="text-white/50 text-sm max-w-2xl font-medium">
                      Simulate arbitrary distances, toggle weather alerts, examine live approaches with premium Web Audio-pings, and model our high-volume investor payouts across Bihar's 40 core operational sectors.
                   </p>
                </div>

                <Link
                  to="/pricing"
                  className="px-8 py-5 bg-[#FFD000] text-black font-black text-xs uppercase tracking-widest rounded-2xl shrink-0 shadow-xl shadow-[#FFD000]/10 transition-transform active:scale-95 hover:scale-105 hover:bg-[#FACC15] text-center"
                >
                   Launch Fares Hub & Exporter
                </Link>
             </div>
          </div>

        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-24 bg-[#0F0F0F] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#FACC15]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <div className="bg-[#1A1A1A] border border-white/5 p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FACC15]/10 rounded-full blur-[50px]"></div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Enterprise Support
            </h2>
            <p className="text-white/50 text-lg md:text-xl font-medium mb-10">
              Office Address: Swastik Store, Above India1 ATM, Mahaveer Chowk
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="tel:8252988672"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors flex items-center justify-center gap-3 backdrop-blur-md"
              >
                <PhoneCall className="w-5 h-5 text-[#FACC15]" /> +91 8252988672
              </a>
              <a
                href="https://wa.me/918252988672?text=Hello%20RAHI,%20mujhe%20bike%20ride%20book%20karni%20hai"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-3"
              >
                WhatsApp Chat
              </a>
            </div>
          </div>
        </div>
      </section>

      {currentUser && currentUser.role === "customer" && <BottomNav />}
    </div>
  );
}
