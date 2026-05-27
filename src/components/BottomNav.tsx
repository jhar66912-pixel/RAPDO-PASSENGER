import React from 'react';
import { Home, Package, Activity, Wallet, User, History } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] h-16 bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl flex items-center justify-between px-6 z-50">
      <NavItem to="/" current={location.pathname} icon={<Home className="w-5 h-5" />} label="Home" activeColor="text-[#FACC15]" />
      <NavItem to="/book" current={location.pathname} icon={<Activity className="w-5 h-5" />} label="Ride" activeColor="text-blue-400" />
      <NavItem to="/parcel" current={location.pathname} icon={<Package className="w-5 h-5" />} label="Parcel" activeColor="text-green-400" />
      <NavItem to="/activity" current={location.pathname} icon={<History className="w-5 h-5" />} label="Activity" activeColor="text-orange-400" />
      <NavItem to="/wallet" current={location.pathname} icon={<Wallet className="w-5 h-5" />} label="Wallet" activeColor="text-purple-400" />
      <NavItem to="/profile" current={location.pathname} icon={<User className="w-5 h-5" />} label="Profile" activeColor="text-[#FACC15]" />
    </div>
  );
}

function NavItem({ to, current, icon, label, activeColor }: { to: string, current: string, icon: React.ReactNode, label: string, activeColor: string }) {
  const isActive = current === to;
  return (
    <Link to={to} className="flex flex-col items-center justify-center gap-1 relative group w-12">
      {isActive && (
         <div className="absolute -top-3 w-1 h-1 bg-[#FACC15] rounded-full shadow-[0_0_8px_rgba(250,204,21,1)]" />
      )}
      <div className={`transition-all duration-300 ${isActive ? `${activeColor} transform -translate-y-1 scale-110` : 'text-white/40 hover:text-white/70'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-bold tracking-wider transition-all duration-300 ${isActive ? activeColor : 'text-transparent group-hover:text-white/40'}`}>
        {label}
      </span>
    </Link>
  );
}
