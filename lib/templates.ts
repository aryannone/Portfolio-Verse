export type TemplateCategory = "professional" | "creative";

export type TemplateInfo = {
  id: string;
  name: string;
  category: TemplateCategory;
  blurb: string;
};

export const TEMPLATES: TemplateInfo[] = [
  { id: "clarity", name: "Clarity", category: "professional", blurb: "One column, lots of white space." },
  { id: "ledger", name: "Ledger", category: "professional", blurb: "Résumé-style with a side panel." },
  { id: "column", name: "Column", category: "professional", blurb: "Centred header, project cards." },
  { id: "rangoli", name: "Rangoli", category: "creative", blurb: "Colour tags and oversized type." },
  { id: "monsoon", name: "Monsoon", category: "creative", blurb: "Dark gallery that puts photos first." },
  { id: "bazaar", name: "Bazaar", category: "creative", blurb: "Playful, sticker-like project cards." },
];
