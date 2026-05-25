/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Sparkles } from "lucide-react";

// Reference generated logo asset path
import savoraLogo from "../assets/images/savora_finance_logo_1779737512814.png";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("auth"); // auth, load, ready

  useEffect(() => {
    // Phase 1: Simulate cryptographic handshake & safe connection lookup
    const phaseTimer = setTimeout(() => {
      setPhase("load");
    }, 1000);

    return () => clearTimeout(phaseTimer);
  }, []);

  useEffect(() => {
    if (phase !== "load") return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase("ready");
          setTimeout(() => {
            onComplete();
          }, 800);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-matte-black text-white px-6 overflow-hidden">
      {/* Absolute background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,200,150,0.08)_0%,transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative text-center max-w-md w-full space-y-12">
        {/* Cinematic Logo Branding */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Logo Frame - High Contrast Circular Container */}
          <div className="relative flex h-18 w-18 items-center justify-center rounded-full border border-emerald-green/30 bg-[#0c0c0c]/85 shadow-[0_0_25px_rgba(0,200,150,0.3)] mb-5 overflow-hidden group select-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-green/20 via-transparent to-gold-accent/10 animate-pulse" />
            <img 
              src={savoraLogo} 
              alt="Savora Logo" 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>
          
          <h1 className="font-sans text-2xl font-bold tracking-[0.2em] text-white">
            SAVORA FINANCE
          </h1>
          <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-zinc-500 mt-2 block font-semibold">
            PRIVATE LIMITED
          </span>
        </motion.div>

        {/* Dynamic status readouts */}
        <div className="h-20 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === "auth" && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 text-xs font-mono text-emerald-green/80 bg-emerald-green/5 border border-emerald-green/20 px-4 py-1.5 rounded-full"
              >
                <ShieldCheck className="h-3.5 w-3.5 animate-pulse" />
                <span>establishing secure transport handshake...</span>
              </motion.div>
            )}

            {phase === "load" && (
              <motion.div
                key="load"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4 w-full"
              >
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-1">
                  <span>calibrating neuro-saving algorithms</span>
                  <span className="text-emerald-green font-semibold">{Math.min(100, progress)}%</span>
                </div>
                {/* Custom Slim Glowing Progress Bar */}
                <div className="h-[2px] bg-zinc-900 border border-zinc-800/55 rounded-full w-full overflow-hidden relative">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-green to-gold-accent shadow-[0_0_8px_rgba(0,200,150,0.8)]"
                    style={{ width: `${Math.min(100, progress)}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}

            {phase === "ready" && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-xs font-mono text-gold-accent bg-gold-accent/5 border border-gold-accent/20 px-4 py-1.5 rounded-full"
              >
                <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} />
                <span>quantum portfolio optimization decrypted.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
