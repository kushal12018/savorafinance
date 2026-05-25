/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";

const metaEnv = (import.meta as any).env || {};

const supabaseUrl = (metaEnv.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (metaEnv.VITE_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Savora Supabase environment variables are missing. " +
    "Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Project Secrets " +
    "to connect the real-time Supabase Database & OTP Authentication."
  );
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
