import React, { useState, useEffect, useRef } from 'react';
import { 
  IndianRupee, Navigation, Clock, ShieldCheck, MapPin, Search, ChevronRight, 
  HelpCircle, Sparkles, Code2, Copy, Check, TrendingUp, Cpu, Sliders, AlertTriangle, 
  CloudRain, Zap, Volume2, Target, BarChart3, Database, Award, BookOpen, Layers, 
  Tv, Compass, ExternalLink, Play, Pause, RefreshCw, Smartphone, Mic, Activity, FileText, Server, HelpCircle as QuestionIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { RAHI_40_ROUTES, calculateBreakdown, RahiRoute } from '../data/pricingDatabase';
import { useAuth } from '../lib/auth';
import BottomNav from '../components/BottomNav';

export default function Pricing() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'routes' | 'engine' | 'eta' | 'voice' | 'admin' | 'architecture' | 'investor' | 'code'>('routes');
  
  // Route directory states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRange, setFilterRange] = useState<'all' | 'short' | 'medium' | 'express' | 'mega'>('all');
  const [sortBy, setSortBy] = useState<'id' | 'fare' | 'distance'>('id');
  const [routePage, setRoutePage] = useState(1);
  const itemsPerPage = 6;

  // Pricing Engine Calculator states
  const [calcDistance, setCalcDistance] = useState<number>(18);
  const [calcPlatformFee, setCalcPlatformFee] = useState<number>(7);
  const [isHeavyTraffic, setIsHeavyTraffic] = useState<boolean>(false);
  const [isRainyWeather, setIsRainyWeather] = useState<boolean>(false);
  const [calcServiceType, setCalcServiceType] = useState<'bike' | 'parcel'>('bike');

  // Interactive Live ETA Simulation States
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSteps, setSimSteps] = useState<number>(4); // countdown 4min -> 3min -> 2min -> Arrived
  const [simStepText, setSimStepText] = useState<string>("Captain Assigned • RAHI Hub");
  const [simProgressPercent, setSimProgressPercent] = useState<number>(10);
  const [audioFeedback, setAudioFeedback] = useState<boolean>(true);
  const simIntervalRef = useRef<any>(null);

  // Business investor simulation parameters
  const [dailyRidesTarget, setDailyRidesTarget] = useState<number>(16500);
  const [b2bLogisticsIncome, setB2bLogisticsIncome] = useState<number>(680000);
  const [subscriptionCoupons, setSubscriptionCoupons] = useState<number>(4200);
  const [adImpressionRevenue, setAdImpressionRevenue] = useState<number>(310000);
  const [loanAuditRevenue, setLoanAuditRevenue] = useState<number>(250000); // Banking loan verify service

  // Interactive Pitch Deck Slider index
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // AI Voice Booking Simulator State
  const [voiceInputText, setVoiceInputText] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceWaveform, setVoiceWaveform] = useState<number[]>([10, 15, 8, 22, 12, 18, 5, 25, 14, 16]);
  const [voiceMatchModel, setVoiceMatchModel] = useState<any>(null);
  const [voiceParsingStatus, setVoiceParsingStatus] = useState<'idle' | 'listening' | 'completed' | 'error'>('idle');

  // Admin Dashboard States
  const [adminPeakSurge, setAdminPeakSurge] = useState<number>(1.0);
  const [securityLockdown, setSecurityLockdown] = useState<boolean>(false);
  const [fraudAuditLog, setFraudAuditLog] = useState<Array<any>>([
    { id: 1, time: "08:41:05", desc: "Begusarai Fake-GPS Spoofer Dropped", type: "threat_defused" },
    { id: 2, time: "08:39:12", desc: "Unregulated fare bypass in Muzaffarpur Corridor", type: "audit_flag" },
    { id: 3, time: "08:34:55", desc: "Mahnar link completed safely • Micro-ledger synced", type: "ledger_ok" }
  ]);
  const [activeCaptainsTotal, setActiveCaptainsTotal] = useState<number>(1480);
  const [activePassengerHails, setActivePassengerHails] = useState<number>(342);

  // Exporter language state
  const [exportFramework, setExportFramework] = useState<'react' | 'flutter'>('react');
  const [isCopied, setIsCopied] = useState(false);

  // Synth custom frequency standard pitches
  const playSorenChime = (frequencies: number[], duration = 0.15, type: 'sine' | 'triangle' | 'sawtooth' = 'sine') => {
    if (!audioFeedback) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      frequencies.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + duration);
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + duration);
        }, idx * 110);
      });
    } catch (e) {
      console.warn("Audio bypass", e);
    }
  };

  // Run Hailing ETA simulator
  const triggerHailingSimulation = () => {
    if (isSimulating) {
      clearInterval(simIntervalRef.current);
      setIsSimulating(false);
      playSorenChime([330, 261], 0.25, 'sine');
    } else {
      setIsSimulating(true);
      setSimSteps(4);
      setSimProgressPercent(15);
      setSimStepText("🔍 Live tracking initiated • Finding nearest Captain");
      playSorenChime([523, 659, 783], 0.15, 'triangle');
      
      let stepCount = 4;
      simIntervalRef.current = setInterval(() => {
        stepCount -= 1;
        if (stepCount === 3) {
          setSimSteps(3);
          setSimProgressPercent(40);
          setSimStepText("🏍️ Crossing Samastipur bypass road Corridor • Speed: 48 km/h");
          playSorenChime([587, 698], 0.15, 'sine');
        } else if (stepCount === 2) {
          setSimSteps(2);
          setSimProgressPercent(70);
          setSimStepText("📍 Passing through Tajpur bypass gate • ETA 2 mins");
          playSorenChime([659, 783], 0.15, 'sine');
        } else if (stepCount === 1) {
          setSimSteps(1);
          setSimProgressPercent(90);
          setSimStepText("🔔 Captain adjacent to RAHI Hub!");
          playSorenChime([783, 880], 0.25, 'triangle');
        } else if (stepCount <= 0) {
          setSimSteps(0);
          setSimProgressPercent(100);
          setSimStepText("🏁 Captain Arrived! Ready to boarding.");
          playSorenChime([880, 1046, 1318], 0.4, 'sawtooth');
          clearInterval(simIntervalRef.current);
          setIsSimulating(false);
        }
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  // Filter routes
  const filteredRoutes = RAHI_40_ROUTES.filter(route => {
    const term = searchQuery.toLowerCase();
    const isSearchMatch = 
      route.drop.toLowerCase().includes(term) || 
      route.pickup.toLowerCase().includes(term) || 
      route.id.includes(term);

    const distance = route.distanceKm;
    let isRangeMatch = true;
    if (filterRange === 'short') isRangeMatch = distance <= 10;
    else if (filterRange === 'medium') isRangeMatch = distance > 10 && distance <= 25;
    else if (filterRange === 'express') isRangeMatch = distance > 25 && distance <= 50;
    else if (filterRange === 'mega') isRangeMatch = distance > 50;

    return isSearchMatch && isRangeMatch;
  });

  // Sort routes
  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    if (sortBy === 'fare') return a.fare - b.fare;
    return a.id.localeCompare(b.id);
  });

  // Pagination index
  const paginatedRoutes = sortedRoutes.slice((routePage - 1) * itemsPerPage, routePage * itemsPerPage);
  const totalPages = Math.ceil(sortedRoutes.length / itemsPerPage);

  // Compute breakdown for sandbox distance
  const baseBreakdown = calculateBreakdown(calcDistance, {
    isHeavyTraffic: isHeavyTraffic,
    isRainyWeather: isRainyWeather,
    selectedPlatformFee: calcPlatformFee
  });
  
  // Multiplied dynamic pricing factor driven by Admin Dashboard Surge Override slider
  const finalSurgeMultiplier = adminPeakSurge;
  const computedSandboxCustomerFare = Math.round(baseBreakdown.finalCustomerFare * finalSurgeMultiplier);
  const computedSandboxCaptainEarnings = Math.round((computedSandboxCustomerFare - baseBreakdown.platformFee) * 0.82);
  const computedSandboxCompanyProfit = Math.round(computedSandboxCustomerFare - computedSandboxCaptainEarnings);

  const handleDistancePreset = (km: number) => {
    setCalcDistance(km);
    playSorenChime([523], 0.08, 'sine');
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    playSorenChime([880, 1046], 0.1, 'sine');
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  // Enterprise Financial Revenue Calculations
  const averageTicketValue = computedSandboxCustomerFare; 
  const estimatedRidesMonthly = dailyRidesTarget * 30;
  
  // Platform fee accum + commission commission
  const monthlyAggregatorCharges = estimatedRidesMonthly * (calcPlatformFee + (computedSandboxCompanyProfit * 0.1));
  const activeSubsMonthly = subscriptionCoupons * 199; // ₹199 monthly pass
  
  const estimatedCapSubTotal = subscriptionCoupons * 199; // dynamic subscriptions pass
  const totalMonthlyEcosystemYield = Math.round(
    monthlyAggregatorCharges + 
    activeSubsMonthly + 
    b2bLogisticsIncome + 
    adImpressionRevenue + 
    loanAuditRevenue
  );
  const annualizedEcoyieldRunrate = totalMonthlyEcosystemYield * 12;

  // AI Voice simulator flow triggers
  const executeHindiVoiceSim = (utterance: string) => {
    if (isRecording) return;
    setIsRecording(true);
    setVoiceInputText(utterance);
    setVoiceParsingStatus('listening');
    playSorenChime([440, 554, 659], 0.15, 'sine');

    // Simulate speech wave processing animation
    const waveTicker = setInterval(() => {
      setVoiceWaveform(Array.from({ length: 15 }, () => Math.floor(Math.random() * 35) + 5));
    }, 150);

    setTimeout(() => {
      clearInterval(waveTicker);
      setIsRecording(false);
      setVoiceParsingStatus('completed');
      
      // Smart prompt indexing & coordinate extraction
      let detectedRoute: RahiRoute | undefined;
      let serviceModule: string = "Bike Taxi";

      if (utterance.includes("station") || utterance.includes("Station")) {
        detectedRoute = RAHI_40_ROUTES.find(r => r.id === "001"); // Samastipur -> Tajpur Road
      } else if (utterance.includes("Darbhanga") && utterance.includes("Muzaffarpur")) {
        detectedRoute = RAHI_40_ROUTES.find(r => r.id === "015"); // Samastipur -> Muzaffarpur (serving intercity bypass query)
        serviceModule = "Smart Parcel";
      } else if (utterance.includes("urgent dawa") || utterance.includes("Pusa")) {
        detectedRoute = RAHI_40_ROUTES.find(r => r.id === "009"); // Samastipur -> Pusa Agriculture Univ
        serviceModule = "Medicine Courier";
      } else if (utterance.includes("loan") || utterance.includes("Rosera")) {
        detectedRoute = RAHI_40_ROUTES.find(r => r.id === "006"); // Samastipur -> Rosera
        serviceModule = "Credit Field audit verify";
      } else {
        detectedRoute = RAHI_40_ROUTES[Math.floor(Math.random() * RAHI_40_ROUTES.length)];
      }

      if (detectedRoute) {
        const breakdown = calculateBreakdown(detectedRoute.distanceKm, { selectedPlatformFee: 7 });
        setVoiceMatchModel({
          route: detectedRoute,
          service: serviceModule,
          fare: breakdown.finalCustomerFare,
          captain: "Rahul Kumar Mandal",
          vehicle: "TVS Apache (BR-33-Y-7782)",
          eta: Math.max(3, Math.round(detectedRoute.etaMinutes / 3))
        });
        playSorenChime([659, 783, 1046], 0.25, 'triangle');
      }
    }, 2200);
  };

  // Pitch Deck structured content
  const PITCH_DECK_SLIDES = [
    {
      title: "1. The Fragmented Bihar Market",
      tagline: "High fees, absent infrastructure, and language barriers limit Tier-2 / Tier-3 India.",
      highlight: "30M Potential Riders Under-served",
      desc: "Bihar is the youngest state in India, yet residents in Samastipur, Darbhanga, and Begusarai are locked out of high-quality transportation. Global aggregators charge up to 30% commission, forcing Captains off the grid or into offline bargaining.",
      icon: <AlertTriangle className="w-8 h-8 text-amber-500" />
    },
    {
      title: "2. The RAHI Disruption Blueprint",
      tagline: "Subscription pricing model, fixed offline transparent corridors, and local focus.",
      highlight: "₹49/Day Flat Captain Passes",
      desc: "Unlike Uber/Ola/Rapido, RAHI charges Captains zero high-ride commission. Captains purchase simple daily, weekly, or monthly subscription passes. They retain 100% of the passenger split fare, unlocking up to 35% higher earnings.",
      icon: <Zap className="w-8 h-8 text-[#FFD000] animate-pulse" />
    },
    {
      title: "3. Addressable TAM / SAM / SOM",
      tagline: "Capitalizing on the next 150 million aspiring digital citizens in local hubs.",
      highlight: "₹1,500 Crore TAM Addressable Market",
      desc: "Expanding in 40 dense operational Bihar clusters. SAM target is 15M active mobile internet users who transact digitally. SOM is capturing 1.2M daily local intercity commuters, and B2B pharmaceutical logistics.",
      icon: <Target className="w-8 h-8 text-blue-400" />
    },
    {
      title: "4. Unit Economics: RAHI vs. Legacy Aggregators",
      tagline: "Why our dual business-api and low-cost structure is investor-ready.",
      highlight: "Aggregator takes ₹30 vs. RAHI ₹7 Flat Fee",
      desc: "Aggregators demand heavy margins. RAHI takes ₹0 ride commission, charging ₹7 flat passenger platform fee + dynamic Captain subscriptions. Scale provides high-frequency wallet balances, local digital ad yields, and B2B commerce margins.",
      icon: <IndianRupee className="w-8 h-8 text-emerald-400" />
    },
    {
      title: "5. B2B & Loan Verification Synergy",
      tagline: "Our Captain network doubles as field audit workforce for Banks & NBFCs.",
      highlight: "₹400/Audit Geo-tagged Survey revenue",
      desc: "Saddled with slack-hours (11 AM to 4 PM), Captains act as high-trust field verification agents for banking institutions. Performing address audits, crop reports, and asset audits, bypassing specialized agency expenses.",
      icon: <ShieldCheck className="w-8 h-8 text-purple-400" />
    },
    {
      title: "6. Operational Milestone & Scaling Plan",
      tagline: "Expanding from Samastipur HQ to 6 major cities in strategic phases.",
      highlight: "Muzaffarpur • Darbhanga • Begusarai • Hajipur • Patna",
      desc: "Phase 1: Deep launch in Samastipur district. Phase 2: Inter-city links with Darbhanga & Begusarai. Phase 3: Patna Junction heavy transit hubs. Backed by local hyper-caches to handle weak cellular connections.",
      icon: <Compass className="w-8 h-8 text-teal-400" />
    }
  ];

  // Developer static code snippets
  const reactCodeSnippet = `import React from 'react';
import { Navigation, Bike } from 'lucide-react';

interface RahiRouteProps {
  id: string;
  pickup: string;
  drop: string;
  distanceKm: number;
  fare: number;
  captainEarnings: number;
  companyProfit: number;
  trafficStatus: string;
  eta: number;
}

export const RahiRouteCard: React.FC<RahiRouteProps> = ({
  id, pickup, drop, distanceKm, fare, captainEarnings, companyProfit, trafficStatus, eta
}) => {
  return (
    <div className="relative bg-[#121212] border border-white/5 rounded-[32px] p-6 hover:border-[#FFD000]/30 transition-all overflow-hidden text-left">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-[30px]" />
      <div className="flex justify-between items-center mb-4">
        <span className="text-[9px] uppercase tracking-wider font-extrabold px-3 py-1 bg-white/5 text-white/60 rounded-full border border-white/5">
          Route R-{id}
        </span>
        <span className="text-xl font-black text-[#FFD000]">₹{fare}</span>
      </div>
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#FFD000] rounded-full shrink-0" />
          <p className="text-white font-extrabold text-sm truncate">{pickup} → {drop}</p>
        </div>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
          {distanceKm} KM • Approx {eta} mins travel time
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5 bg-white/[0.01] p-3 rounded-2xl text-xs">
        <div>
          <span className="block text-[8px] text-white/30 font-black uppercase tracking-widest">Captain Earnings</span>
          <span className="text-sm font-black text-emerald-400">₹{captainEarnings}</span>
        </div>
        <div>
          <span className="block text-[8px] text-white/30 font-black uppercase tracking-widest">RAHI Vault</span>
          <span className="text-sm font-black text-white/80 font-mono">₹{companyProfit}</span>
        </div>
      </div>
    </div>
  );
};`;

  const flutterCodeSnippet = `// RAHI Bihar Premium Mobility Network - Route Card Dart UI Widget
import 'package:flutter/material.dart';

class RahiRouteCard extends StatelessWidget {
  final String routeId;
  final String pickup;
  final String drop;
  final double distanceKm;
  final double customerFare;
  final double captainEarnings;
  final double companyProfit;
  final String trafficStatus;
  final int etaMinutes;

  const RahiRouteCard({
    Key? key,
    required this.routeId,
    required this.pickup,
    required this.drop,
    required this.distanceKm,
    required this.customerFare,
    required this.captainEarnings,
    required this.companyProfit,
    required this.trafficStatus,
    required this.etaMinutes,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF131313),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(22.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.04),
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: Text("ROUTE $routeId", style: const TextStyle(color: Colors.white55, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
                Text("₹\${customerFare.toStringAsFixed(0)}", style: const TextStyle(color: Color(0xFFFFD000), fontWeight: FontWeight.black, fontSize: 24))
              ],
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                const Icon(Icons.location_on, color: Color(0xFFFFD000), size: 16),
                const SizedBox(width: 8),
                Text("$pickup → $drop", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14)),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(color: Colors.white12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildCol("CAPTAIN", "₹\${captainEarnings.toStringAsFixed(0)}", Colors.green),
                _buildCol("RAHI VAULT", "₹\${companyProfit.toStringAsFixed(0)}", const Color(0xFFFFD000)),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildCol(String title, String val, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(color: Colors.white30, fontSize: 8, fontWeight: FontWeight.bold)),
        Text(val, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.black)),
      ],
    );
  }
}`;

  return (
    <div className="flex-1 bg-[#0A0A0A] min-h-screen font-sans text-left selection:bg-[#FFD000]/20 selection:text-white relative">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Upper Corporate Jumbotron Banner */}
        <div className="relative bg-[#121212] rounded-[48px] border border-white/5 p-8 sm:p-12 overflow-hidden shadow-2xl mb-8">
           <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-gradient-to-tr from-transparent to-[#FFD000]/10 rounded-full blur-[60px] pointer-events-none animate-pulse" />
           <div className="absolute bottom-[-100px] left-[-100px] w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
           <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#FFD000] to-transparent" />

           <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-left">
              <div className="space-y-3 max-w-2xl">
                 <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFD000]/15 border border-[#FFD000]/35 shadow-inner">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD000] animate-bounce" />
                    <span className="text-[#FFD000] text-[9px] font-black uppercase tracking-widest leading-none">RAHI STARTUP ENTERPRISE HUB</span>
                 </div>
                 <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none uppercase font-sans">
                   Bihar's Premium <span className="text-[#FFD000] block sm:inline">Mobility Platform</span>
                 </h1>
                 <p className="text-white/60 text-sm leading-relaxed max-w-xl font-medium">
                    Redesigning public commerce across Tier-2/3 Bihar. Interactive ledger simulations, algorithmic route directory, dynamic environmental overrides, and verified banking audit channels.
                 </p>
                 
                 <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                       <Database className="w-4 h-4 text-[#FFD000]" />
                       <span>40 Active Corridors</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                       <Cpu className="w-4 h-4 text-emerald-400 font-bold" />
                       <span>Statewide NLP Dispatch</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                       <Award className="w-4 h-4 text-purple-400 font-bold" />
                       <span>Premium Investor Suite</span>
                    </div>
                 </div>
              </div>

              {/* Live Run Rate widget */}
              <div className="bg-[#18181a]/90 backdrop-blur-md border border-white/10 p-6 rounded-[32px] md:max-w-xs w-full shadow-2xl relative overflow-hidden text-left">
                 <div className="absolute top-3 right-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </div>
                 <span className="text-white/40 text-[8px] font-black uppercase tracking-widest block mb-2">Simulated Ecosystem Yield</span>
                 <p className="text-white text-3xl font-black tracking-tighter mb-1 select-all font-mono">₹{(annualizedEcoyieldRunrate / 100000).toFixed(1)} Lakhs</p>
                 <span className="text-white/60 font-bold text-[10px] uppercase">Annual Scaled Revenue Target</span>
                 <div className="mt-4 pt-3 border-t border-dashed border-white/5 flex justify-between items-center text-[10px]">
                    <span className="text-emerald-400 font-extrabold uppercase">District Penetration</span>
                    <span className="text-white font-mono font-bold">18.6%</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Global Dashboard Navigation Tabs Grid */}
        <div className="flex flex-wrap gap-2 mb-8 bg-[#121212] border border-white/5 p-2 rounded-[28px] shadow-2xl sticky top-0 z-40 backdrop-blur-2xl">
           {[
             { id: 'routes', icon: <Database className="w-3.5 h-3.5 shrink-0" />, label: "40 Routes Link" },
             { id: 'engine', icon: <Sliders className="w-3.5 h-3.5 shrink-0" />, label: "Dynamic Pricing" },
             { id: 'eta', icon: <Clock className="w-3.5 h-3.5 shrink-0" />, label: "Live Dispatch" },
             { id: 'voice', icon: <Mic className="w-3.5 h-3.5 shrink-0 animate-pulse" />, label: "AI Voice Booking" },
             { id: 'admin', icon: <Activity className="w-3.5 h-3.5 shrink-0" />, label: "Admin Risk Control" },
             { id: 'architecture', icon: <Server className="w-3.5 h-3.5 shrink-0" />, label: "Sys Architecture" },
             { id: 'investor', icon: <TrendingUp className="w-3.5 h-3.5 shrink-0" />, label: "Investor Pitch" },
             { id: 'code', icon: <Code2 className="w-3.5 h-3.5 shrink-0" />, label: "Dev Export" }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => { setActiveTab(tab.id as any); playSorenChime([523], 0.08); }}
               className={`flex-1 min-w-[110px] sm:min-w-0 flex items-center justify-center gap-1.5 py-3.5 rounded-[18px] text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'bg-[#FFD000] text-black font-black shadow-lg scale-[1.02]' : 'text-white/55 hover:text-white hover:bg-white/5'}`}
             >
                {tab.icon}
                <span>{tab.label}</span>
             </button>
           ))}
        </div>

        {/* TAB contenidos */}

        {/* Tab 1: 40 Routes Database */}
        {activeTab === 'routes' && (
          <div className="space-y-6">
             <div className="bg-[#121212] border border-white/5 rounded-[40px] p-6 sm:p-8 shadow-xl">
                
                {/* Search / Sort filters bar */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-8 pb-6 border-b border-white/5 text-left">
                   <div className="space-y-1">
                      <h3 className="text-xl font-extrabold text-white">Algorithmic Bihar Route Director</h3>
                      <p className="text-white/40 text-xs">Production indexed corridors configured for direct physical routing</p>
                   </div>
                   
                   <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                      {/* Search Input */}
                      <div className="relative flex-grow sm:flex-initial min-w-[200px]">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                         <input 
                           type="text" 
                           placeholder="Search destination, village, or crossing..."
                           value={searchQuery}
                           onChange={e => { setSearchQuery(e.target.value); setRoutePage(1); }}
                           className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold outline-none text-white focus:border-[#FFD000]/60 placeholder:text-white/20 transition-colors"
                         />
                      </div>
                      
                      {/* Sort selection */}
                      <select 
                        value={sortBy}
                        onChange={e => { setSortBy(e.target.value as any); setRoutePage(1); }}
                        className="bg-[#1a1a1c] border border-white/5 text-white/80 text-xs font-black rounded-xl px-3 py-2 outline-none focus:border-[#FFD000] cursor-pointer"
                      >
                         <option value="id">Route Tag ID</option>
                         <option value="fare">Settle Fare Price</option>
                         <option value="distance">Distance Mileage</option>
                      </select>

                      {/* Sound Feedback trigger */}
                      <button 
                        onClick={() => { setAudioFeedback(!audioFeedback); playSorenChime([880], 0.1, 'sine'); }}
                        className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/5 transition-colors ${audioFeedback ? 'bg-[#FFD000]/10 text-[#FFD000] border-[#FFD000]/25' : 'bg-[#1A1A1A] text-white/40'}`}
                      >
                         <Volume2 className="w-3.5 h-3.5" />
                         <span>{audioFeedback ? 'Sound ON' : 'Muted'}</span>
                      </button>
                   </div>
                </div>

                {/* Range category selectors */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-[#1A1A1A] rounded-xl border border-white/5 mb-8 overflow-x-auto no-scrollbar shadow-inner text-left">
                   {[
                     { id: 'all', label: 'All Corridors (40)' },
                     { id: 'short', label: 'Local Access (≤10 KM)' },
                     { id: 'medium', label: 'Suburban Connects (10-25 KM)' },
                     { id: 'express', label: 'Intercity Links (25-50 KM)' },
                     { id: 'mega', label: 'State Super Commutes (>50 KM)' }
                   ].map(cat => (
                     <button
                       key={cat.id}
                       onClick={() => { setFilterRange(cat.id as any); setRoutePage(1); playSorenChime([523], 0.05); }}
                       className={`px-3.5 py-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex-grow ${filterRange === cat.id ? 'bg-[#FFD000] text-black font-black' : 'text-white/40 hover:text-white/80'}`}
                     >
                        {cat.label}
                     </button>
                   ))}
                </div>

                {/* Route output directory grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {paginatedRoutes.map((route) => {
                      const analysis = calculateBreakdown(route.distanceKm, { selectedPlatformFee: 7 });

                      return (
                        <div 
                           key={route.id}
                           className="group relative bg-[#18181a] border border-white/5 hover:border-[#FFD000]/30 rounded-[32px] p-6 shadow-xl hover:shadow-[0_15px_30px_rgba(255,208,0,0.03)] transition-all duration-300 flex flex-col justify-between text-left overflow-hidden"
                        >
                           <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-[#FFD000]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#FFD000]/10 transition-colors" />

                           <div>
                              <div className="flex justify-between items-center mb-4">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black tracking-widest text-[#FFD000] bg-[#FFD000]/10 border border-[#FFD000]/20 rounded-md px-2 py-1 leading-none uppercase font-mono">
                                       R-{route.id}
                                    </span>
                                    <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 bg-white/5 text-white/50 rounded-md">
                                       {route.distanceKm} KM
                                    </span>
                                 </div>
                                 <div className="text-right">
                                    <span className="block text-[8px] font-bold text-white/30 uppercase tracking-widest">Pre-Mapped</span>
                                    <span className="text-2xl font-black text-[#FFD000] tracking-tight font-mono">₹{route.fare}</span>
                                 </div>
                              </div>

                              {/* Locations timeline representation */}
                              <div className="space-y-4 pt-4 pb-4 border-t border-dashed border-white/5">
                                 <div className="flex items-start gap-3 relative">
                                    <div className="absolute left-2.5 top-5 bottom-0.5 w-[2px] bg-gradient-to-b from-[#FFD000] to-transparent border-dashed" />
                                    <div className="w-5 h-5 rounded-full bg-white/5 border border-[#FFD000] flex items-center justify-center shrink-0 mt-0.5">
                                       <div className="w-1.5 h-1.5 bg-[#FFD000] rounded-full" />
                                    </div>
                                    <div>
                                       <span className="block text-[8px] text-white/30 font-bold uppercase tracking-widest">Origin Cluster</span>
                                       <span className="text-white font-extrabold text-xs">{route.pickup}</span>
                                    </div>
                                 </div>

                                 <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                                       <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                                    </div>
                                    <div>
                                       <span className="block text-[8px] text-white/30 font-bold uppercase tracking-widest">Terminal Hub</span>
                                       <span className="text-white/90 font-extrabold text-xs">{route.drop}</span>
                                    </div>
                                 </div>
                              </div>

                              {/* Split Metrics ledger */}
                              <div className="mt-2 bg-[#111] p-3.5 rounded-2xl grid grid-cols-3 gap-2 border border-white/[0.02] text-left">
                                 <div>
                                    <span className="block text-[7px] text-white/30 font-bold tracking-widest uppercase mb-0.5">Captain split</span>
                                    <span className="text-xs font-black text-emerald-400 font-mono">₹{analysis.captainEarnings}</span>
                                    <span className="block text-[6px] text-white/40">100% Payout</span>
                                 </div>
                                 <div>
                                    <span className="block text-[7px] text-white/30 font-bold tracking-widest uppercase mb-0.5">Ecosystem Vault</span>
                                    <span className="text-xs font-black text-white/70 font-mono">₹{analysis.companyProfit}</span>
                                    <span className="block text-[6px] text-white/40">Micro fee</span>
                                 </div>
                                 <div>
                                    <span className="block text-[7px] text-white/30 font-bold tracking-widest uppercase mb-0.5">Transit Index</span>
                                    <span className={`text-[9px] font-black uppercase ${route.trafficStatus === 'Heavy' ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                                       ● {route.trafficStatus}
                                    </span>
                                    <span className="block text-[6px] text-white/30">{route.etaMinutes}m Est</span>
                                 </div>
                              </div>
                           </div>

                           <div className="mt-6 pt-4 border-t border-white/5">
                              <Link 
                                to={`/book?route=route-${parseInt(route.id, 10)}`}
                                onClick={() => playSorenChime([659, 1046], 0.15, 'sawtooth')}
                                className="w-[100%] inline-block text-center py-3 bg-white/5 text-white/95 border border-white/5 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#FFD000] hover:text-black hover:scale-[1.01] active:scale-95 transition-all"
                              >
                                Dispatch Commute Ride
                              </Link>
                           </div>
                        </div>
                      );
                   })}
                </div>

                {/* Empty directory catch check */}
                {paginatedRoutes.length === 0 && (
                   <div className="text-center py-20 bg-[#161618] rounded-[40px] border border-white/5">
                      <AlertTriangle className="w-12 h-12 text-[#FFD000]/60 mx-auto mb-3" />
                      <p className="text-white font-black text-sm">No matched corridors found</p>
                      <p className="text-white/40 text-xs mt-1">Refine your search keywords (e.g. Try 'Samastipur', 'Patna', 'Bypass').</p>
                   </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                   <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/5">
                      <span className="text-xs text-white/40 font-bold">Showing Page {routePage} of {totalPages}</span>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => { setRoutePage(p => Math.max(1, p - 1)); playSorenChime([330], 0.1); }}
                           disabled={routePage === 1}
                           className="px-4 py-2 bg-[#1A1A1A] border border-white/5 hover:bg-neutral-800 disabled:opacity-30 rounded-xl text-xs font-black text-white transition-colors"
                         >
                            Previous Description
                         </button>
                         <button 
                           onClick={() => { setRoutePage(p => Math.min(totalPages, p + 1)); playSorenChime([523], 0.1); }}
                           disabled={routePage === totalPages}
                           className="px-4 py-2 bg-[#1A1A1A] border border-white/5 hover:bg-neutral-800 disabled:opacity-30 rounded-xl text-xs font-black text-white transition-colors"
                         >
                            Next Corridors
                         </button>
                      </div>
                   </div>
                )}

             </div>
          </div>
        )}

        {/* Tab 2: Pricing Sandbox Calculator */}
        {activeTab === 'engine' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Parameters panel */}
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#121212] border border-white/5 rounded-[40px] p-8 shadow-xl text-left">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#FFD000]/10 flex items-center justify-center">
                         <Sliders className="w-5 h-5 text-[#FFD000]" />
                      </div>
                      <div>
                         <h3 className="text-xl font-extrabold text-white">Algorithmic Base-Fare Sandbox</h3>
                         <p className="text-white/40 text-xs">Simulate dynamic distances, surges, and ledger write-backs from Bihar clusters</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      {/* Service selector */}
                      <div>
                         <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-3">Service Module Portal</label>
                         <div className="grid grid-cols-2 gap-3">
                            <button 
                              type="button" onClick={() => { setCalcServiceType('bike'); playSorenChime([440, 554], 0.1, 'sine'); }}
                              className={`py-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${calcServiceType === 'bike' ? 'bg-[#FFD000] text-black border-transparent font-black shadow-lg shadow-[#FFD000]/10' : 'bg-transparent text-white/50 hover:bg-white/5 border-white/10'}`}
                            >
                               🏍️ Bike Taxi Commute
                            </button>
                            <button 
                              type="button" onClick={() => { setCalcServiceType('parcel'); playSorenChime([523, 659], 0.1, 'sine'); }}
                              className={`py-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${calcServiceType === 'parcel' ? 'bg-[#FFD000] text-black border-transparent font-black shadow-lg shadow-[#FFD000]/10' : 'bg-transparent text-white/50 hover:bg-white/5 border-white/10'}`}
                            >
                               📦 Smart Parcel Courier
                            </button>
                         </div>
                      </div>

                      {/* Distance slider */}
                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Commute Distance Mileage</span>
                            <span className="text-2xl font-black text-[#FFD000] font-mono">{calcDistance} <span className="text-xs text-white/50 font-sans">KM</span></span>
                         </div>
                         <input 
                           type="range"
                           min="1"
                           max="100"
                           value={calcDistance}
                           onChange={e => { setCalcDistance(parseInt(e.target.value)); playSorenChime([330 + parseInt(e.target.value)*4], 0.05, 'triangle'); }}
                           className="w-full accent-[#FFD000] h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                         />
                         
                         {/* Presets */}
                         <div className="flex gap-2 pt-1 overflow-x-auto no-scrollbar scrollbar-thin">
                            {[4, 10, 18, 25, 45, 65, 98].map(p => (
                               <button 
                                 key={p} 
                                 type="button"
                                 onClick={() => handleDistancePreset(p)}
                                 className={`px-3.5 py-2 bg-[#1a1a1c] hover:bg-neutral-800 rounded-lg text-[10px] font-bold font-mono text-white/80 border ${calcDistance === p ? 'border-[#FFD000] text-white bg-[#FFD000]/5' : 'border-white/5'}`}
                               >
                                  {p} KM {p === 98 ? '(Patna Hub)' : ''}
                               </button>
                            ))}
                         </div>
                      </div>

                      {/* Platform Override controls */}
                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Aggregate Platform Fee Override</span>
                            <span className="text-lg font-black text-white font-mono">₹{calcPlatformFee}</span>
                         </div>
                         <input 
                           type="range"
                           min="5"
                           max="10"
                           step="1"
                           value={calcPlatformFee}
                           onChange={e => { setCalcPlatformFee(parseInt(e.target.value)); playSorenChime([440], 0.05, 'sine'); }}
                           className="w-full accent-[#FFD000] h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                         />
                         <div className="p-3 bg-[#18181b] border border-white/5 rounded-2xl flex items-center justify-between text-[11px] text-white/50">
                            <span>Sourced platform base fee dynamically adjusts ledger margin (₹5 - ₹10)</span>
                            <span className="font-mono text-[#FFD000] font-black">Standard: ₹7</span>
                         </div>
                      </div>

                      {/* Environmental Modifier triggers */}
                      <div>
                         <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-3">Environmental modifiers overrides</label>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              onClick={() => { setIsHeavyTraffic(!isHeavyTraffic); playSorenChime([523], 0.1, 'sawtooth'); }}
                              className={`p-5 rounded-3xl border text-left flex items-center justify-between transition-all ${isHeavyTraffic ? 'bg-red-500/10 border-red-500/40 text-white' : 'bg-transparent border-white/5 text-white/50'}`}
                            >
                               <div className="flex items-center gap-3">
                                  <Zap className={`w-5 h-5 ${isHeavyTraffic ? 'text-red-400' : 'text-white/30'}`} />
                                  <div>
                                     <span className="block text-xs font-black uppercase tracking-wider">Heavy Traffic Surge</span>
                                     <span className="text-[10px] text-white/40 block mt-0.5">+15% Peak hour surge</span>
                                  </div>
                               </div>
                               <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isHeavyTraffic ? 'border-red-400 bg-red-500' : 'border-white/20'}`}>
                                  {isHeavyTraffic && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                                </div>
                            </button>

                            <button
                              onClick={() => { setIsRainyWeather(!isRainyWeather); playSorenChime([659], 0.1, 'sawtooth'); }}
                              className={`p-5 rounded-3xl border text-left flex items-center justify-between transition-all ${isRainyWeather ? 'bg-blue-500/10 border-blue-500/40 text-white' : 'bg-transparent border-white/5 text-white/50'}`}
                            >
                               <div className="flex items-center gap-3">
                                  <CloudRain className={`w-5 h-5 ${isRainyWeather ? 'text-blue-400' : 'text-white/30'}`} />
                                  <div>
                                     <span className="block text-xs font-black uppercase tracking-wider">Monsoon Weather Surge</span>
                                     <span className="text-[10px] text-white/40 block mt-0.5">+10% Rainfall safeguard</span>
                                  </div>
                               </div>
                               <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isRainyWeather ? 'border-blue-400 bg-blue-500' : 'border-white/20'}`}>
                                  {isRainyWeather && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                               </div>
                            </button>
                         </div>
                      </div>

                   </div>
                </div>

                {/* dynamic constraints metrics details */}
                <div className="bg-[#121212] border border-white/5 rounded-[40px] p-6 text-[12px] text-white/60 space-y-4 text-left">
                   <h4 className="font-extrabold text-[#FFD000] uppercase text-[10px] tracking-widest">Dynamic pricing guidelines schema</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                         <span className="block text-[#FFD000] font-black text-xs mb-1">Base Threshold Limit (0 to 3 KM)</span>
                         <p className="text-white/55">Base fare remains locked solid at ₹20. Ensure local drivers earn base cost on short corridor dispatch calls.</p>
                      </div>
                      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                         <span className="block text-emerald-400 font-black text-xs mb-1">Statewide Volume Milestones</span>
                         <p className="text-white/55">Automatic loyalty markdown above 50KM (₹40 OFF) and 80KM (₹80 OFF). Connect suburbs directly to Patna Central hubs.</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Dynamic calculation receipt & split layout */}
             <div className="space-y-6">
                
                {/* Simulated payment invoice node */}
                <div className="bg-gradient-to-br from-[#121212] to-[#18181a] border border-[#FFD000]/15 rounded-[40px] p-8 shadow-2xl relative overflow-hidden text-left">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD000]/5 rounded-full blur-[40px] pointer-events-none" />
                   
                   <span className="text-[#FFD000] text-[8px] font-black uppercase tracking-[0.2em] block mb-1 font-mono">Micro-Ledger breakdown record</span>
                   <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Active Settle Invoice</h3>

                   <div className="space-y-4 text-xs">
                      <div className="flex justify-between items-center text-white/50">
                         <span>Base Standard Minimum (0-3 KM)</span>
                         <span className="font-bold text-white font-mono">₹20.00</span>
                      </div>

                      {baseBreakdown.distanceOverBase > 0 && (
                         <div className="flex justify-between items-center text-white/50">
                            <span>Mileage Run-times ({baseBreakdown.distanceOverBase.toFixed(1)} KM @ ₹8/KM)</span>
                            <span className="font-bold text-white font-mono">₹{baseBreakdown.distanceFareCharge.toFixed(2)}</span>
                         </div>
                      )}

                      {baseBreakdown.surges > 0 && (
                         <div className="flex justify-between items-center text-red-400 font-bold">
                            <span>Sourced environmental Surges</span>
                            <span className="font-mono">₹{baseBreakdown.surges.toFixed(2)}</span>
                         </div>
                      )}

                      {adminPeakSurge > 1.0 && (
                         <div className="flex justify-between items-center text-[#FFD000] font-bold bg-[#FFD000]/5 px-2 py-1 rounded">
                            <span>Admin Peak hour manual override ({adminPeakSurge}x)</span>
                            <span className="font-mono">+{Math.round(computedSandboxCustomerFare - baseBreakdown.finalCustomerFare)}</span>
                         </div>
                      )}

                      <div className="flex justify-between items-center text-white/50">
                         <span>Aggregator Standard Platform Fee</span>
                         <span className="font-bold text-white font-mono">₹{baseBreakdown.platformFee.toFixed(2)}</span>
                      </div>

                      {baseBreakdown.discountAmount > 0 && (
                         <div className="flex justify-between items-center text-emerald-400 font-bold bg-emerald-500/5 px-2 py-1 rounded">
                            <span className="flex items-center gap-1">Tier-Volume markdown deduct</span>
                            <span className="font-mono">-₹{baseBreakdown.discountAmount.toFixed(2)}</span>
                         </div>
                      )}

                      <div className="border-t border-dashed border-white/10 pt-4 mt-4 space-y-4">
                         
                         {/* Grand customer total */}
                         <div className="flex justify-between items-baseline">
                            <span className="text-[10px] text-white/60 font-black uppercase tracking-wider">Settled Cost:</span>
                            <span className="text-4xl font-extrabold text-[#FFD000] tracking-tighter sm:text-5xl font-mono">₹{computedSandboxCustomerFare}</span>
                         </div>

                         {/* Splits breakdown charts */}
                         <div className="space-y-3 pt-3 bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center text-xs">
                               <span className="text-emerald-400 font-semibold">🏍️ Captain Payout (82%):</span>
                               <span className="font-black text-emerald-400 font-mono">₹{computedSandboxCaptainEarnings}</span>
                            </div>
                            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                               <div className="bg-emerald-400 h-full" style={{ width: `${(computedSandboxCaptainEarnings / computedSandboxCustomerFare) * 100}%` }}></div>
                            </div>

                            <div className="flex justify-between items-center text-xs pt-1.5">
                               <span className="text-[#FFD000] font-semibold">🏢 Aggregator Net Yield:</span>
                               <span className="font-black text-[#FFD000] font-mono">₹{computedSandboxCompanyProfit}</span>
                            </div>
                            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                               <div className="bg-[#FFD000] h-full" style={{ width: `${(computedSandboxCompanyProfit / computedSandboxCustomerFare) * 100}%` }}></div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Quick Actions buttons */}
                   <div className="mt-8 space-y-3">
                      <Link 
                        to={`/book`}
                        onClick={() => playSorenChime([880, 1046], 0.2, 'sawtooth')}
                        className="block w-full py-4 bg-gradient-to-r from-[#FFD000] to-[#F5B700] text-black font-black text-xs uppercase tracking-widest text-center rounded-2xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all"
                      >
                         Configure Dispatch Ride
                      </Link>
                      
                      <button 
                        type="button"
                        onClick={() => { setActiveTab('eta'); triggerHailingSimulation(); }}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-extrabold text-[9px] uppercase tracking-widest rounded-2xl border border-white/5 transition-colors flex items-center justify-center gap-2"
                      >
                         <Play className="w-3.5 h-3.5 text-[#FFD000]" /> Simulated Tracking
                      </button>
                   </div>
                </div>

                {/* Discount matrices cards representation */}
                <div className="bg-[#121212] border border-white/5 rounded-[40px] p-6 text-left">
                   <span className="text-white/40 text-[8px] font-black uppercase tracking-widest block mb-4">Volume markdown scale matrix</span>
                   <div className="space-y-2 text-xs">
                      <div className="flex justify-between pb-1 border-b border-white/5 text-white/50 font-bold text-[10px] uppercase">
                         <span>Distance Track</span>
                         <span>Discount Deduct</span>
                      </div>
                      <div className="flex justify-between text-white/40">
                         <span>0 to 10 KM Shorter Link</span>
                         <span className="font-mono">₹0 Flat</span>
                      </div>
                      <div className="flex justify-between text-white/80">
                         <span>10 to 25 KM Suburbs Link</span>
                         <span className="font-mono text-emerald-400 font-bold">₹10 OFF</span>
                      </div>
                      <div className="flex justify-between text-white/80">
                         <span>25 to 50 KM Intercity Link</span>
                         <span className="font-mono text-emerald-400 font-bold">₹20 OFF</span>
                      </div>
                      <div className="flex justify-between text-[#FFD000] font-bold">
                         <span>50 to 80 KM District Link</span>
                         <span className="font-mono text-emerald-400">₹40 OFF</span>
                      </div>
                      <div className="flex justify-between text-amber-400 font-bold">
                         <span>80 to 100 KM State Super Run</span>
                         <span className="font-mono text-emerald-400 font-bold">₹80 OFF</span>
                      </div>
                   </div>
                </div>

             </div>
          </div>
        )}

        {/* Tab 3: Mock Live ETA Simulation */}
        {activeTab === 'eta' && (
          <div className="space-y-6">
             <div className="bg-[#121212] border border-white/5 rounded-[40px] p-8 shadow-xl">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/5 text-left">
                   <div className="space-y-1">
                      <h3 className="text-xl font-extrabold text-white">Live Tracking & Approaches Telemetry</h3>
                      <p className="text-white/40 text-xs">Simulate dynamic dispatch feedback loop on high latency cellular channels</p>
                   </div>

                   <button 
                     onClick={triggerHailingSimulation}
                     className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-transform ${isSimulating ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#FFD000] text-black hover:scale-105'}`}
                   >
                      {isSimulating ? (
                        <>
                           <Pause className="w-4 h-4 fill-current animate-spin" /> Pause Dispatch
                        </>
                      ) : (
                        <>
                           <Play className="w-4 h-4 fill-current" /> Initialize Approach Simulation
                        </>
                      )}
                   </button>
                </div>

                {/* Map Simulator */}
                <div className="relative w-full h-[340px] rounded-[36px] overflow-hidden border border-white/10 bg-[#0B0B0C] mb-8">
                   <div className="absolute inset-x-0 top-1/4 h-[1px] bg-white/[0.03] border-dashed" />
                   <div className="absolute inset-x-0 top-2/3 h-[1px] bg-white/[0.03]" />
                   <div className="absolute inset-y-0 left-1/3 w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent border-dashed" />
                   <div className="absolute inset-y-0 left-2/3 w-[1px] bg-[#FFD000]/5" />

                   {/* Starting pin */}
                   <div className="absolute bottom-[20%] left-[15%] text-center">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center animate-pulse relative">
                         <div className="w-3 h-3 bg-amber-500 rounded-full" />
                      </div>
                      <span className="text-[8px] bg-black/80 border border-white/5 px-2 py-0.5 rounded font-black text-white mt-1 block">Samastipur HQ</span>
                   </div>

                   {/* Ending pin */}
                   <div className="absolute top-[30%] right-[25%] text-center">
                      <div className="w-8 h-8 rounded-full bg-[#FFD000]/10 border border-[#FFD000]/40 flex items-center justify-center relative">
                         <div className="w-3 h-3 bg-[#FFD000] rounded-full shadow-[0_0_10px_#FFD000]" />
                      </div>
                      <span className="text-[8px] bg-black/80 border border-[#FFD000]/30 px-2 py-0.5 rounded font-black text-white mt-1 block">Patna Junction</span>
                   </div>

                   {/* Simulated Rider Marker moving on the line */}
                   {isSimulating && (
                      <div 
                        className="absolute h-10 w-10 z-10 transition-all duration-1000 ease-out"
                        style={{
                           left: `${simProgressPercent - 5}%`,
                           top: `${72 - (simProgressPercent * 0.45)}%`
                        }}
                      >
                         <div className="w-11 h-11 bg-[#FFD000] border-2 border-black rounded-full flex items-center justify-center shadow-2xl transform rotate-[-125deg] duration-300">
                            <Navigation className="w-5 h-5 text-black transform rotate-[130deg]" />
                         </div>
                         <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black border border-[#FFD000]/35 text-[#FFD000] text-[8px] font-black rounded-md px-2 py-0.5 whitespace-nowrap shadow-xl">
                            {simSteps > 0 ? `Captain (${simSteps} min ETA)` : 'ARRIVED ✅'}
                         </div>
                      </div>
                   )}

                   {/* Simulated route glow line drawing */}
                   <div className="absolute left-[18%] bottom-[24%] right-[28%] top-[34%] pointer-events-none overflow-visible">
                      <svg className="w-full h-full overflow-visible" style={{ strokeDasharray: "4 4" }}>
                         <line x1="0%" y1="100%" x2="100%" y2="0%" stroke="#333" strokeWidth="3.5" />
                         {isSimulating && (
                            <line 
                              x1="0%" y1="100%" 
                              x2={`${simProgressPercent}%`} y2={`${100 - simProgressPercent}%`} 
                              stroke="#FFD000" 
                              strokeWidth="5" 
                              className="transition-all duration-1000"
                              style={{ filter: "drop-shadow(0px 0px 6px #FFD000)" }}
                            />
                         )}
                      </svg>
                   </div>

                   {/* Telemetry log block */}
                   <div className="absolute bottom-4 right-4 bg-black/90 backdrop-blur-md border border-white/10 p-5 rounded-2xl max-w-xs text-left">
                      <span className="text-[#FFD000] text-[7px] font-black uppercase tracking-widest block font-mono">Approaching telemetry data</span>
                      <p className="text-white font-extrabold text-xs mt-1 truncate">{simStepText}</p>
                      <div className="w-40 bg-neutral-800 h-1 rounded-full overflow-hidden mt-3.5">
                         <div className="bg-[#FFD000] h-full duration-1000 transition-all animate-pulse" style={{ width: `${simProgressPercent}%` }}></div>
                      </div>
                   </div>

                   {/* Signal indicators */}
                   <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/80 border border-red-500/30 text-white text-[9px] font-black uppercase tracking-widest font-mono">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                      <span>Route traffic flow: Medium Surge Indicator active</span>
                   </div>
                </div>

                {/* High quality stepping indicators */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                   {[
                     { step: 4, desc: 'GPS Pin matched • Assigning captain', duration: '4 min' },
                     { step: 3, desc: 'Boring Road Chowk crossing • 42 km/h', duration: '3 min' },
                     { step: 2, desc: 'Passing local highway boundary line', duration: '2 min' },
                     { step: 1, desc: 'Approaching terminal gateway point', duration: '1 min' }
                   ].map((item) => (
                      <div 
                        key={item.step}
                        className={`p-5 rounded-2xl border transition-all ${simSteps === item.step ? 'bg-[#FFD000]/10 border-[#FFD000]/30 text-white scale-[1.01]' : 'bg-[#1A1A1D]/40 border-white/[0.03] text-white/40'}`}
                      >
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] uppercase font-black tracking-widest block">Phase 0{5 - item.step}</span>
                            <span className={`text-xs font-mono font-bold ${simSteps === item.step ? 'text-[#FFD000]' : 'text-white/30'}`}>{item.duration}</span>
                         </div>
                         <p className="text-xs font-bold font-sans mt-2">{item.desc}</p>
                      </div>
                   ))}
                </div>

             </div>
          </div>
        )}

        {/* Tab 4: AI Voice Booking Simulator */}
        {activeTab === 'voice' && (
          <div className="space-y-6 text-left">
             <div className="bg-[#121212] border border-white/5 rounded-[40px] p-8 shadow-xl">
                
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                   <div className="w-10 h-10 rounded-xl bg-[#FFD000]/10 flex items-center justify-center animate-pulse">
                      <Mic className="w-5 h-5 text-[#FFD000]" />
                   </div>
                   <div>
                      <h3 className="text-xl font-extrabold text-white">AI Voice dispatch console (Hindi-first NLP)</h3>
                      <p className="text-white/40 text-xs">Acoustic chimes, speech recognition parse engine, and automated fare allocation</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   
                   {/* Left Side: Waveform and microphone triggers */}
                   <div className="bg-black/40 border border-white/5 p-6 rounded-[30px] flex flex-col justify-between items-center text-center">
                      <div className="w-full">
                         <span className="text-white/40 text-[8px] font-black uppercase tracking-widest block mb-4">Acoustic wave visualization</span>
                         
                         {/* Visual pulses */}
                         <div className="h-28 flex items-end justify-center gap-1.5 mb-6">
                            {voiceWaveform.map((height, idx) => (
                              <div 
                                key={idx} 
                                className={`w-1.5 rounded-full transition-all duration-150 ${isRecording ? 'bg-[#FFD000] shadow-[0_0_8px_#FFD000]' : 'bg-neutral-800'}`}
                                style={{ height: `${isRecording ? height : 15}%`, minHeight: '6px' }}
                              />
                            ))}
                         </div>
                      </div>

                      <div className="space-y-4 w-full">
                         <button
                           onClick={() => executeHindiVoiceSim("Bhaiya, Samastipur HQ se Tajpur Road station chalna hai.")}
                           disabled={isRecording}
                           className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all ${isRecording ? 'border-[#FFD000] bg-[#FFD000]/10 scale-95 shadow-[0_0_20px_rgba(255,208,0,0.15)] animate-pulse' : 'border-white/10 bg-white/5 hover:border-[#FFD000] hover:scale-105'}`}
                         >
                            <Mic className={`w-8 h-8 ${isRecording ? 'text-[#FFD000]' : 'text-white'}`} />
                         </button>
                         <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">
                            {isRecording ? "Processing spoken Hindi..." : "Press card or utterances below"}
                         </p>
                      </div>
                   </div>

                   {/* Center & Right column: Uttance selectors and result */}
                   <div className="md:col-span-2 space-y-6">
                      <div>
                         <label className="block text-white/40 text-[9px] font-black uppercase tracking-widest mb-3">Pre-recorded customer utterances</label>
                         <div className="space-y-2.5">
                            {[
                              { label: "📍 Bhaiya, Samastipur HQ se Tajpur road station jana hai.", type: "bike" },
                              { label: "📦 Darbhanga Junction se parcel Muzaffarpur bypass deliver kardo.", type: "parcel" },
                              { label: "💊 Begusarai Crossing se urgent dawa (medicine) deliver kardo university road.", type: "meds" },
                              { label: "🕵️ Rosera Chowk se verified bank client audit address verification survey report pathana hai.", type: "verification" }
                            ].map((item, idx) => (
                              <button
                                key={idx}
                                onClick={() => executeHindiVoiceSim(item.label)}
                                className="w-full text-left p-4 bg-[#1A1A1D]/80 border border-white/5 hover:border-[#FFD000]/30 rounded-2xl block text-xs font-bold leading-relaxed transition-all text-white flex items-center justify-between group"
                              >
                                 <span className="group-hover:text-[#FFD000] transition-colors">{item.label}</span>
                                 <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0 group-hover:text-[#FFD000] transition-colors ml-3" />
                              </button>
                            ))}
                         </div>
                      </div>

                      {/* Resulting match outputs */}
                      <AnimatePresence mode="wait">
                         {voiceParsingStatus === 'listening' && (
                           <div className="bg-[#1C1810] border border-amber-500/10 p-5 rounded-2xl text-xs flex items-center gap-3">
                              <RefreshCw className="w-4 h-4 text-[#FFD000] animate-spin shrink-0" />
                              <div className="text-left">
                                 <p className="text-white font-bold uppercase text-[9px] tracking-wide text-amber-500">AI Parser resolving nodes...</p>
                                 <p className="text-white/60">Sourcing departure points, converting Hindi keywords, and routing database ledger match.</p>
                              </div>
                           </div>
                         )}

                         {voiceWaveform && voiceParsingStatus === 'completed' && voiceMatchModel && (
                           <div className="bg-[#141C16] border border-emerald-500/20 p-6 rounded-[30px] space-y-4">
                              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                 <div>
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest">NLP Match OK</span>
                                    <p className="text-xs text-white/50 mt-1 uppercase font-bold">Matched: {voiceMatchModel.service}</p>
                                 </div>
                                 <div className="text-right">
                                    <span className="block text-[8px] font-bold text-white/40 uppercase">Resolved Settle Fare</span>
                                    <span className="text-xl font-mono font-black text-emerald-400">₹{voiceMatchModel.fare}</span>
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-xs">
                                 <div>
                                    <span className="text-white/35 block text-[8px] uppercase tracking-widest font-black">Departure Node</span>
                                    <span className="text-white font-black">{voiceMatchModel.route.pickup}</span>
                                 </div>
                                 <div>
                                    <span className="text-white/35 block text-[8px] uppercase tracking-widest font-black">Destination Endpoint</span>
                                    <span className="text-white font-black">{voiceMatchModel.route.drop}</span>
                                 </div>
                                 <div>
                                    <span className="text-white/35 block text-[8px] uppercase tracking-widest font-black">Captain Assigned</span>
                                    <span className="text-white font-bold">{voiceMatchModel.captain}</span>
                                 </div>
                                 <div>
                                    <span className="text-white/35 block text-[8px] uppercase tracking-widest font-black">Estimated Hailing Arrival</span>
                                    <span className="text-[#FFD000] font-mono font-black">{voiceMatchModel.eta} mins ETA</span>
                                 </div>
                              </div>

                              <div className="pt-2">
                                 <Link 
                                   to="/book"
                                   className="block text-center w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.01] active:scale-95 transition-all shadow-lg"
                                 >
                                    Accept Dispatch & Book Now
                                 </Link>
                              </div>
                           </div>
                         )}
                      </AnimatePresence>

                   </div>

                </div>

             </div>
          </div>
        )}

        {/* Tab 5: Dynamic Admin Risk Operations control */}
        {activeTab === 'admin' && (
          <div className="space-y-6 text-left">
             <div className="bg-[#121212] border border-white/5 rounded-[40px] p-8 shadow-xl">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/5">
                   <div className="space-y-1">
                      <h3 className="text-xl font-extrabold text-white font-sans">Statewide administrative telemetry controls</h3>
                      <p className="text-white/40 text-xs">Real-time fraud audit registries, statewide peak hour surge toggles, and coverage metrics</p>
                   </div>

                   <button
                     onClick={() => { setSecurityLockdown(!securityLockdown); playSorenChime([securityLockdown ? 523 : 330], 0.2, 'sawtooth'); }}
                     className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors ${securityLockdown ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'}`}
                   >
                      ⚠️ {securityLockdown ? "Active Security LOCKDOWN" : "Normal ops status check"}
                   </button>
                </div>

                {/* Dashboard Widgets Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                   <div className="p-5 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden">
                      <span className="text-white/40 text-[7px] uppercase font-black block tracking-widest">Active Statewide Captains</span>
                      <p className="text-2xl font-black text-white mt-1">{activeCaptainsTotal}</p>
                      <span className="text-emerald-400 text-[8px] font-extrabold font-mono font-bold block mt-3">● 1,180 Verified Active</span>
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   </div>

                   <div className="p-5 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden">
                      <span className="text-white/40 text-[7px] uppercase font-black block tracking-widest">Active Passenger Hails</span>
                      <p className="text-2xl font-black text-white mt-1">{activePassengerHails}</p>
                      <span className="text-[#FFD000] text-[8px] font-extrabold block mt-3">↑ Peak matching ratio 98.4%</span>
                   </div>

                   <div className="p-5 bg-black/40 border border-white/5 rounded-2xl">
                      <span className="text-white/40 text-[7px] uppercase font-black block tracking-widest">Double Booking Fraud rate</span>
                      <p className="text-2xl font-black text-emerald-400 mt-1">0.02%</p>
                      <span className="text-white/50 text-[8px] block mt-3">Risk safeguards operating</span>
                   </div>

                   <div className="p-5 bg-[#1C1810] border border-amber-500/10 rounded-2xl">
                      <span className="text-[#FFD000] text-[7px] uppercase font-black block tracking-widest font-mono">Platform Peak Surge multiplier</span>
                      <p className="text-2xl font-black text-[#FFD000] font-mono mt-1">{adminPeakSurge}x</p>
                      <span className="text-white/50 text-[8px] block mt-3">Algorithmic fare trigger</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   
                   {/* Left Side: Surge override controller */}
                   <div className="p-6 bg-[#18181b]/30 border border-white/5 rounded-[30px] space-y-6">
                      <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Dynamic aggregate peak slider</h4>
                      <p className="text-white/55 text-xs">Simulate heavy monsoon rain emergencies or severe traffic delays on the Bihar corridors instantly.</p>
                      
                      <div className="space-y-2">
                         <div className="flex justify-between font-mono text-xs text-[#FFD000] font-bold">
                            <span>Peak Multiplier Override</span>
                            <span>{adminPeakSurge}x</span>
                         </div>
                         <input 
                           type="range"
                           min="1.0"
                           max="2.5"
                           step="0.1"
                           value={adminPeakSurge}
                           onChange={e => { setAdminPeakSurge(parseFloat(e.target.value)); playSorenChime([220 + parseFloat(e.target.value)*100], 0.05, 'sine'); }}
                           className="w-full accent-[#FFD000] h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                         />
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                         {[
                           { label: "Clear Clear (1.0x)", v: 1.0 },
                           { label: "Monsoon (1.4x)", v: 1.4 },
                           { label: "Heavy Surge (1.8x)", v: 1.8 }
                         ].map((pres, idx) => (
                           <button
                             key={idx}
                             onClick={() => { setAdminPeakSurge(pres.v); playSorenChime([440, 554], 0.1, 'sine'); }}
                             className={`px-2 py-2 text-[8px] uppercase tracking-widest font-black rounded-lg border transition-all ${adminPeakSurge === pres.v ? 'bg-[#FFD000] text-black border-transparent font-black' : 'bg-transparent text-white/50 border-white/5'}`}
                           >
                              {pres.label}
                           </button>
                         ))}
                      </div>

                      {/* Kirana & Medicine deliveries logistics override logic */}
                      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl text-[11px] leading-relaxed text-white/60">
                         <span className="text-[#FFD000] font-bold uppercase tracking-wider block text-[9px] mb-1">Logistics platform API overrides</span>
                         Monsoon rain surges can trigger automated incentives up to +₹40 flat, ensuring continuous delivery of prescription medical products in Darbhanga bypass and Begusarai crossing points.
                      </div>
                   </div>

                   {/* Right Side: Risk audits logger */}
                   <div className="p-6 bg-[#18181b]/30 border border-white/5 rounded-[30px] space-y-4">
                      <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Automated risk security auditor logs</h4>
                      
                      <div className="space-y-2.5">
                         {fraudAuditLog.map((log) => (
                           <div key={log.id} className="p-3.5 bg-black/60 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 relative">
                                    {log.type === 'threat_defused' && <span className="absolute inset-0 bg-red-400 animate-ping rounded-full" />}
                                 </span>
                                 <span className="font-mono text-white/35 font-bold font-semibold">{log.time}</span>
                                 <span className="font-bold text-white/90">{log.desc}</span>
                              </div>
                              <span className={`text-[8px] font-black uppercase tracking-wider ${log.type === 'threat_defused' ? 'text-red-400' : 'text-emerald-400'}`}>
                                 {log.type === 'threat_defused' ? 'Defused' : 'Audited'}
                              </span>
                           </div>
                         ))}
                      </div>

                      {/* Loan audit mock verification survey card */}
                      <div className="p-4 bg-[#14101a] border border-purple-500/10 rounded-2xl text-xs flex justify-between items-center">
                         <div>
                            <span className="text-purple-400 text-[8px] font-black uppercase tracking-widest block font-mono">NBFC field verify alert</span>
                            <p className="text-white font-bold leading-none mt-1">Tajpur Road address survey audit</p>
                            <span className="text-white/40 text-[10px] block mt-1">Rahi Captain assigned for Aadhaar survey verification</span>
                         </div>
                         <span className="text-purple-400 font-bold font-mono text-xs">+₹400 Net profit</span>
                      </div>
                   </div>

                </div>

             </div>
          </div>
        )}

        {/* Tab 6: Architecture Spec Files (Relational / Document DB model API specification) */}
        {activeTab === 'architecture' && (
          <div className="space-y-6 text-left">
             <div className="bg-[#121212] border border-white/5 rounded-[40px] p-8 shadow-xl">
                
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                   <div className="w-10 h-10 rounded-xl bg-[#FFD000]/10 flex items-center justify-center">
                      <Server className="w-5 h-5 text-[#FFD000]" />
                   </div>
                   <div>
                      <h3 className="text-xl font-extrabold text-white font-sans">Systems Enterprise Architecture specification</h3>
                      <p className="text-white/40 text-xs text-xs">Detailed document schema, REST routes, and offline micro-cache guidelines</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   
                   {/* Left Column: DB Document Schemas */}
                   <div className="space-y-4">
                      <h4 className="text-white font-black text-xs uppercase tracking-wider flex items-center gap-2">
                         <Database className="w-4 h-4 text-[#FFD000]" /> Firestore & relational document scheme
                      </h4>

                      {/* User module */}
                      <div className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-3">
                         <span className="text-white/40 text-[8px] font-black uppercase tracking-widest block font-mono">1. UserSession collection Schema</span>
                         <pre className="text-[10px] text-white/70 overflow-x-auto font-mono bg-black/60 p-4 rounded-xl leading-relaxed no-scrollbar max-h-[160px]">
{`{
  "_id": "usr_99831a",
  "name": "Vivek Raj",
  "phone_hash": "+918252XXXXXX",
  "role": "customer",
  "kyc_verification_status": "verified",
  "active_wallet_credits": 310,
  "subscription_tier": "vip_monthly_999",
  "date_created": "2026-05-27T08:41:41Z"
}`}
                         </pre>
                      </div>

                      {/* RideDispatch Schema */}
                      <div className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-3">
                         <span className="text-white/40 text-[8px] font-black uppercase tracking-widest block font-mono">2. RideDispatch database schema</span>
                         <pre className="text-[10px] text-white/70 overflow-x-auto font-mono bg-black/60 p-4 rounded-xl leading-relaxed no-scrollbar max-h-[220px]">
{`{
  "_id": "disp_88321a",
  "passenger_id": "usr_99831a",
  "captain_id": "cap_2231ff",
  "route_mapped_id": "001",
  "geospatial_pickup": { "lat": 25.8500, "lng": 85.7800 },
  "geospatial_drop": { "lat": 25.8800, "lng": 85.6100 },
  "dynamic_fare_cost": 130,
  "payout_ledger_payout_captain": 107,
  "transaction_platform_fee": 7,
  "audit_verified": true,
  "monsoon_rain_override": false
}`}
                         </pre>
                      </div>
                   </div>

                   {/* Right Column: API endpoint index */}
                   <div className="space-y-4">
                      <h4 className="text-white font-black text-xs uppercase tracking-wider flex items-center gap-2">
                         <Code2 className="w-4 h-4 text-emerald-400" /> Production API endpoint specification
                      </h4>

                      <div className="space-y-3">
                         {[
                           { met: "POST", path: "/api/v1/auth/mobile_otp", desc: "Initiate zero-login OTP chimes utilizing local SMS integrations." },
                           { met: "GET", path: "/api/v1/pricing/estimate_fare", desc: "Settle dynamic fare ledger calculations based on distance triggers and monsoon surges." },
                           { met: "POST", path: "/api/v1/rides/dispatch_request", desc: "Push geospatial broadcast to nearest subscription active captains within 3KM cluster." },
                           { met: "POST", path: "/api/v1/logistics/meds_delivery", desc: "Launch urgent pharmaceutical courier with live approach path." },
                           { met: "POST", path: "/api/v1/verification/loan_survey", desc: "Commit Aadhaar verified geo-tagged photo audits for banking credit surveys." }
                         ].map((ep, idx) => (
                           <div key={idx} className="p-5 bg-[#18181b]/40 border border-white/5 rounded-2xl text-xs space-y-1.5 hover:border-emerald-500/25 transition-colors">
                              <div className="flex items-center gap-2">
                                 <span className={`text-[8px] font-black px-2 py-0.5 rounded font-mono ${ep.met === 'POST' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-blue-500/10 text-blue-400 border border-blue-500/25'}`}>{ep.met}</span>
                                 <span className="font-mono text-white/90 font-black font-semibold text-xs">{ep.path}</span>
                              </div>
                              <p className="text-white/50 text-[11px] font-medium leading-relaxed">{ep.desc}</p>
                           </div>
                         ))}
                      </div>
                   </div>

                </div>

             </div>
          </div>
        )}

        {/* Tab 7: Premium Redesigned Investor Pitch deck */}
        {activeTab === 'investor' && (
          <div className="space-y-6 text-left">
             
             {/* Dynamic Pitch Slideshow Container */}
             <div className="bg-[#121212] border border-white/5 rounded-[40px] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-[#FFD000]/5 rounded-full blur-[50px] pointer-events-none" />
                
                {/* Upper Slide Header */}
                <div className="flex justify-between items-center pb-6 border-b border-white/5 mb-8">
                   <div>
                      <span className="text-[#FFD000] text-[8px] font-black uppercase tracking-[0.2em] block font-mono">Investor series-A presentation slide</span>
                      <h3 className="text-xl font-extrabold text-white mt-1 uppercase">Pitch Slideshow Deck</h3>
                   </div>
                   <div className="flex gap-1.5 shrink-0">
                      {PITCH_DECK_SLIDES.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => { setActiveSlide(i); playSorenChime([440], 0.05); }}
                          className={`w-7 h-2 rounded transition-all ${activeSlide === i ? 'bg-[#FFD000] w-10' : 'bg-neutral-800'}`}
                        />
                      ))}
                   </div>
                </div>

                {/* Slides content render with AnimatePresence */}
                <div className="min-h-[220px] flex flex-col justify-between">
                   <div className="space-y-4">
                      
                      {/* Title & Icon Header */}
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-white/[0.02] border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                            {PITCH_DECK_SLIDES[activeSlide].icon}
                         </div>
                         <div>
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#FFD000]/10 to-amber-500/10 border border-[#FFD000]/20 text-[#FFD000] text-[9.5px] font-black uppercase tracking-widest rounded-lg leading-none font-mono">
                               {PITCH_DECK_SLIDES[activeSlide].highlight}
                            </span>
                            <h4 className="text-xl sm:text-2xl font-black text-white mt-2 font-sans tracking-tight leading-none uppercase">{PITCH_DECK_SLIDES[activeSlide].title}</h4>
                         </div>
                      </div>

                      <p className="text-white/80 font-bold text-xs sm:text-sm">{PITCH_DECK_SLIDES[activeSlide].tagline}</p>
                      
                      <p className="text-white/50 text-xs sm:text-xs leading-relaxed max-w-3xl font-medium">
                         {PITCH_DECK_SLIDES[activeSlide].desc}
                      </p>

                   </div>

                   {/* Next Sliders bottom controls */}
                   <div className="flex justify-between items-center pt-8 mt-8 border-t border-white/5">
                      <button
                        onClick={() => { setActiveSlide(prev => Math.max(0, prev - 1)); playSorenChime([330], 0.08); }}
                        disabled={activeSlide === 0}
                        className="px-4 py-2.5 bg-white/[0.02] hover:bg-white/5 border border-white/5 disabled:opacity-20 text-white text-[9.5px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                         Previous Slide
                      </button>

                      <span className="text-[10px] text-white/30 uppercase font-mono font-bold font-semibold">Slide {activeSlide + 1} of {PITCH_DECK_SLIDES.length}</span>

                      {activeSlide === PITCH_DECK_SLIDES.length - 1 ? (
                        <button
                          onClick={() => { setActiveSlide(0); playSorenChime([523, 659, 783], 0.1, 'sawtooth'); }}
                          className="px-4 py-2.5 bg-[#FFD000] text-black font-black text-[9.5px] uppercase tracking-widest rounded-xl transition-all hover:scale-105"
                        >
                           Re-watch Deck
                        </button>
                      ) : (
                        <button
                          onClick={() => { setActiveSlide(prev => Math.min(PITCH_DECK_SLIDES.length - 1, prev + 1)); playSorenChime([523], 0.08); }}
                          className="px-4 py-2.5 bg-[#FFD000] text-black font-black text-[9.5px] uppercase tracking-widest rounded-xl transition-all hover:scale-105"
                        >
                           Next Slide
                        </button>
                      )}
                   </div>
                </div>

             </div>

             {/* Dynamic Financial spreadsheet widget scaling model */}
             <div className="bg-[#121212] border border-white/5 rounded-[40px] p-8 shadow-xl">
                
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                   </div>
                   <div>
                      <h3 className="text-xl font-extrabold text-white">Interactive Dynamic Pro-forma model</h3>
                      <p className="text-white/40 text-xs">Model monthly cash flow scaling based on active district fleet sizes and pass subscriptions</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   
                   {/* Growth parameters sliders */}
                   <div className="lg:col-span-2 space-y-6">
                      <h4 className="text-white/60 font-extrabold text-xs uppercase tracking-wider">Growth scalability parameters</h4>
                      
                      {/* Commuter Fleet CommutesCompleted */}
                      <div className="space-y-3 font-medium">
                         <div className="flex justify-between items-center text-xs">
                            <span className="text-white/50">Daily Ecosystem Rides Completed Across Clusters</span>
                            <span className="text-lg font-black font-mono text-[#FFD000]">{dailyRidesTarget.toLocaleString()} / day</span>
                         </div>
                         <input 
                           type="range"
                           min="1000"
                           max="60000"
                           step="1000"
                           value={dailyRidesTarget}
                           onChange={e => { setDailyRidesTarget(parseInt(e.target.value)); playSorenChime([330], 0.04); }}
                           className="w-full accent-[#FFD000] h-1.5 bg-neutral-800 rounded-lg cursor-pointer animate-pulse"
                         />
                         <p className="text-[10px] text-white/30">Representative of 40 local Bihar hubs serving 120,000 digital commuting residents.</p>
                      </div>

                      {/* B2B Logistics contracts */}
                      <div className="space-y-3 font-medium">
                         <div className="flex justify-between items-center text-xs">
                            <span className="text-white/50">Monthly B2B Logistics & Merchant Delivery Contracts Volume</span>
                            <span className="text-lg font-black font-mono text-[#FFD000]">₹{b2bLogisticsIncome.toLocaleString()} / mo</span>
                         </div>
                         <input 
                           type="range"
                           min="100000"
                           max="3000000"
                           step="50000"
                           value={b2bLogisticsIncome}
                           onChange={e => { setB2bLogisticsIncome(parseInt(e.target.value)); playSorenChime([440], 0.04); }}
                           className="w-full accent-[#FFD000] h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                         />
                      </div>

                      {/* Active subscription coupons */}
                      <div className="space-y-3 font-medium">
                         <div className="flex justify-between items-center text-xs">
                            <span className="text-white/50">Monthly Active Captain Passes Sold (₹199 flat per pass)</span>
                            <span className="text-lg font-black font-mono text-[#FFD000]">{subscriptionCoupons.toLocaleString()} passes</span>
                         </div>
                         <input 
                           type="range"
                           min="500"
                           max="20000"
                           step="250"
                           value={subscriptionCoupons}
                           onChange={e => { setSubscriptionCoupons(parseInt(e.target.value)); playSorenChime([523], 0.04); }}
                           className="w-full accent-[#FFD000] h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                         />
                      </div>

                      {/* Banking Field verification survey loops */}
                      <div className="space-y-3 font-medium">
                         <div className="flex justify-between items-center text-xs">
                            <span className="text-white/50">Monthly NBFC verified Address and photo audit audits verified (₹400/audit)</span>
                            <span className="text-lg font-black font-mono text-[#FFD000]">₹{loanAuditRevenue.toLocaleString()} / mo</span>
                         </div>
                         <input 
                           type="range"
                           min="50000"
                           max="2000000"
                           step="50000"
                           value={loanAuditRevenue}
                           onChange={e => { setLoanAuditRevenue(parseInt(e.target.value)); playSorenChime([659], 0.04); }}
                           className="w-full accent-[#FFD000] h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                         />
                      </div>
                   </div>

                   {/* Pro-forma P&L Outputs Sheet */}
                   <div className="bg-[#1A1A1D]/60 border border-white/5 rounded-[30px] p-6 space-y-6 hover:border-[#FFD000]/20 transition-all duration-300 text-left">
                      <div>
                         <span className="text-white/40 text-[8px] font-black uppercase tracking-widest block mb-1">Financial growth projections</span>
                         <h4 className="text-white text-md font-extrabold uppercase">Ecosystem Revenue Sheets</h4>
                      </div>

                      <div className="space-y-3.5 text-xs font-mono">
                         <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-white/50 font-sans">Platform charges & fees yield:</span>
                            <span className="font-extrabold text-white">₹{Math.round(monthlyAggregatorCharges).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-white/50 font-sans">Captain pass subscriptions:</span>
                            <span className="font-extrabold text-white">₹{Math.round(activeSubsMonthly).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-white/50 font-sans">B2B Logistics Pipelines:</span>
                            <span className="font-extrabold text-white">₹{b2bLogisticsIncome.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-white/50 font-sans">Loan agent verified surveys:</span>
                            <span className="font-extrabold text-white">₹{loanAuditRevenue.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between pb-1">
                            <span className="text-white/50 font-sans">Hyperlocal Banner Ads:</span>
                            <span className="font-extrabold text-white">₹{adImpressionRevenue.toLocaleString()}</span>
                         </div>
                      </div>

                      <div className="pt-4 border-t border-dashed border-white/10 text-center bg-black/40 p-4 rounded-2xl">
                         <span className="text-white/30 text-[8px] font-black uppercase tracking-widest block mb-1">Annual Scaling ARR Target Run Rate</span>
                         <p className="text-3xl font-black text-[#FFD000] tracking-tighter">₹{(annualizedEcoyieldRunrate / 100000).toFixed(1)} Lakhs</p>
                         <span className="text-[9px] text-[#FFD000] font-bold uppercase mt-1.5 block">Bihar statewide franchise margin OK</span>
                      </div>

                      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                         <p className="text-[10px] text-white/50 italic leading-relaxed">
                            "Decoupling vehicle bookings from exorbitant commissions unlocks dense statewide transactions. Aggregator margins remain locked flat while we capture high B2B and financial agency dividends."
                         </p>
                      </div>
                   </div>

                </div>

             </div>
          </div>
        )}

        {/* Tab 8: Developer Exporter UI */}
        {activeTab === 'code' && (
          <div className="space-y-6">
             <div className="bg-[#121212] border border-white/5 rounded-[40px] p-8 shadow-xl text-left">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-white/5">
                   <div className="space-y-1">
                      <h3 className="text-xl font-extrabold text-white">Cross-platform UI code exporter</h3>
                      <p className="text-white/40 text-xs">Directly deploy investor-quality pricing components into your production repositories</p>
                   </div>

                   <div className="flex gap-2 p-1.5 bg-[#1A1A1A] rounded-xl border border-white/5 shrink-0 shadow-inner">
                      <button 
                        onClick={() => { setExportFramework('react'); playSorenChime([440]); }}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${exportFramework === 'react' ? 'bg-[#FFD000] text-black font-black' : 'text-white/40 hover:text-white'}`}
                      >
                         <Layers className="w-3.5 h-3.5" />
                         React Component
                      </button>
                      <button 
                        onClick={() => { setExportFramework('flutter'); playSorenChime([523]); }}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${exportFramework === 'flutter' ? 'bg-[#FFD000] text-black font-black' : 'text-white/40 hover:text-white'}`}
                      >
                         <Smartphone className="w-3.5 h-3.5" />
                         Flutter Widget Code
                      </button>
                   </div>
                </div>

                {/* Code block with copy trigger */}
                <div className="relative rounded-2xl border border-white/10 bg-[#070708] overflow-hidden">
                   <div className="flex justify-between items-center p-4 bg-[#141416] border-b border-white/5">
                      <span className="text-[10px] text-white/40 font-mono font-bold">
                         {exportFramework === 'react' ? 'RahiRouteCard.tsx (TypeScript React layout Component)' : 'rahi_route_card.dart (Flutter SDK Dart StatelessWidget)'}
                      </span>
                      <button
                        onClick={() => handleCopyCode(exportFramework === 'react' ? reactCodeSnippet : flutterCodeSnippet)}
                        className="px-4 py-2 bg-[#FFD000]/10 text-[#FFD000] border border-[#FFD000]/25 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 transition-colors hover:bg-[#FFD000]/20"
                      >
                         {isCopied ? (
                           <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                           </>
                         ) : (
                           <>
                              <Copy className="w-3.5 h-3.5" /> Copy Code
                           </>
                         )}
                      </button>
                   </div>

                   <pre className="p-6 text-xs text-white/70 overflow-x-auto font-mono max-h-[480px] leading-relaxed no-scrollbar scrollbar-thin">
                      <code>{exportFramework === 'react' ? reactCodeSnippet : flutterCodeSnippet}</code>
                   </pre>
                </div>

                {/* Benefits panel card */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                      <h4 className="text-[#FFD000] text-[9px] font-black uppercase tracking-wider mb-2">Pristine typography pairings</h4>
                      <p className="text-white/60 text-xs">Styles built in robust classes conforming completely to dark luxurious micro-guidelines.</p>
                   </div>
                   <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                      <h4 className="text-[#FFD000] text-[9px] font-black uppercase tracking-wider mb-2">High developer efficiency</h4>
                      <p className="text-white/60 text-xs">Direct drop-in for Flutter developers using stateless widgets compatible with clean structures.</p>
                   </div>
                   <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                      <h4 className="text-[#FFD000] text-[9px] font-black uppercase tracking-wider mb-2">Decoupled Architecture</h4>
                      <p className="text-white/60 text-xs">Pristine separations of data metrics allowing seamless JSON updates from server telemetry hubs.</p>
                   </div>
                </div>

             </div>
          </div>
        )}

      </div>
      
      {currentUser && currentUser.role === 'customer' && <BottomNav />}
    </div>
  );
}
