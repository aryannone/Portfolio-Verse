// Reads a résumé PDF and turns it into portfolio details, in the browser.
//
// pdf.js pulls out the text with its position and size. The text is then read the way a person would:
// the biggest line near the top is the name, lines like "Education" or "Projects" start sections,
// bullet points belong to the entry above them, and dates are recognised wherever they sit.
// It is pattern-based, so plain single-column résumés come through best; the user checks the result.

import { newItem, skillsSection, uid, type Item, type Link, type Section } from "@/lib/portfolio";

type Line = { text: string; parts: string[]; size: number; x: number; end: number; y: number; page: number; links: string[] };

export type ParsedResume = {
  name: string;
  role: string;
  city: string;
  email: string;
  phone: string;
  about: string;
  bio: string;
  links: Link[];
  skills: string[];
  sections: Section[];
};

type PdfTextItem = { str: string; transform: number[]; width: number; height: number };
type PdfAnnotation = { subtype: string; url?: string; rect: number[] };
type PdfPage = {
  getTextContent: () => Promise<{ items: (PdfTextItem | { type: string })[] }>;
  getAnnotations: () => Promise<PdfAnnotation[]>;
};
type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: { data: Uint8Array }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<PdfPage> }> };
};

// The engine is served by this site (see scripts/copy-vendor.mjs) and loaded only when a résumé is imported.
async function loadPdfJs(): Promise<PdfJs> {
  const pdfjs = (await import(/* webpackIgnore: true */ "/vendor/pdfjs/pdf.min.mjs" as string)) as PdfJs;
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
  return pdfjs;
}

// ---------- reading the PDF into lines ----------

async function readLines(file: ArrayBuffer): Promise<Line[]> {
  const pdfjs = await loadPdfJs();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(file) }).promise;
  const lines: Line[] = [];

  for (let n = 1; n <= Math.min(doc.numPages, 6); n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    const items = (content.items as PdfTextItem[]).filter((it) => typeof it.str === "string" && it.str.trim() && Array.isArray(it.transform));
    const annotations = (await page.getAnnotations()).filter((a) => a.subtype === "Link" && a.url);

    // Group text pieces that sit on the same baseline.
    const rows: PdfTextItem[][] = [];
    for (const item of items.sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4])) {
      const row = rows.find((r) => Math.abs(r[0].transform[5] - item.transform[5]) < Math.max(2, Math.abs(item.transform[3]) * 0.35));
      if (row) row.push(item);
      else rows.push([item]);
    }

    for (const row of rows) {
      row.sort((a, b) => a.transform[4] - b.transform[4]);
      const size = Math.max(...row.map((it) => Math.abs(it.transform[3]) || it.height || 10));
      // A wide gap splits the row into parts, so "Title ........ 2023 - 2025" keeps its date separate.
      const parts: string[] = [];
      let part = "";
      let end = -Infinity;
      for (const it of row) {
        const x = it.transform[4];
        const gap = x - end;
        if (part && gap > size * 2.2) {
          parts.push(part.trim());
          part = "";
        } else if (part && gap > size * 0.15 && !part.endsWith(" ") && !it.str.startsWith(" ")) {
          part += " ";
        }
        part += it.str;
        end = x + it.width;
      }
      if (part.trim()) parts.push(part.trim());
      const y = row[0].transform[5];
      const x0 = row[0].transform[4];
      const x1 = end;
      const links = annotations
        .filter((a) => y >= a.rect[1] - 3 && y <= a.rect[3] + 3 && a.rect[2] >= x0 - 2 && a.rect[0] <= x1 + 2)
        .map((a) => a.url as string);
      lines.push({ text: parts.join("  "), parts, size, x: x0, end: x1, y, page: n, links });
    }
  }
  return lines;
}

