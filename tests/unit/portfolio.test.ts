import { describe, expect, it } from "vitest";
import {
  blankPortfolio,
  detailsKey,
  fromSample,
  initialsOf,
  inTemplate,
  linkBadge,
  normalize,
  onColor,
  slugOf,
  toHref,
  type Portfolio,
} from "@/lib/portfolio";
import { RETIRED, TEMPLATES, getTemplate } from "@/lib/templates";

describe("toHref: turns what someone typed into a link a browser can open", () => {
  it("keeps full links as they are", () => {
    expect(toHref("https://github.com/priya")).toBe("https://github.com/priya");
    expect(toHref("mailto:priya@example.com")).toBe("mailto:priya@example.com");
  });
  it("adds https:// to a bare address", () => {
    expect(toHref("  linkedin.com/in/priya ")).toBe("https://linkedin.com/in/priya");
  });
  it("turns an email address into a mailto link", () => {
    expect(toHref("priya@example.com")).toBe("mailto:priya@example.com");
  });
  it("turns a phone number into a tel link with only digits and +", () => {
    expect(toHref("+91 98765 43210")).toBe("tel:+919876543210");
  });
  it("leaves empty and placeholder links alone", () => {
    expect(toHref("")).toBe("");
    expect(toHref("#")).toBe("#");
  });
});

describe("small text helpers", () => {
  it("initialsOf takes the first and last name", () => {
    expect(initialsOf("Aryan Kumar Singh")).toBe("AS");
    expect(initialsOf("priya")).toBe("P");
    expect(initialsOf("   ")).toBe("");
  });
  it("slugOf makes a safe file name", () => {
    expect(slugOf("Priya Nair")).toBe("priya-nair");
    expect(slugOf("  Dr. A. K. Rao!! ")).toBe("dr-a-k-rao");
    expect(slugOf("")).toBe("portfolio");
  });
  it("onColor picks readable text for a background", () => {
    expect(onColor("#ffd43b")).toBe("#12141a");
    expect(onColor("#12141a")).toBe("#ffffff");
    expect(onColor("not a colour")).toBe("#ffffff");
  });
  it("linkBadge recognises common sites", () => {
    expect(linkBadge("LinkedIn", "linkedin.com/in/x")).toBe("in");
    expect(linkBadge("Code", "https://github.com/x")).toBe("GH");
    expect(linkBadge("Blog", "https://myblog.dev")).toBe("Bl");
  });
});

describe("samples and templates", () => {
  it("every template has a complete sample person", () => {
    for (const t of TEMPLATES) {
      const p = fromSample(t.id);
      expect(p.template).toBe(t.id);
      expect(p.sections.length).toBeGreaterThan(0);
      expect(p.sections.some((s) => s.layout === "skills")).toBe(true);
    }
  });
  it("a blank portfolio has no details", () => {
    const p = blankPortfolio("professional-1");
    expect(p.name).toBe("");
    expect(p.sections.every((s) => s.items.length === 0)).toBe(true);
  });
  it("retired templates point at templates that still exist", () => {
    for (const to of Object.values(RETIRED)) expect(getTemplate(to)?.id).toBe(to);
  });
});

describe("details are independent of the design", () => {
  it("moving details to another template keeps them, and resets the look", () => {
    const p: Portfolio = { ...fromSample("creative-4"), name: "Priya Nair", theme: "dark" };
    const moved = inTemplate(p, "professional-1");
    expect(moved.template).toBe("professional-1");
    expect(moved.name).toBe("Priya Nair");
    expect(moved.theme).toBe("");
    expect(detailsKey(moved)).toBe(detailsKey(p));
  });
  it("changing a detail changes the details fingerprint", () => {
    const p = fromSample("professional-1");
    expect(detailsKey({ ...p, role: "Something else" })).not.toBe(detailsKey(p));
  });
});

describe("normalize: portfolios saved by older versions still open", () => {
  // An old save: no newer fields, no skills section.
  const old = (extra: Partial<Portfolio>): Portfolio => {
    const p = fromSample("professional-1") as Partial<Portfolio> & Record<string, unknown>;
    delete p.contactVisual;
    delete p.contactHello;
    return { ...p, sections: (p.sections ?? []).filter((s) => s.layout !== "skills"), ...extra } as Portfolio;
  };

  it("moves a retired template to the one that replaced it", () => {
    for (const [from, to] of Object.entries(RETIRED)) expect(normalize(old({ template: from })).template).toBe(to);
  });
  it("adds the skills section that older saves did not have, exactly once", () => {
    const n = normalize(old({}));
    expect(n.sections.filter((s) => s.layout === "skills")).toHaveLength(1);
    expect(normalize(n).sections.filter((s) => s.layout === "skills")).toHaveLength(1);
  });
  it("fills in fields added later", () => {
    const n = normalize(old({}));
    expect(n.contactHello).toBeTruthy();
  });
  it("keeps what was beside the contact form before the character existed", () => {
    expect(normalize(old({ photo: "data:image/png;base64,AAA", portrait: "plain" })).contactVisual).toBe("photo");
    expect(normalize(old({ photo: "", portrait: "none" as Portfolio["portrait"] })).contactVisual).toBe("none");
    expect(normalize(old({ photo: "" })).contactVisual).toBe("character");
  });
  it("never offers visitors a résumé made by the site", () => {
    expect(normalize(old({ resume: "generated" as Portfolio["resume"] })).resume).toBe("original");
  });
});
