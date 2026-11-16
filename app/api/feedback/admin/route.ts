import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { feedbackReady, rest } from "@/lib/supabaseRest";

// The owner's side of the feedback wall: list every note, approve, hide or delete one.
// Every request needs the secret FEEDBACK_ADMIN_KEY (set in Vercel) in the x-admin-key header.
export const dynamic = "force-dynamic";

function allowed(request: Request) {
  const expected = process.env.FEEDBACK_ADMIN_KEY ?? "";
  const given = request.headers.get("x-admin-key") ?? "";
  if (expected.length < 12 || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

const denied = () => NextResponse.json({ error: "Wrong key." }, { status: 401 });

export async function GET(request: Request) {
  if (!allowed(request)) return denied();
  if (!feedbackReady) return NextResponse.json({ error: "Supabase is not set up." }, { status: 503 });
  const res = await rest("feedback?select=id,name,topic,message,color,font,approved,created_at&order=created_at.desc&limit=500");
  if (!res.ok) return NextResponse.json({ error: "Could not load notes." }, { status: 502 });
  return NextResponse.json({ notes: await res.json() });
}

export async function POST(request: Request) {
  if (!allowed(request)) return denied();
  if (!feedbackReady) return NextResponse.json({ error: "Supabase is not set up." }, { status: 503 });
  const { id, action } = (await request.json().catch(() => ({}))) as { id?: string; action?: string };
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Unknown note." }, { status: 400 });
  const where = `feedback?id=eq.${id}`;
  let res: Response;
  if (action === "approve" || action === "hide") {
    res = await rest(where, { method: "PATCH", body: JSON.stringify({ approved: action === "approve" }) });
  } else if (action === "delete") {
    res = await rest(where, { method: "DELETE" });
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
  if (!res.ok) return NextResponse.json({ error: "Could not update the note." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
