# RAPDO Super App – AI-Native Product Architecture & Implementation Plan

Based on the RAPDO Super App PRD, here is the comprehensive, production-ready startup architecture and implementation plan.

## Vision Summary
RAPDO is an AI-native mobility and hyperlocal logistics ecosystem for Tier-2 and Tier-3 India. 
Key differentiators: Affordable, Fast, Localized, Trustworthy, Lightweight, Hindi-first, AI-driven.

---

## 1. Complete App Architecture

We recommend a **Clean Architecture** approach using Domain-Driven Design (DDD) to separate concerns.

### Tech Stack
*   **Mobile Apps (Rider & Captain):** Flutter (for cross-platform, single codebase, low memory footprint).
*   **Admin/B2B Web Dashboard:** React.js / Vite (PWA).
*   **Backend:** Node.js (Express server) for REST APIs + Firebase for Realtime Database & Auth.
*   **Database:** PostgreSQL (Cloud SQL) for relational data (billing, users, trips logging) + Firestore for live state (active tracking).
*   **AI Layer:** Google AI Studio / Gemini API (Dispatch, Support, Fraud).
*   **Maps:** Google Maps Platform (Geocoding, Routing, Places API).

### Clean Architecture Layers
1.  **Presentation Layer:** Flutter UI components, BLoC/Riverpod state management.
2.  **Domain Layer:** Core business logic (Pricing engines, ride state machines, parcel logic).
3.  **Data Layer:** Repositories, Firebase SDKs, API clients (Dio), Local Caching (Hive/Isar).

---

## 2. Flutter Frontend Structure & State Management

**State Management Recommendation:** **Riverpod** + **Freezed** (for immutable state and sealed classes). It provides excellent memory management and compile-time safety.
**Local Database:** **Isar** or **Hive** for offline state caching (Critical for low network areas).

### Flutter Folder Structure
```text
lib/
 ├── core/                   # Shared utilities, constants, theme, network client
 │    ├── theme/             # Premium Glassmorphism theme (Black, Yellow, Gold)
 │    ├── network/           # Dio interceptors, error handling
 │    ├── utils/             # Geolocation helpers, currency formatters
 │    └── ai/                # Gemini API integration service
 ├── features/               # Feature-based modular structure
 │    ├── auth/              # OTP, Firebase Auth, Profile
 │    ├── ride_booking/      # Map, Fare Estimate, Select Ride
 │    ├── logistics/         # Parcel delivery workflows
 │    ├── tracking/          # Live map tracking, safety SOS
 │    └── captain_earnings/  # Dashboards, heatmaps
 ├── shared_widgets/         # Reusable premium UI (Glass Cards, Animated Buttons)
 └── main.dart               # Entry point
```

---

## 3. Scalable API & Backend Architecture

We split the backend into microservices or a modular monolith (recommended for MVP).

### Backend Structure (Node.js/Express)
```text
src/
 ├── api/
 │    ├── controllers/       # Route handlers
 │    ├── middlewares/       # Auth (Firebase admin), Validation, Logging
 │    └── routes/            # Express routes
 ├── services/
 │    ├── matching.service.ts # Ride matching logic (Calls Gemini AI)
 │    ├── pricing.service.ts  # Dynamic surge & fare calculation
 │    └── payment.service.ts  # Razorpay integration
 ├── ai/
 │    ├── gemini.client.ts    # Google Gen AI SDK wrapper
 │    └── prompt_templates.ts # Structured prompts for fraud, dispatch, support
 ├── db/                      # Prisma (PostgreSQL) + Firestore Admin
 └── server.ts
```

---

## 4. Workflows & Core Logic

### Real-Time Ride Tracking Logic
1.  **Captain App:** Emits location `(lat, lng, heading)` every 3-5 seconds to Firestore `tracking/{tripId}` or Firebase Realtime Database.
2.  **Rider App:** Listens to Firestore snapshots for `tripId`. Animates marker movement using `flutter_map_math` or Google Maps interpolation.
3.  **Offline Buffering:** If the Captain loses network, locations are cached locally (Hive/Isar). When reconnected, a batch update is sent to adjust the route history and fare.

