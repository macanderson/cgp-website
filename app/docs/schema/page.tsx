import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { DocsPager } from "@/components/DocsPager";
import { GITHUB_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Schema",
  description:
    "CGP's JSON Schema (Draft 2020-12): the envelope, ContextFrame, ContextQuery, Provenance, and Relation shapes, with a real conforming frame from the golden fixtures.",
  alternates: { canonical: "/docs/schema" },
};

const FRAME = `{
  "id": "frame:minimal",
  "kind": "fact",
  "title": "Minimal conforming frame",
  "content": "Default arrays are omitted on the wire.",
  "score": 1.0,
  "token_cost": 10,
  "citation_label": "minimal fixture"
}`;

export default function SchemaPage() {
  return (
    <>
      <span className="eyebrow">
        <span className="tick">04</span> Schema
      </span>
      <h1>One schema, every language</h1>
      <p className="lede">
        The wire is validated by a single JSON Schema (Draft 2020-12):{" "}
        <code>contextgraph-envelope.schema.json</code>. The root validates one
        envelope; every payload shape is also exposed under{" "}
        <code>$defs</code> for granular validation.
      </p>
      <p>
        There is no separate IDL — the <code>contextgraph-types</code> Rust
        structs serialized by serde <em>are</em> the protocol, and the schema
        mirrors them exactly. It validates with <code>ajv</code>, Python{" "}
        <code>jsonschema</code>, Rust <code>jsonschema</code>, Go{" "}
        <code>gojsonschema</code> — any Draft 2020-12 validator. Find it in
        the repository under{" "}
        <a href={`${GITHUB_URL}/blob/main/schema/contextgraph-envelope.schema.json`} target="_blank" rel="noopener">
          <code>schema/</code>
        </a>
        .
      </p>

      <h2>ContextFrame</h2>
      <div className="table-scroll">
        <table className="field-table">
          <caption>
            <span className="fig-n">Table 2</span> — ContextFrame fields.{" "}
            <span style={{ color: "var(--accent)" }}>●</span> = required (what
            the reference serializer always emits).
          </caption>
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="req">●</span> id</td>
              <td>string</td>
              <td>Non-empty, provider-scoped.</td>
            </tr>
            <tr>
              <td><span className="req">●</span> kind</td>
              <td>FrameKind</td>
              <td>
                <code>snippet | symbol | fact | doc | memory | episode | graph</code>
              </td>
            </tr>
            <tr>
              <td><span className="req">●</span> title</td>
              <td>string</td>
              <td>Non-empty.</td>
            </tr>
            <tr>
              <td><span className="req">●</span> score</td>
              <td>number</td>
              <td>Relevance in [0, 1].</td>
            </tr>
            <tr>
              <td><span className="req">●</span> token_cost</td>
              <td>u32</td>
              <td>
                Canonical: <code>ceil(utf8_bytes(content)/4)</code>.
              </td>
            </tr>
            <tr>
              <td>content</td>
              <td>string?</td>
              <td>
                Untrusted data. Governed per representation — omitted entirely
                for <code>reference</code> frames.
              </td>
            </tr>
            <tr>
              <td>representation</td>
              <td>enum?</td>
              <td>
                <code>full | compact | reference</code>; absent ⇒{" "}
                <code>full</code>.
              </td>
            </tr>
            <tr>
              <td>content_digest</td>
              <td>string?</td>
              <td>
                <code>sha256:</code> + 64 hex. Omitting it makes the frame
                unverifiable.
              </td>
            </tr>
            <tr>
              <td>content_ref</td>
              <td>object?</td>
              <td>
                <code>{`{ provider_id, uri, expires_at? }`}</code> — opaque
                resolver handle.
              </td>
            </tr>
            <tr>
              <td>canonical_content_hash</td>
              <td>string?</td>
              <td>Hash of the full canonical source.</td>
            </tr>
            <tr>
              <td>content_fidelity</td>
              <td>enum?</td>
              <td>
                <code>exact | normalized | summarized | omitted</code>
              </td>
            </tr>
            <tr>
              <td>transform</td>
              <td>object?</td>
              <td>
                <code>{`{ method, implementation, version }`}</code> for{" "}
                <code>compact</code> renderings.
              </td>
            </tr>
            <tr>
              <td>canonical_token_cost</td>
              <td>u32?</td>
              <td>
                Cost of the canonical source; <code>tokenizer_ref</code> names
                the tokenizer (e.g. <code>openai:o200k_base</code>).
              </td>
            </tr>
            <tr>
              <td>valid_from / valid_to</td>
              <td>timestamp?</td>
              <td>Bi-temporal validity bounds.</td>
            </tr>
            <tr>
              <td>recorded_at</td>
              <td>timestamp?</td>
              <td>When the frame was captured.</td>
            </tr>
            <tr>
              <td>provenance</td>
              <td>Provenance[]</td>
              <td>Omitted when empty.</td>
            </tr>
            <tr>
              <td>citation_label</td>
              <td>string?</td>
              <td>Non-empty when present.</td>
            </tr>
            <tr>
              <td>embedding</td>
              <td>object?</td>
              <td>
                <code>{`{ fingerprint, vector? }`}</code>
              </td>
            </tr>
            <tr>
              <td>relations</td>
              <td>Relation[]</td>
              <td>The graph: labelled edges. Omitted when empty.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CodeBlock
        title="A real conforming frame — from the golden fixtures"
        lang="json"
        code={FRAME}
      />

      <h2>ContextQuery</h2>
      <div className="table-scroll">
        <table className="field-table">
          <caption>
            <span className="fig-n">Table 3</span> — ContextQuery fields.
          </caption>
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="req">●</span> goal</td>
              <td>string</td>
              <td>The driving task — verbatim intent, not keywords.</td>
            </tr>
            <tr>
              <td><span className="req">●</span> kinds</td>
              <td>FrameKind[]</td>
              <td>Empty means &ldquo;your best frames of any kind.&rdquo;</td>
            </tr>
            <tr>
              <td><span className="req">●</span> anchors</td>
              <td>string[]</td>
              <td>Focal URIs — open files, mentioned symbols.</td>
            </tr>
            <tr>
              <td><span className="req">●</span> max_frames</td>
              <td>u32</td>
              <td>Hard cap on returned frames.</td>
            </tr>
            <tr>
              <td><span className="req">●</span> max_tokens</td>
              <td>u32</td>
              <td>A hard contract, not a hint.</td>
            </tr>
            <tr>
              <td>query_text</td>
              <td>string?</td>
              <td>Optional keyword rendering of the goal.</td>
            </tr>
            <tr>
              <td>embedding</td>
              <td>number[]?</td>
              <td>
                Only sendable when host and provider fingerprints match
                exactly (E1).
              </td>
            </tr>
            <tr>
              <td>as_of</td>
              <td>timestamp?</td>
              <td>Pin retrieval to an instant.</td>
            </tr>
            <tr>
              <td>representation_preferences</td>
              <td>enum[]?</td>
              <td>
                Ordered; absent ⇒ <code>[full]</code>.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Provenance and Relation</h2>
      <p>
        A <code>Provenance</code> record requires a <code>type</code> (the
        Rust field <code>kind</code> serializes to <code>type</code> on the
        wire) and may carry <code>uri</code>, <code>range</code>,{" "}
        <code>digest</code> (pattern <code>^sha256:[0-9a-f]{"{64}"}$</code>),{" "}
        <code>method</code>, and <code>by</code>. A <code>Relation</code>{" "}
        requires <code>rel</code> and <code>target_uri</code>, with an
        optional <code>display_name</code>.
      </p>
      <div className="callout">
        <strong>Structural rules the schema enforces:</strong> required
        fields, <code>score ∈ [0,1]</code>, non-empty <code>title</code>/
        <code>citation_label</code>/<code>id</code>, the frame-kind enum, the{" "}
        <code>contextgraph/MAJOR.MINOR(-draft)?</code> version pattern, u32
        ranges, and the per-representation <code>content</code>/
        <code>content_ref</code>/<code>transform</code> conditionals.
      </div>
      <DocsPager slug="schema" />
    </>
  );
}
