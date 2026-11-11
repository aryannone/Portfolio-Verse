import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Admin preview: lets the owner open login-only pages without Google sign-in.
// It is off until ADMIN_KEY is set in Vercel > Settings > Environment Variables.
export const ADMIN_COOKIE = "pv_admin";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function adminEnabled() {
  return Boolean(process.env.ADMIN_KEY);
}

export function keyMatches(candidate: string) {
  const key = process.env.ADMIN_KEY;
  if (!key) return false;
  return timingSafeEqual(digest(candidate), digest(key));
}

// The cookie holds a hash of the key, never the key itself.
export function adminCookieValue() {
  return digest(`pv-admin:${process.env.ADMIN_KEY ?? ""}`).toString("hex");
}

// Use this on any server page that normally needs a signed-in user.
export async function isAdmin() {
  if (!adminEnabled()) return false;
  const cookie = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!cookie) return false;
  return timingSafeEqual(digest(cookie), digest(adminCookieValue()));
}
