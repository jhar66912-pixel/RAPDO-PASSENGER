import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCheck, Trash2, Bell, CarTaxiFront, PackageOpen, Wallet, Sparkles, ShieldCheck, Info, ArrowUpRight } from 'lucide-react';
import { useNotifications, Notification, NotificationCategory } from '../lib/notifications';
import { useNavigate } from 'react-router-dom';

const categoryIcons: Record<NotificationCategory, React.ReactNode> = {
  ride: <CarTaxiFront className="w-5 h-5 text-emerald-400" />,
  parcel: <PackageOpen className="w-5 h-5 text-blue-400" />,
  wallet: <Wallet className="w-5 h-5 text-purple-400" />,
  offer: <Sparkles className="w-5 h-5 text-[#FFC107]" />,
  safety: <ShieldCheck className="w-5 h-5 text-red-500" />,
  system: <Info className="w-5 h-5 text-white/60" />
};

const categoryLabels: Record<NotificationCategory, string> = {
  ride: 'Ride Update',
  parcel: 'Logistics',
  wallet: 'Financial',
  offer: 'Offer & Promo',
  safety: 'System Alert',
  system: 'Update'
};

const formatTime = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const NotificationCenter = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);
    
    // Deep linking logic
    switch(notif.category) {
      case 'ride':
        navigate('/book');
        break;
      case 'parcel':
        navigate('/parcel');
        break;
      case 'wallet':
        navigate('/wallet');
        break;
      case 'safety':
        navigate('/safety');
        break;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[2000] bg-[#0D0D0D] flex flex-col font-sans"
        >
          {/* Header */}
          <div className="pt-12 px-6 pb-6 border-b border-white/5 bg-[#121212]/90 backdrop-blur-xl sticky top-0 z-10">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#FFC107]/10 rounded-full flex items-center justify-center border border-[#FFC107]/20 relative">
                     <Bell className="w-5 h-5 text-[#FFC107]" />
                     {unreadCount > 0 && (
                       <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center text-white border-2 border-[#121212]">
                         {unreadCount}
                       </span>
                     )}
                   </div>
                   <h2 className="text-xl font-black text-[#F5F5F5] tracking-tight">Updates</h2>
                </div>
                
                <div className="flex items-center gap-3">
                   {unreadCount > 0 && (
                     <button onClick={markAllAsRead} className="text-blue-400 text-[10px] font-bold uppercase tracking-widest hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                       <CheckCheck className="w-3.5 h-3.5 inline mr-1" /> Read All
                     </button>
                   )}
                   <motion.button
                     whileTap={{ scale: 0.9 }}
                     onClick={onClose}
                     className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                   >
                     <X className="w-5 h-5 text-white" />
                   </motion.button>
                </div>
             </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center shadow-inner">
                     <Bell className="w-8 h-8 opacity-20" />
                   </div>
                   <p className="text-sm font-bold uppercase tracking-widest text-[#F5F5F5]">All Caught Up!</p>
                   <p className="text-[11px] max-w-[200px] text-center">You have no new updates or active ride alerts.</p>
                </div>
             ) : (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-[24px] border relative overflow-hidden flex gap-4 group cursor-pointer transition-all ${
                      n.isRead 
                        ? 'bg-[#121212] border-white/5 opacity-70 hover:opacity-100 hover:bg-white/5' 
                        : 'bg-[#1E1E1E] border-white/10 shadow-[0_5px_20px_rgba(0,0,0,0.5)]'
                    }`}
                    onClick={() => handleNotificationClick(n)}
                  >
                     {/* Unread indicator */}
                     {!n.isRead && (
                       <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#FFC107] pointer-events-none" />
                     )}
                     
                     <div className={`w-12 h-12 rounded-full flex flex-shrink-0 items-center justify-center border shadow-inner ${
                       n.isRead ? 'bg-black/50 border-white/5' : 'bg-black/40 border-white/10'
                     }`}>
                        {categoryIcons[n.category]}
                     </div>
                     
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                           <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                             {categoryLabels[n.category]}
                           </span>
                           <span className="text-[9px] font-bold text-white/30 whitespace-nowrap">
                             {formatTime(n.timestamp)}
                           </span>
                        </div>
                        <h4 className={`text-sm tracking-wide mb-1 ${n.isRead ? 'text-white/80 font-bold' : 'text-[#F5F5F5] font-black'}`}>
                          {n.title}
                        </h4>
                        <p className={`text-[11px] leading-relaxed line-clamp-2 ${n.isRead ? 'text-white/40' : 'text-white/60 font-medium'}`}>
                          {n.body}
                        </p>
                        
                        {/* Deep link prompt */}
                        {!n.isRead && ['ride', 'parcel', 'wallet'].includes(n.category) && (
                           <div className="mt-3 flex items-center gap-1 text-[10px] text-[#FFC107] font-bold uppercase tracking-wider">
                             View Details <ArrowUpRight className="w-3 h-3" />
                           </div>
                        )}
                     </div>

                     {/* Delete Button (visible on hover/active) */}
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         deleteNotification(n.id);
                       }}
                       className="absolute top-1/2 -translate-y-1/2 right-4 w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </motion.div>
                ))
             )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
