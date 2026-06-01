import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudSun, CloudRain, Sun, Cloud, CloudLightning, Wind, Droplets, ThermometerSun, AlertTriangle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useNotifications } from '../lib/notifications';

interface WeatherData {
  currentTemp: number;
  condition: string;
  code: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  rainProb: number;
  sunrise: string;
  sunset: string;
  city: string;
  isDay: boolean;
  hourly: { time: string, temp: number, code: number }[];
}

const getWeatherDetails = (code: number) => {
  // WMO Weather interpretation codes
  if (code === 0) return { label: 'Clear Sky', icon: <Sun className="w-6 h-6 text-[#FFC107]" />, insight: "Perfect clear weather for a bike ride today!" };
  if (code === 1 || code === 2 || code === 3) return { label: 'Cloudy', icon: <CloudSun className="w-6 h-6 text-blue-300" />, insight: "A bit cloudy, but great for a comfortable ride." };
  if (code >= 45 && code <= 48) return { label: 'Foggy', icon: <Cloud className="w-6 h-6 text-gray-400" />, insight: "Fog detected. Ride carefully, visibility might be low." };
  if (code >= 51 && code <= 67) return { label: 'Rainy', icon: <CloudRain className="w-6 h-6 text-blue-400" />, insight: "Light rain expected. Surge in ride demand likely." };
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: <Cloud className="w-6 h-6 text-white" />, insight: "Snowy weather. Stay safe out there!" };
  if (code >= 80 && code <= 82) return { label: 'Heavy Rain', icon: <CloudRain className="w-6 h-6 text-blue-500" />, insight: "Heavy rain. Book rides early to avoid high wait times." };
  if (code >= 95) return { label: 'Thunderstorm', icon: <CloudLightning className="w-6 h-6 text-purple-400" />, insight: "Thunderstorm warning! Safety first, consider delaying travel." };
  
  return { label: 'Unknown', icon: <CloudSun className="w-6 h-6 text-white" />, insight: "Weather is looking decent." };
};

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const addNotification = useNotifications((s) => s.addNotification);

  const fetchWeather = async (lat: number, lon: number, cityName: string) => {
    try {
      setLoading(true);
      setError(false);
      // Open-Meteo free API
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,weather_code&daily=sunrise,sunset,precipitation_probability_max&timezone=auto`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      
      const currentHourIdx = new Date().getHours();
      const hourlyData = [];
      for (let i = currentHourIdx; i < currentHourIdx + 12; i++) {
         if (data.hourly.time[i]) {
            const timeStr = new Date(data.hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            hourlyData.push({
               time: timeStr.split(' ')[0], // just hour e.g., "10" or "02" based on locale format, or simple trick
               ampm: timeStr.split(' ')[1] || '',
               temp: Math.round(data.hourly.temperature_2m[i]),
               code: data.hourly.weather_code[i]
            });
         }
      }

      const newWeather: WeatherData = {
        currentTemp: Math.round(data.current.temperature_2m),
        condition: getWeatherDetails(data.current.weather_code).label,
        code: data.current.weather_code,
        humidity: Math.round(data.current.relative_humidity_2m),
        windSpeed: Math.round(data.current.wind_speed_10m),
        feelsLike: Math.round(data.current.apparent_temperature),
        rainProb: data.daily.precipitation_probability_max?.[0] || 0,
        sunrise: new Date(data.daily.sunrise?.[0] || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        sunset: new Date(data.daily.sunset?.[0] || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        city: cityName,
        isDay: data.current.is_day === 1,
        hourly: hourlyData.map(h => ({ time: `${h.time} ${h.ampm}`.trim(), temp: h.temp, code: h.code }))
      };
      
      setWeather(newWeather);
      
      // Smart Insight Notification trigger (simulate pushed insight if severe)
      if (newWeather.code >= 80) {
        addNotification({
          title: "Weather Alert: Heavy Rain",
          body: "High demand expected due to rain. Book your ride slightly earlier to avoid delays.",
          category: 'ride'
        });
      }
      
    } catch (e) {
      console.warn("Weather API Error:", e);
      setError(true);
      // Fallback cached mock
      setWeather({
        currentTemp: 34,
        condition: 'Sunny',
        code: 0,
        humidity: 65,
        windSpeed: 12,
        feelsLike: 37,
        rainProb: 0,
        sunrise: '05:20 AM',
        sunset: '06:45 PM',
        city: cityName,
        isDay: true,
        hourly: [
           { time: '10 AM', temp: Math.round(34), code: 0 },
           { time: '11 AM', temp: Math.round(35), code: 0 },
           { time: '12 PM', temp: Math.round(36), code: 1 },
           { time: '01 PM', temp: Math.round(37), code: 2 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to get GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
           // Simple mock reverse geocoding for city name based on BR coordinates
           let city = 'Patna';
           const lat = pos.coords.latitude;
           const lng = pos.coords.longitude;
           
           if (lat > 25.8 && lng > 85.7) city = 'Samastipur';
           else if (lat > 26.1) city = 'Darbhanga';
           else if (lat > 26.0 && lng < 85.5) city = 'Muzaffarpur';
           else if (lat > 25.4 && lng > 86.0) city = 'Begusarai';
           else if (lat > 25.6 && lat < 25.8 && lng > 85.1 && lng < 85.3) city = 'Hajipur';
           else if (lat < 24.8) city = 'Gaya';
           
           fetchWeather(lat, lng, city);
        },
        () => {
           // Default to Patna
           fetchWeather(25.5941, 85.1376, 'Patna');
        }
      );
    } else {
      fetchWeather(25.5941, 85.1376, 'Patna');
    }
    
    // Refresh every 30 mins
    const interval = setInterval(() => {
       fetchWeather(25.5941, 85.1376, 'Patna');
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !weather) {
     return (
       <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-[18px] animate-pulse"></div>
     );
  }

  if (!weather) return null;

  const wDetails = getWeatherDetails(weather.code);

  return (
    <>
      <motion.div 
        whileTap={{ scale: 0.9 }} 
        onClick={() => setIsExpanded(true)}
        className="h-11 bg-[#1E1E1E]/80 backdrop-blur-xl rounded-[18px] border border-white/10 flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.5)] relative cursor-pointer hover:bg-white/10 transition-colors px-3 gap-2 group"
      >
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          {wDetails.icon}
        </div>
        <span className="text-[14px] font-black text-[#F5F5F5]">{weather.currentTemp}°</span>
      </motion.div>

      {/* Expanded Weather Overlay */}
      <AnimatePresence>
        {isExpanded && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setIsExpanded(false)}
             className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-6 font-sans"
           >
             <motion.div 
               initial={{ opacity: 0, y: -20, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: -20, scale: 0.95 }}
               onClick={(e) => e.stopPropagation()}
               className="w-full max-w-sm bg-[#000000] text-[#ffffff] border-dotted border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden"
             >
                {/* Background Art */}
                <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-20 ${weather.code === 0 ? 'bg-[#FFC107]' : weather.code > 50 ? 'bg-blue-500' : 'bg-white'}`} />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                   <div>
                     <h3 className="text-3xl font-black text-[#F5F5F5]">{weather.city}</h3>
                     <p className="text-[#FFC107] text-[10px] font-black tracking-widest uppercase mt-1">Live Update</p>
                   </div>
                   <div className="w-16 h-16 bg-black/40 rounded-[20px] flex items-center justify-center border border-white/10 shadow-inner">
                      {wDetails.icon}
                   </div>
                </div>

                <div className="flex items-end gap-3 mb-8 relative z-10">
                   <h1 className="text-6xl font-black text-white tracking-tighter leading-none">{weather.currentTemp}°<span className="text-2xl text-white/40">C</span></h1>
                   <div className="pb-1.5">
                     <p className="text-white/80 font-bold tracking-wide">{wDetails.label}</p>
                     <p className="text-white/50 text-xs font-medium">Feels like {weather.feelsLike}°</p>
                   </div>
                </div>

                {/* Insight Box */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 relative z-10 flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                     <Sparkles className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-[#FFC107] mb-1">RAPDO Insight</p>
                      <p className="text-[11px] text-white/80 leading-relaxed font-medium">{wDetails.insight}</p>
                   </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-3 relative z-10">
                   <div className="bg-black/30 border border-white/5 rounded-[20px] p-4 flex items-center gap-3">
                     <Droplets className="w-5 h-5 text-blue-400" />
                     <div>
                       <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Humidity</p>
                       <p className="text-sm font-black text-white">{weather.humidity}%</p>
                     </div>
                   </div>
                   <div className="bg-black/30 border border-white/5 rounded-[20px] p-4 flex items-center gap-3">
                     <Wind className="w-5 h-5 text-gray-400" />
                     <div>
                       <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Wind</p>
                       <p className="text-sm font-black text-white">{weather.windSpeed} km/h</p>
                     </div>
                   </div>
                   <div className="bg-black/30 border border-white/5 rounded-[20px] p-4 flex items-center gap-3">
                     <CloudRain className="w-5 h-5 text-blue-400" />
                     <div>
                       <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Rain Prob</p>
                       <p className="text-sm font-black text-white">{weather.rainProb}%</p>
                     </div>
                   </div>
                   <div className="bg-black/30 border border-white/5 rounded-[20px] p-4 flex items-center gap-3">
                     <ThermometerSun className="w-5 h-5 text-orange-400" />
                     <div>
                       <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{weather.isDay ? 'Sunset' : 'Sunrise'}</p>
                       <p className="text-sm font-black text-white">{weather.isDay ? weather.sunset : weather.sunrise}</p>
                     </div>
                   </div>
                </div>

                {/* Hourly Forecast */}
                <div className="mt-8 relative z-10 w-full overflow-hidden">
                   <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-3">Today's Forecast</p>
                   <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pt-1 w-full pl-1 -ml-1 pr-4">
                      {weather.hourly.slice(0, 6).map((hw, i) => (
                         <div key={i} className="flex flex-col flex-shrink-0 items-center justify-center p-3 rounded-[20px] bg-white/5 border border-white/5 min-w-[60px] shadow-sm">
                            <span className="text-[10px] font-bold text-white/60 mb-2 whitespace-nowrap">{hw.time}</span>
                            <div className="w-6 h-6 mb-2">
                               {getWeatherDetails(hw.code).icon}
                            </div>
                            <span className="text-sm font-black text-[#F5F5F5]">{hw.temp}°</span>
                         </div>
                      ))}
                   </div>
                </div>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
