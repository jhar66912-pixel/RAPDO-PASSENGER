import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { Shield, ExternalLink, Sparkles } from 'lucide-react';

export default function Login() {
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      setError('');
      await login('customer');
      navigate('/book');
    } catch (err: any) {
       const errMsg = err.message || '';
       if (errMsg.includes('unauthorized-domain') || errMsg.includes('auth/unauthorized-domain')) {
         setError('FIREBASE_UNAUTHORIZED_DOMAIN: This development or preview URL is not authorized in your Firebase console. Please add "' + window.location.hostname + '" to your Firebase Console (Authentication > Settings > Authorized Domains), or click the "Demo Bihar-Local Bypass" below to explore RAHI immediately!');
       } else {
         setError(errMsg || 'Login failed due to unexpected error.');
       }
    } finally {
       setIsLoading(false);
    }
  };

  const handleBypassLogin = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      setError('');
      await loginDemo('customer');
      navigate('/book');
    } catch (err: any) {
       setError(err.message || 'Bypass failed.');
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0A0A0A] p-4 relative overflow-hidden min-h-screen z-0">
      {/* Premium Background Decor */}
      <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] bg-[#FFD000]/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#FFD000]/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay"></div>
      
      <div className="w-full max-w-sm rounded-[40px] p-1 shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative z-10 animate-in fade-in zoom-in-95 duration-700 bg-gradient-to-br from-white/10 to-white/5">
        <div className="bg-[#121212]/90 backdrop-blur-3xl rounded-[36px] p-8 border border-white/5 h-full relative overflow-hidden">
        
          <div className="text-center mb-10 mt-4 relative flex flex-col items-center">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-28 h-28 bg-[#FFD000]/20 rounded-full blur-[30px]"></div>
             
             <div className="relative w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1F1F1F] to-[#050505] p-[2px] shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(255,208,0,0.2)] border border-[#FFD000]/20 flex items-center justify-center animate-in fade-in slide-in-from-top-4 duration-1000">
               <div className="absolute inset-0 bg-gradient-to-bl from-[#FFD000]/20 to-transparent rounded-full mix-blend-overlay pointer-events-none" />
               <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent rounded-full pointer-events-none" />
               <div className="w-full h-full rounded-full bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden shadow-inner">
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                   <img src="https://i.ibb.co/ZzL02NFj/c3e39448-0850-4dca-9c25-f6dd3b1bba6a.png" alt="RAHI Logo" className="w-[130%] h-[130%] object-contain drop-shadow-[0_4px_10px_rgba(255,208,0,0.4)] scale-[1.25] relative z-10" />
               </div>
             </div>
             
             <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Identify.</h2>
             <p className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase mt-3">Enter the RAHI ecosystem</p>
          </div>

          <div className="space-y-6">
            {error && (
               <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center p-4 rounded-[20px] leading-relaxed shadow-inner">
                  {error}
                  {error.includes('popup') && (
                      <a href="/" target="_blank" rel="noreferrer" className="mt-3 py-2 px-4 bg-red-500/20 rounded-xl text-red-300 flex items-center justify-center gap-2 hover:bg-red-500/30 transition-colors">
                         <ExternalLink className="w-4 h-4" /> Open app in New Tab
                      </a>
                  )}
               </div>
            )}
            
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`group relative w-full py-5 px-6 bg-gradient-to-br from-[#FFD000] to-[#E5BB00] border border-[#FFD000]/50 text-black font-black text-sm uppercase tracking-widest rounded-[24px] shadow-[0_10px_30px_rgba(255,208,0,0.3)] transition-all flex justify-center items-center gap-4 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_10px_40px_rgba(255,208,0,0.5)] active:scale-95'}`}
            >
              <div className="absolute inset-0 bg-white/20 rounded-[24px] scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-out"></div>
              {isLoading ? (
                 <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shadow-[0_0_10px_rgba(0,0,0,0.1)]">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.89 16.79 15.72 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                      <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.72 17.57C14.73 18.23 13.48 18.64 12 18.64C9.13 18.64 6.7 16.7 5.84 14.08H2.17V16.94C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                      <path d="M5.84 14.07C5.62 13.41 5.5 12.72 5.5 12C5.5 11.28 5.62 10.59 5.84 9.93V7.07H2.17C1.42 8.55 1 10.22 1 12C1 13.78 1.42 15.45 2.17 16.93L5.84 14.07Z" fill="#FBBC05"/>
                      <path d="M12 5.36C13.62 5.36 15.06 5.92 16.2 7L19.35 3.85C17.46 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.17 7.07L5.84 9.93C6.7 7.3 9.13 5.36 12 5.36Z" fill="#EB4335"/>
                   </svg>
                 </div>
              )}
              <span className="relative z-10">{isLoading ? 'Authenticating...' : 'Sign in with Google'}</span>
            </button>

            <div className="flex items-center my-4 justify-between text-white/10">
              <span className="w-1/3 border-b border-white/5"></span>
              <span className="text-[10px] font-black tracking-widest uppercase text-white/30 px-2">OR</span>
              <span className="w-1/3 border-b border-white/5"></span>
            </div>

            <button
              type="button"
              onClick={handleBypassLogin}
              disabled={isLoading}
              className={`w-full py-4 px-6 bg-[#161616] hover:bg-[#1E1E1E] border border-white/5 hover:border-[#FFD000]/20 text-[#FFD000] font-black text-xs uppercase tracking-widest rounded-[24px] shadow-sm transition-all flex justify-center items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            >
              <Sparkles className="w-4 h-4 text-[#FFD000] animate-pulse" /> Demo Bihar-Local Bypass
            </button>
            
            <p className="text-center text-[10px] text-white/30 uppercase tracking-widest font-bold flex justify-center items-center gap-2 mt-8">
              <Shield className="w-3.5 h-3.5 text-[#FFD000]/50" /> Premium Passenger Auth Structure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

