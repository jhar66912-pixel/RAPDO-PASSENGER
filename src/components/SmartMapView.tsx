import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Info, HelpCircle } from 'lucide-react';

// Bounding box for Bihar simulation (Samastipur, Patna, Darbhanga bounds)
const MIN_LAT = 25.30;
const MAX_LAT = 26.30;
const MIN_LNG = 84.90;
const MAX_LNG = 86.30;

// Helper to convert geographic coordinates to percentage-based canvas coordinates
export const projectLatLng = (lat: number, lng: number) => {
  const clampedLat = Math.max(MIN_LAT, Math.min(MAX_LAT, lat));
  const clampedLng = Math.max(MIN_LNG, Math.min(MAX_LNG, lng));

  const xPercent = ((clampedLng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
  const yPercent = (1 - (clampedLat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100;

  return { x: xPercent, y: yPercent };
};

// Inverse projection: convert percentage-based canvas coordinates back to LatLng
export const unprojectXY = (xPercent: number, yPercent: number) => {
  const lng = MIN_LNG + (xPercent / 100) * (MAX_LNG - MIN_LNG);
  const lat = MIN_LAT + (1 - yPercent / 100) * (MAX_LAT - MIN_LAT);
  return { lat, lng };
};

// High-fidelity pre-mapped Bihar towns
const BIHAR_STATION_NODES = [
  { name: 'Patna Central Hub', lat: 25.5948, lng: 85.1376, isHub: true },
  { name: 'Samastipur HQ', lat: 25.8500, lng: 85.7800, isHub: true },
  { name: 'Darbhanga Junction', lat: 26.1500, lng: 85.9000, isHub: false },
  { name: 'Muzaffarpur Bypass', lat: 26.1200, lng: 85.3976, isHub: false },
  { name: 'Begusarai Crossing', lat: 25.4167, lng: 86.1333, isHub: false },
  { name: 'Hajipur Station', lat: 25.6833, lng: 85.2167, isHub: false },
  { name: 'Pusa Agriculture Univ', lat: 25.9800, lng: 85.6700, isHub: false },
  { name: 'Tajpur Road', lat: 25.8800, lng: 85.6100, isHub: false },
  { name: 'Rosera Chowk', lat: 25.7500, lng: 86.0300, isHub: false },
  { name: 'Dalsinghsarai Depot', lat: 25.6800, lng: 85.9300, isHub: false },
];

const RAPDO_PREMIUM_DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

// Helper to check if API key is a placeholder or invalid
export const hasValidApiKey = (key?: string): boolean => {
  if (!key) return false;
  const cleaned = key.trim();
  if (cleaned === '' || cleaned.includes('YOUR_') || cleaned.includes('PLACEHOLDER') || cleaned === 'null' || cleaned === 'undefined') {
    return false;
  }
  // Google Maps API keys usually start with 'AIza' and are around 39 characters
  return cleaned.startsWith('AIza') && cleaned.length > 20;
};

// Core context for managing map state sharing in simulated provider
interface SimulatedMapContextType {
  markers: Array<{ id: string; lat: number; lng: number; iconUrl?: string }>;
  registerMarker: (id: string, lat: number, lng: number, iconUrl?: string) => void;
  unregisterMarker: (id: string) => void;
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  setRoutePoints: (orig: { lat: number; lng: number } | null, dest: { lat: number; lng: number } | null) => void;
  simulatedMode: boolean;
}

const SimulatedMapContext = createContext<SimulatedMapContextType>({
  markers: [],
  registerMarker: () => {},
  unregisterMarker: () => {},
  origin: null,
  destination: null,
  setRoutePoints: () => {},
  simulatedMode: true,
});

// Real dynamic imports or loaded library elements from google maps
import * as GoogleMapsRealLibrary from '@vis.gl/react-google-maps';

export const APIKeyValidContext = createContext<boolean>(false);

// APIProvider Wrapper
export function APIProvider({ children, apiKey, version, ...props }: any) {
  const [isValid, setIsValid] = useState(hasValidApiKey(apiKey));

  useEffect(() => {
    setIsValid(hasValidApiKey(apiKey));
  }, [apiKey]);

  if (isValid) {
    return (
      <GoogleMapsRealLibrary.APIProvider apiKey={apiKey} version={version || 'weekly'} {...props}>
        <APIKeyValidContext.Provider value={true}>
          {children}
        </APIKeyValidContext.Provider>
      </GoogleMapsRealLibrary.APIProvider>
    );
  }

  // Fallback Simulator provider
  return (
    <SimulatedMapProvider>
      <APIKeyValidContext.Provider value={false}>
        {children}
      </APIKeyValidContext.Provider>
    </SimulatedMapProvider>
  );
}

// Simulated map provider state
function SimulatedMapProvider({ children }: { children: React.ReactNode }) {
  const [markers, setMarkers] = useState<any[]>([]);
  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);

  const registerMarker = (id: string, lat: number, lng: number, iconUrl?: string) => {
    setMarkers(prev => {
      const filtered = prev.filter(m => m.id !== id);
      return [...filtered, { id, lat, lng, iconUrl }];
    });
  };

  const unregisterMarker = (id: string) => {
    setMarkers(prev => prev.filter(m => m.id !== id));
  };

  const setRoutePoints = (orig: any, dest: any) => {
    setOrigin(orig);
    setDestination(dest);
  };

  return (
    <SimulatedMapContext.Provider value={{
      markers,
      registerMarker,
      unregisterMarker,
      origin,
      destination,
      setRoutePoints,
      simulatedMode: true
    }}>
      {children}
    </SimulatedMapContext.Provider>
  );
}

// Map Component Drop-in
export function Map({
  children,
  defaultCenter,
  center,
  zoom,
  defaultZoom,
  onClick,
  className = '',
  id,
  ...props
}: any) {
  // Access global context to check if we are in simulated mode
  const ctx = useContext(SimulatedMapContext);
  const mapRef = useRef<HTMLDivElement>(null);

  // If there is context and we are simulating
  const mapCenter = center || defaultCenter || { lat: 25.8500, lng: 85.7800 };
  const pointProjected = projectLatLng(mapCenter.lat, mapCenter.lng);

  // Handle clicking on the vector dashboard
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current || !onClick) return;
    const rect = mapRef.current.getBoundingClientRect();
    const xPixel = e.clientX - rect.left;
    const yPixel = e.clientY - rect.top;

    const xPercent = (xPixel / rect.width) * 100;
    const yPercent = (yPixel / rect.height) * 100;

    const latLngObj = unprojectXY(xPercent, yPercent);

    // Mimic the exact structure of Google Maps mouse event
    const mapsMouseEvent = {
      latLng: {
        lat: () => latLngObj.lat,
        lng: () => latLngObj.lng,
      }
    };
    onClick(mapsMouseEvent);
  };

  // We can see if real API is active via checking whether we are wrapped in Google's context
  const isRealMap = useContext(APIKeyValidContext);
  let hasRealGoogleMap = false;
  if (isRealMap) {
    try {
      const realContext = GoogleMapsRealLibrary.useMap();
      if (realContext) hasRealGoogleMap = true;
    } catch (e) {
      hasRealGoogleMap = false;
    }
  }

  if (hasRealGoogleMap) {
    return (
      <GoogleMapsRealLibrary.Map
        defaultCenter={defaultCenter}
        center={center}
        zoom={zoom}
        defaultZoom={defaultZoom}
        onClick={onClick}
        id={id}
        disableDefaultUI={true}
        styles={RAPDO_PREMIUM_DARK_MAP_STYLE}
        {...props}
      >
        {children}
      </GoogleMapsRealLibrary.Map>
    );
  }

  // Otherwise, render our breathtaking Custom Neon Vector simulated Map dashboard
  return (
    <div 
      id={id || 'smart-mock-map'}
      ref={mapRef}
      onClick={handleContainerClick}
      className={`relative w-full h-full bg-[#0E0F12] select-none overflow-hidden group/map ${className}`}
      style={{ minHeight: '100%' }}
    >
      {/* Laser neon tech grid lines overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,193,7,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,193,7,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(18,18,22,0.3)_0%,#090A0C_95%)] pointer-events-none" />

      {/* Dynamic scanline radar effect */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC107]/20 to-transparent animate-pulse pointer-events-none" style={{ animationDuration: '6s' }} />

      {/* Connect corridor lines between Bihar nodes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-current" style={{ color: 'rgba(255, 208, 0, 0.04)' }}>
        <g strokeWidth="1.5" strokeDasharray="3 4">
          {/* Main Highway channels projecting outwards from Samastipur */}
          {BIHAR_STATION_NODES.map((node, idx) => {
            if (node.name.includes('Samastipur')) return null;
            const sam = projectLatLng(25.8500, 85.7800);
            const dst = projectLatLng(node.lat, node.lng);
            return (
              <line 
                key={idx} 
                x1={`${sam.x}%`} 
                y1={`${sam.y}%`} 
                x2={`${dst.x}%`} 
                y2={`${dst.y}%`} 
              />
            );
          })}
        </g>
      </svg>

      {/* Pre-plotted Stations nodes */}
      {BIHAR_STATION_NODES.map((station, i) => {
        const xy = projectLatLng(station.lat, station.lng);
        return (
          <div 
            key={i} 
            className="absolute pointer-events-none"
            style={{ left: `${xy.x}%`, top: `${xy.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`w-2 h-2 rounded-full relative ${station.isHub ? 'bg-[#FFC107]' : 'bg-white/20'}`}>
              {station.isHub && (
                <div className="absolute -inset-1.5 bg-[#FFC107]/30 rounded-full animate-ping pointer-events-none" />
              )}
            </div>
            {/* Subtle name badge visible nearby */}
            <span className="absolute left-3 top-[-6px] text-[7px] font-black uppercase tracking-widest text-white/30 whitespace-nowrap">
              {station.name.split(' ')[0]}
            </span>
          </div>
        );
      })}

      {/* Render route paths if origin & destination are specified in context */}
      {ctx.origin && ctx.destination && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFC107" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFA500" stopOpacity="0.8" />
            </linearGradient>
            <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FFC107" floodOpacity="0.5" />
            </filter>
          </defs>
          
          {/* Main route track representation */}
          {(() => {
            const origXY = projectLatLng(ctx.origin.lat, ctx.origin.lng);
            const destXY = projectLatLng(ctx.destination.lat, ctx.destination.lng);
            return (
              <>
                <line 
                  x1={`${origXY.x}%`} 
                  y1={`${origXY.y}%`} 
                  x2={`${destXY.x}%`} 
                  y2={`${destXY.y}%`} 
                  stroke="url(#neonGlow)"
                  strokeWidth="4"
                  filter="url(#shadowGlow)"
                  strokeLinecap="round"
                />
                <line 
                  x1={`${origXY.x}%`} 
                  y1={`${origXY.y}%`} 
                  x2={`${destXY.x}%`} 
                  y2={`${destXY.y}%`} 
                  stroke="#FFF"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                  className="animate-pulse"
                />
              </>
            );
          })()}
        </svg>
      )}

      {/* Markers Container */}
      {/* 1. Standard Marker list registered through context */}
      {ctx.markers.map(m => {
        const xy = projectLatLng(m.lat, m.lng);
        return (
          <div 
            key={m.id} 
            className="absolute transition-all duration-300"
            style={{ left: `${xy.x}%`, top: `${xy.y}%`, transform: 'translate(-50%, -50%)', zIndex: 100 }}
          >
            {m.iconUrl ? (
              <img src={m.iconUrl} alt="Marker" className="w-8 h-8 pointer-events-none drop-shadow-lg" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
        );
      })}

      {/* Context children rendered (Marker portals, etc.) */}
      {children}

      {/* Coordinate telemetry logs - pure futuristic look */}
      <div className="absolute bottom-3 left-4 pointer-events-none font-mono text-[7px] text-white/40 tracking-widest flex items-center gap-2 select-none">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
        <span>SIMULATED GPS ONLINE</span>
        <span>•</span>
        <span>CTR: {mapCenter.lat.toFixed(4)}N, {mapCenter.lng.toFixed(4)}E</span>
      </div>

      <div className="absolute top-3 right-4 bg-black/60 border border-white/5 backdrop-blur-md px-2 py-1 rounded-md text-[8px] font-bold text-white/50 tracking-wider pointer-events-none">
        SIMULATED CORRIDOR VIEW
      </div>
    </div>
  );
}

// Marker component drop-in
export function Marker({ id, position, icon, options, ...props }: any) {
  const ctx = useContext(SimulatedMapContext);
  const markerIdRef = useRef(id || Math.random().toString());

  // Detect real Google Maps usage
  const isRealMap = useContext(APIKeyValidContext);
  let hasRealGoogleMap = false;
  if (isRealMap) {
    try {
      const realContext = GoogleMapsRealLibrary.useMap();
      if (realContext) hasRealGoogleMap = true;
    } catch (e) {}
  }

  useEffect(() => {
    if (!hasRealGoogleMap && position) {
      ctx.registerMarker(markerIdRef.current, position.lat, position.lng, icon);
    }
    return () => {
      if (!hasRealGoogleMap) {
        ctx.unregisterMarker(markerIdRef.current);
      }
    };
  }, [position, icon, hasRealGoogleMap]);

  if (hasRealGoogleMap) {
    return <GoogleMapsRealLibrary.Marker position={position} icon={icon} options={options} {...props} />;
  }

  return null;
}

// React hooks mimics
export function useMap(): any {
  const isRealMap = useContext(APIKeyValidContext);
  if (isRealMap) {
    try {
      const realMap = GoogleMapsRealLibrary.useMap();
      if (realMap) return realMap;
    } catch (e) {}
  }

  // Safe dummy fallback map controller
  return {
    fitBounds: () => {},
    setCenter: () => {},
    setZoom: () => {},
    panTo: () => {},
  };
}

export function useMapsLibrary(name: string): any {
  const isRealMap = useContext(APIKeyValidContext);
  
  // Memoize dummy libraries to prevent reference changes on every render
  const dummyGeocoding = useRef({
    Geocoder: class {
      geocode({ address, location }: any, cb?: any) {
        if (cb) {
          cb([{ geometry: { location: { lat: () => 25.8500, lng: () => 85.7800 } }, formatted_address: "Simulated Location" }], 'OK');
        }
        return Promise.resolve({
          results: [{ geometry: { location: { lat: 25.85, lng: 85.78 } }, formatted_address: "Simulated Location" }]
        });
      }
    }
  });

  const dummyRoutes = useRef({
    DirectionsService: class {
      route(request: any, callback: any) {
        callback({
          routes: [{
            legs: [{ distance: { value: 5000 }, duration: { value: 600 } }]
          }]
        }, 'OK');
      }
    },
    DirectionsRenderer: class {
      setMap() {}
      setDirections() {}
    }
  });

  if (isRealMap) {
    try {
      const realLib = GoogleMapsRealLibrary.useMapsLibrary(name as any);
      if (realLib) return realLib as any;
    } catch (e) {}
  }

  // Dummy mock library to prevent undefined method crashes
  if (name === 'geocoding') {
    return dummyGeocoding.current;
  }
  if (name === 'routes') {
    return dummyRoutes.current;
  }
  return null;
}

// Component to ensure completely smooth hardware-accelerated map camera tracking like Uber
export function MapCameraHandler({ center, bounds }: { center: google.maps.LatLngLiteral | null; bounds?: google.maps.LatLngBounds | null }) {
  const map = useMap();
  const isRealMap = useContext(APIKeyValidContext);

  useEffect(() => {
    if (!map) return;
    
    // For smooth panning when the object updates (live tracking)
    if (center && isRealMap) {
      if (typeof map.panTo === 'function') {
        map.panTo(center);
      }
    }
  }, [center, map, isRealMap]);

  return null;
}
// Drop-in wrapper component to support RouteDisplay in MapFeatures
export function SimulatedRouteDisplay({ origin, destination }: any) {
  const ctx = useContext(SimulatedMapContext);
  useEffect(() => {
    if (origin && destination) {
      ctx.setRoutePoints(origin, destination);
    }
    return () => {
      ctx.setRoutePoints(null, null);
    };
  }, [origin, destination]);

  return null;
}
