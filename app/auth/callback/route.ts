import { NextResponse } from "next/server";
import { safeNext } from "@/lib/supabase/config";
import { cookies } from "next/headers";
import { serverSupabase } from "@/lib/supabase/server";
import { feedbackReady } from "@/lib/supabaseRest";
import { VISITOR_COOKIE, VISITOR_ID, recordVisit } from "@/lib/visitors";

// Google sends people back here after they sign in. The one-time code becomes a session cookie,
// then they go on to the page they were heading for.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const supabase = await serverSupabase();
  if (supabase && code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Link this browser to the account, so a person signed in on several devices counts as one visitor.
      const browserId = (await cookies()).get(VISITOR_COOKIE)?.value;
      if (feedbackReady && data.user && browserId && VISITOR_ID.test(browserId)) await recordVisit(browserId, data.user.id).catch(() => null);
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(new URL(`/signin?error=1&next=${encodeURIComponent(next)}`, url.origin));
}
