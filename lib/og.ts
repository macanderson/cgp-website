import cards from "@/lib/og-cards.json";

/**
 * The social cards, defined once in `og-cards.json`.
 *
 * Both readers of that file are load-bearing and neither can be dropped: the
 * `metadata` export of every page points at a card, and
 * `scripts/gen-og.mjs` draws the PNG each one names. It is JSON rather than
 * TypeScript because the generator is a plain Node script — a `.ts` module
 * would need a transpile step to be shared, and a second copy of the card
 * text is exactly the drift `lib/og.test.ts` exists to catch.
 *
 * Before this there was one card, `og-home.png`, and `/docs/*`, `/research`
 * and `/brand` all fell back to it. Sharing the whitepaper showed the
 * homepage (issue #5).
 */
export type OgCard = {
  /** Route this card belongs to, spelled exactly as the sitemap spells it. */
  route: string;
  /** File under `public/og/`. */
  file: string;
  /** Small-caps label, top left. */
  eyebrow: string;
  /** Mono label, top right — the section's own identifier. */
  marker: string;
  /** Title lines. Lines, not a string, because the card does not wrap text. */
  title: string[];
  /**
   * A word inside `title` drawn italic in carmine, the way the site draws its
   * own headings. Matched literally against one of the lines.
   */
  accent?: string;
  subtitle: string;
};

export const OG_CARDS: OgCard[] = cards;

const BY_ROUTE = new Map(OG_CARDS.map((card) => [card.route, card]));

export function ogCard(route: string): OgCard {
  const card = BY_ROUTE.get(route);
  if (!card) throw new Error(`no social card defined for ${route}`);
  return card;
}

/**
 * The `openGraph`/`twitter` image fragment for one route, ready to spread into
 * that page's exported `metadata`.
 *
 * Both keys are set together deliberately: X reads `twitter:image` and ignores
 * `og:image` for a `summary_large_image` card, so setting only the OpenGraph
 * one leaves that network still showing the homepage.
 */
export function ogImages(route: string) {
  const card = ogCard(route);
  const image = `/og/${card.file}`;
  const alt = `${card.title.join(" ")} — Context Graph Protocol`;
  return {
    openGraph: {
      // `type` and `siteName` are restated, not inherited. Next merges
      // metadata one top-level key deep: a page that declares `openGraph` at
      // all replaces the layout's whole object, so omitting these drops
      // `og:type` and `og:site_name` from that page's head -- verified
      // against the built HTML, where /research lost both the moment it
      // declared an image and /brand still had them.
      type: "website" as const,
      siteName: "Context Graph Protocol",
      // The page's own URL rather than the site root, so a shared docs page
      // does not tell a crawler it is the homepage.
      url: route,
      images: [{ url: image, width: 1200, height: 630, alt }],
    },
    twitter: { card: "summary_large_image" as const, images: [image] },
  };
}
