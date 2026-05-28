import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Phone, MapPin, Share2, ShieldAlert, Radio, Shield, HelpCircle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SosEmergency() {
  const navigate = useNavigate();
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTriggered, setIsTriggered] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "CONNECTIVITY: Trans-Bihar Emergency Mesh Online",
    "LOCATION TRACING: Cell-tower multilateration standby",
    "INTEGRITY SHIELD: Ingress authorized for Patna Division"
  ]);
  const [ripples, setRipples] = useState<{ id: string }[]>([]);

  const holdStartTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rippleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastHapticProgressRef = useRef<number>(0);

  // Safe client-side haptic trigger helper
  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.warn("Navigator vibration aborted.", e);
      }
    }
  };

  // Dynamically update terminal logs based on hold completion
  useEffect(() => {
    if (!isHolding) {
      if (!isTriggered) {
        setLogs([
          "CONNECTIVITY: Trans-Bihar Emergency Mesh Online",
          "LOCATION TRACING: Cell-tower multilateration standby",
          "INTEGRITY SHIELD: Ingress authorized for Patna Division"
        ]);
      }
      return;
    }

    const currentDecile = Math.floor(progress / 15);
    if (currentDecile === 1 && logs.length === 3) {
      setLogs(p => [...p, "HAPTIC ENCODER: Calibrating bio-telemetry pulses..."]);
    } else if (currentDecile === 2 && logs.length === 4) {
      setLogs(p => [...p, "BEACON GRID: Pinging Samastipur & Darbhanga hubs..."]);
    } else if (currentDecile === 3 && logs.length === 5) {
      setLogs(p => [...p, "SATELLITE SYNC: Streamlining emergency telemetry uplink..."]);
    } else if (currentDecile === 4 && logs.length === 6) {
      setLogs(p => [...p, "PACKET CRYPTO: Wrapping live bio-hash payloads..."]);
    }
  }, [progress, isHolding, isTriggered, logs.length]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isTriggered) return;
    // Only accept main pointer ticks
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    setIsHolding(true);
    setProgress(0);
    lastHapticProgressRef.current = 0;
    holdStartTimeRef.current = performance.now();

    // Trigger initial heavy contact vibration pulse
    triggerHaptic(60);

    const tick = (now: number) => {
      if (!holdStartTimeRef.current) return;
      const elapsed = now - holdStartTimeRef.current;
      const holdLimit = 1500; // 1.5 seconds to trigger SOS
      const currProgress = Math.min((elapsed / holdLimit) * 100, 100);

      setProgress(currProgress);

      // Tick mechanical haptic rhythms every 10% progress
      const currentDecile = Math.floor(currProgress / 10);
      if (currentDecile > lastHapticProgressRef.current) {
        lastHapticProgressRef.current = currentDecile;
        // Escalating frequency feedback loop representing charge accumulation
        triggerHaptic(12 + currentDecile * 3);
      }

      if (currProgress >= 100) {
        triggerSuccess();
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };
    animationFrameRef.current = requestAnimationFrame(tick);

    // Initial ripple burst
    const initialId = `rip-${Date.now()}-${Math.random()}`;
    setRipples([{ id: initialId }]);

    // Spawn successive rapid ripples while holding
    rippleIntervalRef.current = setInterval(() => {
      const id = `rip-${Date.now()}-${Math.random()}`;
      setRipples(r => [...r.slice(-5), { id }]);
    }, 250);
  };

  const handlePointerUp = () => {
    if (isTriggered) return;
    cleanupHold();
    
    // Play dual failing bounce vibration if aborting after some investment
    if (progress > 15) {
      triggerHaptic([20, 40, 20]);
    }
    setProgress(0);
    setIsHolding(false);
  };

  const triggerSuccess = () => {
    setIsTriggered(true);
    setIsHolding(false);
    cleanupHold();
    setProgress(100);

    // Continuous powerful alert signal haptics
    triggerHaptic([150, 80, 150, 80, 400, 100, 600]);

    setLogs(p => [
      ...p,
      "🚨 DIRECTIVE RED SECURITY ALLOCATION COMMITTED!",
      "📍 LIVE DATA: COORDINATES MAP PINOCKED RADIUS [PATNA METRO AREA]",
      "📢 COURIERS SENT: Bihar Central Command Center dispatch validated.",
      "🛡️ CELL ALERT: Emergency broadcasts transmitted to 3 Trusted Partners."
    ]);
  };

  const cleanupHold = () => {
    holdStartTimeRef.current = null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (rippleIntervalRef.current) {
      clearInterval(rippleIntervalRef.current);
      rippleIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => cleanupHold();
  }, []);

  // Constants for precise SVG Circular Progress Border
  const size = 250;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#070707] text-[#F3F4F6] pt-24 pb-20 px-4 md:px-6 relative overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Background radial alarms */}
      <div className={`absolute inset-0 transition-all duration-700 pointer-events-none z-0 ${
        isTriggered 
          ? 'bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.25)_0%,rgba(7,7,7,1)_80%)]' 
          : isHolding 
            ? 'bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.18)_0%,rgba(7,7,7,1)_75%)]'
            : 'bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.06)_0%,rgba(7,7,7,1)_70%)]'
      }`} />

      {/* Futuristic Scanlines decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40 z-0" />
      
      <div className="max-w-xl w-full relative z-10 text-center flex flex-col items-center space-y-10">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-[#F3F4F6] flex items-center justify-center gap-3">
            <ShieldAlert className={`w-10 h-10 ${isTriggered ? 'text-red-500 animate-bounce' : 'text-red-500 animate-pulse'}`} />
            RAPDO <span className="text-red-500">SOS</span>
          </h1>
          <p className="text-white/60 text-xs md:text-sm leading-relaxed max-w-md mx-auto">
            {isTriggered 
              ? "EMERGENCY DIRECTIVE RED IN STREAM. Bihar safety circles are fully integrated. Do not close this viewport."
              : "In case of urgent distress, hold the premium biometric core below. Broadcasts live location, telemetry stream, and alerts Patna security dispatch instantly."
            }
          </p>
        </div>

        {/* SOS bi-directional button block */}
        <div className="relative w-72 h-72 flex items-center justify-center select-none">
          
          {/* Active Concentric Ripples */}
          <AnimatePresence>
            {ripples.map((rip) => (
              <motion.div
                key={rip.id}
                initial={{ transform: "scale(0.85)", opacity: 0.8 }}
                animate={{ transform: "scale(2.2)", opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="absolute w-56 h-56 rounded-full border-2 border-red-500/40 bg-red-500/5 pointer-events-none z-0"
              />
            ))}
          </AnimatePresence>

          {/* Persistent glow circles base */}
          <div className={`absolute w-52 h-52 rounded-full transition-all duration-300 pointer-events-none ${
            isTriggered 
              ? 'bg-red-600/40 blur-[50px] animate-pulse scale-125' 
              : isHolding 
                ? 'bg-red-500/25 blur-[40px] scale-110' 
                : 'bg-red-500/10 blur-[30px]'
          }`} />

          {/* SVG Progress Circle wrapper */}
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute -rotate-90 pointer-events-none z-20">
            {/* Background ring outline */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Glowing red progress indicator line */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#EF4444"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_#EF4444]"
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ ease: "easeOut", duration: 0.08 }}
            />
          </svg>

          {/* Interactive Trigger core button */}
          <motion.div
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            whileTap={{ scale: 0.94 }}
            className={`cursor-pointer w-52 h-52 rounded-full relative z-10 flex flex-col items-center justify-center border-4 select-none outline-none transition-all duration-300 transform ${
              isTriggered
                ? "bg-gradient-to-br from-red-600 via-red-700 to-red-900 border-white shadow-[0_0_60px_rgba(239,68,68,0.7)]"
                : isHolding
                  ? "bg-gradient-to-br from-red-500 to-red-700 border-red-500 scale-102 shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                  : "bg-gradient-to-br from-[#1C1A1A] to-[#0E0D0D] border-red-500/30 hover:border-red-500/60 shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
            }`}
          >
            {isTriggered ? (
              <div className="flex flex-col items-center gap-2">
                <Radio className="w-16 h-16 text-white animate-pulse" />
                <span className="text-white font-black text-xl tracking-wider animate-bounce uppercase">ALIVE FEED ACTIVE</span>
                <span className="text-white/80 font-mono text-[10px] tracking-widest uppercase">HELP ROUTED</span>
              </div>
            ) : isHolding ? (
              <div className="flex flex-col items-center gap-1.5 p-2">
                <Radio className="w-14 h-14 text-white animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-white font-black text-xl tracking-widest uppercase">HOLD SECURELY</span>
                <span className="text-red-400 font-mono font-bold text-lg animate-pulse">{(1.5 - (progress / 100) * 1.5).toFixed(2)}s</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center p-3">
                <AlertCircle className="w-14 h-14 text-red-500 transition-transform group-hover:scale-110" />
                <span className="text-white font-black text-lg uppercase tracking-widest">HOLD TO SOS</span>
                <span className="text-white/40 text-[10px] tracking-wider uppercase font-mono">1.5 SECONDS VALIDATION</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Live System Logging Dashboard */}
        <div className="w-full bg-[#0E0E0E] border border-white/5 rounded-2xl p-4 font-mono text-left space-y-2.5 max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-2 right-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-black">BIHAR GRID</span>
          </div>
          <div className="text-red-500 font-bold text-xs uppercase tracking-widest border-b border-white/5 pb-1.5 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Active Security Telemetry logs
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {logs.map((log, index) => (
              <p 
                key={index} 
                className={`text-[10px] leading-relaxed tracking-wide ${
                  log.startsWith("🚨") 
                    ? "text-[#FF4A4A] font-bold animate-pulse" 
                    : log.startsWith("HAPTIC") 
                      ? "text-yellow-500" 
                      : "text-white/45"
                }`}
              >
                &gt; {log}
              </p>
            ))}
          </div>
        </div>

        {/* Dial Directory Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left w-full max-w-lg">
          <div 
            className="bg-[#0E0E0E] hover:bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.01] active:scale-98" 
            onClick={() => {
              triggerHaptic(25);
              window.location.href="tel:100";
            }}
          >
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Phone className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">Patna Police Control</h4>
              <p className="text-white/40 text-[10px] mt-0.5">Direct hot-channel line (100)</p>
            </div>
          </div>

          <div 
            className="bg-[#0E0E0E] hover:bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.01] active:scale-98" 
            onClick={() => {
              triggerHaptic(25);
              window.location.href="tel:108";
            }}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Phone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">Ambulance Emergency</h4>
              <p className="text-white/40 text-[10px] mt-0.5">Division Health Dispatch (108)</p>
            </div>
          </div>

          <div className="bg-[#0E0E0E] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Share2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">Trusted Contacts</h4>
              <p className="text-emerald-400 text-[10px] font-bold tracking-wide mt-0.5 animate-pulse">● 3 Contacts Active</p>
            </div>
          </div>

          <div className="bg-[#0E0E0E] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <MapPin className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">GPS Integrity Ping</h4>
              <p className="text-amber-500 text-[10px] font-bold tracking-wide mt-0.5 animate-pulse">● SAMASTIPUR CELL 8a</p>
            </div>
          </div>
        </div>
        
        {/* Return controls */}
        <button 
          className="text-white/40 hover:text-white hover:underline text-xs uppercase tracking-widest font-black transition-colors" 
          onClick={() => {
            triggerHaptic(15);
            navigate(-1);
          }}
        >
          Cancel / Return Safely
        </button>

      </div>
    </div>
  );
}

