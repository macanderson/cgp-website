export type DocEntry = {
  slug: string;
  n: string;
  title: string;
  description: string;
};

export const DOCS: DocEntry[] = [
  {
    slug: "",
    n: "01",
    title: "Introduction",
    description:
      "What the Context Graph Protocol is, the seven guarantees, and how it relates to MCP.",
  },
  {
    slug: "concepts",
    n: "02",
    title: "Core concepts",
    description:
      "Frames, kinds, representations, relations, token accounting, and temporal validity.",
  },
  {
    slug: "wire-protocol",
    n: "03",
    title: "Wire protocol",
    description:
      "NDJSON envelopes, the handshake lifecycle, versioning, correlation, and errors.",
  },
  {
    slug: "schema",
    n: "04",
    title: "Schema",
    description:
      "The JSON Schema, ContextFrame and ContextQuery shapes, provenance, and relations.",
  },
  {
    slug: "conformance",
    n: "05",
    title: "Conformance",
    description:
      "The seven checks, the adversarial RED suite, contextgraph-inspect, and golden fixtures.",
  },
  {
    slug: "sdks",
    n: "06",
    title: "SDKs & host",
    description:
      "TypeScript, Python, and Go provider SDKs, plus the Rust host runtime.",
  },
];

export function docHref(slug: string) {
  return slug ? `/docs/${slug}` : "/docs";
}

export function docNeighbors(slug: string) {
  const i = DOCS.findIndex((d) => d.slug === slug);
  return {
    prev: i > 0 ? DOCS[i - 1] : null,
    next: i >= 0 && i < DOCS.length - 1 ? DOCS[i + 1] : null,
  };
}
