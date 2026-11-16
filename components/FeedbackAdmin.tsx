"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { NOTE_FONTS, type Note } from "@/lib/feedback";

type AdminNote = Note & { approved: boolean };
const KEY = "pv_feedback_admin_key";

// Lists every note on the feedback wall, newest first, and lets the owner approve, hide or delete each.
// The key is kept for this browser tab only (sessionStorage) and sent with every request.
export default function FeedbackAdmin() {
  const [key, setKey] = useState("");
  const [typed, setTyped] = useState("");
  const [notes, setNotes] = useState<AdminNote[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"waiting" | "approved" | "all">("waiting");

  async function load(k: string) {
    setError("");
    const res = await fetch("/api/feedback/admin", { headers: { "x-admin-key": k } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not load the notes.");
      if (res.status === 401) {
        sessionStorage.removeItem(KEY);
        setKey("");
      }
      return;
    }
    sessionStorage.setItem(KEY, k);
    setKey(k);
    setNotes(data.notes);
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(KEY);
    if (saved) load(saved);
  }, []);

  async function act(id: string, action: "approve" | "hide" | "delete") {
    if (action === "delete" && !window.confirm("Delete this note for good? The visitor could then add a new one.")) return;
    const res = await fetch("/api/feedback/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ id, action }),
    });
    if (!res.ok) return setError((await res.json().catch(() => ({}))).error ?? "Could not update the note.");
    setNotes((list) =>
      (list ?? []).flatMap((n) => (n.id !== id ? [n] : action === "delete" ? [] : [{ ...n, approved: action === "approve" }])),
    );
  }

  if (!key) {
    return (
      <main className="wrap simple">
        <h1 className="display h-page">Feedback notes</h1>
        <form
          className="fa-login"
          onSubmit={(e) => {
            e.preventDefault();
            load(typed.trim());
          }}
        >
          <label className="ed-field">
            <span>Admin key</span>
            <input className="ed-input" type="password" value={typed} autoComplete="current-password" onChange={(e) => setTyped(e.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit">
            Open
          </button>
        </form>
        {error ? <p className="fw-error" role="alert">{error}</p> : null}
      </main>
    );
  }

  const waiting = (notes ?? []).filter((n) => !n.approved).length;
  const shown = (notes ?? []).filter((n) => (filter === "all" ? true : filter === "approved" ? n.approved : !n.approved));
  return (
    <main className="wrap fa">
      <div className="fa-head">
        <h1 className="display h-page">Feedback notes</h1>
        <div className="ed-seg" role="group" aria-label="Show">
          {(["waiting", "approved", "all"] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === "waiting" ? `Waiting (${waiting})` : f === "approved" ? "On the wall" : "All"}
            </button>
          ))}
        </div>
      </div>
      {error ? <p className="fw-error" role="alert">{error}</p> : null}
      {!shown.length ? <p className="fa-empty">Nothing here.</p> : null}
      <ul className="fa-list">
        {shown.map((n) => (
          <li key={n.id} className="fa-item">
            <div className="fw-note" style={{ "--note": n.color, "--tilt": "0deg", fontFamily: NOTE_FONTS.find((f) => f.id === n.font)?.css } as CSSProperties}>
              <span className="fw-topic">{n.topic}</span>
              <p className="fw-msg">{n.message}</p>
              <span className="fw-name">— {n.name}</span>
            </div>
            <div className="fa-meta">
              <span>{new Date(n.created_at).toLocaleString()}</span>
              <span className={n.approved ? "fa-on" : "fa-wait"}>{n.approved ? "On the wall" : "Waiting"}</span>
            </div>
            <div className="fa-actions">
              {n.approved ? (
                <button className="btn btn-outline" type="button" onClick={() => act(n.id, "hide")}>
                  Hide
                </button>
              ) : (
                <button className="btn btn-primary" type="button" onClick={() => act(n.id, "approve")}>
                  Approve
                </button>
              )}
              <button className="btn btn-quiet" type="button" onClick={() => act(n.id, "delete")}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
