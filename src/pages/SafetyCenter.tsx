import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, AlertTriangle, Phone, MapPin, Eye, UserCheck, ShieldCheck, Camera, BellRing, HeartPulse } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function SafetyCenter() {
  const [activeTab, setActiveTab] = useState<'rider' | 'captain' | 'tech'>('rider');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-28 pb-20 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 mb-4"
          >
            <Shield className="w-12 h-12 text-red-500" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white">
            Safety <span className="text-red-500">Center</span>
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Your safety is locked deeply into our core infrastructure. From AI anomaly detection to instant SOS triggers, RAPDO sets the benchmark for secure mobility in Bihar.
          </p>
        </div>

        {/* Emergency SOS Banner */}
        <motion.div 
          onClick={() => navigate('/sos')}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-red-600 to-red-500 rounded-3xl p-8 md:p-10 cursor-pointer shadow-[0_0_40px_rgba(239,68,68,0.3)] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider mb-1">
                  Active SOS Emergency
                </h2>
                <p className="text-white/90 text-sm font-medium">
                  Tap to immediately notify Police, Ambulance, and Trusted Contacts.
                </p>
              </div>
            </div>
            <button className="px-8 py-4 bg-white text-red-600 rounded-full text-sm font-black uppercase tracking-widest whitespace-nowrap shadow-xl">
              Trigger SOS
            </button>
          </div>
        </motion.div>

        {/* Dynamic Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
          {[
            { id: 'rider', label: 'Rider Safety', icon: <UserCheck className="w-4 h-4" /> },
            { id: 'captain', label: 'Captain Safety', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'tech', label: 'AI Guard', icon: <Eye className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {activeTab === 'rider' && (
                <>
                  <FeatureCard icon={<Phone />} title="Trusted Contacts" desc="Automatically share your live trip GPS with up to 5 family members when a ride starts." />
                  <FeatureCard icon={<Eye />} title="Ride OTP System" desc="Your ride cannot begin until you verbally share a secure OTP with your captain, ensuring right boarding." />
                  <FeatureCard icon={<ShieldCheck />} title="Verified Captains" desc="Every RAPDO captain undergoes strict Aadhaar & background verification before activation." />
                  <FeatureCard icon={<HeartPulse />} title="Women Safety Focus" desc="Night rides (10PM-6AM) are actively monitored by our core safety team with periodic welfare checks." />
                  <FeatureCard icon={<MapPin />} title="Route Deviation Guard" desc="If a captain deviates significantly from the ETA path, our system automatically triggers a status ping." />
                  <FeatureCard icon={<AlertTriangle />} title="24/7 Support" desc="Immediate escalation paths to human support agents dynamically injected into the active trip UI." />
                </>
              )}
              
              {activeTab === 'captain' && (
                <>
                  <FeatureCard icon={<Camera />} title="Rider KYC Verification" desc="High-risk zones require riders to upload valid identification before booking limits are removed." />
                  <FeatureCard icon={<MapPin />} title="No-Go Zones" desc="Certain highly vulnerable geographical sectors are restricted late night to protect captain assets." />
                  <FeatureCard icon={<BellRing />} title="Captain SOS" desc="Dedicated discreet emergency trigger sending distress signals directly to local response teams." />
                </>
              )}

              {activeTab === 'tech' && (
                <>
                  <FeatureCard icon={<Eye />} title="AI Anomaly Engine" desc="Machine learning models flag statistically abnormal prolonged stops or erratic pacing." />
                  <FeatureCard icon={<MapPin />} title="Telemetry Logging" desc="Live logging of GPS bearing, speed, and braking force (via sensors) for strict behavioral compliance." />
                  <FeatureCard icon={<Shield />} title="Real-time Ban System" desc="Violent behavior reports automatically freeze accounts spanning across IMEI and phone numbers." />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-[#121212] border border-white/5 p-8 rounded-3xl hover:border-white/10 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/60 mb-6 group-hover:text-red-400 group-hover:bg-red-400/10 transition-all">
        {icon}
      </div>
      <h3 className="text-lg font-black text-white tracking-wide mb-3">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
