import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Node environment, no jsdom — see docs/adr/0002.
 *
 * Every route in this site is prerendered by `next build` (`output: "export"`),
 * so a component that throws already fails CI. What a build cannot notice is
 * that the several independent lists describing the same routes have fallen
 * out of step with each other. That is what this suite checks, and it needs a
 * filesystem, not a DOM.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["{app,lib,components,scripts}/**/*.test.ts"],
  },
  resolve: {
    // Mirrors the `@/*` path alias in tsconfig.json so tests import modules by
    // the same specifier the app does. Two ways to name one module is how a
    // test ends up passing against a file the app never loads.
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
