import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Lock, Eye, Server, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-28 pb-20 px-6 relative overflow-hidden">
      <div className="absolute top-40 right-[-100px] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-12">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Lock className="w-3 h-3" /> Encrypted Protocol
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-2xl leading-relaxed">
            At RAPDO, securing your identity and spatial data is our highest protocol. This document outlines how we collect, encrypt, and utilize your information to deliver our premium mobility and delivery services.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard 
            icon={<MapPin />}
            title="Location & Spatial Data"
            desc="We require precise background location tracking during active rides to power our core dispatch engine, provide live ETAs, and ensure robust safety monitoring. Location data is anonymized post-trip."
          />
          <InfoCard 
            icon={<Server />}
            title="Secure Infrastructure"
            desc="All sensitive operations, including user identities and Firebase tokens, are transmitted via encrypted TLS protocols. We do not store raw card details directly on our servers."
          />
          <InfoCard 
            icon={<Search />}
            title="AI & Analytics"
            desc="Anonymized ride telemetry and query patterns are passed to our internal AI to optimize routing, predict demand surges, and detect behavioral anomalies indicating potential fraud."
          />
          <InfoCard 
            icon={<Eye />}
            title="No Third-Party Selling"
            desc="RAPDO strictly prohibits the sale of your personal identifiable information (PII) to external marketing networks. Data sharing is limited only to verified insurance partners and law enforcement when legally mandated."
          />
        </div>

        <div className="bg-[#121212] border border-white/5 p-8 md:p-12 rounded-3xl mt-12 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-[#FFC107]" /> 
              Data Collection Matrix
            </h3>
            
            <div className="space-y-6 text-sm text-white/60 leading-relaxed">
              <div>
                <h4 className="text-white font-bold mb-2 uppercase tracking-wide">1. Identifiers</h4>
                <p>Name, Phone Number, Email, Device UUID, Firebase Auth tokens, and standard profile imagery provided during rapid onboarding.</p>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-2 uppercase tracking-wide">2. Financial Data</h4>
                <p>Transaction histories, Wallet balances, and tokenized Razorpay gateway references. Full banking metrics are handled entirely by our verified payment gateway partners.</p>
              </div>

              <div>
                <h4 className="text-white font-bold mb-2 uppercase tracking-wide">3. Communications</h4>
                <p>In-app Chat transcripts, SOS emergency logs, Help AI conversation histories, and voice-search audio fragments (processed ephemerally and not persisted).</p>
              </div>

              <div>
                <h4 className="text-white font-bold mb-2 uppercase tracking-wide">4. User Rights (GDPR / DPDPA Alignments)</h4>
                <p>You maintain the right to conceptualize, export, or permanently purge your account data. Access the "My Identity" portal to execute a hard-delete of your presence on the RAPDO grid. Note that certain transactional ledgers must be retained for financial auditing compliance.</p>
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="text-xs text-white/40 uppercase tracking-widest font-bold">
            Effective Date: Q2 2026
          </div>
          <Link to="/terms" className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest transition-all">
            Return to Legal
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-[#121212] border border-white/5 p-8 rounded-3xl hover:border-white/10 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/60 mb-6 group-hover:text-[#FFC107] group-hover:bg-[#FFC107]/10 transition-all">
        {icon}
      </div>
      <h3 className="text-lg font-black text-white tracking-wide mb-3">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
