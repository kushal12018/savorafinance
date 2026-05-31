/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Star, 
  QrCode, 
  Copy, 
  Check, 
  Clock, 
  Zap,
  Users,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

import savoraLogo from "../assets/images/savora_finance_logo_1779737512814.png";

interface SavoraWaitlistProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  registeredUser: any;
  setRegisteredUser: (data: any) => void;
}

export default function SavoraWaitlist({
  isOpen,
  onClose,
  onSuccess,
  registeredUser,
  setRegisteredUser
}: SavoraWaitlistProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    emailId: ""
  });
  
  const [errors, setErrors] = useState({
    fullName: "",
    mobileNumber: "",
    emailId: ""
  });

  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { fullName: "", mobileNumber: "", emailId: "" };

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      valid = false;
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Name must be at least 3 characters";
      valid = false;
    }

    const phoneRegex = /^[+]?[(]?[0-589]?\d{2,4}[)]?[-\s.]?\d{2,4}[-\s.]?\d{4,8}$/;
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
      valid = false;
    } else if (formData.mobileNumber.trim().length < 10) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.emailId.trim()) {
      newErrors.emailId = "Email ID is required";
      valid = false;
    } else if (!emailRegex.test(formData.emailId)) {
      newErrors.emailId = "Please enter a valid email address";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    // XSS injection prevention and data sanitization
    const sanitizeInput = (val: string) => {
      return val.replace(/[<>]/g, "").trim();
    };

    const sanitizedEmail = sanitizeInput(formData.emailId).toLowerCase();
    const sanitizedPhone = sanitizeInput(formData.mobileNumber);
    const sanitizedName = sanitizeInput(formData.fullName);

    // Perform database uniqueness checks before committing waitlist insertion
    if (isSupabaseConfigured && supabase) {
      try {
        // Check for duplicate emailId case-insensitively
        const { data: duplicateEmail, error: emailErr } = await supabase
          .from("waitlist")
          .select("email_id")
          .ilike("email_id", sanitizedEmail);

        if (emailErr) {
          console.error("Database email uniqueness check failed:", emailErr.message);
        } else if (duplicateEmail && duplicateEmail.length > 0) {
          setErrors(prev => ({
            ...prev,
            emailId: "This email address is already registered on our waitlist."
          }));
          setSubmitting(false);
          return;
        }

        // Check for duplicate mobileNumber
        const { data: duplicatePhone, error: phoneErr } = await supabase
          .from("waitlist")
          .select("mobile_number")
          .eq("mobile_number", sanitizedPhone);

        if (phoneErr) {
          console.error("Database mobile uniqueness check failed:", phoneErr.message);
        } else if (duplicatePhone && duplicatePhone.length > 0) {
          setErrors(prev => ({
            ...prev,
            mobileNumber: "This mobile number is already registered on our waitlist."
          }));
          setSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("Database system verification error:", err);
      }
    }

    const randomSeed = Math.floor(Math.random() * 850) + 12800; // e.g. #SAV-13482
    const secureCode = `SAV-NODE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const payload = {
      fullName: sanitizedName,
      mobileNumber: sanitizedPhone,
      emailId: sanitizedEmail,
      registeredAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      queuePosition: randomSeed,
      secureCode: secureCode
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("waitlist")
          .insert([
            {
              full_name: sanitizedName,
              mobile_number: sanitizedPhone,
              email_id: sanitizedEmail,
              queue_position: randomSeed,
              secure_code: secureCode
            }
          ]);
        
        if (error) {
          console.error("Supabase Save Error:", error.message);
        }
      } catch (err) {
        console.error("Failed to post to Supabase node:", err);
      }
    }

    localStorage.setItem("savora_waitlist_user", JSON.stringify(payload));
    setRegisteredUser(payload);
    onSuccess(payload);
    setSubmitting(false);
  };

  const handleCopyCode = () => {
    if (!registeredUser) return;
    navigator.clipboard.writeText(registeredUser.secureCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    localStorage.removeItem("savora_waitlist_user");
    setRegisteredUser(null);
    setFormData({ fullName: "", mobileNumber: "", emailId: "" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop screen blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-lg rounded-[36px] bg-[#0b0b0b] border border-white/10 p-5 sm:p-8 overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto"
          >
            {/* Elegant visual line lights */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-green/40 to-transparent" />
            <div className="absolute top-12 left-12 w-[180px] h-[180px] bg-emerald-green/5 blur-[80px] rounded-full pointer-events-none" />

            {/* Header control */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-15">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full overflow-hidden border border-emerald-green/25 bg-white/5 shadow-[0_0_12px_rgba(0,200,150,0.15)] shrink-0 select-none">
                  <img src={savoraLogo} alt="Savora Finance" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-widest uppercase font-mono">SAVORA VAULT PRIVILEGE</h3>
                  <span className="text-[8px] font-mono text-zinc-500 tracking-[0.2em] block font-black uppercase">EXCLUSIVE ACCESS ALLOCATION</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-6 space-y-6 relative z-10 text-left">
              {!registeredUser ? (
                <>
                  <div className="space-y-2">
                    <h4 className="font-serif text-2xl font-extrabold text-white tracking-tight">
                      Join Savora Finance Private Limited Waitlist
                    </h4>
                    <p className="text-zinc-400 text-xs font-light leading-relaxed">
                      Savora compounds micro-savings using high-yield sovereign notes. Enter your details to reserve your priority yield slot in the next ledger rollout sequence.
                    </p>
                  </div>

                  {/* Form fields */}
                  <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Full Name Block */}
                    <div className="space-y-1.5">
                      <label className="text-[8.5px] font-mono tracking-widest text-[#777] uppercase font-black block">Full Name</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                          <User className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          placeholder="Your full name"
                          className={`w-full bg-[#121212]/80 border ${errors.fullName ? "border-red-500/50 focus:border-red-500" : "border-white/5 focus:border-emerald-green/45"} focus:bg-[#151515] hover:border-white/10 text-white rounded-xl py-3 px-10 text-xs font-sans placeholder-zinc-650 outline-none transition-all`}
                        />
                      </div>
                      {errors.fullName && (
                        <span className="text-[9.5px] text-red-400 font-mono italic block">{errors.fullName}</span>
                      )}
                    </div>

                    {/* Mobile Number Block */}
                    <div className="space-y-1.5">
                      <label className="text-[8.5px] font-mono tracking-widest text-[#777] uppercase font-black block">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                          <Phone className="h-4 w-4" />
                        </span>
                        <input
                          type="tel"
                          required
                          value={formData.mobileNumber}
                          onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                          placeholder="Your mobile number"
                          className={`w-full bg-[#121212]/80 border ${errors.mobileNumber ? "border-red-500/50 focus:border-red-500" : "border-white/5 focus:border-emerald-green/45"} focus:bg-[#151515] hover:border-white/10 text-white rounded-xl py-3 px-10 text-xs font-sans placeholder-zinc-650 outline-none transition-all`}
                        />
                      </div>
                      {errors.mobileNumber && (
                        <span className="text-[9.5px] text-red-400 font-mono italic block">{errors.mobileNumber}</span>
                      )}
                    </div>

                    {/* Email ID Block */}
                    <div className="space-y-1.5">
                      <label className="text-[8.5px] font-mono tracking-widest text-[#777] uppercase font-black block">Email Address (ID)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          type="email"
                          required
                          value={formData.emailId}
                          onChange={(e) => handleInputChange("emailId", e.target.value)}
                          placeholder="Your email address"
                          className={`w-full bg-[#121212]/80 border ${errors.emailId ? "border-red-500/50 focus:border-red-500" : "border-white/5 focus:border-emerald-green/45"} focus:bg-[#151515] hover:border-white/10 text-white rounded-xl py-3 px-10 text-xs font-sans placeholder-zinc-650 outline-none transition-all`}
                        />
                      </div>
                      {errors.emailId && (
                        <span className="text-[9.5px] text-red-400 font-mono italic block">{errors.emailId}</span>
                      )}
                    </div>

                    <div className="flex items-start gap-2.5 bg-white/[0.01] border border-white/[0.03] p-3 rounded-2xl text-[10px] text-zinc-500 leading-normal font-light">
                      <Lock className="h-3.5 w-3.5 text-zinc-600 shrink-0 mt-0.5" />
                      <span>By registering, you queue for the sovereign allocation vaults. Your data is protected by private custom ledgers of Savora Finance Private Limited.</span>
                    </div>

                    {/* Action button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-matte-black bg-emerald-green hover:bg-emerald-green/85 disabled:opacity-55 active:scale-95 transition-all text-center cursor-pointer shadow-md select-none flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-matte-black border-t-transparent rounded-full animate-spin" />
                          VERIFYING LEDGER NODE...
                        </>
                      ) : (
                        "SUBMIT WAITLIST INQUIRY"
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* SUCCESS TICKET STATE: 3D-FEELING METALLIC RECEIPT PASS */
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="h-12 w-12 rounded-full bg-emerald-green/10 border border-emerald-green/20 text-emerald-green flex items-center justify-center mx-auto mb-2 animate-bounce">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-white">Queue Allocation Confirmed</h3>
                    <p className="text-zinc-400 text-xs font-light max-w-sm mx-auto">
                      Your Savora Wealth Access Key has been compiled successfully to state nodes. Keep your verification code safe.
                    </p>
                  </div>

                  {/* PREMIUM HOLOGRAPHIC TICKET DISPLAY */}
                  <div className="relative rounded-3xl border border-emerald-green/20 bg-gradient-to-br from-[#0e0e0e] to-[#141414] p-5 sm:p-6 overflow-hidden shadow-2xl space-y-5">
                    {/* Watermark Logo backdrop */}
                    <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-emerald-green/[0.02] rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[linear-gradient(135deg,rgba(0,200,150,0.06)_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none" />

                    {/* Header line */}
                    <div className="flex justify-between items-center pb-3 border-b border-white/5 text-[9px] font-mono text-[#555]">
                      <span>SAVORA FINANCE PRIVATE LIMITED</span>
                      <span className="text-emerald-green font-bold flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-emerald-green animate-ping" /> SECURED PASS
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-left space-y-1">
                        <span className="text-[7.5px] font-mono text-zinc-550 block font-bold">CLIENT BENEFICIARY</span>
                        <span className="text-xs font-semibold text-white truncate block">{registeredUser.fullName}</span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-[7.5px] font-mono text-zinc-550 block font-bold flex justify-end">METRIC CLASS</span>
                        <span className="text-xs font-mono font-bold text-gold-accent flex justify-end gap-1 items-center">
                          ELITE PRIORITY PASS
                        </span>
                      </div>
                      <div className="text-left space-y-1">
                        <span className="text-[7.5px] font-mono text-zinc-550 block font-bold">MOBILE IDENTIFIER</span>
                        <span className="text-xs font-mono text-zinc-300 block">{registeredUser.mobileNumber}</span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-[7.5px] font-mono text-zinc-550 block font-bold">REGISTERED EXPIRY</span>
                        <span className="text-xs font-mono text-zinc-300 block">SVR Ledger V5</span>
                      </div>
                    </div>

                    {/* QR Code and Queue position slot */}
                    <div className="flex items-center gap-4 bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                      {/* Interactive copy verification button */}
                      <div className="h-14 w-14 rounded-xl border border-white/10 bg-[#070707] flex items-center justify-center text-zinc-500 shrink-0">
                        <QrCode className="h-10 w-10 opacity-75" />
                      </div>
                      
                      <div className="space-y-0.5 text-left grow min-w-0">
                        <span className="text-[7px] font-mono text-zinc-500 block uppercase font-bold">STABLE LEDGER VERIFICATION</span>
                        <button
                          onClick={handleCopyCode}
                          className="flex items-center gap-1.5 text-xs text-white font-mono font-bold bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg border border-white/5 cursor-pointer transition-all active:scale-95 truncate w-full"
                        >
                          <span className="truncate">{registeredUser.secureCode}</span>
                          {copied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-green shrink-0 animate-bounce" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Big Queue banner */}
                    <div className="pt-4 border-t border-white/5 flex flex-col justify-center items-center text-center space-y-1 relative pr-1">
                      <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-widest font-black block">COMMITTED QUEUE ALLOCATION SLOT</span>
                      <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-green via-white to-gold-accent font-mono tracking-wider drop-shadow-lg">
                        #{registeredUser.queuePosition?.toLocaleString()}
                      </div>
                      <span className="text-[7.5px] font-mono text-emerald-green">PREDICTED ACCESS ARRIVAL: 4 DAYS 12 HOURS</span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      onClick={handleReset}
                      className="py-2.5 px-4 rounded-xl text-[10px] font-mono tracking-widest font-black uppercase text-zinc-500 hover:text-white transition-all cursor-pointer border border-white/5 hover:border-white/10 bg-transparent"
                    >
                      RESET PASS ENTRY
                    </button>
                    <button
                      onClick={onClose}
                      className="py-2.5 px-5 rounded-xl text-[10px] font-mono tracking-widest font-black uppercase text-matte-black bg-white hover:bg-zinc-200 transition-all cursor-pointer font-bold"
                    >
                      DISMISS PROTOCOL
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Verification assurance footer indicator */}
            <div className="border-t border-white/5 pt-4 text-center text-[7.5px] font-mono text-zinc-650 flex justify-between items-center bg-transparent">
              <span className="flex items-center gap-1.5 uppercase font-black tracking-wider">
                <ShieldCheck className="h-3 w-3 text-emerald-green" /> REGULATED LEDGER STABILITY
              </span>
              <span>NODE EX-9921_A</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
