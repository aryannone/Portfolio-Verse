"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, authEnabled } from "@/lib/supabase/config";

let client: SupabaseClient | null = null;

// The Supabase client for the browser, or null when sign-in is not set up.
export function browserSupabase() {
  if (!authEnabled) return null;
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}
