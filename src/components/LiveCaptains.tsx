import { useEffect, useState } from 'react';
import { Marker } from './SmartMapView';

const INITIAL_CAPTAINS = [
   { id: 1, lat: 25.7796, lng: 84.7499, heading: 0, status: 'online' },
   { id: 2, lat: 25.7820, lng: 84.7550, heading: 90, status: 'busy' },
   { id: 3, lat: 25.7750, lng: 84.7400, heading: 45, status: 'online' },
   { id: 4, lat: 25.7710, lng: 84.7450, heading: 180, status: 'offline' },
];

export function LiveCaptains() {
    const [captains, setCaptains] = useState(INITIAL_CAPTAINS);

    useEffect(() => {
        const interval = setInterval(() => {
            setCaptains(prev => prev.map(cap => {
                if (cap.status === 'offline') return cap;

                // Randomly change heading
                const headingChange = (Math.random() - 0.5) * 30; // -15 to +15 deg
                const newHeading = (cap.heading + headingChange) % 360;
                
                // Move forward by small delta based on heading
                const speed = cap.status === 'online' ? 0.0001 : 0.00005; // lat/lng delta
                const dLat = Math.cos(newHeading * (Math.PI / 180)) * speed;
                const dLng = Math.sin(newHeading * (Math.PI / 180)) * speed;
                
                return {
                    ...cap,
                    lat: cap.lat + dLat,
                    lng: cap.lng + dLng,
                    heading: newHeading
                };
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
           {captains.map(cap => {
              if (cap.status === 'offline') return null;
              
              const strokeColor = cap.status === 'online' ? '#FFD000' : '#3B82F6';
              // Determine size based on status to simulate "pulse" visually or just glowing feel via static SVG
              const svg = `
                 <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                   <circle cx="24" cy="24" r="22" fill="#121212" stroke="${strokeColor}" stroke-width="4"/>
                   <g transform="rotate(${cap.heading} 24 24)">
                     <text x="24" y="32" font-size="24" text-anchor="middle">🏍️</text>
                   </g>
                 </svg>
              `;
              const iconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

              return (
                <Marker key={cap.id} position={{ lat: cap.lat, lng: cap.lng }} icon={iconUrl} />
              );
           })}
        </>
    );
}
