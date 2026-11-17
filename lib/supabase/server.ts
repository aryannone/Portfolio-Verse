import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL, authEnabled } from "@/lib/supabase/config";

// The Supabase client for server components and route handlers, acting as the signed-in user
// (from their session cookies). Null when sign-in is not set up.
export async function serverSupabase() {
  if (!authEnabled) return null;
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server components cannot set cookies; the middleware keeps the session fresh instead.
        }
      },
    },
  });
}
