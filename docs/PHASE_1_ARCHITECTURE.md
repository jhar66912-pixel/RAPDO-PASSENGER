# PHASE 1: Complete System Architecture - RAPDO Super App

## 1. High-Level System Architecture
RAPDO utilizes a hybrid database approach (NoSQL + Relational) to handle high-frequency real-time spatial data (captian locations, active ride states) alongside robust ACID-compliant financial and historical records.

### Diagrammatic Flow
```text
[ Rider App (Flutter) ] <---> [ Firebase Auth (OTP) & FCM (Push) ]
         ^
         | (REST / WebSockets)
         v
[ API Gateway / Cloud Run (Node.js) ] <---> [ Gemini API (AI Studio) ]
         ^
         |
    +----+----+----+----+----+
    |         |         |    |
[Dispatch] [Pricing] [User] [Payment] (Core Micro-services/Monolith)
    |         |         |    |
    v         v         v    v
[ Firestore / Realtime DB ]  [ PostgreSQL (Cloud SQL) ]
(Live Tracking / Ride State) (Billing, History, Profiles)
```

## 2. Component Blueprint

### A. Frontend Tier (Mobile Edge)
*   **Rider App (Flutter):** Lightweight APK (<25MB). Features offline map caching, voice-to-text booking, and Razorpay SDK.
*   **Captain App (Flutter):** Optimized for low battery/data usage. Uses background location tracking and local Hive/Isar DB for buffering GPS data during network drops.
*   **Web Admin (React.js):** Operational control panel for monitoring ride metrics, resolving disputes, and managing Captain KYC.

### B. Application Tier (Node.js backend)
Deployed on **Google Cloud Run** for auto-scaling from 0 to N based on regional Tier-2 demand spikes (e.g., college closing hours).
*   **Authentication Service:** Verifies Firebase Auth tokens, manages JWTs for API access.
*   **Dispatch Engine:** Handles the matching algorithm. Uses PostGIS (PostgreSQL extension) for initial radius search, then pipes candidates to the Gemini API for contextual selection.
*   **Ride State Machine:** Manages trip lifecycles (Requested -> Accepted -> Arrived -> Started -> Completed/Cancelled). State mutations are written to PostgreSQL and mirrored to Firestore for real-time app listeners.
*   **Pricing Service:** Calculates base fares via Google Maps Distance Matrix, adds AI-predicted surge variables, and interfaces with Razorpay for payment captures.

### C. Data & Storage Tier
*   **Primary Relational Database (PostgreSQL / Cloud SQL):**
    *   `Users` (Riders & Captains KYC).
    *   `Rides` (Historical log, final fare, route polygons).
    *   `Transactions` (Wallet balances, commission ledger).
*   **Real-Time Database (Firebase Firestore):**
    *   `active_rides/{rideId}`: Listened to by both Rider and Captain for instant state updates.
    *   `captain_locations/{captainId}`: Geohashed live coordinates updated every 5 seconds.
*   **Offline Cache (Hive/Isar on Device):**
    *   Caches ongoing ride state so if the app restarts or loses network, the state is recovered instantly locally before syncing.

### D. AI & External Integration Tier
*   **Google AI Studio (Gemini API):**
    *   *Prompt 1 (Dispatch):* Evaluates ETA, Captain history, and traffic to pick the optimal driver.
    *   *Prompt 2 (NLP):* Voice request parsing (Hindi -> Actionable JSON intent).
*   **Google Maps Platform:** Address validation, Routes API for ETA, Places API for autocomplete.
*   **Razorpay Engine:** Handles UPI intents directly, Captain payout routing, and automated subscription deductions.

## 3. Scalability & Security Foundations

*   **Idempotency Keys:** All transactional requests (booking a ride, payments) use idempotency headers to prevent double-charging on flaky 3G/4G networks.
*   **Background GPS Buffering:** Captain app stores GPS pings in a local SQLite/Hive queue if the network fails. Once the internet returns, it bulk-uploads the trajectory to the backend to accurately calculate distance-based fares.
*   **Geo-Fencing:** The backend uses GeoJSON polygons to restrict ride requests exclusively to operational Tier-2 cities, preventing out-of-bounds service requests.
*   **Tiered API Rate Limiting:** Prevents API abuse and DDoS attacks, crucial for maintaining low infrastructure costs.
