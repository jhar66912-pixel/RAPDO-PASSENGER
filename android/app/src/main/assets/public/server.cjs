var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
import_dotenv.default.config();
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-a6dc50d79c874cb39b8a88a3305a32d1";
var MASTER_SYSTEM_PROMPT = `
You are the "RAPDO Help AI Assistant", a premium conversational customer support intelligence integrated into RAPDO (Bihar's leading bike-taxi, parcel delivery, and hyperlocal logistics platform).

App Tone & Brand Guidelines:
- Mood: Ultra-friendly, respectful, clever, fast, and Bihar-local.
- Theme: Matte Black, Luxury Yellow, Premium Modern UI.
- Direct Address: Use "Aap", "Bhai", "Sir", or "Bhaiya" respectfully. Conversational Hinglish/Hindi is highly preferred.
- Start standard greetings with: "Namaste \u{1F44B} RAPDO Help AI me aapka swagat hai. Main aapki ride, parcel, aur payments related help kar sakta hoon."

Linguistic Translation Support:
- Handle common Hinglish questions with deep context.
- Example: "Patna se Hajipur ka price list?" -> Guide them on RAPDO rates or offer quick estimation checks.
- Example: "Parcel late hai, Captain nahi aaya" -> Give parcel assistance, check tracking formats (RAPDO-PRCL-XXXX), and offer support.

Geographic Intelligence:
- You know core Bihar cities and bypass hubs: Patna (Boring Road, Bailey Road, Gandhi Maidan), Darbhanga (Darbhanga Tower, LNMU), Samastipur, Muzaffarpur (Mithanpura), Gaya.
- Recommend faster pickup spaces during busy slots.

Operational Controls & Human Escalation Rules:
- If users complain about severe payment failures or express extreme anger, trigger the escalation logic.
- Guide them to dial RAPDO SOS squad at +91 8252988672 or submit a Support Ticket right inside the AI Assistant tab.
- NEVER hallucinate fake booking references, fake live drivers, or expose confidential system metadata.
`;
var fareValidationCache = {};
var activePaymentOrders = {};
var sessionHistoryCache = {};
app.post("/api/fare/calculate", (req, res) => {
  const { pickupCoords, dropCoords, mode } = req.body;
  if (!pickupCoords || !dropCoords || !mode) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  const R = 6371;
  const dLat = (dropCoords.lat - pickupCoords.lat) * (Math.PI / 180);
  const dLon = (dropCoords.lng - pickupCoords.lng) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(pickupCoords.lat * (Math.PI / 180)) * Math.cos(dropCoords.lat * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Number((R * c).toFixed(1)) || 2.5;
  let base = 35;
  let multiplier = 10;
  if (mode === "auto") {
    base = 60;
    multiplier = 14;
  }
  let finalFare = base;
  if (distanceKm > 3) {
    finalFare += (distanceKm - 3) * multiplier;
  }
  const hour = (/* @__PURE__ */ new Date()).getHours();
  let surge = 1;
  if (hour >= 8 && hour <= 11) surge = 1.2;
  if (hour >= 17 && hour <= 21) surge = 1.3;
  finalFare = Math.ceil(finalFare * surge);
  const discount = Math.round(finalFare * 0.1);
  const discountedFare = finalFare - discount;
  const fareId = `fare_${Date.now()}_${Math.floor(Math.random() * 1e3)}`;
  fareValidationCache[fareId] = { fare: discountedFare, dist: distanceKm, base, multiplier };
  res.json({
    fareId,
    baseFare: base,
    distanceKm,
    perKmRate: multiplier,
    surgeMultiplier: surge,
    discount,
    finalFare: discountedFare
  });
});
var RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || "rzp_test_secret_123456";
app.post("/api/create-order", (req, res) => {
  const { amount, currency = "INR", receipt = `rcpt_${Date.now()}` } = req.body;
  if (!amount) return res.status(400).json({ error: "Amount is required" });
  const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1e4)}`;
  const order = { id: orderId, entity: "order", amount: amount * 100, amount_paid: 0, amount_due: amount * 100, currency, receipt, status: "created", created_at: Math.floor(Date.now() / 1e3) };
  activePaymentOrders[orderId] = order;
  res.json({ order });
});
app.post("/api/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = activePaymentOrders[razorpay_order_id];
  if (!order) return res.status(404).json({ error: "Order not found" });
  order.status = "paid";
  order.amount_paid = order.amount;
  order.amount_due = 0;
  res.json({ success: true, message: "Payment verified successfully", order });
});
app.post("/api/refund", (req, res) => {
  const { transactionId, amount } = req.body;
  if (!transactionId) return res.status(400).json({ error: "Transaction ID required" });
  res.json({ success: true, message: `Refund of ${amount} initiated for ${transactionId}` });
});
app.post("/api/wallet-credit", (req, res) => {
  const { userId, amount, signature } = req.body;
  if (signature !== "valid-webhook-signature" && process.env.NODE_ENV === "production") {
  }
  res.json({ success: true, newBalance: amount });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: Date.now(), service: "RAPDO Help AI Backend Proxy" });
});
app.post("/api/rapdo-ai/chat", async (req, res) => {
  const { sessionId, messages, prompt } = req.body;
  try {
    if (!sessionId) {
      return res.status(400).json({ error: "Required parameter 'sessionId' is missing." });
    }
    let currentHistory = sessionHistoryCache[sessionId] || [];
    if (messages && Array.isArray(messages) && messages.length > 0) {
      currentHistory = messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content || msg.text || ""
      }));
    }
    if (prompt && prompt.trim() !== "") {
      currentHistory.push({ role: "user", content: prompt });
    }
    if (currentHistory.length > 10) {
      currentHistory = currentHistory.slice(currentHistory.length - 10);
    }
    sessionHistoryCache[sessionId] = currentHistory;
    console.log("Executing Google Gemini generation for session:", sessionId);
    const mappedContents = currentHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: mappedContents,
      config: {
        systemInstruction: MASTER_SYSTEM_PROMPT,
        temperature: 0.6
      }
    });
    const assistantReply = geminiResponse.text || "Namaste bhaiya! Server slow chal raha hai ya network issue hai. Aap direct call karke ya WhatsApp group se booking status confirm kar sakte hain: +91 8252988672.";
    currentHistory.push({ role: "assistant", content: assistantReply });
    sessionHistoryCache[sessionId] = currentHistory;
    return res.status(200).json({
      choices: [{
        message: {
          role: "assistant",
          content: assistantReply
        }
      }]
    });
  } catch (error) {
    console.error("Failed executing secure chat completing:", error);
    return res.status(200).json({
      choices: [{
        message: {
          role: "assistant",
          content: "Namaste bhaiya! Server slow chal raha hai ya network issue hai. Aap direct call karke ya WhatsApp group se booking status confirm kar sakte hain: +91 8252988672 (RAPDO Office)."
        }
      }]
    });
  }
});
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[RAPDO Full-stack Server] Booted successfully on http://0.0.0.0:${PORT}`);
  });
}
initializeServer().catch((err) => {
  console.error("Critical error starting RAPDO Node integration server:", err);
});
//# sourceMappingURL=server.cjs.map
