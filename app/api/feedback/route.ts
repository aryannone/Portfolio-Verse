import { NextResponse } from "next/server";
import { checkNote, type Note } from "@/lib/feedback";
import { feedbackReady, rest } from "@/lib/supabaseRest";

// The feedback wall's public API.
// GET: the approved notes, newest first. POST: a new note, stored unapproved until the owner approves it.
export const dynamic = "force-dynamic";

const FIELDS = "id,name,topic,message,color,font,created_at";

export async function GET() {
  if (!feedbackReady) return NextResponse.json({ notes: [], ready: false });
  const res = await rest(`feedback?select=${FIELDS}&approved=eq.true&order=created_at.desc&limit=60`);
  if (!res.ok) return NextResponse.json({ notes: [], ready: true, error: "Could not load notes" }, { status: 502 });
  const notes = (await res.json()) as Note[];
  // A short shared cache: the wall does not need to be live to the second.
  return NextResponse.json({ notes, ready: true }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } });
}

export async function POST(request: Request) {
  if (!feedbackReady) return NextResponse.json({ error: "The feedback wall is not open yet." }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }
  // A field people never see: forms filled in by bots usually fill it.
  if (typeof body.website === "string" && body.website) return NextResponse.json({ error: "Please try again." }, { status: 400 });

  const clientId = typeof body.clientId === "string" ? body.clientId : "";
  if (!/^[a-z0-9-]{16,64}$/i.test(clientId)) return NextResponse.json({ error: "Please reload the page and try again." }, { status: 400 });

  const checked = checkNote(body);
  if ("error" in checked) return NextResponse.json({ error: checked.error }, { status: 400 });

  const res = await rest(`feedback?select=${FIELDS}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...checked.note, client_id: clientId, approved: false }),
  });
  if (res.status === 409) return NextResponse.json({ error: "This browser has already added a note. Thank you!" }, { status: 409 });
  if (!res.ok) return NextResponse.json({ error: "Could not save your note. Please try again later." }, { status: 502 });
  const [note] = (await res.json()) as Note[];
  return NextResponse.json({ note }, { status: 201 });
}
