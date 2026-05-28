# PHASE 3: Scalable Backend Architecture - RAPDO Super App

## 1. Core Technology Stack

* **Runtime:** Node.js (Express framework) optimized for async I/O.
* **Primary Database (ACID/Relational):** PostgreSQL (managed via Google Cloud SQL). Uses the **PostGIS** extension for deep spatial queries (e.g., finding nearby captains based on historical data).
* **Real-time State & Tracking:** Firebase Firestore (for active ride states) and WebSockets (Socket.io) for high-frequency location pinging.
* **Authentication:** Firebase Auth (Phone OTP).
* **Location Intelligence:** Google Maps Platform (Directions API, Places API, Distance Matrix API, Snap to Roads).
* **AI Layer:** Google AI Studio REST APIs (Gemini models).

---

## 2. Server Architecture Blueprint

A **Modular Monolith** architecture is highly recommended for the Tier-2 startup phase to reduce DevOps overhead, shifting to Microservices dynamically when demand peaks across multiple cities.

```text
[ Rider & Captain Apps ] 
         │ (HTTPS / WSS)
         ▼
[ GCP Load Balancer / Nginx ]
         │
    +----▼----+
    | Express | <---> [ Firebase Auth ]
    | Server  | <---> [ Google Maps API ]
    | (Node)  | <---> [ Gemini AI / Studio ]
    +----+----+
         │
 +-------+-------+
 │               │
 ▼               ▼
[ PostGIS ] [ Firestore / Realtime DB ]
(PostgreSQL)    (Firebase)
```

---

## 3. Database Strategy: The Hybrid Approach

To achieve high scale with low cloud costs, RAPDO splits data between PostgreSQL and Firestore.

### A. PostgreSQL (The Source of Truth)
Handles billing, historical data, wallets, and static user profiles.

**Schema Concepts:**
* `users` (id, phone, role, created_at, wallet_balance, rating)
* `captain_profiles` (id, user_id, vehicle_type, license_no, approval_status, subscription_status)
* `rides` (id, rider_id, captain_id, pickup_geom, drop_geom, status, total_fare, distance_km, ai_surge_multiplier, created_at)
* `transactions` (id, user_id, amount, type, reference, timestamp)

### B. Firestore (The Live State Layer)
Handles transient data that changes every second. Once a ride completes, data is archived back to PostgreSQL and deleted from Firestore.

**Collections:**
* `active_rides/{rideId}`
  * Contains fields: `status (searching, accepted, en_route, completed)`, `assigned_captain_id`, `otp`, `live_eta`.
  * **Benefit:** Rider app listens to this document natively. No need to stress the Node server for polling.
* `active_captains/{captainId}`
  * Contains fields: `geohash`, `lat`, `lng`, `heading`, `is_available`.

---

## 4. API & WebSocket Structure

### REST APIs (HTTP) - Low frequency actions
* **Auth & Profile:**
  * `POST /api/v1/auth/verify-token` (Validates Firebase token, creates Postgres User).
  * `GET /api/v1/users/profile`
* **Ride Booking (Rider):**
  * `POST /api/v1/rides/estimate` (Calls Google Dist Matrix + Gemini AI Surge predictor).
  * `POST /api/v1/rides/request` (Creates entry in DB, triggers Dispatch mechanism).
  * `GET /api/v1/rides/history`
* **Logistics / Parcel (B2B/Rider):**
  * `POST /api/v1/logistics/create` (Similar to ride, but handles weight/category metadata).
* **Captain:**
  * `POST /api/v1/captain/status` (Toggle Online/Offline).
  * `POST /api/v1/captain/rides/:id/accept`

### WebSocket (Socket.io) - High frequency actions
WebSockets are utilized for ultra-low latency GPS streaming from the Captain's device to the server, bypassing HTTP overhead.

* **Event: `ping_location` (Captain -> Server)**
  * Payload: `{ lat, lng, speed, heading, timestamp }`
  * Action: Server updates Redis/Firestore geospatial index. 
* **Event: `ride_offer` (Server -> Captain)**
  * Payload: `{ pickup, drop, fare, distance_to_pickup }`
* **Event: `captain_location` (Server -> Rider)**
  * Used if Firestore snapshot listeners are deemed too heavy for simple dot movement.

---

## 5. Offline Data Synchronization (Crucial for Tier-2 Networks)

Indian Tier-2 networks frequently drop to Edge or 3G levels. The backend must trust delayed incoming data with conflict resolution.

**The "Buffering" Logic:**
1. Captain's phone loses network mid-ride.
2. Flutter app stores GPS coordinates locally in an SQLite buffer every 3 seconds.
3. Network returns.
4. Flutter app calls `POST /api/v1/sync/trajectory` with an array of coordinates over the offline period.
5. Node.js backend calls **Google Maps Snap-to-Roads API** to rebuild the exact route taken to accurately calculate the distance-based fare, preventing captain earnings loss.

---

## 6. AI & Map API Orchestration

**The Dispatch Workflow:**
1. Node receives `Ride Request`.
2. Node queries `active_captains` in Firestore (using Geohash queries) for available bikes within a 1.5km radius.
3. Node batches the top 5 candidates and sends them to **Gemini API** alongside context: 
  * "Candidate A accepts 90% of rides but is 5 mins away in traffic."
  * "Candidate B accepts 40% of rides but is 1 min away."
4. Gemini returns the optimal candidate order.
5. Server sends `ride_offer` WebSocket event to the optimal Captain.
