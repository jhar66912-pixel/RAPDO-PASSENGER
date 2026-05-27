import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../lib/auth";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import {
  Sparkles,
  PhoneCall,
  Send,
  RefreshCw,
  Zap,
  CheckCircle2,
  Trash2,
  Scale,
  Package,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  User,
  MessagesSquare,
  BadgeAlert,
  Mic
} from "lucide-react";
import BottomNav from "../components/BottomNav";

interface ChatMessage {
  id: string;
  text: string;
  role: "user" | "assistant";
  timestamp: number;
  status?: "sending" | "sent" | "failed";
  customCard?: {
    type: "fare" | "parcel" | "action" | "escalation";
    title: string;
    details: string;
    actionLabel?: string;
    actionUrl?: string;
  };
}

export default function AiHelp() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`);
  
  // Escalation & Handoff Ticket states
  const [ticketState, setTicketState] = useState<{
    showForm: boolean;
    issue: string;
    desc: string;
    submitting: boolean;
    createdId: string | null;
  }>({
    showForm: false,
    issue: "Ride Fare Dispute",
    desc: "",
    submitting: false,
    createdId: null
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sound chime synthesizer utilizing browser AudioContext
  const playSynthesizedChime = (type: "send" | "receive" | "escalate") => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === "send") {
        osc.frequency.setValueAtTime(580, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1150, ctx.currentTime + 0.12);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === "receive") {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.22);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else { // escalate tri-tone chime
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (_) {}
  };

  // Pre-load welcome dialogue message on arrival
  useEffect(() => {
    setMessages([
      {
        id: "sys_welcome",
        text: `Pranaam bhaiya! RAHI Help AI Assistant me aapka swagat hai. 🙏\n\nMain aapki ride estimations, parcel transport progress, dynamic pricing ya driver updates me help kar sakta hu.\n\nType karein jaise ki: "Bhai Patna se Hajipur ka price kya hai?" ya "Mera parcel kahan pahucha?". Ask me anything!`,
        role: "assistant",
        timestamp: Date.now()
      }
    ]);
  }, []);

  // Soft automatic scrolling matching conversational flows
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  // Submit Query to deepseek proxy API on server
  const handleQuerySubmit = async (queryText: string) => {
    const text = queryText.trim();
    if (!text) return;

    playSynthesizedChime("send");

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: text,
      role: "user",
      timestamp: Date.now(),
      status: "sending"
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/rahi-ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId: sessionId,
          prompt: text,
          messages: messages.map(m => ({ role: m.role, content: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy network responded with status ${response.status}`);
      }

      const data = await response.json();
      let assistantReply = "";

      if (data.choices && data.choices[0] && data.choices[0].message) {
        assistantReply = data.choices[0].message.content;
      } else if (data.reply) {
        assistantReply = data.reply;
      } else {
        assistantReply = "Kshama chahenge bhai, network slow lag raha hai. Aap direct call karke update le sakte hain: +91 8252988672.";
      }

      playSynthesizedChime("receive");

      // Scan response for triggering custom interactive cards
      let customCard: ChatMessage["customCard"] = undefined;
      const lowercaseReply = assistantReply.toLowerCase();
      
      if (lowercaseReply.includes("route") || lowercaseReply.includes("price") || lowercaseReply.includes("fare") || lowercaseReply.includes("ticket")) {
        customCard = {
          type: "fare",
          title: "Golden Fare Calculator",
          details: "Interactive Tariffs are active. Starting at ₹5/km.",
          actionLabel: "View Full Fare Sandbox",
          actionUrl: "/pricing"
        };
      } else if (lowercaseReply.includes("parcel") || lowercaseReply.includes("track") || lowercaseReply.includes("package")) {
        customCard = {
          type: "parcel",
          title: "Hyperlocal Tracking System",
          details: "Check live dispatch timelines & courier checkpoints safely.",
          actionLabel: "My Timeline hub",
          actionUrl: "/activity"
        };
      } else if (lowercaseReply.includes("support") || lowercaseReply.includes("ticket") || lowercaseReply.includes("call") || lowercaseReply.includes("whatsapp")) {
        customCard = {
          type: "escalation",
          title: "Support Dispatch Desk",
          details: "Swastik Store, Mahaveer Chowk HQ is online.",
          actionLabel: "SOS Hotline: +91 8252988672",
          actionUrl: "tel:8252988672"
        };
      }

      setMessages((prev) => {
        return prev.map((m) => {
          if (m.id === userMessage.id) {
            return { ...m, status: "sent" };
          }
          return m;
        }).concat({
          id: `reply_${Date.now()}`,
          text: assistantReply,
          role: "assistant",
          timestamp: Date.now(),
          customCard: customCard
        });
      });

    } catch (error) {
      console.error("Failed submitting query payload:", error);
      playSynthesizedChime("receive");
      
      setMessages((prev) => 
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: "failed" } : m)).concat({
          id: `reply_err_${Date.now()}`,
          text: "Pranam bhai! Swastik Store network me thoda interruption hai. Par aap direct SOS call pe humari emergency support team se baat kar sakte hain: +91 8252988672.",
          role: "assistant",
          timestamp: Date.now(),
          customCard: {
            type: "action",
            title: "Direct Logistics SOS",
            details: "Connect instantly to our premium dispatcher lines in Mahaveer Chowk.",
            actionLabel: "Dial SOS",
            actionUrl: "tel:8252988672"
          }
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset conversation states
  const clearChatLogs = () => {
    playSynthesizedChime("escalate");
    setMessages([
      {
        id: "sys_welcome_reset",
        text: `Conversation logs have been cleared. Main session memory reloaded!\n\nMain aapki bookings aur parcel inquiries ke liye ready hu. Puchiye jo pochna hai!`,
        role: "assistant",
        timestamp: Date.now()
      }
    ]);
  };

  // Pre-configured click prompt structures
  const quickQueryChips = [
    { text: "Bhai, ride kitna time me ayega?", short: "ETA Check" },
    { text: "Patna se Hajipur ka fare list?", short: "Patna-Hajipur Fare" },
    { text: "Hamara parcel late chal raha hai", short: "Late Parcel Support" },
    { text: "Driver call nahi utha rha", short: "Unresponsive Rider" },
    { text: "Wallet me money debit ho gaya par load nahi hua", short: "Payment Failure" }
  ];

  // Secure Firestore escalation ticket creation
  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketState.desc.trim()) return;

    setTicketState(prev => ({ ...prev, submitting: true }));
    playSynthesizedChime("send");

    try {
      const ticketRef = await addDoc(collection(db, "support_tickets"), {
        customerId: currentUser?.uid || "anonymous_user",
        customerName: currentUser?.name || "Premium Guest User",
        issue: ticketState.issue,
        desc: ticketState.desc,
        priority: "high",
        status: "open",
        createdAt: Date.now()
      });

      playSynthesizedChime("receive");
      setTicketState(prev => ({ 
        ...prev, 
        submitting: false, 
        createdId: ticketRef.id,
        desc: ""
      }));

      // Append success indicator message into chat stream instantly
      setMessages(prev => [...prev, {
        id: `ticket_ack_${Date.now()}`,
        text: `✅ Ticket create ho chuka hai! Ticket ID: ${ticketRef.id}. Hamara Support Specialist (Swastik Store, Mahaveer Chowk team) aapse jaldi hi call pe contact karega. Chinta mat kijiye bhaiya, sab secure hai.`,
        role: "assistant",
        timestamp: Date.now()
      }]);

      // Close formulation box automatically
      setTimeout(() => {
        setTicketState(prev => ({ ...prev, showForm: false, createdId: null }));
      }, 5000);

    } catch (err) {
      console.error("Firestore writing ticket error:", err);
      // Fallback
      setTicketState(prev => ({ ...prev, submitting: false }));
      setMessages(prev => [...prev, {
        id: `ticket_err_${Date.now()}`,
        text: `❌ Access rules restrictions ki wajah se automatic ticket register nahi ho paya. Direct SOS dial karein: +91 8252988672. Dispatch Desk clear and active hai.`,
        role: "assistant",
        timestamp: Date.now()
      }]);
    }
  };

  const [isRecording, setIsRecording] = useState(false);

  const simulateSpeechToText = () => {
    setIsRecording(true);
    playSynthesizedChime("send"); // Just a sound to indicate recording started
    
    // Simulate recording delay and then speech converted to text
    setTimeout(() => {
      setInputValue("Patna Junction jane me kitna time lagega?");
      setIsRecording(false);
      playSynthesizedChime("receive");
    }, 2500);
  };

  return (
    <div id="ai-help-screen" className="flex flex-col flex-1 bg-[#0A0A0A] overflow-hidden min-h-screen text-white relative font-sans">
      
      {/* Holographic AI Background Image */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800" 
          alt="Holographic AI Background" 
          className="w-full h-full object-cover opacity-[0.06] mix-blend-screen scale-105 pointer-events-none"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-[#0A0A0A]/95 to-[#0A0A0A] pointer-events-none" />
      </div>

      {/* Decorative Blur Spheres */}
      <div className="absolute top-[10%] right-[-10vw] w-[50vw] h-[50vw] bg-[#FFD000]/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-15vw] w-[45vw] h-[45vw] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Main Container Header */}
      <header className="fixed top-20 md:top-28 left-0 w-full z-40 px-4">
        <div className="max-w-4xl mx-auto bg-[#101010]/80 backdrop-blur-2xl border border-white/5 p-4 rounded-3xl flex items-center justify-between shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-[#FFD000]/30 rounded-full blur-md animate-pulse"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#101010] to-black flex items-center justify-center border border-[#FFD000]/40 relative z-10 font-black text-black">
                 <Sparkles className="w-5 h-5 text-[#FFD000]" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase text-white flex items-center gap-2">
                RAHI Help AI <span className="text-[9px] bg-[#FFD000] text-black font-extrabold px-1.5 py-0.5 rounded">GEMINI PRO</span>
              </h2>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-wide">
                Bihar Express Commutes Support Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChatLogs}
              title="Reset Session memory"
              className="p-2.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-full transition-all text-white/60 hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <a
              href="tel:8252988672"
              className="px-4 py-2 bg-[#FFD000] text-black text-[11px] font-black uppercase tracking-wider rounded-full hover:bg-yellow-400 active:scale-95 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.25)]"
            >
              <PhoneCall className="w-3 h-3" /> SOS LINE
            </a>
          </div>
        </div>
      </header>

      {/* Conversational Stream Frame */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 mt-44 mb-32 relative z-10 flex flex-col justify-between">
        
        {/* Chat Logs */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 scrollbar-thin scrollbar-thumb-white/10"
          style={{ maxHeight: "calc(100vh - 380px)" }}
        >
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center shrink-0 shadow-sm text-yellow-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className="flex flex-col gap-1.5 max-w-[80%]">
                  <div
                    className={`p-4 rounded-3xl text-sm leading-relaxed backdrop-blur-3xl shadow-lg relative ${
                      isUser
                        ? "bg-[#181818] text-white border border-[#FFD000]/15 rounded-tr-none"
                        : "bg-[#101010]/95 text-white/90 border border-white/5 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    
                    <span className="text-[8px] text-white/30 font-bold block text-right mt-2 uppercase tracking-widest">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Dynamic interactive custom capability card inside dialogue */}
                  {message.customCard && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-br from-[#151515] to-[#0D0D0D] border border-[#FFD000]/10 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 self-start w-full mt-1.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FFD000]/10 border border-[#FFD000]/25 flex items-center justify-center text-[#FFD000] shrink-0">
                          {message.customCard.type === "fare" && <Scale className="w-5 h-5" />}
                          {message.customCard.type === "parcel" && <Package className="w-5 h-5" />}
                          {message.customCard.type === "escalation" && <BadgeAlert className="w-5 h-5" />}
                          {message.customCard.type === "action" && <Zap className="w-5 h-5" />}
                        </div>
                        <div className="text-left">
                          <h4 className="text-white text-xs font-black uppercase tracking-wider">{message.customCard.title}</h4>
                          <p className="text-white/40 text-[10px] leading-tight mt-0.5">{message.customCard.details}</p>
                        </div>
                      </div>

                      {message.customCard.actionUrl && (
                        message.customCard.actionUrl.startsWith("tel:") ? (
                          <a
                            href={message.customCard.actionUrl}
                            className="px-3.5 py-2 bg-[#FFD000] text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shrink-0"
                          >
                            {message.customCard.actionLabel}
                          </a>
                        ) : (
                          <a
                            href={message.customCard.actionUrl}
                            className="px-3.5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center gap-1"
                          >
                            {message.customCard.actionLabel} <ArrowRight className="w-3 h-3" />
                          </a>
                        )
                      )}
                    </motion.div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#202020] border border-[#FFD000]/20 flex items-center justify-center shrink-0 shadow-sm text-white font-black text-[10px] uppercase">
                    {currentUser?.name?.charAt(0) || "U"}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Typing dots placeholder loader code block */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start items-center"
            >
              <div className="w-8 h-8 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center shrink-0 text-yellow-400">
                <Sparkles className="w-4 h-4 animate-spin duration-3000" />
              </div>
              <div className="bg-[#121212]/90 border border-white/5 p-4 rounded-3xl rounded-tl-none flex gap-1 items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#FFD000]/60 animate-bounce" style={{ animationDelay: "0s" }} />
                <div className="w-2 h-2 rounded-full bg-[#FFD000]/80 animate-bounce" style={{ animationDelay: "0.15s" }} />
                <div className="w-2 h-2 rounded-full bg-[#FFD000] animate-bounce" style={{ animationDelay: "0.3s" }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Handoff Manual Support Form Trigger Card */}
        <AnimatePresence>
          {ticketState.showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#101010] border border-red-500/20 rounded-[28px] p-5 my-4 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-[40px]" />
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-red-400">
                  <BadgeAlert className="w-4 h-4" /> Connect to Swastik HQ Specialist
                </h3>
                <button
                  onClick={() => setTicketState(prev => ({ ...prev, showForm: false }))}
                  className="text-white/40 hover:text-white text-xs font-bold px-2 py-1"
                >
                  DISMISS
                </button>
              </div>

              <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1">Issue Category</label>
                    <select
                      value={ticketState.issue}
                      onChange={(e) => setTicketState(prev => ({ ...prev, issue: e.target.value }))}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD000]/50"
                    >
                      <option value="Ride Fare Dispute">Ride Fare Dispute</option>
                      <option value="Captain Delay/Arrested">Captain Delay/Unprofessional</option>
                      <option value="Parcel Lost/Damaged">Parcel Lost/Damaged</option>
                      <option value="Wallet Refund Hold">Wallet Refund Hold</option>
                      <option value="Other Bihar Commutes Support">Other Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1">Customer Identifier</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.name || "Premium Guest"}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white/50 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1">Details of Dispute</label>
                  <textarea
                    required
                    value={ticketState.desc}
                    onChange={(e) => setTicketState(prev => ({ ...prev, desc: e.target.value }))}
                    placeholder="Bhaiya, please short me details batayein taaki team member turant help karein..."
                    className="w-full h-20 bg-[#1A1A1A] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FFD000]/50 resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-1">
                  <button
                    type="submit"
                    disabled={ticketState.submitting}
                    className="px-6 py-3 bg-red-600 text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {ticketState.submitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Confirm Ticket Escalation"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Dialect Chip Selector Slider */}
        {messages.length <= 1 && (
          <div className="flex flex-col gap-1.5 w-full mb-4">
            <span className="text-left text-[9px] text-white/40 font-black uppercase tracking-widest ml-1">Quick Local Actions</span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
              {quickQueryChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuerySubmit(chip.text)}
                  className="px-4 py-2.5 bg-[#121212] border border-white/5 hover:border-[#FFD000]/40 text-white/80 hover:text-white rounded-full font-bold text-[11px] whitespace-nowrap transition-all duration-300"
                >
                  ⚡ {chip.short}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Recording 3D Overlay */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0A]/90 backdrop-blur-3xl rounded-[34px] overflow-hidden border border-blue-500/30"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] animate-pulse"></div>
              
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-[2px] shadow-[0_0_50px_rgba(59,130,246,0.5)] mb-8"
              >
                <div className="w-full h-full bg-[#0A0A0A] rounded-full flex items-center justify-center overflow-hidden relative">
                   <div className="absolute inset-0 bg-blue-500/20 animate-ping"></div>
                   <Mic className="w-12 h-12 text-blue-400 relative z-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                </div>
              </motion.div>

              <h3 className="relative z-10 text-2xl font-black text-white tracking-widest uppercase mb-2 drop-shadow-lg">Listening...</h3>
              <p className="relative z-10 text-blue-300/80 text-sm font-bold tracking-widest uppercase animate-pulse">Speak to RAHI Helper</p>
              
              {/* Audio visualizer simulation */}
              <div className="flex gap-2 mt-12 relative z-10 items-end h-16">
                 {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <motion.div
                       key={i}
                       animate={{ height: [`${Math.random() * 20 + 20}%`, `${Math.random() * 80 + 20}%`, `${Math.random() * 20 + 20}%`] }}
                       transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, ease: "easeInOut" }}
                       className="w-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                    />
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Control Console */}
        <div className="bg-[#121212] border border-white/5 p-3 rounded-[34px] flex items-center gap-2 shadow-2xl relative">
          
          <button
            onClick={() => {
              playSynthesizedChime("escalate");
              setTicketState(prev => ({ ...prev, showForm: !prev.showForm }));
            }}
            className={`p-3 rounded-full shrink-0 transition-all ${ticketState.showForm ? "bg-red-500/20 text-red-400 border border-red-500/3s" : "bg-white/5 border border-white/5 hover:bg-white/10 text-white/60 hover:text-white"}`}
            title="Escalate issue to human operator"
          >
            <BadgeAlert className="w-5 h-5" />
          </button>

          <button
            onClick={isRecording ? undefined : simulateSpeechToText}
            className={`p-3 rounded-full shrink-0 transition-all ${isRecording ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse" : "bg-white/5 border border-white/5 hover:bg-white/10 text-white/60 hover:text-white"}`}
            title="Voice Assistant"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuerySubmit(inputValue);
            }}
            placeholder="Bhai se poochiye (Hinglish supported)..."
            className="flex-grow bg-[#181818] border-none rounded-full px-5 py-3 text-xs md:text-sm text-white placeholder-white/20 focus:outline-none"
          />

          <button
            onClick={() => handleQuerySubmit(inputValue)}
            disabled={!inputValue.trim()}
            className="w-10 h-10 rounded-full bg-[#FFD000] text-black hover:bg-yellow-400 active:scale-95 transition-all flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(250,204,21,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        {/* Local Address & Location context footer indicator */}
        <div className="mt-4 flex justify-between items-center px-1 text-[10px] text-white/30 font-bold uppercase tracking-widest">
           <span>Session ID: {sessionId.substring(0, 14)}</span>
           <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Endpoint secure</span>
        </div>

      </main>

      {currentUser && currentUser.role === "customer" && <BottomNav />}
    </div>
  );
}
