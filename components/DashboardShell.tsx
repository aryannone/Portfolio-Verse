"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

// Placeholder for step 3. It proves that login works and lets the user sign out.
export default function DashboardShell() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      router.replace("/login");
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      const meta = data.user.user_metadata as { full_name?: string; name?: string };
      setName(meta.full_name || meta.name || "there");
      setReady(true);
    });
  }, [router]);

  async function signOut() {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    router.replace("/");
  }

  if (!ready) {
    return <p>Loading your dashboard…</p>;
  }

  return (
    <>
      <h1 className="display h-page">Welcome, {name}.</h1>
      <p>You are signed in. Your dashboard and the create flow are the next things being built.</p>
      <button type="button" className="btn btn-outline" onClick={signOut}>
        Sign out
      </button>
    </>
  );
}
