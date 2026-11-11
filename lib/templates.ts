export type TemplateCategory = "professional" | "creative";

export type TemplateInfo = {
  id: string;
  name: string;
  category: TemplateCategory;
  blurb: string;
};

export const TEMPLATES: TemplateInfo[] = [
  { id: "professional-1", name: "Professional 1", category: "professional", blurb: "One column, lots of white space." },
  { id: "professional-2", name: "Professional 2", category: "professional", blurb: "Résumé-style with a side panel." },
  { id: "professional-3", name: "Professional 3", category: "professional", blurb: "Centred header, project cards." },
  { id: "creative-1", name: "Creative 1", category: "creative", blurb: "Colour tags and oversized type." },
  { id: "creative-2", name: "Creative 2", category: "creative", blurb: "Dark gallery that puts photos first." },
  { id: "creative-3", name: "Creative 3", category: "creative", blurb: "Playful, sticker-like project cards." },
];

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}
