import React, { useState } from 'react';
import { PackageSearch, MapPin, Navigation, Box, Zap, ArrowRight, ShieldCheck, CheckCircle2, CloudRain, Clock } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../lib/auth';
import { Map, Marker } from '../components/SmartMapView';

export default function Parcel() {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [weight, setWeight] = useState('0-5kg');

  const [isB2bMode, setIsB2bMode] = useState(false);

  return (
    <div className="flex-1 bg-[#0A0A0A] min-h-screen pt-4 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md mx-auto min-h-[85vh] bg-[#121212] rounded-[48px] shadow-2xl border border-white/5 overflow-hidden relative flex flex-col mt-4">
        
        {/* Holographic Glowing Orbs background effect */}
        <div className="absolute top-[-50px] right-[-50px] w-[250px] h-[250px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
        <div className="absolute top-[10%] left-[-50px] w-[200px] h-[200px] bg-indigo-600/10 rounded-full blur-[70px] pointer-events-none mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay"></div>

        <div className="p-8 relative z-10 flex-1 overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
             <div>
                <h1 className="text-2xl font-black text-white tracking-widest flex items-center gap-3 uppercase">
                   {isB2bMode ? 'RAHI B2B' : 'RAHI Parcel'} <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                </h1>
                <p className="text-white/40 text-[11px] font-bold tracking-widest uppercase mt-1">
                   {isB2bMode ? 'Merchant Logistics Console' : 'Hyperlocal delivery network'}
                </p>
             </div>
             <button 
               onClick={() => setIsB2bMode(!isB2bMode)}
               className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all ${isB2bMode ? 'bg-[#FFD000]/10 border border-[#FFD000]/20 text-[#FFD000]' : 'bg-white/5 border border-white/10 text-blue-400 opacity-80 hover:opacity-100'}`}
               title="Toggle Merchant Mode"
              >
                {isB2bMode ? <Box className="w-6 h-6" /> : <PackageSearch className="w-6 h-6" />}
             </button>
          </div>

          {isB2bMode ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out space-y-6">
               <div className="bg-[#1A1A1A] rounded-[24px] border border-[#FFD000]/20 p-5 shadow-lg relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD000]/10 blur-[30px]"></div>
                 <h2 className="text-[#FFD000] font-black text-xs tracking-widest uppercase mb-1">Active SLA</h2>
                 <p className="text-white text-2xl font-black">Patna Pharma Dist.</p>
                 <div className="flex gap-4 mt-4 text-[10px] uppercase font-bold text-white/50 tracking-widest">
                   <div><span className="text-white">14</span> Ongoing</div>
                   <div><span className="text-white">102</span> Today</div>
                 </div>
               </div>

               <button className="w-full py-4 bg-[#FFD000]/10 border border-[#FFD000]/30 hover:bg-[#FFD000]/20 text-[#FFD000] rounded-[20px] font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2">
                 <Zap className="w-4 h-4" /> Bulk Dispatch (Excel Upload)
               </button>

               <div className="space-y-3 mt-8">
                 <h3 className="text-white/40 text-[10px] font-black tracking-widest uppercase mb-4 px-2">Live B2B Connects</h3>
                 {[
                   { id: 'ORD-8821', dest: 'Kankarbagh Medico', status: 'Captain En Route', time: '12 MIN ETA' },
                   { id: 'ORD-8822', dest: 'Boring Rd Diagnostics', status: 'Searching Rider', time: '--' }
                 ].map((order, i) => (
                    <div key={i} className="bg-[#121212] border border-white/5 p-4 rounded-[20px] flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${order.status === 'Searching Rider' ? 'border-orange-500/20 bg-orange-500/10 text-orange-400' : 'border-green-500/20 bg-green-500/10 text-green-400'}`}>
                           <Box className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-white font-bold text-sm tracking-wide">{order.dest}</p>
                           <p className="text-white/40 text-[10px] font-bold mt-0.5 tracking-wider">{order.status} • {order.id}</p>
                        </div>
                      </div>
                      <span className="text-white/30 text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">{order.time}</span>
                    </div>
                 ))}
               </div>
            </div>
          ) : step === 1 ? (
            <div className="animate-in fade-in zoom-in-95 duration-500 ease-out">
               {/* Real Live Map */}
               <div className="relative h-48 w-full rounded-[32px] overflow-hidden border border-white/5 mb-8 flex flex-col items-center justify-center cursor-pointer shadow-lg">
                  <Map 
                    defaultCenter={{lat: 25.7796, lng: 84.7499}}
                    defaultZoom={13}
                    disableDefaultUI={true}
                    gestureHandling="greedy"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  >
                     <Marker position={{lat: 25.7796, lng: 84.7499}} />
                  </Map>
                  <div className="absolute top-4 left-4 right-4 text-center pointer-events-none">
                    <div className="inline-block bg-blue-500/20 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 shadow-lg border border-blue-500/30">
                       Hyperlocal Map
                    </div>
                  </div>
               </div>

               {/* Modern Neomorphic Form Area */}
               <div className="bg-[#1A1A1A] border border-white/5 hover:border-white/10 rounded-[32px] p-6 shadow-2xl space-y-5 transition-colors duration-300">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center pointer-events-none group-focus-within:bg-blue-500/20 transition-colors">
                       <MapPin className="w-4 h-4 text-white/50 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      value={pickup} onChange={e => setPickup(e.target.value)}
                      placeholder="Enter Pickup Location"
                      className="block w-full pl-16 pr-4 py-5 border-none bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.06] text-white rounded-[20px] text-sm font-medium tracking-wide outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center pointer-events-none group-focus-within:bg-[#FFD000]/20 transition-colors">
                       <Navigation className="w-4 h-4 text-white/50 group-focus-within:text-[#FFD000] transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      value={drop} onChange={e => setDrop(e.target.value)}
                      placeholder="Enter Delivery Address"
                      className="block w-full pl-16 pr-4 py-5 border-none bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.06] text-white rounded-[20px] text-sm font-medium tracking-wide outline-none transition-all placeholder:text-white/20"
                    />
                  </div>

                  {/* Weight Selector */}
                  <div className="pt-2">
                     <p className="text-white/30 text-[10px] font-black uppercase tracking-widest px-2 mb-3">Load Capacity</p>
                     <div className="grid grid-cols-3 gap-3">
                        {['0-5kg', '5-15kg', '15kg+'].map(w => (
                           <button 
                             key={w}
                             onClick={() => setWeight(w)}
                             className={`py-3.5 rounded-[16px] text-xs font-bold tracking-wider transition-all border ${weight === w ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05]'}`}
                           >
                              {w}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="pt-6">
                     <button
                       onClick={() => setStep(2)}
                       disabled={!pickup || !drop}
                       className="group relative w-full py-5 overflow-hidden bg-white text-black font-black text-sm uppercase tracking-widest rounded-[20px] shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3"
                     >
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                       Proceed to Booking <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right duration-500 ease-out">
               {/* Aesthetic Order Summary */}
               <div className="bg-[#1A1A1A] border border-white/5 rounded-[32px] p-6 mb-8 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px]"></div>
                  
                  <div className="relative">
                     <div className="flex gap-4 items-start relative">
                        <div className="absolute left-3.5 top-6 bottom-[-24px] w-[2px] bg-gradient-to-b from-blue-500 to-white/10"></div>
                        <div className="w-7 h-7 rounded-full bg-[#121212] border-2 border-blue-500 flex items-center justify-center shrink-0 z-10 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                           <div className="w-2h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <div>
                           <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Pickup From</p>
                           <p className="text-white text-sm font-bold tracking-wide">{pickup}</p>
                        </div>
                     </div>
                     <div className="flex gap-4 items-start z-10 relative mt-6">
                        <div className="w-7 h-7 rounded-full bg-[#121212] border-2 border-white/20 flex items-center justify-center shrink-0">
                           <div className="w-2.5 h-2.5 bg-white/50 rounded-full"></div>
                        </div>
                        <div>
                           <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Deliver To</p>
                           <p className="text-white text-sm font-bold tracking-wide">{drop}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-2 mb-4 px-2">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Select Delivery Speed</h3>
               </div>
               
               <div className="space-y-4">
                  {/* Premium Option */}
                  <div className="bg-gradient-to-br from-blue-900/40 to-[#1A1A1A] border border-blue-500/30 rounded-[28px] p-6 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden cursor-pointer group hover:-translate-y-1 transition-all">
                     <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle2 className="text-blue-400 w-6 h-6" />
                     </div>
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-[14px] bg-blue-500/20 text-blue-400 flex items-center justify-center">
                           <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="text-white font-black text-lg tracking-wide">Prio Express</h3>
                     </div>
                     <p className="text-blue-100/50 text-[11px] font-medium tracking-wide mb-6">Captain will arrive in approx. 4 minutes. Direct route.</p>
                     
                     <div className="flex justify-between items-end border-t border-white/10 pt-5">
                        <div>
                           <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Base Fare</p>
                           <p className="text-3xl font-black text-white tracking-tighter">₹45</p>
                        </div>
                        <span className="text-[11px] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">~15 MIN ETA</span>
                     </div>
                  </div>

                  {/* Secure Option */}
                   <div className="bg-[#1A1A1A] border border-white/5 rounded-[28px] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-colors cursor-pointer group">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-[14px] bg-[#FFD000]/10 text-[#FFD000] flex items-center justify-center">
                           <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h3 className="text-white font-black text-lg tracking-wide">Secure Box</h3>
                     </div>
                     <p className="text-white/40 text-[11px] font-medium tracking-wide mb-6">Insured transit. Multi-factor delivery authentication required.</p>
                     
                     <div className="flex justify-between items-end border-t border-white/5 pt-5 group-hover:border-white/10 transition-colors">
                        <div>
                           <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Base Fare</p>
                           <p className="text-3xl font-black text-white tracking-tighter">₹80</p>
                        </div>
                        <span className="text-[11px] font-bold tracking-widest uppercase text-white/40 bg-white/5 px-3 py-1.5 rounded-full">~25 MIN ETA</span>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 mt-10">
                  <button onClick={() => setStep(1)} className="px-6 py-5 bg-[#1A1A1A] border border-white/10 text-white font-black text-xs uppercase tracking-widest rounded-[20px] hover:bg-white/10 transition-colors active:scale-95">
                     Back
                  </button>
                  <button className="flex-1 relative overflow-hidden py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-[20px] shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-95 transition-all group">
                     <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                     Initialize Dispatch
                  </button>
               </div>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
