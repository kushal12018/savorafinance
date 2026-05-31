/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, Coins, Sparkles, Scale, Info, ArrowUpRight, Flame } from "lucide-react";
import { InvestmentSimulationSettings } from "../types";
import savoraLogo from "../assets/images/savora_finance_logo_1779737512814.png";
import Perspective3D from "./Perspective3D";

export default function WealthCalculator() {
  const [settings, setSettings] = useState<InvestmentSimulationSettings>({
    initialAmount: 50000,
    monthlySavings: 8000,
    returnRate: 12,
    durationYears: 15,
  });

  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Math compound calculator
  const calculations = useMemo(() => {
    const { initialAmount, monthlySavings, returnRate, durationYears } = settings;
    const monthlyRate = returnRate / 12 / 100;
    const totalMonths = durationYears * 12;

    let currentTotal = initialAmount;
    let totalInvested = initialAmount;
    const yearlyData: Array<{ year: number; invested: number; total: number; interest: number }> = [];

    // Base state (Year 0)
    yearlyData.push({
      year: 0,
      invested: initialAmount,
      total: initialAmount,
      interest: 0,
    });

    for (let month = 1; month <= totalMonths; month++) {
      currentTotal = (currentTotal + monthlySavings) * (1 + monthlyRate);
      totalInvested += monthlySavings;

      if (month % 12 === 0) {
        const year = month / 12;
        yearlyData.push({
          year,
          invested: Math.round(totalInvested),
          total: Math.round(currentTotal),
          interest: Math.round(currentTotal - totalInvested),
        });
      }
    }

    const finalAmount = Math.round(currentTotal);
    const totalDeposits = Math.round(totalInvested);
    const finalInterest = Math.round(finalAmount - totalDeposits);

    return {
      yearlyData,
      finalAmount,
      totalDeposits,
      finalInterest,
    };
  }, [settings]);

  // Helper formatting INR Currency
  const formatCurrency = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString("en-IN")}`;
  };

  // Dynamically compute the path for the custom SVG chart
  const inlineSvgChart = useMemo(() => {
    const data = calculations.yearlyData;
    const width = 500;
    const height = 180;
    const padding = 20;

    const maxX = data.length - 1;
    const maxY = Math.max(...data.map(d => d.total)) * 1.05; // 5% headroom

    const points = data.map((d, index) => {
      const x = padding + (index / maxX) * (width - padding * 2);
      const y = height - padding - (d.total / maxY) * (height - padding * 2);
      return { x, y, ...d };
    });

    const investedPoints = data.map((d, index) => {
      const x = padding + (index / maxX) * (width - padding * 2);
      const y = height - padding - (d.invested / maxY) * (height - padding * 2);
      return { x, y };
    });

    // Create curved Bezier command string
    let dWealth = "";
    let dInvested = "";
    
    if (points.length > 0) {
      dWealth = `M ${points[0].x} ${points[0].y}`;
      dInvested = `M ${investedPoints[0].x} ${investedPoints[0].y}`;

      for (let i = 1; i < points.length; i++) {
        // Curve control points
        const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
        const cpY1 = points[i - 1].y;
        const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
        const cpY2 = points[i].y;
        
        dWealth += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
        
        const icpX1 = investedPoints[i - 1].x + (investedPoints[i].x - investedPoints[i - 1].x) / 2;
        const icpY1 = investedPoints[i - 1].y;
        const icpX2 = investedPoints[i - 1].x + (investedPoints[i].x - investedPoints[i - 1].x) / 2;
        const icpY2 = investedPoints[i].y;
        
        dInvested += ` C ${icpX1} ${icpY1}, ${icpX2} ${icpY2}, ${investedPoints[i].x} ${investedPoints[i].y}`;
      }
    }

    // Closed path for under-the-curve gradient fills
    const dWealthArea = `${dWealth} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    const dInvestedArea = `${dInvested} L ${investedPoints[investedPoints.length - 1].x} ${height - padding} L ${investedPoints[0].x} ${height - padding} Z`;

    return {
      points,
      dWealth,
      dWealthArea,
      dInvested,
      dInvestedArea,
      width,
      height,
    };
  }, [calculations]);

  const activeHoverDetails = useMemo(() => {
    if (hoveredYear === null) return null;
    return calculations.yearlyData.find(d => d.year === hoveredYear) || null;
  }, [hoveredYear, calculations]);

  const growthPhase = useMemo(() => {
    const y = settings.durationYears;
    if (y <= 7) {
      return {
        name: "Foundation Phase",
        desc: "Laying original assets. Compound growth rises gently under initial momentum.",
        color: "text-zinc-400",
        barColor: "bg-zinc-500",
        badge: "bg-zinc-500/10 border border-zinc-500/20",
        icon: Scale,
      };
    } else if (y <= 15) {
      return {
        name: "Capital Accumulation",
        desc: "Ignition point. Compound yields start driving noticeable portfolio weight.",
        color: "text-emerald-green",
        barColor: "bg-emerald-green",
        badge: "bg-emerald-green/10 border border-emerald-green/20",
        icon: TrendingUp,
      };
    } else if (y <= 23) {
      return {
        name: "Velocity Synergy",
        desc: "Exponential surge! Yearly gains begin outstripping continuous monthly savings deposits.",
        color: "text-gold-accent",
        barColor: "bg-gold-accent",
        badge: "bg-gold-accent/10 border border-gold-accent/20",
        icon: Sparkles,
      };
    } else {
      return {
        name: "Sovereign Harvest",
        desc: "Parabolic maturity. Absolute interest generation fuels self-sustaining asset loops.",
        color: "text-rose-400",
        barColor: "bg-gradient-to-r from-gold-accent to-rose-400",
        badge: "bg-rose-500/10 border border-rose-500/20",
        icon: Flame,
      };
    }
  }, [settings.durationYears]);

  const yearsPercent = ((settings.durationYears - 1) / 29) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="estimator_calculator_root">
      {/* LEFT COLUMN: Controls & Sliders */}
      <div className="lg:col-span-5 bg-gradient-to-b from-white/[0.04] to-transparent p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 rounded-xl bg-gold-accent/10 border border-gold-accent/25 text-gold-accent flex items-center justify-center">
              <Coins className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-sans text-lg font-bold text-white tracking-wide">Configure Wealth Goal</h3>
              <p className="text-xs text-zinc-400">Calculate your potential compounding projections instantly</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Initial Amount */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Initial Contribution</span>
                <span className="text-gold-accent font-mono font-bold">{formatCurrency(settings.initialAmount)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="500000"
                step="5000"
                value={settings.initialAmount}
                onChange={(e) => setSettings({ ...settings, initialAmount: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold-accent"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>₹0</span>
                <span>₹5 Lakh</span>
              </div>
            </div>

            {/* Monthly Contribution */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Monthly Savings Contribution</span>
                <span className="text-emerald-green font-mono font-bold">{formatCurrency(settings.monthlySavings)}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={settings.monthlySavings}
                onChange={(e) => setSettings({ ...settings, monthlySavings: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-green"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>₹1,000/mo</span>
                <span>₹1 Lakh/mo</span>
              </div>
            </div>

            {/* Expected Return Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium font-sans">Compounding Yield (p.a.)</span>
                <span className="text-white font-mono font-semibold">{settings.returnRate}% <span className="text-emerald-green text-[10px]">avg.</span></span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="0.5"
                value={settings.returnRate}
                onChange={(e) => setSettings({ ...settings, returnRate: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>5% (Conservative)</span>
                <span>25% (High Capital)</span>
              </div>
            </div>

            {/* Investment Duration with Custom Progress & Growth Phase Indicator */}
            <div className="space-y-3.5 p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden transition-all duration-300">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium font-sans">Time Horizon</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${growthPhase.badge} ${growthPhase.color} transition-all duration-300`}>
                    {settings.durationYears} Years
                  </span>
                </div>
              </div>
              
              <div className="relative pt-1">
                {/* Custom Glowing visual progress bar that matches the years slider */}
                <div className="absolute left-0 top-[11.5px] h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden pointer-events-none">
                  <motion.div 
                    className={`h-full ${growthPhase.barColor} rounded-full`}
                    initial={false}
                    animate={{ width: `${yearsPercent}%` }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                  />
                </div>

                {/* Years slider custom layout to make it highly immersive */}
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={settings.durationYears}
                  onChange={(e) => setSettings({ ...settings, durationYears: Number(e.target.value) })}
                  className="w-full h-1.5 opacity-80 hover:opacity-100 bg-transparent rounded-lg appearance-none cursor-pointer accent-white relative z-20 transition-all duration-150"
                  style={{
                    WebkitAppearance: "none",
                  }}
                />
              </div>
              
              {/* Slider marker ticks to delineate progression epochs */}
              <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 px-0.5 select-none">
                <span className={settings.durationYears >= 1 ? "text-zinc-400 font-bold transition-colors" : "transition-colors"}>1 Yr</span>
                <span className={settings.durationYears >= 8 ? "text-emerald-green font-bold transition-colors" : "transition-colors"}>8 Yrs</span>
                <span className={settings.durationYears >= 16 ? "text-gold-accent font-bold transition-colors" : "transition-colors"}>16 Yrs</span>
                <span className={settings.durationYears >= 24 ? "text-rose-400 font-bold transition-colors" : "transition-colors"}>30 Yrs</span>
              </div>

              {/* Dynamic Phase Visualization Card with staggered entry anims & glow */}
              <div className="pt-3 border-t border-white/[0.04] transition-all duration-300">
                <div className="flex items-start gap-2.5">
                  <span className={`p-1.5 rounded-lg bg-white/[0.03] border border-white/5 ${growthPhase.color} transition-colors duration-300`}>
                    <growthPhase.icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500">Growth Epoch</span>
                      <span className={`text-[10px] font-sans font-black ${growthPhase.color} transition-colors duration-300`}>
                        {growthPhase.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal font-light">
                      {growthPhase.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic ROI Stat card inside column */}
        <div className="p-4 bg-emerald-green/5 border border-emerald-green/10 rounded-2xl flex items-start gap-3">
          <TrendingUp className="h-4.5 w-4.5 text-emerald-green shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-green uppercase">Wealth Generation Factor</span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              By saving <span className="text-white font-semibold">{formatCurrency(settings.monthlySavings)}/mo</span>, compound gains will generate <span className="text-white font-semibold font-mono">{formatCurrency(calculations.finalInterest)}</span> on top of your deposits!
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Holographic Dashboard (SVG Area Chart) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Dynamic SVG Area Chart Screen */}
        <Perspective3D maxTilt={6} scale={1.012} className="w-full bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-xl flex flex-col justify-between overflow-hidden" id="projection_matrix_3d_panel">
          <div>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-medium">Projection Matrix</span>
                <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  Portfolio Ascent <span className="text-xs font-mono font-normal text-emerald-green bg-emerald-green/10 px-1.5 py-0.5 rounded-md">12-Month Compounding</span>
                </h4>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" /> Deposits
                </span>
                <span className="flex items-center gap-1.5 text-emerald-green font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-green shadow-[0_0_6px_rgba(0,250,180,1)] animate-pulse" /> Savora Wealth
                </span>
              </div>
            </div>

            {/* Custom Responsive SVG Chart Area */}
            <div className="mt-4 relative" ref={containerRef}>
              <svg
                viewBox={`0 0 ${inlineSvgChart.width} ${inlineSvgChart.height}`}
                width="100%"
                height="100%"
                className="overflow-visible"
              >
                <defs>
                  {/* Linear gradients */}
                  <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00C896" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00C896" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4B5563" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#4B5563" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal gridlines */}
                <line x1="20" y1="20" x2="480" y2="20" stroke="#FFFFFF" strokeOpacity="0.03" strokeDasharray="3 3"/>
                <line x1="20" y1="65" x2="480" y2="65" stroke="#FFFFFF" strokeOpacity="0.03" strokeDasharray="3 3"/>
                <line x1="20" y1="110" x2="480" y2="110" stroke="#FFFFFF" strokeOpacity="0.03" strokeDasharray="3 3"/>
                <line x1="20" y1="160" x2="480" y2="160" stroke="#FFFFFF" strokeOpacity="0.05" />

                {/* Simulated chart pathways */}
                {/* 1. Gold Deposits area & line */}
                <path d={inlineSvgChart.dInvestedArea} fill="url(#investedGrad)" />
                <path d={inlineSvgChart.dInvested} fill="none" stroke="#4B5563" strokeWidth="1.5" strokeDasharray="2 2" className="opacity-80" />

                {/* 2. Emerald Savora growth area & line */}
                <path d={inlineSvgChart.dWealthArea} fill="url(#wealthGrad)" />
                <path d={inlineSvgChart.dWealth} fill="none" stroke="#00C896" strokeWidth="2.5" className="drop-shadow-[0_2px_8px_rgba(0,200,150,0.4)]" />

                {/* Interactable Vertical year lines */}
                {inlineSvgChart.points.map((p, idx) => {
                  if (idx === 0) return null;
                  return (
                    <g key={idx}>
                      {/* Invisible hover trigger column */}
                      <rect
                        x={p.x - 15}
                        y="10"
                        width="30"
                        height="150"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredYear(p.year)}
                        onMouseLeave={() => setHoveredYear(null)}
                      />
                      {/* Year anchor dots */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredYear === p.year ? 5 : 3.5}
                        fill={hoveredYear === p.year ? "#00C896" : "#0D0D0D"}
                        stroke="#00C896"
                        strokeWidth={hoveredYear === p.year ? 3 : 1.5}
                        className="transition-all duration-150"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Dynamic Hover Details readout */}
            <div className="h-10 mt-3 pt-2 border-t border-white/5 flex justify-between items-center text-xs">
              {activeHoverDetails ? (
                <>
                  <span className="font-mono text-zinc-500 uppercase tracking-widest text-[9px]">Year {activeHoverDetails.year} metrics:</span>
                  <div className="flex gap-4 font-mono text-[11px]">
                    <span>Deposits: <span className="text-zinc-300 font-semibold">{formatCurrency(activeHoverDetails.invested)}</span></span>
                    <span className="text-emerald-green font-bold">Total: {formatCurrency(activeHoverDetails.total)}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase tracking-wider font-medium font-mono animate-pulse w-full">
                  <Info className="h-3 w-3 shrink-0" />
                  <span>Hover markers to retrieve historic milestones</span>
                </div>
              )}
            </div>
          </div>

          {/* Core financial numbers (Consolidated 3-Column stats readout) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="space-y-0.5">
              <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Net Deposited Capital</span>
              <span className="text-lg font-bold text-zinc-200 font-mono tracking-tight">{formatCurrency(calculations.totalDeposits)}</span>
            </div>
            <div className="space-y-0.5">
              <span className="block text-[9px] font-mono text-emerald-green uppercase tracking-widest leading-none">Compound AI Interest</span>
              <span className="text-lg font-bold text-emerald-green font-mono tracking-tight">+{formatCurrency(calculations.finalInterest)}</span>
            </div>
            <div className="space-y-0.5">
              <span className="block text-[9px] font-mono text-gold-accent uppercase tracking-widest leading-none">Maturing Safe Value</span>
              <span className="text-lg font-bold text-gold-accent font-mono tracking-tight">{formatCurrency(calculations.finalAmount)}</span>
            </div>
          </div>
        </Perspective3D>

      </div>
    </div>
  );
}
