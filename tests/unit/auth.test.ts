import { describe, expect, it } from "vitest";
import { SIGNED_IN_ONLY, safeNext } from "@/lib/supabase/config";

describe("sign-in", () => {
  it("returns only to pages on this site after signing in", () => {
    expect(safeNext("/editor")).toBe("/editor");
    expect(safeNext("/templates/aurora?x=1")).toBe("/templates/aurora?x=1");
    expect(safeNext(null)).toBe("/editor");
    expect(safeNext("https://evil.example")).toBe("/editor");
    expect(safeNext("//evil.example")).toBe("/editor");
    expect(safeNext("/\\evil.example")).toBe("/editor");
  });

  it("asks for sign-in on the building pages only", () => {
    expect(SIGNED_IN_ONLY).toEqual(["/start", "/editor", "/saved", "/profile"]);
  });
});
