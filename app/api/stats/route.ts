import { NextResponse } from "next/server";
import { feedbackReady, rest } from "@/lib/supabaseRest";

// The numbers shown on the home page: visitors, HTML downloads and approved feedback notes.
// GET: the current numbers (cached for a minute). POST { event: "visit" | "download" }: count one more.
// Visits are counted once per browser per day by the page itself (components/SiteStats.tsx).
export const dynamic = "force-dynamic";

const EVENTS = { visit: "visitors", download: "downloads" } as const;

export async function GET() {
  if (!feedbackReady) return NextResponse.json({ ready: false });
  const [stats, notes] = await Promise.all([
    rest("site_stats?select=key,value"),
    rest("feedback?select=id&approved=eq.true", { method: "HEAD", headers: { Prefer: "count=exact" } }),
  ]);
  if (!stats.ok || !notes.ok) return NextResponse.json({ ready: false }, { status: 502 });
  const rows = (await stats.json()) as { key: string; value: number }[];
  const value = (key: string) => Number(rows.find((r) => r.key === key)?.value ?? 0);
  // Content-Range looks like "0-4/5" (or "*/0"); the number after the slash is the total.
  const total = Number(notes.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
  return NextResponse.json(
    { ready: true, visitors: value("visitors"), downloads: value("downloads"), notes: total },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}

export async function POST(request: Request) {
  if (!feedbackReady) return NextResponse.json({ ok: false }, { status: 503 });
  const { event } = (await request.json().catch(() => ({}))) as { event?: string };
  const stat = EVENTS[event as keyof typeof EVENTS];
  if (!stat) return NextResponse.json({ error: "Unknown event." }, { status: 400 });
  const res = await rest("rpc/increment_stat", { method: "POST", body: JSON.stringify({ stat }) });
  return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 502 });
}
