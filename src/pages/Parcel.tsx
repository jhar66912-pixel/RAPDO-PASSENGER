import React, { useState } from 'react';
import { PackageSearch, MapPin, Navigation, Box, Zap, ArrowRight, ShieldCheck, CheckCircle2, CloudRain, Clock } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../lib/auth';
import { Map, Marker } from '../components/SmartMapView';
import { LocationSearchInput } from '../components/LocationSearchInput';

export default function Parcel() {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [weight, setWeight] = useState('0-5kg');

  const [isB2bMode, setIsB2bMode] = useState(false);

  return (
    <div className="flex-1 bg-[#0A0A0A] min-h-screen font-sans">
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#121212] shadow-2xl relative flex flex-col overflow-x-hidden min-h-screen">
        
        {/* Holographic Glowing Orbs background effect */}
        <div className="absolute top-[-50px] right-[-50px] w-[250px] h-[250px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
        <div className="absolute top-[10%] left-[-50px] w-[200px] h-[200px] bg-indigo-600/10 rounded-full blur-[70px] pointer-events-none mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay"></div>

        <div className="p-8 relative z-10 flex-1 overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
             <div>
                <h1 className="text-2xl font-black text-white tracking-widest flex items-center gap-3 uppercase">
                   {isB2bMode ? 'RAPDO B2B' : 'RAPDO Parcel'} <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                </h1>
                <p className="text-white/40 text-[11px] font-bold tracking-widest uppercase mt-1">
                   {isB2bMode ? 'Merchant Logistics Console' : 'Hyperlocal delivery network'}
                </p>
             </div>
             <button 
               onClick={() => setIsB2bMode(!isB2bMode)}
               className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all ${isB2bMode ? 'bg-[#FFC107]/10 border border-[#FFC107]/20 text-[#FFC107]' : 'bg-white/5 border border-white/10 text-blue-400 opacity-80 hover:opacity-100'}`}
               title="Toggle Merchant Mode"
              >
                {isB2bMode ? <Box className="w-6 h-6" /> : <PackageSearch className="w-6 h-6" />}
             </button>
          </div>

          {isB2bMode ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out space-y-6">
               <div className="bg-[#1A1A1A] rounded-[24px] border border-[#FFC107]/20 p-5 shadow-[0_20px_40px_rgba(255,193,7,0.05)] relative overflow-hidden transform-gpu hover:scale-[1.02] transition-transform">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC107]/10 blur-[40px]"></div>
                 <h2 className="text-[#FFC107] font-black text-xs tracking-widest uppercase mb-1">Active SLA</h2>
                 <p className="text-white text-2xl font-black drop-shadow-md">Patna Pharma Dist.</p>
                 <div className="flex gap-4 mt-4 text-[10px] uppercase font-bold text-white/50 tracking-widest">
                   <div><span className="text-white">14</span> Ongoing</div>
                   <div><span className="text-white">102</span> Today</div>
                 </div>
               </div>

               <button className="w-full py-4 bg-[#FFC107]/10 border border-[#FFC107]/30 hover:bg-[#FFC107]/20 text-[#FFC107] rounded-[20px] font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(255,193,7,0.2)]">
                 <Zap className="w-4 h-4" /> Bulk Dispatch (Excel Upload)
               </button>

               <div className="space-y-3 mt-8">
                 <h3 className="text-white/40 text-[10px] font-black tracking-widest uppercase mb-4 px-2">Live B2B Connects</h3>
                 {[
                   { id: 'ORD-8821', dest: 'Kankarbagh Medico', status: 'Captain En Route', time: '12 MIN ETA', progress: '65%' },
                   { id: 'ORD-8822', dest: 'Boring Rd Diagnostics', status: 'Searching Rider', time: '--', progress: '0%' },
                   { id: 'ORD-8823', dest: 'Patna Super Specialty', status: 'Processing', time: 'Pending', progress: '0%' }
                 ].map((order, i) => (
                    <div key={i} className="bg-[#121212] border border-white/5 p-4 rounded-[20px] flex flex-col justify-between hover:bg-white/[0.04] hover:border-white/20 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center border shadow-inner ${order.status === 'Searching Rider' || order.status === 'Processing' ? 'border-orange-500/20 bg-orange-500/10 text-orange-400' : 'border-[#FFC107]/30 bg-[#FFC107]/10 text-[#FFC107]'}`}>
                             <Box className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-white font-bold text-sm tracking-wide">{order.dest}</p>
                             <p className="text-white/40 text-[10px] font-bold mt-0.5 tracking-wider uppercase">{order.status} • <span className="text-[#FFC107]">{order.id}</span></p>
                          </div>
                        </div>
                        <span className="text-white/30 text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/5 px-2 py-1.5 rounded-lg shadow-sm">{order.time}</span>
                      </div>
                      
                      {/* Active Progress Bar */}
                      {order.status === 'Captain En Route' && (
                        <div className="mt-4">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-1.5">
                            <span className="text-[#FFC107]">Pickup</span>
                            <span className="text-white/40">Drop-off</span>
                          </div>
                          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
                            <div
                              className="absolute top-0 left-0 h-full bg-[#FFC107] rounded-full transition-all duration-1000 ease-in-out"
                              style={{ width: order.progress }}
                            >
                               <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50 animate-pulse" />
                            </div>
                          </div>
                        </div>
                      )}
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
               <div className="bg-[#1A1A1A] border border-white/5 hover:border-white/10 rounded-[32px] p-6 shadow-2xl space-y-5 transition-colors duration-300 relative z-20">
                  <LocationSearchInput 
                    value={pickup}
                    onChange={setPickup}
                    onSelect={() => {}}
                    placeholder="Enter Pickup Location"
                    focusColor={{ border: 'border-white/20', activeBorder: 'border-blue-500/50', dot: 'bg-white/50 group-focus-within:bg-blue-400', ring: 'focus:ring-blue-500/20' }}
                  />
                  
                  <LocationSearchInput 
                    value={drop}
                    onChange={setDrop}
                    onSelect={() => {}}
                    placeholder="Enter Delivery Address"
                    focusColor={{ border: 'border-white/20', activeBorder: 'border-[#FFC107]/50', dot: 'bg-white/50 group-focus-within:bg-[#FFC107]', ring: 'focus:ring-[#FFC107]/20' }}
                  />

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
                       className="group relative w-full py-5 overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-[20px] shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3"
                     >
                       <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
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
                        <div className="w-10 h-10 rounded-[14px] bg-[#FFC107]/10 text-[#FFC107] flex items-center justify-center">
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
                  <button 
                     onClick={async () => {
                       if (!pickup || !drop) return;
                       try {
                         const parcelBooking = {
                           bookingId: 'PAR-' + Math.random().toString(36).substr(2, 9),
                           customerId: currentUser?.uid || '',
                           customerName: currentUser?.name || 'Guest',
                           customerMobile: currentUser?.mobile || '',
                           bookingType: 'custom',
                           pickupName: pickup,
                           dropName: drop,
                           status: 'searching',
                           rideOtp: Math.floor(1000 + Math.random() * 9000).toString(),
                           createdAt: Date.now()
                         };
                         
                         const { doc, setDoc } = await import('firebase/firestore');
                         const { db } = await import('../lib/firebase');
                         
                         await setDoc(doc(db, 'bookings', parcelBooking.bookingId), parcelBooking);
                         
                         // Create transaction
                         const txnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
                         await setDoc(doc(db, 'transactions', txnId), {
                           transactionId: txnId,
                           customerId: currentUser?.uid || '',
                           title: 'Parcel Dispatch Reserved',
                           amount: '-₹45',
                           type: 'scheduled',
                           date: 'Now',
                           createdAt: Date.now()
                         });
                         
                         window.location.href = '/book';
                       } catch (e) {
                         alert('Error booking parcel');
                       }
                     }}
                     className="flex-1 relative overflow-hidden py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-[20px] shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-95 transition-all group"
                  >
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
