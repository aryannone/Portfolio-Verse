"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { browserSupabase } from "@/lib/supabase/client";

// The right end of the header: "Sign in", or the signed-in person's Google photo linking to their profile.
// Shows nothing when sign-in is not set up.
export default function UserMenu() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const supabase = browserSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  if (user === undefined) return null;
  if (!user) {
    return (
      <Link href="/signin" className="nav-link">
        Sign in
      </Link>
    );
  }
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Your profile";
  const photo = user.user_metadata?.avatar_url as string | undefined;
  return (
    <Link href="/profile" className="user-chip" aria-label={`Your profile (${name})`} title={name}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" width={32} height={32} referrerPolicy="no-referrer" />
      ) : (
        <span aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
      )}
    </Link>
  );
}
