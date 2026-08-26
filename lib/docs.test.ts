import { describe, expect, it } from "vitest";
import { DOCS, docHref, docNeighbors } from "./docs";

/**
 * The pure navigation logic behind the docs pager.
 *
 * Both functions are small enough to look obviously correct and are exactly
 * where off-by-one and empty-string bugs live: the index page's slug is `""`,
 * which is falsy, so every branch that tests a slug for truthiness has to be
 * deliberate about it.
 */

describe("docHref", () => {
  it("maps the index entry's empty slug to /docs, not /docs/", () => {
    // `trailingSlash: false` in next.config.ts means `/docs/` and `/docs` are
    // different URLs, and only the second one is exported.
    expect(docHref("")).toBe("/docs");
  });

  it("nests every other slug under /docs", () => {
    expect(docHref("concepts")).toBe("/docs/concepts");
  });

  it("produces a resolvable href for every entry in DOCS", () => {
    for (const doc of DOCS) {
      const href = docHref(doc.slug);
      expect(href.startsWith("/docs")).toBe(true);
      expect(href.endsWith("/")).toBe(false);
    }
  });
});

describe("docNeighbors", () => {
  const first = DOCS[0];
  const last = DOCS[DOCS.length - 1];

  it("gives the first entry no previous page", () => {
    // The index's slug is "", so an implementation testing `if (slug)` before
    // looking it up would report it as unknown and hide its next link too.
    const { prev, next } = docNeighbors(first.slug);
    expect(prev).toBeNull();
    expect(next).toEqual(DOCS[1]);
  });

  it("gives the last entry no next page", () => {
    const { prev, next } = docNeighbors(last.slug);
    expect(prev).toEqual(DOCS[DOCS.length - 2]);
    expect(next).toBeNull();
  });

  it("links a middle entry in both directions", () => {
    const middle = DOCS[2];
    const { prev, next } = docNeighbors(middle.slug);
    expect(prev).toEqual(DOCS[1]);
    expect(next).toEqual(DOCS[3]);
  });

  it("reports no neighbours for a slug that is not in DOCS", () => {
    // findIndex returns -1; without the `i >= 0` guard that reads as "before
    // the first entry" and would hand an unknown page a next link to DOCS[0].
    expect(docNeighbors("does-not-exist")).toEqual({ prev: null, next: null });
  });

  it("chains every entry into one path from first to last", () => {
    // Walking `next` from the first entry must visit all of them in order —
    // the property the pager actually depends on.
    const walked = [first];
    let cursor = docNeighbors(first.slug).next;
    while (cursor) {
      walked.push(cursor);
      cursor = docNeighbors(cursor.slug).next;
    }
    expect(walked).toEqual(DOCS);
  });

  it("makes prev and next mutually consistent", () => {
    // If A.next is B then B.prev must be A. A hand-maintained pager can
    // satisfy one direction and not the other.
    for (const doc of DOCS) {
      const { next } = docNeighbors(doc.slug);
      if (next) expect(docNeighbors(next.slug).prev).toEqual(doc);
    }
  });
});
