import { useEffect, useState } from 'react';
import { Marker } from './SmartMapView';

// Coordinates centered around Patna, BR (25.5941, 85.1376)
const INITIAL_CAPTAINS = [
   { id: 1, lat: 25.5950, lng: 85.1380, heading: 45, status: 'online', type: 'bike', eta: '2 min' },
   { id: 2, lat: 25.5930, lng: 85.1370, heading: 120, status: 'busy', type: 'car' },
   { id: 3, lat: 25.5965, lng: 85.1395, heading: -30, status: 'online', type: 'bike', eta: '4 min' },
   { id: 4, lat: 25.5925, lng: 85.1400, heading: 180, status: 'online', type: 'auto', eta: '1 min' },
];

export function LiveCaptains() {
    const [captains, setCaptains] = useState(INITIAL_CAPTAINS);

    useEffect(() => {
        const interval = setInterval(() => {
            setCaptains(prev => prev.map(cap => {
                if (cap.status === 'offline') return cap;

                // Randomly change heading
                const headingChange = (Math.random() - 0.5) * 20; // smoother turns
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
              
              const strokeColor = cap.status === 'online' ? '#FFC107' : '#10B981';
              const iconEmoji = cap.type === 'bike' ? '🏍️' : cap.type === 'auto' ? '🛺' : '🚘';
              const etaBadge = cap.eta ? `
                 <g transform="translate(18, -12)">
                   <rect x="0" y="0" width="46" height="20" rx="10" fill="#0A0A0A" stroke="${strokeColor}" stroke-width="1.5" />
                   <text x="23" y="14" font-family="sans-serif" font-weight="bold" font-size="10" fill="white" text-anchor="middle">${cap.eta}</text>
                 </g>
              ` : '';

              // Futuristic glowing marker styling
              const svg = `
                 <svg width="100" height="100" viewBox="-20 -20 100 100" xmlns="http://www.w3.org/2000/svg">
                   <defs>
                     <filter id="glow-${cap.id}" x="-50%" y="-50%" width="200%" height="200%">
                       <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                       <feMerge>
                         <feMergeNode in="coloredBlur"/>
                         <feMergeNode in="SourceGraphic"/>
                       </feMerge>
                     </filter>
                   </defs>
                   
                   <!-- Glowing base aura -->
                   <circle cx="24" cy="24" r="16" fill="${strokeColor}" opacity="0.3" filter="url(#glow-${cap.id})" />
                   <circle cx="24" cy="24" r="22" fill="none" stroke="${strokeColor}" stroke-opacity="0.4" stroke-width="1" />
                   
                   <!-- Main vessel body -->
                   <circle cx="24" cy="24" r="14" fill="#121212" stroke="${strokeColor}" stroke-width="2"/>
                   
                   <!-- Rotation layer for heading -->
                   <g transform="rotate(${cap.heading} 24 24)">
                     <circle cx="24" cy="10" r="3" fill="#FFFFFF" /> <!-- Headlight indicator -->
                     <text x="24" y="30" font-size="16" text-anchor="middle">${iconEmoji}</text>
                   </g>
                   
                   <!-- ETA Badge -->
                   ${etaBadge}
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
