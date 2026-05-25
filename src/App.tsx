/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Coins,
  TrendingUp,
  Bot,
  ArrowRight,
  Sparkles,
  Star,
  Lock,
  Check,
  Menu,
  X,
  CreditCard,
  Zap,
  ChevronRight,
  ArrowUpRight,
  Tv,
  Users,
  LineChart,
  HelpCircle,
  Palette,
} from "lucide-react";
import { FeatureItem, StatItem, TestimonialItem } from "./types";
import Preloader from "./components/Preloader";
import WealthCalculator from "./components/WealthCalculator";
import SavoraAdvisor from "./components/SavoraAdvisor";
import ThreeDVault from "./components/ThreeDVault";
import SavoraWaitlist from "./components/SavoraWaitlist";
import SavoraAdmin from "./components/SavoraAdmin";

// Reference generated cinematic asset path
import heroVisualAsset from "./assets/images/savora_hero_visual_1779736420017.png";

// Reference generated logo asset path
import savoraLogo from "./assets/images/savora_finance_logo_1779737512814.png";

// Features configuration data
const FEATURES: FeatureItem[] = [
  {
    id: "savings",
    title: "Smart Savings Auto-Vaults",
    description: "Savora's algorithmic sweep rounds up spare transactions into high-yielding automated micro-portfolios automatically.",
    glowColor: "border-emerald-green/30 shadow-[0_0_20px_rgba(0,200,150,0.1)]",
    details: ["Fractional roundups", "Dynamic sweep intervals", "Auto-yield optimization", "Multi-institution connections"],
  },
  {
    id: "budgeting",
    title: "Cognitive Budget Overseer",
    description: "Real-time AI behavioral insights categorize and protect your goals, sending gentle strategizing cues to avoid friction.",
    glowColor: "border-gold-accent/30 shadow-[0_0_20px_rgba(245,193,92,0.1)]",
    details: ["Predictive expense tracking", "Customized behavior model", "Zero manual logging", "Target-budget lockdowns"],
  },
  {
    id: "investing",
    title: "Quantum Fractional Investments",
    description: "Access curated high-growth modern indexes, prime real estate pools, or private treasuries starting at just ₹10.",
    glowColor: "border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]",
    details: ["Digital treasury bills", "Fractional premium commodities", "Curated AI balance indexes", "Securitized property notes"],
  },
  {
    id: "analytics",
    title: "Real-Time Neural Analytics",
    description: "Gaze through a glass dashboard mapping compound interest velocity, liquidity depth, and tax-efficient pathways.",
    glowColor: "border-emerald-green/30 shadow-[0_0_20px_rgba(0,200,150,0.1)]",
    details: ["Daily compounding trackers", "Tax harvest indicators", "Horizon risk analyzer", "Instant balance audits"],
  },
];

// Statistics configuration data
const STATS: StatItem[] = [
  { id: "stat-users", label: "Active Global Trust", value: "1.2M+", subtext: "Verified private vaults", glowColor: "text-emerald-green shadow-[0_0_12px_rgba(0,200,150,0.2)]" },
  { id: "stat-saved", label: "Capital Accrued & Protected", value: "₹530Cr+", subtext: "Compound interest compounded", glowColor: "text-gold-accent shadow-[0_0_12px_rgba(245,193,92,0.2)]" },
  { id: "stat-sec", label: "Cryptographic Custody", value: "99.99%", subtext: "Advanced biometric ledgering", glowColor: "text-white" },
  { id: "stat-support", label: "Savora WealthMind uptime", value: "24/7 AI", subtext: "Non-stop private strategizing", glowColor: "text-emerald-green shadow-[0_0_12px_rgba(0,200,150,0.2)]" },
];

