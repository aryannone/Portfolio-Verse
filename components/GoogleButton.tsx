"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Props = {
  label?: string;
  variant?: "primary" | "outline";
  template?: string;
};

// The single way into the product: Google sign-in.
// If a template id is passed, it is remembered so the create flow can use it after login.
export default function GoogleButton({
  label = "Start free with Google",
  variant = "primary",
  template,
}: Props) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    setMessage("");
    if (template) {
      try {
        window.localStorage.setItem("pv_template", template);
      } catch {
        // Storage can be blocked; the user can pick the template again after login.
      }
    }
    const supabase = getSupabase();
    if (!supabase) {
      setMessage("Google login is being set up. Please check back soon.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setBusy(false);
      setMessage("Could not open Google sign-in. Please try again.");
    }
  }

  return (
    <span className="gbtn-wrap">
      <button
        type="button"
        className={variant === "primary" ? "btn btn-primary" : "btn btn-outline"}
        onClick={start}
        disabled={busy}
      >
        {busy ? "Opening Google…" : label}
      </button>
      {message ? (
        <span className="gbtn-msg" role="status">
          {message}
        </span>
      ) : null}
    </span>
  );
}
