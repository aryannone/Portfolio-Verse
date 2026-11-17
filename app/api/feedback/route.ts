import { NextResponse } from "next/server";
import { checkNote, type Note } from "@/lib/feedback";
import { feedbackReady, rest } from "@/lib/supabaseRest";
import { serverSupabase } from "@/lib/supabase/server";

// The feedback wall's public API.
// GET: the approved notes, pinned ones first, then newest first (open to everyone).
// POST: a new note from a signed-in person, stored unapproved until the owner approves it. One note per Google account.
// PATCH: the signed-in person changes their own note. A changed note goes back to waiting for approval,
// so an approved note cannot be swapped for something else.
// The signed-in person's own note is read from /api/feedback/mine.
export const dynamic = "force-dynamic";

const FIELDS = "id,name,topic,message,color,font,created_at,pinned,reply";

export async function GET() {
  if (!feedbackReady) return NextResponse.json({ notes: [], ready: false });
  const res = await rest(`feedback?select=${FIELDS}&approved=eq.true&order=pinned.desc,created_at.desc&limit=60`);
  if (!res.ok) return NextResponse.json({ notes: [], ready: true, error: "Could not load notes" }, { status: 502 });
  const notes = (await res.json()) as Note[];
  // A short shared cache: the wall does not need to be live to the second.
  return NextResponse.json({ notes, ready: true }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } });
}

// The signed-in person (from their session cookie), or null.
async function signedInUser() {
  const supabase = await serverSupabase();
  return supabase ? (await supabase.auth.getUser()).data.user : null;
}

// Checks what POST and PATCH share: a signed-in person, the bot trap and the note itself.
async function readNote(request: Request) {
  const user = await signedInUser();
  if (!user) return { error: NextResponse.json({ error: "Please sign in with Google to leave a note." }, { status: 401 }) };
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return { error: NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 }) };
  }
  // A field people never see: forms filled in by bots usually fill it.
  if (typeof body.website === "string" && body.website) return { error: NextResponse.json({ error: "Please try again." }, { status: 400 }) };

  const checked = checkNote(body);
  if ("error" in checked) return { error: NextResponse.json({ error: checked.error }, { status: 400 }) };
  return { userId: user.id, note: checked.note };
}

export async function POST(request: Request) {
  if (!feedbackReady) return NextResponse.json({ error: "The feedback wall is not open yet." }, { status: 503 });
  const read = await readNote(request);
  if ("error" in read) return read.error;

  const res = await rest(`feedback?select=${FIELDS}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...read.note, user_id: read.userId, approved: false }),
  });
  if (res.status === 409) {
    // This account already has a note: hand it back so it can be seen and edited.
    const mine = await rest(`feedback?select=${FIELDS}&user_id=eq.${read.userId}&limit=1`);
    const [note] = mine.ok ? ((await mine.json()) as Note[]) : [];
    return NextResponse.json({ error: "You have already added a note.", note }, { status: 409 });
  }
  if (!res.ok) return NextResponse.json({ error: "Could not save your note. Please try again later." }, { status: 502 });
  const [note] = (await res.json()) as Note[];
  return NextResponse.json({ note }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!feedbackReady) return NextResponse.json({ error: "The feedback wall is not open yet." }, { status: 503 });
  const read = await readNote(request);
  if ("error" in read) return read.error;

  const res = await rest(`feedback?select=${FIELDS}&user_id=eq.${read.userId}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...read.note, approved: false }),
  });
  if (!res.ok) return NextResponse.json({ error: "Could not save your changes. Please try again later." }, { status: 502 });
  const [note] = (await res.json()) as Note[];
  if (!note) return NextResponse.json({ error: "Your note was not found. It may have been removed." }, { status: 404 });
  return NextResponse.json({ note });
}
