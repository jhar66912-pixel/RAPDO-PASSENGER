# PHASE 3: React Admin Dashboard Structure - RAPDO Super App

## 1. Dashboard Overview
The RAPDO Admin Dashboard is an operational control panel built in React.js. It manages the entire hyperlocal mobility and parcel delivery ecosystem for Tier-2 cities. High-contrast themes (Black/Yellow/White) are used for operational clarity.

### Core Modules
* **Ride Monitoring:** Live map view of all active trips and dispatch statuses.
* **Captain Analytics:** KYC approvals, earnings, ride acceptance rates, and offline status.
* **Parcel Management:** Tracking active logistics, B2B enterprise clients, and drop-offs.
* **Fraud Alerts:** AI-flagged anomalies (GPS spoofing, fake coupons).
* **Revenue Tracking:** Platform commission ledger, surge profitability, and Razorpay settlements.

---

## 2. Component Architecture

```text
src/
 ├── admin/
 │    ├── pages/
 │    │    ├── Dashboard.tsx          // Overview stats
 │    │    ├── LiveRides.tsx          // Interactive Google Map with live markers
 │    │    ├── CaptainsList.tsx       // Data table of drivers + KYC workflow
 │    │    ├── ParcelHub.tsx          // Logistics queue & routing 
 │    │    ├── FraudCenter.tsx        // AI flagged events
 │    │    └── Financials.tsx         // Revenue graphs & payouts
 │    ├── components/
 │    │    ├── MetricCard.tsx         // Reusable stat widgets
 │    │    ├── LiveMapWidget.tsx      // Embedded map view
 │    │    └── DataGrid.tsx           // Sortable, paginated tables
 │    └── services/
 │         ├── firebaseAdmin.ts       // Live state listener
 │         └── apiGrid.ts             // REST wrappers
```

---

## 3. UI/UX Philosophy
* **Dark Mode Default:** Reduces eye strain for ground operation teams monitoring screens 24/7.
* **Real-time Indicators:** WebSocket/Firestore driven flashing indicators for active alerts (SOS, Fraud).
* **Dense Data Grids:** Optimized for desktop viewing to see maximum captain/ride data without scrolling.

## 4. Operational Workflows

### A. AI Fraud Alert Workflow
1. The AI engine evaluates a trip (e.g., rider and driver devices move perfectly together before accepting).
2. The ride is appended to `FraudCenter` with a Gemini-generated reason (e.g., "78% probability of Captain-user collusion based on proximity pre-booking").
3. Admin clicks *Investigate* -> Dashboard pulls both users' history -> Admin clicks *Suspend Captain* or *Verify*.

### B. Captain Approval Workflow
1. Captain uploads Aadhaar/DL via app -> Lands in Admin Dashboard.
2. OCR validates text.
3. Admin performs manual matching check -> clicks *Approve*.
4. Platform sends push notification: "Badhai ho! Aapka account activate ho gaya hai."

### C. Live Ride Monitoring
* Utilizing Firebase snapshot listeners + Google Maps React SDK to render 100s of active bike markers on a single city-level map.
* Hovering over a marker shows Captain ID, current speed, and destination.
