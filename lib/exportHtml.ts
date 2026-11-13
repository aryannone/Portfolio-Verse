import { slugOf, toHref, type Portfolio } from "@/lib/portfolio";
import { mountPortfolio, type RuntimeStore } from "@/lib/runtime";

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Builds one self-contained HTML file from the page shown in the editor:
// the same markup, the same stylesheet and the same photo-panel code.
export async function buildHtml(root: HTMLElement, data: Portfolio): Promise<string> {
  const css = await fetch("/portfolio.css").then((r) => {
    if (!r.ok) throw new Error("Could not load the template styles");
    return r.text();
  });

  // Each photo is written into the file once and referred to by number.
  const photos: string[] = [];
  const seen = new Map<string, number>();
  const indexOf = (src: string) => {
    let i = seen.get(src);
    if (i === undefined) {
      i = photos.push(src) - 1;
      seen.set(src, i);
    }
    return i;
  };

  const clone = root.cloneNode(true) as HTMLElement;
  clone.classList.remove("tp-anim");
  clone.classList.add("tp-live");
  if (data.motion !== "none") clone.classList.add("tp-enter");
  clone.querySelectorAll(".tp-reveal").forEach((el) => {
    el.classList.remove("tp-reveal", "is-in", "is-done");
    (el as HTMLElement).style.removeProperty("--i");
    if (!el.getAttribute("style")) el.removeAttribute("style");
  });
  clone.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src") || "";
    if (!src.startsWith("data:")) return;
    img.setAttribute("data-ph", String(indexOf(src)));
    img.removeAttribute("src");
  });
  // The playground starts itself in the downloaded page; remove what the editor's copy left on it.
  clone.querySelectorAll(".tp-play").forEach((el) => el.classList.remove("tp-play-on"));
  clone.querySelectorAll(".tp-ct-card").forEach((el) => el.removeAttribute("style"));
  clone.querySelectorAll(".tp-bub, .tp-buddy-eye i").forEach((el) => el.removeAttribute("style"));
  clone.querySelectorAll(".tp-bub").forEach((el) => el.classList.remove("is-held"));
  clone.querySelectorAll(".tp-buddy").forEach((el) => el.classList.remove("is-happy", "is-hop"));
  clone.querySelectorAll(".tp-item.has-more").forEach((el) => {
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
  });

  const store: RuntimeStore = { items: {}, photos };
  for (const section of data.sections) {
    if (section.hidden) continue;
    for (const item of section.items) {
      store.items[`${section.id}:${item.id}`] = {
        section: section.title,
        title: item.title,
        sub: [item.sub, item.meta].filter(Boolean).join(" · "),
        text: item.text,
        details: item.details ?? "",
        tags: item.tags,
        links: (item.links ?? []).filter((l) => l.url.trim()).map((l) => ({ label: l.label.trim() || "Link", url: toHref(l.url) })),
        layout: item.gallery || data.gallery,
        photos: item.photos.map(indexOf),
      };
    }
  }

  // Only the extra fonts this portfolio uses are loaded.
  const used = new Set<string>([data.font, data.bodyFont, ...data.sections.map((s) => s.font || "")]);
  const extra =
    (used.has("serif") ? "&family=Fraunces:opsz,wght@9..144,400..700" : "") +
    (used.has("tech") ? "&family=Space+Grotesk:wght@400..700" : "") +
    (used.has("elegant") ? "&family=Playfair+Display:wght@400..700" : "");
  const title = [data.name, data.role].filter(Boolean).join(" · ");
  const json = JSON.stringify(store).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(data.bio)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(data.bio)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=Figtree:wght@400..700${extra}&display=swap">
<style>
:root {
  --font-display-stack: "Bricolage Grotesque", "Segoe UI", system-ui, sans-serif;
  --font-body-stack: "Figtree", "Segoe UI", system-ui, sans-serif;
  --font-serif-stack: "Fraunces", Georgia, "Times New Roman", serif;
  --font-tech-stack: "Space Grotesk", "Segoe UI", system-ui, sans-serif;
  --font-elegant-stack: "Playfair Display", Georgia, "Times New Roman", serif;
}
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; }
.tp { min-height: 100vh; }
${css}
</style>
</head>
<body>
${clone.outerHTML}
<script>
(${mountPortfolio.toString()})(document.querySelector(".tp"), ${json}, { reveal: ${data.motion !== "none"} });
</script>
</body>
</html>
`;
}

export function downloadHtml(html: string, name: string) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugOf(name)}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
