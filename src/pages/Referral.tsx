import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Share2, Copy, Gift, Users, CheckCircle2, ChevronRight, ShareIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Referral() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [copied, setCopied] = useState(false);
  const referralCode = currentUser?.name ? currentUser.name.substring(0, 4).toUpperCase() + '99' : 'BIHARRAP';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join RAPDO',
          text: `Use my code ${referralCode} to sign up for RAPDO and get ₹50 free wallet cash!`,
          url: 'https://rapdo.in',
        });
      } catch (err) {
        console.warn('Share rejected', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] min-h-screen font-sans">
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#121212] shadow-2xl relative flex flex-col overflow-x-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[60px] mix-blend-screen pointer-events-none" />

        <div className="p-8 relative z-10 flex-col flex-1 overflow-y-auto no-scrollbar pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition">
                <ArrowLeft className="w-5 h-5 text-white/70" />
              </button>
              <h1 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
                Refer & Earn
              </h1>
            </div>
          </div>

          <div className="flex flex-col items-center text-center mb-10 mt-4">
             <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full p-[3px] shadow-[0_0_40px_rgba(52,211,153,0.3)] mb-6 relative">
                <div className="w-full h-full bg-[#121212] rounded-full flex items-center justify-center border-4 border-[#121212]">
                   <Gift className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#121212] rounded-full p-2 border border-white/10">
                   <Users className="w-5 h-5 text-[#FFC107]" />
                </div>
             </div>
             
             <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Earn ₹50 Cash</h2>
             <p className="text-sm text-white/60 px-4">For every friend who completes their first ride with RAPDO in Bihar, you both get ₹50 in your Vault!</p>
          </div>

          {/* Referral Code Display */}
          <div className="bg-[#1A1A1A] border border-white/10 p-6 rounded-[32px] mb-8 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-[#FFC107] to-purple-500" />
             <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-4">Your Invite Code</p>
             
             <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-4xl font-mono font-black tracking-widest text-[#FFC107]">{referralCode}</span>
             </div>

             <div className="flex gap-3">
                <button 
                  onClick={handleCopy}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all hover:bg-white/10 flex items-center justify-center gap-2"
                >
                   {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                   {copied ? 'Copied!' : 'Copy'}
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-[2] py-4 bg-emerald-500 text-black font-black text-[11px] uppercase tracking-widest rounded-xl transition-all hover:bg-emerald-400 shadow-[0_10px_20px_rgba(52,211,153,0.2)] active:scale-95 flex items-center justify-center gap-2"
                >
                   <ShareIcon className="w-4 h-4" /> Share with Friends
                </button>
             </div>
          </div>

          {/* How it works */}
          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4 ml-2">How it works</h3>
             
             {[
               { step: '1', title: 'Share Code', desc: 'Send your invite code to friends.' },
               { step: '2', title: 'Friends Sign Up', desc: 'They get ₹50 Signup Bonus instantly.' },
               { step: '3', title: 'You Earn', desc: 'You get ₹50 when they complete their first ride.' }
             ].map((item, idx) => (
               <div key={idx} className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                 <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-[#FFC107] font-black text-xs shrink-0">
                   {item.step}
                 </div>
                 <div>
                   <p className="font-bold text-white text-sm">{item.title}</p>
                   <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
                 </div>
               </div>
             ))}
          </div>

        </div>
      </div>
    </div>
  );
}
