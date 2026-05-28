import React from 'react';
import { motion } from 'motion/react';
import { Fingerprint, CheckCircle, Database, ShieldCheck, BadgeCheck, Cpu } from 'lucide-react';

export default function TrustGuard() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-28 pb-20 px-6 relative overflow-hidden">
      <div className="absolute top-0 flex justify-center w-full pointer-events-none">
        <div className="w-full max-w-4xl h-[400px] bg-emerald-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        <div className="text-center space-y-6 mb-20">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4"
          >
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white inline-flex flex-col md:flex-row items-center gap-3">
            Trust & Security <span className="text-emerald-500 bg-emerald-500/10 px-4 py-1 rounded-full text-2xl border border-emerald-500/20">Verified</span>
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Every layer of RAPDO is engineered for impenetrable trust. From zero-knowledge architecture to rigorous biometric KYC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TrustCard 
            icon={<Fingerprint />}
            title="Biometric KYC"
            desc="All captains undergo extensive background checks including Aadhaar validation and facial liveness verification."
          />
          <TrustCard 
            icon={<CheckCircle />}
            title="Secure Payments"
            desc="Razorpay encrypted gateways ensure your CVV and Card numbers never touch our core database servers."
          />
          <TrustCard 
            icon={<Database />}
            title="Data Residency"
            desc="All personal identifiable information complies with local regulations, stored entirely in secure regional clusters."
          />
          <TrustCard 
            icon={<BadgeCheck />}
            title="Quality Control"
            desc="Captains dropping beneath a 4.2 rating threshold are automatically suspended for targeted retraining."
          />
          <TrustCard 
            icon={<Cpu />}
            title="Live Fraud AI"
            desc="Predictive algorithms detect device farming, spoofed GPS signals, and automated emulator bookings to protect ecosystem integrity."
          />
        </div>

      </div>
    </div>
  );
}

function TrustCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-[#121212] border border-white/5 p-8 rounded-3xl hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all group duration-300">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/60 mb-6 group-hover:text-emerald-400 group-hover:scale-110 transition-all">
        {icon}
      </div>
      <h3 className="text-lg font-black text-white tracking-wide mb-3">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