### Parcel Dispatch Logic (AI-Powered)
1.  **Batching:** When a new parcel is requested, the system searches active Captains within a 2km radius.
2.  **AI Evaluation:** Gemini evaluates `[Captain Route] + [New Parcel Destination] + [Current Traffic]`.
3.  **Assignment:** If the detour adds `< 15 mins`, it proposes a stacked delivery to the Captain to maximize earnings.

### AI Fraud Detection Logic
*   **Trigger:** Evaluated post-ride or asynchronously during anomalies.
*   **Input:** `[GPS Array, Expected Time vs Actual, Device ID, Promo Code Used]`.
*   **Gemini Prompt:** "Analyze this trip data for anomalies matching GPS spoofing or driver/rider collusion."
*   **Action:** Triggers manual review flag & pauses payouts if `Risk_Score > High`.

### AI Safety Monitoring
*   **Trigger:** If ETA is exceeded by 30%, or vehicle stops at non-traffic zones for > 3 mins.
*   **Action:** Automated Firebase Push Notification to Rider ("Are you safe?"). If no response in 1 min, escalate to admin & emergency contacts.

---

## PHASE 1: Full Product Architecture Outline

*   **Authentication:** Firebase Phone OTP.
*   **Database:** Firestore (Active Rides, Driver Locations) + PostgreSQL (Historical rides, wallets, ledgers).
*   **Payment Gateway:** Razorpay (UPI Intent flow, Auto-pay for Captain subscriptions).
*   **AI Engine:** Google AI Studio REST endpoints for dynamic analysis.

## PHASE 2: Premium UI/UX System (Flutter Implementation Details)

**Color Palette:**
*   Primary Black: `#0F0F0F`
*   Luxury Yellow: `#FFC107`
*   Soft White: `#FAFAFA`
*   Accent Gold: `#FFB300`

**UI Philosophy:** Glassmorphism, deep shadows, large tap targets for Tier-2 users.

*Example Flutter Glass Card Widget:*
```dart
Container(
  decoration: BoxDecoration(
    color: Colors.white.withOpacity(0.1),
    borderRadius: BorderRadius.circular(24),
    border: Border.all(color: Colors.white.withOpacity(0.2)),
    boxShadow: [
      BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 20, spreadRadius: -5)
    ],
  ),
  child: BackdropFilter(
    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
    child: Padding(
      padding: EdgeInsets.all(20),
      child: child,
    ),
  ),
)
```

## PHASE 3: Backend APIs (REST + Firestore)

**Core Endpoints:**
*   `POST /api/v1/rides/estimate`: Returns base fare + Gemini predicted surge.
*   `POST /api/v1/rides/request`: Creates ride in Postgres + Firestore `active_rides` collection.
*   `PATCH /api/v1/rides/:id/status`: Captain updates status (arrived, started, dropped).
*   `GET /api/v1/ai/support`: Connects Hindi user text to Gemini for automated intent resolution.

## PHASE 4: AI Integration Prompts

**1. Booking Intent / Voice Processing (Hindi/Hinglish)**
```text
System: "You are the RAPDO AI. Convert informal Hindi/Hinglish voice queries into strict JSON.
Input: 'Mahaveer Chowk se station jana hai.'
Output: { 'intent': 'book_ride', 'pickup': 'Mahaveer Chowk', 'drop': 'Station', 'vehicle': 'bike' }"
```

**2. Dispatch Optimization (Gemini)**
```text
System: "Evaluate Captain A and Captain B for Ride 102. 
Context: Captain A is 2 mins away but often cancels short trips. Captain B is 4 mins away, highly rated, and heading towards the drop zone for their home.
Output JSON with chosen_captain_id and reasoning."
```

## PHASE 5: Deployment Strategy

1.  **MVP (8-10 weeks):**
    *   Deploy Node.js backend to Google Cloud Run.
    *   Set up Firebase Firestore rules for secure multi-tenant access.
    *   Release Flutter App (Android Only initially for Tier-2) via Play Store.
2.  **Market Launch (Samastipur/Darbhanga):**
    *   Deploy College/Railway station offline marketing (Auto stickers, Flex).
    *   Activate WhatsApp Customer Support integrated via Gemini AI.
3.  **Scaling (Month 4+):**
    *   Migrate historical data pipelines from Postgres to BigQuery for advanced BI.
    *   Introduce Parcel/Logistics workflows utilizing idle Captains.

---
*Created by AI Studio Architectural Agent.*
