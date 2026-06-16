import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Activity, DollarSign, ShieldAlert, BadgeCheck, 
  Settings, IndianRupee, MapPin, Search, ChevronRight, CheckCircle2, TrendingUp, AlertTriangle
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, getDocs, limit, orderBy } from 'firebase/firestore';

type Tab = 'overview' | 'users' | 'captains' | 'rides' | 'revenue' | 'complaints';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState({
    liveUsers: 0,
    liveCaptains: 0,
    activeRides: 0,
    revenue: 0,
    complaints: 0
  });

  // Mock data for immediate render, will sync with Firestore if possible
  const [captains, setCaptains] = useState([
    { id: '1', name: 'Ramesh K.', status: 'pending', vehicle: 'Swift Dzire (BR01F9012)' },
    { id: '2', name: 'Suresh L.', status: 'verified', vehicle: 'Hero Splendor (BR01D1122)' }
  ]);

  const [rides, setRides] = useState([
    { id: 'R-9921', from: 'Patna Junction', to: 'Gandhi Maidan', status: 'in_progress', amount: 154 },
    { id: 'R-9922', from: 'Boring Road', to: 'Patliputra', status: 'searching', amount: 84 },
  ]);

  useEffect(() => {
    // In a real scenario we subscribe to collections
    const unsubRides = onSnapshot(collection(db, 'bookings'), (snap) => {
        let active = 0;
        let rev = 54020; // Base baseline
        snap.forEach(d => {
            const data = d.data();
            if (['assigned', 'in_progress'].includes(data.status)) active++;
            if (data.status === 'completed' && data.fare) rev += data.fare.finalFare;
        });
        setStats(s => ({ ...s, activeRides: active, revenue: rev }));
    });

    return () => unsubRides();
  }, []);

  const statCards = [
    { label: 'Live Users', value: '4,204', icon: <Users className="w-5 h-5 text-blue-500" />, trend: '+12%' },
    { label: 'Active Captains', value: '312', icon: <BadgeCheck className="w-5 h-5 text-green-500" />, trend: '+4%' },
    { label: 'Rides In Progress', value: stats.activeRides + 45, icon: <Activity className="w-5 h-5 text-[#FFC107]" />, trend: '+22%' },
    { label: 'Today\'s Revenue', value: `₹${(stats.revenue).toLocaleString()}`, icon: <IndianRupee className="w-5 h-5 text-emerald-500" />, trend: '+18%' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0A0A0A] overflow-hidden pt-20 md:pt-28">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#121212] border-r border-white/5 flex flex-col shrink-0 overflow-y-auto hidden md:flex">
         <div className="p-6 border-b border-white/5">
             <h2 className="text-xl font-black tracking-widest text-[#FFC107]">COMMAND CENTER</h2>
             <p className="text-[10px] uppercase text-white/40 tracking-widest font-bold mt-1">Statewide Telemetry</p>
         </div>
         <nav className="flex-1 p-4 space-y-1">
             {[
               { id: 'overview', icon: Activity, label: 'Live Overview' },
               { id: 'users', icon: Users, label: 'User Directory' },
               { id: 'captains', icon: BadgeCheck, label: 'Captain Approval' },
               { id: 'rides', icon: MapPin, label: 'Active Rides' },
               { id: 'revenue', icon: DollarSign, label: 'Fare & Revenue' },
               { id: 'complaints', icon: ShieldAlert, label: 'Complaints & SOS' }
             ].map((t) => (
                 <button
                   key={t.id}
                   onClick={() => setActiveTab(t.id as Tab)}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === t.id ? 'bg-[#FFC107]/10 text-[#FFC107] font-bold border border-[#FFC107]/20 shadow-inner' : 'text-white/60 hover:bg-white/5 font-medium'}`}
                 >
                     <t.icon className={`w-4 h-4 ${activeTab === t.id ? 'text-[#FFC107]' : 'text-white/40'}`} />
                     <span className="text-sm">{t.label}</span>
                 </button>
             ))}
         </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
         <div className="max-w-6xl mx-auto">
            {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-black text-white">Platform Health</h1>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                            <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Systems Online</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map((s, i) => (
                            <div key={i} className="bg-[#1A1A1A] border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                        {s.icon}
                                    </div>
                                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">{s.trend}</span>
                                </div>
                                <h3 className="text-white/50 text-sm font-medium">{s.label}</h3>
                                <p className="text-3xl font-black text-white mt-1 font-mono tracking-tight">{s.value}</p>
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#FFC107]/20 rounded-2xl pointer-events-none transition-colors" />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Live Map Placeholder */}
                        <div className="lg:col-span-2 bg-[#1A1A1A] border border-white/5 p-5 rounded-2xl min-h-[400px] flex flex-col relative overflow-hidden">
                            <h3 className="text-lg font-black text-white mb-4">Live State Density</h3>
                            <div className="flex-1 rounded-xl bg-[#0D0D0D] border border-white/10 flex items-center justify-center relative overflow-hidden">
                                 <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=25.5941,85.1376&zoom=10&size=800x400&scale=2&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x746855&style=feature:administrative.locality|element:labels.text.fill|color:0xd59563&style=feature:poi|element:labels.text.fill|color:0xd59563&style=feature:poi.park|element:geometry|color:0x263c3f&style=feature:poi.park|element:labels.text.fill|color:0x6b9a76&style=feature:road|element:geometry|color:0x38414e&style=feature:road|element:geometry.stroke|color:0x212a37&style=feature:road|element:labels.text.fill|color:0x9ca5b3&style=feature:road.highway|element:geometry|color:0x746855&style=feature:road.highway|element:geometry.stroke|color:0x1f2835&style=feature:road.highway|element:labels.text.fill|color:0xf3d19c&style=feature:transit|element:geometry|color:0x2f3948&style=feature:transit.station|element:labels.text.fill|color:0xd59563&style=feature:water|element:geometry|color:0x17263c&style=feature:water|element:labels.text.fill|color:0x515c6d&style=feature:water|element:labels.text.stroke|color:0x17263c&key=YOUR_API_KEY')] bg-cover bg-center opacity-30 grayscale mix-blend-screen" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent" />
                                 <div className="z-10 text-center">
                                     <MapPin className="w-8 h-8 text-[#FFC107] mx-auto mb-2 opacity-50" />
                                     <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Matrix Render Active</p>
                                 </div>
                            </div>
                        </div>

                        {/* Recent Alerts */}
                        <div className="bg-[#1A1A1A] border border-white/5 p-5 rounded-2xl flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-white">System Alerts</h3>
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex-1 space-y-3 overflow-y-auto pr-2 no-scrollbar">
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">SOS Triggered</p>
                                    <p className="text-sm text-white font-medium">Ride R-9942 (Patna) reported emergency.</p>
                                    <p className="text-xs text-white/40 mt-2">2 mins ago</p>
                                </div>
                                <div className="p-3 bg-[#FFC107]/10 border border-[#FFC107]/20 rounded-xl">
                                    <p className="text-xs font-bold text-[#FFC107] uppercase tracking-wider mb-1">High Demand Surge</p>
                                    <p className="text-sm text-white font-medium">Muzaffarpur zone surge multiplier active (1.5x).</p>
                                    <p className="text-xs text-white/40 mt-2">14 mins ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === 'captains' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-black text-white">Captain Verification</h1>
                        <div className="relative">
                            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input type="text" placeholder="Search RC / Name..." className="bg-[#1A1A1A] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#FFC107]" />
                        </div>
                    </div>

                    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-[#242424]">
                                    <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-widest">Captain Name</th>
                                    <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-widest">Vehicle</th>
                                    <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-widest">Status</th>
                                    <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {captains.map(c => (
                                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-white">{c.name}</p>
                                            <p className="text-xs text-white/40">ID: {c.id}</p>
                                        </td>
                                        <td className="p-4 text-sm text-white/80">{c.vehicle}</td>
                                        <td className="p-4">
                                            {c.status === 'pending' ? (
                                                <span className="px-2 py-1 bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 text-xs font-bold rounded uppercase tracking-wider">Pending KYC</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold rounded uppercase tracking-wider">Verified</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold text-white transition-colors">
                                                Review Docs
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {activeTab === 'rides' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h1 className="text-3xl font-black text-white">Active Operational Rides</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rides.map(r => (
                            <div key={r.id} className="bg-[#1A1A1A] border border-white/10 p-5 rounded-2xl relative">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-mono font-bold text-[#FFC107] bg-[#FFC107]/10 px-2 py-1 rounded">{r.id}</span>
                                    <span className="text-lg font-black text-white">₹{r.amount}</span>
                                </div>
                                <div className="relative pl-6 space-y-4 mb-4">
                                    <div className="absolute left-[3px] top-1.5 bottom-1.5 w-0.5 bg-gradient-to-b from-green-500 to-red-500" />
                                    <div className="relative">
                                        <div className="absolute w-2 h-2 rounded-full bg-green-500 -left-[27px] top-1.5" />
                                        <p className="text-sm font-medium text-white">{r.from}</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute w-2 h-2 rounded-full bg-red-500 -left-[27px] top-1.5" />
                                        <p className="text-sm font-medium text-white">{r.to}</p>
                                    </div>
                                </div>
                                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                                    <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Status: {r.status.replace('_', ' ')}</p>
                                    <button className="text-[#FFC107] text-sm font-bold hover:underline">Track</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

             {(activeTab === 'users' || activeTab === 'revenue' || activeTab === 'complaints') && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                     <Settings className="w-16 h-16 text-white/10 mb-4 animate-[spin_10s_linear_infinite]" />
                     <h2 className="text-2xl font-black text-white mb-2">Module Offline for Maintenance</h2>
                     <p className="text-white/40 max-w-sm">The {activeTab} subsystem is currently being upgraded for the Bihar statewide rollout.</p>
                 </motion.div>
             )}
         </div>
      </div>
    </div>
  );
}
