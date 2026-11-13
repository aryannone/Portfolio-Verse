import { SAMPLES } from "@/lib/samples";
import { TEMPLATES, getTemplate } from "@/lib/templates";

// One entry in a section: a project, a job, a degree, anything.
export type Item = {
  id: string;
  title: string;
  sub: string; // place, company or college
  meta: string; // dates
  text: string;
  tags: string[];
  details?: string; // the full write-up, shown when a visitor opens the entry
  links?: Link[]; // a project site, a repository, a certificate
  photos: string[]; // image data, shown in the details panel
  gallery?: GalleryId | ""; // this entry's own photo layout; empty means the portfolio's
};

export type Link = { id: string; label: string; url: string };

// Turns what someone typed into an address a browser can open.
export function toHref(url: string) {
  const u = url.trim();
  if (!u || u === "#") return u;
  if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
  if (/^[^\s/@]+@[^\s/@]+\.[^\s/@]+$/.test(u)) return `mailto:${u}`;
  if (/^\+?[\d\s()-]{7,}$/.test(u)) return `tel:${u.replace(/[^\d+]/g, "")}`;
  return `https://${u}`;
}

// One or two letters that stand for a link, shown large on its bubble.
export function linkBadge(label: string, url: string) {
  const text = `${label} ${url}`.toLowerCase();
  const known: [string, string][] = [
    ["linkedin", "in"], ["github", "GH"], ["instagram", "IG"], ["twitter", "X"], ["x.com", "X"], ["youtube", "YT"],
    ["behance", "Be"], ["dribbble", "Dr"], ["whatsapp", "WA"], ["wa.me", "WA"], ["facebook", "f"], ["medium", "M"],
    ["vimeo", "V"], ["kaggle", "K"], ["leetcode", "LC"], ["telegram", "TG"], ["mailto:", "@"], ["tel:", "Ph"],
  ];
  for (const [key, badge] of known) if (text.includes(key)) return badge;
  return label.trim().slice(0, 2) || "Go";
}

// The portrait on the contact card: the photo as it is, the photo with its background removed, or nothing.
export type PortraitId = "plain" | "cut" | "none";

export const PORTRAITS: { id: PortraitId; name: string }[] = [
  { id: "plain", name: "Original photo" },
  { id: "cut", name: "Background removed" },
  { id: "none", name: "No picture" },
];

export type ResumeId = "original" | "none";

// How a message typed into the contact form reaches the owner.
export type SendId = "mailto" | "direct";

export const SENDS: { id: SendId; name: string }[] = [
  { id: "mailto", name: "Through the visitor's own email app" },
  { id: "direct", name: "Straight to your inbox (FormSubmit service)" },
];

// How photos are arranged in the photo panel.
export type GalleryId = "stack" | "mosaic" | "slides";

export const GALLERIES: { id: GalleryId; name: string }[] = [
  { id: "stack", name: "Stack: big photos, one after another" },
  { id: "mosaic", name: "Mosaic: a grid that pops in" },
  { id: "slides", name: "Slideshow: one at a time" },
];

// A section's look. Empty means "whatever the template does".
export type SectionStyle = "" | "outline" | "filled" | "colour" | "sticker" | "glass" | "photo" | "rows" | "lines" | "boxes" | "timeline";

export type Section = {
  id: string;
  title: string;
  // "skills" is the one special section: it shows the skill chips and has no entries.
  layout: "cards" | "list" | "skills";
  style: SectionStyle;
  hidden: boolean;
  items: Item[];
  // The section's own look. Each is optional; without it the page's look applies.
  bg?: string;
  ink?: string;
  accent?: string;
  font?: FontId | "";
};

export const CARD_STYLES: { id: SectionStyle; name: string }[] = [
  { id: "", name: "Template's own" },
  { id: "outline", name: "Outlined cards" },
  { id: "filled", name: "Soft filled cards" },
  { id: "colour", name: "Colour cards" },
  { id: "sticker", name: "Sticker cards" },
  { id: "glass", name: "Glass cards" },
  { id: "photo", name: "Photo first" },
  { id: "rows", name: "Rows with a photo" },
];

