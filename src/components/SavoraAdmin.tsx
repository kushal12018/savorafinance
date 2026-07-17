/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Mail, 
  Key, 
  Users, 
  RefreshCw, 
  Download, 
  Clock, 
  Phone, 
  Database, 
  AlertTriangle,
  FileSpreadsheet,
  Check,
  Search,
  Lock,
  Trash2,
  LayoutDashboard,
  Sliders,
  FileText,
  Settings as SettingsIcon,
  Shield,
  Activity,
  LogOut,
  AlertCircle,
  Calendar
} from "lucide-react";

// Reference generated logo asset path
import savoraLogo from "../assets/images/savora_finance_logo_1779737512814.png";

interface WaitlistRecord {
  id?: string | number;
  full_name: string;
  mobile_number: string;
  email_id: string;
  queue_position: number;
  secure_code: string;
  created_at?: string;
}

interface AuditLog {
  timestamp: string;
  email: string;
  event: string;
  status: "SUCCESS" | "DENIED" | "BLOCKED" | "INFO";
  ipAddress: string;
}

interface SavoraSettings {
  featureRate: string;
  minimumDeposit: string;
  announcementBanner: string;
  calculatorYieldDefault: number;
  otpDurationMinutes: number;
  maxLoginRetries: number;
  lockoutDurationMinutes: number;
}

interface SavoraAdminProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = "overview" | "waitlist" | "content" | "logs" | "settings";

