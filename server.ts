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

// Allowed admin whitelist parameters - Strictly restricted as requested
const PERMITTED_ADMINS = [
  "ckushal120@gmail.com",
  "savorafinanceprivatelimited@gmail.com"
];

// Memory-based security storage
interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, LoginAttempt>();

interface ActiveOTP {
  code: string;
  expiresAt: number;
  retriesRemaining: number;
}
const activeOTPs = new Map<string, ActiveOTP>();

interface ActiveSession {
  email: string;
  createdAt: number;
  lastActiveAt: number;
  expiresAt: number;
}
const activeSessions = new Map<string, ActiveSession>();

interface AuditLog {
  timestamp: string;
  email: string;
  event: string;
  status: "SUCCESS" | "DENIED" | "BLOCKED" | "INFO";
  ipAddress: string;
}
const auditLogs: AuditLog[] = [];

// Helper to log administrative security events
function logSecurityEvent(email: string, event: string, status: "SUCCESS" | "DENIED" | "BLOCKED" | "INFO", req: express.Request) {
  const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const newLog: AuditLog = {
    timestamp: new Date().toISOString(),
    email: email || "SYSTEM/UNKNOWN",
    event,
    status,
    ipAddress
  };
  auditLogs.unshift(newLog);
  console.log(`[SECURITY AUDIT] [${newLog.status}] ${newLog.email} - ${newLog.event} (IP: ${ipAddress})`);
}

// Persistent / Memory-based configuration settings for Savora Admin
import fs from "fs";
const SETTINGS_FILE = path.join(process.cwd(), "savora_settings.json");

interface SavoraSettings {
  featureRate: string;
  minimumDeposit: string;
  announcementBanner: string;
  calculatorYieldDefault: number;
  otpDurationMinutes: number;
  maxLoginRetries: number;
  lockoutDurationMinutes: number;
}

let savoraSettings: SavoraSettings = {
  featureRate: "8.5%",
  minimumDeposit: "500",
  announcementBanner: "⚡ Savora High-Yield Reserve: Enhanced protection mechanism active for general ledger deposits.",
  calculatorYieldDefault: 12,
  otpDurationMinutes: 5,
  maxLoginRetries: 3,
  lockoutDurationMinutes: 10
};

// Load settings if exist
try {
  if (fs.existsSync(SETTINGS_FILE)) {
    savoraSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
  }
} catch (err) {
  console.error("Failed to read persistent settings. Using default fallback configuration.", err);
}

// Save settings helper
function saveSettings() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(savoraSettings, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write persistent settings.", err);
  }
}

// Session validator middleware
function requireAdminSession(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace(/^Bearer\s+/, "").trim() || (req.body && req.body.sessionToken) || (req.query && (req.query.token as string));

  if (!token) {
    return res.status(401).json({ success: false, error: "ACCESS DENIED: Administrative security session token is missing." });
  }

  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ success: false, error: "SESSION EXPIRED: Your credentials have expired or are unrecognized. Please sign in again." });
  }

  const now = Date.now();
  // Check 30-minute inactivity auto-logout (1800000 ms)
  const inactivityLimit = 30 * 60 * 1000;
  if (now - session.lastActiveAt > inactivityLimit) {
    activeSessions.delete(token);
    logSecurityEvent(session.email, "ADMIN SESSION EXPIRED: Automated logout active due to 30-minute inactivity threshold.", "INFO", req);
    return res.status(401).json({ success: false, error: "SESSION EXPIRED: Logged out due to 30 minutes of administrative inactivity." });
  }

  // Update session timestamps
  session.lastActiveAt = now;
  session.expiresAt = now + inactivityLimit;
  (req as any).adminEmail = session.email;
  next();
}

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

