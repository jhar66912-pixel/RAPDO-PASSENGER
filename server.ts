import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize environment variables
dotenv.config();

// Initialize Google Gen AI with auto-selected server key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
const PORT = 3000;

// Middleware for JSON parsing and basic CORS
app.use(express.json());

// Secure Fallback API Key
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-a6dc50d79c874cb39b8a88a3305a32d1";

// RAHI Bihar Premium System Prompt
const MASTER_SYSTEM_PROMPT = `
You are the "RAHI Help AI Assistant", a premium conversational customer support intelligence integrated into RAHI (Bihar's leading bike-taxi, parcel delivery, and hyperlocal logistics platform).

App Tone & Brand Guidelines:
- Mood: Ultra-friendly, respectful, clever, fast, and Bihar-local.
- Theme: Matte Black, Luxury Yellow, Premium Modern UI.
- Direct Address: Use "Aap", "Bhai", "Sir", or "Bhaiya" respectfully. Conversational Hinglish/Hindi is highly preferred.
- Start standard greetings with: "Namaste 👋 RAHI Help AI me aapka swagat hai. Main aapki ride, parcel, aur payments related help kar sakta hoon."

Linguistic Translation Support:
- Handle common Hinglish questions with deep context.
- Example: "Patna se Hajipur ka price list?" -> Guide them on RAHI rates or offer quick estimation checks.
- Example: "Parcel late hai, Captain nahi aaya" -> Give parcel assistance, check tracking formats (RAHI-PRCL-XXXX), and offer support.

Geographic Intelligence:
- You know core Bihar cities and bypass hubs: Patna (Boring Road, Bailey Road, Gandhi Maidan), Darbhanga (Darbhanga Tower, LNMU), Samastipur, Muzaffarpur (Mithanpura), Gaya.
- Recommend faster pickup spaces during busy slots.

Operational Controls & Human Escalation Rules:
- If users complain about severe payment failures or express extreme anger, trigger the escalation logic.
- Guide them to dial RAHI SOS squad at +91 8252988672 or submit a Support Ticket right inside the AI Assistant tab.
- NEVER hallucinate fake booking references, fake live drivers, or expose confidential system metadata.
`;

// Simple in-memory session-based memory lookup (sliding window of last 10 messages)
const sessionHistoryCache: Record<string, Array<{ role: string; content: string }>> = {};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: Date.now(), service: "RAHI Help AI Backend Proxy" });
});

// DeepSeek Secure Proxy Chat Endpoint
app.post("/api/rahi-ai/chat", async (req, res): Promise<any> => {
  const { sessionId, messages, prompt } = req.body;

  try {
    if (!sessionId) {
      return res.status(400).json({ error: "Required parameter 'sessionId' is missing." });
    }

    // Dynamic historical context resolution
    let currentHistory = sessionHistoryCache[sessionId] || [];

    // If client supplied chat messages history directly, merge and unique-ify or clean it
    if (messages && Array.isArray(messages) && messages.length > 0) {
      currentHistory = messages.map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content || msg.text || ""
      }));
    }

    // Capture user's input prompt if supplied explicitly or use last item
    if (prompt && prompt.trim() !== "") {
      currentHistory.push({ role: "user", content: prompt });
    }

    // Enforce sliding window constraint to keep max last 10 dialogues
    if (currentHistory.length > 10) {
      currentHistory = currentHistory.slice(currentHistory.length - 10);
    }

    // Update in-memory session cache
    sessionHistoryCache[sessionId] = currentHistory;

    // Build DeepSeek messages payloads combining Master System Prompt
    const apiMessages = [
      { role: "system", content: MASTER_SYSTEM_PROMPT },
      ...currentHistory
    ];

    let useFallback = false;

    try {
      // Trigger POST request to DeepSeek API endpoint
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: apiMessages,
          temperature: 0.6,
          max_tokens: 450,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`DeepSeek API status ${response.status}: ${errorText}. Falling back to Google Gemini.`);
        useFallback = true;
      } else {
        const responsePayload = await response.json();
        
        // Save AI reply to cache for conversational continuum
        if (responsePayload.choices && responsePayload.choices[0]) {
          const assistantReply = responsePayload.choices[0].message.content;
          currentHistory.push({ role: "assistant", content: assistantReply });
          sessionHistoryCache[sessionId] = currentHistory;
        }

        // Stream/Pass JSON payload directly back to RAHI helper UI clients
        return res.status(200).json(responsePayload);
      }
    } catch (deepseekError: any) {
      console.warn("DeepSeek API call encountered unexpected error. Falling back to Google Gemini:", deepseekError.message);
      useFallback = true;
    }

    if (useFallback) {
      console.log("Executing Google Gemini fallback generation for session:", sessionId);
      const mappedContents = currentHistory.map(msg => ({
        role: msg.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: msg.content }]
      }));

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: mappedContents,
        config: {
          systemInstruction: MASTER_SYSTEM_PROMPT,
          temperature: 0.6,
        }
      });

      const assistantReply = geminiResponse.text || "Namaste bhaiya! Server slow chal raha hai ya network issue hai. Aap direct call karke ya WhatsApp group se booking status confirm kar sakte hain: +91 8252988672.";
      
      // Update historical cache
      currentHistory.push({ role: "assistant", content: assistantReply });
      sessionHistoryCache[sessionId] = currentHistory;

      // Standardize payload back into typical client response stream
      return res.status(200).json({
        choices: [{
          message: {
            role: "assistant",
            content: assistantReply
          }
        }]
      });
    }

  } catch (error: any) {
    console.error("Failed executing secure chat completing:", error);
    // Silent offline emergency fallback message
    return res.status(200).json({
      choices: [{
        message: {
          role: "assistant",
          content: "Namaste bhaiya! Server slow chal raha hai ya network issue hai. Aap direct call karke ya WhatsApp group se booking status confirm kar sakte hain: +91 8252988672 (Swastik Store, Mahaveer Chowk Office)."
        }
      }]
    });
  }
});

// Vite middleware integration for live development previews
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[RAHI Full-stack Server] Booted successfully on http://0.0.0.0:${PORT}`);
  });
}

initializeServer().catch(err => {
  console.error("Critical error starting RAHI Node integration server:", err);
});
