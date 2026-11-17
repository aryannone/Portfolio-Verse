"use client";

import { useState } from "react";
import { browserSupabase } from "@/lib/supabase/client";

// Usernames become the link to a published site (/u/username): 3 to 30 lowercase letters, digits or
// hyphens, not starting or ending with a hyphen. The database checks the same rule and that it is unique.
const USERNAME = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
const RESERVED = new Set(["admin", "portfolio-verse", "portfolioverse", "support", "help", "official", "team"]);

export default function ProfileForm({ initialName, initialUsername, userId }: { initialName: string; initialUsername: string; userId: string }) {
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = name.replace(/\s+/g, " ").trim();
    const cleanUser = username.trim().toLowerCase();
    if (!cleanName || cleanName.length > 60) return setStatus({ ok: false, text: "Please enter your name (up to 60 letters)." });
    if (cleanUser && !USERNAME.test(cleanUser))
      return setStatus({ ok: false, text: "Usernames are 3–30 lowercase letters, numbers or hyphens, and cannot start or end with a hyphen." });
    if (RESERVED.has(cleanUser)) return setStatus({ ok: false, text: "That username is taken. Please pick another." });

    const supabase = browserSupabase();
    if (!supabase) return;
    setBusy(true);
    setStatus(null);
    const { error } = await supabase.from("profiles").update({ display_name: cleanName, username: cleanUser || null }).eq("id", userId);
    setBusy(false);
    if (error) {
      setStatus({ ok: false, text: error.code === "23505" ? "That username is taken. Please pick another." : "Could not save. Please try again." });
      return;
    }
    setName(cleanName);
    setUsername(cleanUser);
    setStatus({ ok: true, text: "Saved." });
  }

  const preview = username.trim().toLowerCase() || "your-name";
  return (
    <form className="profile-form" onSubmit={save} noValidate>
      <label className="ed-field">
        <span>Your name</span>
        <input className="ed-input" value={name} maxLength={60} autoComplete="name" onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="ed-field">
        <span>Username</span>
        <input
          className="ed-input"
          value={username}
          maxLength={30}
          autoCapitalize="none"
          spellCheck={false}
          placeholder="e.g. priya-sharma"
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
        />
        <small className="ed-hint">Your published site will live at portfolio-verse-tau.vercel.app/u/{preview}</small>
      </label>
      <div className="fa-actions">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
        {status ? (
          <p className={status.ok ? "profile-ok" : "fw-error"} role={status.ok ? "status" : "alert"}>
            {status.text}
          </p>
        ) : null}
      </div>
    </form>
  );
}
