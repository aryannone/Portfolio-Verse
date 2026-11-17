// Sign-in uses Supabase Auth with Google. These two values are public by design (they are sent to every
// browser); what a signed-in user can read or change is limited by row level security in the database.
// Without them (local development, tests) sign-in is off and every page is open, as before accounts existed.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const authEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

// Pages that need a signed-in user: building, the saved list and the profile. The home page,
// templates, privacy page and published sites stay open to everyone.
export const SIGNED_IN_ONLY = ["/start", "/editor", "/saved", "/profile"];

// Only paths on this site may be returned to after signing in.
export function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/editor";
}
