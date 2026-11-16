"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import {
  LIMITS,
  NOTE_COLORS,
  NOTE_FONTS,
  TOPICS,
  checkNote,
  tiltOf,
  type Note,
  type NoteColor,
  type NoteFont,
  type Topic,
} from "@/lib/feedback";

// The feedback wall at the bottom of the home page.
// Left: a cork board with the approved notes. Right: a pad of sticky notes to write on.
// A note is stuck on by dragging it onto the board or with the button. It waits for the owner's approval
// before others see it, but the visitor who wrote it sees it on the wall straight away (kept in this browser).
// Each browser can add one note: the browser remembers it, and the server refuses a second one.
// The visitor can change their note's words and style at any time; a changed note is approved again.

const MINE_KEY = "pv_feedback_note";
const CLIENT_KEY = "pv_feedback_client";

type Mine = Note & { approved?: boolean };

const fontCss = (id: NoteFont) => NOTE_FONTS.find((f) => f.id === id)?.css ?? NOTE_FONTS[0].css;

function readMine(): Mine | "posted" | null {
  try {
    const raw = window.localStorage.getItem(MINE_KEY);
    if (!raw) return null;
    return raw === "posted" ? "posted" : (JSON.parse(raw) as Mine);
  } catch {
    return null;
  }
}

function clientId() {
  try {
    let id = window.localStorage.getItem(CLIENT_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^a-z0-9-]/gi, "");
      window.localStorage.setItem(CLIENT_KEY, id);
    }
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

// The mark on a note the owner has pinned to the top of the wall.
export function PinnedHeart() {
  return (
    <span className="fw-pinned" role="img" aria-label="Pinned">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.2 0 3.7 1.3 5.2 3.1 1.5-1.8 3-3.1 5.2-3.1 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" /></svg>
    </span>
  );
}

function StuckNote({ note, mine, hidden }: { note: Note; mine?: boolean; hidden?: boolean }) {
  return (
    <li
      className={`fw-note${mine ? " is-mine" : ""}${note.pinned ? " is-pinned" : ""}`}
      data-id={note.id}
      style={{ "--note": note.color, "--tilt": `${tiltOf(note.id)}deg`, fontFamily: fontCss(note.font), visibility: hidden ? "hidden" : undefined } as CSSProperties}
    >
      <span className="fw-pin" aria-hidden="true" />
      {note.pinned ? <PinnedHeart /> : null}
      <span className="fw-topic">{note.topic}</span>
      <p className="fw-msg">{note.message}</p>
      <span className="fw-name">— {note.name}</span>
      {note.reply ? (
        <p className="fw-reply">
          <strong>Reply:</strong> {note.reply}
        </p>
      ) : null}
    </li>
  );
}