export const LIST_STYLES: { id: SectionStyle; name: string }[] = [
  { id: "", name: "Template's own" },
  { id: "lines", name: "Simple lines" },
  { id: "timeline", name: "Timeline" },
  { id: "boxes", name: "Boxes" },
  { id: "glass", name: "Glass" },
];

export type ThemeId = "" | "light" | "paper" | "dark" | "accent";
export type HeroId = "" | "left" | "center" | "split";
export type MotionId = "rise" | "fade" | "slide" | "zoom" | "blur" | "flip" | "swing" | "drop" | "none";
export type FrameId = "" | "circle" | "rounded" | "square" | "arch" | "hexagon" | "blob" | "tilt" | "ring";

export const FRAMES: { id: FrameId; name: string }[] = [
  { id: "", name: "Template's own" },
  { id: "circle", name: "Circle" },
  { id: "ring", name: "Circle with a ring" },
  { id: "rounded", name: "Rounded square" },
  { id: "square", name: "Square" },
  { id: "arch", name: "Arch" },
  { id: "hexagon", name: "Hexagon" },
  { id: "blob", name: "Soft blob" },
  { id: "tilt", name: "Tilted with a shadow" },
];

export const THEMES: { id: ThemeId; name: string }[] = [
  { id: "", name: "Template's own" },
  { id: "light", name: "White" },
  { id: "paper", name: "Paper" },
  { id: "dark", name: "Dark" },
  { id: "accent", name: "Your colour" },
];

export const HEROES: { id: HeroId; name: string }[] = [
  { id: "", name: "Template's own" },
  { id: "left", name: "Left" },
  { id: "center", name: "Centred" },
  { id: "split", name: "Photo on the right" },
];

export const MOTIONS: { id: MotionId; name: string }[] = [
  { id: "rise", name: "Rise up" },
  { id: "fade", name: "Fade in" },
  { id: "slide", name: "Slide from the side" },
  { id: "zoom", name: "Zoom in" },
  { id: "blur", name: "Blur into focus" },
  { id: "flip", name: "Flip up" },
  { id: "swing", name: "Swing in from both sides" },
  { id: "drop", name: "Drop from above" },
  { id: "none", name: "No animation" },
];

export type FontId = "modern" | "serif" | "clean" | "tech" | "elegant";

export type Portfolio = {
  template: string;
  accent: string; // empty means the template's own colour
  font: FontId;
  theme: ThemeId;
  hero: HeroId;
  photoSize: "s" | "m" | "l";
  bigName: boolean;
  glow: boolean;
  motion: MotionId;
  gallery: GalleryId;
  frame: FrameId;
  bodyFont: FontId;
  progress: boolean;
  // A slim bar at the top with a link to each section, and a back-to-top button.
  nav: boolean;
  name: string;
  role: string;
  city: string;
  bio: string;
  about: string;
  photo: string;
  email: string;
  phone: string;
  links: Link[];
  quote: string;
  quoteBy: string;
  // What the Contact section says, and whether it has a message form.
  contactTitle: string;
  contactNote: string;
  contactStatus: string;
  contactForm: boolean;
  contactSend: SendId;
  portrait: PortraitId;
  // The photo with its background removed, made once in the editor.
  photoCut: string;
  // The "Download résumé" button visitors see. It only ever offers the user's own file
  // (uploaded, or kept from an import), never one made by the site. "none" hides it.
  resume: ResumeId;
  resumeFile: string;
  resumeName: string;
  resumePhoto: boolean;
  skills: string[];
  sections: Section[];
  sample: boolean;
};

export const FONTS: { id: FontId; name: string }[] = [
  { id: "modern", name: "Modern" },
  { id: "serif", name: "Serif" },
  { id: "clean", name: "Clean" },
  { id: "tech", name: "Tech" },
  { id: "elegant", name: "Elegant" },
];

