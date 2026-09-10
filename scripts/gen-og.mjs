/**
 * Draws one social card per entry in `lib/og-cards.json` into `public/og/`.
 *
 * Runs as `prebuild` and `predev`, so the cards are always the current copy
 * rather than whatever someone last exported by hand. The previous card was
 * a Chrome screenshot of `paper/og.html`, which meant a macOS machine with
 * Chrome was the only way to change one — and so nobody did, and eight routes
 * shared the homepage's card for months.
 *
 * The fonts are vendored under `assets/fonts/` rather than fetched. Both are
 * SIL OFL, the build stays hermetic, and a Google Fonts outage cannot turn
 * the site's social cards into Times New Roman without anybody noticing.
 *
 * Satori (behind `next/og`) supports a subset of CSS: flexbox only, no
 * `position: absolute` beyond the basics, and **every element with more than
 * one child needs an explicit `display: flex`**. A missing one throws at
 * render rather than laying out badly, which is the good failure mode.
 */
import { createElement as h } from "react";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
// `next/og.js`, not `next/og`: the package publishes no `exports` map, so
// Node's ESM resolver reads the bare specifier as a directory and fails. The
// app's own files may write `next/og` because webpack resolves it for them.
import { ImageResponse } from "next/og.js";

import cards from "../lib/og-cards.json" with { type: "json" };

const root = fileURLToPath(new URL("..", import.meta.url));

const PAPER = "#FBFBF9";
const INK = "#16191C";
const MUTED = "#57616B";
const CARMINE = "#B42332";
// The site's own --faint, at the value issue #7 raised it to. The card is
// read at a glance in a timeline, so it inherits the same floor.
const FAINT = "#666F77";

const SERIF = "STIX Two Text";
const MONO = "IBM Plex Mono";

/** The bracket-graph mark, as an inline data URI so satori draws it as one image. */
const MARK = (color, opacity = 1) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 64" fill="none" opacity="${opacity}">` +
      `<path d="M19 11H9v42h10" stroke="${color}" stroke-width="3.2" stroke-linecap="square"/>` +
      `<path d="M53 11h10v42H53" stroke="${color}" stroke-width="3.2" stroke-linecap="square"/>` +
      `<path d="M28 42 43.2 23.2" stroke="${color}" stroke-width="2.4"/>` +
      `<path d="M28 42h12" stroke="${color}" stroke-width="2.4"/>` +
      `<circle cx="28" cy="42" r="5.2" fill="${CARMINE}"/>` +
      `<circle cx="45" cy="21" r="4.2" fill="${color}"/>` +
      `<circle cx="46" cy="42" r="4" fill="none" stroke="${color}" stroke-width="2.4"/>` +
      `</svg>`,
  )}`;

/**
 * One title line, with the accent word lifted into an italic carmine span.
 *
 * Split rather than styled in place because satori has no rich text: the only
 * way to colour part of a line is to make that part its own element.
 */
function titleLine(line, accent, key) {
  const at = accent ? line.indexOf(accent) : -1;
  const parts =
    at === -1
      ? [[line, false]]
      : [
          [line.slice(0, at), false],
          [accent, true],
          [line.slice(at + accent.length), false],
        ];
  return h(
    "div",
    { key, style: { display: "flex" } },
    ...parts
      .filter(([text]) => text.length > 0)
      .map(([text, isAccent], i) =>
        h(
          "span",
          {
            key: i,
            // `pre` because the split puts the space before the accent word at
            // the end of its own span, and a flex child collapses trailing
            // whitespace -- which reads as "Context asevidence".
            style: isAccent
              ? // Weight 400, matching the italic face actually registered
                // below. Ask satori for a weight it has no face for and it
                // silently substitutes the upright one, so the word comes out
                // carmine but not italic -- right colour, wrong voice.
                { color: CARMINE, fontStyle: "italic", fontWeight: 400, whiteSpace: "pre" }
              : { whiteSpace: "pre" },
          },
          text,
        ),
      ),
  );
}

function card(entry) {
  // Long titles get a smaller face rather than an overflowing line; the card
  // is a fixed 1200x630 and satori will happily draw past the edge.
  const longest = Math.max(...entry.title.map((l) => l.length));
  const titleSize = longest > 26 ? 68 : longest > 16 ? 78 : 88;

  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: PAPER,
        color: INK,
        fontFamily: SERIF,
        padding: "56px 72px 48px",
      },
    },
    // Top rule: section on the left, its identifier on the right.
    h(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: MUTED,
          borderBottom: `2px solid ${INK}`,
          paddingBottom: 18,
        },
      },
      h("span", {}, entry.eyebrow),
      h("span", { style: { color: CARMINE, fontWeight: 600 } }, entry.marker),
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          marginTop: 56,
          fontSize: titleSize,
          fontWeight: 600,
          lineHeight: 1.06,
          letterSpacing: "-0.015em",
        },
      },
      ...entry.title.map((line, i) => titleLine(line, entry.accent, i)),
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          marginTop: 26,
          fontSize: 26,
          lineHeight: 1.5,
          color: MUTED,
          maxWidth: 820,
        },
      },
      entry.subtitle,
    ),
    // `marginTop: auto` pins the footer to the bottom whatever the title height.
    h(
      "div",
      {
        style: {
          display: "flex",
          marginTop: "auto",
          justifyContent: "space-between",
          alignItems: "flex-end",
        },
      },
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 18 } },
        h("img", { src: MARK(INK), width: 54, height: 48 }),
        h("span", { style: { fontSize: 30, fontWeight: 600 } }, "Context Graph Protocol"),
      ),
      h(
        "span",
        { style: { fontFamily: MONO, fontSize: 17, color: FAINT } },
        "contextgraphprotocol.org",
      ),
    ),
  );
}

const fonts = await Promise.all(
  [
    ["stix-two-text-600.ttf", SERIF, 600, "normal"],
    // The upright 400 is not decorative: without it the only face registered
    // at weight 400 is the italic, and satori quietly serves that for the
    // subtitle -- which then sets in italic while looking, in the diff, like
    // nothing was asked for at all.
    ["stix-two-text-400.ttf", SERIF, 400, "normal"],
    ["stix-two-text-400-italic.ttf", SERIF, 400, "italic"],
    ["ibm-plex-mono-500.ttf", MONO, 500, "normal"],
  ].map(async ([file, name, weight, style]) => ({
    name,
    weight,
    style,
    data: await readFile(`${root}assets/fonts/${file}`),
  })),
);

await mkdir(`${root}public/og`, { recursive: true });

for (const entry of cards) {
  const response = new ImageResponse(card(entry), { width: 1200, height: 630, fonts });
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(`${root}public/og/${entry.file}`, bytes);
  console.log(`og: ${entry.file} (${(bytes.length / 1024).toFixed(0)} kB) — ${entry.route}`);
}
