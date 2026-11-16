import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests: the pure data helpers in lib/. Browser flows are covered by Playwright in tests/e2e.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node" },
});
