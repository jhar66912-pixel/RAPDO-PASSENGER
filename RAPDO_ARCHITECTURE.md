# RAPDO - Production Architecture & Implementation Plan

## 1. Project Architecture (Tech Stack)
- **Frontend Framework**: React 18+ (using Vite for lightning-fast builds)
- **Language**: TypeScript (for strict typing and safety)
- **Styling**: Tailwind CSS v4 + PostCSS (Matte Black & Premium Yellow custom theme)
- **3D & Rendering**: Three.js, React Three Fiber (@react-three/fiber), Drei (@react-three/drei)
- **Animation**: Framer Motion (Fluid UI transitions), GSAP (Advanced timelines, scroll effects)
- **Backend/BaaS**: Firebase (Authentication, Firestore, Cloud Messaging)
- **Location Services**: Google Maps Platform (Maps JavaScript API, Places API, Routes API, Geocoding API)
- **State Management**: React Context (Global), Zustand (Complex flow state)

## 2. Recommended Folder Structure
```text
/
├── public/                 # Static assets, 3D models (.glb), textures, PWA icons
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── 3d/             # Three.js / R3F (Bike3D, CityEnv, Holograms)
│   │   ├── layout/         # Navigation, Global Headers, Bottom Sheets
│   │   ├── ui/             # Buttons, Inputs, Cards, Loaders, Modals
│   │   └── maps/           # Google Maps wrappers, LiveCaptains, RouteLines
│   ├── pages/              # Route entry points
│   │   ├── Auth/           # Login, OTP Verification
│   │   ├── Passenger/      # Home, Booking, Parcel, Safety, Wallet
│   │   └── Captain/        # Earnings, Dashboard, RideRequests
│   ├── lib/                # Third-party integrations
│   │   ├── firebase.ts     # Firebase config & initialization
│   │   ├── auth.ts         # Authentication hooks
│   │   ├── maps.ts         # Google Maps loader / helpers
│   │   └── notifications.ts# Firebase Cloud Messaging
│   ├── hooks/              # Custom hooks (useGeolocation, useRideState)
│   ├── store/              # Zustand global states (useBookingStore)
│   ├── types/              # TypeScript interfaces (User, Ride, Parcel)
│   ├── utils/              # Helper functions (fareCalculator, formatters)
│   ├── App.tsx             # Root component, Routing definition
│   └── index.css           # Global Tailwind and font imports
├── package.json            # Dependencies and scripts
└── tailwind.config.ts      # Theme extensions
```

## 3. Database Schema (Firebase Firestore)

### `users` Collection
- `uid`: String (Primary Key)
- `phone`: String
- `name`: String
- `role`: 'passenger' | 'captain'
- `walletBalance`: Number
- `rating`: Number
- `createdAt`: Timestamp

### `captains` Collection
- `uid`: String (References `users`)
- `status`: 'online' | 'offline' | 'on_ride'
- `currentLocation`: GeoPoint (Live updates)
- `vehicleDetails`: Object (plate, model, color)
- `kycStatus`: 'pending' | 'verified'

### `rides` Collection
- `rideId`: String
- `passengerId`: String
- `captainId`: String (Nullable)
- `pickup`: Object (lat, lng, address)
- `dropoff`: Object (lat, lng, address)
- `serviceType`: 'bike' | 'parcel' | 'b2b'
- `status`: 'searching' | 'accepted' | 'arriving' | 'in_progress' | 'completed' | 'cancelled'
- `fare`: Object (base: 20, extra: X, discount: Y, finalFare: Z)
- `distanceKm`: Number
- `etaMins`: Number
- `timestamps`: Object (created, accepted, completed)

### `transactions` Collection
- `txId`: String
- `userId`: String
- `amount`: Number
- `type`: 'credit' | 'debit'
- `description`: String
- `timestamp`: Timestamp

## 4. State Management (Zustand + Context)
1. **AuthContext**: Manages `currentUser`, `loading`, `signIn`, `signOut`.
2. **BookingStore (Zustand)**:
   - Evaluates `pickup`, `dropoff`, `distance`, `eta`, `fare` securely.
   - Selected mode: 'bike' | 'parcel' | 'b2b'.
   - Fare Logic: `Base (First 3 KM) = ₹20`, `Extra = ₹8/KM`.
3. **MapStore**:
   - Manages global `currentLocation` and active nearby `captains`.

## 5. API Structure & Serverless Functions
- **Fare Estimation**: Calculated locally for speed, re-verified via Cloud Functions upon booking creation to prevent tampering.
- **Matchmaking (Cloud Function)**: Triggers on `rides` creation. Queries nearby `captains` (status='online') within a 3km radius. Dispatches FCM push notifications.
- **Geolocation Syncing**: Captain app updates its `currentLocation` in Firestore periodically (real-time listeners on passenger side update the map).
- **Secure Transactions**: Cloud Functions exclusively handle `walletBalance` increments/decrements to enforce ACID compliance.

## 6. Performance Optimization Targets
- **60 FPS Rendering**: Utilize `dpr={[1, 1.5]}` in React Three Fiber to cap pixel density on ultra-high-res screens. Cull unseen objects using `frustumCulled`.
- **Preloading & Lazy Loading**: Use `React.lazy` and `Suspense` for heavy 3D assets and MAP components. The generic UI loads instantly, secondary assets load progressively.
- **GPU Acceleration**: Strictly restrict component layout animations (width, height, top). Use Framer Motion's `transform` and `opacity` for hardware-accelerated composite layers.
- **Asset Compression**: Serve 3D models exclusively as Draco-compressed `.glb`. Compress PBR textures using WEBP or KTX2 format.

## 7. Security Architecture
- **Firestore Rules**: Lock down `rides` to passenger mapping and assigned captain mapping. Validate all writes against schema structures.
- **Maps API Quota Security**: Restrict Google API Keys to the production URL (`HTTP Referrers`). Apply billing alerts.
- **Input Sanitization**: Client-side coordinate validation ensuring requests strictly fall within Bihar territory boundaries (geofencing).

## 8. Deployment Strategy
- **Phase 1: Alpha**: Initial deployment to Firebase Hosting or Google Cloud Run for internal closed testing (Patna, Samastipur).
- **Phase 2: Beta PWA**: Launch as an installable Progressive Web App (PWA). Includes offline-first caching for static logic.
- **Phase 3: Native Wrappers**: Export the highly optimized web build into Capacitor.js or React Native Webview for Play Store deployment targeting low-end Androids.

## 9. Development Roadmap
- **Sprint 1**: Setup project, implement Matte Black & Premium Yellow design system, routing, auth flows.
- **Sprint 2**: Google Maps configuration, Live View tracking, Route calculations, Places Autocomplete.
- **Sprint 3**: Booking Engine, Pricing logic (First 3km = ₹20, Extra = ₹8/km), Firestore Database connections.
- **Sprint 4**: Captain application flow, background geolocation reporting, real-time ride matching logic.
- **Sprint 5**: Integration of Cinematic 3D loaders, Scene polishing, Sound Design, WebGL optimization.
