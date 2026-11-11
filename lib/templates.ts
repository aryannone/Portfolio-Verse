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
  { id: "professional-1", name: "Professional 1", category: "professional", blurb: "One column, lots of white space.", accent: "#f5a300" },
  { id: "professional-2", name: "Professional 2", category: "professional", blurb: "Résumé-style with a side panel.", accent: "#1f3a34" },
  { id: "professional-3", name: "Professional 3", category: "professional", blurb: "Centred header, project cards.", accent: "#1b2a4a" },
  { id: "professional-4", name: "Professional 4", category: "professional", blurb: "A timeline for jobs and degrees.", accent: "#2643e9" },
  { id: "creative-1", name: "Creative 1", category: "creative", blurb: "Colour tags and oversized type.", accent: "#ffd43b" },
  { id: "creative-2", name: "Creative 2", category: "creative", blurb: "Dark gallery that puts photos first.", accent: "#7fc8bc" },
  { id: "creative-3", name: "Creative 3", category: "creative", blurb: "Playful, sticker-like project cards.", accent: "#ffd43b" },
  { id: "creative-4", name: "Creative 4", category: "creative", blurb: "Dark aurora with glass cards.", accent: "#8b5cf6" },
  { id: "creative-5", name: "Creative 5", category: "creative", blurb: "Editorial, with big serif type.", accent: "#c2410c" },
  // A plain canvas. Everything about it is chosen in the editor.
  { id: "custom", name: "Build your own", category: "custom", blurb: "A blank canvas. Choose every part yourself.", accent: "#f5a300" },
];

// The ready-made templates, without the blank canvas.
export const READY_TEMPLATES = TEMPLATES.filter((t) => t.category !== "custom");

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}
