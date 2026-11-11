import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

// Returns null until the two Supabase keys are added in Vercel,
// so the site keeps working before login is set up.
export function getSupabase() {
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}
