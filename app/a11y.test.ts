import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * The Lighthouse run in issue #7 found two accessibility defects, and both are
 * the kind a build cannot see and a reviewer reading a diff will not either:
 * a hex value three points too dark, and a link that is a link only because it
 * is a slightly different colour.
 *
 * Reading them back out of the stylesheet and recomputing the WCAG ratio is
 * what keeps the next palette adjustment from silently undoing the fix. The
 * audit itself is a snapshot; this runs on every commit.
 */

const root = fileURLToPath(new URL("..", import.meta.url));
const css = readFileSync(`${root}app/globals.css`, "utf8");

/** WCAG 2.1 relative luminance and contrast ratio, sRGB. */
function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** Pulls one custom-property block out of the stylesheet by selector. */
function tokens(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  expect(start, `${selector} block missing from globals.css`).toBeGreaterThan(-1);
  const block = css.slice(start, css.indexOf("}", start));
  const out: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/g)) {
    out[name] = value;
  }
  return out;
}

const THEMES = {
  light: tokens(":root"),
  dark: tokens('[data-theme="dark"]'),
};

// Every surface a foreground token is ever painted on. --wash and --code-bg
// are the ones that bite: they are a shade closer to the text than --paper,
// so a colour that passes on the page body can still fail inside a callout or
// a code block, which is exactly how --faint failed at 4.19:1 while reading
// as fine at 4.38:1 elsewhere.
const SURFACES = ["paper", "wash", "code-bg"] as const;

describe.each(Object.entries(THEMES))("%s theme contrast", (theme, t) => {
  // --faint carries figure captions, code-block bars, sidebar numbering and
  // the footer legal line -- all between 10.5px and 11.5px, so none of it
  // qualifies for the 3:1 large-text allowance.
  for (const fg of ["ink", "muted", "faint", "accent"] as const) {
    for (const bg of SURFACES) {
      it(`--${fg} on --${bg} clears WCAG AA for body text`, () => {
        const ratio = contrast(t[fg], t[bg]);
        expect(
          Number(ratio.toFixed(2)),
          `--${fg} ${t[fg]} on --${bg} ${t[bg]} in ${theme}`,
        ).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

describe("inline links are distinguishable without colour", () => {
  // WCAG 1.4.1: colour cannot be the only visual means of conveying
  // information. A link inside a paragraph therefore needs a non-colour
  // affordance, and a `border-bottom: 1px solid transparent` that only
  // resolves on :hover is not one -- a keyboard or touch reader never reaches
  // that state.
  it("underlines prose links from the first paint, not on hover", () => {
    const rule = css.slice(css.indexOf(".prose-link {"));
    const decl = rule.slice(0, rule.indexOf("}"));
    expect(decl).toContain("text-decoration: underline");
    expect(decl).not.toContain("text-decoration: none");
  });

  it("covers the containers that actually hold running text", () => {
    // Home-page body copy is `.section-prose`, docs body is `.docs-article`,
    // and both had failing links in the audit. Neither is `.prose`, which was
    // the only container the old rule named -- so the old rule matched almost
    // nothing on the pages that failed.
    for (const container of [".section-prose", ".docs-article p", ".docs-article li"]) {
      expect(css).toContain(container);
    }
  });
});

describe("brand lockups reserve their space before they load", () => {
  const page = readFileSync(`${root}app/brand/page.tsx`, "utf8");

  it("declares each image's intrinsic size from its own viewBox", () => {
    const entries = [...page.matchAll(/file: "([\w.-]+)",[\s\S]*?intrinsic: \[(\d+), (\d+)\]/g)];
    expect(entries.length).toBe(6);
    for (const [, file, w, h] of entries) {
      const svg = readFileSync(`${root}public/brand/${file}`, "utf8");
      const viewBox = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
      expect(viewBox, `${file} has no parseable viewBox`).not.toBeNull();
      expect([w, h], `${file} intrinsic size disagrees with its viewBox`).toEqual([
        viewBox![1],
        viewBox![2],
      ]);
    }
  });
});