export const ACCENTS = ["#f5a300", "#e11d48", "#c2410c", "#16a34a", "#0f766e", "#2643e9", "#7c3aed", "#1b2a4a", "#12141a"];

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function slugOf(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "portfolio";
}

// Black or white, whichever reads better on the given colour.
export function onColor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#ffffff";
  const n = parseInt(m[1], 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? "#12141a" : "#ffffff";
}

export function newItem(): Item {
  return { id: uid(), title: "", sub: "", meta: "", text: "", details: "", tags: [], photos: [] };
}

export function skillsSection(): Section {
  return { id: "skills", title: "Skills", layout: "skills", style: "", hidden: false, items: [] };
}

export function newSection(title: string, layout: Section["layout"]): Section {
  return { id: uid(), title, layout, style: "", hidden: false, items: [] };
}

// The colours each template's sample pictures are drawn in.
const PHOTO_COLOURS: Record<string, string[]> = {
  "professional-1": ["#f5a300", "#12141a", "#ffe9b8"],
  "professional-2": ["#1f3a34", "#d9e8e2", "#7fb3a4"],
  "professional-3": ["#1b2a4a", "#c9d2e6", "#6f86bd"],
  "professional-4": ["#2643e9", "#faf8f4", "#9fb0ff"],
  "creative-1": ["#ff8fab", "#ffd43b", "#7fe0d0"],
  "creative-2": ["#2f6f68", "#7fc8bc", "#1c4b47"],
  "creative-3": ["#12141a", "#ffd43b", "#ffffff"],
  "creative-4": ["#7c3aed", "#22d3ee", "#090b18"],
  "creative-5": ["#c2410c", "#f3ede2", "#1c1917"],
};

// What each sample person's pictures show, so a data analyst gets charts and an architect gets drawings.
type PictureKind = "chart" | "table" | "blueprint" | "code" | "poster" | "landscape" | "phone";

const PICTURE_KINDS: Record<string, PictureKind[]> = {
  "professional-1": ["chart", "table", "chart"],
  "professional-2": ["table", "chart", "table"],
  "professional-3": ["blueprint", "chart", "blueprint"],
  "professional-4": ["code", "phone", "chart"],
  "creative-1": ["poster", "landscape", "poster"],
  "creative-2": ["landscape", "landscape", "poster"],
  "creative-3": ["phone", "poster", "phone"],
  "creative-4": ["poster", "landscape", "code"],
  "creative-5": ["blueprint", "landscape", "blueprint"],
};

