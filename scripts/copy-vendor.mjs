// Copies browser-side engines out of node_modules into public/, so the site serves them itself.
// They are copied at build time and kept out of the repository.
//   - MediaPipe: removes photo backgrounds (about 19 MB, loaded only when that option is chosen)
//   - pdf.js: reads text out of an imported résumé PDF (loaded only when a résumé is imported)
import { cpSync, existsSync, mkdirSync } from "node:fs";

const copies = [
  { from: "node_modules/@mediapipe/tasks-vision/wasm", to: "public/vendor/mediapipe/wasm" },
  { from: "node_modules/pdfjs-dist/build/pdf.min.mjs", to: "public/vendor/pdfjs/pdf.min.mjs" },
  { from: "node_modules/pdfjs-dist/build/pdf.worker.min.mjs", to: "public/vendor/pdfjs/pdf.worker.min.mjs" },
];

for (const { from, to } of copies) {
  if (!existsSync(from)) {
    console.warn(`Not found in node_modules: ${from}. The feature that needs it will be unavailable.`);
    continue;
  }
  mkdirSync(to.endsWith(".mjs") ? to.slice(0, to.lastIndexOf("/")) : to, { recursive: true });
  cpSync(from, to, { recursive: true });
  console.log(`Copied ${from} to ${to}`);
}
