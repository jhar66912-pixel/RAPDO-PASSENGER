import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Gift, Award, Sparkles, Receipt, Tag, TrendingUp, Shell, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function Rewards() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'hub' | 'coupons' | 'history' | 'tiers'>('hub');
  
  const [points, setPoints] = useState(1250);
  const [tier, setTier] = useState<'Bronze' | 'Silver' | 'Gold' | 'Platinum'>('Gold');
  const [nextTierPoints, setNextTierPoints] = useState(2000);
  
  const totalCashback = 450; // Mock historical value

  const coupons = [
    { code: 'BIHAR50', discount: '50% OFF', desc: 'Valid on first Auto ride in Patna.', expiry: 'Expires in 2 days' },
    { code: 'MONSOON20', discount: '20% OFF', desc: 'Valid up to ₹100 on Bike rides.', expiry: 'Expires in 5 days' },
    { code: 'AIRPORT10', discount: '10% OFF', desc: 'Valid for Airport drops.', expiry: 'Expires in 12 days' }
  ];

  const cashbackHistory = [
    { id: 1, title: 'Ride Cashback', amount: '+₹15', date: 'Yesterday' },
    { id: 2, title: 'Scratch Card Win', amount: '+₹45', date: '3 days ago' },
    { id: 3, title: 'Referral Bonus', amount: '+₹100', date: 'Last Week' },
  ];

  return (
    <div className="flex-1 bg-[#0A0A0A] min-h-screen font-sans">
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#121212] shadow-2xl relative flex flex-col overflow-x-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#FFC107]/10 via-[#FFC107]/5 to-transparent pointer-events-none" />
        <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[60px] mix-blend-screen pointer-events-none" />

        <div className="p-8 relative z-10 flex-col flex-1 overflow-y-auto no-scrollbar pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition">
                <ArrowLeft className="w-5 h-5 text-white/70" />
              </button>
              <h1 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
                Rewards 
              </h1>
            </div>
            <Award className="w-6 h-6 text-[#FFC107]" />
          </div>

          {/* Loyalty Tier Card */}
          <div className="relative w-full rounded-[32px] p-[1px] bg-gradient-to-br from-[#FFC107]/60 via-[#FFC107]/20 to-transparent mb-8 overflow-hidden shadow-[0_20px_40px_-15px_rgba(255,193,7,0.25)]">
             <div className="absolute inset-0 bg-[#0A0A0A] rounded-[31px]">
                <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-[#FFC107]/20 rounded-full blur-[40px]"></div>
                
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Current Tier</p>
                         <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#FFC107]" />
                            <h2 className="text-2xl font-black text-[#FFC107] tracking-tight">{tier}</h2>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Reward Points</p>
                         <p className="text-2xl font-black text-white">{points}</p>
                      </div>
                   </div>
                   
                   <div>
                      <div className="flex justify-between text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">
                         <span>{points} pts</span>
                         <span>{nextTierPoints} pts</span>
                      </div>
                      <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(points / nextTierPoints) * 100}%` }}
                           transition={{ duration: 1, ease: 'easeOut' }}
                           className="h-full bg-gradient-to-r from-[#FFC107] to-amber-300 rounded-full"
                         />
                      </div>
                      <p className="text-[10px] text-white/40 mt-3 italic text-center">Earn {nextTierPoints - points} more points to reach Platinum tier</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 p-1 bg-[#1A1A1A] rounded-xl border border-white/5 mb-8 overflow-x-auto no-scrollbar">
             {[
               { id: 'hub', label: 'Dashboard', icon: <Gift className="w-3 h-3" /> },
               { id: 'coupons', label: 'Coupons', icon: <Percent className="w-3 h-3" /> },
               { id: 'history', label: 'History', icon: <Receipt className="w-3 h-3" /> },
               { id: 'tiers', label: 'Tiers', icon: <TrendingUp className="w-3 h-3" /> },
             ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[90px] py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id ? 'bg-[#FFC107] text-black font-black shadow-md' : 'text-white/40 hover:bg-white/5'
                  }`}
                >
                   {tab.icon} {tab.label}
                </button>
             ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Dashboard Tab */}
              {activeTab === 'hub' && (
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#1A1A1A] border border-white/5 p-5 rounded-[24px]">
                         <p className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-2">Total Cashback</p>
                         <p className="text-3xl font-black text-emerald-400">₹{totalCashback}</p>
                      </div>
                      <div className="bg-[#1A1A1A] border border-emerald-500/20 p-5 rounded-[24px] cursor-pointer hover:bg-white/5 transition" onClick={() => navigate('/referral')}>
                         <p className="text-[10px] text-emerald-400/80 uppercase font-black tracking-widest mb-2">Refer & Earn</p>
                         <p className="text-lg font-black text-emerald-400 leading-tight">Win Up To<br/>₹500</p>
                      </div>
                   </div>

                   <h3 className="text-xs font-black uppercase tracking-widest text-[#FFC107] mb-4 mt-8">Active Scratch Cards</h3>
                   <div className="bg-gradient-to-br from-[#1A1A1A] to-[#121212] border border-white/10 p-6 rounded-[28px] flex items-center justify-between">
                      <div>
                         <h4 className="text-sm font-bold text-white mb-1">Mystery Reward</h4>
                         <p className="text-[10px] text-white/40 uppercase tracking-widest">Valid for 3 days</p>
                      </div>
                      <button className="px-4 py-2 bg-[#FFC107] text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-transform">
                         Scratch
                      </button>
                   </div>
                </div>
              )}

              {/* Coupons Tab */}
              {activeTab === 'coupons' && (
                <div className="space-y-4">
                  {coupons.map((c, i) => (
                    <div key={i} className="bg-[#1A1A1A] border border-white/5 rounded-[24px] p-5 relative overflow-hidden flex flex-col hover:border-[#FFC107]/30 transition-colors">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-[#FFC107]/5 rounded-bl-full pointer-events-none" />
                      
                      <div className="flex justify-between items-start mb-3">
                        <div className="bg-[#FFC107]/10 border border-[#FFC107]/20 px-3 py-1.5 rounded-lg inline-block">
                          <span className="text-[#FFC107] font-mono text-xs font-bold">{c.code}</span>
                        </div>
                        <span className="text-xl font-black text-white">{c.discount}</span>
                      </div>
                      
                      <p className="text-sm text-white/70 mb-4">{c.desc}</p>
                      
                      <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-4">
                        <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">{c.expiry}</span>
                        <button className="text-[10px] font-black uppercase tracking-widest text-[#FFC107] hover:bg-[#FFC107]/10 px-3 py-1.5 rounded-lg transition-colors">
                           Apply Coupon
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="bg-[#1A1A1A] rounded-[24px] border border-white/5 p-1">
                  {cashbackHistory.map((item, index) => (
                    <div key={item.id} className={`flex justify-between items-center p-4 ${index !== cashbackHistory.length - 1 ? 'border-b border-white/5' : ''}`}>
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                             <Receipt className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-white">{item.title}</p>
                             <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">{item.date}</p>
                          </div>
                       </div>
                       <span className="text-sm font-black text-emerald-400">{item.amount}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tiers Tab */}
              {activeTab === 'tiers' && (
                <div className="space-y-4">
                  <div className="p-6 bg-[#1A1A1A] rounded-[24px] border border-white/5 relative overflow-hidden">
                    <h4 className="text-sm font-black text-white mb-2">Member Benefits</h4>
                    <p className="text-xs text-white/50 mb-6">Earn points on every ride. Unlock priority booking and exclusive discounts as you rank up.</p>
                    
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                       {[
                         { title: 'Bronze', pts: '0-500 pts', ben: 'Standard access' },
                         { title: 'Silver', pts: '500-1000 pts', ben: '5% extra scratch rewards' },
                         { title: 'Gold', pts: '1000-2000 pts', ben: 'Priority driver matching' },
                         { title: 'Platinum', pts: '2000+ pts', ben: 'Surge pricing immunity' }
                       ].map((t, idx) => (
                          <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                             <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-[#121212] text-white/50 z-10 font-bold text-[10px]">
                                {idx + 1}
                             </div>
                             <div className="bg-white/5 border border-white/10 p-4 rounded-xl ml-4 w-[calc(100%-2rem)]">
                                <div className="flex justify-between items-center mb-1">
                                  <span className={`font-black uppercase tracking-widest text-[10px] ${t.title === tier ? 'text-[#FFC107]' : 'text-white'}`}>{t.title}</span>
                                  <span className="text-[9px] text-white/40 uppercase tracking-widest">{t.pts}</span>
                                </div>
                                <p className="text-xs text-white/70">{t.ben}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
