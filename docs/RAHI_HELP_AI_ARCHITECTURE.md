# RAHI Help AI Architecture Specification
### Enterprise Conversational AI Design for Hyperlocal Bihar Transit (Tier-2/Tier-3 India)

This document details the secure, performance-optimized, and context-aware conversational AI architecture for **RAHI Help AI**, bridging the frontend (Flutter Passenger App / Web client) and the highly modern **DeepSeek AI API Chat Completions Engine** via a secure, stateless proxy layer.

---

## 1. Global Request & Data Flow Architecture

The data stream guarantees that the high-stakes DeepSeek API key is **never exposed** to the client-side while offering low-overhead, resilient, and context-aware translations of Hinglish, Hindi, and colloquial dialect queries typical of Tier-2/3 Bihar.

```
┌──────────────────────────────────────┐
│       Flutter App / Web Client       │
│  (Matte Black, Luxury Yellow Theme)  │
└──────────────────┬───────────────────┘
                   │ Secure HTTPS Post
                   ▼
┌──────────────────────────────────────┐
│        Node.js Express Backend       │
│  (Session Memory Rate Limit Manager) │
└──────────────────┬───────────────────┘
                   │ Bearer Token Guard (Bearer sk-a6dc... )
                   ▼
┌──────────────────────────────────────┐
│         DeepSeek Chat API            │
│       (Model: deepseek-chat)         │
└──────────────────────────────────────┘
```

### Detailed Sequence
1. **User Initiation:** Passenger asks: *“Bhai, Patna Junction se Gandhi Maidan ka bike fare kitna hoga?”*
2. **Context Enrichment:** The Client App appends the current session ID, user language prefix (`hi` or `en`), and any relevant transaction snapshot (e.g., Active Booking details) to the secure payload.
3. **Stateless Proxy Transit:** Request lands on Node.js `/api/rahi-ai/chat` endpoint.
4. **Memory Verification:** Server fetches the last 10 messages from session-state (or memory cache) to preserve short-term conversation context.
5. **Gateway Routing:** The server encapsulates the query with the **Master System Prompt** (detailed below) and executes an authenticated request against DeepSeek’s secure API.
6. **Optimized Dispatch:** Response is validated, cached for repetitive queries, and piped back to the user with standard markdown structures plus quick action cards.

---

## 2. Conversation Memory & Token Retention Policies

To provide a cohesive dialogue flow, RAHI utilizes an active **sliding-window memory pool** with high-efficiency garbage-collection limits.

*   **Window Size Limit:** Last 10 messages per active user session.
*   **Target Scope:** Prevents context drift while keeping token budgets extremely low (typical token cost is reduced by up to 60%).
*   **Pruning Mechanism:**
    *   System messages are never pruned.
    *   Once memory array count > 10, the oldest User-Assistant message pairs are automatically evicted.
    *   Any active ride coordinates, parcel tracking locks, and user profile names are stored inside a dedicated system metadata block that remains appended throughout the session lifecycle.

---

## 3. Bihar Dialect Translation (Colloquial Hinglish Mapping)

Tier-2 and Tier-3 cities across Bihar (Samastipur, Darbhanga, Begusarai, Hajipur, Patna) demand conversational support that handles spelling errors, mixed dialect, and respectful local address keys.

*   **Linguistic Dialects Supported:** Hinglish, Hindi (Devanagari), Bhojpuri-influenced Hindi, and colloquial English.
*   **Key Vernacular Phrases & Token Maps:**
    *   *“Bhai ride kitna time me aayega?”* → Intent: ETARequest. Action: Pull nearest rider tracking bounds.
    *   *“Hamara parcel late chal raha hai.”* → Intent: ParcelStatus. Action: Scan active delivery pipeline.
    *   *“Driver cancel kar diya!”* → Intent: DisputeCancellation. Action: Flag ride ID, trigger penalty ledger analysis, automatically present "Refund to RAHI Wallet" card.
    *   *“Boring Road se Patna Junction ka auto se sasta hai?”* → Intent: FareEstimate. Action: Return cost comparison checklist.

---

## 4. Human Escalation (Support Ticket Integration)

If the conversational confidence threshold falls below `0.65` or the user makes explicit signals indicating distress or failure (e.g., *“Customer support se baat karwao”*, *“Captain fraud kiya hai”*):

1. **AI Interception:** The prompt engine recognizes the dispute threshold.
2. **Auto-Ticket Creation:** Server triggers a secure Firebase Firestore write-action to append a new document to the `/support_tickets` collection:
   ```json
   {
     "id": "ST-99831",
     "priority": "high",
     "customerId": "USR-882",
     "customerName": "Ramesh Mandal",
     "issue": "AI Escalation",
     "desc": "Transcripts flagged due to urgent fare override dispute in Darbhanga bypass.",
     "status": "open",
     "createdAt": 1779930920000
   }
   ```
3. **Escalation Redirect:** The AI assistant displays a custom visual "Support Specialist Assigned" card containing direct SOS call triggers and a WhatsApp chat shortcut.

---

## 5. Security & Rate Limiting Implementations

To guard systemic infrastructure against API DOS attacks and ensure secure, unrevealed keys:

*   **Strict CORS Policy:** Node.js backend allows requests *only* originating from trusted RAHI workspace origins.
*   **IP-Based Rate Limiting:** Maximum 15 chat queries pre-authorized per user per minute.
*   **Abuse Screening:** Inputs containing code blocks, malicious payloads, or excessive string lengths (greater than 400 characters) are automatically filtered and blocked.
*   **API Key Rotation:** The DeepSeek Key is dynamically sourced from environment variables (`DEEPSEEK_API_KEY`) on the hosting server, acting as a complete black box to browser dev tools.
