import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Mic, Navigation, Star } from 'lucide-react';
import { useMapsLibrary } from './SmartMapView';
import { searchBiharLocations, BiharLocation } from '../lib/locationDb';
import { VoiceSearchModal } from './VoiceSearchModal';

export function LocationSearchInput({ 
  value, 
  onChange, 
  onSelect, 
  placeholder, 
  icon, 
  focusColor, 
  setSelectionMode, 
  mode 
}: any) {
  const places = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const isBlurringRef = useRef<any>(null);

  useEffect(() => {
    // Hybrid local database + Google places predictions
    const localMatches = searchBiharLocations(value || '');
    const mappedLocalMatches = localMatches.map(loc => ({
      description: `${loc.name}, ${loc.city}, Bihar`,
      place_id: `local_${loc.name.replace(/\s+/g, '_')}`,
      isLocal: true,
      coordinate: { lat: loc.lat, lng: loc.lng }
    }));

    if (!places || !value || value.length < 1) {
      setPredictions(mappedLocalMatches.slice(0, 5));
      return;
    }

    // Debounce the call to Google Places API to save free tier limits
    const timerId = setTimeout(() => {
      try {
        const service = new places.AutocompleteService();
        service.getPlacePredictions({ 
          input: value, 
          componentRestrictions: { country: 'in' },
          locationBias: { lat: 25.5941, lng: 85.1376 } // Bias around Patna
        })
        .then((response: any) => {
          const googlePreds = response.predictions || [];
          // Combine, prioritize local Bihar results first for outstanding personalization
          const combined = [...mappedLocalMatches, ...googlePreds];
          // Deduplicate
          const uniquePreds: any[] = [];
          const seenDesc = new Set();
          combined.forEach(p => {
            if (!seenDesc.has(p.description.toLowerCase())) {
              seenDesc.add(p.description.toLowerCase());
              uniquePreds.push(p);
            }
          });
          setPredictions(uniquePreds.slice(0, 6));
        })
        .catch(() => {
          setPredictions(mappedLocalMatches.slice(0, 6));
        });
      } catch(e) {
        setPredictions(mappedLocalMatches.slice(0, 6));
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timerId);
  }, [value, places]);

  const handleSelect = async (prediction: any) => {
    if (isBlurringRef.current) {
      clearTimeout(isBlurringRef.current);
    }
    setShowPredictions(false);
    onChange(prediction.description);
    
    if (prediction.isLocal && prediction.coordinate) {
      onSelect?.(prediction.coordinate);
      return;
    }

    if (!geocodingLib) return;
    const geocoder = getSafeGeocoder(geocodingLib);
    try {
      const res = await geocoder.geocode(prediction.place_id ? { placeId: prediction.place_id } : { address: prediction.description });
      if (res.results[0]) {
        const latLng = res.results[0].geometry.location;
        onSelect?.({ 
          lat: typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat, 
          lng: typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng 
        });
      }
    } catch (e) {
      console.warn("Geocode failed for prediction", e);
    }
  };

  const handleVoiceSuccess = (text: string, matchedLocation: BiharLocation | null) => {
    onChange(text);
    if (matchedLocation) {
      onChange(`${matchedLocation.name}, ${matchedLocation.city}, Bihar`);
      onSelect?.({ lat: matchedLocation.lat, lng: matchedLocation.lng });
    }
  };

  return (
    <div className="relative z-20">
      <div className="relative group">
         <div id={`search-input-dot-${mode}`} className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#121212] border ${focusColor.border} rounded-full flex items-center justify-center shadow-inner group-focus-within:${focusColor.activeBorder} transition-all`}>
            <div className={`w-2 h-2 rounded-full ${focusColor.dot}`}></div>
         </div>
         <input 
           id={`location-search-input-field-${mode}`}
           type="text" 
           required
           value={value} 
           onChange={e => { onChange(e.target.value); setShowPredictions(true); }}
           onFocus={() => { setSelectionMode?.(mode); setShowPredictions(true); }}
           onBlur={() => {
             isBlurringRef.current = setTimeout(() => setShowPredictions(false), 250);
           }}
           placeholder={placeholder}
           className={`block w-full pl-16 pr-12 py-5 border border-white/5 bg-[#1A1A1A] hover:bg-[#1f1f1f] focus:bg-[#1f1f1f] text-white rounded-[24px] text-sm font-bold tracking-wide outline-none transition-all placeholder:text-white/30 focus:ring-2 ${focusColor.ring} shadow-inner`}
         />
         {/* Built-in microphone assistant */}
         <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
           <motion.button
             type="button"
             whileHover={{ scale: 1.15 }}
             whileTap={{ scale: 0.9 }}
             onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               setIsVoiceOpen(true);
             }}
             className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#FFC107]/50 flex items-center justify-center shadow-md text-white/50 hover:text-[#FFC107] transition-all"
           >
             <Mic className="w-4 h-4" />
           </motion.button>
         </div>
      </div>
      
      <AnimatePresence>
        {showPredictions && predictions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[100] max-h-[300px] overflow-y-auto no-scrollbar"
          >
            {predictions.map(p => (
              <div 
                key={p.place_id || p.description} 
                className="px-4 py-3.5 border-b border-transparent hover:border-[#FFC107]/40 hover:bg-[#FFC107]/15 cursor-pointer flex gap-3.5 items-center justify-between group/item transition-all duration-200 transform hover:translate-x-1"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur from firing before click commits
                  handleSelect(p);
                }}
              >
                <div className="flex gap-3 items-center min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${p.isLocal ? 'bg-[#FFC107]/10 border border-[#FFC107]/20 text-[#FFC107]' : 'bg-white/5 border border-white/10 text-white/40'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-white text-sm font-bold block truncate tracking-wide">{p.description}</span>
                    {p.isLocal && (
                      <span className="text-[10px] text-[#FFC107]/70 font-black uppercase tracking-wider block">RAPDO Verified Route</span>
                    )}
                  </div>
                </div>
                {p.isLocal && (
                  <span className="text-[10px] bg-[#FFC107]/10 text-[#FFC107] px-2 py-0.5 rounded-full border border-[#FFC107]/30 shrink-0 font-bold uppercase tracking-wider">Bihar</span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <VoiceSearchModal 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)} 
        onTranscriptionComplete={handleVoiceSuccess} 
      />
    </div>
  );
}

function getSafeGeocoder(geocodingLib: any) {
  try {
    if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
      return new (window as any).google.maps.Geocoder();
    }
  } catch (e) {
    console.warn("Global Geocoder instantiation failed:", e);
  }
  try {
    if (geocodingLib && geocodingLib.Geocoder) {
      return new geocodingLib.Geocoder();
    }
  } catch (e) {
    console.warn("Library Geocoder instantiation failed:", e);
  }
  // Safe mock fallback
  return {
    geocode: ({ location, address, placeId }: any) => {
      const displayAddr = address || (location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Patna, Bihar");
      return Promise.resolve({
        results: [{
          geometry: { location: location || { lat: 25.5941, lng: 85.1376 } },
          formatted_address: displayAddr
        }]
      });
    }
  };
}
