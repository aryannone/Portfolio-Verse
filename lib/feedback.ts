// The feedback wall: what a note is, and the checks a note must pass.
// Shared by the wall on the home page and the API that stores notes (app/api/feedback).

export const TOPICS = ["Overall", "Templates", "Editor", "Résumé import", "Something else"] as const;
export type Topic = (typeof TOPICS)[number];

export const NOTE_COLORS = ["#ffe66d", "#ffb3c7", "#a5f3c4", "#a8d8ff", "#ffcf99"] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

// Handwriting styles. The CSS variables come from next/font in app/layout.tsx.
export const NOTE_FONTS = [
  { id: "caveat", name: "Marker", css: "var(--font-note-caveat), cursive" },
  { id: "kalam", name: "Pen", css: "var(--font-note-kalam), cursive" },
  { id: "patrick", name: "Neat", css: "var(--font-note-patrick), cursive" },
  { id: "indie", name: "Doodle", css: "var(--font-note-indie), cursive" },
] as const;
export type NoteFont = (typeof NOTE_FONTS)[number]["id"];

export const LIMITS = { name: 30, message: 220, minMessage: 8 };

export type Note = {
  id: string;
  name: string;
  topic: Topic;
  message: string;
  color: NoteColor;
  font: NoteFont;
  created_at: string;
};

export type NoteInput = Omit<Note, "id" | "created_at">;

// A few words that never belong on a public wall. Approval is the real filter; this catches the obvious.
const BLOCKED = /\b(fuck|shit|bitch|cunt|asshole|bastard|madarchod|bhenchod|chutiya|gandu|randi)\w*/i;
const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|in|io|xyz|ru|top|info)\b)/i;

// Checks a note before it is posted (in the browser) and again before it is stored (on the server).
// Returns the cleaned note, or the first problem in words a visitor understands.
export function checkNote(raw: Partial<Record<keyof NoteInput, unknown>>): { note: NoteInput } | { error: string } {
  const text = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
  const name = text(raw.name);
  const message = text(raw.message);
  const topic = TOPICS.find((t) => t === raw.topic);
  const color = NOTE_COLORS.find((c) => c === raw.color);
  const font = NOTE_FONTS.find((f) => f.id === raw.font)?.id;

  if (!name) return { error: "Please add your name at the bottom of the note." };
  if (name.length > LIMITS.name) return { error: `Please keep your name under ${LIMITS.name} letters.` };
  if (message.length < LIMITS.minMessage) return { error: "Please write a little more on your note." };
  if (message.length > LIMITS.message) return { error: `Please keep the note under ${LIMITS.message} letters.` };
  if (!topic || !color || !font) return { error: "Please pick a topic for your note." };
  if (LINK.test(message) || LINK.test(name)) return { error: "Links are not allowed on the wall." };
  if (BLOCKED.test(message) || BLOCKED.test(name)) return { error: "Please keep the wall friendly." };
  return { note: { name, message, topic, color, font } };
}

// The same small tilt for a note every time it is drawn, taken from its id.
export function tiltOf(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 9) - 4) * 0.9;
}
