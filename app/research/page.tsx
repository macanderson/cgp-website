import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { PAPER, BIBTEX } from "@/lib/paper";
import { PAPER_PATH, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Technical report CGP-TR-2026-01: the full argument for typed, budgeted, provenance-carrying context retrieval. Abstract, downloadable PDF, and citation.",
  alternates: { canonical: "/research" },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  headline: PAPER.title,
  name: PAPER.title,
  author: [
    { "@type": "Person", name: "Mac Anderson" },
    { "@type": "Organization", name: "Context Graph Protocol contributors" },
  ],
  datePublished: PAPER.datePublished,
  publisher: { "@type": "Organization", name: "Context Graph Protocol Project" },
  abstract: PAPER.abstract,
  url: `${SITE_URL}/research`,
  encoding: {
    "@type": "MediaObject",
    contentUrl: `${SITE_URL}${PAPER_PATH}`,
    encodingFormat: "application/pdf",
  },
  about: ["Context Graph Protocol", "LLM agents", "context retrieval"],
};

export default function Research() {
  return (
    <div className="shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="docs-grid" style={{ gridTemplateColumns: "minmax(0,1fr) 300px" }}>
        <article className="docs-article prose" style={{ maxWidth: 720 }}>
          <span className="eyebrow">
            <span className="tick">§</span> Technical report · {PAPER.number}
          </span>
          <h1>{PAPER.title}</h1>
          <p className="lede">{PAPER.authors} · {PAPER.date}</p>

          <h2 style={{ borderTop: "none", paddingTop: 0 }}>Abstract</h2>
          <p style={{ textAlign: "justify" }}>{PAPER.abstract}</p>

          <h2>Contents</h2>
          <ol>
            <li>Introduction: the blob-pipe problem</li>
            <li>Design principles</li>
            <li>The frame model</li>
            <li>The wire protocol</li>
            <li>Budget honesty</li>
            <li>Consent and data flow</li>
            <li>Deterministic composition and context reuse</li>
            <li>Conformance as falsification</li>
            <li>Related work</li>
            <li>Status and governance</li>
          </ol>

          <h2>Cite this report</h2>
          <CodeBlock title="@techreport" lang="bibtex" code={BIBTEX} />
        </article>
        <aside>
          <div className="paper-card" style={{ position: "sticky", top: 96 }}>
            <span className="k">Report</span>
            <span className="v">{PAPER.number}</span>
            <span className="k">Published</span>
            <span className="v">{PAPER.date}</span>
            <span className="k">Format</span>
            <span className="v">PDF · typeset in STIX Two Text</span>
            <span className="k">License</span>
            <span className="v">CC BY 4.0</span>
            <a href={PAPER_PATH} className="btn btn-solid" download>
              Download PDF
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
