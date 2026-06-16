import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Clock, ShieldCheck, CarTaxiFront, PhoneCall, MessageSquare, ChevronRight, X, Sparkles, Map as MapIcon } from 'lucide-react';
import { Map, Marker, useMap, useMapsLibrary } from './SmartMapView';
import { db } from '../lib/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

interface ActiveRideTrackingCardProps {
  initialBooking: any;
}

export function ActiveRideTrackingCard({ initialBooking }: ActiveRideTrackingCardProps) {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(initialBooking);
  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  // Subscribe to real-time database updates for this booking
  useEffect(() => {
    if (!booking?.bookingId) return;
    const bookingRef = doc(db, 'bookings', booking.bookingId);
    
    const unsubscribe = onSnapshot(bookingRef, (snap) => {
      if (snap.exists()) {
        setBooking(snap.data());
      }
    });
    return () => unsubscribe();
  }, [booking?.bookingId]);

  const { status, pickup, dropoff, driverLocation, driverEta, driverName, vehiclePlate, vehicleInfo, driverRating, driverAvatar } = booking || {};

  // Haversine distance calculator for accurate and robust fail-safe distance math
  const getHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Real-time route drawing and live traffic-aware math
  useEffect(() => {
    if (!routesLib || !map || !pickup) return;

    // Determine path points:
    // If en route: Origin = Driver, Destination = Pickup
    // If in trip: Origin = Pickup, Destination = Dropoff
    // If searching: Origin = Pickup, Destination = Dropoff
    let startPt = driverLocation || pickup;
    let endPt = status === 'in_trip' ? dropoff : pickup;

    if (!startPt || !endPt) return;

    // Check if we are in simulated map or real map
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }

    try {
      if (routesLib.DirectionsRenderer) {
        directionsRendererRef.current = new routesLib.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#3B82F6',
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        });

        const directionsService = new routesLib.DirectionsService();
        directionsService.route({
          origin: { lat: startPt.lat, lng: startPt.lng },
          destination: { lat: endPt.lat, lng: endPt.lng },
          travelMode: 'DRIVING' as any
        }, (res: any, statusResult: any) => {
          if (statusResult === 'OK' && res) {
            directionsRendererRef.current?.setDirections(res);
            
            let distVal = 0;
            let durVal = 0;
            res.routes[0].legs.forEach((leg: any) => {
              distVal += leg.distance?.value || 0;
              durVal += leg.duration?.value || 0;
            });
            setDistance(distVal / 1000);
            setEta(Math.ceil(durVal / 60));
          } else {
            // fallback distance
            const d = getHaversineDistance(startPt.lat, startPt.lng, endPt.lat, endPt.lng);
            setDistance(d);
            setEta(Math.ceil((d / 35) * 60)); // assume 35 km/h avg city speed
          }
        });
      }
    } catch (e) {
      // safe fallback math if map resources are not fully ready
      const d = getHaversineDistance(startPt.lat, startPt.lng, endPt.lat, endPt.lng);
      setDistance(d);
      setEta(Math.ceil((d / 35) * 60));
    }

    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
    };
  }, [routesLib, map, status, pickup, dropoff, driverLocation]);

  const handleAbortRide = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!booking?.bookingId) return;
    try {
      await updateDoc(doc(db, 'bookings', booking.bookingId), {
        status: 'cancelled'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'searching':
        return 'Broadcasting Signal...';
      case 'assigned':
        return `Captain Arriving in ${eta || driverEta || 5} min`;
      case 'arrived':
        return 'Captain has Arrived!';
      case 'in_trip':
        return `In Trip • ${eta || 10} min remaining`;
      default:
        return 'Ride Active';
    }
  };

  // Map focus coordinate
  const centerCoord = driverLocation || pickup || { lat: 25.5948, lng: 85.1376 };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ border: '1px solid rgba(255, 193, 7, 0.4)' }}
      onClick={() => navigate('/book')}
      className="bg-black/60 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative cursor-pointer backdrop-blur-3xl group mb-6"
    >
      <div className="absolute inset-0 bg-[#FFC107]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Top Header info */}
      <div className="p-5 flex items-center justify-between border-b border-white/5 relative z-10 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center animate-pulse">
            <CarTaxiFront className="w-4 h-4 text-[#FFC107]" />
          </div>
          <div>
            <span className="text-[#FFC107] text-[10px] font-black uppercase tracking-[0.2em] block mb-0.5">Live Transport Tracking</span>
            <h3 className="text-white font-black text-sm tracking-tight">{getStatusLabel()}</h3>
          </div>
        </div>
        
        {status === 'searching' ? (
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/25 px-2.5 py-1 rounded-full text-[9px] font-black text-[#FFC107] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-[#FFC107] rounded-full animate-ping" />
            Searching
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            En Route
          </div>
        )}
      </div>

      {/* Embedded Live Map Display widget */}
      <div className="h-[200px] w-full relative z-0 border-b border-white/5 overflow-hidden">
        <Map
          defaultCenter={{ lat: 25.5948, lng: 85.1376 }}
          center={centerCoord}
          zoom={14}
          defaultZoom={14}
          disableDefaultUI={true}
          gestureHandling="none"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
        >
          {pickup && <Marker position={pickup} icon="https://maps.google.com/mapfiles/ms/icons/green-dot.png" />}
          {dropoff && status === 'in_trip' && <Marker position={dropoff} icon="https://maps.google.com/mapfiles/ms/icons/red-dot.png" />}
          {driverLocation && (
            <Marker position={driverLocation} icon="https://maps.google.com/mapfiles/kml/shapes/cabs.png" />
          )}
        </Map>
        
        {/* Distance metrics overlay badge */}
        {distance !== null && (
          <div className="absolute bottom-3 left-3 bg-[#0D0D0D]/90 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[9px] font-mono text-white/80 font-bold flex items-center gap-1.5">
            <Navigation className="w-3 h-3 text-blue-400" />
            <span>{distance.toFixed(2)} KM</span>
          </div>
        )}
      </div>

      {/* Driver metadata card details */}
      {status !== 'searching' && driverName && (
        <div className="p-5 flex flex-col gap-4 relative z-10 bg-black/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/10 overflow-hidden border border-white/10 shrink-0">
                <img src={driverAvatar || "https://i.pravatar.cc/150?u=rapdo_drv1"} alt="Captain" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm tracking-wide">{driverName}</p>
                  <span className="text-[9px] bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 px-1.5 py-0.5 rounded font-black tracking-wider">★ {driverRating || "4.9"}</span>
                </div>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mt-0.5">{vehicleInfo || "Suzuki Swift White"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#FFC107] font-black text-sm tracking-wider">{vehiclePlate || "BR 01 FX 9021"}</p>
              <p className="text-white/30 text-[9px] uppercase font-bold tracking-[0.15em] mt-0.5">License Plate</p>
            </div>
          </div>

          <div className="flex gap-2 border-t border-white/5 pt-4">
            <button
              onClick={(e) => { e.stopPropagation(); window.location.href = `tel:+919431082741`; }}
              className="flex-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 py-2.5 rounded-xl text-green-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/book'); }}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-xl text-white/80 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </button>
            <button
              onClick={handleAbortRide}
              className="px-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 py-2.5 rounded-xl text-red-400 text-xs flex items-center justify-center transition-all"
              title="Abort Ride"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {status === 'searching' && (
        <div className="p-4 flex items-center justify-between bg-black/40 relative z-10 border-t border-white/5">
          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Searching available fleet captains...</span>
          <button
            onClick={handleAbortRide}
            className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-bold uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </motion.div>
  );
}
