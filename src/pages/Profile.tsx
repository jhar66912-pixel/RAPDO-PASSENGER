import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, CreditCard, Clock, Star, Settings, MessageSquare, ChevronRight, 
  MapPin, Gift, Crown, Zap, AlertOctagon, Share2, Plus, Trash, X, Send, 
  Phone, Globe, Check, Loader2, ArrowLeft, CheckCircle2, AlertCircle, Sparkles,
  User as UserIcon, LifeBuoy, Bell, Lock, Volume2
} from 'lucide-react';
import { doc, setDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import BottomNav from '../components/BottomNav';

type ToastType = {
  message: string;
  type: 'success' | 'error' | 'info';
};

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Custom states for sub-screens
  const [activeSubmenu, setActiveSubmenu] = useState<'main' | 'edit-profile' | 'addresses' | 'contacts' | 'payments' | 'rewards' | 'safety' | 'support' | 'settings'>('main');
  const [toast, setToast] = useState<ToastType | null>(null);

  // Form states
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editMobile, setEditMobile] = useState(currentUser?.mobile || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '🧑🏽');

  // Address inputs
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrVal, setNewAddrVal] = useState('');

  // Contact inputs
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  // Payment inputs
  const [payType, setPayType] = useState<'upi' | 'card'>('upi');
  const [upiVal, setUpiVal] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Live support chat states
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'support'; text: string; time: string }>>([
    { sender: 'support', text: 'Arrey pranam bhaiya! Hum hain Lallan, RAPDO Support Sathi. Ka dikkat aa raha hai batayiye, Patna ke traffic me hum hi sabse tez hain!', time: 'Now' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [langPreference, setLangPreference] = useState<'en' | 'hi'>('en');

  // Support ticket fields
  const [ticketIssue, setTicketIssue] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Rewards state
  const [scratchRewardId, setScratchRewardId] = useState<string | null>(null);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [scratchRevealed, setScratchRevealed] = useState(false);

  // Safety/SOS State
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [sharedContacts, setSharedContacts] = useState<string[]>([]);

  // Update form inputs when currentUser snapshot live updates
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditMobile(currentUser.mobile);
      setEditAvatar(currentUser.avatar || '🧑🏽');
    }
  }, [currentUser]);

  // SOS Count down handler
  useEffect(() => {
    if (sosCountdown === null) return;
    if (sosCountdown === 0) {
      setSosActive(true);
      setSosCountdown(null);
      showToast('⚠️ Patna Emergency Dispatch Informed. SOS Active! GPS sharing initiated.', 'error');
      // write alarm status or log to firestore
      if (currentUser) {
        addDoc(collection(db, 'safety_alerts'), {
          customerId: currentUser.uid,
          customerName: currentUser.name,
          customerMobile: currentUser.mobile,
          timestamp: Date.now(),
          status: 'unresolved'
        }).catch(err => console.warn(err));
      }
      return;
    }
    const timer = setTimeout(() => {
      setSosCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [sosCountdown]);

  // Toast trigger
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        name: editName,
        mobile: editMobile,
        avatar: editAvatar
      }, { merge: true });
      showToast('Profile credentials synchronized successfully with Firestore!', 'success');
      setActiveSubmenu('main');
    } catch (err: any) {
      showToast(err.message || 'Error updating profile', 'error');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newAddrLabel || !newAddrVal) return;
    try {
      const updatedAddresses = [
        ...(currentUser.savedAddresses || []),
        { id: 'addr-' + Date.now(), label: newAddrLabel, address: newAddrVal }
      ];
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { savedAddresses: updatedAddresses }, { merge: true });
      setNewAddrLabel('');
      setNewAddrVal('');
      showToast('Address linked securely to your RAPDO account', 'success');
    } catch (err: any) {
      showToast('Unable to secure address', 'error');
    }
  };

  const handleRemoveAddress = async (addrId: string) => {
    if (!currentUser) return;
    try {
      const filtered = (currentUser.savedAddresses || []).filter(a => a.id !== addrId);
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { savedAddresses: filtered }, { merge: true });
      showToast('Address unlinked successfully', 'info');
    } catch (err) {
      showToast('Error removing address', 'error');
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newContactName || !newContactPhone) return;
    try {
      const updatedContacts = [
        ...(currentUser.emergencyContacts || []),
        { id: 'cont-' + Date.now(), name: newContactName, phone: newContactPhone }
      ];
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { emergencyContacts: updatedContacts }, { merge: true });
      setNewContactName('');
      setNewContactPhone('');
      showToast('Emergency contact stored successfully', 'success');
    } catch (err) {
      showToast('Error adding contact', 'error');
    }
  };

  const handleRemoveContact = async (contId: string) => {
    if (!currentUser) return;
    try {
      const filtered = (currentUser.emergencyContacts || []).filter(c => c.id !== contId);
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { emergencyContacts: filtered }, { merge: true });
      showToast('Emergency safety contact removed', 'info');
    } catch (err) {
      showToast('Error removing contact', 'error');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsProcessingPayment(true);

    setTimeout(async () => {
      try {
        let details = '';
        if (payType === 'upi') {
          if (!upiVal.includes('@')) {
            showToast('Bhaiya, kripa karke valid UPI address daliye!', 'error');
            setIsProcessingPayment(false);
            return;
          }
          details = upiVal;
        } else {
          if (cardNumber.length < 12) {
            showToast('Valid 16 digit card pattern required', 'error');
            setIsProcessingPayment(false);
            return;
          }
          details = `•••• •••• •••• ${cardNumber.slice(-4)}`;
        }

        const isFirst = (currentUser.paymentMethods || []).length === 0;
        const newPay = {
          id: 'pay-' + Date.now(),
          type: payType,
          details,
          isDefault: isFirst
        };

        const updated = [...(currentUser.paymentMethods || []), newPay];
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { paymentMethods: updated }, { merge: true });

        // Add mock credit for card binding reward
        showToast('Razorpay Gateway setup complete: Method Saved!', 'success');
        setUpiVal('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
      } catch (err) {
        showToast('Could not register payment method', 'error');
      } finally {
        setIsProcessingPayment(false);
      }
    }, 1800); // realistic payment simulation pause
  };

  const handleSetDefaultPayment = async (id: string) => {
    if (!currentUser) return;
    try {
      const updated = (currentUser.paymentMethods || []).map(p => ({
        ...p,
        isDefault: p.id === id
      }));
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { paymentMethods: updated }, { merge: true });
      showToast('Default payment method updated', 'success');
    } catch (err) {
      showToast('Error setting default payment', 'error');
    }
  };

  const handleRemovePayment = async (id: string) => {
    if (!currentUser) return;
    try {
      const filtered = (currentUser.paymentMethods || []).filter(p => p.id !== id);
      // Ensure we have at least one default if arrays are not empty
      if (filtered.length > 0 && !filtered.find(p => p.isDefault)) {
        filtered[0].isDefault = true;
      }
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { paymentMethods: filtered }, { merge: true });
      showToast('Payment method unlinked safely', 'info');
    } catch (err) {
      showToast('Error removing payment method', 'error');
    }
  };

  const handleScratch = async (rewardId: string, value: number) => {
    if (!currentUser) return;
    try {
      setScratchProgress(100);
      setScratchRevealed(true);
      
      const updatedRewards = (currentUser.rewards || []).map(r => {
        if (r.id === rewardId) {
          return { ...r, status: 'scratched' as const };
        }
        return r;
      });

      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { rewards: updatedRewards }, { merge: true });

      // Add actual wallet transactions in Firestore
      const newTransaction = {
        transactionId: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
        title: `Scratch Reward: Cashback`,
        amount: `+₹${value}`,
        type: 'credit',
        date: 'Just Now'
      };

      await addDoc(collection(db, 'transactions'), {
        ...newTransaction,
        customerId: currentUser.uid,
        createdAt: Date.now()
      });

      showToast(`🎉 Shabaash! ₹${value} added directly to your Vault dashboard.`, 'success');
    } catch (e) {
      showToast('Rewards server error, retry', 'error');
    }
  };

  const handleSupportMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: nowStr }]);
    setChatInput('');

    // Local AI support smart matchmaking logic
    setTimeout(() => {
      let response = '';
      const lower = userMsg.toLowerCase();
      if (lower.includes('rate') || lower.includes('fare') || lower.includes('paisa') || lower.includes('paisay')) {
        response = "Bhaiya, hamara fixed route fare bilkul green pricing hai. No extra charge, no surge! Samastipur, Patna ya Darbhanga commute ke liye sabse kam paisa lagta hai. Wallet ya UPI se turant payment kijiye!";
      } else if (lower.includes('delayed') || lower.includes('time') || lower.includes('late') || lower.includes('kahan') || lower.includes('where')) {
        response = "Suno na babu, road par traffic ka jhamela chal raha hai shayad, par humare Captain bullet speed se shortcut rasta pakad ke pahunch rahe hain. GPS track kijiye live!";
      } else if (lower.includes('otp') || lower.includes('pin')) {
        response = "Chinta mat kijiye! Ride shuru karne se pehle driver ko aapka Ride PIN (4 digit) dena hota hai. Apni OTP screen par check karein.";
      } else if (lower.includes('cancel') || lower.includes('refund')) {
        response = "Arrey! Agar cancellation ho gaya hai toh paise seedhe aapke RAPDO Pay Vault wallet me 5 minute me wapas bhej diye jayenge. Vault balance check karein!";
      } else if (lower.includes('bhojpuri') || lower.includes('bhasha')) {
        response = "Kaa haal ba bhaiya! Humka Bhojpuri, Maithili aur Angika sab aawela. Aapke poora sahyog milega Bihar ke digital badlaav me.";
      } else if (lower.includes('safety') || lower.includes('sos') || lower.includes('police')) {
        response = "Safety Center me direct SOS button dabate hi humare special command room aur local Patna/Bihar police ko alert chala jata hai, trip live share kijiye!";
      } else {
        response = "Arrey shabaash! RAPDO Bihar ki apni sabse tez, safe aur swadeshi ride service hai. Bhaiya koi ticket file karna chahein toh neeche dijiye, hum turant help karenge!";
      }
      setChatMessages(prev => [...prev, { sender: 'support', text: response, time: nowStr }]);
    }, 1000);
  };

  const handleCreateSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !ticketIssue || !ticketDesc) return;
    setIsSubmittingTicket(true);

    try {
      const ticket = {
        customerId: currentUser.uid,
        customerName: currentUser.name,
        issue: ticketIssue,
        desc: ticketDesc,
        priority: ticketPriority,
        status: 'open',
        createdAt: Date.now()
      };

      await addDoc(collection(db, 'support_tickets'), ticket);
      showToast('🎫 Support ticket #RAPDO-' + Math.floor(1000+Math.random()*9000) + ' saved! Helper dispatched.', 'success');
      setTicketIssue('');
      setTicketDesc('');
    } catch (err) {
      showToast('Unable to transmit ticket', 'error');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] min-h-screen font-sans">
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#121212] shadow-2xl relative flex flex-col overflow-x-hidden min-h-screen pb-24">
        
        {/* Dynamic Holographic Aura Background */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#FFC107]/10 via-[#FFC107]/5 to-transparent pointer-events-none" />
        <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[60px] mix-blend-screen pointer-events-none" />

        {/* Global Toast Notification */}
        {toast && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[340px] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`p-4 rounded-[20px] shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
              toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' :
              toast.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-300' :
              'bg-blue-950/90 border-blue-500/30 text-blue-300'
            }`}>
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {toast.type === 'error' && <AlertOctagon className="w-5 h-5 shrink-0" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5 shrink-0" />}
              <p className="text-[11px] font-bold leading-relaxed">{toast.message}</p>
            </div>
          </div>
        )}

        {/* ====================================
            MAIN PROFILE INDEX VIEW
           ==================================== */}
        {activeSubmenu === 'main' && (
          <div className="p-8 relative z-10 flex-grow overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
               <h1 className="text-2xl font-black text-white tracking-widest uppercase">ID Card</h1>
               <div className="flex gap-2">
                  <button onClick={() => setActiveSubmenu('settings')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                     <Settings className="w-4 h-4 text-white/70" />
                  </button>
                  <button onClick={() => {
                    navigator.clipboard.writeText('Join Bihar\'s premium custom taxi network! Register now on RAPDO.');
                    showToast('Sharing link copied to your clipboard!', 'info');
                  }} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                     <Share2 className="w-4 h-4 text-white/70" />
                  </button>
               </div>
            </div>

            {/* Profile Avatar Card */}
            <div className="flex flex-col items-center mb-8 group cursor-pointer" onClick={() => setActiveSubmenu('edit-profile')}>
               <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FFC107] to-purple-500 rounded-full blur-[20px] opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500"></div>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFC107] to-[#FFB300] p-[3px] relative z-10 shadow-xl">
                     <div className="w-full h-full bg-[#121212] rounded-full flex items-center justify-center overflow-hidden border-4 border-[#121212]">
                        <span className="text-4xl group-hover:scale-110 transition-all duration-300">{currentUser?.avatar || '🧑🏽'}</span>
                     </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#121212] rounded-full p-1 border border-white/10 z-20 shadow-lg">
                     <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(52,211,153,0.4)]">
                        <Star className="w-2.5 h-2.5 fill-black text-black" /> 4.96
                     </div>
                  </div>
               </div>
               
               <h2 className="text-2xl font-black text-white mt-4 tracking-tight flex items-center gap-2">
                 {currentUser?.name || 'Rahul Kumar'} 
                 <span className="text-xs text-[#FFC107] font-black uppercase tracking-wider bg-white/5 px-2 py-1 rounded-md">Edit</span>
               </h2>
               <p className="text-white/40 text-xs font-bold tracking-widest mt-1">
                 {currentUser?.mobile ? `+91 ${currentUser.mobile}` : '+91 94310 XXXXX'}
               </p>
            </div>

            {/* Tesla-style Membership Credit Card */}
            <div className="relative w-full h-[150px] rounded-[32px] p-[1px] bg-gradient-to-br from-[#FFC107]/60 via-[#FFC107]/20 to-transparent mb-8 overflow-hidden shadow-[0_20px_40px_-15px_rgba(255,193,7,0.25)]">
               <div className="absolute inset-0 bg-[#0A0A0A] rounded-[31px]">
                  <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-[#FFC107]/20 rounded-full blur-[40px]"></div>
                  
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                           <Crown className="w-5 h-5 text-[#FFC107]" />
                           <span className="text-[#FFC107] text-xs font-black tracking-widest uppercase">RAPDO Gold Medalist</span>
                        </div>
                        <span className="text-white/30 text-[9px] tracking-widest font-black">VALID THRU 12/26</span>
                     </div>
                     
                     <div className="flex justify-between items-end">
                        <div>
                           <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Vault Pay Balance</p>
                           <p className="text-3xl font-black text-white tracking-tighter">₹450.00</p>
                        </div>
                        <Link to="/wallet" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FFC107] hover:text-black transition-all cursor-pointer text-white">
                           <ChevronRight className="w-5 h-5" />
                        </Link>
                     </div>
                  </div>
               </div>
            </div>

            {/* Submenus List */}
            <div className="space-y-3 mb-10">
               <button onClick={() => setActiveSubmenu('edit-profile')} className="w-full text-left">
                  <MenuRow icon={<UserIcon />} title="Update Credentials" subtitle="Control custom displays" />
               </button>
               <button onClick={() => setActiveSubmenu('addresses')} className="w-full text-left">
                  <MenuRow icon={<MapPin />} title="Saved Addresses" subtitle="Instant access nodes" />
               </button>
               <button onClick={() => setActiveSubmenu('payments')} className="w-full text-left">
                  <MenuRow icon={<CreditCard />} title="Payment Methods" subtitle="Configure UPI & Debit gateways" />
               </button>
               <button onClick={() => setActiveSubmenu('rewards')} className="w-full text-left">
                  <MenuRow icon={<Gift />} title="Rewards Hub" subtitle="Unpack premium scratch cashbacks" highlight />
               </button>
               <button onClick={() => setActiveSubmenu('contacts')} className="w-full text-left">
                  <MenuRow icon={<Shield />} title="Safety Contacts" subtitle="Linked SOS target logs" />
               </button>
               <button onClick={() => setActiveSubmenu('safety')} className="w-full text-left">
                  <MenuRow icon={<Shield />} title="SOS Safety Center" subtitle="Emergency alarm, alerts & sharing" danger />
               </button>
               <button onClick={() => setActiveSubmenu('support')} className="w-full text-left">
                  <MenuRow icon={<MessageSquare />} title="Help & Support Desk" subtitle="Bilingual regional AI Companion chat" />
               </button>
            </div>

            {/* Logout Row */}
            <div className="text-center pb-6">
               <button 
                  onClick={() => {
                    const confirmed = window.confirm("Bhaiya, kya aap sach me logout karna chahte hain?");
                    if (confirmed) {
                      logout();
                      showToast('Logged out of RAPDO ecosystem safely.', 'info');
                    }
                  }} 
                  className="px-6 py-3.5 rounded-2xl bg-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-red-500/20 active:scale-95 transition-all"
               >
                  <AlertOctagon className="w-4 h-4" /> Sign Out Securely
               </button>
               <p className="text-white/20 text-[9px] font-black tracking-widest mt-6 uppercase">RAPDO Super App v3.0 | RAPDO Technologies</p>
            </div>
          </div>
        )}

        {/* ====================================
            EDIT PROFILE INFO VIEW
           ==================================== */}
        {activeSubmenu === 'edit-profile' && (
          <div className="p-8 relative z-10 flex-grow flex flex-col overflow-y-auto no-scrollbar">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setActiveSubmenu('main')} className="w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-center">
                   <ArrowLeft className="w-5 h-5 text-white/70" />
                </button>
                <h3 className="text-lg font-black uppercase tracking-widest text-[#FFC107]">Configure Identity</h3>
             </div>

             <form onSubmit={handleSaveProfile} className="space-y-6 flex-grow">
                <div>
                   <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-3">Pick Avatar</label>
                   <div className="grid grid-cols-5 gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl">
                      {['🧑🏽', '👨🏻', '👨🏼‍💻', '👩🏽', '🧔', '👵', '🦁', '🏍️', '🤖', '👑'].map(e => (
                         <button 
                           type="button" key={e} 
                           onClick={() => setEditAvatar(e)}
                           className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all ${editAvatar === e ? 'bg-[#FFC107] scale-110 shadow-lg' : 'hover:bg-white/5'}`}
                         >
                            {e}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <div>
                      <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">Display Name</label>
                      <input 
                        type="text" required
                        value={editName} onChange={e => setEditName(e.target.value)}
                        className="block w-full px-5 py-4 border border-white/5 bg-white/[0.02] text-white rounded-xl text-sm font-bold tracking-wide outline-none focus:bg-white/[0.04] transition-colors"
                      />
                   </div>
                   <div>
                      <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">Contact Mobile</label>
                      <input 
                        type="tel" required
                        value={editMobile} onChange={e => setEditMobile(e.target.value)}
                        placeholder="Mobile without prefix"
                        className="block w-full px-5 py-4 border border-white/5 bg-white/[0.02] text-white rounded-xl text-sm font-bold tracking-wide outline-none focus:bg-white/[0.04] transition-colors"
                      />
                   </div>
                </div>

                <button 
                   type="submit" 
                   className="w-full py-5 bg-gradient-to-r from-[#FFC107] to-[#FFB300] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(255,193,7,0.2)] hover:scale-[1.02] active:scale-95 transition-all mt-8"
                >
                   Save credentials
                </button>
             </form>
          </div>
        )}

        {/* ====================================
            SAVED ADDRESSES MANAGER
           ==================================== */}
        {activeSubmenu === 'addresses' && (
          <div className="p-8 relative z-10 flex-grow flex flex-col overflow-y-auto no-scrollbar">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setActiveSubmenu('main')} className="w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-center">
                   <ArrowLeft className="w-5 h-5 text-white/70" />
                </button>
                <h3 className="text-lg font-black uppercase tracking-widest text-[#FFC107]">Saved Addresses</h3>
             </div>

             {/* Existing Addresses */}
             <div className="space-y-3 mb-8">
                {(currentUser?.savedAddresses || []).length === 0 ? (
                   <p className="text-center text-xs text-white/30 italic">No saved locations found. Create one below!</p>
                ) : (
                   (currentUser?.savedAddresses || []).map(addr => (
                      <div key={addr.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-start group hover:border-[#FFC107]/10 transition-colors">
                         <div className="space-y-1">
                            <h4 className="text-xs font-black text-[#FFC107] uppercase tracking-wider">{addr.label}</h4>
                            <p className="text-white/60 text-xs leading-relaxed max-w-[220px]">{addr.address}</p>
                         </div>
                         <button 
                            onClick={() => handleRemoveAddress(addr.id)}
                            className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors shrink-0"
                         >
                            <Trash className="w-3.5 h-3.5" />
                         </button>
                      </div>
                   ))
                )}
             </div>

             {/* Form to add */}
             <form onSubmit={handleAddAddress} className="bg-white/5 border border-white/5 p-6 rounded-[28px] space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-white/80">Link Node</h4>
                <input 
                  type="text" required placeholder="Label (e.g., Coaching Center)"
                  value={newAddrLabel} onChange={e => setNewAddrLabel(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-bold outline-none text-white focus:bg-white/[0.04]"
                />
                <textarea 
                  required placeholder="Complete address detail..."
                  value={newAddrVal} onChange={e => setNewAddrVal(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-bold outline-none text-white focus:bg-white/[0.04] resize-none h-16"
                />
                <button type="submit" className="w-full py-4 bg-white hover:bg-neutral-200 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                   <Plus className="w-4 h-4" /> Link Address
                </button>
             </form>
          </div>
        )}

        {/* ====================================
            EMERGENCY SAFETY CONTACTS
           ==================================== */}
        {activeSubmenu === 'contacts' && (
          <div className="p-8 relative z-10 flex-grow flex flex-col overflow-y-auto no-scrollbar">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setActiveSubmenu('main')} className="w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-center">
                   <ArrowLeft className="w-5 h-5 text-white/70" />
                </button>
                <h3 className="text-lg font-black uppercase tracking-widest text-[#FFC107]">Emergency Contacts</h3>
             </div>

             {/* Existing contacts */}
             <div className="space-y-3 mb-8">
                {(currentUser?.emergencyContacts || []).length === 0 ? (
                   <p className="text-center text-xs text-white/30 italic">No contacts added yet.</p>
                ) : (
                   (currentUser?.emergencyContacts || []).map(cont => (
                      <div key={cont.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center hover:border-red-500/20 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                               <Shield className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-white">{cont.name}</p>
                               <p className="text-xs text-white/40 tracking-wider font-mono mt-0.5">{cont.phone}</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => handleRemoveContact(cont.id)}
                            className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors"
                         >
                            <Trash className="w-3.5 h-3.5" />
                         </button>
                      </div>
                   ))
                )}
             </div>

             {/* Form to add */}
             <form onSubmit={handleAddContact} className="bg-white/5 border border-white/5 p-6 rounded-[28px] space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-white/80">Add Safety Person</h4>
                <input 
                  type="text" required placeholder="Contact Name"
                  value={newContactName} onChange={e => setNewContactName(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-bold outline-none text-white"
                />
                <input 
                  type="text" required placeholder="Phone Number"
                  value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-bold outline-none text-white font-mono"
                />
                <button type="submit" className="w-full py-4 bg-[#FFC107] text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01]">
                   <Plus className="w-4 h-4" /> Link Safety Contact
                </button>
             </form>
          </div>
        )}

        {/* ====================================
            PAYMENT METHODS / WALLET GATEWAYS
           ==================================== */}
        {activeSubmenu === 'payments' && (
          <div className="p-8 relative z-10 flex-grow flex flex-col overflow-y-auto no-scrollbar">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setActiveSubmenu('main')} className="w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-center">
                   <ArrowLeft className="w-5 h-5 text-white/70" />
                </button>
                <h3 className="text-lg font-black uppercase tracking-widest text-[#FFC107]">UPI & Gateways</h3>
             </div>

             {/* List current payment methods */}
             <div className="space-y-4 mb-8">
                {(currentUser?.paymentMethods || []).map(p => (
                   <div key={p.id} className={`p-5 rounded-2xl border ${p.isDefault ? 'bg-purple-950/20 border-purple-500/50' : 'bg-white/[0.02] border-white/5'} flex justify-between items-center hover:border-purple-500/30 transition-all`}>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shrink-0">
                            {p.type === 'upi' ? (
                               <span className="text-black font-black text-xs">UPI</span>
                            ) : (
                               <CreditCard className="w-5 h-5 text-purple-600" />
                            )}
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                               <p className="text-white text-xs font-bold tracking-wide">{p.details}</p>
                               {p.isDefault && (
                                  <span className="text-[7px] font-black uppercase tracking-widest bg-purple-500 text-white px-1.5 py-0.5 rounded">Default</span>
                               )}
                            </div>
                            <p className="text-white/40 text-[9px] tracking-widest uppercase mt-0.5">{p.type === 'upi' ? 'Axis UPI Network' : 'Visa/Master Secure Portal'}</p>
                         </div>
                      </div>
                      
                      <div className="flex gap-2">
                         {!p.isDefault && (
                            <button 
                              onClick={() => handleSetDefaultPayment(p.id)}
                              className="text-[9px] font-bold uppercase tracking-wider text-purple-400 bg-white/5 hover:bg-purple-400 hover:text-black px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                               Default
                            </button>
                         )}
                         <button 
                           onClick={() => handleRemovePayment(p.id)}
                           className="w-8 h-8 rounded-full bg-red-500/5 hover:bg-red-500/10 text-red-400 flex items-center justify-center"
                         >
                            <Trash className="w-3.5 h-3.5" />
                         </button>
                      </div>
                   </div>
                ))}
             </div>

             {/* Add Method Tabs */}
             <div className="bg-white/5 border border-white/5 p-6 rounded-[28px] relative overflow-hidden">
                {isProcessingPayment && (
                   <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center p-4">
                      <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
                      <p className="text-xs font-black tracking-widest uppercase text-white">Connecting Razorpay Gateway...</p>
                      <p className="text-[10px] text-white/50 mt-1 italic">MFA Security Encryption Active</p>
                   </div>
                )}

                <div className="flex gap-2 p-1 bg-[#121212] border border-white/5 rounded-xl mb-5">
                   <button 
                     type="button" onClick={() => setPayType('upi')}
                     className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${payType === 'upi' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40'}`}
                   >
                      Link UPI
                   </button>
                   <button 
                     type="button" onClick={() => setPayType('card')}
                     className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${payType === 'card' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40'}`}
                   >
                      Link Card
                   </button>
                </div>

                <form onSubmit={handleAddPayment} className="space-y-4">
                   {payType === 'upi' ? (
                      <div>
                         <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">UPI VPA</label>
                         <input 
                           type="text" required placeholder="username@upi_handle"
                           value={upiVal} onChange={e => setUpiVal(e.target.value)}
                           className="block w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-bold outline-none text-white focus:border-purple-500"
                         />
                      </div>
                   ) : (
                      <div className="space-y-3">
                         <div>
                            <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Card Number</label>
                            <input 
                              type="text" required placeholder="Card digits without spaces"
                              maxLength={16}
                              value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                              className="block w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-bold outline-none text-white focus:border-purple-500 font-mono"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                            <div>
                               <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Expiry</label>
                               <input 
                                 type="text" required placeholder="MM/YY"
                                 maxLength={5}
                                 value={cardExpiry} onChange={e => setCardExpiry(e.target.value)}
                                 className="block w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-bold outline-none text-white focus:border-purple-500 font-mono"
                               />
                            </div>
                            <div>
                               <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">CVV</label>
                               <input 
                                 type="password" required placeholder="***"
                                 maxLength={3}
                                 value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                 className="block w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-bold outline-none text-white focus:border-purple-500 font-mono"
                               />
                            </div>
                         </div>
                      </div>
                   )}
                   <button type="submit" className="w-full py-4 bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all hover:bg-purple-500 shadow-lg flex items-center justify-center gap-2">
                      <CreditCard className="w-4 h-4" /> Link Payment Portal
                   </button>
                </form>
             </div>
          </div>
        )}

        {/* ====================================
            REWARDS HUB GAMIFIED SCRATCH CARDS
           ==================================== */}
        {activeSubmenu === 'rewards' && (
          <div className="p-8 relative z-10 flex-grow flex flex-col overflow-y-auto no-scrollbar">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setActiveSubmenu('main')} className="w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-center">
                   <ArrowLeft className="w-5 h-5 text-white/70" />
                </button>
                <h3 className="text-lg font-black uppercase tracking-widest text-[#FFC107]">Rewards Hub</h3>
             </div>

             {/* Dynamic scratch cards grid */}
             <div className="grid grid-cols-1 gap-5 mb-8">
                {(currentUser?.rewards || []).map(rew => (
                   <div key={rew.id} className="relative group rounded-[28px] overflow-hidden border border-white/5 shadow-2xl p-[1px] bg-gradient-to-br from-white/10 to-transparent">
                      <div className="bg-[#1A1A1A] p-6 rounded-[27px] flex justify-between items-center relative overflow-hidden">
                         <div className="absolute top-[-5px] right-[-5px] w-20 h-20 bg-[#FFC107]/10 rounded-full blur-[20px] pointer-events-none"></div>
                         
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <Gift className="w-4.5 h-4.5 text-[#FFC107]" />
                               <h4 className="text-sm font-black text-white tracking-wide">{rew.title}</h4>
                            </div>
                            <p className="text-white/50 text-[11px] leading-relaxed max-w-[200px] mb-4">{rew.desc}</p>
                            
                            {rew.status === 'unscratched' ? (
                               <button 
                                 onClick={() => {
                                   setScratchRewardId(rew.id);
                                   setScratchProgress(0);
                                   setScratchRevealed(false);
                                 }}
                                 className="px-4 py-2 bg-[#FFC107] hover:bg-[#F2C500] text-black font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-[0_5px_15px_rgba(255,193,7,0.3)] animate-bounce"
                               >
                                  Scratch Card
                               </button>
                            ) : (
                               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">✓ Claimed +₹{rew.value}</span>
                            )}
                         </div>

                         {rew.status === 'unscratched' ? (
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400/20 to-pink-500/30 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                               <span className="text-3xl">🎁</span>
                            </div>
                         ) : (
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex flex-col items-center justify-center border border-emerald-500/30 shrink-0">
                               <p className="text-2xl font-black text-emerald-400 tracking-tighter">₹{rew.value}</p>
                               <p className="text-[7px] font-black text-[#FFC107]/50 tracking-widest">CASH</p>
                            </div>
                         )}
                      </div>
                   </div>
                ))}
             </div>

             {/* Scratch Card Reveal Dialog Overlap */}
             {scratchRewardId && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                   {(() => {
                      const selected = (currentUser?.rewards || []).find(r => r.id === scratchRewardId);
                      if (!selected) return null;
                      return (
                         <div className="bg-[#121212] rounded-[42px] border border-[#FFC107]/20 p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(255,193,7,0.15)] relative overflow-hidden flex flex-col items-center">
                            <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#FFC107] via-orange-500 to-[#FFC107]"></div>
                            
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Bihar Swadeshi Scratch Card</h3>
                            <p className="text-[#FFC107] text-[9px] font-black uppercase tracking-widest mb-8">Tap on card face to scratch securely</p>

                            <div 
                              onClick={() => handleScratch(selected.id, selected.value)}
                              className="w-56 h-56 rounded-[32px] p-[2px] bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 relative cursor-pointer active:scale-95 transition-transform overflow-hidden shadow-2xl flex flex-col items-center justify-center"
                            >
                               {/* Scratch Top Coating */}
                               {!scratchRevealed ? (
                                  <div className="absolute inset-[2px] bg-[#1a1a1a] rounded-[30px] flex flex-col items-center justify-center z-10 text-center p-4">
                                     <Sparkles className="w-10 h-10 text-[#FFC107] animate-pulse mb-3" />
                                     <p className="text-white text-xs font-black uppercase tracking-widest leading-relaxed">RAPDO AI Vault</p>
                                     <p className="text-white/40 text-[9px] font-bold mt-1 uppercase tracking-widest">Tap to Scratch Off Coating</p>
                                  </div>
                               ) : (
                                  <div className="absolute inset-[2px] bg-emerald-950/80 rounded-[30px] flex flex-col items-center justify-center z-10 text-center p-4 animate-in zoom-in-95 duration-500">
                                     <Check className="w-12 h-12 text-emerald-400 mb-3" />
                                     <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">You Won</p>
                                     <p className="text-5xl font-black text-white tracking-tighter my-2">₹{selected.value}</p>
                                     <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Cashback Transmitted!</p>
                                  </div>
                               )}
                            </div>

                            <button 
                              onClick={() => setScratchRewardId(null)}
                              className="mt-8 px-6 py-3.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors border border-white/5"
                            >
                               Dismiss Wallet
                            </button>
                         </div>
                      );
                   })()}
                </div>
             )}
          </div>
        )}

        {/* ====================================
            SOS EMERGENCY SAFETY CENTER
           ==================================== */}
        {activeSubmenu === 'safety' && (
          <div className="p-8 relative z-10 flex-grow flex flex-col overflow-y-auto no-scrollbar">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setActiveSubmenu('main')} className="w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-center">
                   <ArrowLeft className="w-5 h-5 text-white/70" />
                </button>
                <h3 className="text-lg font-black uppercase tracking-widest text-red-500">Safety Center</h3>
             </div>

             {/* SOS BIG BLINKING TRIGGER BUTTON */}
             <div className="text-center py-6 mb-8 flex flex-col items-center">
                {sosCountdown !== null ? (
                   <div className="w-48 h-48 rounded-full bg-red-950 flex flex-col items-center justify-center border-4 border-red-500 animate-pulse relative">
                      <p className="text-red-500 font-bold text-xs uppercase tracking-widest">Alert sends in</p>
                      <p className="text-7xl font-black text-white tracking-tighter my-2 font-mono">{sosCountdown}</p>
                      <button 
                        onClick={() => setSosCountdown(null)}
                        className="px-4 py-1.5 bg-white text-black font-black text-[9px] uppercase tracking-widest rounded-full"
                      >
                         Cancel Code
                      </button>
                   </div>
                ) : sosActive ? (
                   <div className="w-48 h-48 rounded-full bg-red-500 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.7)] animate-ping-slow text-center p-4">
                      <p className="text-black font-black text-sm uppercase tracking-widest leading-tight">Patna Police Informed</p>
                      <p className="text-white text-xs font-bold leading-normal mt-2">EMERGENCY SOS ACTIVE</p>
                      <button 
                        onClick={() => setSosActive(false)}
                        className="mt-3 px-3 py-1 bg-black text-white font-black text-[8px] uppercase tracking-widest rounded-full"
                      >
                         Deactivate Alert
                      </button>
                   </div>
                ) : (
                   <button 
                     onClick={() => navigate('/sos')}
                     className="w-48 h-48 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-8 border-[#1A1A1A] hover:border-red-500 transition-all shadow-[0_15px_30px_rgba(239,68,68,0.4)] flex flex-col items-center justify-center active:scale-95 duration-200"
                   >
                      <Shield className="w-12 h-12 text-white fill-white mb-2 animate-pulse" />
                      <span className="text-white font-black text-lg uppercase tracking-widest">SOS Alarm</span>
                      <span className="text-red-300 text-[8px] font-black tracking-widest mt-1">Tap to blast emergency</span>
                   </button>
                )}
             </div>

             {/* Dynamic Location Sharing Panel */}
             <div className="bg-[#1A1A1A] p-6 rounded-[28px] border border-white/5 mb-8">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#FFC107] mb-2 flex items-center gap-2">
                   <Share2 className="w-4.5 h-4.5" /> Trip GPS Link Sharing
                </h4>
                <p className="text-white/50 text-[11px] leading-relaxed mb-4">Share biometric data and current movement route instantly with your listed responders.</p>
                <div className="space-y-2">
                   {(currentUser?.emergencyContacts || []).map(cont => (
                      <label key={cont.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl cursor-pointer">
                         <input 
                           type="checkbox" 
                           checked={sharedContacts.includes(cont.id)}
                           onChange={() => {
                              if (sharedContacts.includes(cont.id)) {
                                 setSharedContacts(prev => prev.filter(c => c !== cont.id));
                              } else {
                                 setSharedContacts(prev => [...prev, cont.id]);
                                 showToast(`GPS shared successfully with ${cont.name}!`, 'success');
                              }
                           }}
                           className="rounded text-red-500 accent-red-500" 
                         />
                         <span className="text-xs text-white font-semibold">{cont.name} ({cont.phone})</span>
                      </label>
                   ))}
                </div>
             </div>

             {/* Helpline phone list */}
             <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 mb-2">Direct Safety Dial</h4>
                <a href="tel:112" className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4 hover:border-red-400/20">
                   <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-white">Bihar Police Helpline</span>
                   </div>
                   <span className="text-xs font-mono font-bold text-red-400">112 / 100</span>
                </a>
                <a href="tel:18003456789" className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4 hover:border-red-400/20">
                   <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-white">RAPDO Executive Safety Room</span>
                   </div>
                   <span className="text-xs font-mono font-bold text-red-400">1800-345-6789</span>
                </a>
             </div>
          </div>
        )}

        {/* ====================================
            HELP CENTER BILINGUAL AI HELP desk
           ==================================== */}
        {activeSubmenu === 'support' && (
          <div className="p-8 relative z-10 flex-grow flex flex-col overflow-y-auto no-scrollbar">
             <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setActiveSubmenu('main')} className="w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-centershrink-0">
                   <ArrowLeft className="w-5 h-5 text-white/70" />
                </button>
                <div className="flex-1 text-left">
                   <h3 className="text-md font-black uppercase tracking-widest text-[#FFC107]">RAPDO AI Helpdesk</h3>
                   <p className="text-[9px] text-white/40 uppercase tracking-widest">Dual English / हिन्दी Panel</p>
                </div>
                <button 
                  onClick={() => {
                     setLangPreference(prev => prev === 'en' ? 'hi' : 'en');
                     showToast(langPreference === 'en' ? 'Bhasha badal ke HINDI kiya gaya!' : 'Language updated to ENGLISH!', 'info');
                  }} 
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
                >
                   <Globe className="w-3.5 h-3.5 text-[#FFC107]" /> {langPreference === 'en' ? 'ENGLISH' : 'हिन्दी'}
                </button>
             </div>

             {/* AI Support Chat Panel (Rapido-Swiggy style micro chat window) */}
             <div className="bg-[#1A1A1A] border border-white/5 rounded-[32px] p-5 flex flex-col h-[320px] mb-6 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none text-left">
                   {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                         <div className={`p-4 rounded-[20px] text-xs font-semibold leading-relaxed max-w-[85%] ${
                           msg.sender === 'user' ? 'bg-[#FFC107] text-black rounded-tr-sm' : 'bg-white/5 text-white/90 rounded-tl-sm border border-white/5'
                         }`}>
                            {msg.text}
                         </div>
                         <span className="text-[7px] text-white/20 font-bold uppercase tracking-widest mt-1 px-1.5">{msg.time}</span>
                      </div>
                   ))}
                </div>

                <form onSubmit={handleSupportMessageSubmit} className="flex gap-2 pt-3 border-t border-white/5">
                   <input 
                     type="text" placeholder={langPreference === 'en' ? "Ask Lallan helper..." : "Lallan se poocho..."}
                     value={chatInput} onChange={e => setChatInput(e.target.value)}
                     className="flex-grow bg-white/5 border border-white/5 rounded-xl text-xs font-bold px-4 py-3 outline-none text-white placeholder:text-white/20"
                   />
                   <button type="submit" className="w-11 h-11 rounded-xl bg-[#FFC107] text-black flex items-center justify-center shrink-0">
                      <Send className="w-4 h-4" />
                   </button>
                </form>
             </div>

             {/* Live Support Ticket Creation */}
             <form onSubmit={handleCreateSupportTicket} className="bg-white/5 border border-white/5 p-6 rounded-[28px] space-y-4 text-left">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#FFC107] flex items-center gap-2">
                   <LifeBuoy className="w-4.5 h-4.5" /> File Official Ticket
                </h4>
                <div>
                   <input 
                     type="text" required placeholder={langPreference === 'en' ? "Issue Title (e.g. Refund request)" : "Mudda ka heading..."}
                     value={ticketIssue} onChange={e => setTicketIssue(e.target.value)}
                     className="block w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-bold outline-none text-white placeholder:text-white/20"
                   />
                </div>
                <div>
                   <textarea 
                     required placeholder={langPreference === 'en' ? "Describe situation in detail..." : "Adhir vivaran likhein..."}
                     value={ticketDesc} onChange={e => setTicketDesc(e.target.value)}
                     className="block w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-bold outline-none text-white resize-none h-16 placeholder:text-white/20"
                   />
                </div>
                <div className="flex gap-2 justify-between items-center">
                   <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Priority:</span>
                   <div className="flex gap-2">
                      {['low', 'medium', 'high'].map(p => (
                         <button 
                           type="button" key={p}
                           onClick={() => setTicketPriority(p as any)}
                           className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                             ticketPriority === p 
                               ? 'bg-[#FFC107] text-black border-[#FFC107]' 
                               : 'bg-white/5 text-white/40 border-white/5'
                           }`}
                         >
                            {p}
                         </button>
                      ))}
                   </div>
                </div>
                <button 
                  type="submit" disabled={isSubmittingTicket}
                  className="w-full py-4 bg-white hover:bg-neutral-200 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                   {isSubmittingTicket ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                   ) : 'File official complaint'}
                </button>
             </form>
          </div>
        )}

        {/* ====================================
            APP SETTINGS & LOCAL CONFIG
           ==================================== */}
        {activeSubmenu === 'settings' && (
          <div className="p-8 relative z-10 flex-grow flex flex-col overflow-y-auto no-scrollbar">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setActiveSubmenu('main')} className="w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-center">
                   <ArrowLeft className="w-5 h-5 text-white/70" />
                </button>
                <h3 className="text-lg font-black uppercase tracking-widest text-[#FFC107]">Settings</h3>
             </div>

             <div className="space-y-4 text-left">
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex justify-between items-center">
                   <div>
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest">Audible Alarms</h4>
                      <p className="text-[10px] text-white/30 font-bold tracking-wider uppercase mt-1">High volume sirens during SOS triggers</p>
                   </div>
                   <div className="w-12 h-6 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center px-1 justify-end cursor-pointer">
                      <div className="w-4.5 h-4.5 bg-emerald-400 rounded-full"></div>
                   </div>
                </div>

                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex justify-between items-center">
                   <div>
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest">Haptic Vibrals</h4>
                      <p className="text-[10px] text-white/30 font-bold tracking-wider uppercase mt-1">Responsive mobile trigger feedback</p>
                   </div>
                   <div className="w-12 h-6 bg-white/5 border border-white/10 rounded-full flex items-center px-1 justify-end cursor-pointer">
                      <div className="w-4.5 h-4.5 bg-white/40 rounded-full"></div>
                   </div>
                </div>

                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex justify-between items-center">
                   <div>
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest">Offline caching</h4>
                      <p className="text-[10px] text-white/30 font-bold tracking-wider uppercase mt-1">Saves routes context for poor networks</p>
                   </div>
                   <div className="w-12 h-6 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center px-1 justify-end cursor-pointer">
                      <div className="w-4.5 h-4.5 bg-emerald-400 rounded-full"></div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* ====================================
            SETTINGS MENU
           ==================================== */}
        {activeSubmenu === 'settings' && (
          <div className="p-8 relative z-10 flex-grow flex flex-col overflow-y-auto no-scrollbar">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setActiveSubmenu('main')} className="w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-center">
                   <ArrowLeft className="w-5 h-5 text-white/70" />
                </button>
                <h3 className="text-lg font-black uppercase tracking-widest text-[#FFC107]">App Settings</h3>
             </div>

             <div className="space-y-4">
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex justify-between items-center hover:border-white/10 transition-all cursor-pointer shadow-sm">
                   <div>
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-400" /> Privacy Center</h4>
                      <p className="text-[10px] text-white/30 font-bold tracking-wider uppercase mt-1">Manage data sharing & analytics</p>
                   </div>
                   <ChevronRight className="w-4 h-4 text-white/20" />
                </div>
                
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex justify-between items-center hover:border-white/10 transition-all cursor-pointer shadow-sm">
                   <div>
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest flex items-center gap-2"><Bell className="w-4 h-4 text-blue-400" /> Notifications</h4>
                      <p className="text-[10px] text-white/30 font-bold tracking-wider uppercase mt-1">Push alerts & SMS preferences</p>
                   </div>
                   <ChevronRight className="w-4 h-4 text-white/20" />
                </div>
                
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex justify-between items-center hover:border-white/10 transition-all cursor-pointer shadow-sm">
                   <div>
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest flex items-center gap-2"><Globe className="w-4 h-4 text-purple-400" /> App Language</h4>
                      <p className="text-[10px] text-white/30 font-bold tracking-wider uppercase mt-1">English, Hindi, Bhojpuri (Beta)</p>
                   </div>
                   <ChevronRight className="w-4 h-4 text-white/20" />
                </div>

                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex justify-between items-center mt-6">
                   <div>
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest">Offline routing cache</h4>
                      <p className="text-[10px] text-white/30 font-bold tracking-wider uppercase mt-1">Enhances Maps data in low networks</p>
                   </div>
                   <div className="w-12 h-6 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center px-1 justify-end cursor-pointer">
                      <div className="w-4.5 h-4.5 bg-emerald-400 rounded-full"></div>
                   </div>
                </div>
             </div>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}

function MenuRow({ icon, title, subtitle, highlight = false, danger = false }: { icon: React.ReactNode, title: string, subtitle: string, highlight?: boolean, danger?: boolean }) {
   return (
      <div className="group bg-[#1A1A1A] border border-white/5 hover:border-white/10 transition-all duration-300 rounded-[24px] p-4 flex items-center gap-5 cursor-pointer">
         <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${danger ? 'bg-red-500/10 text-red-400' : highlight ? 'bg-[#FFC107]/10 text-[#FFC107]' : 'bg-white/5 text-white/50 group-hover:text-white'}`}>
            {icon}
         </div>
         <div className="flex-1 text-left">
            <h4 className={`font-black text-sm tracking-wide ${danger ? 'text-red-400' : 'text-white'}`}>{title}</h4>
            <p className="text-white/40 text-[10px] font-bold mt-0.5 tracking-wider uppercase">{subtitle}</p>
         </div>
         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white" />
         </div>
      </div>
   );
}
