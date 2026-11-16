import { NextResponse } from "next/server";
import { checkNote, type Note } from "@/lib/feedback";
import { feedbackReady, rest } from "@/lib/supabaseRest";

// The feedback wall's public API.
// GET: the approved notes, newest first. POST: a new note, stored unapproved until the owner approves it.
// PATCH: the visitor changes their own note (found by the random id their browser keeps). A changed note
// goes back to waiting for approval, so an approved note cannot be swapped for something else.
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

// Reads and checks the body shared by POST and PATCH: the bot trap, the browser's id and the note itself.
async function readNote(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return { error: NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 }) };
  }
  // A field people never see: forms filled in by bots usually fill it.
  if (typeof body.website === "string" && body.website) return { error: NextResponse.json({ error: "Please try again." }, { status: 400 }) };

  const clientId = typeof body.clientId === "string" ? body.clientId : "";
  if (!/^[a-z0-9-]{16,64}$/i.test(clientId)) return { error: NextResponse.json({ error: "Please reload the page and try again." }, { status: 400 }) };

  const checked = checkNote(body);
  if ("error" in checked) return { error: NextResponse.json({ error: checked.error }, { status: 400 }) };
  return { clientId, note: checked.note };
}

export async function POST(request: Request) {
  if (!feedbackReady) return NextResponse.json({ error: "The feedback wall is not open yet." }, { status: 503 });
  const read = await readNote(request);
  if ("error" in read) return read.error;

  const res = await rest(`feedback?select=${FIELDS}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...read.note, client_id: read.clientId, approved: false }),
  });
  if (res.status === 409) {
    // This browser already has a note: hand it back so the visitor can see and edit it.
    const mine = await rest(`feedback?select=${FIELDS}&client_id=eq.${read.clientId}&limit=1`);
    const [note] = mine.ok ? ((await mine.json()) as Note[]) : [];
    return NextResponse.json({ error: "This browser has already added a note.", note }, { status: 409 });
  }
  if (!res.ok) return NextResponse.json({ error: "Could not save your note. Please try again later." }, { status: 502 });
  const [note] = (await res.json()) as Note[];
  return NextResponse.json({ note }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!feedbackReady) return NextResponse.json({ error: "The feedback wall is not open yet." }, { status: 503 });
  const read = await readNote(request);
  if ("error" in read) return read.error;

  const res = await rest(`feedback?select=${FIELDS}&client_id=eq.${read.clientId}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...read.note, approved: false }),
  });
  if (!res.ok) return NextResponse.json({ error: "Could not save your changes. Please try again later." }, { status: 502 });
  const [note] = (await res.json()) as Note[];
  if (!note) return NextResponse.json({ error: "Your note was not found. It may have been removed." }, { status: 404 });
  return NextResponse.json({ note });
}