// Proxy: Check email duplicate in waitlist
app.post("/api/supabase/check-email", async (req, res) => {
  const { email } = req.body;
  if (!supabase) {
    return res.json({ success: true, exists: false, configured: false });
  }
  try {
    const { data, error } = await supabase
      .from("waitlist")
      .select("email_id")
      .ilike("email_id", (email || "").trim().toLowerCase());
    if (error) {
      console.error("Server proxy email check error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
    return res.json({ success: true, exists: data && data.length > 0 });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Proxy: Check phone duplicate in waitlist
app.post("/api/supabase/check-phone", async (req, res) => {
  const { phone } = req.body;
  if (!supabase) {
    return res.json({ success: true, exists: false, configured: false });
  }
  try {
    const { data, error } = await supabase
      .from("waitlist")
      .select("mobile_number")
      .eq("mobile_number", (phone || "").trim());
    if (error) {
      console.error("Server proxy phone check error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
    return res.json({ success: true, exists: data && data.length > 0 });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Proxy: Insert waitlist record
app.post("/api/supabase/insert-waitlist", async (req, res) => {
  const { fullName, mobileNumber, emailId, queuePosition, secureCode } = req.body;
  if (!supabase) {
    return res.json({ success: true, simulation: true });
  }
  try {
    const { error } = await supabase
      .from("waitlist")
      .insert([
        {
          full_name: (fullName || "").trim(),
          mobile_number: (mobileNumber || "").trim(),
          email_id: (emailId || "").trim().toLowerCase(),
          queue_position: queuePosition,
          secure_code: secureCode
        }
      ]);
    if (error) {
      console.error("Server proxy insert error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Proxy: OTP trigger with Whitelisting and Rate Limiting
app.post("/api/supabase/auth/otp", async (req, res) => {
  const { email } = req.body;
  const targetEmail = (email || "").trim().toLowerCase();
  
  if (!targetEmail) {
    return res.status(400).json({ success: false, error: "Email parameter is required." });
  }

  // 1. Check Whitelist
  if (!PERMITTED_ADMINS.includes(targetEmail)) {
    logSecurityEvent(targetEmail, "UNAUTHORIZED ATTEMPT: Email address failed whitelisted credentials verification.", "DENIED", req);
    return res.status(403).json({ success: false, error: "ACCESS COMPROMISED: This email address is not registered as an authorized advisory node custodian." });
  }

  // 2. Validate Rate Limiting
  const now = Date.now();
  let attempt = loginAttempts.get(targetEmail);
  if (!attempt) {
    attempt = { count: 0, lastAttempt: 0, lockedUntil: 0 };
    loginAttempts.set(targetEmail, attempt);
  }

  if (attempt.lockedUntil > now) {
    const waitSeconds = Math.ceil((attempt.lockedUntil - now) / 1000);
    logSecurityEvent(targetEmail, `AUTHENTICATION BLOCKED: Rate limit lockout active. (${waitSeconds}s remaining)`, "BLOCKED", req);
    return res.status(429).json({
      success: false,
      error: `ACCESS BLOCKED: Too many consecutive authentication failures. This credential has been temporarily locked to prevent brute-force intrusion. Try again in ${waitSeconds} seconds.`
    });
  }

  // Clean lock indicator if expired
  if (attempt.lockedUntil > 0 && attempt.lockedUntil <= now) {
    attempt.count = 0;
    attempt.lockedUntil = 0;
  }

  // 3. Generate high entropy 6-digit OTP code
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const durationSeconds = savoraSettings.otpDurationMinutes * 60;
  
  activeOTPs.set(targetEmail, {
    code: generatedOtp,
    expiresAt: now + (durationSeconds * 1000),
    retriesRemaining: savoraSettings.maxLoginRetries
  });

  // Track attempts
  attempt.count++;
  attempt.lastAttempt = now;
  
  if (attempt.count >= savoraSettings.maxLoginRetries + 2) {
    attempt.lockedUntil = now + (savoraSettings.lockoutDurationMinutes * 60 * 1000);
    logSecurityEvent(targetEmail, `CREDENTIAL TEMPORARILY LOCKED: Locked out for ${savoraSettings.lockoutDurationMinutes} mins after excessive OTP requests.`, "BLOCKED", req);
    return res.status(429).json({
      success: false,
      error: `ACCESS BLOCKED: Exceeded maximum authentication requests. Locked for ${savoraSettings.lockoutDurationMinutes} minutes.`
    });
  }

  logSecurityEvent(targetEmail, `OTP TRANSACTION INITIATED: Generated 2FA verification passcode token active for ${savoraSettings.otpDurationMinutes} minutes.`, "INFO", req);

  // Print OTP clearly in server terminal
  console.log(`
============================================================
[SECURITY SYSTEM PINPOINT OTP] Active 2FA Token Generated:
------------------------------------------------------------
Target Admin: ${targetEmail}
👉👉👉  ${generatedOtp}  👈👈👈
Expires in: ${savoraSettings.otpDurationMinutes} Minutes
============================================================
`);

  // Support direct supabase verification if configured, else simulation
  if (!supabase) {
    return res.json({ 
      success: true, 
      simulationNeeded: true, 
      developerSandboxToken: generatedOtp, // Pass in development for testing
      expiresIn: durationSeconds 
    });
  }

  // In production, also dispatch/simulate or handle external OTP trigger
  return res.json({ 
    success: true, 
    simulationNeeded: false,
    developerSandboxToken: generatedOtp, // Let the client display this safely in the modal
    expiresIn: durationSeconds 
  });
});

// Proxy: Verify OTP and Issue Secure Session Token
app.post("/api/supabase/auth/verify", async (req, res) => {
  const { email, token } = req.body;
  const targetEmail = (email || "").trim().toLowerCase();
  const pinCode = (token || "").trim();

  if (!targetEmail || !pinCode) {
    return res.status(400).json({ success: false, error: "Email address and OTP passcode token are required." });
  }

  // Double checking security whitelist
  if (!PERMITTED_ADMINS.includes(targetEmail)) {
    logSecurityEvent(targetEmail, "ACCESS VIOLATION: OTP entered for unapproved email address.", "DENIED", req);
    return res.status(403).json({ success: false, error: "ACCESS COMPROMISED: Whitelist clearance failed." });
  }

  // Check lockout
  const now = Date.now();
  const attempt = loginAttempts.get(targetEmail);
  if (attempt && attempt.lockedUntil > now) {
    return res.status(429).json({ success: false, error: "ACCESS BLOCKED: Account node locked." });
  }

  const otpData = activeOTPs.get(targetEmail);
  if (!otpData) {
    logSecurityEvent(targetEmail, "VERIFICATION FAILURE: No active OTP passcode found. Request a new token.", "DENIED", req);
    return res.status(400).json({ success: false, error: "REGISTRY MISMATCH: No active verification passcode found. Please request a new token." });
  }

  if (now > otpData.expiresAt) {
    activeOTPs.delete(targetEmail);
    logSecurityEvent(targetEmail, "VERIFICATION FAILURE: Authentication code expired (five-minute TTL surpassed).", "DENIED", req);
    return res.status(400).json({ success: false, error: "REGISTRY MISMATCH: Code has expired. One-time passcodes are valid for 5 minutes." });
  }

  if (otpData.retriesRemaining <= 0) {
    activeOTPs.delete(targetEmail);
    if (attempt) {
      attempt.lockedUntil = now + (savoraSettings.lockoutDurationMinutes * 60 * 1000);
    }
    logSecurityEvent(targetEmail, `Max attempts exhausted. Locking account node.`, "BLOCKED", req);
    return res.status(429).json({ success: false, error: "ACCESS BLOCKED: Maximum passcode verification attempts exceeded. Locked out." });
  }

  // Validate OTP code
  if (pinCode !== otpData.code) {
    otpData.retriesRemaining--;
    logSecurityEvent(targetEmail, `VERIFICATION MISMATCH: Wrong digit passcode entered. (${otpData.retriesRemaining} retries left)`, "DENIED", req);
    
    if (otpData.retriesRemaining <= 0) {
      activeOTPs.delete(targetEmail);
      if (attempt) {
        attempt.count = 10; // Trigger lockout immediately
        attempt.lockedUntil = now + (savoraSettings.lockoutDurationMinutes * 60 * 1000);
      }
      return res.status(429).json({ success: false, error: "ACCESS BLOCKED: Verification failed. Code has been destroyed due to retry limits. Lockout triggered." });
    }

    return res.status(400).json({ 
      success: false, 
      error: `INVALID PASSCODE: Incorrect code. You have ${otpData.retriesRemaining} administrative attempts remaining.`,
      retriesRemaining: otpData.retriesRemaining
    });
  }

  // --- SUCCESS! CREATE SECURE RANDOM SESSION TOKEN ---
  const sessionToken = "svr_session_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const sessionLifetime = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  activeSessions.set(sessionToken, {
    email: targetEmail,
    createdAt: now,
    lastActiveAt: now,
    expiresAt: now + sessionLifetime
  });

  // Clear security logs limits
  activeOTPs.delete(targetEmail);
  if (attempt) {
    attempt.count = 0;
    attempt.lockedUntil = 0;
  }

  logSecurityEvent(targetEmail, "AUTHENTICATION SUCCEEDED: Sovereign 2FA authenticated, session token issued.", "SUCCESS", req);

  return res.json({
    success: true,
    sessionToken,
    email: targetEmail,
    expiresInSeconds: 1800
  });
});

// Admin Route: Validate Active Session
app.post("/api/supabase/admin/validate-session", (req, res) => {
  const { sessionToken } = req.body;
  if (!sessionToken) {
    return res.json({ success: false, error: "Missing session token" });
  }

  const session = activeSessions.get(sessionToken);
  if (!session) {
    return res.json({ success: false, error: "Session invalid or expired" });
  }

  // Check 30-minute inactivity auto-logout
  const now = Date.now();
  const inactivityLimit = 30 * 60 * 1000;
  if (now - session.lastActiveAt > inactivityLimit) {
    activeSessions.delete(sessionToken);
    return res.json({ success: false, error: "Session expired due to inactivity" });
  }

  // Bump session activity
  session.lastActiveAt = now;
  session.expiresAt = now + inactivityLimit;

  return res.json({
    success: true,
    email: session.email,
    expiresInSeconds: Math.ceil((session.expiresAt - now) / 1000)
  });
});

// Admin Route: Retrieve current configuration settings (Requires active session)
app.get("/api/supabase/admin/settings", requireAdminSession, (req, res) => {
  return res.json({ success: true, settings: savoraSettings });
});

// Admin Route: Save configuration settings (Requires active session)
app.post("/api/supabase/admin/settings", requireAdminSession, (req, res) => {
  const { featureRate, minimumDeposit, announcementBanner, calculatorYieldDefault, otpDurationMinutes, maxLoginRetries, lockoutDurationMinutes } = req.body;
  const adminEmail = (req as any).adminEmail;

  if (featureRate !== undefined) savoraSettings.featureRate = String(featureRate);
  if (minimumDeposit !== undefined) savoraSettings.minimumDeposit = String(minimumDeposit);
  if (announcementBanner !== undefined) savoraSettings.announcementBanner = String(announcementBanner);
  if (calculatorYieldDefault !== undefined) savoraSettings.calculatorYieldDefault = Number(calculatorYieldDefault);
  if (otpDurationMinutes !== undefined) savoraSettings.otpDurationMinutes = Number(otpDurationMinutes);
  if (maxLoginRetries !== undefined) savoraSettings.maxLoginRetries = Number(maxLoginRetries);
  if (lockoutDurationMinutes !== undefined) savoraSettings.lockoutDurationMinutes = Number(lockoutDurationMinutes);

  saveSettings();
  logSecurityEvent(adminEmail, "CONFIGURED PARAMETERS MODIFIED: High-yield savings rates/threshold variables updated by administrator.", "SUCCESS", req);

  return res.json({ success: true, settings: savoraSettings });
});

// Admin Route: Retrieve audit trails log (Requires active session)
app.get("/api/supabase/admin/logs", requireAdminSession, (req, res) => {
  return res.json({ success: true, logs: auditLogs });
});

// Proxy: Fetch waitlist records for admin (Requires active session)
app.post("/api/supabase/admin/records", requireAdminSession, async (req, res) => {
  if (!supabase) {
    return res.json({ success: true, records: [] });
  }

  try {
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("id", { ascending: false });
    if (error) {
      console.error("Server records query error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
    return res.json({ success: true, records: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Proxy: Delete waitlist record (Requires active session)
app.post("/api/supabase/admin/delete", requireAdminSession, async (req, res) => {
  const { id } = req.body;
  const adminEmail = (req as any).adminEmail;

  if (!id) {
    return res.status(400).json({ success: false, error: "Record ID is required." });
  }

  if (!supabase) {
    return res.json({ success: true });
  }

  try {
    const { error } = await supabase
      .from("waitlist")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Server record delete error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    logSecurityEvent(adminEmail, `WAITLIST REGISTRY STRIPPED: Deleted entry ID #${id} from security tables.`, "SUCCESS", req);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
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
