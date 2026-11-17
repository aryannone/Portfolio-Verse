import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";

// Signs out and goes back to the home page. A POST, so a link or an image cannot sign anyone out.
export async function POST(request: Request) {
  const supabase = await serverSupabase();
  await supabase?.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
