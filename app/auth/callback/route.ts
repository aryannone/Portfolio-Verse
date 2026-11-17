import { NextResponse } from "next/server";
import { safeNext } from "@/lib/supabase/config";
import { serverSupabase } from "@/lib/supabase/server";

// Google sends people back here after they sign in. The one-time code becomes a session cookie,
// then they go on to the page they were heading for.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const supabase = await serverSupabase();
  if (supabase && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL(`/signin?error=1&next=${encodeURIComponent(next)}`, url.origin));
}