// ---------- recognising things ----------

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE = /(?:\+?\d[\d\s().-]{8,}\d)/;
const URL_TEXT = /\b(?:https?:\/\/[^\s|,;]+|(?:www\.)?(?:linkedin\.com|github\.com|gitlab\.com|behance\.net|dribbble\.com|kaggle\.com|leetcode\.com|medium\.com|instagram\.com|x\.com|twitter\.com|youtube\.com|codeforces\.com|codechef\.com|hackerrank\.com)\/[^\s|,;]+)/gi;
const BULLET = /^\s*(?:[•●▪◦‣∙·■□➢►▸✓✔❖◆◇⁃]\s*|[-–—*o>]\s+)/;

const MONTH = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";
const DATE_POINT = `(?:${MONTH}\\s*,?\\s*'?\\d{2,4}|\\d{1,2}\\s*[/.]\\s*(?:19|20)\\d{2}|(?:19|20)\\d{2})`;
const DATE_RANGE = new RegExp(
  `\\(?\\s*${DATE_POINT}(?:\\s*(?:-|\\u2013|\\u2014|to|till|until)\\s*(?:${DATE_POINT}|present|current|now|ongoing|date|till date))?\\s*\\)?`,
  "i",
);

const HEADINGS: [kind: Kind, words: string[]][] = [
  ["summary", ["summary", "profile", "professional summary", "profile summary", "about", "about me", "objective", "career objective", "personal statement", "overview"]],
  ["education", ["education", "academics", "academic", "academic details", "academic qualifications", "academic background", "qualifications", "educational qualifications", "education details", "scholastic achievements"]],
  ["experience", ["experience", "work experience", "professional experience", "employment", "employment history", "work history", "internships", "internship", "internship experience", "industrial experience", "relevant experience"]],
  ["projects", ["projects", "academic projects", "personal projects", "key projects", "project experience", "major projects", "selected projects", "project work", "projects undertaken"]],
  ["skills", ["skills", "technical skills", "key skills", "core skills", "skill set", "skillset", "technologies", "technical proficiency", "skills and tools", "tools and technologies", "core competencies", "competencies", "it skills", "software skills"]],
  ["other", ["certifications", "certificates", "certification", "courses", "online courses", "achievements", "awards", "honors", "honours", "awards and achievements", "achievements and awards", "accomplishments", "publications", "research", "positions of responsibility", "position of responsibility", "leadership", "extracurricular activities", "extra curricular activities", "extracurriculars", "co curricular activities", "volunteering", "volunteer experience", "activities", "hobbies", "interests", "hobbies and interests", "languages", "languages known", "coursework", "relevant coursework", "trainings", "training", "workshops", "conferences", "references"]],
];

type Kind = "summary" | "education" | "experience" | "projects" | "skills" | "other";

const plain = (text: string) => text.toLowerCase().replace(/&/g, " and ").replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim();

function headingKind(line: Line): Kind | null {
  if (line.text.length > 42 || line.parts.length > 1) return null;
  const words = plain(line.text);
  if (!words) return null;
  for (const [kind, list] of HEADINGS) if (list.includes(words)) return kind;
  return null;
}

const titleCase = (text: string) =>
  text === text.toUpperCase() && /[A-Z]/.test(text) ? text.toLowerCase().replace(/(^|[\s(/-])([a-z])/g, (_, a, b) => a + b.toUpperCase()) : text;

function linkLabel(url: string) {
  const known: [string, string][] = [
    ["linkedin", "LinkedIn"], ["github", "GitHub"], ["gitlab", "GitLab"], ["behance", "Behance"], ["dribbble", "Dribbble"],
    ["kaggle", "Kaggle"], ["leetcode", "LeetCode"], ["medium", "Medium"], ["instagram", "Instagram"], ["twitter", "X"],
    ["x.com", "X"], ["youtube", "YouTube"], ["codeforces", "Codeforces"], ["codechef", "CodeChef"], ["hackerrank", "HackerRank"],
  ];
  const lower = url.toLowerCase();
  for (const [key, label] of known) if (lower.includes(key)) return label;
  return "Website";
}

function cleanUrl(url: string) {
  return url.replace(/[).,;]+$/, "");
}

