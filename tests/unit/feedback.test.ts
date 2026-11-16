import { describe, expect, it } from "vitest";
import { checkNote, tiltOf } from "@/lib/feedback";

const good = { name: "Aryan", topic: "Editor", message: "Undo would be great please", color: "#ffe66d", font: "caveat" };

describe("checkNote: what can go on the feedback wall", () => {
  it("accepts a normal note and tidies the spaces", () => {
    const r = checkNote({ ...good, message: "  Undo   would be   great please " });
    expect("note" in r && r.note.message).toBe("Undo would be great please");
  });
  it("needs a name", () => {
    expect(checkNote({ ...good, name: "  " })).toEqual({ error: "Please add your name at the bottom of the note." });
  });
  it("needs a real message, but not an essay", () => {
    expect("error" in checkNote({ ...good, message: "ok" })).toBe(true);
    expect("error" in checkNote({ ...good, message: "a".repeat(221) })).toBe(true);
  });
  it("only allows the listed topics, colours and fonts", () => {
    expect("error" in checkNote({ ...good, topic: "Hacking" })).toBe(true);
    expect("error" in checkNote({ ...good, color: "#000000" })).toBe(true);
    expect("error" in checkNote({ ...good, font: "comic-sans" })).toBe(true);
  });
  it("blocks links and rude words", () => {
    expect(checkNote({ ...good, message: "great site, visit www.spam.com" })).toEqual({ error: "Links are not allowed on the wall." });
    expect(checkNote({ ...good, message: "this is shit honestly" })).toEqual({ error: "Please keep the wall friendly." });
  });
  it("gives each note the same small tilt every time", () => {
    expect(tiltOf("abc")).toBe(tiltOf("abc"));
    expect(Math.abs(tiltOf("some-note-id"))).toBeLessThanOrEqual(4);
  });
});
