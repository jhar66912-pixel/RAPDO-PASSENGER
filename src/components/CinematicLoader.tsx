import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function CinematicLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2500;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress(Math.min((currentStep / steps) * 100, 100));
      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 500); // Wait for exit animation
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      key="cinematic-loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Volumetric Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-[#FFC107]/10 rounded-full blur-[120px] mix-blend-screen" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen" />

      {/* Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-8">
        
        {/* Cinematic Logo Reveal */}
        <div className="relative mb-12">
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 tracking-tighter drop-shadow-[0_0_30px_rgba(255,193,7,0.3)]">
              RAPDO
            </h1>
          </motion.div>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
            className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#FFC107] to-transparent absolute -bottom-2 left-0 origin-center"
          />
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex gap-4 text-[11px] md:text-xs font-black uppercase tracking-[0.3em] text-[#FFC107]/80 mb-16"
        >
          <span>Fast</span>
          <span className="text-white/30">•</span>
          <span>Fair</span>
          <span className="text-white/30">•</span>
          <span>Local</span>
        </motion.div>

        {/* Holographic Loader Bar */}
        <div className="w-full max-w-xs relative">
          <div className="flex justify-between text-[10px] font-mono text-white/40 mb-2 uppercase tracking-widest">
            <span>System initialization</span>
            <span className="text-[#FFC107]">{Math.round(progress)}%</span>
          </div>
          
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative backdrop-blur-sm border border-white/10">
            <motion.div 
              className="absolute top-0 left-0 bottom-0 bg-[#FFC107] shadow-[0_0_15px_rgba(255,193,7,0.8)]"
              style={{ width: `${progress}%` }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex gap-2 mt-4 items-center justify-center"
          >
            <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
            <span className="text-[8px] font-mono text-white/30 tracking-widest uppercase">Connecting to Bihar Grid</span>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
