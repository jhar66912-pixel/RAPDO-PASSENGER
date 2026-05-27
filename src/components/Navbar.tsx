import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import {
  Phone,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Clock,
  Wallet,
  Settings,
  Shield,
  Activity
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Book Ride", path: "/book" },
    { name: "Send Parcel", path: "/parcel" },
    { name: "Pricing System", path: "/pricing" },
    { name: "Help AI", path: "/ai-help" },
    { name: "Safety", path: "/#safety" },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-4 sm:px-6 lg:px-8 mt-6 pointer-events-none">
      <nav className="max-w-5xl mx-auto w-full pointer-events-auto bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/5 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full opacity-50 pointer-events-none"></div>

        <div className="flex items-center justify-between h-16 px-6 relative z-10">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#050505] p-[1px] shadow-[0_0_15px_rgba(255,208,0,0.2)] border border-white/10 flex items-center justify-center overflow-hidden group-hover:shadow-[0_0_20px_rgba(255,208,0,0.4)] group-hover:border-white/20 transition-all">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-[#FFD000]/10 rounded-full pointer-events-none" />
                <div className="w-full h-full rounded-full bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden shadow-inner">
                  <img src="https://i.ibb.co/ZzL02NFj/c3e39448-0850-4dca-9c25-f6dd3b1bba6a.png" alt="RAHI Premium" referrerPolicy="no-referrer" className="w-[130%] h-[130%] object-contain drop-shadow-[0_2px_4px_rgba(255,208,0,0.3)] scale-[1.25] relative z-10" />
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Links (Centered) */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-2">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path.includes("#") &&
                  location.hash === link.path.replace("/", ""));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-black transition-all duration-500 ease-out relative group ${isActive ? "text-[#FFD000]" : "text-white/50 hover:text-white"}`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-[#FFD000]/10 rounded-full blur-sm"></div>
                  )}
                  <div className={`absolute inset-0 bg-white/5 rounded-full scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-out ${isActive ? 'hidden' : 'block'}`}></div>
                </Link>
              );
            })}
          </div>

          {/* Right Section (Call + Profile/Login) */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            {/* Premium Call Button */}
            <a
              href="tel:8252988672"
              className="group relative flex items-center gap-2 px-5 py-2.5 bg-[#121212] border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-full hover:border-[#FFD000]/50 hover:bg-[#1A1A1A] transition-all outline-none overflow-hidden"
            >
               <Phone className="w-3.5 h-3.5" />
               <span className="relative z-10">SOS</span>
            </a>

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center gap-3 p-1.5 pr-4 bg-[#121212] border border-white/10 rounded-full hover:bg-white/5 hover:border-white/20 transition-all focus:outline-none shadow-inner group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFD000] to-[#F5B700] flex items-center justify-center text-black font-black text-xs relative shadow-[0_0_15px_rgba(255,208,0,0.3)]">
                    {currentUser.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col items-start pr-1 hidden lg:flex">
                    <span className="text-white text-xs font-black tracking-wide leading-tight">
                      {currentUser.name?.split(" ")[0]}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#FFD000] transition-transform duration-300 ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-[#121212]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.8)] py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 origin-top-right">
                    <div className="px-5 py-4 border-b border-white/5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFD000] to-[#F5B700] flex items-center justify-center text-black font-black text-lg shrink-0 shadow-[0_0_20px_rgba(255,208,0,0.3)]">
                        {currentUser.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-white text-sm font-black tracking-wide truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[#FFD000] text-[10px] uppercase tracking-widest font-bold">
                          Premium Member
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 space-y-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 font-bold rounded-[20px] hover:bg-white/5 hover:text-white transition-all group"
                      >
                        <User className="w-4 h-4 group-hover:text-[#FFD000] transition-colors" /> My Identity
                      </Link>
                      <Link
                        to="/wallet"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 font-bold rounded-[20px] hover:bg-white/5 hover:text-white transition-all group"
                      >
                        <Wallet className="w-4 h-4 group-hover:text-[#FFD000] transition-colors" /> Asset Hub
                      </Link>
                      <Link
                        to="/activity"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 font-bold rounded-[20px] hover:bg-white/5 hover:text-white transition-all group"
                      >
                        <Activity className="w-4 h-4 group-hover:text-[#FFD000] transition-colors" /> Timeline
                      </Link>
                    </div>

                    <div className="p-3 border-t border-white/5">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500/80 font-bold uppercase tracking-widest rounded-[20px] hover:bg-red-500/10 hover:text-red-400 transition-all"
                      >
                        <LogOut className="w-4 h-4" /> Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-[#FFD000] to-[#F5B700] text-black text-xs uppercase tracking-widest font-black rounded-full shadow-[0_0_20px_rgba(255,208,0,0.2)] hover:shadow-[0_0_30px_rgba(255,208,0,0.4)] hover:scale-105 active:scale-95 transition-all"
              >
                 Authorize
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-white/70 hover:text-[#FFD000] bg-[#121212] border border-white/10 rounded-full transition-all active:scale-95"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full mt-4 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
            <div className="bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[40px] mx-4 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col gap-4">
              
              {/* User Block for Mobile */}
              {currentUser ? (
                 <div className="flex items-center gap-4 p-5 bg-[#121212] rounded-[24px] border border-white/5 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFD000] to-[#F5B700] flex items-center justify-center text-black font-black text-lg">
                      {currentUser.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-white font-bold tracking-wide">
                        {currentUser.name}
                      </p>
                      <p className="text-[#FFD000] text-[10px] uppercase font-bold tracking-widest">
                        Premium Member
                      </p>
                    </div>
                 </div>
              ) : null}

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-5 py-4 text-white/50 font-black text-sm uppercase tracking-widest rounded-[20px] hover:bg-white/5 hover:text-[#FFD000] transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-6 mt-2 border-t border-white/5 flex flex-col gap-3">
                {currentUser ? (
                  <>
                    <Link
                      to="/profile"
                      className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 text-white text-xs uppercase tracking-widest font-black rounded-[20px] hover:bg-white/10 transition-colors"
                    >
                      <User className="w-4 h-4" /> Identity
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 text-red-500 text-xs uppercase tracking-widest font-black rounded-[20px] hover:bg-red-500/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Disconnect
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-br from-[#FFD000] to-[#F5B700] text-black text-xs uppercase tracking-widest font-black rounded-[20px] shadow-[0_0_20px_rgba(255,208,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Authorize Session
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
