import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowRight, Sparkles, MapPin, Search, ShieldCheck, Zap, Bike, Battery } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DesignSystem() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('buttons');

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white overflow-x-hidden pb-24">
      {/* Dynamic Background */}
      <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#FFC107]/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
      
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-3xl border-b border-white/5 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-[#FFC107]" /> RAPDO UI Kit
             </h1>
             <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Futuristic 3D Design System</p>
           </div>
           <button onClick={() => navigate(-1)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold transition-colors">
              Back
           </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-12 pb-2">
          {['buttons', 'cards', 'inputs', 'typography', 'loaders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full text-sm font-black tracking-widest uppercase transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-[#FFC107] to-[#FFB300] text-black shadow-[0_0_20px_rgba(255,193,7,0.3)]' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- BUTTONS --- */}
        {activeTab === 'buttons' && (
          <section className="space-y-12">
            <div>
              <h2 className="text-xl font-bold mb-6 text-white/80 border-b border-white/10 pb-4">Primary 3D Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 
                 {/* Standard Primary */}
                 <div className="p-8 bg-[#121212] rounded-[32px] border border-white/5 flex flex-col items-center justify-center gap-4">
                   <motion.button
                     whileHover={{ y: -4, scale: 1.02 }}
                     whileTap={{ y: 2, scale: 0.98 }}
                     className="w-full py-4 rounded-[20px] bg-gradient-to-r from-[#FFC107] to-[#FFB300] text-black font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(255,193,7,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2"
                   >
                     Book Ride <ArrowRight className="w-4 h-4" />
                   </motion.button>
                   <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Standard 3D Primary</p>
                 </div>

                 {/* Success Action */}
                 <div className="p-8 bg-[#121212] rounded-[32px] border border-white/5 flex flex-col items-center justify-center gap-4">
                   <motion.button
                     whileHover={{ y: -4, scale: 1.02 }}
                     whileTap={{ y: 2, scale: 0.98 }}
                     className="w-full py-4 rounded-[20px] bg-gradient-to-r from-[#00DF89] to-emerald-600 text-black font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(0,223,137,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2"
                   >
                     Confirm <ShieldCheck className="w-4 h-4" />
                   </motion.button>
                   <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Success State</p>
                 </div>

                 {/* Premium Glass Button */}
                 <div className="p-8 bg-[#121212] rounded-[32px] border border-white/5 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                   <div className="absolute inset-0 bg-blue-500/10 blur-[20px]" />
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     className="relative z-10 w-full py-4 rounded-[20px] bg-white/5 backdrop-blur-xl border border-white/20 text-white font-black uppercase tracking-widest text-sm shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:bg-white/10 flex items-center justify-center gap-2"
                   >
                     <Zap className="w-4 h-4 text-blue-400" /> Premium Connect
                   </motion.button>
                   <p className="relative z-10 text-[10px] text-white/40 uppercase tracking-widest font-bold">Glassmorphic Secondary</p>
                 </div>

              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6 text-white/80 border-b border-white/10 pb-4">Micro Actions (FABs)</h2>
              <div className="flex flex-wrap gap-6">
                 
                 <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-16 h-16 rounded-[24px] bg-[#1A1A1A] border border-white/10 flex items-center justify-center shadow-lg hover:border-[#FFC107]/50 hover:shadow-[0_0_20px_rgba(255,193,7,0.2)] transition-all text-[#FFC107]">
                   <Search className="w-6 h-6" />
                 </motion.button>

                 <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 border border-red-400/50 flex items-center justify-center shadow-[0_10px_20px_rgba(239,68,68,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)] text-white">
                   <p className="text-[10px] font-black tracking-widest mt-0.5">SOS</p>
                 </motion.button>

              </div>
            </div>
          </section>
        )}

        {/* --- CARDS --- */}
        {activeTab === 'cards' && (
          <section className="space-y-12">
            <h2 className="text-xl font-bold mb-6 text-white/80 border-b border-white/10 pb-4">Glass & 3D Cards</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               
               {/* Dashboard Service Card */}
               <motion.div 
                 whileHover={{ y: -8 }}
                 className="bg-gradient-to-br from-[#1A1A1A] to-[#121212] border border-[#FFC107]/20 rounded-[36px] p-8 shadow-[0_20px_40px_rgba(255,193,7,0.05)] relative overflow-hidden group cursor-pointer"
               >
                 <div className="absolute top-0 right-[-30px] w-48 h-48 bg-[#FFC107]/5 rounded-full blur-[40px] group-hover:bg-[#FFC107]/10 transition-colors" />
                 <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Bike className="w-48 h-48 text-[#FFC107]" />
                 </div>
                 
                 <div className="relative z-10">
                   <div className="w-16 h-16 bg-gradient-to-br from-[#FFC107] to-[#FFB300] rounded-[24px] flex items-center justify-center mb-6 shadow-[0_10px_20px_rgba(255,193,7,0.3)] group-hover:scale-110 transition-transform duration-300 border border-[#FFC107]">
                     <Bike className="w-8 h-8 text-black drop-shadow-sm" />
                   </div>
                   <h3 className="text-white text-3xl font-black tracking-tight mb-2">Ride</h3>
                   <p className="text-white/60 text-sm font-medium tracking-wide max-w-[60%]">Fast, affordable rides in minutes.</p>
                 </div>
               </motion.div>

               {/* EV Status Card (Tesla Inspired) */}
               <motion.div 
                 whileHover={{ y: -8 }}
                 className="bg-[#0A0A0A] border border-white/5 hover:border-emerald-500/30 rounded-[36px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
               >
                  <div className="flex justify-between items-start mb-12">
                     <div>
                       <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"><Zap className="w-3 h-3" /> EV Active</p>
                       <h3 className="text-white text-2xl font-black tracking-tight">RAPDO Electric</h3>
                     </div>
                     <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-400 shadow-[inset_0_2px_10px_rgba(16,185,129,0.2)]">
                        <Battery className="w-6 h-6" />
                     </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-2">
                       <span>Range</span>
                       <span className="text-emerald-400">84% (120 km)</span>
                    </div>
                    <div className="h-2 w-full bg-[#1A1A1A] rounded-full overflow-hidden shadow-inner">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: '84%' }}
                         transition={{ duration: 1.5, ease: 'easeOut' }}
                         className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                       />
                    </div>
                  </div>
               </motion.div>

            </div>
          </section>
        )}

        {/* --- INPUTS --- */}
        {activeTab === 'inputs' && (
          <section className="space-y-12">
            <h2 className="text-xl font-bold mb-6 text-white/80 border-b border-white/10 pb-4">Search & Input Fields</h2>
            
            <div className="max-w-2xl space-y-8">
               {/* Futuristic Search Bar */}
               <div className="relative group">
                 <div className="absolute inset-0 bg-gradient-to-r from-[#FFC107]/20 to-transparent blur-[20px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="relative w-full h-20 bg-[#121212]/90 backdrop-blur-2xl border border-white/10 hover:border-[#FFC107]/50 rounded-[36px] flex items-center px-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] focus-within:border-[#FFC107] focus-within:shadow-[0_0_30px_rgba(255,193,7,0.15)] transition-all overflow-hidden">
                    <Search className="w-8 h-8 text-[#FFC107] shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Enter destination..."
                      className="flex-1 bg-transparent border-none outline-none ml-6 h-full text-lg font-bold text-white placeholder:text-white/30"
                    />
                    <div className="w-12 h-12 bg-white/5 rounded-[20px] flex items-center justify-center border border-white/10 hover:bg-[#FFC107] hover:text-black hover:border-transparent transition-all cursor-pointer">
                      <MapPin className="w-5 h-5" />
                    </div>
                 </div>
               </div>

               {/* Standard Premium Input */}
               <div className="bg-[#1A1A1A] border border-white/10 rounded-[20px] p-2 focus-within:border-blue-500/50 transition-colors relative overflow-hidden">
                 <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 focus-within:opacity-100 transition-opacity" />
                 <label className="text-[9px] font-black uppercase tracking-widest text-white/40 px-3">Mobile Number</label>
                 <input 
                    type="tel"
                    defaultValue="+91 98765 43210"
                    className="w-full bg-transparent border-none outline-none px-3 py-1 font-mono text-lg text-white"
                 />
               </div>
            </div>
          </section>
        )}

        {/* --- TYPOGRAPHY --- */}
        {activeTab === 'typography' && (
          <section className="space-y-12">
            <h2 className="text-xl font-bold mb-6 text-white/80 border-b border-white/10 pb-4">Type Hierarchy</h2>
            
            <div className="space-y-8 bg-[#0A0A0A] p-8 rounded-[36px] border border-white/5">
              <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Display Large (Hero)</p>
                <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter mix-blend-lighten text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50">
                  Speed.
                </h1>
              </div>
              
              <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Heading 1</p>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Kahan chalna hai?</h2>
              </div>

              <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Heading 2 / Card Title</p>
                <h3 className="text-2xl font-black text-white tracking-tight">Premium Ride</h3>
              </div>

              <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Subheading / Badge</p>
                <p className="text-[#FFC107] text-[10px] font-black tracking-widest uppercase">GPS Synced • High Accuracy</p>
              </div>

              <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Body Text</p>
                <p className="text-white/60 text-sm font-medium tracking-wide max-w-md leading-relaxed">
                  Experience the fastest fleet in Bihar. Our dynamic routing architecture ensures you reach your destination securely and efficiently.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* --- LOADERS --- */}
        {activeTab === 'loaders' && (
          <section className="space-y-12">
            <h2 className="text-xl font-bold mb-6 text-white/80 border-b border-white/10 pb-4">Loading States & Shimmers</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Shimmer Card */}
              <div className="bg-[#121212] rounded-[36px] p-8 border border-white/5 relative overflow-hidden">
                <style>{`
                  @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                  .animate-shimmer {
                    animation: shimmer 2s infinite linear;
                  }
                `}</style>
                
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 bg-white/5 rounded-[20px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </div>
                  <div className="w-24 h-6 bg-white/5 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="w-3/4 h-10 bg-white/5 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </div>
                  <div className="w-1/2 h-6 bg-white/5 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              {/* Orbital Loader */}
              <div className="bg-[#0A0A0A] rounded-[36px] p-8 border border-white/5 flex flex-col items-center justify-center min-h-[250px] shadow-inner">
                 <div className="relative w-24 h-24 flex items-center justify-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                      className="absolute inset-0 border-t-2 border-[#FFC107] rounded-full opacity-50"
                    />
                    <motion.div 
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-2 border-r-2 border-[#00DF89] rounded-full opacity-70"
                    />
                    <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white]" />
                 </div>
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-8 animate-pulse">Initializing Subsystems...</p>
              </div>

            </div>
          </section>
        )}

      </main>
    </div>
  );
}
