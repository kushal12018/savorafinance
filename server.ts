/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server-side Supabase Database config & engagement
const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.log("⚠️ Savora Offline Node active (Supabase connection parameters missing).");
} else {
  console.log("🚀 Savora Private Ledger successfully engaged via Supabase Auth & Storage.");
}

// Allowed admin whitelist parameters - Added user's active login email
const PERMITTED_ADMINS = [
  "ckushal120@gmail.com", 
  "ssonvir459@gmail.com", 
  "savorafinanceprivatelimited@gmail.com"
];

// Lazy initializer for Google Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please define it in your Secrets / Environment panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Fintech AI Assistant Advisor
app.post("/api/advisor/chat", async (req, res) => {
  try {
    const { message, savingsPlan = {} } = req.body;
    
    // Construct rich system instructions for luxurious fintech advisory
    const systemInstruction = `You are "Savora WealthMind", an elite virtual AI financial strategist and wealth concierge for Savora—a futuristic luxury fintech platform. 
Your personality is professional, articulate, elegant, and reassuring. Speak like a premier private banker or luxury investment strategist. 
You specialize in micro-saving, compound interest, automated investing, and high-performance financial health.

The user's current Savora interactive target profile:
- Monthly Contribution: ₹${savingsPlan.monthly || 5000}
- Target Horizon: ${savingsPlan.years || 15} Years
- Estimated Wealth Goal: ₹${savingsPlan.estimatedWealth || "45.8 Lakh"}

Provide tailored financial planning advice, wealth strategies, and budgeting principles. Keep replies elegantly formatted in clean markdown, limited to 2-3 short, highly readable paragraphs or list points. Do not mention specific stock guarantees, always keep a luxury finance Advisory quality, and include a single, microscopic, elegant advisory disclaimer at the absolute end.`;

    const ai = getGemini();
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({
      success: true,
      text: response.text || "I apologize, but Savora WealthMind could not generate an analysis. Please try again."
    });
  } catch (error: any) {
    console.error("AI Advisor Chat Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to contact Savora WealthMind advisor."
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", service: "Savora Fintech API" });
});

// Vite server integrations
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
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
    console.log(`Savora Fintech Server Running on port ${PORT}`);
  });
}

startServer();
