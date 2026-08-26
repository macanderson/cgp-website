import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DOCS, docHref } from "@/lib/docs";
import { SITE_URL } from "@/lib/site";
import robots from "./robots";
import sitemap from "./sitemap";

/**
 * Route consistency.
 *
 * Three independent lists describe the same set of pages: the `DOCS` array
 * that renders the sidebar and pager, the `app/` directory that decides which
 * routes exist, and the hardcoded route list in `sitemap.ts`. Nothing forces
 * them to agree.
 *
 * `next build` will not catch a disagreement. A sidebar link to a route that
 * does not exist compiles perfectly and 404s in production; a page missing
 * from the sitemap builds and deploys and is simply never indexed. Both are
 * invisible until someone reports them.
 *
 * These tests are the thing that notices. They deliberately read the real
 * filesystem rather than a fixture — a fixture would drift from `app/` in
 * exactly the way being guarded against.
 */

const appDir = fileURLToPath(new URL(".", import.meta.url));
const docsDir = join(appDir, "docs");

/** Route paths that exist as directories with a page under app/docs/. */
function docsRoutesOnDisk(): string[] {
  return readdirSync(docsDir)
    .filter((entry) => statSync(join(docsDir, entry)).isDirectory())
    .filter((entry) => existsSync(join(docsDir, entry, "page.tsx")));
}

/** Every non-docs top-level route with a page.tsx, excluding not-found. */
function topLevelRoutesOnDisk(): string[] {
  return readdirSync(appDir)
    .filter((entry) => statSync(join(appDir, entry)).isDirectory())
    .filter((entry) => entry !== "docs")
    .filter((entry) => existsSync(join(appDir, entry, "page.tsx")));
}

describe("docs navigation matches the routes that exist", () => {
  it("every DOCS entry resolves to a page on disk", () => {
    // A DOCS entry with no page is a sidebar link straight to a 404.
    const missing = DOCS.filter((doc) => {
      const page = doc.slug
        ? join(docsDir, doc.slug, "page.tsx")
        : join(docsDir, "page.tsx");
      return !existsSync(page);
    }).map((doc) => doc.slug || "(index)");

    expect(missing).toEqual([]);
  });

  it("every docs page on disk is listed in DOCS", () => {
    // The reverse gap is quieter and worse: the page ships, is reachable by
    // URL, and appears in no sidebar, no pager, and no navigation anywhere.
    const listed = new Set(DOCS.map((doc) => doc.slug).filter(Boolean));
    const orphans = docsRoutesOnDisk().filter((slug) => !listed.has(slug));

    expect(orphans).toEqual([]);
  });

  it("gives every entry a unique slug and a unique ordinal", () => {
    // The ordinals are rendered as "01", "02"… beside the titles, and
    // docNeighbors indexes by slug — a duplicate of either silently breaks
    // navigation for one of the pair.
    const slugs = DOCS.map((doc) => doc.slug);
    const ordinals = DOCS.map((doc) => doc.n);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(ordinals).size).toBe(ordinals.length);
  });

  it("numbers the entries consecutively from 01 in array order", () => {
    // The array order *is* the reading order — the pager walks it. If the
    // printed ordinals disagree with it, the site tells the reader one order
    // and moves them through another.
    expect(DOCS.map((doc) => doc.n)).toEqual(
      DOCS.map((_, i) => String(i + 1).padStart(2, "0")),
    );
  });

  it("gives every entry a title and a description", () => {
    // Descriptions are page metadata; an empty one ships a blank <meta>.
    const incomplete = DOCS.filter(
      (doc) => !doc.title.trim() || !doc.description.trim(),
    );
    expect(incomplete).toEqual([]);
  });
});

describe("sitemap covers what is actually published", () => {
  const entries = sitemap();
  const paths = entries.map((entry) => entry.url.replace(SITE_URL, ""));

  it("lists every docs route", () => {
    // Adding a doc page and forgetting the sitemap costs nothing at build
    // time and costs the page its search indexing indefinitely.
    const missing = DOCS.map((doc) => docHref(doc.slug)).filter(
      (href) => !paths.includes(href),
    );
    expect(missing).toEqual([]);
  });

  it("lists every top-level route", () => {
    const missing = topLevelRoutesOnDisk()
      .map((route) => `/${route}`)
      .filter((route) => !paths.includes(route));
    expect(missing).toEqual([]);
  });

  it("lists the home page", () => {
    expect(paths).toContain("");
  });

  it("points at no route that does not exist", () => {
    // A sitemap entry for a deleted page advertises a 404 to every crawler
    // that reads it.
    const docsHrefs = new Set(DOCS.map((doc) => docHref(doc.slug)));
    const topLevel = new Set(topLevelRoutesOnDisk().map((r) => `/${r}`));

    const dangling = paths.filter(
      (path) => path !== "" && !docsHrefs.has(path) && !topLevel.has(path),
    );
    expect(dangling).toEqual([]);
  });

  it("gives every entry an absolute URL on the canonical origin", () => {
    // A relative or wrong-origin URL in a sitemap is ignored by crawlers.
    for (const entry of entries) {
      expect(entry.url.startsWith(`${SITE_URL}`)).toBe(true);
    }
  });

  it("lists each URL exactly once", () => {
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("keeps every priority within the range the spec allows", () => {
    for (const entry of entries) {
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    }
  });
});

describe("robots.txt", () => {
  const result = robots();

  it("points at the sitemap on the canonical origin", () => {
    // The sitemap is only discoverable through this line.
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it("allows crawling rather than blocking it", () => {
    // The site exists to be indexed and quoted; a stray `disallow: /` here
    // would deindex it silently and completely.
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(rule.allow).toBe("/");
      expect(rule.disallow).toBeUndefined();
    }
  });

  it("names the agent crawlers explicitly, including the wildcard", () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const agents = rules.map((rule) => rule.userAgent);
    expect(agents).toContain("*");
    expect(agents).toContain("ClaudeBot");
    expect(agents).toContain("GPTBot");
  });
});