function urlsIn(line: Line) {
  const found = [...(line.text.match(URL_TEXT) ?? []), ...line.links].map(cleanUrl);
  return found.filter((u) => !/^mailto:|^tel:/i.test(u));
}

// Pulls a date range out of a line: "B.Tech, CSE  2023 - 2027" gives ["B.Tech, CSE", "2023 - 2027"].
function splitDate(text: string, parts: string[]): [string, string] {
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    const m = last.match(DATE_RANGE);
    if (m && m[0].replace(/[()\s]/g, "").length >= last.replace(/[()\s]/g, "").length * 0.6) {
      return [parts.slice(0, -1).join(" | "), m[0].replace(/[()]/g, "").trim()];
    }
  }
  const m = text.match(DATE_RANGE);
  if (!m) return [text, ""];
  const rest = (text.slice(0, m.index) + " " + text.slice((m.index ?? 0) + m[0].length)).replace(/\s*[|,–—-]\s*$/, "").replace(/^\s*[|,–—-]\s*/, "").replace(/\s{2,}/g, " ").trim();
  // A year inside a sentence ("Won the 2024 hackathon") is not this entry's date.
  if (rest.split(" ").length > 12) return [text, ""];
  return [rest || text, m[0].replace(/[()]/g, "").trim()];
}

const isInstitution = (text: string) => /universit|college|institute|school|academy|vidyalaya|iit\b|nit\b|iiit|bits\b|campus/i.test(text);

// ---------- building entries ----------

type Draft = {
  head: { text: string; parts: string[] }[];
  points: string[];
  links: string[];
  lastBulletX: number;
  lastWasBullet: boolean;
  // Whether the last bullet had a visible bullet character (some PDFs draw bullets as shapes instead).
  lastGlyph: boolean;
  // Where the last line ended, to tell a wrapped line from a new one.
  lastEnd: number;
  lastText: string;
};

