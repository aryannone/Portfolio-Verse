import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { feedbackReady, rest } from "@/lib/supabaseRest";
import { serverSupabase } from "@/lib/supabase/server";
import { VISITOR_COOKIE, VISITOR_COOKIE_OPTIONS, VISITOR_ID, recordVisit, visitorCount } from "@/lib/visitors";

// The numbers shown on the home page: unique visitors, HTML downloads and approved feedback notes.
// GET: the current numbers (cached for at most a minute, so a refresh is never more than a minute behind).
// POST { event: "visit" }: records this browser (once, ever) and links it to the signed-in account, if any;
//   answers with the up-to-date visitor number. POST { event: "download" }: counts one more download.
export const dynamic = "force-dynamic";

async function noteCount() {
  const res = await rest("feedback?select=id&approved=eq.true", { method: "HEAD", headers: { Prefer: "count=exact" } });
  // Content-Range looks like "0-4/5" (or "*/0"); the number after the slash is the total.
  return res.ok ? Number(res.headers.get("content-range")?.split("/")[1] ?? 0) || 0 : null;
}

export async function GET() {
  if (!feedbackReady) return NextResponse.json({ ready: false });
  const [visitors, stats, notes] = await Promise.all([visitorCount(), rest("site_stats?select=key,value&key=eq.downloads"), noteCount()]);
  if (visitors === null || !stats.ok || notes === null) return NextResponse.json({ ready: false }, { status: 502 });
  const [downloads] = (await stats.json()) as { value: number }[];
  return NextResponse.json(
    { ready: true, visitors, downloads: Number(downloads?.value ?? 0), notes },
    { headers: { "Cache-Control": "public, s-maxage=60" } },
  );
}

export async function POST(request: Request) {
  if (!feedbackReady) return NextResponse.json({ ok: false }, { status: 503 });
  const { event } = (await request.json().catch(() => ({}))) as { event?: string };

  if (event === "download") {
    const res = await rest("rpc/increment_stat", { method: "POST", body: JSON.stringify({ stat: "downloads" }) });
    return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 502 });
  }
  if (event !== "visit") return NextResponse.json({ error: "Unknown event." }, { status: 400 });

  const store = await cookies();
  const known = store.get(VISITOR_COOKIE)?.value;
  const browserId = known && VISITOR_ID.test(known) ? known : crypto.randomUUID();
  const supabase = await serverSupabase();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const res = await recordVisit(browserId, user?.id ?? null);
  const visitors = res.ok ? await visitorCount() : null;
  const response = NextResponse.json({ ok: res.ok, visitors }, { status: res.ok ? 200 : 502, headers: { "Cache-Control": "private, no-store" } });
  response.cookies.set(VISITOR_COOKIE, browserId, VISITOR_COOKIE_OPTIONS);
  return response;
}
