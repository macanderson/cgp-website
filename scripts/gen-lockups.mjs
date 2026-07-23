/**
 * Generates the Context Graph Protocol brand assets in /public/brand:
 * mark, horizontal lockup, vertical lockup — each in light + dark.
 * Wordmark is STIX Two Text SemiBold (wght 600) converted to outlines,
 * so the assets render identically everywhere.
 *
 * Run: node scripts/gen-lockups.mjs
 */
import * as fontkit from "fontkit";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "brand");
mkdirSync(OUT, { recursive: true });

const base = fontkit.openSync(
  "/System/Library/Fonts/Supplemental/STIXTwoText.ttf",
);
const font = base.getVariation({ wght: 600 });
const UPM = font.unitsPerEm;
const CAP = font.capHeight / UPM;

const COLORS = {
  light: { ink: "#16191C", accent: "#B42332" },
  dark: { ink: "#E9EAE5", accent: "#E4606B" },
};

const r2 = (n) => Math.round(n * 100) / 100;

function glyphPathToSVG(path, s, dx, dy) {
  let d = "";
  for (const c of path.commands) {
    const a = c.args;
    switch (c.command) {
      case "moveTo":
        d += `M${r2(dx + a[0] * s)} ${r2(dy - a[1] * s)}`;
        break;
      case "lineTo":
        d += `L${r2(dx + a[0] * s)} ${r2(dy - a[1] * s)}`;
        break;
      case "quadraticCurveTo":
        d += `Q${r2(dx + a[0] * s)} ${r2(dy - a[1] * s)} ${r2(dx + a[2] * s)} ${r2(dy - a[3] * s)}`;
        break;
      case "bezierCurveTo":
        d += `C${r2(dx + a[0] * s)} ${r2(dy - a[1] * s)} ${r2(dx + a[2] * s)} ${r2(dy - a[3] * s)} ${r2(dx + a[4] * s)} ${r2(dy - a[5] * s)}`;
        break;
      case "closePath":
        d += "Z";
        break;
    }
  }
  return d;
}

function textPath(str, size, x0, baseline, tracking = 0) {
  const run = font.layout(str);
  const s = size / UPM;
  let x = x0;
  let d = "";
  for (let i = 0; i < run.glyphs.length; i++) {
    const g = run.glyphs[i];
    const pos = run.positions[i];
    d += glyphPathToSVG(
      g.path,
      s,
      x + pos.xOffset * s,
      baseline - pos.yOffset * s,
    );
    x += pos.xAdvance * s + tracking;
  }
  return { d, width: x - x0 - tracking };
}

function textWidth(str, size, tracking = 0) {
  const run = font.layout(str);
  const s = size / UPM;
  let w = 0;
  for (const pos of run.positions) w += pos.xAdvance * s + tracking;
  return w - tracking;
}

/** The mark: a typed graph held between two brackets. Art box: 72 x 64. */
function markGroup(x, y, h, { ink, accent }) {
  const s = h / 64;
  const t = (n) => r2(n * s);
  const X = (n) => r2(x + n * s);
  const Y = (n) => r2(y + n * s);
  return `<g>
    <path d="M${X(19)} ${Y(11)}H${X(9)}V${Y(53)}H${X(19)}" stroke="${ink}" stroke-width="${t(3.2)}" stroke-linecap="square" fill="none"/>
    <path d="M${X(53)} ${Y(11)}H${X(63)}V${Y(53)}H${X(53)}" stroke="${ink}" stroke-width="${t(3.2)}" stroke-linecap="square" fill="none"/>
    <path d="M${X(28)} ${Y(42)}L${X(43.2)} ${Y(23.2)}" stroke="${ink}" stroke-width="${t(2.4)}" fill="none"/>
    <path d="M${X(28)} ${Y(42)}H${X(40)}" stroke="${ink}" stroke-width="${t(2.4)}" fill="none"/>
    <circle cx="${X(28)}" cy="${Y(42)}" r="${t(5.2)}" fill="${accent}"/>
    <circle cx="${X(45)}" cy="${Y(21)}" r="${t(4.2)}" fill="${ink}"/>
    <circle cx="${X(46)}" cy="${Y(42)}" r="${t(4)}" fill="none" stroke="${ink}" stroke-width="${t(2.4)}"/>
  </g>`;
}

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">\n${body}\n</svg>\n`;
}

// ---- mark only (144 x 128 = 2x art box) ----
for (const [mode, c] of Object.entries(COLORS)) {
  writeFileSync(
    join(OUT, `cgp-mark-${mode}.svg`),
    svg(144, 128, markGroup(0, 0, 128, c)),
  );
}

// ---- horizontal lockup ----
{
  const TEXT = "Context Graph Protocol";
  const SIZE = 44;
  const markH = 47;
  const pad = 10;
  const gap = 20;
  const capPx = SIZE * CAP;
  const H = markH + pad * 2;
  const baseline = H / 2 + capPx / 2;
  const markW = markH * (72 / 64);
  const tw = textWidth(TEXT, SIZE);
  const W = Math.ceil(pad + markW + gap + tw + pad);
  for (const [mode, c] of Object.entries(COLORS)) {
    const { d } = textPath(TEXT, SIZE, pad + markW + gap, baseline);
    const body =
      markGroup(pad, pad, markH, c) + `\n  <path d="${d}" fill="${c.ink}"/>`;
    writeFileSync(join(OUT, `cgp-lockup-horizontal-${mode}.svg`), svg(W, H, body));
  }
  console.log("horizontal:", W, "x", H);
}

// ---- vertical lockup ----
{
  const L1 = "Context Graph";
  const L2 = "Protocol";
  const SIZE = 40;
  const markH = 72;
  const pad = 18;
  const lineGap = SIZE * 1.3;
  const w1 = textWidth(L1, SIZE);
  const w2 = textWidth(L2, SIZE);
  const W = Math.ceil(Math.max(w1, w2) + pad * 2);
  const markTop = pad;
  const b1 = markTop + markH + 26 + SIZE * CAP;
  const b2 = b1 + lineGap;
  const H = Math.ceil(b2 + SIZE * 0.28 + pad);
  const markW = markH * (72 / 64);
  for (const [mode, c] of Object.entries(COLORS)) {
    const p1 = textPath(L1, SIZE, (W - w1) / 2, b1);
    const p2 = textPath(L2, SIZE, (W - w2) / 2, b2);
    const body =
      markGroup((W - markW) / 2, markTop, markH, c) +
      `\n  <path d="${p1.d}" fill="${c.ink}"/>` +
      `\n  <path d="${p2.d}" fill="${c.ink}"/>`;
    writeFileSync(join(OUT, `cgp-lockup-vertical-${mode}.svg`), svg(W, H, body));
  }
  console.log("vertical done");
}

console.log("brand assets written to", OUT);