// Sample pictures are simple drawings of the kind of work shown: a dashboard, a drawing, an app screen.
// They are clearly drawings, so nothing in a preview pretends to be a real photo.
export function samplePhoto(template: string, n: number, pick = n) {
  const c = PHOTO_COLOURS[template] ?? PHOTO_COLOURS["professional-1"];
  const kinds = PICTURE_KINDS[template] ?? PICTURE_KINDS["professional-1"];
  // "pick" chooses what is drawn, so neighbouring cards show different kinds of work.
  const kind = kinds[pick % kinds.length];
  const a = c[0];
  const b = c[1];
  const d = c[2];
  // A small repeatable "random" number, so every picture differs but never changes between visits.
  const r = (k: number, max: number) => ((n * 53 + k * 97) % max);
  const ink = "#12141a";
  const paper = "#f6f7f9";
  let body = "";

  if (kind === "chart") {
    const bars = [0, 1, 2, 3, 4, 5, 6].map((k) => {
      const h = 120 + r(k, 300);
      return `<rect x="${130 + k * 96}" y="${640 - h}" width="56" height="${h}" rx="8" fill="${k % 3 === n % 3 ? a : "#c9ced8"}"/>`;
    });
    const line = [0, 1, 2, 3, 4, 5, 6].map((k) => `${158 + k * 96},${420 - r(k + 9, 220)}`).join(" ");
    body =
      `<rect width="1200" height="800" fill="${paper}"/><rect x="70" y="70" width="760" height="660" rx="24" fill="#fff"/>` +
      `<rect x="130" y="124" width="260" height="22" rx="11" fill="${ink}"/><rect x="130" y="162" width="160" height="14" rx="7" fill="#c9ced8"/>` +
      bars.join("") + `<polyline points="${line}" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>` +
      [0, 1, 2].map((k) => `<rect x="870" y="${70 + k * 226}" width="260" height="208" rx="24" fill="${k === n % 3 ? a : "#fff"}"/><rect x="906" y="${116 + k * 226}" width="110" height="14" rx="7" fill="${k === n % 3 ? "#ffffffaa" : "#c9ced8"}"/><rect x="906" y="${156 + k * 226}" width="${120 + r(k, 70)}" height="40" rx="10" fill="${k === n % 3 ? "#fff" : ink}"/>`).join("");
  } else if (kind === "table") {
    const rows = [0, 1, 2, 3, 4, 5, 6].map((k) =>
      `<rect x="110" y="${250 + k * 66}" width="980" height="2" fill="#e4e6eb"/>` +
      [0, 1, 2, 3].map((col) => `<rect x="${140 + col * 250}" y="${274 + k * 66}" width="${90 + r(k * 4 + col, 110)}" height="16" rx="8" fill="${col === 3 && k % 3 === n % 3 ? a : col === 0 ? ink : "#c9ced8"}"/>`).join(""),
    );
    body =
      `<rect width="1200" height="800" fill="${paper}"/><rect x="70" y="70" width="1060" height="660" rx="24" fill="#fff"/>` +
      `<rect x="70" y="70" width="1060" height="150" rx="24" fill="${a}"/><rect x="70" y="170" width="1060" height="50" fill="${a}"/>` +
      `<rect x="140" y="118" width="300" height="24" rx="12" fill="#fff"/><rect x="140" y="162" width="180" height="14" rx="7" fill="#ffffff99"/>` + rows.join("");
  } else if (kind === "blueprint") {
    const grid = Array.from({ length: 14 }, (_, k) => `<path d="M${k * 90} 0V800M0 ${k * 90}H1200" stroke="#fff" stroke-opacity="0.12" stroke-width="2"/>`).join("");
    const w = 420 + r(1, 200);
    const h = 260 + r(2, 140);
    body =
      `<rect width="1200" height="800" fill="${a}"/>` + grid +
      `<g fill="none" stroke="#fff" stroke-width="5"><rect x="${600 - w / 2}" y="${420 - h / 2}" width="${w}" height="${h}"/>` +
      `<path d="M${600 - w / 2} ${420 - h / 2}L600 ${250 - r(3, 90)}L${600 + w / 2} ${420 - h / 2}"/>` +
      `<rect x="${560 - r(4, 120)}" y="${420 + h / 2 - 150}" width="80" height="150"/><rect x="${640 + r(5, 80)}" y="${390 - h / 4}" width="90" height="90"/>` +
      `<circle cx="${600 - w / 4}" cy="${410 - h / 6}" r="46"/></g>` +
      `<g stroke="#fff" stroke-opacity="0.7" stroke-width="3"><path d="M${600 - w / 2} ${470 + h / 2}H${600 + w / 2}M${600 - w / 2} ${456 + h / 2}v28M${600 + w / 2} ${456 + h / 2}v28"/></g>` +
      `<rect x="${560}" y="${488 + h / 2}" width="80" height="12" rx="6" fill="#fff" fill-opacity="0.8"/>`;
  } else if (kind === "code") {
    const tints = [a, "#7fe0d0", "#ffd43b", "#ff8fab", "#c9ced8"];
    const lines = Array.from({ length: 11 }, (_, k) => {
      const indent = [0, 1, 2, 2, 1, 1, 2, 3, 2, 1, 0][k] * 44;
      const w1 = 70 + r(k, 120);
      const w2 = 90 + r(k + 20, 200);
      return `<rect x="${130 + indent}" y="${196 + k * 46}" width="${w1}" height="16" rx="8" fill="${tints[(k + n) % 5]}"/><rect x="${146 + indent + w1}" y="${196 + k * 46}" width="${w2}" height="16" rx="8" fill="#ffffff" fill-opacity="0.32"/>`;
    });
    body =
      `<rect width="1200" height="800" fill="${d}"/><rect x="70" y="70" width="1060" height="660" rx="22" fill="${ink}"/>` +
      `<circle cx="116" cy="116" r="9" fill="#ff8fab"/><circle cx="146" cy="116" r="9" fill="#ffd43b"/><circle cx="176" cy="116" r="9" fill="#7fe0d0"/>` +
      `<rect x="70" y="150" width="1060" height="2" fill="#fff" fill-opacity="0.12"/>` + lines.join("");
  } else if (kind === "poster") {
    body =
      `<rect width="1200" height="800" fill="${a}"/><circle cx="${760 + r(1, 240)}" cy="${250 + r(2, 220)}" r="${200 + r(3, 90)}" fill="${b}"/>` +
      `<rect x="${90 + r(4, 160)}" y="${360 + r(5, 120)}" width="330" height="330" rx="40" fill="${d}" transform="rotate(${-14 + r(6, 28)} 300 520)"/>` +
      `<rect x="100" y="100" width="${380 + r(7, 220)}" height="54" rx="12" fill="${ink}"/><rect x="100" y="176" width="${220 + r(8, 200)}" height="54" rx="12" fill="${ink}"/>` +
      `<rect x="100" y="664" width="150" height="14" rx="7" fill="${ink}" fill-opacity="0.7"/><rect x="100" y="692" width="96" height="14" rx="7" fill="${ink}" fill-opacity="0.45"/>`;
  } else if (kind === "landscape") {
    const sun = 240 + r(1, 700);
    body =
      `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${d}"/></linearGradient></defs>` +
      `<rect width="1200" height="800" fill="url(#g)"/><circle cx="${sun}" cy="${220 + r(2, 120)}" r="${80 + r(3, 50)}" fill="#fff" fill-opacity="0.85"/>` +
      `<path d="M0 ${520 - r(4, 80)}L${260 + r(5, 120)} ${330 + r(6, 90)}L${560 + r(7, 80)} ${520 - r(8, 60)}L${820 + r(9, 100)} ${360 + r(10, 80)}L1200 ${500 - r(11, 70)}V800H0Z" fill="${a}" fill-opacity="0.75"/>` +
      `<path d="M0 ${640 - r(12, 60)}Q${300 + r(13, 120)} ${520 + r(14, 60)} ${640} ${640 - r(15, 50)}T1200 ${610 - r(16, 50)}V800H0Z" fill="${a}"/>`;
  } else {
    const cards = [0, 1, 2, 3].map((k) =>
      `<rect x="470" y="${250 + k * 104}" width="260" height="86" rx="16" fill="${k === n % 4 ? a : paper}"/>` +
      `<circle cx="508" cy="${293 + k * 104}" r="18" fill="${k === n % 4 ? "#fff" : d}"/>` +
      `<rect x="540" y="${276 + k * 104}" width="${90 + r(k, 70)}" height="12" rx="6" fill="${k === n % 4 ? "#fff" : ink}"/><rect x="540" y="${300 + k * 104}" width="${60 + r(k + 5, 60)}" height="10" rx="5" fill="${k === n % 4 ? "#ffffffaa" : "#c9ced8"}"/>`,
    );
    body =
      `<rect width="1200" height="800" fill="${b}"/><circle cx="${240 + r(1, 120)}" cy="${620 - r(2, 200)}" r="210" fill="${d}" fill-opacity="0.5"/><circle cx="${980 - r(3, 120)}" cy="${200 + r(4, 160)}" r="150" fill="${a}" fill-opacity="0.45"/>` +
      `<rect x="430" y="60" width="340" height="680" rx="44" fill="${ink}"/><rect x="446" y="76" width="308" height="648" rx="30" fill="#fff"/>` +
      `<rect x="548" y="92" width="104" height="18" rx="9" fill="${ink}"/><rect x="470" y="150" width="170" height="24" rx="12" fill="${ink}"/><rect x="470" y="190" width="110" height="12" rx="6" fill="#c9ced8"/>` + cards.join("");
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">${body}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// A drawn head-and-shoulders picture, used where a demo needs a portrait and no real photo may be shown.
export function samplePortrait(accent: string) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">` +
    `<rect width="400" height="500" fill="#efe9ff"/><circle cx="318" cy="96" r="120" fill="${accent}" opacity="0.28"/>` +
    `<path d="M40 500c0-110 70-170 160-170s160 60 160 170z" fill="#12141a"/>` +
    `<path d="M150 300h100v70c-30 26-70 26-100 0z" fill="#e8b48c"/>` +
    `<ellipse cx="200" cy="218" rx="86" ry="104" fill="#f2c9a5"/>` +
    `<path d="M112 214c-10-96 38-140 96-140 66 0 104 52 84 142-14-48-36-74-64-82-34 22-76 34-116 80z" fill="#2a1d3b"/>` +
    `<path d="M172 262c18 14 38 14 56 0" fill="none" stroke="#12141a" stroke-width="6" stroke-linecap="round"/>` +
    `<circle cx="168" cy="220" r="7" fill="#12141a"/><circle cx="234" cy="220" r="7" fill="#12141a"/>` +
    `<path d="M150 370l50 60 50-60" fill="none" stroke="${accent}" stroke-width="14" stroke-linejoin="round"/>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Every look option at its starting value: the template decides.
const LOOK_DEFAULTS = {
  accent: "",
  font: "modern" as FontId,
  theme: "" as ThemeId,
  hero: "" as HeroId,
  photoSize: "m" as const,
  bigName: false,
  glow: false,
  motion: "rise" as MotionId,
  gallery: "stack" as GalleryId,
  frame: "" as FrameId,
  bodyFont: "clean" as FontId,
  progress: false,
  nav: true,
};

// Fields added after the first version, with what they start as.
const CLOSING_DEFAULTS = {
  phone: "",
  quote: "",
  quoteBy: "",
  contactTitle: "Let's work together.",
  contactNote: "",
  contactStatus: "",
  contactForm: true,
  contactSend: "mailto" as SendId,
  portrait: "plain" as PortraitId,
  photoCut: "",
  resume: "original" as ResumeId,
  resumeFile: "",
  resumeName: "",
  resumePhoto: false,
};

// Fills in anything missing from a portfolio saved by an earlier version of the editor.
export function normalize(saved: Portfolio): Portfolio {
  return {
    ...LOOK_DEFAULTS,
    ...CLOSING_DEFAULTS,
    ...saved,
    // Earlier versions could offer a résumé made by the site to visitors; now only the user's own file is offered.
    resume: (saved.resume as string) === "none" ? "none" : "original",
    // Portrait looks from an earlier version become the plain photo.
    portrait: saved.portrait === "cut" || saved.portrait === "none" ? saved.portrait : "plain",
    // Skills used to sit after every section, so that is where the section goes for older saves.
    sections: [
      ...saved.sections.map((section) => ({ ...section, style: section.style ?? "" })),
      ...(saved.sections.some((section) => section.layout === "skills") ? [] : [skillsSection()]),
    ],
  };
}

// True once the user has typed something of their own.
export function hasDetails(p: Portfolio | null): p is Portfolio {
  return Boolean(p && !p.sample && p.name.trim());
}

// A fingerprint of a portfolio's details, ignoring its look. Two portfolios with the same fingerprint
// say the same things, whatever templates they are in.
export function detailsKey(p: Portfolio) {
  const links = (list: Link[] | undefined) => (list ?? []).map((l) => [l.label, l.url]);
  return JSON.stringify([
    p.name, p.role, p.city, p.bio, p.about, p.email, p.phone, p.photo.length, links(p.links), p.skills, p.quote, p.quoteBy,
    p.sections.map((s) => [s.title, s.layout, s.items.map((i) => [i.title, i.sub, i.meta, i.text, i.details ?? "", i.tags, links(i.links), i.photos.length])]),
  ]);
}

// The same details shown in another template, in that template's own look.
export function inTemplate(p: Portfolio, template: string): Portfolio {
  return {
    ...p,
    ...LOOK_DEFAULTS,
    font: template === "creative-5" ? "serif" : "modern",
    template,
    sections: p.sections.map((section) => ({ ...section, style: "", bg: "", ink: "", accent: "", font: "" })),
  };
}

const SAMPLE_DETAILS =
  "This is where the full story goes: what the problem was, what you did and what changed because of it.\n\nKeep the short description on the card to one line, and use this space for the detail a recruiter would ask about in an interview.";

// A complete sample person in the given template. Used for previews and as the editor's starting point.
export function fromSample(template: string): Portfolio {
  const id = getTemplate(template) ? template : TEMPLATES[0].id;
  const s = SAMPLES[id] ?? SAMPLES[TEMPLATES[0].id];
  let n = 0;
  const photos = (count: number, first = 0) => Array.from({ length: count }, (_, k) => samplePhoto(id, n++, first + k));

  const sections: Section[] = [
    {
      id: "work",
      title: s.workLabel,
      layout: "cards",
      style: "",
      hidden: false,
      items: s.projects.map((p, i) => ({ id: `w${i}`, title: p.title, sub: "", meta: "", text: p.text, details: SAMPLE_DETAILS, links: i === 0 ? [{ id: "s0", label: "Live project", url: "#" }] : [], tags: p.tags, photos: photos(i === 1 ? 5 : 3, i), gallery: GALLERIES[i % 3].id })),
    },
  ];
  if (s.experience) {
    sections.push({
      id: "experience",
      title: "Experience",
      layout: "list",
      style: "",
      hidden: false,
      items: s.experience.map((e, i) => ({ id: `x${i}`, title: e.title, sub: e.place, meta: e.years, text: e.text, tags: [], photos: photos(i === 0 ? 3 : 2, i + 1) })),
    });
  }
  sections.push({
    id: "education",
    title: "Education",
    layout: "list",
    style: "",
    hidden: false,
    items: s.education.map((e, i) => ({ id: `e${i}`, title: e.title, sub: e.place, meta: e.years, text: "", tags: [], photos: i === 0 ? photos(3, 2) : [] })),
  });
  sections.push(skillsSection());

  return {
    template: id,
    ...LOOK_DEFAULTS,
    font: id === "creative-5" ? "serif" : "modern",
    name: s.name,
    role: s.role,
    city: s.city,
    bio: s.bio,
    about: s.about,
    photo: "",
    email: s.email,
    ...CLOSING_DEFAULTS,
    contactStatus: "Open to work",
    contactNote: `Looking for ${s.role.toLowerCase()} roles. I usually reply within a day.`,
    quote: "Small, steady work beats one big burst.",
    quoteBy: "A note to self",
    // "#" keeps the sample links tappable without sending anyone to a made-up profile.
    links: s.links.map((label, i) => ({ id: `l${i}`, label, url: "#" })),
    skills: s.skills,
    sections,
    sample: true,
  };
}

export function blankPortfolio(template: string): Portfolio {
  return {
    template,
    ...LOOK_DEFAULTS,
    font: template === "creative-5" ? "serif" : "modern",
    name: "",
    role: "",
    city: "",
    bio: "",
    about: "",
    photo: "",
    email: "",
    ...CLOSING_DEFAULTS,
    links: [],
    skills: [],
    sections: [newSection("Projects", "cards"), newSection("Experience", "list"), newSection("Education", "list"), skillsSection()],
    sample: false,
  };
}
