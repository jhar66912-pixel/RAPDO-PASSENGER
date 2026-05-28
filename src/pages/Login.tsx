import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Phone, 
  Mail, 
  Lock, 
  ArrowRight, 
  Languages, 
  Smartphone, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  User, 
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import firebaseConfig from '../../firebase-applet-config.json';
import { User as AppUser } from '../types';

type StageType = 'splash' | 'welcome' | 'credentials' | 'otp' | 'profile';

export default function Login() {
  const { login, loginDemo, loginWithPhone, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  
  // Wizards / Stages
  const [stage, setStage] = useState<StageType>('splash');
  const [role, setRole] = useState<AppUser['role']>('customer');
  
  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | null }>({ message: '', type: null });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 4500);
  };

  // Auth Method selectors
  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | 'google'>('phone');
  
  // Input fields
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('🧑🏽');
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi'>('en');

  // OTP Verification
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const otpInputsRef = useRef<HTMLInputElement[]>([]);
  const [otpTimer, setOtpTimer] = useState(45);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [generatedSimCode, setGeneratedSimCode] = useState('123456');

  // Loading and Error handlers
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  // Auto transition Splash Stage to Welcome Stage
  useEffect(() => {
    if (stage === 'splash') {
      const timer = setTimeout(() => {
        setStage('welcome');
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Countdown timer for simulated OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stage === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (stage === 'otp' && otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [stage, otpTimer]);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      setError('');
      setUnauthorizedDomain(null);
      await login(role);
      showToast("Google Authentication successful! Swagat hai.", "success");
      if ((role as string) === 'captain') {
        navigate('/captain');
      } else {
        navigate('/book');
      }
    } catch (err: any) {
       const errMsg = err.message || '';
       console.error("Google Auth Error:", err);
       if (
         errMsg.includes('unauthorized-domain') || 
         errMsg.includes('auth/unauthorized-domain') ||
         String(err).includes('unauthorized-domain')
       ) {
         setUnauthorizedDomain(window.location.hostname);
         setError(`FIREBASE_UNAUTHORIZED_DOMAIN: Hostname "${window.location.hostname}" is not verified yet.`);
       } else {
         setError(errMsg || 'Google authentication failed. Please use Phone verification instead.');
       }
    } finally {
       setIsLoading(false);
    }
  };

  const submitPhoneRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = mobileNumber.replace(/\s+/g, '');
    if (cleanNumber.length < 10) {
      showToast("Bhaiya, sahi 10-digit mobile number dalo!", "error");
      return;
    }
    
    // Simulate OTP receipt
    const code = Math.floor(100000 + Math.random() * 90000).toString();
    setGeneratedSimCode(code);
    setOtpTimer(45);
    setCanResendOtp(false);
    setStage('otp');
    
    showToast(`🎉 Verification Code sent! Use "${code}" to verify instantly.`, "success");
  };

  const handleOtpResend = () => {
    if (!canResendOtp) return;
    const code = Math.floor(100000 + Math.random() * 90000).toString();
    setGeneratedSimCode(code);
    setOtpTimer(45);
    setCanResendOtp(false);
    setOtpArray(['', '', '', '', '', '']);
    showToast(`🎉 Naya OTP bhej diya hai! Use: "${code}"`, "success");
  };

  const verifyOtpSubmission = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpJoined = otpArray.join('');
    
    if (otpJoined.length < 6) {
      showToast("Pura 6-digit OTP enter kijiye bhaiya!", "error");
      return;
    }

    if (otpJoined !== generatedSimCode && otpJoined !== '123456') {
      showToast("Galat OTP! Kripya sahi code enter karein ya 123456 code dalo.", "error");
      return;
    }

    setIsVerifyingOtp(true);
    
    try {
      setStage('profile');
      showToast("OTP Verified Successfully! Kripya profile update kijiye.", "success");
    } catch (err) {
      setError("Verification failed, try bypass.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleProfileSetupComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Bhaiya, kripya apna adarsh naam enter kijiye!", "error");
      return;
    }

    try {
      setIsLoading(true);
      if (authMethod === 'phone') {
        await loginWithPhone(mobileNumber, role, name, emailAddress);
      } else {
        await loginWithEmail(emailAddress, role, name, mobileNumber);
      }
      showToast(`🔥 RAPDO super ecosystem me swagat hai, ${name}!`, "success");
      
      if ((role as string) === 'captain') {
        navigate('/captain');
      } else {
        navigate('/book');
      }
    } catch (err: any) {
      showToast(err.message || "Profile registration failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddress.includes('@')) {
      showToast("Sahi Email ID daliye bhaiya!", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password kam se kam 6 character ka hona chahiye!", "error");
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      if (isNewAccount) {
        setStage('profile');
      } else {
        await loginWithEmail(emailAddress, role, "RAPDO User");
        showToast("Swagat hai! Loyalty profile synchronized successfully.", "success");
        if ((role as string) === 'captain') {
          navigate('/captain');
        } else {
          navigate('/book');
        }
      }
    } catch (err: any) {
      setError(err?.message || "Email login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBypassLogin = async (bypassRole: AppUser['role']) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      setError('');
      await loginDemo(bypassRole);
      showToast(`⚡ Demo Commute Bypass enabled! Role: ${bypassRole}`, "success");
      if ((bypassRole as string) === 'captain') {
        navigate('/captain');
      } else {
        navigate('/book');
      }
    } catch (err: any) {
       setError(err.message || 'Bypass failed.');
    } finally {
       setIsLoading(false);
    }
  };

  const handleOtpChange = (elementValue: string, index: number) => {
    if (isNaN(Number(elementValue))) return;
    
    const updatedOtp = [...otpArray];
    updatedOtp[index] = elementValue;
    setOtpArray(updatedOtp);

    // Dynamic next shift focus
    if (elementValue !== '' && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otpArray[index] === '' && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleClipboardCopy = () => {
    if (unauthorizedDomain) {
      navigator.clipboard.writeText(unauthorizedDomain);
      showToast(`Hostname "${unauthorizedDomain}" copied!`, "success");
    }
  };

  // Avatar Options
  const avatars = ['🧑🏽', '👨🏽‍✈️', '👩🏽‍💼', '🧔🏽', '👵🏽', '🧙🏽', '👩🏽‍🎨', '👑'];

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#070707] p-4 relative overflow-hidden min-h-screen z-0">
      
      {/* Cinematic Glassmorphic Toast banner */}
      <AnimatePresence>
        {toast.type && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="absolute top-6 left-4 right-4 z-[99] max-w-sm mx-auto p-4 rounded-2xl bg-[#121212]/95 backdrop-blur-2xl border border-[#FFC107]/20 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFC107]/10 border border-[#FFC107]/30 flex items-center justify-center text-[#FFC107] shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-white text-xs font-bold leading-snug">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Futuristic Ambient Orbs */}
      <div className="absolute top-1/4 -right-20 w-[450px] h-[450px] bg-[#FFC107]/10 rounded-full blur-[130px] pointer-events-none mix-blend-screen" />
      <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-[#D4AF37]/5 rounded-full blur-[130px] pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay"></div>
      
      <div className="w-full max-w-sm rounded-[40px] p-[2px] shadow-[0_45px_100px_rgba(0,0,0,0.95)] relative z-10 bg-gradient-to-br from-[#FFC107]/25 via-white/5 to-white/0">
        <div className="bg-[#121212]/92 backdrop-blur-3xl rounded-[38px] p-8 border border-white/5 h-full relative overflow-hidden min-h-[500px] flex flex-col justify-center">
          
          <AnimatePresence mode="wait">
            
            {/* STAGE 1: CINEMATIC SPLASH */}
            {stage === 'splash' && (
              <motion.div
                key="splash"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="text-center py-8 flex flex-col items-center justify-center h-full"
              >
                <div className="relative w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#2D2D2D] to-[#0A0A0A] p-[2px] shadow-[0_25px_50px_rgba(0,0,0,0.9),0_0_50px_rgba(255,193,7,0.3)] border border-[#FFC107]/35 flex items-center justify-center animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-bl from-[#FFC107]/25 to-transparent rounded-full pointer-events-none" />
                  <div className="w-full h-full rounded-full bg-[#070707] flex items-center justify-center relative overflow-hidden">
                    <img src="https://i.ibb.co/x8RS5DQV/Chat-GPT-Image-May-28-2026-01-48-34-PM.png" alt="RAPDO Super App Logo" className="w-[140%] h-[140%] object-contain scale-[1.3] relative z-10" />
                  </div>
                </div>
                
                <h1 className="text-5xl font-extrabold tracking-tighter text-white">
                  RAPDO<span className="text-[#FFC107]">.</span>
                </h1>
                <p className="text-[#FFC107] text-[10px] font-black tracking-[0.3em] uppercase mt-4 mb-2">Bihar's Mobility Revolution</p>
                <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-[#FFC107] to-transparent mx-auto mt-2"></div>
                <p className="text-white/40 text-xs mt-3 select-none">Fast • Fair • Local</p>
              </motion.div>
            )}

            {/* STAGE 2: WELCOME IDENTITY SELECTION */}
            {stage === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 flex flex-col justify-center h-full text-left"
              >
                <div>
                  <h3 className="text-3xl font-black text-white leading-tight">Safar Shuru <br/>Karein!</h3>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mt-2">Pick your RAPDO identity to get started</p>
                </div>

                <div className="space-y-4 pt-4">
                  
                  {/* Option 1: Customer Passenger */}
                  <button
                    onClick={() => {
                      setRole('customer');
                      setStage('credentials');
                    }}
                    className={`w-full group text-left p-5 rounded-[24px] border transition-all flex items-center gap-4 ${role === 'customer' ? 'bg-[#FFC107]/10 border-[#FFC107] shadow-[0_10px_25px_rgba(255,193,7,0.15)]' : 'bg-[#181818]/80 border-white/5 hover:border-white/10 hover:bg-[#1E1E1E]'}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFC107] to-[#E5BB00] flex items-center justify-center text-black shadow-lg">
                      <User className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider leading-none">Passenger Commute</h4>
                      <p className="text-[10px] text-white/50 font-bold mt-1 leading-snug">Book Bike-taxi, auto, cabs & quick express parcel deliveries in Bihar</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-[#FFC107] group-hover:translate-x-1 transition-all" />
                  </button>

                  {/* Option 2: Driver Captain */}
                  <button
                    onClick={() => {
                      setRole('captain' as any);
                      setStage('credentials');
                    }}
                    className={`w-full group text-left p-5 rounded-[24px] border transition-all flex items-center gap-4 ${(role as string) === 'captain' ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_10px_25px_rgba(79,70,229,0.15)]' : 'bg-[#181818]/80 border-white/5 hover:border-white/10 hover:bg-[#1E1E1E]'}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <Smartphone className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider leading-none">RAPDO Captain</h4>
                      <p className="text-[10px] text-white/50 font-bold mt-1 leading-snug">Register your bike/auto, drive, earn maximum payout & support Patna local commute!</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </button>

                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] text-center text-white/30 uppercase tracking-widest font-black leading-relaxed flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#FFC107]/60" /> Zero-friction security protocol
                  </p>
                </div>
              </motion.div>
            )}

            {/* STAGE 3: CREDENTIAL INPUT FORM */}
            {stage === 'credentials' && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-6 text-left"
              >
                <div>
                  <button 
                    onClick={() => setStage('welcome')} 
                    className="text-[10px] font-black text-[#FFC107] uppercase tracking-widest hover:underline mb-2 flex items-center gap-1"
                  >
                    ← Pehle back jaien
                  </button>
                  <h3 className="text-2xl font-black text-white leading-tight">Verification</h3>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-1">
                    Authenticating as <span className="text-[#FFC107]">{(role as string) === 'captain' ? 'RAPDO Captain' : 'Passenger Rider'}</span>
                  </p>
                </div>

                {/* Tab selectors */}
                <div className="grid grid-cols-2 p-1 bg-[#1A1A1A] rounded-2xl border border-white/5">
                  <button
                    onClick={() => setAuthMethod('phone')}
                    className={`py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${authMethod === 'phone' ? 'bg-[#FFC107] text-black shadow-md' : 'text-white/40 hover:text-white'}`}
                  >
                    Phone OTP
                  </button>
                  <button
                    onClick={() => setAuthMethod('email')}
                    className={`py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${authMethod === 'email' ? 'bg-[#FFC107] text-black shadow-md' : 'text-white/40 hover:text-white'}`}
                  >
                    Email ID
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-4 rounded-2xl leading-relaxed relative overflow-hidden">
                    <div className="flex gap-2 items-start">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>

                    {/* Dynamic Firebase Domain error Whitelist Assistant instructions */}
                    {unauthorizedDomain && (
                      <div className="mt-4 bg-black/40 rounded-xl p-3 border border-red-500/30 text-[10px] space-y-2">
                        <p className="font-black text-white/90">🛠️ ACTIVATE OAUTH CAPABILITY:</p>
                        <p className="font-normal text-white/70 leading-relaxed">
                          Firebase requires whitelisting your domain in your project console:
                        </p>
                        <div className="bg-[#1A1A1A] p-2 rounded border border-white/5 font-mono text-center relative overflow-hidden flex items-center justify-between gap-1">
                          <span className="truncate pr-2">{unauthorizedDomain}</span>
                          <button 
                            onClick={handleClipboardCopy}
                            className="text-[9px] uppercase font-bold px-2 py-1 bg-[#FFC107]/10 text-[#FFC107] rounded hover:bg-[#FFC107]/25 transition-all shrink-0"
                          >
                            Copy Host
                          </button>
                        </div>
                        <p className="font-normal text-white/55">
                          How-to: authentication &gt; settings &gt; authorized domains &gt; add domain.
                        </p>
                        <a 
                          href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-full inline-flex py-2 px-3 bg-[#FFC107] text-black font-black uppercase text-[9px] tracking-wider rounded justify-center items-center gap-1.5"
                        >
                          <ExternalLink className="w-3 h-3" /> Go to Firebase Console
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* METHOD A: PHONE NUMBER INPUT */}
                {authMethod === 'phone' && (
                  <form onSubmit={submitPhoneRequest} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">ENTER PHONE NUMBER (INDIA)</label>
                      <div className="flex bg-[#181818] rounded-2xl border border-white/5 p-1 items-center shadow-inner focus-within:border-[#FFC107]/40 transition-all">
                        <div className="flex items-center gap-2 pl-3 pr-2 border-r border-white/5 select-none font-bold text-sm text-white/70">
                          <Phone className="w-4 h-4 text-[#FFC107]" />
                          <span>+91</span>
                        </div>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="94314 90000"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                          className="flex-grow bg-transparent outline-none border-none py-3 px-3 text-sm text-white font-bold placeholder:text-neutral-700 font-sans"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="group w-full py-4.5 bg-gradient-to-br from-[#FFC107] to-[#E5BB00] hover:shadow-[0_10px_25px_rgba(255,193,7,0.25)] hover:border-[#FFC107]/40 border border-transparent text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      Bhejiye OTP (Send Verification) <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                )}

                {/* METHOD B: EMAIL SIGN-IN */}
                {authMethod === 'email' && (
                  <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">EMAIL ADDRESS</label>
                      <div className="flex bg-[#181818] rounded-2xl border border-white/5 p-1 items-center shadow-inner focus-within:border-[#FFC107]/40 transition-all">
                        <Mail className="w-4 h-4 text-[#FFC107] ml-3" />
                        <input
                          type="email"
                          placeholder="adarsh_commuter@kalam.in"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          className="flex-grow bg-transparent outline-none border-none py-3 px-3 text-sm text-white font-bold placeholder:text-neutral-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">PASSWORD</label>
                      <div className="flex bg-[#181818] rounded-2xl border border-white/5 p-1 items-center shadow-inner focus-within:border-[#FFC107]/40 transition-all">
                        <Lock className="w-4 h-4 text-[#FFC107] ml-3" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="flex-grow bg-transparent outline-none border-none py-3 px-3 text-sm text-white font-bold placeholder:text-neutral-700"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-1 select-none">
                      <input 
                        type="checkbox" 
                        id="new_acc_check" 
                        checked={isNewAccount}
                        onChange={(e) => setIsNewAccount(e.target.checked)}
                        className="w-4 h-4 rounded border-white/10 accent-[#FFC107] cursor-pointer"
                      />
                      <label htmlFor="new_acc_check" className="text-[10px] font-bold text-white/60 cursor-pointer uppercase tracking-wider">
                        Naya Account Banayein (Register profile)
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4.5 bg-gradient-to-br from-[#FFC107] to-[#E5BB00] text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? 'Processing...' : isNewAccount ? 'Register Profile' : 'Sign In Safely'} 
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* THIRD-PARTY / GOOGLE AUTHENTICATION (WITH OAUTH FALLBACK INSTRUCTIONS) */}
                <div className="flex items-center my-4 justify-between text-white/10">
                  <span className="w-1/3 border-b border-white/5"></span>
                  <span className="text-[9px] font-black tracking-widest uppercase text-white/30 px-2">OR SOCIAL CONNECT</span>
                  <span className="w-1/3 border-b border-white/5"></span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-[#161616] hover:bg-[#1E1E1E] border border-white/5 hover:border-[#FFC107]/25 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-sm transition-all flex justify-center items-center gap-3 active:scale-95"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.89 16.79 15.72 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                    <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.72 17.57C14.73 18.23 13.48 18.64 12 18.64C9.13 18.64 6.7 16.7 5.84 14.08H2.17V16.94C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                    <path d="M5.84 14.07C5.62 13.41 5.5 12.72 5.5 12C5.5 11.28 5.62 10.59 5.84 9.93V7.07H2.17C1.42 8.55 1 10.22 1 12C1 13.78 1.42 15.45 2.17 16.93L5.84 14.07Z" fill="#FBBC05"/>
                    <path d="M12 5.36C13.62 5.36 15.06 5.92 16.2 7L19.35 3.85C17.46 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.17 7.07L5.84 9.93C6.7 7.3 9.13 5.36 12 5.36Z" fill="#EB4335"/>
                  </svg>
                  {isLoading ? 'Connecting...' : 'Continue with Google'}
                </button>

                {/* THE DEMO PREVIEW BYPASS ROW RIGHT THERE IN PLACE */}
                <div className="pt-2">
                  <p className="text-[10px] text-center text-white/20 uppercase font-bold tracking-widest py-1 border-t border-white/5">
                    DEVELOPMENT ENVIRONMENT BYPASS
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                     <button
                       type="button"
                       onClick={() => handleBypassLogin('customer')}
                       className="py-3 px-3 rounded-2xl bg-[#FFC107]/5 hover:bg-[#FFC107]/10 border border-[#FFC107]/10 text-[#FFC107] font-black text-[9px] uppercase tracking-widest text-center transition-all duration-300"
                     >
                       ⚡ Customer Bypass
                     </button>
                     <button
                       type="button"
                       onClick={() => handleBypassLogin('captain' as any)}
                       className="py-3 px-3 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 font-black text-[9px] uppercase tracking-widest text-center transition-all duration-300"
                     >
                       ⭐ Captain Bypass
                     </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* STAGE 4: OTP VERIFICATION VIEW WITH DEEP ANIMATIONS */}
            {stage === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6 text-left"
              >
                <div>
                  <button 
                    onClick={() => setStage('credentials')} 
                    className="text-[10px] font-black text-[#FFC107] uppercase tracking-widest hover:underline mb-2 flex items-center gap-1"
                  >
                    ← Pichla Number
                  </button>
                  <h3 className="text-2xl font-black text-white leading-none">Darj Karein OTP</h3>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-2.5">
                    Code sent to <span className="text-white font-mono">{mobileNumber}</span>
                  </p>
                </div>

                {/* OTP Sim Notification helper banner */}
                <div className="bg-[#FFC107]/5 border border-[#FFC107]/10 rounded-2xl p-4 flex gap-3 items-center">
                  <Bookmark className="w-5 h-5 text-[#FFC107]" />
                  <div className="text-[10px] leading-relaxed">
                    <p className="text-[#FFC107] font-black leading-none uppercase">Simulated Code Recieved:</p>
                    <p className="text-white/70 font-bold mt-1">
                      Enter code <span className="font-mono text-white underline text-xs">{generatedSimCode}</span> or <span className="font-mono text-white underline text-xs">123456</span> to register as new user profile.
                    </p>
                  </div>
                </div>

                {/* 6 Grid Inputs */}
                <div className="flex justify-between gap-2.5 my-6">
                  {otpArray.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      ref={(el) => (otpInputsRef.current[index] = el as HTMLInputElement)}
                      value={data}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-12 h-14 bg-[#181818] border border-white/5 focus:border-[#FFC107] text-center text-xl font-mono font-black text-white rounded-2xl outline-none shadow-inner transition-all transform focus:scale-105"
                    />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={() => verifyOtpSubmission()}
                    disabled={isVerifyingOtp}
                    className="w-full py-4.5 bg-gradient-to-br from-[#FFC107] to-[#E5BB00] hover:shadow-[0_10px_20px_rgba(255,193,7,0.25)] text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
                  >
                    {isVerifyingOtp ? 'Verifying...' : 'Verify & Continue'} <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 font-bold text-[10px] text-white/40 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-[#FFC107]/60" /> 
                      {otpTimer > 0 ? (
                        <span>Resend in {otpTimer}s</span>
                      ) : (
                        <span className="text-[#FFC107]">Ready to Send</span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!canResendOtp}
                      onClick={handleOtpResend}
                      className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${canResendOtp ? 'text-[#FFC107] hover:underline' : 'text-white/20 cursor-not-allowed'}`}
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} /> Resend Code
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* STAGE 5: FIRST TIME PROFILE SETUP */}
            {stage === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 text-left"
              >
                <div>
                  <h3 className="text-2xl font-black text-white leading-none">Naya Account</h3>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-2.5">
                    Kripya details fill karein (Save Commuter profile)
                  </p>
                </div>

                <form onSubmit={handleProfileSetupComplete} className="space-y-4 pt-2">
                  
                  {/* Avatar Selector Carousel */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">CHOOSE YOUR AVATAR</label>
                    <div className="flex justify-between bg-[#181818] p-3 rounded-2xl border border-white/5 overflow-x-auto gap-2 scrollbar-none">
                      {avatars.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSelectedAvatar(emoji)}
                          className={`w-10 h-10 text-2xl flex items-center justify-center rounded-xl transition-all ${selectedAvatar === emoji ? 'bg-[#FFC107] scale-110 shadow-lg' : 'hover:bg-white/5 bg-transparent'}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">FULL NAME (APNA NAAM)</label>
                    <div className="flex bg-[#181818] rounded-2xl border border-white/5 p-1 items-center shadow-inner focus-within:border-[#FFC107]/40 transition-all">
                      <User className="w-4 h-4 text-[#FFC107] ml-3" />
                      <input
                        type="text"
                        required
                        placeholder="Rajan Jha"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-grow bg-transparent outline-none border-none py-3 px-3 text-sm text-white font-bold placeholder:text-neutral-700 font-sans"
                      />
                    </div>
                  </div>

                  {/* Optional Email input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">EMAIL ID (OPTIONAL)</label>
                    <div className="flex bg-[#181818] rounded-2xl border border-white/5 p-1 items-center shadow-inner focus-within:border-[#FFC107]/30 transition-all">
                      <Mail className="w-4 h-4 text-[#FFC107]/50 ml-3" />
                      <input
                        type="email"
                        placeholder="commuter@rapdo.in"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="flex-grow bg-transparent outline-none border-none py-3 px-3 text-sm text-white font-bold placeholder:text-neutral-700 font-sans"
                      />
                    </div>
                  </div>

                  {/* Language Picker */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">APP LANGUAGE (BHASHA)</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[#1A1A1A] rounded-2xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setSelectedLang('en')}
                        className={`py-2 rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-1.5 transition-all ${selectedLang === 'en' ? 'bg-[#FFC107] text-black font-black font-sans' : 'text-white/40 hover:text-white'}`}
                      >
                        <Languages className="w-3.5 h-3.5" /> English / Hinglish
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLang('hi')}
                        className={`py-2 rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-1.5 transition-all ${selectedLang === 'hi' ? 'bg-[#FFC107] text-black font-black font-sans' : 'text-white/40 hover:text-white'}`}
                      >
                        <Languages className="w-3.5 h-3.5" /> हिन्दी (Hindi)
                      </button>
                    </div>
                  </div>

                  {/* Submit profile setup */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4.5 bg-gradient-to-br from-[#FFC107] to-[#E5BB00] text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:shadow-[0_10px_20px_rgba(255,193,7,0.25)] transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Creating Profile...' : 'Set Up RAPDO Commute Profile'} <ArrowRight className="w-4 h-4" />
                  </button>

                </form>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
      
    </div>
  );
}
