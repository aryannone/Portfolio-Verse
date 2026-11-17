import { NextResponse } from "next/server";
import { SITE_BUCKET, siteFile, sitePath } from "@/lib/publish";
import { feedbackReady, rest, storageFetch } from "@/lib/supabaseRest";
import { serverSupabase } from "@/lib/supabase/server";

// The signed-in person's published site.
// GET: is it live, and at which link. POST: mark the file they just uploaded as live. DELETE: take it down.
export const dynamic = "force-dynamic";

const PRIVATE = { headers: { "Cache-Control": "private, no-store" } };

async function me() {
  const supabase = await serverSupabase();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user || !feedbackReady) return null;
  const res = await rest(`profiles?select=username,published_at&id=eq.${user.id}`);
  const [profile] = res.ok ? ((await res.json()) as { username: string | null; published_at: string | null }[]) : [];
  return { id: user.id, username: profile?.username ?? null, publishedAt: profile?.published_at ?? null };
}

const status = (p: { username: string | null; publishedAt: string | null }) => ({
  username: p.username,
  live: Boolean(p.publishedAt && p.username),
  publishedAt: p.publishedAt,
  path: p.username ? sitePath(p.username) : null,
});

export async function GET() {
  const p = await me();
  if (!p) return NextResponse.json({ signedIn: false }, PRIVATE);
  return NextResponse.json({ signedIn: true, ...status(p) }, PRIVATE);
}

export async function POST() {
  const p = await me();
  if (!p) return NextResponse.json({ error: "Please sign in to publish." }, { status: 401 });
  if (!p.username) return NextResponse.json({ error: "Please choose a username on your profile first: it becomes your site's link." }, { status: 409 });
  // The file must be there: the browser uploads it just before this.
  const file = await storageFetch(`object/info/${SITE_BUCKET}/${siteFile(p.id)}`);
  if (!file.ok) return NextResponse.json({ error: "Your site did not finish uploading. Please try again." }, { status: 400 });
  const publishedAt = new Date().toISOString();
  const res = await rest(`profiles?id=eq.${p.id}`, { method: "PATCH", body: JSON.stringify({ published_at: publishedAt }) });
  if (!res.ok) return NextResponse.json({ error: "Could not publish. Please try again." }, { status: 502 });
  return NextResponse.json(status({ ...p, publishedAt }), PRIVATE);
}

export async function DELETE() {
  const p = await me();
  if (!p) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  await storageFetch(`object/${SITE_BUCKET}/${siteFile(p.id)}`, { method: "DELETE" });
  const res = await rest(`profiles?id=eq.${p.id}`, { method: "PATCH", body: JSON.stringify({ published_at: null }) });
  if (!res.ok) return NextResponse.json({ error: "Could not take your site down. Please try again." }, { status: 502 });
  return NextResponse.json(status({ ...p, publishedAt: null }), PRIVATE);
}
