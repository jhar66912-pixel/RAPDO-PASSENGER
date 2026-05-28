# RAPDO Enterprise Ecosystem Architecture 🚀

## Overview
RAPDO is a premium, scalable, AI-ready hyperlocal mobility and logistics startup ecosystem built for Bihar, India. Operating in low-network conditions with weak devices, the platform requires a fault-tolerant, highly optimized architecture using clean separations of concern.

---

## 1. High-Level System Architecture

The architecture is divided into the following isolated systems:

1. **User App (Flutter/React Web)**: Premium customer interface for booking bike taxis and parcels.
2. **Captain App (Flutter)**: Optimized agent interface for routing, earnings, and trip lifecycle.
3. **Admin Dashboard (React/Next.js)**: Central command for dynamic pricing, KPIs, and monitoring.
4. **Logistics Panel (React/Next.js)**: B2B portal for SMB bulk bookings and scheduling.
5. **Backend Node.js Microservices Layer**: Scales horizontally via Google Cloud Run.
6. **Realtime Polling Engine**: Firebase Realtime Database (RTDB) ensuring low-latency event synchronization.
7. **AI & ML Pipeline**: BigQuery, Gemini models, andVertex AI for demand mapping and route logic.

---

## 2. User App Architecture (Flutter)

*Built using Feature-first Clean Architecture with Riverpod & GoRouter.*

\`\`\`
lib/
├── core/
│   ├── network/      # API clients, Interceptors
│   ├── theme/        # Premium Dark Mode, Typography, Glassmorphism
│   └── location/     # Geolocator, Permissions
├── shared/
│   └── widgets/      # Floating Cards, Custom Buttons, Status Rings
├── features/
│   ├── auth/         # Phone OTP, JWT logic
│   ├── home/         # AI Recommendations, MapView
│   ├── ride/         # Booking flow, Pricing engine, Live tracking
│   ├── parcel/       # Hyperlocal logistics
│   └── wallet/       # Wallet updates & Razorpay SDK
└── main.dart
\`\`\`
- **State Management**: Riverpod for reactive UI updates off Firebase streams.
- **Maps**: `google_maps_flutter` with custom Canvas pulsing markers.
- **Offline Modes**: Using `hive` for persistent KV storage of search history.

---

## 3. Captain App Architecture (Flutter)

Designed specifically for low battery consumption and weak GPS connectivity.

- **Background Services**: Dart isolates for continuous RTDB publishing while the screen is off.
- **Offline Caching**: Sync local trip transitions and publish when connection resumes.
- **Modules**:
  - `earnings/`: Daily/weekly target charting.
  - `navigation/`: Distance Matrix & Polyline generation.
  - `documents/`: KYC and background check management.

---

## 4. Admin Panel & Logistics Architecture

*Tech Stack: React / Next.js / Tailwind CSS / Recharts / Shadcn UI*

**Admin Features**:
- **Fraud Monitoring**: Suspicious rider grouping.
- **Surge Control Engine**: Geofence-based multiplier overrides.
- **Support CRM**: Ticket threading.

**B2B Logistics Panel**:
- Bulk CSV order uploads.
- Consolidated invoice generation.
- Dispatch tracking table.

---

## 5. Backend Microservices Structure

Deployed on Google Cloud Run utilizing Node.js/Express, guarded by API Gateway.

\`\`\`
services/
├── auth-service/        # JWT issuing & Firebase Auth custom claims
├── matching-service/    # KD-Tree based Captain dispatching (Geo hashing)
├── trip-service/        # Ledger for ride lifecycle steps
├── payment-service/     # Razorpay webhooks & wallet ledger constraints
└── ai-service/          # Demand surge forecasts
\`\`\`

---

## 6. Database Schema (Firestore + RTDB)

*Firestore for State, RTDB for Streams.*
- **Users**: `{ uid, phone, role, walletBalance, pushToken }`
- **Captains**: `{ uid, isOnline, vehicleNum, locationPoint, kycStatus }`
- **Bookings**: `{ id, status, pickup[lat/lng], drop[lat/lng], cost, driverId, routePolyline }`
- **RTDB Live Tracks**: `/tracking/{bookingId} -> { lat, lng, bearing, speed }`
- **Ledgers**: Secure sub-collections tracking `{ amount, type(debit/credit), timestamp }`.

---

## 7. Realtime Tracking Infrastructure
1. Captain GPS writes stream to RTDB `/captains_active/{uid}`.
2. Geofire queries retrieve nearest captains for dispatch via Cloud Functions.
3. Once accepted, captain writes to `/tracking/{bookingId}` at 3-second intervals.
4. User App listens directly to RTDB node for sub-100ms UI interpolation.

---

## 8. Google Maps Architecture
- **Places Autocomplete**: Optimizing via session tokens to minimize billing.
- **Directions API**: Client-side polyline rendering to reduce server payload.
- **Distance Matrix**: Computed centrally by the Trip Service to quote fares.

---

## 9. Payments & Wallet System
- **Razorpay Integration**: Tokenized payment setups.
- **Wallet Engine**: ACID compliant Firestore transaction blocks ensure no double-spending.
- **Ledger Model**: Append-only log for all top-ups, partial payments, and trip deductions.

---

## 10. AI & Machine Learning Layer (Gemini + Vertex AI)
- **Surge Prediction**: Rolling averages of booking requests vs distinct active captains per Geohash 6 area.
- **Smart Dispatch**: Bounding box expansion algorithm using machine learning weights (traffic vs distance).
- **ETA Optimization**: Calibrating Google's ETA against historical BIHAR road friction data.

---

## 11. Security & Compliance
- **App Check**: Prevents non-legitimate API access (Firebase App Check + Play Integrity).
- **Role-based Access**: Custom claims enforcing `request.auth.token.role == 'admin'` in backend.
- **GPS Spoofing**: Time/Distance ratio validation in Cloud Functions to detect mock locations.

---

## 12. Deployment & CI/CD Pipeline
- **Code Repository**: GitHub / GitLab.
- **CI/CD**: GitHub Actions building Docker artifacts.
- **Registry**: Google Artifact Registry.
- **Infrastructure**: Terraform scaling Cloud Run container instances.
- **Monitoring**: Datadog or Google Cloud Error Reporting.

---

## 13. Calendar Integration Strategy
As per the user request, RAPDO implements **Google Calendar Integration** allowing users to:
1. Schedule future rides directly inside their Google Calendar.
2. Receive automatic booking-dispatch flows based on calendar event timing (e.g. "Flight at 4 PM" schedules a bike at 1:30 PM).
3. The platform requests `calendar.events` scope via Firebase Auth OAuthProvider and stores access tokens for scheduled task execution.

---

*Architected for dominance in Tier-2 and Tier-3 Indian cities.*
