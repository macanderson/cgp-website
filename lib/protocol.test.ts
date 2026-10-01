import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import cards from "@/lib/og-cards.json";
import { PROTOCOL_VERSION } from "@/lib/protocol";

/**
 * The site names the current protocol revision.
 *
 * The protocol froze at `contextgraph/1.0` on 2026-08-11, and for seven weeks
 * afterwards this site still told every reader, and every agent reading
 * `llms.txt`, that the current revision was `contextgraph/1.0-draft` (issue
 * #53). Nothing failed: the draft name still parses and still interoperates,
 * so a stale page builds, deploys, and reads as correct to anyone who does
 * not already know the freeze happened.
 *
 * The pre-freeze name may still appear, because the versioning rules need it
 * as an example. What this suite refuses is the draft presented as current: a
 * handshake that sends it, a sentence that calls it current, or any sentence
 * that names it without saying it predates the freeze.
 *
 * It reads the real pages and static files, in the spirit of
 * `app/routes.test.ts`, because the static files cannot import
 * `lib/protocol.ts` and are exactly where a copy goes stale.
 */

const root = fileURLToPath(new URL("..", import.meta.url));

function pagesUnder(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...pagesUnder(path));
    else if (entry === "page.tsx") found.push(path);
  }
  return found;
}

const read = (path: string) => ({
  name: relative(root, path),
  source: readFileSync(path, "utf8"),
});

const PAGES = pagesUnder(join(root, "app")).map(read);
const LLMS = ["public/llms.txt", "public/llms-full.txt"].map((p) => read(join(root, p)));
const FILES = [...PAGES, ...LLMS];

const DRAFT = "1.0-draft";

/**
 * Running text with JSX tags, `{" "}` spacers, and HTML entities removed and
 * whitespace collapsed, so a sentence that JSX wraps across lines or splits
 * around a `<code>` tag reads as one sentence.
 */
function prose(source: string): string {
  return source
    .replace(/\{"\s*"\}/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ");
}

function sentencesNamingTheDraft(source: string): string[] {
  return prose(source)
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.includes(DRAFT));
}

describe("the pages and llms files present the current revision", () => {
  it("has files to check", () => {
    // An empty list would pass every test below.
    expect(PAGES.length).toBeGreaterThan(5);
    expect(LLMS.every((file) => file.source.length > 0)).toBe(true);
  });

  it.each(FILES)("$name sends no handshake at the draft version", ({ source }) => {
    expect(source).not.toMatch(/"protocol_version"\s*:\s*"contextgraph\/1\.0-draft"/);
  });

  it.each(PAGES)("$name reads every handshake version from PROTOCOL_VERSION", ({ source }) => {
    // A copied literal is how the handshakes on the home page and the wire
    // protocol page kept saying `1.0-draft` after the freeze.
    const copied = source.match(/"protocol_version"\s*:\s*"(?!\$\{PROTOCOL_VERSION\}")[^"]*"/g);
    expect(copied ?? []).toEqual([]);
  });

  it.each(FILES)("$name never calls the draft current", ({ source }) => {
    const current = sentencesNamingTheDraft(source).filter((s) => /\bcurrent\b/i.test(s));
    expect(current).toEqual([]);
  });

  it.each(FILES)("$name names the draft only as the pre-freeze name", ({ source }) => {
    // Every sentence that spells out `1.0-draft` also says it predates the
    // freeze. A bare mention, like a hero eyebrow or a table caption, reads
    // as the current revision whatever the page says elsewhere.
    const bare = sentencesNamingTheDraft(source).filter((s) => !/freeze/i.test(s));
    expect(bare).toEqual([]);
  });
});

describe("the static files quote the shared version", () => {
  // The version followed by anything that would make it a different one:
  // `contextgraph/1.0-draft`, `contextgraph/1.0.1`, `contextgraph/1.01`.
  const exact = PROTOCOL_VERSION.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const currentRevision = new RegExp(`Current revision: ${exact}(?![-\\w]|\\.\\d)`);

  it.each(LLMS)("$name states the current revision", ({ source }) => {
    expect(source).toMatch(currentRevision);
  });

  it("marks every specification card with the current revision", () => {
    // The social cards for the home page and the docs carry the revision as
    // their marker. They are drawn from JSON at build time, so they cannot
    // import the constant, and a stale marker shows up only in someone
    // else's timeline.
    const stale = cards
      .filter((card) => card.route === "/" || card.route.startsWith("/docs"))
      .filter((card) => card.marker !== PROTOCOL_VERSION)
      .map((card) => `${card.route}: ${card.marker}`);
    expect(stale).toEqual([]);
  });
});
