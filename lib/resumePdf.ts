// Makes a résumé PDF from a portfolio's details, in the browser.
// A plain, single-column layout with real text, which recruiters and applicant-tracking software read best.

import { slugOf, toHref, type Portfolio } from "@/lib/portfolio";
import { getTemplate } from "@/lib/templates";

export type ResumeOptions = { photo: boolean };

// The PDF's built-in fonts cover Western European text only; other characters are swapped or dropped.
function safe(text: string) {
  return text
    .replace(/₹/g, "Rs. ")
    .replace(/[→➜➤]/g, "->")
    .replace(/[←]/g, "<-")
    .replace(/[✓✔]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]/g, "")
    .trim();
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return [18, 20, 26];
  const n = parseInt(m[1], 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

// A colour dark enough to print headings in: very light accents are darkened.
function headingColour(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (lum < 0.55) return [r, g, b];
  const k = 0.55 / lum;
  return [Math.round(r * k), Math.round(g * k), Math.round(b * k)];
}

const shortUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/i, "").replace(/^mailto:/i, "").replace(/\/$/, "");

export async function makeResume(data: Portfolio, options: ResumeOptions = { photo: false }): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 46;
  const inner = W - M * 2;
  const ink: [number, number, number] = [18, 20, 26];
  const muted: [number, number, number] = [91, 97, 112];
  const accent = headingColour(data.accent || getTemplate(data.template)?.accent || "#8c52ff");
  let y = M;

  const font = (style: "normal" | "bold" | "italic", size: number, colour: [number, number, number] = ink) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...colour);
  };
  const room = (needed: number) => {
    if (y + needed > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const lineHeight = (size: number) => size * 1.32;

  // Paragraph text, wrapped to a width, starting at x.
  const para = (text: string, x: number, width: number, size: number) => {
    for (const row of doc.splitTextToSize(safe(text), width) as string[]) {
      room(lineHeight(size));
      doc.text(row, x, y + size);
      y += lineHeight(size);
    }
  };

  // ---------- header ----------
  const photo = options.photo && (data.photoCut || data.photo);
  const photoSize = 74;
  const textWidth = photo ? inner - photoSize - 18 : inner;
  if (photo) {
    try {
      const kind = photo.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(photo, kind, W - M - photoSize, y, photoSize, photoSize * 1.2, undefined, "FAST");
    } catch {
      // A photo that cannot be added is left out; the rest of the résumé is unaffected.
    }
  }
  font("bold", 24);
  doc.text(safe(data.name || "Your Name"), M, y + 22);
  y += 32;
  if (data.role || data.city) {
    font("normal", 11.5, muted);
    doc.text(safe([data.role, data.city].filter(Boolean).join("  •  ")), M, y + 11);
    y += 20;
  }

  // Contact line: each item is a link, wrapping onto a new line when it does not fit.
  const contacts = [
    ...(data.email ? [{ text: data.email, url: `mailto:${data.email}` }] : []),
    ...(data.phone.trim() ? [{ text: data.phone.trim(), url: toHref(data.phone) }] : []),
    ...data.links.filter((l) => l.url.trim() && l.url.trim() !== "#").map((l) => ({ text: shortUrl(toHref(l.url)), url: toHref(l.url) })),
  ];
  if (contacts.length) {
    font("normal", 9.5, ink);
    let x = M;
    const gap = 14;
    y += 2;
    for (const c of contacts) {
      const text = safe(c.text);
      const w = doc.getTextWidth(text);
      if (x > M && x + w > M + textWidth) {
        x = M;
        y += 14;
      }
      doc.textWithLink(text, x, y + 9.5, { url: c.url });
      x += w + gap;
    }
    y += 16;
  }
  if (photo) y = Math.max(y, M + photoSize * 1.2 + 8);

  // ---------- sections ----------
  const heading = (title: string) => {
    room(40);
    y += 12;
    font("bold", 10.5, accent);
    doc.setCharSpace(0.8);
    doc.text(safe(title).toUpperCase(), M, y + 10);
    doc.setCharSpace(0);
    y += 15;
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.8);
    doc.line(M, y, W - M, y);
    y += 8;
  };

  if (data.about.trim()) {
    heading("Summary");
    font("normal", 10, ink);
    para(data.about.trim(), M, inner, 10);
  }

  for (const section of data.sections) {
    if (section.hidden) continue;
    if (section.layout === "skills") {
      if (!data.skills.length) continue;
      heading(section.title || "Skills");
      font("normal", 10, ink);
      para(data.skills.join("  •  "), M, inner, 10);
      continue;
    }
    const items = section.items.filter((it) => it.title.trim());
    if (!items.length) continue;
    heading(section.title || "Section");

    // A plain list (achievements, certificates): one bullet per line, with its date at the end.
    const plainList = items.every((it) => !it.sub.trim() && !it.text.trim() && !(it.details ?? "").trim() && !it.tags.length);
    if (plainList) {
      y += 2;
      font("normal", 10, ink);
      for (const it of items) {
        const rows = doc.splitTextToSize(safe(it.title + (it.meta.trim() ? ` (${it.meta.trim()})` : "")), inner - 14) as string[];
        rows.forEach((row, i) => {
          room(lineHeight(10));
          if (i === 0) doc.text("\u2022", M + 2, y + 10);
          doc.text(row, M + 14, y + 10);
          y += lineHeight(10);
        });
        y += 2;
      }
      continue;
    }

    for (const item of items) {
      room(40);
      y += 4;
      // Title on the left, dates on the right.
      font("normal", 9.5, muted);
      const meta = safe(item.meta);
      const metaW = meta ? doc.getTextWidth(meta) : 0;
      font("bold", 10.5, ink);
      const titleRows = doc.splitTextToSize(safe(item.title), inner - (metaW ? metaW + 14 : 0)) as string[];
      titleRows.forEach((row, i) => {
        room(14);
        doc.text(row, M, y + 10.5);
        if (i === 0 && meta) {
          font("normal", 9.5, muted);
          doc.text(meta, W - M, y + 10.5, { align: "right" });
          font("bold", 10.5, ink);
        }
        y += 14;
      });
      if (item.sub.trim()) {
        font("italic", 10, muted);
        para(item.sub.trim(), M, inner, 10);
      }

      // Points: the full details if there are any, else the short description.
      const source = (item.details ?? "").trim() || item.text.trim();
      const points = source
        .split(/\n+/)
        .map((p) => p.replace(/^\s*[•\-*–]\s*/, "").trim())
        .filter(Boolean);
      if (item.result?.trim()) points.push("Result: " + item.result.trim());
      font("normal", 10, ink);
      for (const point of points) {
        const rows = doc.splitTextToSize(safe(point), inner - 14) as string[];
        rows.forEach((row, i) => {
          room(lineHeight(10));
          if (i === 0 && points.length > 1) doc.text("•", M + 2, y + 10);
          doc.text(row, points.length > 1 ? M + 14 : M, y + 10);
          y += lineHeight(10);
        });
      }
      if (item.tags.length) {
        font("normal", 9, muted);
        para("Tools: " + item.tags.join(", "), M, inner, 9);
      }
      const links = (item.links ?? []).filter((l) => l.url.trim() && l.url.trim() !== "#");
      if (links.length) {
        font("normal", 9, accent);
        let x = M;
        room(13);
        for (const l of links) {
          const text = safe(`${l.label.trim() || "Link"}: ${shortUrl(toHref(l.url))}`);
          const w = doc.getTextWidth(text);
          if (x > M && x + w > W - M) {
            x = M;
            y += 12;
            room(13);
          }
          doc.textWithLink(text, x, y + 9, { url: toHref(l.url) });
          x += w + 14;
        }
        y += 13;
      }
      y += 3;
    }
  }

  doc.setProperties({ title: `${data.name || "Résumé"} - Résumé`, subject: "Résumé", creator: "Portfolio-Verse" });
  return doc.output("blob");
}

export function resumeFileName(data: Portfolio) {
  return `${slugOf(data.name)}-resume.pdf`;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