export default function FeedbackWall() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mine, setMine] = useState<Mine | "posted" | null>(null);
  const [flying, setFlying] = useState(false);
  const [editing, setEditing] = useState(false);

  const [color, setColor] = useState<NoteColor>(NOTE_COLORS[0]);
  const [font, setFont] = useState<NoteFont>("caveat");
  const [topic, setTopic] = useState<Topic>("Overall");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [trap, setTrap] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [overBoard, setOverBoard] = useState(false);
  const [more, setMore] = useState(false);
  const board = useRef<HTMLDivElement>(null);
  const draft = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const flyFrom = useRef<DOMRect | null>(null);

  useEffect(() => {
    setMine(readMine());
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((d: { notes?: Note[] }) => setNotes(d.notes ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // The visitor's note comes from this browser's copy, with the owner's pin and reply taken from the wall.
  const mineLocal = mine && mine !== "posted" ? mine : null;
  const mineOnWall = mineLocal ? notes.find((n) => n.id === mineLocal.id) : undefined;
  const mineNote: Mine | null = mineLocal ? { ...mineLocal, pinned: mineOnWall?.pinned, reply: mineOnWall?.reply } : null;
  const posted = Boolean(mine);

  // After a note is posted, it flies from the pad to its place on the board.
  useEffect(() => {
    if (!flying || !mineLocal || !board.current) return;
    const target = board.current.querySelector<HTMLElement>(`[data-id="${mineLocal.id}"]`);
    const from = flyFrom.current;
    const done = () => {
      setFlying(false);
      target?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    };
    if (!target || !from || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return done();
    target.scrollIntoView({ block: "nearest" });
    const to = target.getBoundingClientRect();
    const ghost = target.cloneNode(true) as HTMLElement;
    ghost.classList.add("fw-ghost");
    ghost.style.visibility = "visible";
    Object.assign(ghost.style, { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` });
    document.body.appendChild(ghost);
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const s = from.width / to.width;
    const anim = ghost.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(0deg)`, boxShadow: "0 30px 40px rgba(0,0,0,0.35)" },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 60}px) scale(${(s + 1) / 2 + 0.08}) rotate(-8deg)`, offset: 0.55 },
        { transform: `translate(0, 0) scale(1) rotate(${tiltOf(mineLocal.id)}deg)`, boxShadow: "0 6px 10px rgba(0,0,0,0.25)" },
      ],
      { duration: 900, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)" },
    );
    anim.onfinish = () => {
      ghost.remove();
      done();
    };
    return () => ghost.remove();
  }, [flying, mineLocal]);

  function remember(value: Mine | "posted") {
    try {
      window.localStorage.setItem(MINE_KEY, typeof value === "string" ? value : JSON.stringify(value));
    } catch {
      // Without storage the note is still on the server; it just will not be shown back after a reload.
    }
    setMine(value);
  }

  // Opens the pad again with the visitor's note on it, to change its words or its style.
  function startEdit() {
    if (!mineNote) return;
    setColor(mineNote.color);
    setFont(mineNote.font);
    setTopic(mineNote.topic);
    setMessage(mineNote.message);
    setName(mineNote.name);
    setError("");
    setEditing(true);
  }

  // Sticks a new note on the wall, or saves the changes to the visitor's note.
  async function stick(from: DOMRect | null) {
    setError("");
    const checked = checkNote({ name, message, topic, color, font });
    if ("error" in checked) {
      setError(checked.error);
      return false;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/feedback", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...checked.note, clientId: clientId(), website: trap }),
      });
      const data = (await res.json().catch(() => ({}))) as { note?: Note; error?: string };
      if (res.status === 409) {
        // This browser already has a note on the server: show that one, so it can be edited.
        remember(data.note ? { ...data.note, approved: false } : "posted");
        return true;
      }
      if (!res.ok || !data.note) {
        setError(data.error ?? "Could not save your note. Please try again later.");
        return false;
      }
      flyFrom.current = from ?? draft.current?.getBoundingClientRect() ?? null;
      remember({ ...data.note, approved: false });
      setEditing(false);
      setFlying(true);
      return true;
    } catch {
      setError("Could not reach the wall. Please check your connection and try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  // Dragging the note by its tape: it follows the pointer, and sticks when let go over the board.
  function onGrab(e: ReactPointerEvent<HTMLElement>) {
    if (busy) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0 });
  }
  function onDrag(e: ReactPointerEvent<HTMLElement>) {
    if (!dragStart.current) return;
    setDrag({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    const b = board.current?.getBoundingClientRect();
    setOverBoard(Boolean(b && e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom));
  }
  async function onDrop() {
    if (!dragStart.current) return;
    dragStart.current = null;
    const from = draft.current?.getBoundingClientRect() ?? null;
    const wasOver = overBoard;
    setOverBoard(false);
    if (wasOver && (await stick(from))) {
      setDrag(null);
      return;
    }
    setDrag(null);
  }

  // An old error goes away as soon as the note is changed.
  useEffect(() => setError(""), [message, name, topic]);

  // When the board holds more notes than fit, a hint at its bottom edge says there are more below.
  const checkMore = () => {
    const b = board.current;
    setMore(Boolean(b && b.scrollHeight - b.clientHeight - b.scrollTop > 8));
  };
  useEffect(() => {
    checkMore();
    window.addEventListener("resize", checkMore);
    return () => window.removeEventListener("resize", checkMore);
  }, [notes, mine]);

  // The visitor's own note is drawn from this browser's copy, so their latest changes show straight away.
  const others = notes.filter((n) => n.id !== mineNote?.id);

  return (
    <section className="fw-band" id="feedback" aria-labelledby="fw-title">
      <div className="wrap section">
        <div className="section-head">
          <h2 className="display h-section" id="fw-title">
            The feedback wall
          </h2>
          <p>Pick a sticky note, tell us what you think, and stick it on the wall. One note per visitor.</p>
        </div>

        <div className="fw">
          <div className="fw-frame">
            <div className={`fw-board${overBoard ? " is-target" : ""}`} ref={board} onScroll={checkMore} role="region" aria-label="Notes from visitors" tabIndex={-1}>
              <ul className="fw-notes">
                {mineNote ? <StuckNote note={mineNote} mine hidden={flying} /> : null}
                {others.map((n) => (
                  <StuckNote key={n.id} note={n} />
                ))}
              </ul>
              {loaded && !others.length && !mineNote ? <p className="fw-empty">The wall is empty. Be the first to stick a note here!</p> : null}
            </div>
            {more ? (
              <button type="button" className="fw-more" onClick={() => board.current?.scrollBy({ top: board.current.clientHeight * 0.8, behavior: "smooth" })}>
                <span>Scroll for more notes ↓</span>
              </button>
            ) : null}
          </div>

          <div className="fw-pad">
            {posted && !editing ? (
              <div className="fw-thanks" role="status">
                <strong>Thank you!</strong>
                <p>{mineNote ? "Your note is on the wall. You can change it whenever you like." : "This browser has already added a note. Thank you for your feedback!"}</p>
                {mineNote ? (
                  <button type="button" className="btn btn-outline fw-edit" onClick={startEdit}>
                    Edit your note
                  </button>
                ) : null}
              </div>
            ) : (
              <form
                className="fw-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  stick(null);
                }}
                noValidate
              >
                <div className="fw-colors" role="radiogroup" aria-label="Pick a sticky note">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={color === c}
                      aria-label={`Note colour ${NOTE_COLORS.indexOf(c) + 1}`}
                      className="fw-stack"
                      style={{ "--note": c } as CSSProperties}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>

                <div
                  ref={draft}
                  className={`fw-draft${drag ? " is-dragging" : ""}`}
                  style={{ "--note": color, fontFamily: fontCss(font), transform: drag ? `translate(${drag.x}px, ${drag.y}px) rotate(-3deg)` : undefined } as CSSProperties}
                >
                  <span
                    className="fw-tape"
                    onPointerDown={onGrab}
                    onPointerMove={onDrag}
                    onPointerUp={onDrop}
                    onPointerCancel={() => {
                      dragStart.current = null;
                      setDrag(null);
                      setOverBoard(false);
                    }}
                    title="Drag the note onto the wall"
                    aria-hidden="true"
                  >
                    drag me
                  </span>
                  <label className="fw-topic-pick">
                    <span className="sr-only">Topic</span>
                    <select value={topic} onChange={(e) => setTopic(e.target.value as Topic)}>
                      {TOPICS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <label className="fw-write">
                    <span className="sr-only">Your feedback</span>
                    <textarea
                      value={message}
                      maxLength={LIMITS.message}
                      rows={5}
                      placeholder="What do you like? What should we fix?"
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </label>
                  <label className="fw-sign">
                    <span aria-hidden="true">—</span>
                    <span className="sr-only">Your name (required)</span>
                    <input value={name} maxLength={LIMITS.name} required placeholder="Your name" autoComplete="given-name" onChange={(e) => setName(e.target.value)} />
                  </label>
                  <span className="fw-count" aria-hidden="true">
                    {message.length}/{LIMITS.message}
                  </span>
                </div>

                <div className="fw-fonts" role="radiogroup" aria-label="Handwriting">
                  {NOTE_FONTS.map((f) => (
                    <button key={f.id} type="button" role="radio" aria-checked={font === f.id} style={{ fontFamily: f.css }} onClick={() => setFont(f.id)}>
                      {f.name}
                    </button>
                  ))}
                </div>

                {/* Left empty by people; bots that fill every field give themselves away. */}
                <input className="fw-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} name="website" />

                {error ? (
                  <p className="fw-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="fw-actions">
                  <button type="submit" className="btn btn-primary" disabled={busy}>
                    {editing ? (busy ? "Saving…" : "Save changes") : busy ? "Sticking…" : "Stick it on the wall"}
                  </button>
                  {editing ? (
                    <button type="button" className="btn btn-outline" disabled={busy} onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  ) : (
                    <span className="fw-hint">or drag the note by its tape onto the wall</span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
