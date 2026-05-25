/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Layers, 
  Cpu, 
  Coins, 
  ShieldCheck, 
  TrendingUp, 
  Sliders, 
  RefreshCw, 
  Compass, 
  Zap, 
  Lock,
  ArrowUpRight,
  Database
} from "lucide-react";

interface VaultSector {
  id: string;
  name: string;
  codename: string;
  desc: string;
  yieldRate: string;
  backingRatio: string;
  custodian: string;
  auditCode: string;
  highlightGlow: string;
  colorName: string; // emerald, gold, sapphire
  specs: { label: string; value: string }[];
}

const SECTORS: VaultSector[] = [
  {
    id: "aether",
    name: "Aether Liquidity Pool",
    codename: "SVR-ATH-01",
    desc: "A proprietary algorithmic micro-swept cash engine. Automatically scans daily transactions to round up micro-capitals into high-yield fractional government sovereign notes.",
    yieldRate: "8.45% p.a.",
    backingRatio: "115% Cash Equivalent",
    custodian: "Reserve Mutual Trust",
    auditCode: "AUD-ATH-0019A",
    highlightGlow: "from-emerald-green/40 to-transparent",
    colorName: "emerald-green",
    specs: [
      { label: "Sweep Interval", value: "Instant / Real-time" },
      { label: "Withdrawal Lock", value: "0 Hours - Liquid" },
      { label: "Security Backing", value: "Multi-sig Sovereign T-bills" },
      { label: "Risk Coefficient", value: "A++ Extremely Stable" }
    ]
  },
  {
    id: "helios",
    name: "Helios Gold Vaults",
    codename: "SVR-HLS-02",
    desc: "Direct fractional physical gold accumulation. Micro-sweeps are securely collateralized into physically-vaulted 99.9% fine certified gold bullion storage reserves.",
    yieldRate: "11.20% avg",
    backingRatio: "100% Allocated Gold",
    custodian: "Savora Security Depot",
    auditCode: "AUD-HLS-5520X",
    highlightGlow: "from-gold-accent/40 to-transparent",
    colorName: "gold-accent",
    specs: [
      { label: "Accrual Model", value: "Gram-Equivalent Weights" },
      { label: "Physical Delivery", value: "Minimum 10 Grams" },
      { label: "Sovereign Audit", value: "Monthly independent assays" },
      { label: "Storage Grade", value: "Grade-A Brinks Vaulting" }
    ]
  },
  {
    id: "quantum",
    name: "Quantum High-Yield Debt",
    codename: "SVR-QNT-03",
    desc: "Machine-learning optimized short term private corporate debt. Generates elevated compounding returns by routing fragmented micro-sweeps to pre-vetted corporate nodes.",
    yieldRate: "14.60% p.a.",
    backingRatio: "135% Collateralized Notes",
    custodian: "Prime Catalyst Partners",
    auditCode: "AUD-QNT-4411C",
    highlightGlow: "from-sky-400/40 to-transparent",
    colorName: "sky-400",
    specs: [
      { label: "Investment Node", value: "A+ Rated Corporate Debentures" },
      { label: "Compounding Base", value: "Daily Neural Rebalancing" },
      { label: "Default Margin", value: "< 0.04% Historically" },
      { label: "Auditor Signature", value: "Deloitte Node Verification" }
    ]
  },
  {
    id: "sovereign",
    name: "Zenith Sovereign Bonds",
    codename: "SVR-ZNT-04",
    desc: "Direct premium fractional treasury bills and state indices. Safely preserves capital on a cryptographic multi-state distributed ledger, ideal for multigenerational security.",
    yieldRate: "7.90% Fixed",
    backingRatio: "150% State Backed",
    custodian: "Sovereign Custody Ledger",
    auditCode: "AUD-ZNT-9988Z",
    highlightGlow: "from-white/30 to-transparent",
    colorName: "white",
    specs: [
      { label: "Bond Maturity", value: "Custom Flex Options" },
      { label: "Sovereign Tier", value: "State-Guaranteed Safe" },
      { label: "Tax Shielding", value: "Section 80C Compliant Node" },
      { label: "Distributed Protocol", value: "SVR-Ledger Verifier V5" }
    ]
  }
];

