/**
 * The Context Graph Protocol mark: a minimal typed graph held between two
 * brackets — context, framed. The hub node carries the accent; one leaf is
 * filled (a frame carrying content) and one is open (a content-optional
 * frame), mirroring the spec's content-optional rule.
 *
 * Inline version themes itself via currentColor + --accent. Standalone
 * light/dark SVG assets live in /public/brand.
 */
export function Mark({ size = 28, title }: { size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={(size * 64) / 72}
      viewBox="0 0 72 64"
      fill="none"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M19 11H9v42h10"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="square"
      />
      <path
        d="M53 11h10v42H53"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="square"
      />
      <path d="M28 42 45 21" stroke="currentColor" strokeWidth={2.4} />
      <path d="M28 42h18" stroke="currentColor" strokeWidth={2.4} />
      <circle cx={28} cy={42} r={5.2} fill="var(--accent, #B42332)" />
      <circle cx={45} cy={21} r={4.2} fill="currentColor" />
      <circle
        cx={46}
        cy={42}
        r={4}
        fill="var(--paper, #FBFBF9)"
        stroke="currentColor"
        strokeWidth={2.4}
      />
    </svg>
  );
}

export function BrandLockup() {
  return (
    <span className="brand-link-inner" style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <Mark size={30} />
      <span className="brand-words">Context Graph Protocol</span>
    </span>
  );
}
