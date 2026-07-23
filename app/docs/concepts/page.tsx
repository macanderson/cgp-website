import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { DocsPager } from "@/components/DocsPager";

export const metadata: Metadata = {
  title: "Core concepts",
  description:
    "The CGP frame model: seven frame kinds, three representations (full, compact, reference), labelled relations, canonical token accounting, and temporal validity.",
  alternates: { canonical: "/docs/concepts" },
};

export default function Concepts() {
  return (
    <>
      <span className="eyebrow">
        <span className="tick">02</span> Core concepts
      </span>
      <h1>Frames, relations, and honest budgets</h1>
      <p className="lede">
        A frame is not a string. It is a structured record of relevance,
        cost, provenance, and validity — and the graph is carried in its
        labelled relations.
      </p>

      <h2>Frame kinds</h2>
      <p>
        Every frame declares one of seven kinds, serialized in snake_case on
        the wire:
      </p>
      <div className="table-scroll">
        <table className="field-table">
          <thead>
            <tr>
              <th>Kind</th>
              <th>Typical content</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>snippet</td>
              <td>A contiguous run of source or text, e.g. a function body.</td>
            </tr>
            <tr>
              <td>symbol</td>
              <td>A named program entity — its signature, definition site.</td>
            </tr>
            <tr>
              <td>fact</td>
              <td>A discrete assertion with validity bounds.</td>
            </tr>
            <tr>
              <td>doc</td>
              <td>Documentation or prose, whole or excerpted.</td>
            </tr>
            <tr>
              <td>memory</td>
              <td>Durable agent memory: preferences, learned constraints.</td>
            </tr>
            <tr>
              <td>episode</td>
              <td>A record of something that happened — an incident, a session.</td>
            </tr>
            <tr>
              <td>graph</td>
              <td>A node with its labelled edges — structure itself as context.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Representations: content-optional by design</h2>
      <p>
        A frame carries its content in one of three representations,
        negotiated through the query&rsquo;s{" "}
        <code>representation_preferences</code> and the provider&rsquo;s
        declared capabilities:
      </p>
      <ul>
        <li>
          <strong><code>full</code></strong> — inline <code>content</code>{" "}
          required. The default: a <code>full</code> frame omits the{" "}
          <code>representation</code> field entirely, so pre-representation
          frames are unchanged on the wire.
        </li>
        <li>
          <strong><code>compact</code></strong> — inline content that is a
          transformed rendering (say, a signature-only view of a file), plus
          the <code>canonical_content_hash</code> of the source it was derived
          from, a <code>transform</code> identity, and a{" "}
          <code>content_ref</code> back to the original.
        </li>
        <li>
          <strong><code>reference</code></strong> — no inline content at all:
          an opaque <code>content_ref</code> resolver handle plus the
          canonical hash. It is never encoded as <code>content: ""</code>;
          the field is omitted entirely.
        </li>
      </ul>
      <div className="callout">
        <strong>Why it matters:</strong> large context can travel by name and
        still be verified byte-for-byte. A host that already holds the bytes
        (in a cache, on disk) pays near-zero tokens to re-establish trust in
        them.
      </div>
      <p>
        Supporting fields make fidelity explicit: <code>content_fidelity</code>{" "}
        is one of <code>exact</code>, <code>normalized</code>,{" "}
        <code>summarized</code>, <code>omitted</code>; a host can demand a
        floor with <code>minimum_content_fidelity</code> or require inline
        bytes with <code>inline_content_requirement</code>.
      </p>

      <h2>Relations: the graph itself</h2>
      <p>
        CGP is named for the graph, and the graph is carried in{" "}
        <code>relations</code>: a graph frame is a node with its labelled
        edges, not an ad-hoc serialization format. Each relation is a
        directional edge <code>{`{ rel, target_uri, display_name? }`}</code>.
        Six names are published — <code>code.calls</code>,{" "}
        <code>code.imports</code>, <code>code.defines</code>,{" "}
        <code>code.references</code>, <code>doc.documents</code>,{" "}
        <code>episode.follows</code> — and the vocabulary is open: providers
        namespace their own (<code>myindex.owns</code>), and a host must not
        reject unknown values.
      </p>
      <p>
        Queries meet the graph through <strong>anchors</strong>: URIs the host
        considers focal — open files, mentioned symbols. A graph-capable
        provider should boost frames within a small number of relation hops of
        an anchor.
      </p>

      <h2>Token accounting</h2>
      <p>
        A <strong>budget token</strong> is an accounting unit, not a
        tokenizer. The canonical rule:
      </p>
      <CodeBlock
        title="Budget rule B3 — exact equality, no tolerance band"
        code={`token_cost = ceil( utf8_byte_length(content) / 4 )`}
      />
      <p>
        Because the rule is deterministic in every language, budget honesty is
        machine-checkable: summed <code>token_cost</code> must not exceed the
        query&rsquo;s <code>max_tokens</code> (B1), frame count must not
        exceed <code>max_frames</code> (B4), and a host must drop — with a
        loud report — the frames of any provider that violates the budget
        (B2).
      </p>
      <p>
        A host must not treat one budget token as one model token. The 4-byte
        rule tracks English prose well but under-estimates dense source code
        (~3–3.5 bytes per model token) and CJK text (~3), so hosts map real
        budgets through a safety factor — the reference host suggests 1.35:
        10,000 model tokens of headroom becomes a 7,407 budget-token query.
        The count covers <code>content</code> only, never titles, citation
        labels, or host chrome.
      </p>

      <h2>Identity and time</h2>
      <p>
        The stable identity of a frame&rsquo;s exact bytes is the triple{" "}
        <code>(provider_id, frame_id, content_digest)</code> — the spine
        shared by deterministic composition, usage reports, and verification.
        A frame may omit <code>content_digest</code>, but such a frame is not
        verifiable, and a host must re-query rather than reuse it.
      </p>
      <p>
        Frames are bi-temporal: <code>valid_from</code> /{" "}
        <code>valid_to</code> bound when the content was true;{" "}
        <code>recorded_at</code> says when it was captured; and a query&rsquo;s{" "}
        <code>as_of</code> pins retrieval to an instant.
      </p>
      <DocsPager slug="concepts" />
    </>
  );
}
