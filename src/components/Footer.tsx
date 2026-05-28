import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Lock, Headphones, BadgeCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[#050505] pt-12 pb-24 md:pb-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#050505] p-[1px] border border-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(255,193,7,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-[#FFC107]/10 rounded-full pointer-events-none" />
                <div className="w-full h-full rounded-full bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden shadow-inner">
                  <img 
                    src="https://i.ibb.co/x8RS5DQV/Chat-GPT-Image-May-28-2026-01-48-34-PM.png" 
                    alt="RAPDO Logo" 
                    className="w-[150%] h-[150%] object-contain drop-shadow-[0_1px_2px_rgba(255,193,7,0.3)] scale-[1.25]" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="text-white font-black uppercase tracking-widest text-lg">RAPDO</span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed max-w-xs">
              Fast • Fair • Local. Building the definitive premium mobility and logistics engine for Bihar and beyond.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-black uppercase tracking-widest text-xs">Platform</h4>
            <div className="flex flex-col gap-3">
              <Link to="/book" className="text-white/50 hover:text-[#FFC107] text-xs font-bold uppercase tracking-wide transition-colors">Book Ride</Link>
              <Link to="/parcel" className="text-white/50 hover:text-[#FFC107] text-xs font-bold uppercase tracking-wide transition-colors">Send Parcel</Link>
              <Link to="/pricing" className="text-white/50 hover:text-[#FFC107] text-xs font-bold uppercase tracking-wide transition-colors">Pricing</Link>
              <Link to="/captain" className="text-white/50 hover:text-[#FFC107] text-xs font-bold uppercase tracking-wide transition-colors">Drive With Us</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-black uppercase tracking-widest text-xs">Trust & Safety</h4>
            <div className="flex flex-col gap-3">
              <Link to="/safety" className="text-white/50 hover:text-red-400 text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Safety Center</Link>
              <Link to="/trust" className="text-white/50 hover:text-emerald-400 text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2"><BadgeCheck className="w-3.5 h-3.5" /> Security Guard</Link>
              <Link to="/sos" className="text-white/50 hover:text-red-500 text-xs font-bold uppercase tracking-wide transition-colors">SOS Protocol</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-black uppercase tracking-widest text-xs">Legal</h4>
            <div className="flex flex-col gap-3">
              <Link to="/terms" className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Terms</Link>
              <Link to="/privacy" className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Privacy</Link>
              <Link to="/contact" className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2"><Headphones className="w-3.5 h-3.5" /> Support</Link>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">
            &copy; {new Date().getFullYear()} RAPDO Mobility Technologies.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-white/30 uppercase tracking-widest font-bold">
            <span>Made in Bihar</span>
            <span>•</span>
            <span>v4.2 Production</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