// Curated high-net-worth customer reviews
const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "test-1",
    name: "Aarav Mehta",
    role: "Private Equity Strategist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    rating: 5,
    wealthStats: "Accrued ₹8.5L in 14 Months",
    content: "Savora has replaced my traditional wealth managers. The micro-compounding and automated sweeps operate seamlessly in the shadow of my secondary accounts.",
  },
  {
    id: "test-2",
    name: "Dr. Anjali Sen",
    role: "Clinical Director",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    rating: 5,
    wealthStats: "Invested ₹14L via smart vaults",
    content: "The cognitive budget tracking is exceptionally intuitive. It handles compound calculation in microgravity blocks, preserving capital while I focus on patient care.",
  },
  {
    id: "test-3",
    name: "Rohan Das",
    role: "Founding Engineer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    rating: 5,
    wealthStats: "+14.2% Compound yield p.a.",
    content: "As a developer, I am captivated by Savora's design. The glassmorphic calculator and Savora WealthMind AI's responses are accurate and strategic. Absolute work of art.",
  },
];



export default function App() {
  const [loading, setLoading] = useState(true);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [theme, setTheme] = useState<"matte-black" | "deep-navy">(() => {
    const saved = localStorage.getItem("savora_theme");
    return (saved === "deep-navy" || saved === "matte-black") ? saved : "matte-black";
  });
  const [registeredUser, setRegisteredUser] = useState<any>(() => {
    const saved = localStorage.getItem("savora_waitlist_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeFeatureTab, setActiveFeatureTab] = useState<string>("savings");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === "matte-black" ? "deep-navy" : "matte-black";
    setTheme(nextTheme);
    localStorage.setItem("savora_theme", nextTheme);
  };

  // Auto-close menu on anchor clicks
  const navigateToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <div className={`min-h-screen ${theme === "deep-navy" ? "bg-[#060D20]" : "bg-matte-black"} text-soft-white font-sans selection:bg-emerald-green/30 relative overflow-x-hidden transition-colors duration-700`}>
        
        {/* CINEMATIC BACKDROP ORBS GRAPHICS */}
        {theme === "deep-navy" ? (
          <>
            <div className="absolute top-[8%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,rgba(63,94,251,0.08)_0%,rgba(0,200,150,0.03)_50%,transparent_70%)] pointer-events-none z-0 transition-all duration-1000" />
            <div className="absolute top-[35%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.06)_0%,rgba(245,193,92,0.02)_50%,transparent_70%)] pointer-events-none z-0 transition-all duration-1000" />
            <div className="absolute bottom-[10%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-[radial-gradient(circle,rgba(63,94,251,0.05)_0%,transparent_70%)] pointer-events-none z-0 transition-all duration-1000" />
          </>
        ) : (
          <>
            <div className="absolute top-[8%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,rgba(0,200,150,0.06)_0%,transparent_70%)] pointer-events-none z-0 transition-all duration-1000" />
            <div className="absolute top-[35%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(245,193,92,0.04)_0%,transparent_70%)] pointer-events-none z-0 transition-all duration-1000" />
            <div className="absolute bottom-[10%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-[radial-gradient(circle,rgba(0,200,150,0.04)_0%,transparent_70%)] pointer-events-none z-0 transition-all duration-1000" />
          </>
        )}

        {/* STICKY GLASS NAVBAR */}
        <header className="sticky top-0 z-50 glass-panel border-b border-white/5 scale-100 transition-all">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between">
            {/* Branding Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full overflow-hidden border border-emerald-green/25 bg-white/5 shadow-[0_0_15px_rgba(0,200,150,0.15)] group-hover:border-emerald-green/55 transition-all">
                <img src={savoraLogo} alt="Savora Finance Private Limited Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-sans text-sm sm:text-base font-bold tracking-[0.1em] text-white leading-none">SAVORA FINANCE</h1>
                <span className="text-[7.5px] uppercase font-mono tracking-[0.25em] text-zinc-500 font-semibold block mt-1">PRIVATE LIMITED</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              {["Features", "3D Vault", "Vault Simulator", "Statistics", "Testimonials", "Queries", "Admin Panel"].map((sec) => {
                const mapId = sec.toLowerCase().replace(" ", "_");
                const isAdminPanel = sec === "Admin Panel";
                return (
                  <button
                    key={sec}
                    onClick={() => {
                      if (isAdminPanel) {
                        setAdminOpen(true);
                      } else {
                        navigateToSection(mapId);
                      }
                    }}
                    className={`hover:text-white transition-all cursor-pointer relative py-1 group flex items-center gap-1.5 ${
                      isAdminPanel ? "text-emerald-green font-bold" : ""
                    }`}
                  >
                    {isAdminPanel && <Lock className="h-3 w-3 text-emerald-green shrink-0 text-[10px]" />}
                    {sec}
                    <span className={`absolute bottom-0 left-0 w-0 h-[1.5px] bg-emerald-green transition-all group-hover:w-full ${
                      isAdminPanel ? "w-1/2 bg-emerald-green" : ""
                    }`} />
                  </button>
                );
              })}
            </nav>

            {/* CTA Private Consult & Mobile hamburger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWaitlistOpen(true)}
                className="flex items-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-green bg-emerald-green/5 hover:bg-emerald-green/10 border border-emerald-green/20 hover:border-emerald-green/45 transition-all cursor-pointer select-none active:scale-95 shadow-md shadow-emerald-green/5"
                id="header_waitlist_toggle"
              >
                <Users className="h-4 w-4" />
                <span className="hidden xl:inline">
                  {registeredUser ? `Node #${registeredUser.queuePosition?.toLocaleString()}` : "Priority Access"}
                </span>
                <span className="inline xl:hidden">
                  {registeredUser ? `#${registeredUser.queuePosition?.toLocaleString()}` : "Waitlist"}
                </span>
              </button>

              <button
                onClick={() => setAdvisorOpen(true)}
                className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-matte-black bg-emerald-green hover:bg-emerald-green/85 border border-emerald-green/10 shadow-[0_4px_16px_rgba(0,200,150,0.2)] hover:shadow-[0_4px_24px_rgba(0,200,150,0.35)] active:scale-95 transition-all cursor-pointer"
                id="header_ai_consult_btn"
              >
                <Bot className="h-4 w-4" /> AI Strategist
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 md:hidden text-zinc-300 transition-all cursor-pointer"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile responsive navigation drawer */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-white/5 bg-matte-black/95 backdrop-blur-md px-6 py-6 space-y-4 text-left"
              >
                <div className="flex flex-col gap-3 font-semibold text-xs tracking-widest uppercase text-zinc-400">
                  {["Features", "3D Vault", "Vault Simulator", "Statistics", "Testimonials", "Queries", "Admin Panel"].map((sec) => {
                    const mapId = sec.toLowerCase().replace(" ", "_");
                    const isAdminPanel = sec === "Admin Panel";
                    return (
                      <button
                        key={sec}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (isAdminPanel) {
                            setAdminOpen(true);
                          } else {
                            navigateToSection(mapId);
                          }
                        }}
                        className={`py-2.5 px-3 rounded-xl hover:bg-white/5 hover:text-white text-left transition-all cursor-pointer flex items-center justify-between ${
                          isAdminPanel ? "text-emerald-green font-bold bg-emerald-green/5" : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isAdminPanel && <Lock className="h-3.5 w-3.5 text-emerald-green shrink-0" />}
                          {sec}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setWaitlistOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-[#0b0b0b] bg-white hover:bg-zinc-200 transition-all cursor-pointer"
                  >
                    <Users className="h-4 w-4" /> Join Waitlist Node
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAdvisorOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-matte-black bg-emerald-green hover:bg-emerald-green/90 transition-all cursor-pointer"
                  >
                    <Bot className="h-4 w-4" /> AI Strategist Consult
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* HERO SECTION */}
        <section className="relative px-6 py-16 sm:py-24 max-w-7xl mx-auto z-10" id="hero_landing_vault">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* HERO TYPOGRAPHY */}
            <div className="lg:col-span-6 space-y-8 text-left">
              {/* Trust Badge overlay */}
              <div className="inline-flex items-center gap-2.5 bg-emerald-green/5 border border-emerald-green/15 px-4 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-green rounded-full shadow-[0_0_6px_rgba(0,200,150,1)] animate-ping" />
                <span className="text-[9px] uppercase tracking-[0.25em] font-mono font-bold text-emerald-green">
                  SECURE DECENTRALIZED COMPILING LIVE
                </span>
              </div>

              <div className="space-y-4">
                <h2 className="font-serif text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
                  Save Small. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-green via-white to-gold-accent drop-shadow-[0_2px_15px_rgba(0,200,150,0.15)]">Grow Big.</span>
                </h2>
                <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-lg">
                  Savora helps users build wealth smarter with AI-powered saving, automated investing, and financial tracking tools built within dynamic cryptographic vaults.
                </p>
              </div>

              {/* ACTION CALLS */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() => navigateToSection("vault_simulator")}
                  className="px-8 py-4 rounded-full text-xs font-semibold tracking-widest uppercase text-matte-black bg-emerald-green hover:bg-emerald-green/85 border border-emerald-green/10 shadow-[0_6px_20px_rgba(0,200,150,0.25)] hover:shadow-[0_6px_35px_rgba(0,200,150,0.4)] active:scale-95 transition-all text-center cursor-pointer"
                >
                  Get Started
                </button>
                <button
                  onClick={() => setAdvisorOpen(true)}
                  className="px-8 py-4 rounded-full text-xs font-semibold tracking-widest uppercase text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-green/30 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <Bot className="h-4 w-4 text-emerald-green" /> Consult AI WealthMind
                </button>
              </div>

              {/* Dynamic stats snippet inside hero */}
              <div className="pt-6 border-t border-white/5 flex items-center gap-8 text-zinc-500 font-mono text-[10px] tracking-wider uppercase font-semibold">
                <span className="flex items-center gap-2">
                  <span className="text-white">NO LOCKED MATRIX</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-emerald-green shadow-sm">₹10 MIN MINIMUM</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-white">BANK-GRADE LEDGERS</span>
                </span>
              </div>
            </div>

            {/* HERO VISUAL: DETAILED CINEMATIC PORTFOLIO DISPLAY COINS CONTAINER */}
            <div className="lg:col-span-6 relative w-full flex justify-center lg:justify-end">
              <div className="relative max-w-lg w-full aspect-16/9 rounded-[32px] overflow-hidden border border-white/10 shadow-3xl bg-[#090909]/40 group p-1 backdrop-blur-md">
                
                {/* Visual Glassmorphic overlay rails */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent z-10 pointer-events-none" />
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="text-[8px] font-mono tracking-widest px-2.5 py-1 rounded-md bg-black/60 border border-white/10 text-gold-accent font-bold uppercase backdrop-blur-md">
                    REALTIME RENDERING
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end backdrop-blur-md bg-black/65 p-4 rounded-2xl border border-white/5">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase font-black block">Active Yield Reserve</span>
                    <span className="text-sm font-bold text-white font-mono">1M Active Safes Filled</span>
                  </div>
                  <button
                    onClick={() => navigateToSection("vault_simulator")}
                    className="p-2 rounded-xl bg-emerald-green hover:bg-emerald-green/85 text-matte-black cursor-pointer transition-all flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest"
                  >
                    Calibrate <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Generated Cinematic asset image */}
                <img
                  src={heroVisualAsset}
                  alt="Savora Premium Cinematic Asset"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-[28px] scale-100 group-hover:scale-[1.02] transition-transform duration-[6000ms] ease-out"
                />
              </div>
            </div>

          </div>
        </section>

        {/* FEATURES BENTO SECTION */}
        <section className="px-6 py-20 bg-gradient-to-b from-transparent to-black/35 relative z-10 border-t border-white/5" id="features">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-green/5 border border-emerald-green/15 px-3.5 py-1 rounded-full mx-auto">
                <Sparkles className="h-3.5 w-3.5 text-emerald-green" />
                <span className="text-[9px] uppercase tracking-widest font-mono text-emerald-green font-bold">SAVORA TECHNOLOGY SPECIFICATIONS</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Architected for Luxurious Precision
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm font-light max-w-xl mx-auto">
                Examine Savora's custom modules engineered to manage micro-transactions, calculate compounding intervals, and optimize portfolio health automatically.
              </p>
            </div>

            {/* Interactive Feature Selectors & Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Feature Navigator Row */}
              <div className="lg:col-span-4 space-y-3 flex flex-col">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest text-left px-3 block font-bold">Select Active Core Module</span>
                {FEATURES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveFeatureTab(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                      activeFeatureTab === item.id
                        ? "bg-white/[0.04] border-white/20 shadow-[0_4px_20px_rgba(251,251,251,0.03)]"
                        : "bg-transparent border-transparent hover:bg-white/[0.01]"
                    }`}
                  >
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${activeFeatureTab === item.id ? "text-emerald-green" : "text-zinc-300 group-hover:text-white"}`}>
                        {item.title.split(" - ")[0]}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-light mt-0.5 truncate max-w-[240px]">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${activeFeatureTab === item.id ? "text-emerald-green" : "text-zinc-600 group-hover:text-zinc-400"}`} />
                  </button>
                ))}
              </div>

              {/* Large Selected Feature Card Tray Display */}
              <div className="lg:col-span-8">
                {FEATURES.map((item) => {
                  if (item.id !== activeFeatureTab) return null;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`glass-panel p-6 sm:p-8 rounded-[32px] border ${item.glowColor} flex flex-col justify-between space-y-8 text-left relative overflow-hidden`}
                    >
                      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-emerald-green/5 to-transparent blur-2xl pointer-events-none" />

                      <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-emerald-green uppercase tracking-widest font-black block">Active Module Status: Online</span>
                          <span className="h-2 w-2 rounded-full bg-emerald-green animate-pulse" />
                        </div>
                        <h3 className="font-serif text-2.5xl font-black text-white leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-zinc-400 text-xs sm:text-sm font-light leading-relaxed max-w-2xl">
                          {item.description}
                        </p>
                      </div>

                      {/* Detail points specifications inside Feature */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/5 relative z-10">
                        {item.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300">
                            <span className="p-1 rounded-md bg-emerald-green/10 border border-emerald-green/20 text-emerald-green">
                              <Check className="h-3 w-3" />
                            </span>
                            <span className="font-sans">{detail}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 flex justify-between items-center relative z-10">
                        <button
                          onClick={() => setAdvisorOpen(true)}
                          className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-green hover:text-white transition-all font-bold cursor-pointer"
                        >
                          Instruct Savora Wealthmind regarding this <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-[8px] font-mono text-zinc-600 uppercase font-bold tracking-widest">SVR-REF-0{item.id.toUpperCase()}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

            </div>

          </div>
        </section>

        {/* INTERACTIVE 3D LEDGER VAULT SECTION */}
        <section className="px-6 py-20 max-w-7xl mx-auto relative z-10 border-t border-white/5" id="3d_vault">
          <ThreeDVault />
        </section>

        {/* VAULT WEALTH CALCULATOR ESTIMATOR SECTION */}
        <section className="px-6 py-20 max-w-7xl mx-auto relative z-10 border-t border-white/5" id="vault_simulator">
          <div className="space-y-12">
            
            {/* Title block */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-gold-accent/5 border border-gold-accent/15 px-3.5 py-1 rounded-full mx-auto">
                <Coins className="h-3.5 w-3.5 text-gold-accent animate-pulse" />
                <span className="text-[9px] uppercase tracking-widest font-mono text-gold-accent font-bold">SAVORA STRATEGIC CORE APPARATUS</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Simulate Your Compounding Milestones
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm font-light max-w-xl mx-auto">
                Adjust savings frequency, growth yields, and timeline horizons. Observe in real-time as your private Savora gold jar gathers cumulative compound interest.
              </p>
            </div>

            {/* Mount calculator component */}
            <WealthCalculator />

          </div>
        </section>

        {/* STATISTICS SECTION */}
        <section className="px-6 py-16 bg-black/[0.15] border-t border-white/5 relative z-10" id="statistics">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map((stat) => (
                <div
                  key={stat.id}
                  className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col justify-between space-y-4 text-left"
                >
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold leading-none">{stat.label}</span>
                  <div className="space-y-1">
                    <h3 className={`text-3xl font-extrabold tracking-tight ${stat.glowColor.includes("text-emerald-green") ? "text-emerald-green" : stat.glowColor.includes("text-gold-accent") ? "text-gold-accent" : "text-white"}`}>
                      {stat.value}
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-light leading-none">{stat.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="px-6 py-20 max-w-7xl mx-auto relative z-10 border-t border-white/5" id="testimonials">
          <div className="space-y-12">
            
            {/* Title block */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-green/5 border border-emerald-green/15 px-3.5 py-1 rounded-full mx-auto">
                <Users className="h-3.5 w-3.5 text-emerald-green" />
                <span className="text-[9px] uppercase tracking-widest font-mono text-emerald-green font-bold">CURATED CLIENT REVIEWS</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Trusted by Forward-Thinking Capital
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm font-light max-w-xl mx-auto">
                Discover accounts from individuals who have automated their savings structures using Savora private crypto-vault systems.
              </p>
            </div>

            {/* Testimonials grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.id}
                  className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between space-y-6 text-left group"
                >
                  <div className="space-y-4">
                    {/* Star Rating & Growth banner */}
                    <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-full">
                      <div className="flex gap-0.5 text-gold-accent">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-gold-accent" />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono text-emerald-green tracking-wide block font-extrabold uppercase">
                        {t.wealthStats}
                      </span>
                    </div>

                    <p className="text-zinc-300 text-xs leading-relaxed font-light font-sans">
                      "{t.content}"
                    </p>
                  </div>

                  {/* Profile line */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-full object-cover border border-white/15"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide">{t.name}</h4>
                      <span className="text-[10px] text-zinc-500 font-mono block leading-none mt-0.5">{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* NEW QUERIES / CONTACT SECTION */}
        <section className="px-6 py-20 bg-gradient-to-b from-black/20 to-transparent relative z-10 border-t border-white/5" id="queries">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Title block */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-green/5 border border-emerald-green/15 px-3.5 py-1 rounded-full mx-auto" style={{ animationDuration: "4s" }}>
                <HelpCircle className="h-3.5 w-3.5 text-emerald-green" />
                <span className="text-[9px] uppercase tracking-widest font-mono text-emerald-green font-bold">SAVORA COMMUNICATIONS PROTOCOL</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Have you any query?
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm font-light max-w-xl mx-auto">
                Our support channels are active 24/7. Connect directly with the Savora Finance Private Limited advisory office.
              </p>
            </div>

            {/* Core Card Grid containing Logo Visual & Inquiry Submission Form */}
            <div className="glass-panel rounded-[32px] border border-white/10 overflow-hidden bg-white/[0.01] shadow-[0_15px_50px_rgba(0,0,0,0.5)] grid grid-cols-1 md:grid-cols-2 bg-matte-black/40">
              
              {/* Left Side: Logo Illustration Display */}
              <div className="p-8 sm:p-10 bg-gradient-to-br from-white/[0.02] to-transparent border-r border-white/5 flex flex-col justify-between space-y-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,200,150,0.06)_0%,transparent_60%)] pointer-events-none" />
                
                <div className="space-y-4 relative z-10 text-left">
                  <span className="text-[9px] font-mono text-emerald-green uppercase tracking-widest font-black block">Corporate Identity Node</span>
                  <h3 className="text-xl font-bold text-white tracking-tight">Savora Finance Private Limited</h3>
                  <p className="text-zinc-400 text-xs font-light leading-relaxed">
                    Licensed financial micro-savings and automated compounding systems. Enter your inquiry, or directly email our private ledger vault administrators.
                  </p>
                </div>

                {/* Refined centered logo mockup image */}
                <div className="relative aspect-square max-w-[180px] mx-auto w-full rounded-full overflow-hidden border border-white/10 bg-[#0c0c0c] shadow-2xl p-1.5 group select-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 animate-[pulse_6s_infinite] opacity-80" />
                  <img
                    src={savoraLogo}
                    alt="Savora Finance Private Limited Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-2 inset-x-2 z-20 text-center">
                    <span className="text-[8px] font-mono tracking-[0.2em] text-zinc-400 uppercase font-black">OFFICIAL VAULT ACCREDITATION</span>
                  </div>
                </div>

                <div className="text-left space-y-2 relative z-10">
                  <span className="text-[8.5px] uppercase font-mono tracking-wider text-zinc-500 font-bold block">Security Handshake</span>
                  <p className="text-[10px] text-zinc-450 leading-relaxed font-light">
                    Every connection and query transmitted is protected under high-grade biometric custom ledger protocols.
                  </p>
                </div>
              </div>

              {/* Right Side: Interactive Quick Email and Contact Action Panel */}
              <div className="p-8 sm:p-10 flex flex-col justify-between space-y-8 text-left bg-black/25">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-gold-accent uppercase tracking-widest font-black block">Direct Connect Gate</span>
                    <h3 className="text-lg font-bold text-white">Advisory Office</h3>
                  </div>

                  <p className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed">
                    For direct access to support, client services, or physical key backups, you may contact our private ledger directly:
                  </p>

                  {/* Mailbox copy block */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col space-y-3.5 shadow-inner">
                    <span className="text-[8px] font-mono tracking-widest text-[#777] uppercase font-bold block">Verified Support Mailbox</span>
                    
                    <a
                      href="mailto:savorafinanceprivatelimited@gmail.com"
                      className="group flex items-center justify-between gap-3 text-emerald-green hover:text-white transition-colors duration-300 bg-emerald-green/5 hover:bg-emerald-green/15 border border-emerald-green/15 px-4 py-3 rounded-xl cursor-pointer overflow-hidden"
                    >
                      <span className="text-xs sm:text-sm font-mono tracking-wide truncate">
                        savorafinanceprivatelimited@gmail.com
                      </span>
                      <span className="p-1.5 rounded-lg bg-emerald-green/10 text-emerald-green border border-emerald-green/10 group-hover:bg-emerald-green group-hover:text-black transition-all shrink-0">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </a>
                  </div>

                  {/* Quick helper tip */}
                  <div className="flex gap-2.5 text-[11px] text-zinc-400 font-light items-start bg-white/[0.01] p-3 rounded-xl border border-white/[0.02]">
                    <span className="text-gold-accent shrink-0 font-bold mt-0.5">ℹ</span>
                    <span>Expected response turnaround from our support office is less than 30 minutes. Be sure to reference your active Account Vault node ID.</span>
                  </div>
                </div>

                {/* Secondary email action trigger */}
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                  <a
                    href="mailto:savorafinanceprivatelimited@gmail.com"
                    className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-matte-black bg-emerald-green hover:bg-emerald-green/90 transition-all text-center cursor-pointer block"
                  >
                    Send Quick Query
                  </a>
                  <button
                    onClick={() => setAdvisorOpen(true)}
                    className="w-full py-3.5 rounded-xl text-xs font-semibold tracking-widest uppercase text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bot className="h-3.5 w-3.5 text-emerald-green" /> Consult Savora AI
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* PERSISTENT FLOATING THEME SELECTOR BUTTON */}
        <div className="fixed bottom-6 left-6 z-40">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="flex items-center gap-2.5 p-3.5 sm:p-4 rounded-full bg-black/60 hover:bg-black/85 text-white shadow-[0_6px_30px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-md cursor-pointer select-none transition-colors"
            id="floating_theme_toggler"
          >
            <div className="relative">
              <span className={`absolute -top-1.5 -right-1.5 h-2.5 w-2.5 rounded-full border-2 border-matte-black animate-pulse ${theme === 'deep-navy' ? 'bg-[#3f5efb]' : 'bg-emerald-green'}`} />
              <Palette className={`h-4 w-4 ${theme === 'deep-navy' ? 'text-indigo-400' : 'text-emerald-green'}`} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest pr-1 font-mono hidden sm:inline-block">
              {theme === "deep-navy" ? "Deep Navy" : "Matte Black"}
            </span>
          </motion.button>
        </div>

        {/* BOTTOM STICKY FLOATING WEALTHMIND ADVISOR LAUNCHER */}
        <div className="fixed bottom-6 right-6 z-40">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAdvisorOpen(true)}
            className="flex items-center gap-2.5 p-4 rounded-full bg-emerald-green hover:bg-emerald-green/85 text-matte-black shadow-[0_6px_30px_rgba(0,200,150,0.35)] cursor-pointer select-none transition-colors border border-emerald-green/10"
            id="floating_wealthmind_launcher"
          >
            <div className="relative">
              <span className="absolute -top-1.5 -right-1.5 h-2.5 w-2.5 rounded-full bg-gold-accent border-2 border-matte-black animate-pulse" />
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest pr-1 font-sans hidden sm:inline-block">AI Strategist</span>
          </motion.button>
        </div>

        {/* FOOTER CREDITS */}
        <footer className="border-t border-white/5 bg-[#080808]/80 py-12 text-zinc-500 font-mono text-xs text-center relative z-10">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-7.5 w-7.5 items-center justify-center rounded-full overflow-hidden border border-emerald-green/25 bg-white/5 shadow-[0_0_12px_rgba(0,200,150,0.15)] shrink-0 select-none">
                  <img src={savoraLogo} alt="Savora Finance" className="w-full h-full object-cover" />
                </div>
                <span className="font-serif text-lg font-black text-white tracking-widest">SAVORA FINANCE</span>
              </div>
              <p className="text-[10px] font-medium tracking-wide font-sans text-zinc-500">
                Savora Finance Private Limited. Automated Compounding Vaults & Neural Custody Ledgers.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-bold tracking-wider uppercase text-zinc-400 font-mono">
              <span className="text-zinc-600">ABOUT</span>
              <button onClick={() => navigateToSection("queries")} className="text-zinc-600 hover:text-white transition-all cursor-pointer uppercase font-mono text-[10px] font-bold outline-none">CONTACT PORTALS</button>
              <button onClick={() => setAdminOpen(true)} className="text-emerald-green hover:underline hover:text-zinc-300 transition-all cursor-pointer uppercase font-mono text-[10px] font-bold outline-none flex items-center gap-1">🔒 SECURED ADMIN ACCESS</button>
              <button onClick={toggleTheme} className="text-gold-accent hover:underline hover:text-zinc-300 transition-all cursor-pointer uppercase font-mono text-[10px] font-bold outline-none flex items-center gap-1">🎨 AMBIENCE: {theme === "deep-navy" ? "DEEP NAVY" : "MATTE BLACK"}</button>
              <span className="text-zinc-600">DECENTRALIZED CLAUSES</span>
            </div>

            <div className="flex flex-col items-center md:items-end gap-1.5 text-[9px] font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-green">
                <span className="w-2 h-2 bg-emerald-green rounded-full animate-pulse" />
                Ledger Nodes Operational
              </span>
              <span>© {new Date().getFullYear()} Savora Finance Private Limited. All rights reserved.</span>
            </div>
          </div>
        </footer>

        {/* WEALTHMIND CHAT PORTAL SHEET */}
        <SavoraAdvisor
          isOpen={advisorOpen}
          onClose={() => setAdvisorOpen(false)}
          savingsSettings={{
            monthly: 8000,
            years: 15,
            estimatedWealth: "₹45.8 Lakh",
          }}
        />

        {/* HOLOGRAPHIC WAITLIST DIALOG */}
        <SavoraWaitlist
          isOpen={waitlistOpen}
          onClose={() => setWaitlistOpen(false)}
          onSuccess={(data) => {
            console.log("Waitlist compiled", data);
          }}
          registeredUser={registeredUser}
          setRegisteredUser={setRegisteredUser}
        />

        {/* SECURE CUSTODIAL ADMIN NODE */}
        <SavoraAdmin
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
        />

      </div>
    </>
  );
}
