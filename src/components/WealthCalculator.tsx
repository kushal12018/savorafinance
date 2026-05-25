/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, Coins, Sparkles, Scale, Info, ArrowUpRight, Flame } from "lucide-react";
import { InvestmentSimulationSettings } from "../types";

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

            {/* Investment Duration */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Time Horizon</span>
                <span className="text-white font-sans font-bold">{settings.durationYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={settings.durationYears}
                onChange={(e) => setSettings({ ...settings, durationYears: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white animate-pulse"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>1 Year</span>
                <span>30 Years</span>
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

      {/* RIGHT COLUMN: Holographic Dashboard (SVG Area Chart + The Animated Glass Jar) */}
      <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Dynamic SVG Area Chart Screen */}
        <div className="md:col-span-8 bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-xl flex flex-col justify-between">
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

          {/* Core financial numbers */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="space-y-0.5">
              <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Net Deposited Capital</span>
              <span className="text-lg font-bold text-zinc-200 font-mono tracking-tight">{formatCurrency(calculations.totalDeposits)}</span>
            </div>
            <div className="space-y-0.5">
              <span className="block text-[9px] font-mono text-emerald-green uppercase tracking-widest leading-none">Compound AI Interest</span>
              <span className="text-lg font-bold text-emerald-green font-mono tracking-tight">+{formatCurrency(calculations.finalInterest)}</span>
            </div>
          </div>
        </div>

        {/* DYNAMIC HOLOGRAPHIC GLASS JAR FILLING WITH COINS */}
        <div className="md:col-span-4 bg-gradient-to-b from-white/[0.04] to-transparent p-6 rounded-3xl border border-white/5 shadow-xl flex flex-col justify-between overflow-hidden relative group">
          {/* subtle ambient background pulse */}
          <div className="absolute inset-x-0 -top-10 h-24 bg-gradient-to-b from-emerald-green/10 to-transparent blur-xl pointer-events-none" />

          <div className="text-center space-y-1 relative z-10">
            <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block font-semibold">Decentralized Vault</span>
            <h4 className="text-sm font-bold text-white tracking-wide">Interactive Savora Jar</h4>
            <p className="text-[10px] text-zinc-400">Wealth Capacity Meter</p>
          </div>

          {/* THE SVG MASON GLASS JAR ANIMATOR */}
          <div className="my-5 flex justify-center items-center h-44 relative">
            <div className="absolute inset-0 bg-radial-gradient(circle_at_center,rgba(0,200,150,0.05)_0%,transparent_80%) pointer-events-none" />
            
            {/* Holographic Glowing SVG Glass Jar */}
            <svg
              viewBox="0 0 140 180"
              width="100%"
              height="100%"
              className="max-w-[120px] overflow-visible drop-shadow-[0_10px_35px_rgba(0,200,150,0.15)]"
            >
              <defs>
                <linearGradient id="jarGlassGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
                  <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.04" />
                  <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.18" />
                </linearGradient>
                {/* Rising liquid level gradient */}
                <linearGradient id="wealthLiquidGrad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#0D1E1A" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#00C896" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F5C15C" stopOpacity="0.7" />
                </linearGradient>
              </defs>

              {/* Dynamic filling liquid level. Height mapped of compounding yield percentage */}
              {/* Max is 130px, base height starts at index. */}
              {(() => {
                const fillingRatio = Math.min(1.0, calculations.finalAmount / 2200000); // Caps jar fill visually around 22 Lakh values.
                const liquidHeight = Math.max(10, fillingRatio * 125); // At least 10px tall, up to 125px tall.
                const liquidY = 160 - liquidHeight;

                // Let's render the rising saving wave and floating glistening points/coins
                return (
                  <g>
                    {/* The liquid wave fill bounded inside jar outline space */}
                    <rect
                      x="23"
                      y={liquidY}
                      width="94"
                      height={liquidHeight}
                      rx="8"
                      fill="url(#wealthLiquidGrad)"
                      className="transition-all duration-300 ease-out"
                    />
                    
                    {/* Animated coin circles based on duration of investment */}
                    {/* Spawns custom number of coins based on settings.monthlySavings */}
                    {Array.from({ length: Math.min(25, Math.ceil(settings.monthlySavings / 4000)) }).map((_, idx) => {
                      // Deterministic coordinate calculations so they don't randomly shift and flick on state updates
                      const coordSeedX = Math.sin(idx * 735.25 + 1.5) * 0.5 + 0.5; // range [0, 1]
                      const coordSeedY = Math.cos(idx * 412.35 + 2.8) * 0.5 + 0.5; // range [0, 1]

                      const cx = 28 + coordSeedX * 84; 
                      // Float constraints: keep coins inside liquid body
                      const cy = (liquidY + 10) + coordSeedY * (liquidHeight - 20);
                      const radius = 3 + (idx % 3 === 0 ? 1.5 : 0.5); // some a bit bigger than others.

                      return (
                        <circle
                          key={idx}
                          cx={cx}
                          cy={cy > 156 ? 152 : cy}
                          r={radius}
                          fill={idx % 2 === 0 ? "#F5C15C" : "#00C896"}
                          className="animate-pulse shadow-[0_0_8px_rgba(245,193,92,0.8)]"
                          style={{ animationDelay: `${idx * 0.2}s`, animationDuration: `${1.5 + (idx % 2)}s` }}
                        />
                      );
                    })}
                  </g>
                );
              })()}

              {/* Glass Mason Jar Body Silhouette */}
              <path
                d="M 40,20 
                   C 36,20 32,22 32,26
                   L 32,32
                   C 32,34 30,36 28,38
                   L 22,46
                   C 20,49 20,53 20,57
                   L 20,154
                   C 20,166 30,172 42,172
                   L 98,172
                   C 110,172 120,166 120,154
                   L 120,57
                   C 120,53 120,49 118,46
                   L 112,38
                   C 110,36 108,34 108,32
                   L 108,26
                   C 108,22 104,20 100,20
                   Z"
                fill="url(#jarGlassGrad)"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeOpacity="0.25"
                className="pointer-events-none"
              />

              {/* Jar Neck/threads lines */}
              <line x1="38" y1="26" x2="102" y2="26" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.5" />
              <line x1="34" y1="31" x2="106" y2="31" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1" />

              {/* Holographic Savora Brand Seal On Jar */}
              <circle cx="70" cy="100" r="14" fill="#0D0D0D" fillOpacity="0.75" stroke="#00C896" strokeWidth="1" strokeOpacity="0.3" />
              <text x="70" y="104" textAnchor="middle" fill="#00C896" fontSize="12" fontWeight="bold" fontFamily="var(--font-serif)" letterSpacing="-0.5">S</text>

              {/* Glass light reflection flare highlight */}
              <path
                d="M 24,65 C 24,55 26,48 27,48 C 28,48 26,55 26,65 L 26,145 C 26,155 24,152 24,142 Z"
                fill="#FFFFFF"
                fillOpacity="0.25"
              />
            </svg>
          </div>

          {/* Expected final accumulated total indicator */}
          <div className="space-y-1 text-center relative z-10 bg-black/45 py-2 px-3 rounded-2xl border border-white/5">
            <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Maturing Safe Value</span>
            <span className="text-base font-bold text-white font-mono tracking-wide">{formatCurrency(calculations.finalAmount)}</span>
            <span className="block text-[8px] font-mono text-zinc-400 capitalize">In {settings.durationYears} target years</span>
          </div>
        </div>

      </div>
    </div>
  );
}
