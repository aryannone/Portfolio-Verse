// Copies the background-removal engine out of node_modules into public/, so the site serves it itself.
// It is about 19 MB, so it is copied at install and build time and kept out of the repository.
import { cpSync, existsSync, mkdirSync } from "node:fs";

const from = "node_modules/@mediapipe/tasks-vision/wasm";
const to = "public/vendor/mediapipe/wasm";

if (existsSync(from)) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
  console.log("Copied the background-removal engine to " + to);
} else {
  console.warn("Background-removal engine not found in node_modules; that feature will be unavailable.");
}