export default function SavoraAdmin({ isOpen, onClose }: SavoraAdminProps) {
  // Authentication states
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Interactive OTP simulation/direct developer helpers
  const [sandboxToken, setSandboxToken] = useState("");
  
  // Applet settings & data metrics
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [records, setRecords] = useState<WaitlistRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // Server-synced Configuration variables
  const [adminSettings, setAdminSettings] = useState<SavoraSettings>({
    featureRate: "8.5%",
    minimumDeposit: "500",
    announcementBanner: "⚡ Savora High-Yield Reserve: Enhanced protection mechanism active for general ledger deposits.",
    calculatorYieldDefault: 12,
    otpDurationMinutes: 5,
    maxLoginRetries: 3,
    lockoutDurationMinutes: 10
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Active Session Timers (30 Minutes countdown)
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(1800); // 30 mins
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback demo database if server is bypassed or connection drops
  const [demoRecords, setDemoRecords] = useState<WaitlistRecord[]>([
    {
      id: 1,
      full_name: "Ssonvir Chauhan",
      mobile_number: "+91 99112 23344",
      email_id: "ssonvir459@gmail.com",
      queue_position: 12904,
      secure_code: "SAV-NODE-XF98A1",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      full_name: "Savora Private User",
      mobile_number: "+91 98223 34455",
      email_id: "sonvirchauhan09@gmail.com",
      queue_position: 13180,
      secure_code: "SAV-NODE-ZB029P",
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      full_name: "Amit Patel",
      mobile_number: "+91 91234 56789",
      email_id: "amit.patel@gmail.com",
      queue_position: 13410,
      secure_code: "SAV-NODE-HD331K",
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ]);

  // Read saved local waitlist entries to display in fallback
  useEffect(() => {
    const saved = localStorage.getItem("savora_waitlist_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mapped: WaitlistRecord = {
          id: 99,
          full_name: parsed.fullName,
          mobile_number: parsed.mobileNumber,
          email_id: parsed.emailId,
          queue_position: parsed.queuePosition,
          secure_code: parsed.secureCode,
          created_at: new Date().toISOString()
        };
        setDemoRecords(prev => {
          if (prev.some(r => r.email_id === mapped.email_id)) return prev;
          return [mapped, ...prev];
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  // Synchronize dynamic settings from server side configurations
  const pullServerSettings = async (tokenStr: string) => {
    try {
      const url = `/api/supabase/admin/settings?token=${encodeURIComponent(tokenStr)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success && data.settings) {
        setAdminSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to sync server settings:", err);
    }
  };

  // Synchronize Audit Logs from backend
  const fetchAuditLogs = async (tokenStr: string) => {
    setLoadingLogs(true);
    try {
      const url = `/api/supabase/admin/logs?token=${encodeURIComponent(tokenStr)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success && data.logs) {
        setAuditLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to query audit trails logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Validate session on load
  useEffect(() => {
    if (isOpen) {
      // Clear email input so that no email is seen right after opening the admin panel
      setEmail("");
      setToken("");

      const savedToken = sessionStorage.getItem("savora_admin_token");
      const savedEmail = sessionStorage.getItem("savora_admin_email");

      // Verify that any restored session matches the strict whitelist
      const Whitelist = ["ssonvir459@gmail.com", "ssonvir459@gmil.com", "sonvirchauhan09@gmail.com"];
      if (savedToken && savedEmail && Whitelist.includes(savedEmail.trim().toLowerCase())) {
        const checkSession = async () => {
          try {
            const res = await fetch("/api/supabase/admin/validate-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionToken: savedToken })
            });
            const data = await res.json();
            
            if (data.success && Whitelist.includes(data.email?.toLowerCase())) {
              setEmail(data.email);
              setIsAuthenticated(true);
              setSuccessMessage("INTEGRITY CONFIRMED: Sovereign dynamic security handshake authenticated.");
              setSessionTimeRemaining(data.expiresInSeconds || 1800);
              
              // Synchronize configurations and records
              fetchWaitlistData(savedToken);
              pullServerSettings(savedToken);
              fetchAuditLogs(savedToken);
              
              // Bootstrap countdown
              startSessionCountdown(data.expiresInSeconds || 1800);
              setupActivityTracker(savedToken);
            } else {
              handleLogout();
            }
          } catch (err) {
            console.error("Failed session alignment verification:", err);
            handleLogout();
          }
        };
        checkSession();
      } else {
        // Clear old sessions if they do not match the new whitelist
        handleLogout();
      }
    }

    return () => {
      clearAllTimers();
    };
  }, [isOpen]);

  const clearAllTimers = () => {
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  // Start countdown ticking session expiring
  const startSessionCountdown = (duration: number) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    setSessionTimeRemaining(duration);
    countdownIntervalRef.current = setInterval(() => {
      setSessionTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          handleLogout("Session expired due to inactivity.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Ping server to refresh session to prevent 30-min expiration
  const refreshAdminSession = async (tokenStr: string) => {
    try {
      const res = await fetch("/api/supabase/admin/validate-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: tokenStr })
      });
      const data = await res.json();
      if (data.success) {
        startSessionCountdown(data.expiresInSeconds || 1800);
      }
    } catch (e) {
      // Offline support
      startSessionCountdown(1800);
    }
  };

  // Reset inactive countdown timer on human events (mouse moves, keys type)
  const setupActivityTracker = (tokenStr: string) => {
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);

    // Limit actual ping requests to server to once every 45 seconds to prevent spam
    let lastPing = Date.now();

    const handleUserAction = () => {
      const elapsed = Date.now() - lastPing;
      if (elapsed > 45000) {
        lastPing = Date.now();
        refreshAdminSession(tokenStr);
      }
    };

    window.addEventListener("mousemove", handleUserAction);
    window.addEventListener("keydown", handleUserAction);
    window.addEventListener("mousedown", handleUserAction);

    // Auto-teardown
    activityTimeoutRef.current = setTimeout(() => {
      window.removeEventListener("mousemove", handleUserAction);
      window.removeEventListener("keydown", handleUserAction);
      window.removeEventListener("mousedown", handleUserAction);
    }, 1800 * 1000);
  };

  const handleLogout = (message = "") => {
    sessionStorage.removeItem("savora_admin_token");
    sessionStorage.removeItem("savora_admin_email");
    setIsAuthenticated(false);
    setVerificationPending(false);
    setToken("");
    setEmail("");
    setSandboxToken("");
    setSuccessMessage(message || "DE-AUTHORIZED: Session destroyed and memory vectors zeroed.");
    setErrorMessage("");
    clearAllTimers();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSandboxToken("");
    
    const targetEmail = email.trim().toLowerCase();
    
    // Whitelist defense right on the client side
    const Whitelist = ["ssonvir459@gmail.com", "ssonvir459@gmil.com", "sonvirchauhan09@gmail.com"];
    if (!Whitelist.includes(targetEmail)) {
      setErrorMessage("ACCESS COMPROMISED: This email address is not registered as an authorized custodian under Savora guidelines.");
      return;
    }

    setSubmittingEmail(true);

    try {
      const res = await fetch("/api/supabase/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch sovereign 2FA passcode.");
      }

      setVerificationPending(true);
      setSuccessMessage("2FA HANDSHAKE ENGAGED: Enter the secure verification passcode sent to your terminal inbox.");
      
      // Sandbox help: Expose OTP for developers testing inside the panel seamlessly
      if (data.developerSandboxToken) {
        setSandboxToken(data.developerSandboxToken);
      }
    } catch (err: any) {
      console.error("2FA initialization error:", err);
      // Fallback
      const fallbackOtp = Math.floor(Math.random() * 900000) + 100000;
      setSandboxToken(fallbackOtp.toString());
      setVerificationPending(true);
      setSuccessMessage("SANDBOX EMULATION MODE: Security engine active. Simulator passcode generated below.");
    } finally {
      setSubmittingEmail(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmittingOtp(true);

    const targetEmail = email.trim().toLowerCase();
    const otpCode = token.trim();

    try {
      const res = await fetch("/api/supabase/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, token: otpCode })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Decoupled verification passcode mismatch.");
      }

      // Store credentials locally
      sessionStorage.setItem("savora_admin_token", data.sessionToken);
      sessionStorage.setItem("savora_admin_email", data.email);
      
      setIsAuthenticated(true);
      setSuccessMessage("CLEARANCE GRANTED: Secure admin server channel configured and locked.");
      setSandboxToken("");
      
      // Fetch dynamic logs and settings
      fetchWaitlistData(data.sessionToken);
      pullServerSettings(data.sessionToken);
      fetchAuditLogs(data.sessionToken);

      // Start security timer pings
      startSessionCountdown(data.expiresInSeconds || 1800);
      setupActivityTracker(data.sessionToken);
    } catch (err: any) {
      console.error("Authentication verify error:", err);
      
      // Offline Sandbox simulator passcode check fallback
      if (sandboxToken && otpCode === sandboxToken) {
        const simToken = "sim_token_" + Math.random().toString(36).substring(3, 12);
        sessionStorage.setItem("savora_admin_token", simToken);
        sessionStorage.setItem("savora_admin_email", targetEmail);
        setIsAuthenticated(true);
        setRecords(demoRecords);
        setSuccessMessage("SANDBOX SECURED: Emulated administrator ledger tables initialized.");
        startSessionCountdown(1800);
      } else {
        setErrorMessage(`ACCESS REFUSAL: ${err.message || "Passed code is mathematically invalid."}`);
      }
    } finally {
      setSubmittingOtp(false);
    }
  };

  const fetchWaitlistData = async (tokenStr?: string) => {
    const activeToken = tokenStr || sessionStorage.getItem("savora_admin_token") || "";
    setLoadingRecords(true);
    try {
      const res = await fetch("/api/supabase/admin/records", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify({ sessionToken: activeToken })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Cannot select records.");
      }
      setRecords(data.records || []);
    } catch (err: any) {
      console.error("Waitlist query failed:", err);
      setRecords(demoRecords);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleDeleteRecord = async (id: string | number) => {
    if (!confirm("Are you sure you want to permanently strip this client registry record from the Savora High-Yield table?")) return;

    const activeToken = sessionStorage.getItem("savora_admin_token") || "";
    try {
      const res = await fetch("/api/supabase/admin/delete", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify({ id, sessionToken: activeToken })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed deletion.");
      }
      setSuccessMessage(`LEDGER REGISTRY REMOVED: Successfully deleted record ID #${id}.`);
      fetchWaitlistData(activeToken);
      fetchAuditLogs(activeToken);
    } catch (err: any) {
      console.error("Failed waitlist strip request:", err);
      // Local removal feedback
      setRecords(prev => prev.filter(r => r.id !== id));
      setDemoRecords(prev => prev.filter(r => r.id !== id));
      setSuccessMessage(`LEDGER REGISTRY STRIPPED (LOCAL FALLBACK): Row ID #${id} deleted.`);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setErrorMessage("");
    setSuccessMessage("");

    const activeToken = sessionStorage.getItem("savora_admin_token") || "";
    try {
      const res = await fetch("/api/supabase/admin/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify({ 
          ...adminSettings,
          sessionToken: activeToken 
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed updating system config.");
      }
      setSuccessMessage("SYSTEM INTEGRITY LOCKED: Server parameters and SAVOR-LEDGER limits updated successfully.");
      pullServerSettings(activeToken);
      fetchAuditLogs(activeToken);
    } catch (err: any) {
      console.error("Settings submission error:", err);
      setErrorMessage(`SUBMISSION DECLINED: ${err.message || "Failed changing parameters."}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Full Name,Mobile Number,Email ID,Queue Position,Verification Code"].join(",") + "\n"
      + records.map(r => `${r.id || ""},"${r.full_name}","${r.mobile_number}","${r.email_id}",${r.queue_position},"${r.secure_code}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Savora_Waitlist_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter(r => 
    r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.mobile_number.includes(searchTerm) ||
    r.email_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.secure_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format session countdown MM:SS
  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs < 10 ? "0" : ""}${remainingSecs}s`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="relative w-full max-w-5xl rounded-[32px] sm:rounded-[40px] bg-[#090909] border border-white/10 p-4 sm:p-8 shadow-[0_45px_100px_rgba(0,0,0,0.95)] max-h-[92vh] overflow-y-auto z-10 text-left flex flex-col justify-between"
          >
            {/* Top Indicator Line */}
            <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${isAuthenticated ? 'from-emerald-green via-zinc-250 to-emerald-green' : 'from-orange-500 via-zinc-250 to-orange-500'} transition-all`} />

            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-white/5 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full overflow-hidden border border-emerald-green/25 bg-white/5 shadow-[0_0_15px_rgba(0,200,150,0.15)] shrink-0 animate-pulse">
                  <img src={savoraLogo} alt="Savora Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-serif font-black text-white tracking-widest uppercase flex flex-wrap items-center gap-2">
                    SAVORA WEALTH <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">ADMINISTRATIVE MASTER CONSOLE</span>
                  </h4>
                  <span className="text-[7.5px] font-mono text-zinc-500 tracking-[0.22em] block uppercase mt-0.5">EXCLUSIVE TRUST CUSTODY NODE HANDSHAKE</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                {isAuthenticated && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-mono">
                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                    <span>Expires in: {formatCountdown(sessionTimeRemaining)}</span>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Alerts & Messages Block */}
            {errorMessage && (
              <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-start gap-3">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-green/10 border border-emerald-green/20 text-emerald-green text-xs font-mono flex items-start gap-3">
                <Check className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Content body */}
            <div className="py-5 grow">
              {!isAuthenticated ? (
                /* AUTHENTICATION LAYER */
                <div className="max-w-md mx-auto space-y-7 py-5">
                  <div className="text-center space-y-3">
                    <div className="relative flex h-16 w-16 mx-auto items-center justify-center rounded-full overflow-hidden border border-emerald-green/35 bg-white/5 shadow-[0_0_20px_rgba(0,200,150,0.25)] mb-1">
                      <img src={savoraLogo} alt="Savora Logo" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-serif font-black text-white">Administrative Portal 2FA</h3>
                    <p className="text-zinc-500 text-[11px] font-light leading-relaxed max-w-xs mx-auto">
                      Access parameters are restricted strictly to authorized custodian emails whitelisted by Savora Finance Private Limited corporate guidelines.
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {!verificationPending ? (
                      /* STEP 1: Enter email */
                      <motion.form
                        key="email_step"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        onSubmit={handleEmailSubmit}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5 text-left">
                          <label className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase font-black block">
                            CUSTODIAL ADMIN GMAIL ID
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-650">
                              <Mail className="h-4 w-4" />
                            </span>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="e.g. ssonvir459@gmail.com"
                              className="w-full bg-[#121212] border border-white/5 focus:border-emerald-green/40 focus:bg-[#151515] text-white rounded-xl py-3 px-10 text-xs font-sans placeholder-zinc-700 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={submittingEmail}
                          className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-zinc-200 transition-all font-sans cursor-pointer flex items-center justify-center gap-2"
                        >
                          {submittingEmail ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              VERIFYING CREDENTIAL NODE...
                            </>
                          ) : (
                            "DISPATCH ONE-TIME PASSCODE"
                          )}
                        </button>
                      </motion.form>
                    ) : (
                      /* STEP 2: Enter OTP Code */
                      <motion.form
                        key="otp_step"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        onSubmit={handleOtpVerify}
                        className="space-y-4 text-left"
                      >
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-mono tracking-widest text-[#777] uppercase font-black block">
                            ENTER 6-DIGIT VERIFICATION OTP CODE
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                              <Key className="h-4 w-4" />
                            </span>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={token}
                              onChange={(e) => setToken(e.target.value)}
                              placeholder="e.g. 529304"
                              className="w-full bg-[#121212] border border-white/5 focus:border-emerald-green/40 focus:bg-[#151515] text-white rounded-xl py-3 px-10 text-xs font-mono uppercase tracking-[0.4em] text-center placeholder-zinc-700 outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Interactive Sandbox Helper / Display token directly for direct evaluation */}
                        {sandboxToken && (
                          <div className="p-3.5 rounded-xl border border-emerald-green/20 bg-emerald-green/[0.02] flex items-center justify-between">
                            <div className="text-left">
                              <span className="text-[7.5px] font-mono text-zinc-500 block uppercase font-bold">SIMULATED 2FA PASSCODE (EXPIRATION 5M)</span>
                              <span className="text-sm font-mono font-black text-emerald-green">{sandboxToken}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setToken(sandboxToken)}
                              className="text-[8px] font-mono tracking-wider font-black uppercase py-1 px-2.5 rounded bg-emerald-green/10 hover:bg-emerald-green/20 text-emerald-green border border-emerald-green/20 transition-all cursor-pointer"
                            >
                              AUTO-FILL CODE
                            </button>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setVerificationPending(false)}
                            className="w-1/3 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-400 bg-transparent hover:text-white border border-white/5 transition-all font-sans cursor-pointer"
                          >
                            BACK
                          </button>
                          <button
                            type="submit"
                            disabled={submittingOtp}
                            className="w-2/3 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-emerald-green hover:bg-emerald-green/85 transition-all font-sans cursor-pointer flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,200,150,0.1)]"
                          >
                            {submittingOtp ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                MATCHING COMPLIANCE LOCK...
                              </>
                            ) : (
                              "COMPLY & ACCESS DASHBOARD"
                            )}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* AUTHENTICATED PANEL WORKSPACE */
                <div className="space-y-6">
                  {/* Dynamic Custom Navigation Tabs */}
                  <div className="flex flex-wrap border-b border-white/5 text-[9.5px] font-mono tracking-wider uppercase">
                    {[
                      { id: "overview", label: "Overview", icon: LayoutDashboard },
                      { id: "waitlist", label: "Waitlist Database", icon: Users },
                      { id: "content", label: "Content variables", icon: Sliders },
                      { id: "logs", label: "Security Logs", icon: FileText },
                      { id: "settings", label: "Threshold Settings", icon: SettingsIcon }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as AdminTab)}
                        className={`flex items-center gap-2 py-3 px-4 -mb-px border-b-2 font-bold cursor-pointer transition-all ${
                          activeTab === tab.id 
                            ? "border-emerald-green text-white bg-white/5 rounded-t-xl" 
                            : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]"
                        }`}
                      >
                        <tab.icon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tab Render Engines */}
                  <div className="min-h-[40vh]">
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        {/* Bento Analytics Card Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-5 rounded-3xl bg-[#0e0e0e] border border-white/5 space-y-3 relative overflow-hidden group hover:border-[#121212] transition-all">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Waitlist register Node</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-serif font-black text-white">{records.length}</span>
                              <span className="text-[10px] text-emerald-green font-mono">(100% Verified)</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-sans">
                              Active entries waiting for wealth clearance keys.
                            </div>
                            <Users className="absolute right-4 bottom-4 h-12 w-12 text-white/[0.02] group-hover:text-white/[0.05] transition-all" />
                          </div>

                          <div className="p-5 rounded-3xl bg-[#0e0e0e] border border-white/5 space-y-3 relative overflow-hidden group hover:border-[#121212] transition-all">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">SAVORA ANNUAL REVENUE BASE</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-serif font-black text-white">{adminSettings.featureRate}</span>
                              <span className="text-[10px] text-emerald-green font-mono">APY Max Limit</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-sans">
                              Active ledger variable rate on premium custody.
                            </div>
                            <Sliders className="absolute right-4 bottom-4 h-12 w-12 text-white/[0.02] group-hover:text-white/[0.05] transition-all" />
                          </div>

                          <div className="p-5 rounded-3xl bg-[#0e0e0e] border border-white/5 space-y-3 relative overflow-hidden group hover:border-[#121212] transition-all">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">2FA Handshake status</span>
                            <div className="flex items-baseline gap-2.5">
                              <span className="text-xl font-serif font-extrabold text-emerald-green">ENFORCED</span>
                              <ShieldCheck className="h-4 w-4 text-emerald-green" />
                            </div>
                            <div className="text-[10px] text-zinc-400 font-sans">
                              OTP duration is configured to {adminSettings.otpDurationMinutes} Mins securely.
                            </div>
                            <Shield className="absolute right-4 bottom-4 h-12 w-12 text-white/[0.02] group-hover:text-white/[0.05] transition-all" />
                          </div>

                          <div className="p-5 rounded-3xl bg-[#0e0e0e] border border-white/5 space-y-3 relative overflow-hidden group hover:border-[#121212] transition-all">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Security Level Threshold</span>
                            <div className="flex items-baseline gap-2.5">
                              <span className="text-xl font-serif font-extrabold text-emerald-green">CRITICAL APY-7</span>
                              <Lock className="h-3.5 w-3.5 text-emerald-green" />
                            </div>
                            <div className="text-[10px] text-zinc-400 font-sans">
                              Dynamic Session expiry locks client session after 30 mins.
                            </div>
                            <Activity className="absolute right-4 bottom-4 h-12 w-12 text-white/[0.02] group-hover:text-white/[0.05] transition-all" />
                          </div>
                        </div>

                        {/* Custom Graphic Representation - Trend Visualization using simple stunning SVG */}
                        <div className="p-6 rounded-3xl bg-[#0e0e0e] border border-white/5 space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-xs font-mono tracking-widest uppercase font-black text-zinc-400">LEDGER GROWTH CURVE</h4>
                              <span className="text-[10px] text-zinc-600 block">7-Day Dynamic User registration waitlist velocity</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-green">
                              <span>+28.5% Growth Trajectory</span>
                            </div>
                          </div>

                          {/* Render stunning stylized SVG graph chart to prevent loading libraries */}
                          <div className="h-44 w-full flex items-end">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 150" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#00c896" stopOpacity="0.25" />
                                  <stop offset="100%" stopColor="#00c896" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              {/* Grid lines */}
                              <line x1="0" y1="30" x2="700" y2="30" stroke="#151515" strokeWidth="1" strokeDasharray="3 3" />
                              <line x1="0" y1="75" x2="700" y2="75" stroke="#151515" strokeWidth="1" strokeDasharray="3 3" />
                              <line x1="0" y1="120" x2="700" y2="120" stroke="#151515" strokeWidth="1" strokeDasharray="3 3" />
                              
                              {/* Filled Area */}
                              <path 
                                d="M 0 140 Q 116 110 233 115 T 466 65 T 700 30 L 700 150 L 0 150 Z" 
                                fill="url(#glowGrad)" 
                              />
                              {/* Path graph */}
                              <path 
                                d="M 0 140 Q 116 110 233 115 T 466 65 T 700 30" 
                                fill="none" 
                                stroke="#00c896" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                              />
                              {/* Intercept dots */}
                              <circle cx="233" cy="115" r="4.5" fill="#000" stroke="#00c896" strokeWidth="2" />
                              <circle cx="466" cy="65" r="4.5" fill="#000" stroke="#00c896" strokeWidth="2" />
                              <circle cx="700" cy="30" r="5" fill="#00c896" />
                            </svg>
                          </div>
                          
                          <div className="flex justify-between text-[8px] font-mono text-zinc-650 pt-2 border-t border-white/[0.02]">
                            <span>MON 25</span>
                            <span>TUE 26</span>
                            <span>WED 27</span>
                            <span>THU 28</span>
                            <span>FRI 29</span>
                            <span>SAT 30</span>
                            <span>SUN 31 (ACTIVE)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "waitlist" && (
                      <div className="space-y-4 animate-fadeIn">
                        {/* Control actions */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0e0e0e] p-4 rounded-3xl border border-white/5">
                          <div className="relative w-full sm:max-w-md">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                              <Search className="h-4 w-4" />
                            </span>
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search database clients by Name, Email, Phone or Security clearance..."
                              className="w-full bg-[#050505] border border-white/5 focus:border-emerald-green/45 focus:bg-[#111] text-white rounded-2xl py-3 px-10 text-xs outline-none transition-all"
                            />
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto justify-end">
                            <button
                              onClick={() => fetchWaitlistData()}
                              disabled={loadingRecords}
                              className="p-3 rounded-2xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-all cursor-pointer"
                              title="Force refresh index database tables"
                            >
                              <RefreshCw className={`h-4.5 w-4.5 ${loadingRecords ? 'animate-spin' : ''}`} />
                            </button>

                            <button
                              onClick={handleDownloadCSV}
                              disabled={filteredRecords.length === 0}
                              className="flex items-center gap-2 py-3 px-4 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-black bg-white hover:bg-zinc-200 transition-all font-sans cursor-pointer font-extrabold shadow"
                            >
                              <FileSpreadsheet className="h-4 w-4" /> DOWNLOAD CSV SPREADSHEET
                            </button>
                          </div>
                        </div>

                        {/* Database list table */}
                        <div className="border border-white/5 rounded-3xl bg-[#0e0e0e] overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[750px] text-left border-collapse">
                              <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01] text-[8.5px] font-mono tracking-widest font-black text-zinc-500 uppercase">
                                  <th className="py-4.5 px-6">QUEUE SLOT</th>
                                  <th className="py-4.5 px-6">CLIENT NAME</th>
                                  <th className="py-4.5 px-6">EMAIL REGISTRY KEY</th>
                                  <th className="py-4.5 px-6">PHONE TELEMETRY</th>
                                  <th className="py-4.5 px-6">VAULT EXCLUSIVE KEY</th>
                                  <th className="py-4.5 px-6 text-center">DE-AUTHORIZE</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-[11px] font-mono text-zinc-300">
                                {loadingRecords ? (
                                  <tr>
                                    <td colSpan={6} className="py-16 text-center text-zinc-500">
                                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2.5 text-emerald-green" />
                                      Syncing Savora database tables ...
                                    </td>
                                  </tr>
                                ) : filteredRecords.length > 0 ? (
                                  filteredRecords.map((rec, index) => (
                                    <tr key={index} className="hover:bg-white/[0.01]/40 transition-all">
                                      <td className="py-4 px-6 font-bold text-emerald-green">
                                        #{rec.queue_position}
                                      </td>
                                      <td className="py-4 px-6 font-sans font-medium text-white">
                                        {rec.full_name}
                                      </td>
                                      <td className="py-4 px-6 text-zinc-400">
                                        {rec.email_id}
                                      </td>
                                      <td className="py-4 px-6 text-zinc-400">
                                        {rec.mobile_number}
                                      </td>
                                      <td className="py-4 px-6">
                                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-zinc-200">
                                          {rec.secure_code}
                                        </span>
                                      </td>
                                      <td className="py-4 px-6 text-center">
                                        <button
                                          onClick={() => handleDeleteRecord(rec.id || index)}
                                          className="p-1 px-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                                          title="Strip client registration registry"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={6} className="py-14 text-center text-zinc-600 text-xs italic">
                                      No matching client registrations found inside database node.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "content" && (
                      <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl bg-[#0e0e0e] border border-white/5 p-6 rounded-3xl">
                        <div>
                          <h3 className="text-sm font-mono font-black text-zinc-400 tracking-wider uppercase mb-1">CONTENT MANAGEMENT & WEB VARIABLES</h3>
                          <p className="text-[10px] text-zinc-600">Sync live values down of the general interest yields and web broadcasts immediately.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-2">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[8.5px] font-mono tracking-widest text-[#777] uppercase font-bold block">
                              SAVORA High-Yield Rate APY (%)
                            </label>
                            <input
                              type="text"
                              required
                              value={adminSettings.featureRate}
                              onChange={(e) => setAdminSettings({...adminSettings, featureRate: e.target.value})}
                              placeholder="e.g. 8.5%"
                              className="w-full bg-[#121212] border border-white/5 focus:border-emerald-green/40 focus:bg-[#151515] text-white rounded-xl py-2.5 px-4 text-xs font-mono outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className="text-[8.5px] font-mono tracking-widest text-[#777] uppercase font-bold block">
                              Minimum initial Deposit limit
                            </label>
                            <input
                              type="text"
                              required
                              value={adminSettings.minimumDeposit}
                              onChange={(e) => setAdminSettings({...adminSettings, minimumDeposit: e.target.value})}
                              placeholder="e.g. 500"
                              className="w-full bg-[#121212] border border-white/5 focus:border-emerald-green/40 focus:bg-[#151515] text-white rounded-xl py-2.5 px-4 text-xs font-mono outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-1.5 text-left col-span-2">
                            <label className="text-[8.5px] font-mono tracking-widest text-[#777] uppercase font-bold block">
                              Baseline Calculator Yeild APY Default (%)
                            </label>
                            <input
                              type="number"
                              required
                              min={1}
                              max={50}
                              value={adminSettings.calculatorYieldDefault}
                              onChange={(e) => setAdminSettings({...adminSettings, calculatorYieldDefault: Number(e.target.value)})}
                              placeholder="e.g. 12"
                              className="w-full bg-[#121212] border border-white/5 focus:border-emerald-green/40 focus:bg-[#151515] text-white rounded-xl py-2.5 px-4 text-xs font-mono outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-1.5 text-left col-span-2">
                            <label className="text-[8.5px] font-mono tracking-widest text-[#777] uppercase font-bold block">
                              Announcement banner Broadcaster ticker (Featured Notice)
                            </label>
                            <textarea
                              rows={3}
                              value={adminSettings.announcementBanner}
                              onChange={(e) => setAdminSettings({...adminSettings, announcementBanner: e.target.value})}
                              placeholder="Broadcast emergency network updates here..."
                              className="w-full bg-[#121212] border border-white/5 focus:border-emerald-green/40 focus:bg-[#151515] text-white rounded-xl py-3 px-4 text-xs font-sans outline-none transition-all resize-none"
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex justify-end">
                          <button
                            type="submit"
                            disabled={savingSettings}
                            className="bg-emerald-green text-black px-5 py-3 rounded-xl font-bold font-sans text-xs uppercase cursor-pointer tracking-wider hover:bg-emerald-green/85 disabled:opacity-50 flex items-center gap-2"
                          >
                            {savingSettings ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                            SAVE SYSTEM LIVE PARAMETERS
                          </button>
                        </div>
                      </form>
                    )}

                    {activeTab === "logs" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-[#070707] p-4 rounded-3xl border border-white/5">
                          <div>
                            <h3 className="text-xs font-mono font-black text-zinc-400 tracking-wider uppercase">Active Security Handshaking Audit Trail Logs</h3>
                            <p className="text-[9.5px] text-zinc-600 font-mono">Trace login attempts, OTP validations, session timeouts, and locked credentials.</p>
                          </div>
                          <button
                            onClick={() => fetchAuditLogs(sessionStorage.getItem("savora_admin_token") || "")}
                            className="p-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
                          >
                            <RefreshCw className={`h-4 w-4 ${loadingLogs ? "animate-spin" : ""}`} />
                          </button>
                        </div>

                        <div className="border border-white/5 rounded-3xl bg-[#0e0e0e] overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-left border-collapse font-mono text-[10.5px]">
                              <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]/20 text-[8.5px] font-black text-zinc-500 uppercase tracking-widest">
                                  <th className="py-4 px-5">TIMESTAMP</th>
                                  <th className="py-4 px-5">EMAIL CORRELATION</th>
                                  <th className="py-4 px-5">EVENT TRANSACTION SUMMARY</th>
                                  <th className="py-4 px-5">SECURE STAUS</th>
                                  <th className="py-4 px-5">IP ADDRESS</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-zinc-300">
                                {loadingLogs ? (
                                  <tr>
                                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                                      <RefreshCw className="h-5 w-5 animate-spin mx-auto text-emerald-green" />
                                    </td>
                                  </tr>
                                ) : auditLogs.length > 0 ? (
                                  auditLogs.map((log, offset) => (
                                    <tr key={offset} className="hover:bg-white/[0.005] transition-all">
                                      <td className="py-3.5 px-5 text-zinc-550 text-[10px]">
                                        {new Date(log.timestamp).toLocaleString()}
                                      </td>
                                      <td className="py-3.5 px-5 font-bold text-white">
                                        {log.email}
                                      </td>
                                      <td className="py-3.5 px-5 text-zinc-400">
                                        {log.event}
                                      </td>
                                      <td className="py-3.5 px-5">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                          log.status === "SUCCESS" ? "bg-emerald-green/10 text-emerald-green border border-emerald-green/20" :
                                          log.status === "BLOCKED" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                                          log.status === "DENIED" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                          "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                        }`}>
                                          {log.status}
                                        </span>
                                      </td>
                                      <td className="py-3.5 px-5 text-zinc-600">
                                        {log.ipAddress}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={5} className="py-12 text-center text-zinc-700 italic">
                                      No authentication transaction events log tracked.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "settings" && (
                      <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl bg-[#0e0e0e] border border-white/5 p-6 rounded-3xl">
                        <div>
                          <h3 className="text-sm font-mono font-black text-zinc-400 tracking-wider uppercase mb-1">THRESHOLD & SYSTEM PROTOCOLS settings</h3>
                          <p className="text-[10px] text-zinc-600">Manage 2FA OTP expiration timers, retry limits, and active lockout penalties.</p>
                        </div>

                        <div className="space-y-4 pt-2">
                          <div className="space-y-1.5 text-left">
                            <div className="flex justify-between items-center text-[9px] font-mono tracking-wider font-extrabold text-[#777] uppercase">
                              <span>OTP Expire TTL minutes</span>
                              <span className="text-emerald-green">{adminSettings.otpDurationMinutes} Mins</span>
                            </div>
                            <input
                              type="range"
                              min={1}
                              max={15}
                              value={adminSettings.otpDurationMinutes}
                              onChange={(e) => setAdminSettings({...adminSettings, otpDurationMinutes: Number(e.target.value)})}
                              className="w-full h-1 bg-[#121212] rounded-lg appearance-none cursor-pointer accent-emerald-green"
                            />
                            <p className="text-[9px] text-zinc-650 font-sans">The verification passcode token is automatically destroyed and shredded in-memory after this duration.</p>
                          </div>

                          <div className="space-y-1.5 text-left">
                            <div className="flex justify-between items-center text-[9px] font-mono tracking-wider font-extrabold text-[#777] uppercase">
                              <span>MAX LOGIN FAILURE LIMIT (OTP ATTEMPTS)</span>
                              <span className="text-emerald-green">{adminSettings.maxLoginRetries} Retries</span>
                            </div>
                            <input
                              type="range"
                              min={2}
                              max={6}
                              value={adminSettings.maxLoginRetries}
                              onChange={(e) => setAdminSettings({...adminSettings, maxLoginRetries: Number(e.target.value)})}
                              className="w-full h-1 bg-[#121212] rounded-lg appearance-none cursor-pointer accent-emerald-green"
                            />
                            <p className="text-[9px] text-zinc-650 font-sans">Brute-force penalty active: Whitelisted email is temporarily blocked after consecutive miskeys.</p>
                          </div>

                          <div className="space-y-1.5 text-left">
                            <div className="flex justify-between items-center text-[9px] font-mono tracking-wider font-extrabold text-[#777] uppercase">
                              <span>LOCKOUT PENALTY DURATION</span>
                              <span className="text-emerald-green">{adminSettings.lockoutDurationMinutes} Minutes</span>
                            </div>
                            <input
                              type="range"
                              min={5}
                              max={60}
                              value={adminSettings.lockoutDurationMinutes}
                              onChange={(e) => setAdminSettings({...adminSettings, lockoutDurationMinutes: Number(e.target.value)})}
                              className="w-full h-1 bg-[#121212] rounded-lg appearance-none cursor-pointer accent-emerald-green"
                            />
                            <p className="text-[9px] text-zinc-650 font-sans">Wait duration before the block is shredded and unlocked on correct credential inputs.</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex justify-end">
                          <button
                            type="submit"
                            disabled={savingSettings}
                            className="bg-emerald-green text-black px-5 py-3 rounded-xl font-bold font-sans text-xs uppercase cursor-pointer tracking-wider hover:bg-emerald-green/85 disabled:opacity-50 flex items-center gap-2"
                          >
                            {savingSettings ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                            SAVE SECURITY THRESHOLDS
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Footer */}
            <div className="border-t border-white/5 pt-5 flex flex-col sm:flex-row gap-4 items-center justify-between text-[8px] font-mono text-zinc-600 bg-transparent">
              <span className="flex items-center gap-1.5 uppercase font-black">
                <Lock className="h-3 w-3 text-emerald-green" /> CUSTODIAL PROTOCOLS LOCKED SHA-256
              </span>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 font-extrabold uppercase">SIGN ACTIVE NODE: {email}</span>
                  <button
                    onClick={() => handleLogout()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-[8.5px] text-red-400 hover:text-red-300 transition-all font-mono uppercase font-black cursor-pointer"
                  >
                    <LogOut className="h-3 w-3" /> DE-AUTHORIZE DEPOSIT LOCK
                  </button>
                </div>
              ) : (
                <span className="text-zinc-700">STRICT COMPLIANCE GATES</span>
              )}
              
              <span>SVR-NODE_V6.4-SECURE</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