export default function ThreeDVault() {
  const [selectedSec, setSelectedSec] = useState<VaultSector>(SECTORS[0]);
  const [rotX, setRotX] = useState<number>(18);
  const [rotY, setRotY] = useState<number>(-22);
  const [layerSpacing, setLayerSpacing] = useState<number>(45);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [activeTabLayer, setActiveTabLayer] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth rotational loop
  useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      setRotY((prev) => {
        let next = prev + 0.15;
        if (next > 180) next = -180;
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [autoRotate]);

  // Subtle interactive shadow mouse trigger
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (autoRotate) return; // Only manual tilt if auto-rotate is toggled off
    if (!containerRef.current) return;

    const bounds = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    // Convert mouse coordinates to tilt indices (-25deg to 25deg)
    const factorX = (mouseY / bounds.height - 0.5) * 45;
    const factorY = (mouseX / bounds.width - 0.5) * -45;

    setRotX(Number(factorX.toFixed(1)));
    setRotY(Number(factorY.toFixed(1)));
  };

  const currentThemeColor = 
    selectedSec.id === "aether" ? "text-emerald-green" : 
    selectedSec.id === "helios" ? "text-gold-accent" : 
    selectedSec.id === "quantum" ? "text-sky-400" : "text-white";

  const currentThemeBorder = 
    selectedSec.id === "aether" ? "border-emerald-green" : 
    selectedSec.id === "helios" ? "border-gold-accent" : 
    selectedSec.id === "quantum" ? "border-sky-400" : "border-white";

  const currentThemeBgGlow = 
    selectedSec.id === "aether" ? "rgba(0, 200, 150, 0.08)" : 
    selectedSec.id === "helios" ? "rgba(245, 193, 92, 0.08)" : 
    selectedSec.id === "quantum" ? "rgba(56, 189, 248, 0.08)" : "rgba(255, 255, 255, 0.05)";

  const currentGlowClass = 
    selectedSec.id === "aether" ? "shadow-[0_0_40px_rgba(0,200,150,0.2)] border-emerald-green/30" : 
    selectedSec.id === "helios" ? "shadow-[0_0_40px_rgba(245,193,92,0.2)] border-gold-accent/30" : 
    selectedSec.id === "quantum" ? "shadow-[0_0_40px_rgba(56,189,248,0.2)] border-sky-400/30" : "shadow-[0_0_40px_rgba(255,255,255,0.1)] border-white/20";

  return (
    <div className="glass-panel p-6 sm:p-10 rounded-[40px] border border-white/10 relative overflow-hidden bg-white/[0.01] shadow-[0_30px_70px_rgba(0,0,0,0.8)]" id="three_d_spatial_vault_explorer">
      {/* Decorative Orbs inside the element */}
      <div className={`absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br ${selectedSec.highlightGlow} blur-[120px] pointer-events-none transition-all duration-1000 -z-10`} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* LEFT COLUMN: CRITICAL CONTROLS & MODULE INFORMATION */}
        <div className="lg:col-span-5 space-y-8 text-left z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest font-bold uppercase text-zinc-400">
              <Compass className="h-3 w-3 text-emerald-green" /> SPATIAL DATA VISUALIZATION
            </div>
            <h3 className="font-serif text-2xl sm:text-3.5xl font-extrabold text-white leading-tight">
              Savora <span className={`text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gold-accent`}>3D Interactive Vault</span> Ledger
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm font-light leading-relaxed">
              Rotate, expand, and isolate the holographic nodes of our private financial system. Select a sector below to explore real gold, sovereign treasury bonds, and high-yield engines with real liquid backing.
            </p>
          </div>

          {/* Sector Selectors */}
          <div className="space-y-2.5">
            <span className="text-[8.5px] font-mono tracking-widest text-zinc-500 uppercase font-black block">SELECT ACTIVE VAULT CORE NODE</span>
            <div className="grid grid-cols-2 gap-3">
              {SECTORS.map((sec) => {
                const isActive = selectedSec.id === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setSelectedSec(sec);
                      // Switch to appropriate active layer for dramatic visual update
                      if (sec.id === "aether") setActiveTabLayer(0);
                      else if (sec.id === "helios") setActiveTabLayer(1);
                      else if (sec.id === "quantum") setActiveTabLayer(2);
                      else setActiveTabLayer(0);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-300 pointer group relative overflow-hidden flex items-start justify-between ${
                      isActive 
                        ? "bg-white/[0.04] border-white/20 shadow-md"
                        : "bg-transparent border-white/5 hover:border-white/10 hover:bg-white/[0.01]"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-zinc-500 tracking-wider block font-bold uppercase">{sec.codename}</span>
                      <h4 className={`text-xs font-bold leading-tight uppercase transition-colors ${
                        isActive 
                          ? sec.id === "aether" ? "text-emerald-green" : sec.id === "helios" ? "text-gold-accent" : sec.id === "quantum" ? "text-sky-400" : "text-white"
                          : "text-zinc-300 group-hover:text-white"
                      }`}>
                        {sec.name.split(" ")[0]} {sec.name.split(" ")[1] === "Gold" ? "Gold" : "Vault"}
                      </h4>
                    </div>
                    {isActive && (
                      <span className={`h-1.5 w-1.5 rounded-full mt-1 ${
                        sec.id === "aether" ? "bg-emerald-green animate-pulse" : sec.id === "helios" ? "bg-gold-accent" : sec.id === "quantum" ? "bg-sky-400" : "bg-white"
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Holographic Angle / Detail Controls */}
          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-3xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-emerald-green" />
                <span className="text-[9px] font-mono tracking-widest text-[#777] uppercase font-bold">HOLOGRAPH MATRIX INTERIOR DRIVER</span>
              </div>
              <button
                onClick={() => {
                  setAutoRotate(!autoRotate);
                  if (!autoRotate) {
                    setRotX(18);
                    setRotY(-22);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono tracking-wider uppercase font-extrabold border transition-all ${
                  autoRotate 
                    ? "bg-emerald-green/10 border-emerald-green/30 text-emerald-green cursor-pointer"
                    : "bg-white/5 border-white/15 text-zinc-400 hover:text-white cursor-pointer"
                }`}
              >
                <RefreshCw className={`h-2.5 w-2.5 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }} />
                {autoRotate ? "Auto-Rotate ON" : "Manual Tilt Enabled"}
              </button>
            </div>

            <div className="space-y-4">
              {/* Rotation X */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Perspective Orbit Pitch (X-Axis)</span>
                  <span className="font-bold text-white">{rotX}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={rotX}
                  disabled={autoRotate}
                  onChange={(e) => setRotX(Number(e.target.value))}
                  className="w-full accent-emerald-green h-1 bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                />
              </div>

              {/* Rotation Y */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Orbital Yaw Sweep (Y-Axis)</span>
                  <span className="font-bold text-white">{rotY}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotY}
                  disabled={autoRotate}
                  onChange={(e) => setRotY(Number(e.target.value))}
                  className="w-full accent-emerald-green h-1 bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                />
              </div>

              {/* Laser Layer Spacing */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>3D Layer Separation Depth (Z-Axis)</span>
                  <span className="font-bold text-white">{layerSpacing}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="70"
                  value={layerSpacing}
                  onChange={(e) => setLayerSpacing(Number(e.target.value))}
                  className="w-full accent-emerald-green h-1 bg-zinc-800 rounded-lg cursor-pointer animate-pulse"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MAGNIFICENT DYNAMIC 3D SPATIAL PRESENTATION ENVIRONMENT */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-6">
          
          {/* Main 3D Container Stage */}
          <div 
            className="perspective-container relative w-full aspect-square sm:aspect-[4/3] max-w-lg rounded-3xl border border-white/5 bg-[#080808]/40 p-4 flex items-center justify-center overflow-hidden h-[330px] sm:h-[400px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              if (!autoRotate) {
                setRotX(18);
                setRotY(-22);
              }
            }}
            ref={containerRef}
          >
            {/* Ambient spatial grid backplate */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40 z-0" />
            
            {/* Holographic glowing focus ring beneath the stacks */}
            <div 
              className={`absolute h-[180px] w-[260px] rounded-full blur-[35px] transition-all duration-1000 z-0 pointer-events-none`}
              style={{
                backgroundColor: currentThemeBgGlow,
                top: "55%",
                left: "25%",
                transform: `rotateX(75deg) rotateY(${rotY * 0.2}deg) scale(1.3)`
              }}
            />

            {/* 3D PRESERVED CARD MATRIX STACK */}
            <div 
              className="preserve-3d transition-3d w-[250px] sm:w-[320px] aspect-[1.3/1] relative flex items-center justify-center cursor-grab active:cursor-grabbing"
              style={{
                transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(5px)`,
              }}
            >
              
              {/* LAYER 3 (BACKMOST LAYER): PHYSICAL VAULT BACKING BAR PLATFORM */}
              <div 
                className={`absolute w-full h-full rounded-[24px] border ${
                  selectedSec.id === "helios" ? "border-gold-accent/40" : "border-white/10"
                } bg-gradient-to-br from-[#0c0c0c] to-[#121212] flex flex-col justify-between p-5 text-left transition-all duration-700 shadow-2xl overflow-hidden`}
                style={{
                  transform: `translateZ(${-layerSpacing}px)`,
                  opacity: activeTabLayer === 0 ? 0.35 : activeTabLayer === 1 ? 0.95 : 0.45,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.9)",
                }}
              >
                {/* Micro gold lines */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[linear-gradient(135deg,rgba(245,193,92,0.1)_2px,transparent_2px)] bg-[size:10px_10px]" />
                
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest font-black block">LEDGER DEPOSIT CAPTURE</span>
                    <h5 className="text-xs font-bold font-mono text-white tracking-widest uppercase">SOVEREIGN SECURITIES</h5>
                  </div>
                  <Database className="h-4 w-4 text-gold-accent" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[7.5px] font-mono text-zinc-500 uppercase font-black">BACKING METRIC</span>
                    <span className="text-xs font-mono font-bold text-emerald-green">{selectedSec.backingRatio}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[7.5px] font-mono text-zinc-500 uppercase font-black">CUSTODIAL VERIFIER</span>
                    <span className="text-[8.5px] font-mono font-bold text-zinc-300">{selectedSec.custodian}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[7.5px] font-mono text-zinc-500 uppercase font-black">REGULATOR AUDIT HASH</span>
                    <span className="text-[8px] font-mono font-mono text-zinc-400">{selectedSec.auditCode}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-[7px] font-mono text-zinc-650">
                  <span>METALLIC STABILITY INDEX</span>
                  <span className="text-gold-accent">SECURED VAULT COLLATERAL</span>
                </div>
              </div>


              {/* LAYER 2 (MIDDLE LAYER): CENTRAL CORE ALLOCATION ENGINE CHIP */}
              <div 
                className={`absolute w-[98%] h-[98%] rounded-[24px] border ${currentThemeBorder}/20 bg-[#0d0d0d]/85 backdrop-blur-md p-5 flex flex-col justify-between text-left transition-all duration-700 relative`}
                style={{
                  transform: `translateZ(0px)`,
                  opacity: activeTabLayer === 1 ? 0.45 : activeTabLayer === 0 ? 0.95 : 0.85,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.7)",
                }}
              >
                {/* Circuit tech layout */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-dashed border-white/5 pointer-events-none" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="space-y-0.5">
                    <span className="text-[7px] font-mono tracking-widest text-zinc-500 uppercase block font-black">ALL-NODE REBALANCER</span>
                    <h5 className="text-xs font-bold text-white tracking-widest uppercase">COMPOUND MATRIX</h5>
                  </div>
                  <div className={`p-1 px-2 rounded-lg bg-white/5 border border-white/10 text-[8.5px] font-mono font-bold uppercase ${currentThemeColor}`}>
                    {selectedSec.yieldRate}
                  </div>
                </div>

                {/* Animated tech rebalancer ring mock */}
                <div className="my-3 flex items-center justify-between gap-4 relative z-10 p-3 bg-white/[0.01] rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg bg-white/5 border ${currentThemeBorder}/20`}>
                      <Cpu className={`h-3 w-3 ${currentThemeColor} animate-pulse`} />
                    </div>
                    <div>
                      <span className="text-[6.5px] font-mono tracking-widest text-[#666] uppercase block">SAVORA AI ENGINE</span>
                      <span className="text-[9.5px] text-zinc-300 font-serif font-black block">Yield Vectoring Live</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[6.5px] font-mono tracking-widest text-[#666] uppercase block">REBALANCE</span>
                    <span className="text-[9.5px] text-white font-mono font-bold">14.6 Sec p/i</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/5 relative z-10">
                  <span className="text-[7.5px] font-mono text-zinc-500 uppercase font-black">CORE MODULE ALLOCATION</span>
                  <div className="inline-flex items-center gap-1.5 text-[8.5px] font-mono text-emerald-green font-bold">
                    <Zap className="h-2.5 w-2.5 animate-bounce" /> ACTIVE ROUTING
                  </div>
                </div>
              </div>


              {/* LAYER 1 (FRONTMOST LAYER): SPECTACULAR SECURITY GLASS ESCUTCHEON */}
              <div 
                className={`absolute w-[95%] h-[95%] rounded-[24px] border ${currentThemeBorder}/40 bg-zinc-950/45 backdrop-blur-lg p-5 flex flex-col justify-between text-left transition-all duration-700`}
                style={{
                  transform: `translateZ(${layerSpacing}px)`,
                  opacity: 0.95,
                  boxShadow: "0 15px 45px rgba(0,0,0,0.9)",
                }}
              >
                {/* Floating shine scanner line */}
                <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent top-12 animate-pulse pointer-events-none" />

                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="block text-[6.5px] font-mono text-zinc-500 uppercase tracking-widest font-black">SECURITY ENCLAVE CLOUD</span>
                    <h5 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase font-mono">{selectedSec.codename} VERIFIED</h5>
                  </div>
                  <div className="h-5 w-5 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center">
                    <Lock className="h-3 w-3 text-emerald-green" />
                  </div>
                </div>

                <div className="p-3 bg-matte-black/90 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-2 justify-between">
                    <div>
                      <span className="text-[6px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">SAVORA MUTUAL BACKING STATUS</span>
                      <span className="text-[10px] font-bold text-white font-mono uppercase">CRYPTOSHORT AUDITED</span>
                    </div>
                    <ShieldCheck className="h-4 w-4 text-emerald-green" />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-[7px] font-mono text-zinc-500">
                  <span>CRYPTO VAULT SHIELD</span>
                  <span className="text-emerald-green shadow-sm">VERIFIED SECURE SECURE</span>
                </div>
              </div>

            </div>

          </div>

          {/* Quick Metrics Dashboard Underneath 3D Container */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedSec.specs.map((spec, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl text-left hover:border-white/15 transition-all">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block font-bold leading-tight">{spec.label}</span>
                <span className="text-[11px] font-mono text-zinc-250 font-bold block mt-1 leading-tight">{spec.value}</span>
              </div>
            ))}
          </div>

          {/* Action guidance callout */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/[0.01] border border-white/5 p-4 rounded-2xl w-full text-left">
            <div className="p-2 bg-emerald-green/10 border border-emerald-green/20 rounded-xl text-emerald-green shrink-0">
              <Zap className="h-4 w-4" />
            </div>
            <div className="space-y-0.5 max-w-lg">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider leading-tight">Compounding Yield Accelerant Node</h4>
              <p className="text-[10.5px] text-zinc-400 font-light leading-relaxed">
                Toggling these core sectors will re-allocate sweeps on your Savora Finance Private Limited profile. Start compounding from as low as ₹10.
              </p>
            </div>
            <a
              href="#vault_simulator"
              className="text-[10px] font-bold uppercase tracking-widest text-[#0d0d0d] bg-white hover:bg-zinc-200 py-2.5 px-4 rounded-xl shrink-0 transition-all font-sans cursor-pointer mt-2 sm:mt-0"
            >
              Calibrate Compounder
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