function draftsFrom(lines: Line[], kind: Kind): Draft[] {
  const drafts: Draft[] = [];
  // The entry being built is the last one in the list.
  const start = (): Draft => {
    const d: Draft = { head: [], points: [], links: [], lastBulletX: -1, lastWasBullet: false, lastGlyph: false, lastEnd: 0, lastText: "" };
    drafts.push(d);
    return d;
  };

  // The left edge of the section, and how far its lines reach. A line set in from the edge is a bullet
  // point even when its bullet is drawn as a shape rather than written as a character.
  const left = Math.min(...lines.map((l) => l.x));
  const right = Math.max(...lines.map((l) => l.end));

  for (const line of lines) {
    const glyph = BULLET.test(line.text);
    const indented = line.x > left + 6;
    const bullet = glyph || indented;
    const text = line.text.replace(BULLET, "").trim();
    if (!text) continue;
    const c: Draft | null = drafts.length ? drafts[drafts.length - 1] : null;

    // The second line of a wrapped bullet: it starts in lower case, or the line before ran to the
    // right edge without finishing its sentence, or it sits under the bullet's text.
    if (!glyph && c && c.lastWasBullet && c.points.length && line.x >= c.lastBulletX - 2) {
      const ranToEdge = c.lastEnd >= right - line.size * 4 && !/[.!?:;]$/.test(c.lastText);
      const underText = c.lastGlyph && line.x > c.lastBulletX + 3;
      if (/^[a-z(]/.test(text) || ranToEdge || underText) {
        c.points[c.points.length - 1] += " " + text;
        c.links.push(...urlsIn(line));
        c.lastEnd = line.end;
        c.lastText = text;
        continue;
      }
    }

    if (kind === "other") {
      // Each line of a list like Certifications or Achievements is its own entry.
      if (!bullet && c && !c.lastWasBullet && /^[a-z(]/.test(text)) {
        c.head[c.head.length - 1].text += " " + text;
        continue;
      }
      const d = start();
      d.head.push({ text, parts: glyph ? [text] : line.parts });
      d.links.push(...urlsIn(line));
      d.lastWasBullet = bullet;
      d.lastGlyph = glyph;
      d.lastBulletX = line.x;
      d.lastEnd = line.end;
      d.lastText = text;
      continue;
    }

    if (bullet) {
      const d = c ?? start();
      if (!d.head.length) d.head.push({ text, parts: [text] });
      else d.points.push(text);
      d.links.push(...urlsIn(line));
      d.lastWasBullet = true;
      d.lastGlyph = glyph;
      d.lastBulletX = line.x;
      d.lastEnd = line.end;
      d.lastText = text;
      continue;
    }

    // A long plain line, or a full sentence, under an entry is its description, not a new entry.
    const sentence = !isInstitution(text) && (text.length > 75 || (text.split(/\s+/).length >= 10 && !DATE_RANGE.test(text)) || /[.!]$/.test(text));
    if (c && c.head.length && sentence) {
      c.points.push(text);
      c.links.push(...urlsIn(line));
      c.lastWasBullet = false;
      continue;
    }

    const hasDate = DATE_RANGE.test(line.text);
    const headHasDate = c ? c.head.some((h) => DATE_RANGE.test(h.text)) : false;
    const newEntry = !c || c.points.length > 0 || c.head.length >= 3 || (hasDate && headHasDate);
    const d = newEntry ? start() : (c as Draft);
    d.head.push({ text, parts: line.parts });
    d.links.push(...urlsIn(line));
    d.lastWasBullet = false;
    d.lastEnd = line.end;
    d.lastText = text;
  }
  return drafts;
}

function itemFrom(draft: Draft, kind: Kind): Item {
  const item = newItem();
  let meta = "";
  const heads: string[] = [];
  for (const h of draft.head) {
    // "Campus Bus Tracker ........ GitHub": a link word on the right is a link, not part of the title.
    let parts = h.parts;
    if (parts.length > 1 && /^(github|gitlab|link|links|live|live demo|demo|code|source|repo|website|view|project link|certificate|credential|url)$/i.test(parts[parts.length - 1].trim())) {
      parts = parts.slice(0, -1);
    }
    const [rest, date] = splitDate(parts === h.parts ? h.text : parts.join("  "), parts);
    if (date && !meta) meta = date;
    const cleaned = rest.replace(URL_TEXT, "").replace(/\s*\|\s*$/, "").trim();
    if (cleaned) heads.push(cleaned);
  }

  let points = draft.points.slice();
  // "Tech: React, Node" lines become tags.
  const tags: string[] = [];
  points = points.filter((p) => {
    const m = p.match(/^(?:tech(?:nologies)?(?:\s+used)?|tech\s*stack|stack|tools(?:\s+used)?|skills(?:\s+used)?|built with)\s*[:\-–]\s*(.+)$/i);
    if (!m) return true;
    tags.push(...m[1].split(/[,|;•·]/).map((t) => t.trim()).filter((t) => t && t.length <= 30));
    return false;
  });

  let title = heads[0] ?? "";
  let sub = heads[1] ?? "";
  // "Software Intern | Google" or "Intern at Google" on one line.
  if (!sub) {
    const split = title.split(/\s+(?:\||–|—|@|at)\s+/);
    if (split.length >= 2 && split[0].length >= 2) {
      title = split[0];
      sub = split.slice(1).join(", ");
    }
  }
  // "Product Designer, Freshworks, Chennai" for a job.
  if (!sub && kind === "experience" && title.includes(", ")) {
    const at = title.indexOf(", ");
    sub = title.slice(at + 2);
    title = title.slice(0, at);
  }
  // Education often puts the college first and the degree second.
  if (kind === "education" && sub && isInstitution(title) && !isInstitution(sub)) [title, sub] = [sub, title];
  points = [...heads.slice(2), ...points];

  item.title = title.replace(/\s*[|,]\s*$/, "");
  item.sub = sub.replace(/^\s*[|,]\s*/, "");
  item.meta = meta;
  if (points.length === 1) item.text = points[0];
  else if (points.length > 1) {
    item.text = points[0];
    item.details = points.map((p) => "• " + p).join("\n");
  }
  item.tags = [...new Set(tags)].slice(0, 8);
  item.links = [...new Set(draft.links)].slice(0, 4).map((url) => ({ id: uid(), label: linkLabel(url) === "Website" ? "Link" : linkLabel(url), url }));
  return item;
}

// ---------- the whole résumé ----------

export async function readResume(file: File): Promise<ParsedResume> {
  const lines = await readLines(await file.arrayBuffer());
  if (lines.length < 3) throw new Error("No text found");

  const firstHeading = lines.findIndex((l) => headingKind(l));
  const header = lines.slice(0, firstHeading < 0 ? Math.min(6, lines.length) : firstHeading);
  const all = lines.map((l) => l.text).join("\n");

  const email = (all.match(EMAIL) ?? [""])[0];
  const phoneMatch = all.split("\n").map((l) => l.replace(EMAIL, " ").match(PHONE)).find((m) => m && m[0].replace(/\D/g, "").length >= 10);
  const phone = phoneMatch ? phoneMatch[0].trim() : "";

  // Links: from the header, plus any profile links found anywhere.
  const profileUrls = new Set<string>();
  header.forEach((l) => urlsIn(l).forEach((u) => profileUrls.add(u)));
  lines.forEach((l) => urlsIn(l).forEach((u) => /linkedin|github\.com\/[^/]+\/?$|behance|dribbble|kaggle|leetcode|medium|instagram/i.test(u) && profileUrls.add(u)));
  const seen = new Set<string>();
  const links: Link[] = [];
  for (const raw of profileUrls) {
    const key = raw.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ id: uid(), label: linkLabel(raw), url: raw });
  }

  // The name: the largest line near the top that is not contact details.
  const contactish = (t: string) => EMAIL.test(t) || /\d{5,}/.test(t.replace(/\D/g, "")) || URL_TEXT.test(t) || t.includes("|");
  URL_TEXT.lastIndex = 0;
  const candidates = header.filter((l) => !contactish(l.text) && /[a-z]/i.test(l.text) && l.text.length <= 40);
  const nameLine = candidates.sort((a, b) => b.size - a.size)[0] ?? header[0];
  const name = titleCase((nameLine?.parts[0] ?? "").replace(/[|,].*$/, "").trim());

  // The role: a short line just under the name that is not contact details.
  const nameAt = nameLine ? header.indexOf(nameLine) : -1;
  const roleLine = header.slice(nameAt + 1).find((l) => !contactish(l.text) && l.text.length <= 60 && !EMAIL.test(l.text));
  URL_TEXT.lastIndex = 0;
  const role = roleLine ? titleCase(roleLine.text.split(/\s*[|•·]\s*/)[0]) : "";

  // The city: a short piece of a contact line that is not an email, phone or link.
  let city = "";
  for (const l of header) {
    for (const piece of l.text.split(/\s*[|•·◦]\s*|\s{3,}/)) {
      const p = piece.trim();
      URL_TEXT.lastIndex = 0;
      if (p && p !== name && p !== role && !EMAIL.test(p) && !PHONE.test(p) && !URL_TEXT.test(p) && /^[A-Za-z][A-Za-z .,-]{2,30}$/.test(p) && l !== nameLine && l !== roleLine && !/linkedin|github|portfolio|website/i.test(p)) {
        city = p;
        break;
      }
    }
    if (city) break;
  }

  // Cut the rest into sections at each heading.
  const blocks: { kind: Kind; title: string; lines: Line[] }[] = [];
  for (const line of lines.slice(Math.max(0, firstHeading))) {
    const kind = headingKind(line);
    if (kind) blocks.push({ kind, title: titleCase(line.text.replace(/:$/, "").trim()), lines: [] });
    else if (blocks.length) blocks[blocks.length - 1].lines.push(line);
  }

  let about = "";
  const skills: string[] = [];
  const sections: Section[] = [];

  for (const block of blocks) {
    if (!block.lines.length) continue;
    if (block.kind === "summary") {
      about = block.lines.map((l) => l.text.replace(BULLET, "").trim()).join(" ").replace(/\s+/g, " ").trim();
      continue;
    }
    if (block.kind === "skills") {
      for (const l of block.lines) {
        const text = l.text.replace(BULLET, "");
        const body = text.includes(":") ? text.slice(text.indexOf(":") + 1) : text;
        for (const s of body.split(/[,|;•·]|\s{3,}/)) {
          const skill = s.replace(/^\s*(and|&)\s+/i, "").trim().replace(/\.$/, "");
          if (skill && skill.length <= 40 && !skills.some((k) => k.toLowerCase() === skill.toLowerCase())) skills.push(skill);
        }
      }
      continue;
    }
    const items = draftsFrom(block.lines, block.kind)
      .map((d) => itemFrom(d, block.kind))
      .filter((it) => it.title);
    if (!items.length) continue;
    sections.push({
      id: uid(),
      title: block.title,
      layout: block.kind === "projects" ? "cards" : "list",
      style: "",
      hidden: false,
      items,
    });
  }

  const skillsAt = blocks.findIndex((b) => b.kind === "skills");
  const withSkills = sections.slice();
  // Keep Skills roughly where the résumé had it.
  const before = blocks.slice(0, Math.max(0, skillsAt)).filter((b) => b.kind !== "summary" && b.kind !== "skills").length;
  withSkills.splice(skillsAt < 0 ? withSkills.length : Math.min(before, withSkills.length), 0, skillsSection());

  const firstSentence = about.match(/^.{20,160}?[.!](\s|$)/);
  return {
    name,
    role,
    city,
    email,
    phone,
    about,
    bio: firstSentence ? firstSentence[0].trim() : about.length <= 140 ? about : "",
    links,
    skills: skills.slice(0, 40),
    sections: withSkills,
  };
}

