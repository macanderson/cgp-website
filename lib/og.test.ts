import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { DOCS, docHref } from "@/lib/docs";
import { OG_CARDS, ogImages } from "@/lib/og";
import { SITE_URL } from "@/lib/site";

/**
 * Social card consistency, in the spirit of `app/routes.test.ts`.
 *
 * The cards are a fourth list describing the same set of pages, and it is the
 * one list nobody looks at: a wrong card is invisible on the site itself and
 * only shows up in someone else's timeline, after the link is already shared.
 * Issue #5 existed because eight routes silently shared the homepage's card.
 *
 * `og-cards.json` also restates the docs titles and descriptions, because the
 * generator is a plain Node script and cannot import `lib/docs.ts`. That
 * restatement is a drift risk taken deliberately, and this is where it is
 * paid for.
 */

const root = fileURLToPath(new URL("..", import.meta.url));
const routes = sitemap().map((entry) => entry.url.replace(SITE_URL, "") || "/");

describe("every page has its own card", () => {
  it("covers every route in the sitemap", () => {
    const carded = new Set(OG_CARDS.map((card) => card.route));
    expect(routes.filter((route) => !carded.has(route))).toEqual([]);
  });

  it("defines no card for a route that does not exist", () => {
    // A card nobody references is dead weight the build still draws, and a
    // typo'd route is indistinguishable from one.
    const known = new Set(routes);
    expect(OG_CARDS.filter((card) => !known.has(card.route)).map((c) => c.route)).toEqual([]);
  });

  it("gives each card its own file", () => {
    // Two routes sharing a filename is the exact defect #5 reported, just
    // spelled differently.
    const files = OG_CARDS.map((card) => card.file);
    expect(new Set(files).size).toBe(files.length);
  });
});

describe("the docs cards say what the docs pages say", () => {
  it.each(DOCS)("$title matches its card", (doc) => {
    const card = OG_CARDS.find((c) => c.route === docHref(doc.slug));
    expect(card, `no card for ${docHref(doc.slug)}`).toBeDefined();
    expect(card!.title).toEqual([doc.title]);
    expect(card!.subtitle).toBe(doc.description);
    // The eyebrow carries the section ordinal the sidebar renders, so a
    // reordered DOCS array must not leave the cards numbering the old order.
    expect(card!.eyebrow).toBe(`Specification · ${doc.n}`);
  });
});

describe("card copy is drawable", () => {
  it.each(OG_CARDS.filter((card) => card.accent))(
    "$file highlights a word that is actually in its title",
    (card) => {
      // The generator matches the accent literally against each title line.
      // A stale accent does not throw -- it just quietly draws nothing in
      // carmine, and the card loses the one thing that makes it ours.
      expect(card.title.some((line) => line.includes(card.accent!))).toBe(true);
    },
  );

  it.each(OG_CARDS)("$file states a non-empty eyebrow, marker and subtitle", (card) => {
    expect(card.eyebrow.length).toBeGreaterThan(0);
    expect(card.marker.length).toBeGreaterThan(0);
    expect(card.subtitle.length).toBeGreaterThan(0);
    expect(card.title.join("").length).toBeGreaterThan(0);
  });
});

describe("every page asks for its own card", () => {
  // The registry being right is half of it. A page that never calls
  // `ogImages` inherits the layout's card and the registry entry sits unused,
  // which is what the site did before this change.
  const pageFor = (route: string) =>
    route === "/" ? "app/page.tsx" : `app${route}/page.tsx`;

  it.each(routes)("%s", (route) => {
    const source = readFileSync(`${root}${pageFor(route)}`, "utf8");
    expect(source).toContain(`ogImages("${route}")`);
  });
});

describe("the metadata fragment carries what a page loses by declaring it", () => {
  // Next merges metadata one top-level key deep: the moment a page declares
  // `openGraph`, the layout's whole object is replaced. Verified against the
  // built HTML -- /research lost og:type and og:site_name while /brand, which
  // declared nothing, kept both.
  const meta = ogImages("/research");

  it("restates type and siteName", () => {
    expect(meta.openGraph.type).toBe("website");
    expect(meta.openGraph.siteName).toBe("Context Graph Protocol");
  });

  it("points og:url at the page, not the site root", () => {
    expect(meta.openGraph.url).toBe("/research");
  });

  it("sets the twitter image too, not only the OpenGraph one", () => {
    // X reads twitter:image for a summary_large_image card and ignores
    // og:image, so setting only the latter leaves that network on the
    // homepage card.
    expect(meta.twitter.images).toEqual(["/og/og-research.png"]);
    expect(meta.twitter.card).toBe("summary_large_image");
  });
});
