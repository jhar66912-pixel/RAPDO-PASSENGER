import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { searchBiharLocations, BiharLocation } from '../lib/locationDb';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptionComplete: (text: string, matchedLocation: BiharLocation | null) => void;
}

export function VoiceSearchModal({ isOpen, onClose, onTranscriptionComplete }: VoiceSearchModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [statusText, setStatusText] = useState('Animate holographic link...');
  const [isSupported, setIsSupported] = useState(true);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [matched, setMatched] = useState<BiharLocation | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    setTranscription('');
    setMatched(null);
    setStatusText('Listening for your voice (Hindi/English)...');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setStatusText('Speech recognition not supported on this device.');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'hi-IN'; // Default to Hindi-India but supports English perfectly

      rec.onstart = () => {
        setIsListening(true);
        setPermissionState('granted');
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error", e);
        if (e.error === 'not-allowed') {
          setPermissionState('denied');
          setStatusText('Microphone permission denied. Enable mic in browser.');
        } else {
          setStatusText(`Error: ${e.error || 'Connection failed'}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        setTranscription(text);

        // Check for matches in real-time
        if (text.trim().length > 1) {
          const results = searchBiharLocations(text);
          if (results.length > 0) {
            setMatched(results[0]);
            setStatusText(`Found match in ${results[0].city}!`);
          } else {
            setMatched(null);
            setStatusText('Transcribing... Keep speaking');
          }
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Speech recognition start failed", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleApply = () => {
    if (transcription.trim()) {
      onTranscriptionComplete(transcription, matched);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="voice-search-modal-container" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-[#0D0D0D] border border-white/10 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(255,193,7,0.15)] relative overflow-hidden"
          >
            {/* Holographic Glowing Orbs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-[#FFC107]/20 to-transparent blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full" />

            <div className="flex justify-between items-center mb-6 relative z-10">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#FFC107] flex items-center gap-1.5 bg-[#FFC107]/10 px-3 py-1 rounded-full border border-[#FFC107]/20">
                <Sparkles className="w-3 h-3 text-[#FFC107]" /> RAPDO AI Voice
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center py-6 text-center relative z-10">
              {/* Mic visual animation */}
              <div className="relative mb-8">
                {isListening && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                      className="absolute inset-0 bg-[#FFC107]/20 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 2.4, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                      className="absolute inset-0 bg-blue-500/10 rounded-full"
                    />
                  </>
                )}
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg border relative z-10 transition-all duration-300 ${
                    isListening
                      ? 'bg-gradient-to-tr from-[#FFC107] to-[#FFB300] border-black text-black scale-110 shadow-[0_0_30px_rgba(255,193,7,0.4)]'
                      : 'bg-[#1E1E1E] border-white/10 hover:border-[#FFC107]/50 text-white'
                  }`}
                >
                  {isListening ? <Mic className="w-8 h-8 animate-pulse" /> : <MicOff className="w-8 h-8 text-white/50" />}
                </button>
              </div>

              <div className="space-y-2 w-full px-4 mb-6">
                <h3 className="text-white font-black text-lg">
                  {isListening ? 'Sunaee de rha hai...' : 'Tap Mic to Speak'}
                </h3>
                <p className="text-white/40 text-[11px] font-bold tracking-widest uppercase">
                  Boliyen: "Patna Junction chalo"
                </p>
              </div>

              {/* Status / Transcription Card */}
              <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 min-h-[100px] flex flex-col justify-between mb-6 shadow-inner text-left">
                {transcription ? (
                  <p className="text-white text-base font-medium tracking-wide">
                    "{transcription}"
                  </p>
                ) : (
                  <p className="text-white/30 text-sm italic">
                    {isSupported ? 'Boliye, bhasha ki chinta na karein...' : 'Speech synthesis simulation keyboard enabled:'}
                  </p>
                )}

                {!isSupported && (
                  <input
                    type="text"
                    placeholder="Type fake spoken query (e.g. Boring Road)"
                    className="w-full mt-3 bg-black/50 border border-white/10 p-2.5 rounded-xl text-white text-sm focus:outline-none focus:border-[#FFC107] text-[12px]"
                    onChange={(e) => {
                      const val = e.target.value;
                      setTranscription(val);
                      const results = searchBiharLocations(val);
                      if (results.length > 0) {
                        setMatched(results[0]);
                        setStatusText(`Found match in ${results[0].city}!`);
                      } else {
                        setMatched(null);
                        setStatusText('Typing custom prompt...');
                      }
                    }}
                  />
                )}

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                  <span className="text-[10px] text-white/40 font-mono tracking-tight flex items-center gap-1.5">
                    {permissionState === 'denied' ? (
                      <AlertCircle className="w-3 h-3 text-red-400" />
                    ) : (
                      <div className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-green-400 animate-ping' : 'bg-white/40'}`} />
                    )}
                    {statusText}
                  </span>
                </div>
              </div>

              {/* Matching Location suggestion card */}
              {matched && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="w-full bg-gradient-to-r from-[#FFC107]/10 to-transparent border border-[#FFC107]/30 rounded-2xl p-3 flex items-center justify-between shadow-md mb-6"
                >
                  <div className="flex gap-3 items-center">
                    <span className="text-2xl">📍</span>
                    <div className="text-left">
                      <p className="text-[#FFC107] font-black text-xs uppercase tracking-wider">{matched.city}</p>
                      <p className="text-white font-bold text-sm tracking-wide">{matched.name}</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-[#FFC107]" />
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#1A1A1A] hover:bg-white/5 border border-white/5 text-white/70 hover:text-white rounded-xl text-sm font-bold tracking-wide transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!transcription.trim()}
                  onClick={handleApply}
                  className={`flex-1 py-3 rounded-xl text-sm font-black tracking-wide transition-all ${
                    transcription.trim()
                      ? 'bg-gradient-to-r from-[#FFC107] to-[#FFB300] text-black shadow-lg shadow-[#FFC107]/20 hover:scale-[1.02]'
                      : 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  Confirm Route
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
