// A small server-only helper for the feedback table, using Supabase's REST API directly (no SDK needed).
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, set in Vercel. Never import this into a client component.

const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const feedbackReady = Boolean(url && key);

export async function rest(path: string, init: RequestInit = {}) {
  if (!url || !key) throw new Error("Feedback storage is not set up");
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

// Supabase Storage with the service role key (server only): reads and removes published site files.
export async function storageFetch(path: string, init: RequestInit = {}) {
  if (!url || !key) throw new Error("Storage is not set up");
  return fetch(`${url}/storage/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...(init.headers ?? {}) },
  });
}
