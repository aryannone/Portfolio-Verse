import { rest } from "@/lib/supabaseRest";

// Unique visitors: each browser gets a random, anonymous id in a first-party cookie, recorded once.
// A browser that signs in is linked to that Google account, so one person on several devices,
// signed in on each, counts once. The number is: signed-in people + browsers that never signed in.
export const VISITOR_COOKIE = "pv_vid";
export const VISITOR_ID = /^[a-z0-9-]{16,64}$/;
export const VISITOR_COOKIE_OPTIONS = { httpOnly: true, sameSite: "lax" as const, secure: true, path: "/", maxAge: 60 * 60 * 24 * 400 };

export async function recordVisit(browserId: string, userId: string | null) {
  return rest("rpc/record_visit", { method: "POST", body: JSON.stringify({ browser: browserId, account: userId }) });
}

export async function visitorCount() {
  const res = await rest("rpc/visitor_count", { method: "POST", body: "{}" });
  return res.ok ? Number(await res.json()) || 0 : null;
}
