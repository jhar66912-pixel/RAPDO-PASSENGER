# PHASE 4: AI-Powered Dispatch & Logistics Engine

## 1. The RAPDO AI Dispatch Concept

Traditional ride-hailing platforms rely on a simple "nearest neighbor" algorithm (radial search based on Haversine distance). This often fails in Tier-2 Indian cities due to:

- Unpredictable local traffic (e.g., railway crossing closures).
- High cancellation rates when a driver doesn't want to go to a specific drop location.
- Underutilized captains who are returning empty from drop-offs.

**RAPDO's AI-Native Approach:**
We fetch a batch of nearby captains using PostGIS/Firestore, calculate real-world ETAs via Google Maps APIs, and feed this context array into the **Gemini API**. Gemini acts as the central intelligence to decide who _actually_ gets the ride, optimizing for human behavior, traffic, and earnings.

---

## 2. Architecture & Data Flow

```text
[ Rider Requests Bike/Parcel ]
         │ (lat, lng, destination)
         ▼
[ Firebase Active Request Queue ]
         │
         ▼
[ Stage 1: Geospatial Radius Match (PostGIS / Firestore Geohash) ]
   -- Returns Top 5-10 Captains within 2-3km.
         │
         ▼
[ Stage 2: Google Maps Enrichment ]
   -- Fetches Directions API array for actual ETA + Traffic conditions.
         │
         ▼
[ Stage 3: Captain Context Extraction (PostgreSQL) ]
   -- Fetches Captain Acceptance Rate, Current Shift Hours, and Home Location.
         │
         ▼
[ Stage 4: Google AI Studio (Gemini 1.5 Flash) ]
   -- Processes complex multi-variable JSON prompt.
         │
         ▼
[ Optimal Output: Array of Ordered Captain IDs ] -> Dispatches WebSockets.
```

---

## 3. Gemini API Prompt Design

This is the core prompt sent to the Gemini model to decide the optimal dispatch allocation.

### System Instructions

```text
You are the RAPDO Dispatch AI Engine. Your goal is to assign a ride or parcel to the most optimal captain.
You must optimize for:
1. Lowest wait time for the customer.
2. Lowest likelihood of captain cancellation.
3. Maximizing captain earnings (batching parcels if on similar routes).
Output MUST be valid JSON in the format:
{ "optimal_captain_id": "ID", "reasoning": "brief explanation", "fallback_captain_id": "ID" }
```

### Dynamic Input Payload (Constructed via Node.js Server)

```json
{
  "request": {
    "type": "parcel_delivery",
    "pickup": "Samastipur Station",
    "drop": "Mohanpur Market",
    "urgent": false
  },
  "candidates": [
    {
      "captain_id": "CAP_001",
      "distance_mins": 3,
      "traffic_condition": "heavy",
      "acceptance_rate": 0.85,
      "current_status": "idle"
    },
    {
      "captain_id": "CAP_002",
      "distance_mins": 5,
      "traffic_condition": "light",
      "acceptance_rate": 0.95,
      "current_status": "delivering_nearby_same_route",
      "destination_alignment": "high"
    }
  ]
}
```

### Example Gemini Output

```json
{
  "optimal_captain_id": "CAP_002",
  "reasoning": "Although CAP_001 is closer (3 mins), traffic is heavy. CAP_002 has a higher acceptance rate and is currently on a trajectory that aligns perfectly with this parcel's drop location, allowing for an efficient batched delivery and maximizing captain earnings.",
  "fallback_captain_id": "CAP_001"
}
```

---

## 4. Multi-Stop Parcel Logistics (Phase 2 Feature)

For the **B2B / Parcel Delivery** aspect, the AI looks for "Batching Opportunities" to convert single trips into multi-stop runs.

### The Logic

1. **Idle Captain Scanning:** The system looks for captains driving towards a destination without a passenger.
2. **Route Intersection:** Google Maps API provides the route polyline. We check if the new parcel's pickup and drop-off points fall within a 1km deviation of that polyline.
3. **Double Earnings Proposal:** The AI sends a WebSocket ping to the Captain: _"Deliver this parcel on your way to Mohanpur and earn extra ₹30. (+5 mins deviation)"_

---

## 5. Fallbacks and Safety Nets

AI models can hit rate limits or hallucinate. The backend infrastructure must be fault-tolerant.

- **Timeout Fallback:** If Gemini API takes longer than `2000ms`, the Express server instantly defaults to the traditional nearest-neighbor greedy algorithm (closest ETA gets the ride).
- **AI Cache:** If multiple users request rides from exactly "Station" to "Market" at the same hour, we cache the optimal logic rules temporarily using Redis to save API costs.
