import React from 'react';
import { Home, Package, Activity, Wallet, User, History } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { motion } from 'motion/react';

export default function BottomNav() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const isCaptain = currentUser?.role === 'captain';

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[420px] h-20 bg-[#0f0f0f]/80 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex items-center justify-between px-4 z-50 overflow-visible"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-[40px] pointer-events-none" />
      <NavItem to={isCaptain ? "/captain" : "/"} current={location.pathname} icon={<Home className="w-6 h-6" />} label="Home" activeColor="text-[#FFD000]" glowColor="shadow-[#FFD000]/60" />
      <NavItem to="/book" current={location.pathname} icon={<Activity className="w-6 h-6" />} label="Ride" activeColor="text-blue-400" glowColor="shadow-blue-500/60" />
      <NavItem to="/parcel" current={location.pathname} icon={<Package className="w-6 h-6" />} label="Parcel" activeColor="text-green-400" glowColor="shadow-green-500/60" />
      <NavItem to="/activity" current={location.pathname} icon={<History className="w-6 h-6" />} label="Activity" activeColor="text-orange-400" glowColor="shadow-orange-500/60" />
      <NavItem to="/wallet" current={location.pathname} icon={<Wallet className="w-6 h-6" />} label="Wallet" activeColor="text-purple-400" glowColor="shadow-purple-500/60" />
      <NavItem to="/profile" current={location.pathname} icon={<User className="w-6 h-6" />} label="Profile" activeColor="text-[#FFD000]" glowColor="shadow-[#FFD000]/60" />
    </motion.div>
  );
}

function NavItem({ to, current, icon, label, activeColor, glowColor }: { to: string, current: string, icon: React.ReactNode, label: string, activeColor: string, glowColor: string }) {
  const isActive = current === to || (current.startsWith(to) && to !== '/' && to !== '/captain');
  
  return (
    <Link to={to} className="flex flex-col items-center justify-center gap-1.5 relative group w-14 h-full">
      {/* Active Glow Backdrop */}
      {isActive && (
        <motion.div 
          layoutId="bottom-nav-active"
          className="absolute inset-0 rounded-[30px] bg-white/5 border border-white/10"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}
      
      {/* Glowing Dot overlay */}
      {isActive && (
         <motion.div 
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           className={`absolute -top-1 w-8 h-1 rounded-full ${activeColor.replace('text-', 'bg-')} ${glowColor} shadow-[0_0_15px] opacity-80`}
         />
      )}
      
      <motion.div 
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        className={`relative z-10 transition-all duration-300 ${isActive ? `${activeColor} transform -translate-y-1 scale-110 drop-shadow-[0_0_10px_currentColor]` : 'text-white/40 group-hover:text-white/70'}`}
      >
        {icon}
      </motion.div>

      <span className={`relative z-10 text-[9px] font-black tracking-widest uppercase transition-all duration-300 ${isActive ? activeColor : 'text-transparent group-hover:text-white/40'}`}>
        {label}
      </span>
    </Link>
  );
}
