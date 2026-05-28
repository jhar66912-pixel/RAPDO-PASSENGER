import { useEffect, useRef } from 'react';
import { useMap, useMapsLibrary, SimulatedRouteDisplay } from './SmartMapView';

export function RouteDisplay({ origin, destination }: {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const dirRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  // If routes library is dummy or missing, render simulated neon visual line
  const isDummyMap = !routesLib || !map || (map && typeof map.fitBounds === 'function' && map.fitBounds.toString().includes('() => {}'));

  useEffect(() => {
    if (isDummyMap || !routesLib || !map || !origin || !destination) return;
    
    // Clear previous
    if (dirRendererRef.current) {
      dirRendererRef.current.setMap(null);
    }

    const { DirectionsService, DirectionsRenderer } = routesLib;
    if (!DirectionsService || !DirectionsRenderer) return;

    const directionsService = new DirectionsService();
    const directionsRenderer = new DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: false,
      polylineOptions: {
        strokeColor: "#FFC107",
        strokeOpacity: 0.9,
        strokeWeight: 5,
        zIndex: 50,
      }
    });
    
    dirRendererRef.current = directionsRenderer;

    directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING
    }, (result: any, status: any) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRenderer.setDirections(result);
        
        // Add animated polyline glow effect by using an overlay or shadow, but DirectionsRenderer is simple
        // To make it look ultra tech, we could just stick with a sleek yellow #FFC107 path
      }
    });

    return () => {
      if (dirRendererRef.current) {
        dirRendererRef.current.setMap(null);
      }
    };
  }, [isDummyMap, routesLib, map, origin, destination]);

  if (isDummyMap) {
    return <SimulatedRouteDisplay origin={origin} destination={destination} />;
  }

  return null;
}
