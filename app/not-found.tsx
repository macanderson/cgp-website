import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell" style={{ padding: "120px 24px 160px", textAlign: "center" }}>
      <span className="eyebrow">
        <span className="tick">error</span> not_found
      </span>
      <h1
        style={{
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 600,
          margin: "18px 0 14px",
          letterSpacing: "-0.014em",
        }}
      >
        No frame at this URI.
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 30 }}>
        The reference is unresolvable — and unlike a <code>reference</code>{" "}
        frame, there is no hash to verify it by.
      </p>
      <Link href="/" className="btn btn-solid">
        Back to the protocol
      </Link>
    </div>
  );
}