// A one-line summary of what was found, for the message shown after importing.
export function describe(r: ParsedResume) {
  const found: string[] = [];
  if (r.name) found.push("your name");
  if (r.email || r.phone) found.push("contact details");
  if (r.links.length) found.push(`${r.links.length} link${r.links.length === 1 ? "" : "s"}`);
  if (r.about) found.push("a summary");
  if (r.skills.length) found.push(`${r.skills.length} skills`);
  for (const s of r.sections) if (s.items.length) found.push(`${s.title} (${s.items.length})`);
  return found.length ? found.join(", ") : "very little";
}

// The changes that put a read résumé into a portfolio. The photo and the whole look stay as they are.
// Sections are replaced only when the résumé had some; links are added to the ones already there.
export function applyResume(p: { links: Link[]; sections: Section[]; skills: string[] } & Record<string, unknown>, r: ParsedResume) {
  const links = [...p.links];
  for (const link of r.links) {
    const key = link.url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "").toLowerCase();
    if (!links.some((l) => l.url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "").toLowerCase() === key)) links.push(link);
  }
  const hasSections = r.sections.some((s) => s.layout !== "skills");
  return {
    ...(r.name ? { name: r.name } : {}),
    ...(r.role ? { role: r.role } : {}),
    ...(r.city ? { city: r.city } : {}),
    ...(r.email ? { email: r.email } : {}),
    ...(r.phone ? { phone: r.phone } : {}),
    ...(r.about ? { about: r.about } : {}),
    ...(r.bio ? { bio: r.bio } : {}),
    links: links.filter((l) => l.label.trim() || l.url.trim()),
    ...(r.skills.length ? { skills: r.skills } : {}),
    ...(hasSections ? { sections: r.sections } : {}),
  };
}
