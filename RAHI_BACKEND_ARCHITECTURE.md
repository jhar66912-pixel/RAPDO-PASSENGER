# RAHI Backend Architecture 🚀

## Overview
The RAHI backend architecture is designed as a scalable, real-time, serverless infrastructure utilizing Firebase and Node.js. It perfectly serves a hyperlocal mobility and logistics startup ecosystem running primarily on mobile apps while ensuring low-latency tracking, secure payments, and fault transparency.

## Technology Stack 🛠
- **Auth**: Firebase Authentication (Phone, Google Sign-In)
- **Database**: Firebase Firestore (NoSQL, scale-out, real-time)
- **Live Location Engine**: Firebase Realtime Database (RTDB) / Firestore real-time listeners for captain polling.
- **Backend Servicing**: Cloud Functions for Firebase / Google Cloud Run (Node.js/Express)
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Storage**: Firebase Cloud Storage (Delivery Proofs, Profile Avatars, KYC)
- **Payments**: Razorpay Gateway Integration

---

## 1. Authentication & Roles 🔐
Firebase Auth utilizes JWT verification across the platform.

### Supported Roles (Custom Claims)
*   **User/Customer**: Can book rides and parcels.
*   **Captain/Rider**: Allowed to accept rides online, needs KYC verification flag to be true before unlocking earnings dashboard.
*   **Admin**: Total system administration, overrides, surge control.

---

## 2. Directory & Flutter Integration Structure 📁
We adopt a clean architectural pattern (e.g. BLoC / Riverpod) focusing firmly on Separation of Concerns.

```
lib/
├── data/
│   ├── models/ (Firebase JSON serialization)
│   ├── repositories/ (Interface for DB calls)
│   └── network/ (Retrofit/Dio for Custom Node.js APIs)
├── domain/
│   ├── entities/ 
│   └── usecases/ 
├── presentation/
│   ├── screens/ 
│   ├── widgets/ (Map features, Ride Cards)
│   └── state/ (Bloc / Riverpod Providers)
├── core/
│   ├── location/ (Geolocator integration)
│   ├── maps/ (Google Maps UI setup & Route Polylines)
│   ├── push/ (FCM Notification Setup)
│   └── env/ (Firebase configuration keys)
└── main.dart
```

---

## 3. Core Database Architecture (Firestore) 🗄

### `users` (Collection)
- `name`, `mobile`, `walletBalance`
- Real-time ride status monitoring mapping to `bookings/{id}`.

### `riders` (Collection)
- `currentLocation` (lat, lng GeoPoint for bounding queries)
- `isOnline`, `isVerified`
- Designed for querying via `geo_queries` or GeoFlutterFire.

### `bookings` (Collection)
- Captures ride lifecycle tracking: `searching -> accepted -> arriving -> started -> completed`
- **Parcel Extensions:** Optional fields for `status` (picked, in_transit, delivered) and `deliveryProofUrl`.

### `wallets` / `payments` (Collection)
- Secure ledger. Track sub-collections of type `deposits`, `withdrawals`, and `ride_deductions`.

---

## 4. Real-time Tracking Architecture 🛰
1. **Polylines & Snap-to-Road:** Handled via Google Maps Platform API (`Directions API`) inside the client to keep loads lightweight.
2. **Location Syncing Engine:** 
   - Captain app utilizes optimized background execution via `Geolocator` capturing points every 3-5s depending on battery mode.
   - Pushes to Firebase Realtime Database (preferable over Firestore because of high-frequency edits without document scaling costs) for extremely smooth animated `AdvancedMarkers`.
3. **Pulsing Markers**: Handled purely via CSS/Flutter Canvas animation without over-taxing backend.

---

## 5. Security Protocols 🛡
- **Location Spoofing:** Time-distance variance limits (detecting teleportation across maps).
- **Firestore Rules:** 
  - Customers can only read and write to **their own** bookings.
  - Riders can only update locations when `isVerified = true` and `isOnline = true`.
- **API Protection:** Admin API keys and Gateway configs are exclusively stored in Cloud Secret Manager.

## 6. AI & Machine Learning Readiness 🤖
- **ETA Optimization**: Syncing historical driving histories to BigQuery.
- **Smart Fares:** Analyzing localized supply/demand drops at temporal peaks (e.g., train station arrival times in Bihar).
- **Fraud Engine:** Logging all device events securely and building analytics clustering against generic emulators.

---
*Built for scale. Inspired by enterprise-grade mobility APIs.*
