import { NextResponse } from "next/server";
import type { Note } from "@/lib/feedback";
import { feedbackReady, rest } from "@/lib/supabaseRest";
import { serverSupabase } from "@/lib/supabase/server";

// Who is looking at the feedback wall: signed in or not, their name for the note, and their own note
// (approved or not) if they have written one. Never cached: it is different for every person.
export const dynamic = "force-dynamic";

const FIELDS = "id,name,topic,message,color,font,created_at,pinned,reply,approved";
const PRIVATE = { headers: { "Cache-Control": "private, no-store" } };

export async function GET() {
  const supabase = await serverSupabase();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user) return NextResponse.json({ signedIn: false }, PRIVATE);

  const meta = user.user_metadata ?? {};
  const name = String(meta.full_name ?? meta.name ?? "").split(" ")[0].slice(0, 30);
  let note: (Note & { approved: boolean }) | null = null;
  if (feedbackReady) {
    const res = await rest(`feedback?select=${FIELDS}&user_id=eq.${user.id}&limit=1`);
    if (res.ok) [note = null] = (await res.json()) as (Note & { approved: boolean })[];
  }
  return NextResponse.json({ signedIn: true, name, note }, PRIVATE);
}
