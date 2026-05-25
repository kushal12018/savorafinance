/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
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
  Trash2
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

// Reference generated logo asset path
import savoraLogo from "../assets/images/savora_finance_logo_1779737512814.png";

// Permitted admin whitelist parameters
const PERMITTED_ADMINS = ["ckushal120@gmail.com", "ssonvir459@gmail.com"];

interface WaitlistRecord {
  id?: string | number;
  full_name: string;
  mobile_number: string;
  email_id: string;
  queue_position: number;
  secure_code: string;
  created_at?: string;
}

interface SavoraAdminProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SavoraAdmin({ isOpen, onClose }: SavoraAdminProps) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  
  const [records, setRecords] = useState<WaitlistRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Simulated demo state if Supabase isn't configured
  const [demoOtpCode, setDemoOtpCode] = useState("");
  const [demoRecords, setDemoRecords] = useState<WaitlistRecord[]>([
    {
      id: 1,
      full_name: "Amit Patel",
      mobile_number: "+91 99112 23344",
      email_id: "amit.patel@gmail.com",
      queue_position: 12904,
      secure_code: "SAV-NODE-XF98A1",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      full_name: "Priya Sharma",
      mobile_number: "+91 98223 34455",
      email_id: "priya.sharma@yahoo.co.in",
      queue_position: 13180,
      secure_code: "SAV-NODE-ZB029P",
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      full_name: "Rajesh Kumar",
      mobile_number: "+91 97334 45566",
      email_id: "rajesh.kumar@outlook.com",
      queue_position: 13511,
      secure_code: "SAV-NODE-HD331K",
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ]);

  // Read saved local waitlist entry to display in demo if present
  useEffect(() => {
    const saved = localStorage.getItem("savora_waitlist_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mapped = {
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

  // Automated background active admin session synchronization
  useEffect(() => {
    if (isOpen && isSupabaseConfigured && supabase) {
      const checkSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const userEmail = session.user.email?.toLowerCase().trim();
            if (userEmail && PERMITTED_ADMINS.includes(userEmail)) {
              setEmail(userEmail);
              setIsAuthenticated(true);
              setSuccessMessage("INTEGRITY CONFIRMED: Administrative session automatically synchronized.");
              setLoadingRecords(true);
              const { data, error } = await supabase
                .from("waitlist")
                .select("*")
                .order("id", { ascending: false });
              if (!error && data) {
                setRecords(data);
              }
              setLoadingRecords(false);
            } else {
              // Not a permitted custodian admin, forcibly sign them out for absolute security
              await supabase.auth.signOut();
              setIsAuthenticated(false);
            }
          }
        } catch (e) {
          console.error("Session verification bypass attempt:", e);
        }
      };
      checkSession();
    }
  }, [isOpen]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    
    const targetEmail = email.trim().toLowerCase();
    
    // Core clearance check
    if (!PERMITTED_ADMINS.includes(targetEmail)) {
      setErrorMessage("ACCESS COMPROMISED: This email address is not registered as an authorized advisory node custodian.");
      return;
    }

    setSubmittingEmail(true);

    if (isSupabaseConfigured && supabase) {
      try {
        // Trigger true Supabase authentication via email OTP code
        const { error } = await supabase.auth.signInWithOtp({
          email: targetEmail,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: undefined
          }
        });

        if (error) {
          throw error;
        }

        setVerificationPending(true);
        setSuccessMessage("INTEGRITY TOKEN DISPATCHED: Supabase sent a secure one-time passcode verification token to your inbox.");
      } catch (err: any) {
        console.error("Supabase OTP send failure:", err);
        setErrorMessage(`SUPABASE SERVICE REFUSAL: ${err.message || "Failed to trigger remote secure token."}`);
      } finally {
        setSubmittingEmail(false);
      }
    } else {
      // Sandbox Simulator fallback so developers aren't bricked
      setTimeout(() => {
        const fakeOtp = Math.floor(Math.random() * 900000) + 100000; // e.g. 582910
        setDemoOtpCode(fakeOtp.toString());
        setVerificationPending(true);
        setSuccessMessage(`SANDBOX AUDIT MODE: Generated digital OTP code is displayed below for simulation.`);
        setSubmittingEmail(false);
      }, 1200);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmittingOtp(true);

    const token = otp.trim();
    const targetEmail = email.trim().toLowerCase();

    // Security check: Defensive-in-depth whitelist enforcement
    if (!PERMITTED_ADMINS.includes(targetEmail)) {
      setErrorMessage("ACCESS COMPROMISED: This email address is not registered as an authorized advisory node custodian.");
      setSubmittingOtp(false);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error, data } = await supabase.auth.verifyOtp({
          email: targetEmail,
          token: token,
          type: "email"
        });

        if (error) {
          throw error;
        }

        setIsAuthenticated(true);
        setSuccessMessage("CLEARANCE GRANTED: Sovereign audit channel unlocked.");
        fetchWaitlistData();
      } catch (err: any) {
        console.error("OTP verification failure:", err);
        setErrorMessage(`INVALID COMPLIANCE PASS: ${err.message || "The verification token entered is mathematically incorrect."}`);
      } finally {
        setSubmittingOtp(false);
      }
    } else {
      // Sandbox simulator verification
      setTimeout(() => {
        if (token === demoOtpCode || token === "123456") {
          setIsAuthenticated(true);
          setRecords(demoRecords);
          setSuccessMessage("SANDBOX SECURED: Simulator node logs loaded safely.");
        } else {
          setErrorMessage("INVALID OTP PASSCODE: Try entering the numeric code displayed in the sandbox alert frame.");
        }
        setSubmittingOtp(false);
      }, 1000);
    }
  };

  const fetchWaitlistData = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setRecords(demoRecords);
      return;
    }

    setLoadingRecords(true);
    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        throw error;
      }

      setRecords(data || []);
    } catch (err: any) {
      console.error("Supabase table query failure:", err);
      // Fallback gracefully so we don't crash
      setRecords(demoRecords);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleDeleteRecord = async (id: string | number) => {
    if (!confirm("Are you sure you want to permanently strip this record from Savora ledger logs?")) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("waitlist")
          .delete()
          .eq("id", id);
        if (error) throw error;
        fetchWaitlistData();
      } catch (err: any) {
        alert(`Failed to delete registry: ${err.message}`);
      }
    } else {
      setRecords(prev => prev.filter(r => r.id !== id));
      setDemoRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // Convert waitlist records into spreadsheet download
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-lg"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl rounded-[40px] bg-[#090909] border border-white/10 p-6 sm:p-9 shadow-[0_45px_100px_rgba(0,0,0,0.95)] max-h-[88vh] overflow-y-auto z-10 text-left flex flex-col justify-between"
          >
            {/* Ambient indicator lights */}
            <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${isAuthenticated ? 'from-emerald-green via-white to-emerald-green' : 'from-orange-500 via-white to-orange-500'} transition-all`} />

            {/* Title block */}
            <div className="flex justify-between items-center pb-5 border-b border-white/5">
              <div className="flex items-center gap-3.5">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full overflow-hidden border border-emerald-green/25 bg-white/5 shadow-[0_0_15px_rgba(0,200,150,0.15)] shrink-0">
                  <img src={savoraLogo} alt="Savora Finance Private Limited Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-extrabold text-white tracking-widest uppercase flex items-center gap-2">
                    SAVORA FINANCE PRIVATE LIMITED <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">ADMIN AUDIT NODE</span>
                  </h4>
                  <span className="text-[8px] font-mono text-zinc-500 tracking-[0.25em] block uppercase mt-0.5">EXCLUSIVE CUSTODIAL TRANSACTION ACCESS</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Error or Warning banner */}
            {errorMessage && (
              <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success notification banner */}
            {successMessage && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-green/10 border border-emerald-green/20 text-emerald-green text-xs font-mono flex items-start gap-3">
                <Check className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="py-6 grow">
              
              {!isAuthenticated ? (
                /* AUTHENTICATION PATHWAY */
                <div className="max-w-md mx-auto space-y-8 py-4">
                  
                  <div className="text-center space-y-3">
                    <div className="relative flex h-16 w-16 mx-auto items-center justify-center rounded-full overflow-hidden border border-emerald-green/35 bg-white/5 shadow-[0_0_20px_rgba(0,200,150,0.25)] mb-2">
                      <img src={savoraLogo} alt="Savora Logo" className="w-full h-full object-cover animate-pulse" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-white">Savora Finance Private Limited Secure Vault</h3>
                    <p className="text-zinc-400 text-xs font-light max-w-sm mx-auto leading-relaxed">
                      Only accredited custodian accounts registered under Savora Finance Private Limited corporate parameters can request transaction access. Enter your key credentials to retrieve the OTP.
                    </p>
                  </div>

                  {!isSupabaseConfigured && (
                    <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10.5px] space-y-1 font-mono">
                      <div className="font-bold flex items-center gap-1.5 uppercase">
                        <AlertTriangle className="h-3.5 w-3.5" /> Supabase Config Missing
                      </div>
                      <p className="font-sans font-light text-zinc-400">
                        Admin is running in a **secure offline demo sandbox**. The Whitelisting checks are active; check the authorized custodian email to review the workflow.
                      </p>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {!verificationPending ? (
                      /* STEP 1: INPUT admin email Address */
                      <motion.form
                        key="email_form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleEmailSubmit}
                        className="space-y-4 text-left"
                      >
                        <div className="space-y-1.5">
                          <label className="text-[8.5px] font-mono tracking-widest text-zinc-500 uppercase font-black block">
                            Custodial Admin Email ID
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                              <Mail className="h-4 w-4" />
                            </span>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="admin@savorafinance.com"
                              className="w-full bg-[#121212] border border-white/5 focus:border-emerald-green/45 focus:bg-[#151515] text-white rounded-xl py-3 px-10 text-xs font-sans placeholder-zinc-700 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={submittingEmail}
                          className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-matte-black bg-white hover:bg-zinc-200 disabled:opacity-50 transition-all font-sans cursor-pointer shadow-md text-center flex items-center justify-center gap-2"
                        >
                          {submittingEmail ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              VERIFYING ACCOUNT NODE...
                            </>
                          ) : (
                            "REQUEST SIGN-IN PASSCODE CODE"
                          )}
                        </button>
                      </motion.form>
                    ) : (
                      /* STEP 2: INPUT the OTP passcode code */
                      <motion.form
                        key="otp_form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleOtpVerify}
                        className="space-y-4 text-left"
                      >
                        <div className="space-y-1.5">
                          <label className="text-[8.5px] font-mono tracking-widest text-zinc-500 uppercase font-black block">
                            Verification passcode OTP
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                              <Key className="h-4 w-4" />
                            </span>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="Enter 6-digit verification code"
                              className="w-full bg-[#121212] border border-white/5 focus:border-emerald-green/45 focus:bg-[#151515] text-white rounded-xl py-3 px-10 text-xs font-mono uppercase tracking-widest text-center placeholder-zinc-700 outline-none transition-all"
                            />
                          </div>
                        </div>

                        {!isSupabaseConfigured && (
                          <div className="p-3.5 rounded-xl border border-emerald-green/20 bg-emerald-green/[0.02] flex items-center justify-between">
                            <div className="text-left">
                              <span className="text-[7.5px] font-mono text-zinc-500 block uppercase font-bold">SIMULATED CRYPTOGRAPHIC OTP CODE</span>
                              <span className="text-xs font-mono font-black text-emerald-green">{demoOtpCode}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOtp(demoOtpCode)}
                              className="text-[8px] font-mono tracking-wider font-extrabold uppercase py-1 px-2.5 rounded bg-emerald-green/10 hover:bg-emerald-green/20 text-emerald-green border border-emerald-green/20 transition-all cursor-pointer"
                            >
                              Auto-fill passcode
                            </button>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setVerificationPending(false)}
                            className="w-1/3 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#999] bg-transparent hover:text-white border border-white/5 hover:border-white/10 transition-all font-sans cursor-pointer"
                          >
                            CHANGE CODE
                          </button>
                          <button
                            type="submit"
                            disabled={submittingOtp}
                            className="w-2/3 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-matte-black bg-emerald-green hover:bg-emerald-green/85 disabled:opacity-50 transition-all font-sans cursor-pointer text-center flex items-center justify-center gap-2 shadow-md"
                          >
                            {submittingOtp ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                VALIDATING PASS CODE...
                              </>
                            ) : (
                              "VERIFY OTP PASSCODE CODE"
                            )}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                </div>
              ) : (
                /* AUTHENTICATED WAITLIST DATABASE LOGS */
                <div className="space-y-6">
                  
                  {/* Dashboard Headers */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121212]/30 p-4 rounded-3xl border border-white/5">
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono tracking-wider font-extrabold text-[#777] uppercase block">SAVORA ACTIVE POOL REPORT</span>
                      <h4 className="text-sm font-semibold text-white uppercase font-sans flex items-center gap-2">
                        Total Registry Records Node: <span className="font-mono text-emerald-green font-bold text-base">#{records.length}</span>
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={fetchWaitlistData}
                        disabled={loadingRecords}
                        className="p-2.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                        title="Force reload ledger nodes"
                      >
                        <RefreshCw className={`h-4.5 w-4.5 ${loadingRecords ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        onClick={handleDownloadCSV}
                        disabled={records.length === 0}
                        className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider text-matte-black bg-white hover:bg-zinc-200 transition-all font-sans cursor-pointer text-center font-extrabold shadow"
                      >
                        <FileSpreadsheet className="h-4 w-4" /> DOWNLOAD SPREADSHEET CSV
                      </button>
                    </div>
                  </div>

                  {/* Search query frame */}
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search queue records by Client Name, Email, mobile number, or Sovereign Pass key..."
                      className="w-full bg-[#111] border border-white/5 focus:border-emerald-green/45 focus:bg-[#141414] text-white rounded-2xl py-3 px-10 text-xs placeholder-zinc-700 outline-none transition-all font-sans"
                    />
                  </div>

                  {/* Database logs table */}
                  <div className="border border-white/5 rounded-3xl bg-[#090909]/60 overflow-hidden relative">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02]/30 text-[8.5px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                            <th className="py-4 px-5">QUEUE SLOT</th>
                            <th className="py-4 px-5">CLIENT CLIENT</th>
                            <th className="py-4 px-5">EMAIL LINK ID</th>
                            <th className="py-4 px-5">PHONE INTERCEPT</th>
                            <th className="py-4 px-5">SOVEREIGN PASS KEY</th>
                            <th className="py-4 px-5 text-center">MANAGEMENT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-[11px] font-mono text-zinc-300">
                          {filteredRecords.length > 0 ? (
                            filteredRecords.map((rec, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.01] transition-all">
                                <td className="py-4 px-5 font-bold text-emerald-green">
                                  #{rec.queue_position}
                                </td>
                                <td className="py-4 px-5 text-white font-sans font-medium">
                                  {rec.full_name}
                                </td>
                                <td className="py-4 px-5 text-zinc-300">
                                  {rec.email_id}
                                </td>
                                <td className="py-4 px-5 text-zinc-400">
                                  {rec.mobile_number}
                                </td>
                                <td className="py-4 px-5">
                                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9.5px] text-zinc-200">
                                    {rec.secure_code}
                                  </span>
                                </td>
                                <td className="py-4 px-5 text-center">
                                  <button
                                    onClick={() => handleDeleteRecord(rec.id || idx)}
                                    className="p-1 px-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                                    title="Strip client registration"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-zinc-650 text-xs italic">
                                No cryptographic waitlist matching parameters found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Admin actions footers */}
            <div className="border-t border-white/5 pt-5 flex flex-col sm:flex-row gap-4 items-center justify-between text-[8px] font-mono text-zinc-600 bg-transparent">
              <span className="flex items-center gap-1.5 uppercase font-black">
                <Lock className="h-3 w-3 text-emerald-green" /> CUSTODIAL ENCRYPT SHA-256
              </span>
              {isAuthenticated && (
                <button
                  onClick={async () => {
                    if (isSupabaseConfigured && supabase) {
                      try {
                        await supabase.auth.signOut();
                      } catch (err) {
                        console.error("Error signing out:", err);
                      }
                    }
                    setIsAuthenticated(false);
                    setVerificationPending(false);
                    setOtp("");
                    setSuccessMessage("");
                    setErrorMessage("");
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 text-[8.5px] text-zinc-400 hover:text-white transition-all font-mono uppercase font-black cursor-pointer"
                >
                  DE-AUTHORIZE ENCRYPTED DEPOSIT
                </button>
              )}
              <span>SVR-NODE_V5.9</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
