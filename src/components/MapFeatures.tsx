import { useEffect, useRef } from 'react';
import { useMap, useMapsLibrary, SimulatedRouteDisplay } from './SmartMapView';

export function RouteDisplay({ origin, destination }: {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  // If routes library is dummy or missing, render simulated neon visual line
  const isDummyMap = !routesLib || !map || (map && typeof map.fitBounds === 'function' && map.fitBounds.toString().includes('() => {}'));

  useEffect(() => {
    if (isDummyMap || !routesLib || !map || !origin || !destination) return;
    
    // Clear previous route
    polylinesRef.current.forEach(p => p.setMap(null));

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        // High-end glowing yellow route
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach(p => {
           p.setOptions({
              strokeColor: '#FFD000',
              strokeOpacity: 0.8,
              strokeWeight: 6,
              zIndex: 50,
           });
           p.setMap(map);
        });
        
        // Add a subtle wider darker line underneath for glow/contrast
        const glowPolylines = routes[0].createPolylines();
        glowPolylines.forEach(p => {
           p.setOptions({
              strokeColor: '#FFA500',
              strokeOpacity: 0.3,
              strokeWeight: 14,
              zIndex: 49,
           });
           p.setMap(map);
        });

        polylinesRef.current = [...newPolylines, ...glowPolylines];
        if (routes[0].viewport) map.fitBounds(routes[0].viewport);
      }
    });

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [isDummyMap, routesLib, map, origin, destination]);

  if (isDummyMap) {
    return <SimulatedRouteDisplay origin={origin} destination={destination} />;
  }

  return null;
}
