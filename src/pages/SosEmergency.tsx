import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Phone, MapPin, Share2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SosEmergency() {
  const [pulse, setPulse] = useState(false);
  const navigate = useNavigate();

  const handleSOS = () => {
    setPulse(true);
    // Mimicking API trigger for SOS
    setTimeout(() => {
      setPulse(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-20 px-6 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.15)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-xl w-full relative z-10 text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white flex items-center justify-center gap-3">
            <ShieldAlert className="w-10 h-10 text-red-500" />
            SOS <span className="text-red-500">Emergency</span>
          </h1>
          <p className="text-white/50 text-sm md:text-base leading-relaxed">
            If you are in immediate danger, trigger the alarm. Your live location, biometric signatures, and ride telemetry will instantly lock and broadcast to local authorities and your trusted contacts.
          </p>
        </div>

        <motion.button 
          onClick={handleSOS}
          whileTap={{ scale: 0.95 }}
          className="relative inline-flex items-center justify-center group"
        >
          <div className={`absolute inset-[-50px] bg-red-600 rounded-full blur-[80px] opacity-40 transition-opacity duration-300 ${pulse ? 'animate-pulse opacity-80 blur-[120px]' : ''}`} />
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
          
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-[8px] border-[#0A0A0A] shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center gap-3 relative z-10 group-hover:scale-[1.02] transition-transform">
            <AlertCircle className="w-16 h-16 text-white" />
            <span className="text-white font-black text-2xl uppercase tracking-widest">Hold to SOS</span>
          </div>
        </motion.button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left w-full">
          <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => window.location.href="tel:100"}>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wide text-sm">Police (100)</h4>
              <p className="text-white/40 text-xs">Direct dial local control room</p>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => window.location.href="tel:108"}>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wide text-sm">Ambulance (108)</h4>
              <p className="text-white/40 text-xs">Request medical dispatch</p>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wide text-sm">Trusted Contacts</h4>
              <p className="text-white/40 text-xs text-emerald-400 font-bold tracking-wide mt-0.5">3 Contacts Active</p>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white/50" />
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wide text-sm">Live Feed</h4>
              <p className="text-white/40 text-xs text-yellow-500 font-bold tracking-wide mt-0.5">Logging GPS...</p>
            </div>
          </div>
        </div>
        
        <button className="text-white/40 hover:text-white text-xs uppercase tracking-widest font-bold underline transition-colors" onClick={() => navigate(-1)}>
          Cancel / Return
        </button>

      </div>
    </div>
  );
}
