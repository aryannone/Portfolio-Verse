export type TemplateCategory = "professional" | "creative" | "custom";

export type TemplateInfo = {
  id: string;
  name: string;
  category: TemplateCategory;
  blurb: string;
  // The template's own accent colour, shown in the editor until the user picks another.
  accent: string;
};

export const TEMPLATES: TemplateInfo[] = [
  { id: "professional-1", name: "Classic", category: "professional", blurb: "One calm column, lots of white space.", accent: "#f5a300" },
  { id: "professional-2", name: "Résumé", category: "professional", blurb: "A side panel with your name and skills, like a résumé.", accent: "#1f3a34" },
  { id: "professional-4", name: "Timeline", category: "professional", blurb: "Jobs and degrees along a dated line.", accent: "#2643e9" },
  { id: "split", name: "Split screen", category: "professional", blurb: "Your photo fills one half and stays put while your work scrolls.", accent: "#ea580c" },
  { id: "creative-1", name: "Bold", category: "creative", blurb: "Oversized type and bright colour cards.", accent: "#ffd43b" },
  { id: "creative-4", name: "Aurora", category: "creative", blurb: "Dark, with drifting light and glass cards.", accent: "#7c3aed" },
  { id: "creative-5", name: "Editorial", category: "creative", blurb: "Magazine-style, with big serif type.", accent: "#c2410c" },
  { id: "bento", name: "Bento", category: "creative", blurb: "Everything as tiles of different sizes in one grid.", accent: "#e11d48" },
  // A plain canvas. Everything about it is chosen in the editor.
  { id: "custom", name: "Build your own", category: "custom", blurb: "A blank canvas. Choose every part yourself.", accent: "#f5a300" },
];

// The ready-made templates, without the blank canvas.
export const READY_TEMPLATES = TEMPLATES.filter((t) => t.category !== "custom");

// Templates that were folded into others. Portfolios made with them move to the one named here.
export const RETIRED: Record<string, string> = {
  "professional-3": "professional-1",
  "creative-2": "creative-4",
  "creative-3": "creative-1",
};

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}
