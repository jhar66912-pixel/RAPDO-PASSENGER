import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, CreditCard, PlusCircle, History, ArrowUpRight, ArrowDownLeft, 
  ShieldCheck, Sparkles, Wallet as WalletIcon, ChevronRight, X, Loader2, CheckCircle2 
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../lib/auth';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { PaymentMethod } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function Wallet() {
  const { currentUser } = useAuth();
  
  // Real-time balance & methods
  const [balance, setBalance] = useState<number>(450);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | null }>({ message: '', type: null });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 4500);
  };

  // Modal controls
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [depositAmount, setDepositAmount] = useState('500');
  const [showAddMethod, setShowAddMethod] = useState(false);

  // Add payment states
  const [methodType, setMethodType] = useState<'upi' | 'card'>('upi');
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [upiVpa, setUpiVpa] = useState('');

  // Pre-seed default ledger if offline or clean account
  const seedLedger = [
    { transactionId: 'TXN-8491', title: 'Commute Ride Settled', amount: '-₹45', type: 'debit', date: 'Yesterday, 2:30 PM', createdAt: Date.now() - 86400000 },
    { transactionId: 'TXN-8490', title: 'Cash Deposit Vault', amount: '+₹500', type: 'credit', date: '2 days ago', createdAt: Date.now() - 172800000 }
  ];

  // Subscribe to profile & payment methods
  useEffect(() => {
    if (!currentUser) {
       setLoading(false);
       return;
    }

    // Subscribe to User collection for balance & methods
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
       if (docSnap.exists()) {
          const data = docSnap.data();
          setBalance(data.walletBalance !== undefined ? data.walletBalance : 450);
          setMethods(data.paymentMethods || [
             { id: 'pay-1', type: 'card', details: 'SBI Platinum •••• 4212', isDefault: true },
             { id: 'pay-2', type: 'upi', details: 'rahi@ybl', isDefault: false }
          ]);
       }
    });

    // Subscribe to live transactions
    const transQuery = query(collection(db, 'transactions'), where('customerId', '==', currentUser.uid));
    const unsubscribeTrans = onSnapshot(transQuery, (snap) => {
       const list = snap.docs.map(d => d.data());
       if (list.length === 0) {
          setTransactions(seedLedger);
       } else {
          // Sort descending
          const sorted = [...list].sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
          setTransactions(sorted);
       }
       setLoading(false);
    }, (err) => {
       console.warn("Transactions listen fail", err);
       setTransactions(seedLedger);
       setLoading(false);
    });

    return () => {
       unsubscribeUser();
       unsubscribeTrans();
    };
  }, [currentUser]);

  // Handle funds submission
  const handleAddFundsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
       showToast("Sahi amount daliye bhaiya!", "error");
       return;
    }

       try {
       setLoading(true);
       
       const isWithdrawal = currentUser?.role === 'captain';
       if (isWithdrawal && balance < amt) {
          showToast("Insufficient balance for withdrawal!", "error");
          setLoading(false);
          return;
       }

       const newBalance = isWithdrawal ? balance - amt : balance + amt;
       
       // Update User balance in Firestore
       await updateDoc(doc(db, 'users', currentUser.uid), {
          walletBalance: newBalance
       });

       // Create transactional trace log
       const txnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
       await setDoc(doc(db, 'transactions', txnId), {
          transactionId: txnId,
          customerId: currentUser.uid,
          title: isWithdrawal ? 'Bank IMPS Payout' : 'UPI Vault Top-up',
          amount: isWithdrawal ? `-₹${amt}` : `+₹${amt}`,
          type: isWithdrawal ? 'debit' : 'credit',
          date: 'Just Now',
          createdAt: Date.now()
       });

       showToast(`🎉 Shabaash! ₹${amt} successfully ${isWithdrawal ? 'withdrawn to bank' : 'added'} via digital gateways! Available Balance is now updated.`, "success");
       setShowAddFunds(false);
    } catch (err) {
       console.error("topup fails", err);
       showToast("Funding topup gateway is offline or network error occurred.", "error");
    } finally {
       setLoading(false);
    }
  };

  // Handle method summation
  const handleAddMethodSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!currentUser) return;

     let detailsStr = '';
     if (methodType === 'card') {
        if (cardNo.length < 12) {
           showToast("Sahi Card number enter kijiye!", "error");
           return;
        }
        detailsStr = `Card •••• ${cardNo.slice(-4)}`;
     } else {
        if (!upiVpa.includes('@')) {
           showToast("UPI ID me '@' hona jaruri hai!", "error");
           return;
        }
        detailsStr = upiVpa;
     }

     try {
        setLoading(true);
        const newMethod: PaymentMethod = {
           id: 'pay-' + Math.random().toString(36).substr(2, 9),
           type: methodType,
           details: detailsStr,
           isDefault: methods.length === 0
        };

        const updatedMethods = [...methods, newMethod];
        await updateDoc(doc(db, 'users', currentUser.uid), {
           paymentMethods: updatedMethods
        });

        showToast("🎉 Naya payment method successfully register ho gaya hai!", "success");
        _resetAddMethodForm();
     } catch (err) {
        console.error(err);
        showToast("Firestore write permissions missing/restricted.", "error");
     } finally {
        setLoading(false);
     }
  };

  const _resetAddMethodForm = () => {
     setShowAddMethod(false);
     setCardNo('');
     setCardExpiry('');
     setUpiVpa('');
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] min-h-screen font-sans text-left">
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#121212] shadow-2xl relative flex flex-col overflow-x-hidden">
        
        {/* Custom Glassmorphic Toast banner */}
        <AnimatePresence>
          {toast.type && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 16, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="absolute top-20 left-4 right-4 z-50 p-4 rounded-2xl bg-[#121212]/95 backdrop-blur-2xl border border-[#FFD000]/20 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-[#FFD000]/10 border border-[#FFD000]/30 flex items-center justify-center text-[#FFD000] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-white text-xs font-bold leading-snug">{toast.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fintech Premium Background Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1634973357973-f2ed255753e1?auto=format&fit=crop&q=80&w=800" 
            alt="Fintech Dark Gold Premium Background" 
            className="w-full h-full object-cover opacity-[0.08] mix-blend-screen scale-105 pointer-events-none"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/80 via-[#121212]/95 to-[#121212] pointer-events-none" />
        </div>

        {/* Holographic Glowing Orbs background effect */}
        <div className="absolute top-[-50px] left-[-50px] w-[250px] h-[250px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

        <div className="p-8 relative z-10 flex-1 overflow-y-auto no-scrollbar flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
             <div>
                <h1 className="text-2xl font-black text-white tracking-widest flex items-center gap-3 uppercase">
                   Vault <WalletIcon className="w-5 h-5 text-purple-400" />
                </h1>
                <p className="text-white/40 text-[11px] font-bold tracking-widest uppercase mt-1">Payments & Credits</p>
             </div>
          </div>

          {/* Fintech VIP Balance Card */}
          <div className="relative w-full h-[220px] rounded-[36px] p-[1px] bg-gradient-to-br from-purple-500/50 via-purple-500/10 to-transparent mb-10 overflow-hidden shadow-[0_20px_40px_-15px_rgba(168,85,247,0.2)]">
             <div className="absolute inset-0 bg-[#0F0F0F] rounded-[35px]">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-purple-600/20 rounded-full blur-[50px]"></div>
                <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-blue-600/20 rounded-full blur-[50px]"></div>
                
                <div className="relative z-10 p-8 h-full flex flex-col justify-between text-left">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                            <IndianRupee className="w-4 h-4 text-purple-400" />
                         </div>
                         <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Available Credit</span>
                      </div>
                      <span className="text-white/20 text-[10px] font-black tracking-[0.2em] uppercase">RAHI PAY</span>
                   </div>
                   
                   <div>
                      <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-medium text-white/50">₹</span>
                         <span className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">{balance.toFixed(2).split('.')[0]}<span className="text-3xl text-white/40">.{balance.toFixed(2).split('.')[1]}</span></span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex gap-4 mb-10 shrink-0">
             <button onClick={() => setShowAddFunds(true)} className={`flex-grow py-5 text-black text-[11px] uppercase tracking-widest font-black rounded-[24px] shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-2 ${currentUser?.role === 'captain' ? 'bg-[#00DF89] shadow-[#00DF89]/15' : 'bg-[#FFD000] shadow-[#FFD000]/15'}`}>
                {currentUser?.role === 'captain' ? <ArrowUpRight className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />} 
                {currentUser?.role === 'captain' ? 'Withdraw Funds' : 'Add Funds'}
             </button>
             <button onClick={() => setShowAddMethod(true)} className="flex-grow py-5 bg-[#1A1A1A] border border-white/5 text-white text-[11px] uppercase tracking-widest font-black rounded-[24px] hover:bg-white/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-2">
                <CreditCard className="w-5 h-5 text-white/50" /> Add Method
             </button>
          </div>

          {/* Linked Payment Methods Feed */}
          <div className="mb-10 text-left">
             <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Credentials Ledger</h3>
             <div className="space-y-3">
                {methods.map(met => (
                   <div key={met.id} className="bg-[#1A1A1A] border border-white/5 rounded-[24px] p-4 flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center p-1 border border-white/5 shrink-0">
                            {met.type === 'upi' ? (
                               <div className="flex font-black text-[10px] text-emerald-400">UPI</div>
                            ) : (
                               <CreditCard className="w-5 h-5 text-[#FFD000]" />
                            )}
                         </div>
                         <div>
                            <p className="text-white font-bold text-xs tracking-wide">{met.details}</p>
                            <p className="text-white/40 text-[9px] tracking-widest uppercase">{met.isDefault ? 'Primary Gateway' : 'Support Channel'}</p>
                         </div>
                      </div>
                      {met.isDefault && (
                         <span className="text-[8px] bg-purple-500/10 text-[#FFD000] border border-[#FFD000]/20 font-bold px-2 py-1 rounded uppercase tracking-wider">Default</span>
                      )}
                   </div>
                ))}
             </div>
          </div>

          {/* Transactions Record */}
          <div className="flex-1 overflow-y-auto no-scrollbar text-left">
             <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Recent Ledger</h3>
             <div className="space-y-4">
                {transactions.map(t => (
                   <div key={t.transactionId || t.id} className="flex justify-between items-center group cursor-pointer hover:translate-x-1 transition-transform">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 ${t.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#1A1A1A] text-white/50 border border-white/5'}`}>
                            {t.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                         </div>
                         <div>
                            <p className="text-white text-xs font-bold tracking-wide">{t.title}</p>
                            <p className="text-white/40 text-[9px] font-bold tracking-widest uppercase mt-0.5">{t.date}</p>
                         </div>
                      </div>
                      <p className={`text-md font-black tracking-tighter ${t.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                         {t.amount}
                      </p>
                   </div>
                ))}
             </div>
          </div>

        </div>
        <BottomNav />
      </div>

      {/* Add Funds Modal Drawer */}
      {showAddFunds && (
         <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#121212] rounded-[42px] border border-purple-500/20 p-8 max-w-sm w-full shadow-2xl relative text-center">
               <button 
                 onClick={() => setShowAddFunds(false)}
                 className="absolute top-4 right-4 text-white/40 hover:text-white w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
               >
                  <X className="w-4 h-4" />
               </button>
               
               <h3 className="text-2xl font-black text-white mt-4 mb-2 tracking-tight">{currentUser?.role === 'captain' ? 'Withdraw to Bank' : 'Top-up Vault Balance'}</h3>
               <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-6">Secured Instant Settlement</p>

               <form onSubmit={handleAddFundsSubmit} className="space-y-5 text-left">
                  <div>
                     <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">{currentUser?.role === 'captain' ? 'Withdraw Amount' : 'Deposit Amount'}</label>
                     <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-[#FFD000]">₹</span>
                        <input 
                          type="number"
                          required
                          value={depositAmount}
                          onChange={e => setDepositAmount(e.target.value)}
                          placeholder="Enter Amount"
                          className="block w-full pl-10 pr-4 py-4 bg-[#1A1A1A] border border-white/10 rounded-xl text-lg font-mono font-bold outline-none text-white focus:border-purple-500"
                        />
                     </div>
                  </div>

                  {/* Amount presets */}
                  <div className="grid grid-cols-3 gap-2">
                     {['100', '500', '1000'].map(p => (
                        <button 
                          key={p} type="button" onClick={() => setDepositAmount(p)}
                          className="py-2.5 bg-[#1A1A1A] hover:bg-neutral-800 border border-white/5 rounded-xl text-[10px] font-mono text-white text-center font-bold"
                        >
                           +₹{p}
                        </button>
                     ))}
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#FFD000] text-black font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 hover:scale-[1.01]"
                  >
                     Confirm Settlement
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* Add Payment Method Drawer */}
      {showAddMethod && (
         <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#121212] rounded-[42px] border border-purple-500/20 p-8 max-w-sm w-full shadow-2xl relative text-center">
               <button 
                 onClick={_resetAddMethodForm}
                 className="absolute top-4 right-4 text-white/40 hover:text-white w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
               >
                  <X className="w-4 h-4" />
               </button>
               
               <h3 className="text-2xl font-black text-white mt-4 mb-2 tracking-tight">Add Payment Source</h3>
               <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-6">Link Cards or UPI IDs</p>

               <div className="flex gap-2 p-1 bg-[#1A1A1A] rounded-xl border border-white/5 mb-6">
                  <button 
                    type="button" onClick={() => setMethodType('upi')}
                    className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${methodType === 'upi' ? 'bg-[#FFD000] text-black font-black' : 'text-white/40'}`}
                  >
                     UPI Address
                  </button>
                  <button 
                    type="button" onClick={() => setMethodType('card')}
                    className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${methodType === 'card' ? 'bg-[#FFD000] text-black font-black' : 'text-white/40'}`}
                  >
                     Credit/Debit Card
                  </button>
               </div>

               <form onSubmit={handleAddMethodSubmit} className="space-y-4 text-left">
                  {methodType === 'upi' ? (
                     <div>
                        <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-1.5 font-bold">UPI ID (VPA)</label>
                        <input 
                          type="text"
                          required
                          value={upiVpa}
                          onChange={e => setUpiVpa(e.target.value)}
                          placeholder="e.g. user@ybl"
                          className="block w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-xs font-mono outline-none text-white focus:border-purple-500"
                        />
                     </div>
                  ) : (
                     <div className="space-y-3">
                        <div>
                           <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-1.5 font-bold">Card Number</label>
                           <input 
                             type="number"
                             required
                             value={cardNo}
                             onChange={e => setCardNo(e.target.value)}
                             placeholder="16-digit card numbers"
                             className="block w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-xs font-mono outline-none text-white focus:border-purple-500"
                           />
                        </div>
                        <div>
                           <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-1.5 font-bold">Expiry Code</label>
                           <input 
                             type="text"
                             required
                             value={cardExpiry}
                             onChange={e => setCardExpiry(e.target.value)}
                             placeholder="MM/YY"
                             className="block w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-xs font-mono outline-none text-white focus:border-purple-500"
                           />
                        </div>
                     </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-4 bg-[#FFD000] text-black font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
                  >
                     Secure Link Gateway
                  </button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
