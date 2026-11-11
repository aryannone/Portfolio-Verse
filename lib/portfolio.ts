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

export type BuddyId = "robot" | "cat" | "ghost" | "none";

export const BUDDIES: { id: BuddyId; name: string }[] = [
  { id: "robot", name: "Robot" },
  { id: "cat", name: "Cat" },
  { id: "ghost", name: "Ghost" },
  { id: "none", name: "No character" },
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
  buddy: BuddyId;
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

export const ACCENTS = ["#f5a300", "#e11d48", "#c2410c", "#16a34a", "#0f766e", "#2643e9", "#8b5cf6", "#1b2a4a", "#12141a"];

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

// Sample photos are simple drawn pictures, so nothing in a preview pretends to be a real photo.
const PHOTO_COLOURS: Record<string, string[]> = {
  "professional-1": ["#f5a300", "#12141a", "#ffe9b8"],
  "professional-2": ["#1f3a34", "#d9e8e2", "#7fb3a4"],
  "professional-3": ["#1b2a4a", "#c9d2e6", "#6f86bd"],
  "professional-4": ["#2643e9", "#faf8f4", "#9fb0ff"],
  "creative-1": ["#ff8fab", "#ffd43b", "#7fe0d0"],
  "creative-2": ["#2f6f68", "#7fc8bc", "#1c4b47"],
  "creative-3": ["#12141a", "#ffd43b", "#ffffff"],
  "creative-4": ["#8b5cf6", "#22d3ee", "#090b18"],
  "creative-5": ["#c2410c", "#f3ede2", "#1c1917"],
};

export function samplePhoto(template: string, n: number) {
  const c = PHOTO_COLOURS[template] ?? PHOTO_COLOURS["professional-1"];
  const a = c[n % 3];
  const b = c[(n + 1) % 3];
  const d = c[(n + 2) % 3];
  const x = 200 + ((n * 277) % 800);
  const y = 180 + ((n * 173) % 440);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
    `<rect width="1200" height="800" fill="url(#g)"/>` +
    `<circle cx="${x}" cy="${y}" r="${190 + (n % 4) * 40}" fill="${d}" opacity="0.55"/>` +
    `<rect x="${1100 - x}" y="${700 - y}" width="${260 + (n % 3) * 60}" height="${260 + (n % 3) * 60}" rx="36" fill="${a}" opacity="0.5" transform="rotate(${(n * 17) % 40} 600 400)"/>` +
    `<circle cx="${1200 - x / 2}" cy="${y / 2 + 80}" r="70" fill="${b}" opacity="0.8"/>` +
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
};

// Fields added after the first version, with what they start as.
const CLOSING_DEFAULTS = { phone: "", quote: "", quoteBy: "", buddy: "robot" as BuddyId };

// Fills in anything missing from a portfolio saved by an earlier version of the editor.
export function normalize(saved: Portfolio): Portfolio {
  return {
    ...LOOK_DEFAULTS,
    ...CLOSING_DEFAULTS,
    ...saved,
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
  const photos = (count: number) => Array.from({ length: count }, () => samplePhoto(id, n++));

  const sections: Section[] = [
    {
      id: "work",
      title: s.workLabel,
      layout: "cards",
      style: "",
      hidden: false,
      items: s.projects.map((p, i) => ({ id: `w${i}`, title: p.title, sub: "", meta: "", text: p.text, details: SAMPLE_DETAILS, links: i === 0 ? [{ id: "s0", label: "Live project", url: "#" }] : [], tags: p.tags, photos: photos(i === 1 ? 5 : 3), gallery: GALLERIES[i % 3].id })),
    },
  ];
  if (s.experience) {
    sections.push({
      id: "experience",
      title: "Experience",
      layout: "list",
      style: "",
      hidden: false,
      items: s.experience.map((e, i) => ({ id: `x${i}`, title: e.title, sub: e.place, meta: e.years, text: e.text, tags: [], photos: photos(i === 0 ? 3 : 2) })),
    });
  }
  sections.push({
    id: "education",
    title: "Education",
    layout: "list",
    style: "",
    hidden: false,
    items: s.education.map((e, i) => ({ id: `e${i}`, title: e.title, sub: e.place, meta: e.years, text: "", tags: [], photos: i === 0 ? photos(3) : [] })),
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
