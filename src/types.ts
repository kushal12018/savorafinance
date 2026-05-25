/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  glowColor: string; // emerald, gold, neutral etc
  details: string[];
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  subtext: string;
  glowColor: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  content: string;
  wealthStats: string; // e.g. "Saved ₹4.2L in 1 yr"
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  isPopular: boolean;
  accentColor: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "advisor";
  text: string;
  timestamp: Date;
}

export interface InvestmentSimulationSettings {
  initialAmount: number;
  monthlySavings: number;
  returnRate: number; // yearly rate in %
  durationYears: number;
}
