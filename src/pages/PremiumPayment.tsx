import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bird, ShieldCheck, ArrowRight, CreditCard, Lock, Sparkles, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRODUCTS = [
  {
    id: 1,
    name: 'RAPDO Black Elite Pass',
    description: 'Priority matching, zero surge pricing, and absolute luxury for every ride.',
    price: 4999,
    imageUrl: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=600&h=800',
    colSpan: 2,
    rowSpan: 2
  },
  {
    id: 2,
    name: 'Intercity Voyager',
    description: 'Premium outstation fleet access with complimentary waiting hours.',
    price: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600&h=400',
    colSpan: 1,
    rowSpan: 1
  },
  {
    id: 3,
    name: 'Business Commute Plus',
    description: 'Guaranteed top-tier captains for your daily office runs.',
    price: 1999,
    imageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=600&h=400',
    colSpan: 1,
    rowSpan: 1
  }
];

export default function PremiumPayment() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRazorpayCheckout = () => {
    setIsProcessing(true);
    // Simulate Razorpay Gateway Opening (bypassing generic UPI fields)
    setTimeout(() => {
      window.open('https://razorpay.com/buy', '_blank');
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#16192B] font-sans text-white overflow-x-hidden pt-4 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-white/20">
      
      {/* 1. Header / Navigation (Sticky Glassmorphic Capsule) */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-6 z-50 mx-auto max-w-5xl backdrop-blur-xl bg-[#0f172a]/60 border border-white/10 rounded-full px-6 py-4 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.15)]"
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(-1)}>
           <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <ChevronLeft className="w-5 h-5 text-white/80" />
           </div>
           <div className="flex items-center gap-2 px-2">
              {/* Sparrow brand motif */}
              <Bird className="w-6 h-6 text-white" />
              <span className="text-sm font-black tracking-widest uppercase opacity-90">Sparrow Checkout</span>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase text-white/70">
             <ShieldCheck className="w-4 h-4 text-emerald-400" />
             Bank Grade Security
           </div>
        </div>
      </motion.nav>

      {/* 2. Main Content Architecture */}
      <main className="max-w-5xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
         
         {/* Left Column: Product Grid */}
         <div className="lg:col-span-7 space-y-6">
            <div className="mb-8">
               <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-3">
                 Elevate Your <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Mobility Tier.</span>
               </h1>
               <p className="text-white/50 text-sm tracking-wide font-medium">Select your premium pass to unlock architectural fidelity in transit.</p>
            </div>

            {/* Asymmetric Image Grid */}
            <div className="grid grid-cols-2 gap-4 auto-rows-[200px]">
               {PRODUCTS.map((product) => (
                 <motion.div 
                   key={product.id}
                   whileHover={{ y: -8 }}
                   className={`
                     relative overflow-hidden rounded-[24px] group cursor-pointer
                     ${product.colSpan === 2 ? 'col-span-2' : 'col-span-1'}
                     ${product.rowSpan === 2 ? 'row-span-2' : 'row-span-1'}
                     shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.15)]
                   `}
                 >
                    <div className="absolute inset-0 bg-[#0f172a]/60 mix-blend-multiply z-10 group-hover:bg-[#0f172a]/40 transition-all duration-500" />
                    <img 
                      src={product.imageUrl} referrerPolicy="no-referrer"                      alt={product.name}
                      className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                    
                    {/* Glass Overlay Detail */}
                    <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20">
                       <h3 className="text-lg font-black tracking-wide text-white mb-1 drop-shadow-md">{product.name}</h3>
                       <p className="text-xs text-white/60 font-medium line-clamp-2 max-w-[90%]">{product.description}</p>
                       <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-xs font-bold">
                          ₹{product.price.toLocaleString('en-IN')}
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>

         {/* Right Column: Checkout Action Interface */}
         <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-32 backdrop-blur-xl bg-[#0f172a]/60 border border-white/10 rounded-[32px] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.15)]"
            >
               <div className="w-12 h-12 bg-white/5 rounded-[16px] flex items-center justify-center border border-white/10 mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                 <Sparkles className="w-6 h-6 text-emerald-400" />
               </div>
               
               <h2 className="text-2xl font-black tracking-tight mb-2">Order Summary</h2>
               <p className="text-xs font-medium text-white/50 tracking-wider uppercase mb-8">Direct Gateway Access</p>

               <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-white/60">RAPDO Black Elite Pass</span>
                     <span className="font-bold">₹4,999.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-white/60">Concierge Initiation</span>
                     <span className="font-bold">₹0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-4 border-t border-white/10">
                     <span className="text-white/80 font-bold uppercase tracking-widest text-xs">Total Segment</span>
                     <span className="text-2xl font-black tracking-tighter">₹4,999.00</span>
                  </div>
               </div>

               {/* Glowing 3D Razorpay Button */}
               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={handleRazorpayCheckout}
                 className={`
                   w-full py-5 rounded-[20px] font-black tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-all duration-300
                   bg-gradient-to-r from-emerald-500 to-teal-600 text-white
                   shadow-[0_8px_32px_0_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]
                   active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)] active:translate-y-0.5
                   ${isProcessing ? 'opacity-80 pointer-events-none' : 'hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]'}
                 `}
               >
                 {isProcessing ? (
                   <span className="animate-pulse">Initializing Gateway...</span>
                 ) : (
                   <>
                     Pay via Razorpay <ArrowRight className="w-5 h-5" />
                   </>
                 )}
               </motion.button>

               <div className="mt-6 flex items-center justify-center gap-4 text-white/40">
                  <Lock className="w-4 h-4" />
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Encrypted Session</span>
               </div>
            </motion.div>
         </div>

      </main>

      {/* Background Ambience Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
    </div>
  );
}
