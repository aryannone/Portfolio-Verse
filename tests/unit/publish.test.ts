import { describe, expect, it } from "vitest";
import { SITE_CSP, USERNAME, siteFile, sitePath } from "@/lib/publish";

describe("publishing", () => {
  it("runs published pages in a sandbox that never shares this site's origin", () => {
    expect(SITE_CSP.startsWith("sandbox ")).toBe(true);
    expect(SITE_CSP).toContain("allow-scripts");
    // With allow-same-origin a published page could read the sign-in session; it must never be added.
    expect(SITE_CSP).not.toContain("allow-same-origin");
  });

  it("keeps each person's site in their own folder, at /u/<username>", () => {
    expect(siteFile("abc")).toBe("abc/index.html");
    expect(sitePath("meera")).toBe("/u/meera");
  });

  it("accepts only safe usernames", () => {
    for (const ok of ["meera", "a1b", "aryan-singh"]) expect(USERNAME.test(ok)).toBe(true);
    for (const bad of ["ab", "-meera", "meera-", "Meera", "me/../x", "a".repeat(31)]) expect(USERNAME.test(bad)).toBe(false);
  });
});
