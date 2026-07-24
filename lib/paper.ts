export const PAPER = {
  title:
    "The Context Graph Protocol: Typed, Budgeted, Provenance-Carrying Context Retrieval for LLM Agents",
  number: "CGP-TR-2026-01",
  date: "July 2026",
  datePublished: "2026-07-23",
  authors: "Mac Anderson · Context Graph Protocol contributors",
  abstract: `Large-language-model agents assemble their working context from retrieval pipelines that return opaque strings: nothing states where a passage came from, what it costs against the context window, whether it is still true, or how to cite it. We present the Context Graph Protocol (CGP), an open wire protocol that replaces the blob with a typed unit of exchange — the frame — carrying kind, relevance, canonical token cost, provenance, temporal validity, and a citation label. Frames relate to one another through labelled edges, making context a graph a host can traverse by anchor proximity. The protocol defines an eight-envelope NDJSON binding over stdio and streamable HTTP, an explicit capability handshake, a deterministic budget-accounting rule that renders budget honesty machine-checkable, a consent model for data egress, and three content representations that let large context travel by hash without sacrificing verifiability. Conformance is falsifiable by construction: a seven-check suite is validated against fourteen single-fault misbehaviour modes, and four independent implementations — Rust, TypeScript, Python, and Go — pass the same oracle. We argue that deterministic, canonical-order composition converts provider prompt caches from an accident into a contract, with a worked example showing a ~7× reduction in context tokens over a twenty-turn session.`,
};

export const BIBTEX = `@techreport{anderson2026contextgraph,
  title       = {The Context Graph Protocol: Typed, Budgeted,
                 Provenance-Carrying Context Retrieval for LLM Agents},
  author      = {Anderson, Mac and {Context Graph Protocol contributors}},
  institution = {Context Graph Protocol Project},
  number      = {CGP-TR-2026-01},
  year        = {2026},
  month       = {7},
  url         = {https://contextgraphprotocol.org/research}
}`;
