"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { LIMITS, NOTE_FONTS, type Note } from "@/lib/feedback";
import { PinnedHeart } from "@/components/FeedbackWall";

type AdminNote = Note & { approved: boolean };
type Action = "approve" | "hide" | "delete" | "pin" | "unpin";
const KEY = "pv_feedback_admin_key";

// Lists every note on the feedback wall and lets the owner approve, hide, pin, reply to or delete each,
// or approve every waiting note at once. Notes can be searched and sorted.
// The key is kept for this browser tab only (sessionStorage) and sent with every request.
export default function FeedbackAdmin() {
  const [key, setKey] = useState("");
  const [typed, setTyped] = useState("");
  const [notes, setNotes] = useState<AdminNote[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"waiting" | "approved" | "all">("waiting");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [replying, setReplying] = useState<{ id: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

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

  async function send(body: Record<string, unknown>) {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/feedback/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": key },
        body: JSON.stringify(body),
      });
      if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? "Could not update the note.");
      return res.ok;
    } finally {
      setBusy(false);
    }
  }

  const update = (id: string, change: (n: AdminNote) => AdminNote | null) =>
    setNotes((list) => (list ?? []).flatMap((n) => (n.id !== id ? [n] : (change(n) ?? []) as AdminNote[])));

  async function act(id: string, action: Action) {
    if (action === "delete" && !window.confirm("Delete this note for good? The visitor could then add a new one.")) return;
    if (!(await send({ id, action }))) return;
    update(id, (n) =>
      action === "delete" ? null : action === "pin" || action === "unpin" ? { ...n, pinned: action === "pin" } : { ...n, approved: action === "approve" },
    );
  }

  async function saveReply(id: string, text: string) {
    const reply = text.replace(/\s+/g, " ").trim();
    if (!(await send({ id, action: "reply", reply }))) return;
    update(id, (n) => ({ ...n, reply: reply || null }));
    setReplying(null);
  }

  async function approveAll(count: number) {
    if (!window.confirm(`Put all ${count} waiting notes on the wall?`)) return;
    if (!(await send({ action: "approve_all" }))) return;
    setNotes((list) => (list ?? []).map((n) => ({ ...n, approved: true })));
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
  const words = query.trim().toLowerCase();
  const shown = (notes ?? [])
    .filter((n) => (filter === "all" ? true : filter === "approved" ? n.approved : !n.approved))
    .filter((n) => !words || [n.name, n.message, n.topic, n.reply ?? ""].join(" ").toLowerCase().includes(words))
    .sort((a, b) => (sort === "newest" ? -1 : 1) * a.created_at.localeCompare(b.created_at));

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

      <div className="fa-tools">
        <label className="ed-field fa-search">
          <span>Search</span>
          <input className="ed-input" type="search" value={query} placeholder="Name, words or topic" onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className="ed-field">
          <span>Sort</span>
          <select className="ed-input" value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest")}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
        {waiting ? (
          <button className="btn btn-primary fa-all" type="button" disabled={busy} onClick={() => approveAll(waiting)}>
            Approve all waiting ({waiting})
          </button>
        ) : null}
      </div>

      {error ? <p className="fw-error" role="alert">{error}</p> : null}
      {!shown.length ? <p className="fa-empty">{words ? "No notes match your search." : "Nothing here."}</p> : null}
      <ul className="fa-list">
        {shown.map((n) => (
          <li key={n.id} className="fa-item">
            <div
              className={`fw-note${n.pinned ? " is-pinned" : ""}`}
              style={{ "--note": n.color, "--tilt": "0deg", fontFamily: NOTE_FONTS.find((f) => f.id === n.font)?.css } as CSSProperties}
            >
              {n.pinned ? <PinnedHeart /> : null}
              <span className="fw-topic">{n.topic}</span>
              <p className="fw-msg">{n.message}</p>
              <span className="fw-name">— {n.name}</span>
              {n.reply ? (
                <p className="fw-reply">
                  <strong>Reply:</strong> {n.reply}
                </p>
              ) : null}
            </div>
            <div className="fa-meta">
              <span>{new Date(n.created_at).toLocaleString()}</span>
              <span className={n.approved ? "fa-on" : "fa-wait"}>{n.approved ? "On the wall" : "Waiting"}</span>
            </div>

            {replying?.id === n.id ? (
              <form
                className="fa-reply"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveReply(n.id, replying.text);
                }}
              >
                <label className="ed-field">
                  <span>Your reply (shown under the note)</span>
                  <textarea
                    className="ed-input"
                    rows={3}
                    maxLength={LIMITS.reply}
                    value={replying.text}
                    autoFocus
                    onChange={(e) => setReplying({ id: n.id, text: e.target.value })}
                  />
                </label>
                <div className="fa-actions">
                  <button className="btn btn-primary" type="submit" disabled={busy}>
                    Save reply
                  </button>
                  {n.reply ? (
                    <button className="btn btn-quiet" type="button" disabled={busy} onClick={() => saveReply(n.id, "")}>
                      Remove
                    </button>
                  ) : null}
                  <button className="btn btn-quiet" type="button" onClick={() => setReplying(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="fa-actions">
                {n.approved ? (
                  <button className="btn btn-outline" type="button" disabled={busy} onClick={() => act(n.id, "hide")}>
                    Hide
                  </button>
                ) : (
                  <button className="btn btn-primary" type="button" disabled={busy} onClick={() => act(n.id, "approve")}>
                    Approve
                  </button>
                )}
                <button className="btn btn-outline" type="button" disabled={busy} onClick={() => act(n.id, n.pinned ? "unpin" : "pin")}>
                  {n.pinned ? "Unpin" : "Pin"}
                </button>
                <button className="btn btn-outline" type="button" onClick={() => setReplying({ id: n.id, text: n.reply ?? "" })}>
                  {n.reply ? "Edit reply" : "Reply"}
                </button>
                <button className="btn btn-quiet" type="button" disabled={busy} onClick={() => act(n.id, "delete")}>
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
