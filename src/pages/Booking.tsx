import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { MapPin, Search, Navigation, Clock, ShieldCheck, CreditCard, ChevronLeft, Mic, ChevronRight, X, LocateFixed, CarTaxiFront, Sparkles, ChevronUp, ChevronDown, PhoneCall, MessageSquare } from 'lucide-react';
import { Map, Marker, useMap, useMapsLibrary } from '../components/SmartMapView';
import { db } from '../lib/firebase';
import { setDoc, doc } from 'firebase/firestore';

interface LocationInfo {
  lat: number;
  lng: number;
  address: string;
}

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const routesLib = useMapsLibrary('routes');
  const geocodingLib = useMapsLibrary('geocoding');

  const initialState = location.state as any;

  const [pickup, setPickup] = useState<LocationInfo | null>(
    initialState?.pickupCoords && initialState?.pickup ? { ...initialState.pickupCoords, address: initialState.pickup } : null
  );
  const [dropoff, setDropoff] = useState<LocationInfo | null>(
    initialState?.dropCoords && initialState?.drop ? { ...initialState.dropCoords, address: initialState.drop } : null
  );
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  
  const [searchFocused, setSearchFocused] = useState<'pickup' | 'dropoff'>(initialState?.selectionMode || 'pickup');
  const [pickupQuery, setPickupQuery] = useState(initialState?.pickup || '');
  const [dropoffQuery, setDropoffQuery] = useState(initialState?.drop || '');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [etaMins, setEtaMins] = useState<number | null>(null);
  const polylinesRef = useRef<any[]>([]);

  const [isLocating, setIsLocating] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Real-time tracking simulation states
  const [bookingState, setBookingState] = useState<'initial' | 'searching' | 'assigned'>('initial');
  const [driverLocation, setDriverLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [driverEta, setDriverEta] = useState<number | null>(null);
  const [driverCardExpanded, setDriverCardExpanded] = useState(false);

  // Driver Simulation Movement
  useEffect(() => {
    if (bookingState === 'assigned' && driverLocation && pickup) {
      const interval = setInterval(() => {
         setDriverLocation(prev => {
            if (!prev) return prev;
            const latDiff = pickup.lat - prev.lat;
            const lngDiff = pickup.lng - prev.lng;
            
            if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) {
              setDriverEta(0);
              return prev;
            }

            const moveStep = 0.05;
            setDriverEta(prevEta => (prevEta ? Math.max(1, prevEta - 0.1) : 1));

            return {
               lat: prev.lat + (latDiff * moveStep),
               lng: prev.lng + (lngDiff * moveStep)
            };
         });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [bookingState, pickup]);

  // Auto-locate
  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(loc);
          if (map && !pickup && !initialState?.pickupCoords) map.panTo(loc);
          
          if (!pickup && !initialState?.pickup) {
            if (geocodingLib) {
              const geocoder = new geocodingLib.Geocoder();
              geocoder.geocode({ location: loc }).then(res => {
                if (res.results[0]) {
                  const address = res.results[0].formatted_address;
                  setPickup({ ...loc, address });
                  setPickupQuery(address);
                  if (!dropoffQuery) setSearchFocused('dropoff');
                }
              }).catch(console.error).finally(() => setIsLocating(false));
            } else {
              setPickup({ ...loc, address: 'Current Location' });
              setPickupQuery('Current Location');
              setIsLocating(false);
            }
          } else {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error(error);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    handleLocateMe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geocodingLib]);

  // Autocomplete handle input
  useEffect(() => {
    if (!placesLib) return;
    const q = searchFocused === 'pickup' ? pickupQuery : dropoffQuery;
    
    const currentLoc = searchFocused === 'pickup' ? pickup : dropoff;
    if (!q.trim() || q === currentLoc?.address) {
      setPredictions([]);
      return;
    }
    
    const autocompleteService = new placesLib.AutocompleteService();
    autocompleteService.getPlacePredictions({
      input: q,
      componentRestrictions: { country: 'in' },
      locationRestriction: {
          north: 27.5,
          south: 24.5,
          east: 88.3,
          west: 83.3
      }
    }, (results: any) => {
      setPredictions(results || []);
    });
  }, [pickupQuery, dropoffQuery, searchFocused, placesLib]);

  const handlePredictionSelect = (placeId: string, description: string) => {
    if (!placesLib) return;
    const placesService = new placesLib.PlacesService(document.createElement('div'));
    placesService.getDetails({
      placeId: placeId,
      fields: ['geometry', 'formatted_address', 'name']
    }, (place: any, status: any) => {
      if (status === 'OK' && place.geometry && place.geometry.location) {
        const locInfo = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || place.name || description
        };
        if (searchFocused === 'pickup') {
          setPickup(locInfo);
          setPickupQuery(locInfo.address);
          setSearchFocused('dropoff');
        } else {
          setDropoff(locInfo);
          setDropoffQuery(locInfo.address);
          setSearchFocused('pickup');
        }
        setPredictions([]);
      }
    });
  };

  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  // Route calculation
  useEffect(() => {
    if (!routesLib || !map || !pickup || !dropoff) return;

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new routesLib.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#FFC107',
          strokeWeight: 6,
          strokeOpacity: 0.8
        }
      });
    }

    const directionsService = new routesLib.DirectionsService();

    directionsService.route({
      origin: { lat: pickup.lat, lng: pickup.lng },
      destination: { lat: dropoff.lat, lng: dropoff.lng },
      travelMode: 'DRIVING' as any,
    }, (result: any, status: any) => {
      if (status === 'OK' && result) {
        directionsRendererRef.current?.setDirections(result);
        
        const route = result.routes[0];
        let distMeters = 0;
        let durSecs = 0;
        
        route.legs.forEach((leg: any) => {
          distMeters += leg.distance?.value || 0;
          durSecs += leg.duration?.value || 0;
        });

        setDistanceKm(distMeters / 1000);
        setEtaMins(Math.ceil(durSecs / 60));
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });

    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
    };
  }, [routesLib, map, pickup, dropoff]);

  // Fare calculation
  const calculateFareDetails = () => {
    if (distanceKm === null) return null;
    const dist = distanceKm;
    let base = 20;
    let extra = 0;
    if (dist > 3) {
      extra = (dist - 3) * 8;
    }
    const subtotal = base + extra;
    let discount = 0;
    if (dist > 10 && dist <= 25) discount = 10;
    else if (dist > 25 && dist <= 50) discount = 20;
    else if (dist > 50 && dist <= 80) discount = 40;
    else if (dist > 80 && dist <= 100) discount = 80;
    
    return {
      base,
      extra,
      discount,
      finalFare: Math.max(0, subtotal - discount)
    };
  };

  const fareDetails = calculateFareDetails();

  const handleBookRide = async () => {
    if (!pickup || !dropoff || !fareDetails) return;
    try {
      const bookingId = 'BKG-' + Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'bookings', bookingId), {
        bookingId,
        customerId: currentUser?.uid || 'guest',
        customerName: currentUser?.name || 'Guest User',
        pickup,
        dropoff,
        distanceKm,
        etaMins,
        fare: fareDetails.finalFare,
        status: 'searching',
        timestamp: Date.now()
      });
      
      setBookingState('searching');
      
      // Simulate finding a captain
      setTimeout(() => {
         setBookingState('assigned');
         const drvLat = pickup.lat - 0.009;
         const drvLng = pickup.lng - 0.009;
         setDriverLocation({ lat: drvLat, lng: drvLng });
         setDriverEta(5);
      }, 3500);

    } catch (e) {
      console.error(e);
      alert('Failed to book ride.');
    }
  };

  // Voice Search Handle
  const handleVoiceSearch = () => {
    setShowVoiceModal(true);
    setIsListening(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        if (!event.results || !event.results[0] || !event.results[0][0]) return;
        const transcript = event.results[0][0].transcript;
        if (searchFocused === 'pickup') {
          setPickupQuery(transcript);
        } else {
          setDropoffQuery(transcript);
        }
        setIsListening(false);
        setTimeout(() => setShowVoiceModal(false), 800);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert("Voice search is not supported in this browser.");
      setIsListening(false);
      setShowVoiceModal(false);
    }
  };

  const centerPoint = pickup && dropoff ? { lat: (pickup.lat + dropoff.lat) / 2, lng: (pickup.lng + dropoff.lng) / 2 } : pickup || currentLocation || { lat: 25.5941, lng: 85.1376 };

  return (
    <div className="relative w-full h-[100dvh] bg-[#0A0A0A] text-white flex flex-col font-sans overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 z-0 h-[65dvh]">
         <Map
           defaultCenter={{lat: 25.5941, lng: 85.1376}}
           center={centerPoint}
           defaultZoom={13}
           gestureHandling="greedy"
           disableDefaultUI={true}
           internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
         >
           {pickup && <Marker position={pickup} icon="https://maps.google.com/mapfiles/ms/icons/green-dot.png" />}
           {dropoff && <Marker position={dropoff} icon="https://maps.google.com/mapfiles/ms/icons/red-dot.png" />}
           {currentLocation && !pickup && <Marker position={currentLocation} icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png" />}
           {bookingState === 'assigned' && driverLocation && (
             <Marker position={driverLocation} icon="https://maps.google.com/mapfiles/kml/shapes/cabs.png" />
           )}
         </Map>
         {/* Top Gradient */}
         <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-4 md:pt-6 flex justify-between items-center pointer-events-none">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto hover:bg-black/60 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full pointer-events-auto">
          <span className="text-[#FFC107] font-black tracking-widest text-sm uppercase">Rapdo</span>
        </div>
      </div>

      {/* Main Bottom Sheet / Content Area */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col pointer-events-none">
        
        {/* Locate Me Floating Button */}
        <div className="flex justify-end p-4 pointer-events-auto w-full md:max-w-md md:mx-auto">
           <button 
             onClick={handleLocateMe}
             className="w-12 h-12 bg-[#121212] rounded-full border border-white/10 shadow-lg flex items-center justify-center text-[#FFC107] hover:scale-105 transition-transform"
           >
             <LocateFixed className={`w-6 h-6 ${isLocating ? 'animate-pulse text-white/50' : ''}`} />
           </button>
        </div>

        {/* Card Component */}
        <motion.div 
          initial={{ y: 200 }} 
          animate={{ y: 0 }} 
          className="bg-[#0D0D0D] border-t border-white/10 rounded-t-[32px] w-full md:max-w-md md:mx-auto shadow-[0_-20px_50px_rgba(0,0,0,0.5)] pointer-events-auto max-h-[85vh] flex flex-col"
        >
          {/* Handle bar */}
          <div className="w-full flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-12 h-1.5 bg-white/10 rounded-full" />
          </div>

          <div className="px-6 pb-6 flex-1 overflow-y-auto no-scrollbar scroll-smooth">
            {bookingState === 'initial' && (
              <>
                <h2 className="text-2xl font-black mb-5 tracking-tight text-[#F5F5F5]">Plan your ride</h2>

                {/* Inputs */}
                <div className="relative bg-[#1A1A1A] rounded-[24px] p-5 border border-white/10 mb-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                   <div className="absolute left-[31px] top-[40px] bottom-[40px] w-0.5 bg-gradient-to-b from-green-500 via-white/10 to-red-500 rounded-full" />
                   
                   {/* Pickup */}
                   <div className="flex items-center gap-4 relative z-10 mb-5 group">
                     <div className="w-3.5 h-3.5 rounded-full bg-green-500 shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.5)] border-2 border-[#1A1A1A]" />
                     <input 
                       type="text" 
                       value={pickupQuery}
                       onChange={e => { setPickupQuery(e.target.value); setSearchFocused('pickup'); }}
                       onFocus={() => setSearchFocused('pickup')}
                       placeholder="Enter pickup location"
                       className="bg-[#242424] text-white placeholder-white/40 font-medium text-sm w-full outline-none px-4 py-3.5 rounded-xl border border-white/5 focus:border-green-500/50 transition-all shadow-inner"
                     />
                   </div>
                   
                   {/* Dropoff */}
                   <div className="flex items-center gap-4 relative z-10 group">
                     <div className="w-3.5 h-3.5 bg-red-500 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-[#1A1A1A]" />
                     <input 
                       type="text" 
                       value={dropoffQuery}
                       onChange={e => { setDropoffQuery(e.target.value); setSearchFocused('dropoff'); }}
                       onFocus={() => setSearchFocused('dropoff')}
                       placeholder="Search destination"
                       className="bg-[#242424] text-white placeholder-white/40 font-medium text-sm w-full outline-none px-4 py-3.5 rounded-xl border border-white/5 focus:border-red-500/50 transition-all shadow-inner"
                     />
                     <button onClick={handleVoiceSearch} className="absolute right-3 w-8 h-8 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-[#FFC107] hover:bg-white/10 transition-colors shadow-md">
                       <Mic className="w-4 h-4" />
                     </button>
                   </div>
                </div>

                {/* Suggestions Overlay */}
                {predictions.length > 0 && !(pickup && dropoff && !pickupQuery && !dropoffQuery) ? (
                  <div className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden mb-5 shadow-xl">
                    {predictions.map(p => (
                      <button 
                        key={p.place_id} 
                        onClick={() => handlePredictionSelect(p.place_id, p.description)}
                        className="w-full text-left px-5 py-4 flex items-center gap-4 border-b border-white/5 hover:bg-white/5 transition-colors last:border-0"
                      >
                         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                           <MapPin className="w-4 h-4 text-[#FFC107]" />
                         </div>
                         <div className="min-w-0 pr-2">
                           <p className="text-sm font-bold text-white truncate">{p.structured_formatting?.main_text || p.description}</p>
                           <p className="text-xs text-white/40 truncate">{p.structured_formatting?.secondary_text || ''}</p>
                         </div>
                      </button>
                    ))}
                  </div>
                ) : (
                   (searchFocused === 'dropoff' && !dropoffQuery) || (searchFocused === 'pickup' && !pickupQuery) ? (
                     <div className="mb-5">
                       <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 px-2">Popular Suggestions</h3>
                       <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-2">
                         {['Patna Junction', 'Darbhanga Tower', 'Muzaffarpur Station', 'Gaya Airport'].map((place) => (
                           <button
                             key={place}
                             onClick={() => {
                               if (searchFocused === 'pickup') {
                                 setPickupQuery(place);
                               } else {
                                 setDropoffQuery(place);
                               }
                             }}
                             className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-white/5 rounded-full whitespace-nowrap hover:bg-white/10 transition-colors shrink-0 shadow-sm"
                           >
                             <Clock className="w-3.5 h-3.5 text-[#FFC107]" />
                             <span className="text-sm font-medium text-white/90">{place}</span>
                           </button>
                         ))}
                       </div>
                     </div>
                   ) : null
                )}

                {/* Fare Breakdown Card */}
                <AnimatePresence>
                  {distanceKm !== null && fareDetails && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      className="relative rounded-3xl p-5 border border-[#FFC107]/30 shadow-[0_0_30px_rgba(255,193,7,0.15)] mb-5 overflow-hidden group backdrop-blur-xl bg-[#0D0D0D]/80"
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FFC1070A_1px,transparent_1px),linear-gradient(to_bottom,#FFC1070A_1px,transparent_1px)] bg-[size:14px_14px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
                      
                      {/* Holographic Scanline */}
                      <motion.div 
                        initial={{ top: '-10%' }}
                        animate={{ top: '110%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC107]/50 to-transparent shadow-[0_0_10px_rgba(255,193,7,1)] pointer-events-none z-10"
                      />

                      <div className="relative z-10">
                        <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-4">
                          <div>
                            <h3 className="text-[#FFC107] font-black text-xs tracking-widest uppercase mb-1 flex items-center gap-1.5"><Sparkles className="w-3 h-3"/> Holographic Estimate</h3>
                            <div className="flex items-center gap-3 text-sm font-bold text-white/90">
                               <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5 text-blue-400" /> <span className="font-mono">{distanceKm.toFixed(1)} km</span></span>
                               <span className="w-1 h-1 rounded-full bg-white/30 animate-ping" />
                               <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-purple-400" /> <span className="font-mono">{etaMins} min</span></span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-md">₹{Math.ceil(fareDetails.finalFare)}</span>
                            <p className="text-[9px] text-[#FFC107] uppercase font-black tracking-[0.2em] mt-1 shadow-sm">Final Quota</p>
                          </div>
                        </div>

                        <div className="space-y-2.5 text-xs font-mono">
                          <div className="flex justify-between font-medium text-white/60 hover:text-white/80 transition-colors">
                            <span>Base Fare (First 3.0 KM)</span>
                            <span className="text-white/90">₹{fareDetails.base.toFixed(2)}</span>
                          </div>
                          {fareDetails.extra > 0 && (
                            <div className="flex justify-between font-medium text-white/60 hover:text-white/80 transition-colors">
                              <span>Extra Radius ({(distanceKm - 3).toFixed(1)} KM × ₹8)</span>
                              <span className="text-red-400">+ ₹{fareDetails.extra.toFixed(2)}</span>
                            </div>
                          )}
                          {fareDetails.discount > 0 && (
                            <div className="flex justify-between font-black text-green-400 bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5"/> Local Subsidy Applied</span>
                              <span>- ₹{fareDetails.discount.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Book Button */}
                <AnimatePresence>
                  {pickup && dropoff && distanceKm !== null && (
                    <motion.button 
                      onClick={handleBookRide}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full relative group overflow-hidden bg-[#121212] py-4 rounded-xl flex items-center justify-center gap-3 border border-[#FFC107]/50 shadow-[0_0_20px_rgba(255,193,7,0.2)]"
                    >
                      <div className="absolute inset-0 bg-[#FFC107]/10 group-hover:bg-[#FFC107]/20 transition-colors" />
                      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC107] to-transparent" />
                      <CarTaxiFront className="w-5 h-5 text-[#FFC107]" />
                      <span className="text-[#FFC107] font-black text-lg uppercase tracking-widest relative z-10">Materialize Ride</span>
                      <ChevronRight className="w-5 h-5 text-[#FFC107]/50" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </>
            )}

            {bookingState === 'searching' && (
              <div className="flex flex-col items-center justify-center py-10 min-h-[40vh]">
                <div className="relative flex items-center justify-center mb-8">
                  <div className="absolute w-32 h-32 rounded-full border border-[#FFC107] animate-ping opacity-60" />
                  <div className="w-16 h-16 rounded-full border-4 border-[#121212] flex items-center justify-center relative bg-[#121212] shadow-[0_0_20px_rgba(255,193,7,0.5)]">
                     <div className="w-8 h-8 border-4 border-[#FFC107] border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-white/90">Searching Captains...</h3>
                <p className="text-white/40 text-sm mt-3 font-medium text-center">Broadcasting frequency to<br/>local transport nodes</p>
              </div>
            )}

            {bookingState === 'assigned' && (
              <motion.div 
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-0 left-0 right-0 bg-[#0D0D0D] border-t border-white/10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
              >
                <div 
                  className="w-full flex items-center justify-center pt-3 pb-1 cursor-pointer"
                  onClick={() => setDriverCardExpanded(!driverCardExpanded)}
                >
                  <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </div>
                
                <div className="px-6 pb-6 pt-2">
                  <div className="flex items-center justify-between" onClick={() => setDriverCardExpanded(!driverCardExpanded)}>
                      <div>
                          <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
                            Captain En Route {driverCardExpanded ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronUp className="w-4 h-4 text-white/50" />}
                          </h3>
                          <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              <p className="text-[#FFC107] font-bold text-xs tracking-widest uppercase">Arriving in {Math.ceil(driverEta || 0)} Mins</p>
                          </div>
                      </div>
                      <div className="relative">
                          <div className="absolute inset-0 bg-[#FFC107]/20 rounded-full blur-md" />
                          <div className="w-12 h-12 rounded-full border-2 border-[#121212] relative z-10 overflow-hidden bg-white/10">
                              <img src="https://i.pravatar.cc/150?u=rapdo_drv1" alt="Captain" className="w-full h-full object-cover" />
                          </div>
                      </div>
                  </div>

                  <AnimatePresence>
                    {driverCardExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                       <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/5 mt-5 mb-5 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-5">
                               <CarTaxiFront className="w-24 h-24" />
                           </div>
                           <div className="flex justify-between items-center mb-4 relative z-10">
                               <div>
                                   <p className="text-[#FFC107] font-black text-xl tracking-widest">BR 01 FX 9021</p>
                                   <p className="text-white/50 text-xs font-medium uppercase tracking-widest mt-1">White Suzuki Swift</p>
                               </div>
                               <div className="bg-green-500/10 border border-green-500/20 p-2 rounded-xl text-green-500 flex flex-col items-center">
                                   <ShieldCheck className="w-5 h-5 mb-1" />
                                   <span className="text-[8px] font-bold uppercase tracking-widest">Verified</span>
                               </div>
                           </div>
                           <div className="flex justify-between items-center border-t border-white/5 pt-4 relative z-10">
                               <div className="flex items-center gap-3">
                                   <p className="text-white font-bold text-sm">Ramesh K.</p>
                                   <span className="text-[10px] bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 px-2 py-0.5 rounded flex items-center font-bold tracking-wider">★ 4.9</span>
                               </div>
                               <div className="text-right">
                                 <p className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Final Quota</p>
                                 <p className="text-white font-black text-lg">₹{Math.ceil(fareDetails?.finalFare || 0)}</p>
                               </div>
                           </div>
                       </div>
                       
                       <div className="flex gap-3">
                           <button className="flex-1 bg-green-500 hover:bg-green-600 transition-colors py-3.5 rounded-xl font-black text-black flex items-center justify-center gap-2 border border-transparent shadow-[0_0_15px_rgba(34,197,94,0.3)] text-sm">
                               <PhoneCall className="w-4 h-4" /> Call 
                           </button>
                           <button className="flex-1 bg-[#1A1A1A] hover:bg-[#242424] transition-colors py-3.5 rounded-xl font-bold text-white/90 flex items-center justify-center gap-2 border border-white/10 text-sm shadow-sm">
                               <MessageSquare className="w-4 h-4" /> Message
                           </button>
                       </div>
                       <div className="mt-3">
                           <button className="w-full bg-red-500/10 hover:bg-red-500/20 transition-colors py-3 rounded-xl font-bold text-red-500 flex items-center justify-center gap-2 border border-red-500/20 text-xs">
                               Abort Ride
                           </button>
                       </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      </div>

      {/* Voice Search Modal */}
      <AnimatePresence>
        {showVoiceModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6"
          >
            <div className="absolute top-6 right-6">
               <button onClick={() => setShowVoiceModal(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="text-center space-y-6">
               <h3 className="text-2xl font-black text-white">
                 {isListening ? "Listening..." : "Processing audio..."}
               </h3>
               
               <div className="relative flex items-center justify-center">
                  {isListening && (
                    <>
                      <div className="absolute w-40 h-40 rounded-full border border-[#FFC107]/50 animate-ping opacity-60" />
                      <div className="absolute w-32 h-32 rounded-full border border-[#FFC107] animate-ping opacity-80" />
                    </>
                  )}
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl z-10 transition-colors ${isListening ? 'bg-[#FFC107] text-black shadow-[#FFC107]/20' : 'bg-white/10 text-white'}`}>
                    <Mic className="w-10 h-10" />
                  </div>
               </div>

               <p className="text-white/50 text-sm max-w-[200px] mx-auto font-medium">
                 Try saying "Patna Junction" or "Boring Road"
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
