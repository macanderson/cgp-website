import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand",
  description:
    "The Context Graph Protocol identity: the bracket-graph mark, horizontal and vertical lockups in light and dark, palette, and typography.",
  alternates: { canonical: "/brand" },
};

/* eslint-disable @next/next/no-img-element */

const LOCKUPS = [
  {
    file: "cgp-lockup-horizontal-light.svg",
    label: "Horizontal · light",
    stage: "on-light",
    width: 420,
  },
  {
    file: "cgp-lockup-horizontal-dark.svg",
    label: "Horizontal · dark",
    stage: "on-dark",
    width: 420,
  },
  {
    file: "cgp-lockup-vertical-light.svg",
    label: "Vertical · light",
    stage: "on-light",
    width: 210,
  },
  {
    file: "cgp-lockup-vertical-dark.svg",
    label: "Vertical · dark",
    stage: "on-dark",
    width: 210,
  },
  {
    file: "cgp-mark-light.svg",
    label: "Mark · light",
    stage: "on-light",
    width: 96,
  },
  {
    file: "cgp-mark-dark.svg",
    label: "Mark · dark",
    stage: "on-dark",
    width: 96,
  },
] as const;

const PALETTE = [
  { name: "Paper", hex: "#FBFBF9", note: "Background, light" },
  { name: "Ink", hex: "#16191C", note: "Type & structure" },
  { name: "Carmine", hex: "#B42332", note: "Annotation accent" },
  { name: "Carmine (dark)", hex: "#E4606B", note: "Accent on dark" },
  { name: "Slate", hex: "#57616B", note: "Secondary text" },
];

export default function Brand() {
  return (
    <div className="shell" style={{ padding: "56px 24px 96px" }}>
      <div style={{ maxWidth: 720 }}>
        <span className="eyebrow">
          <span className="tick">§</span> Identity
        </span>
        <h1
          style={{
            fontSize: "clamp(1.9rem, 3.4vw, 2.5rem)",
            fontWeight: 600,
            letterSpacing: "-0.014em",
            margin: "14px 0 18px",
          }}
        >
          Context, framed
        </h1>
        <p className="lede" style={{ color: "var(--muted)", marginBottom: 12 }}>
          The mark is the protocol in miniature: a typed graph held between
          two brackets. The hub node carries the accent; one leaf is filled —
          a frame carrying content — and one is open, a{" "}
          <code
            style={{
              fontSize: "0.85em",
              background: "var(--code-bg)",
              border: "1px solid var(--rule)",
              borderRadius: 2,
              padding: "0.08em 0.35em",
            }}
          >
            reference
          </code>{" "}
          frame that travels by hash. The wordmark is STIX Two Text SemiBold,
          the serif of scientific publishing, cut to outlines.
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: 40 }}>
          All assets are SVG, dedicated light and dark variants, free to use
          when referring to the protocol.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 64,
        }}
      >
        {LOCKUPS.map((l) => (
          <div className="lockup-tile" key={l.file}>
            <div className={`lockup-stage ${l.stage}`}>
              <img
                src={`/brand/${l.file}`}
                alt={`Context Graph Protocol lockup — ${l.label}`}
                style={{ width: "100%", maxWidth: l.width, height: "auto" }}
              />
            </div>
            <div className="lockup-meta">
              <span>{l.label}</span>
              <a href={`/brand/${l.file}`} download>
                Download SVG
              </a>
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 720, marginBottom: 28 }}>
        <span className="eyebrow">
          <span className="tick">§</span> Palette
        </span>
      </div>
      <div className="swatch-row" style={{ marginBottom: 64 }}>
        {PALETTE.map((c) => (
          <div className="swatch" key={c.name}>
            <div
              className="chip"
              style={{
                background: c.hex,
                borderBottom: "1px solid var(--rule)",
              }}
            />
            <div className="label">
              <strong>{c.name}</strong>
              {c.hex} · {c.note}
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 720 }}>
        <span className="eyebrow">
          <span className="tick">§</span> Usage
        </span>
        <ul
          style={{
            margin: "16px 0 0 1.3em",
            color: "var(--muted)",
            fontSize: "0.95rem",
            lineHeight: 1.7,
          }}
        >
          <li>Use the light lockups on paper backgrounds, dark on ink — never recolor the accent node.</li>
          <li>Keep clear space around the mark of at least the bracket width.</li>
          <li>The mark stands alone at small sizes; prefer a lockup at 24 px of height or more.</li>
          <li>Do not enclose the mark in an additional container, and do not set the wordmark in another face.</li>
        </ul>
      </div>
    </div>
  );
}
