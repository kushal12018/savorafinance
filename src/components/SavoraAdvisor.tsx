/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Bot, User, X, Landmark, Compass, HelpCircle, Loader2 } from "lucide-react";
import { ChatMessage } from "../types";

const savoraLogo = "/src/assets/images/savora_finance_logo_1779737512814.png";

interface SavoraAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  savingsSettings?: {
    monthly: number;
    years: number;
    estimatedWealth: string;
  };
}

export default function SavoraAdvisor({ isOpen, onClose, savingsSettings }: SavoraAdvisorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Default introductory greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "advisor",
          text: `Welcome to Savora Private Vaults. I am Savora **WealthMind**, your AI private wealth advisor. 

I've loaded your current compounding metrics:
- Target Horizon: **${savingsSettings?.years || 15} Years**
- Projected Wealth Goal: **${savingsSettings?.estimatedWealth || "₹45.8 Lakh"}**

How may I assist you in optimizing your high-yield automated financial journey today? Feel free to ask about smart compound loops, custom micro-asset weightings, or budgeting ideas.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [savingsSettings, messages]);

  // Handle scroll to bottom
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Pre-selected prompt options
  const defaultPrompts = [
    { text: "How can I accelerate my compound loop?", icon: Compass },
    { text: "What is Savora's AI automated allocation?", icon: Landmark },
    { text: "Examine my ₹" + (savingsSettings?.monthly || 8000) + "/mo path.", icon: Sparkles },
  ];

  // Send message API route handler
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    // Local append for User message
    const userMsgId = Math.random().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Call the node backend proxy API
      const response = await fetch("/api/advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          savingsPlan: {
            monthly: savingsSettings?.monthly || 8000,
            years: savingsSettings?.years || 15,
            estimatedWealth: savingsSettings?.estimatedWealth || "45.8 Lakh",
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "advisor",
            text: data.text,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("WealthMind API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "advisor",
          text: `*System Connectivity Interrupted.* I apologize, but I could not establish a connection to Savora Private Networks. 

Please verify your **Gemini API Key** is configured correctly in the **Settings > Secrets** panel in the AI Studio sidebar to activate Savora WealthMind server-side advisor.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Crude markdown bold formatter helper for UI text
  const renderMessageContent = (text: string) => {
    // Basic formatting helper for bold, bullet points
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content = line;

      // Handle bullet points
      const isBullet = line.startsWith("- ") || line.startsWith("* ");
      if (isBullet) {
        content = line.substring(2);
      }

      // Replace bold markdown with react nodes
      const parts = content.split(/\*\*(.*?)\*\*/g);
      const formattedLine = parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="text-white font-semibold font-sans">{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex gap-2 items-start pl-3 my-0.5 text-zinc-300">
            <span className="text-emerald-green shrink-0 mt-2">•</span>
            <span className="text-xs leading-relaxed">{formattedLine}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs leading-relaxed text-zinc-300 my-1">{formattedLine}</p>
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-80"
          />

          {/* Chat Slide-out Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-matte-black/95 backdrop-blur-xl border-l border-white/10 z-90 shadow-3xl text-white flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/15 bg-gradient-to-r from-emerald-green/10 via-transparent to-transparent flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-emerald-green/30 bg-white/5 flex items-center justify-center relative overflow-hidden shrink-0 select-none shadow-[0_0_12px_rgba(0,200,150,0.2)]">
                  <span className="absolute inset-0 bg-emerald-green/20 rounded-full animate-ping opacity-10" />
                  <img src={savoraLogo} alt="Savora Finance" className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                    Savora WealthMind
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-green animate-pulse" />
                  </h3>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-green/80 font-bold">
                    Private AI Wealth Advisor
                  </span>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 text-zinc-400 transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Chat Body (Message Feed) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth">
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3.5 max-w-[85%] ${
                      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {/* Speaker Avatar */}
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border mt-0.5 overflow-hidden select-none ${
                        isUser
                          ? "bg-gold-accent/10 border-gold-accent/25 text-gold-accent"
                          : "bg-white/5 border-emerald-green/25"
                      }`}
                    >
                      {isUser ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <img src={savoraLogo} alt="Savora Logo" className="w-full h-full object-cover rounded-full" />
                      )}
                    </div>

                    {/* Speech Bubble */}
                    <div
                      className={`p-4.5 rounded-2xl border text-zinc-300 shadow-lg ${
                        isUser
                          ? "bg-white/[0.05] border-white/10 rounded-tr-none text-zinc-200"
                          : "bg-black/30 border-white/5 rounded-tl-none font-light"
                      }`}
                    >
                      <div className="space-y-2">
                        {renderMessageContent(msg.text)}
                      </div>
                      <span className="block text-[8px] font-mono text-zinc-500 uppercase mt-2 text-right">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Bot typing state indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-3 mt-1"
                >
                  <div className="h-8 w-8 rounded-full bg-white/5 border border-emerald-green/25 flex items-center justify-center shrink-0 overflow-hidden relative">
                    <img src={savoraLogo} alt="Savora Finance" className="absolute inset-0 w-full h-full object-cover rounded-full opacity-35 animate-pulse" />
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-green relative z-10" />
                  </div>
                  <div className="bg-black/30 border border-white/5 rounded-2xl rounded-tl-none p-4 text-zinc-400 text-xs font-mono">
                    <span className="inline-flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-green animate-bounce" style={{ animationDelay: "0s" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-green animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-green animate-bounce" style={{ animationDelay: "0.4s" }} />
                      <span className="ml-1 text-[10px] uppercase tracking-wider text-zinc-500">Querying Private Node...</span>
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={conversationEndRef} />
            </div>

            {/* Quick Prompts Shelf */}
            <div className="px-5 pb-2">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block mb-2 font-semibold">Suggested Questions</span>
              <div className="flex flex-wrap gap-2">
                {defaultPrompts.map((p, pIdx) => {
                  const IconComp = p.icon;
                  return (
                    <button
                      key={pIdx}
                      disabled={isLoading}
                      onClick={() => handleSendMessage(p.text)}
                      className="text-[10px] font-medium text-zinc-400 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white border border-white/5 py-1.5 px-3 rounded-full flex items-center gap-1.5 transition-all text-left cursor-pointer disabled:opacity-50"
                    >
                      <IconComp className="h-3 w-3 text-emerald-green" />
                      {p.text}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Footer */}
            <div className="p-5 border-t border-white/10 bg-black/40">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  disabled={isLoading}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask WealthMind AI Strategist..."
                  className="flex-1 bg-white/[0.03] placeholder-zinc-500 text-xs text-white border border-white/10 focus:border-emerald-green rounded-xl py-3 px-4 focus:outline-none transition-all disabled:opacity-50"
                  id="chat_input_wealthmind"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-green hover:bg-emerald-green/85 text-matte-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-emerald-green"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
