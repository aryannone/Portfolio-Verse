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
  photos: string[]; // image data, shown in the photo panel
  gallery?: GalleryId | ""; // this entry's own photo layout; empty means the portfolio's
};

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
  layout: "cards" | "list";
  style: SectionStyle;
  hidden: boolean;
  items: Item[];
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
export type MotionId = "rise" | "fade" | "slide" | "zoom" | "none";

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
  { id: "none", name: "No animation" },
];

export type FontId = "modern" | "serif" | "clean";

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
  name: string;
  role: string;
  city: string;
  bio: string;
  about: string;
  photo: string;
  email: string;
  links: { id: string; label: string; url: string }[];
  skills: string[];
  sections: Section[];
  sample: boolean;
};

export const FONTS: { id: FontId; name: string }[] = [
  { id: "modern", name: "Modern" },
  { id: "serif", name: "Serif" },
  { id: "clean", name: "Clean" },
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
  return { id: uid(), title: "", sub: "", meta: "", text: "", tags: [], photos: [] };
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
};

// Fills in anything missing from a portfolio saved by an earlier version of the editor.
export function normalize(saved: Portfolio): Portfolio {
  return {
    ...LOOK_DEFAULTS,
    ...saved,
    sections: saved.sections.map((section) => ({ ...section, style: section.style ?? "" })),
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
    sections: p.sections.map((section) => ({ ...section, style: "" })),
  };
}

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
      items: s.projects.map((p, i) => ({ id: `w${i}`, title: p.title, sub: "", meta: "", text: p.text, tags: p.tags, photos: photos(i === 1 ? 5 : 3), gallery: GALLERIES[i % 3].id })),
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
    links: s.links.map((label, i) => ({ id: `l${i}`, label, url: "" })),
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
    links: [],
    skills: [],
    sections: [newSection("Projects", "cards"), newSection("Experience", "list"), newSection("Education", "list")],
    sample: false,
  };
}
