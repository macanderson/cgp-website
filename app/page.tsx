import Link from "next/link";
import type { Metadata } from "next";
import { FigureGraph } from "@/components/FigureGraph";
import { CodeBlock } from "@/components/CodeBlock";
import { GITHUB_URL, PAPER_PATH } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const SESSION = `{"type":"handshake","protocol_version":"contextgraph/1.0-draft"}
{"type":"handshake_ack","protocol_version":"contextgraph/1.0-draft",
 "provider":{"name":"docs-provider","version":"0.1.0",
   "data_flow":{"reads":true,"writes":false,"egress":false}},
 "capabilities":{"query":{"kinds":["doc","snippet"]},"correlation":true}}
{"type":"query","id":"q1","query":{
   "goal":"why does the retry loop give up",
   "kinds":["snippet"],"anchors":["file:///repo/src/net.rs"],
   "max_frames":8,"max_tokens":2000}}
{"type":"frames","id":"q1","result":{"frames":[…],"truncated":false}}
{"type":"shutdown"}`;

const FRAME = `{
  "id": "frame:minimal",
  "kind": "fact",
  "title": "Minimal conforming frame",
  "content": "Default arrays are omitted on the wire.",
  "score": 1.0,
  "token_cost": 10,
  "citation_label": "minimal fixture"
}`;

export default function Home() {
  return (
    <>
      <div className="shell">
        <section className="hero">
          <div>
            <span className="eyebrow">
              <span className="tick">§</span> Open specification ·{" "}
              contextgraph/1.0-draft
            </span>
            <h1>
              Context as <em>evidence</em>,<br />
              not on faith.
            </h1>
            <p className="lede">
              The Context Graph Protocol is an open wire protocol for context
              retrieval. It treats a piece of context as a typed, budgeted,
              provenance-carrying, consent-gated, and conformance-verified
              unit of exchange called a frame — never a blob.
            </p>
            <div className="hero-actions">
              <Link href="/docs" className="btn btn-solid">
                Read the docs
              </Link>
              <a href={PAPER_PATH} className="btn btn-ghost">
                Whitepaper (PDF)
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener"
                className="btn btn-ghost"
              >
                Specification ↗
              </a>
            </div>
            <div className="hero-meta">
              <span>
                <strong>7</strong> frame kinds
              </span>
              <span>
                <strong>8</strong> envelope types
              </span>
              <span>
                <strong>7</strong> conformance checks
              </span>
              <span>
                <strong>4</strong> independent implementations
              </span>
            </div>
          </div>
          <FigureGraph />
        </section>
      </div>

      <div className="shell">
        <section className="section" id="why">
          <div className="section-head">
            <span className="sec-n">§1</span>
            <h2>Why frames, not blobs</h2>
          </div>
          <div className="section-body">
            <div className="section-prose prose">
              <p>
                Agents today receive context as opaque strings: a retrieval
                pipeline concatenates whatever it found, and the model is
                asked to trust it. Nothing states where a passage came from,
                what it costs against the window, whether it is still true, or
                how to cite it. When the answer is wrong, there is nothing to
                audit.
              </p>
              <p>
                CGP replaces the blob with the <strong>frame</strong>: a
                structured record of relevance, cost, provenance, and
                validity. A host asks providers for frames relevant to a goal,
                under a hard token budget. Each provider returns frames that
                carry their own origin, their honest cost, and a
                human-readable citation label. The host composes them into a
                prompt it can trust as evidence — and frame content is always
                delimited as quoted material, never as instructions.
              </p>
              <p>
                The protocol is deliberately narrow. It does not specify tool
                invocation — that is{" "}
                <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener">
                  MCP
                </a>
                &rsquo;s scope, and CGP will not absorb it. An agent needing
                both composes them: CGP frames feed the prompt, MCP tools do
                the work.
              </p>
            </div>
            <aside className="margin-note">
              <span className="eyebrow">The seven guarantees</span>
              Provenance · budget honesty · consent enforcement · conformance
              · citation · version stability · temporal validity. The
              properties compose — remove any one and the trust model
              collapses back to the blob-pipe.
            </aside>
          </div>
        </section>

        <section className="section" id="frame">
          <div className="section-head">
            <span className="sec-n">§2</span>
            <h2>The unit of exchange</h2>
          </div>
          <div className="section-body">
            <div className="section-prose prose">
              <p>
                A frame states what it is, where it came from, what it costs,
                when it was true, and how to cite it. Seven kinds cover the
                shapes agent context actually takes:{" "}
                <code>snippet</code>, <code>symbol</code>, <code>fact</code>,{" "}
                <code>doc</code>, <code>memory</code>, <code>episode</code>,
                and <code>graph</code> — and the graph is carried in{" "}
                <code>relations</code>: a graph frame is a node with its
                labelled edges, not an ad-hoc serialization format.
              </p>
              <div className="codeblock" style={{ margin: "20px 0" }}>
                <div className="codeblock-bar">
                  <span>A minimal conforming frame</span>
                  <span>json</span>
                </div>
                <pre>
                  <code>{FRAME}</code>
                </pre>
              </div>
              <p>
                Every count is checkable: <code>token_cost</code> must equal{" "}
                <code>ceil(utf8_bytes(content) / 4)</code> — exact equality,
                no tolerance band — and the sum across returned frames must
                never exceed the query&rsquo;s <code>max_tokens</code>.
              </p>
            </div>
            <aside className="margin-note">
              <span className="eyebrow">Content-optional</span>
              Three representations: <code>full</code> (inline content),{" "}
              <code>compact</code> (transformed rendering plus canonical
              hash), and <code>reference</code> (no inline content at all —
              an opaque resolver handle plus hash). Big context can travel by
              name and still be verified byte-for-byte.
            </aside>
          </div>
          <div className="def-grid">
            <div className="def-card">
              <span className="term">frame</span>
              <p>
                The typed, budgeted, provenance-carrying unit of context
                exchange. Identified by <code>(provider_id, frame_id,
                content_digest)</code> — a content-addressed spine that makes
                reuse verifiable.
              </p>
            </div>
            <div className="def-card">
              <span className="term">relation</span>
              <p>
                A labelled, directional edge from a frame to a{" "}
                <code>target_uri</code>. Six published names —{" "}
                <code>code.calls</code>, <code>code.imports</code>,{" "}
                <code>code.defines</code>, <code>code.references</code>,{" "}
                <code>doc.documents</code>, <code>episode.follows</code> — and
                an open namespace for the rest.
              </p>
            </div>
            <div className="def-card">
              <span className="term">budget token</span>
              <p>
                An accounting unit, not a tokenizer:{" "}
                <code>ceil(utf8_bytes / 4)</code>. Deterministic in every
                language, so budget honesty is machine-checkable across
                implementations.
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="wire">
          <div className="section-head">
            <span className="sec-n">§3</span>
            <h2>A wire you can read</h2>
          </div>
          <div className="section-body">
            <div className="section-prose prose">
              <p>
                The semantic layer — frames, queries, capabilities — is
                defined independently of transport. The current binding is
                NDJSON: every message is a single JSON envelope, internally
                tagged by <code>type</code>. Over stdio, one envelope per
                line; over streamable HTTP, one envelope per request and
                response. CGP is <em>not</em> JSON-RPC — there is no{" "}
                <code>jsonrpc</code> member and no <code>method</code>/
                <code>params</code> split.
              </p>
              <p>
                No query payload moves before the handshake completes, and
                capabilities are negotiated explicitly — never inferred by
                observation. Two versions interoperate if and only if they
                share a major family, which is what lets{" "}
                <code>1.0-draft</code> freeze into <code>1.0</code> without a
                flag day.
              </p>
            </div>
            <aside className="margin-note">
              <span className="eyebrow">Eight envelopes</span>
              <code>handshake</code> · <code>handshake_ack</code> ·{" "}
              <code>query</code> · <code>frames</code> · <code>verify</code> ·{" "}
              <code>verified</code> · <code>shutdown</code> ·{" "}
              <code>error</code>
            </aside>
          </div>
          <CodeBlock
            title="A complete stdio session — what actually travels over the pipe"
            lang="ndjson"
            code={SESSION}
          />
        </section>

        <section className="section" id="conformance">
          <div className="section-head">
            <span className="sec-n">§4</span>
            <h2>Conformance you can falsify</h2>
          </div>
          <div className="section-body">
            <div className="section-prose prose">
              <p>
                &ldquo;CGP conformant&rdquo; means green on the conformance
                suite for your declared capability set — a checkable claim,
                not a self-attestation. Seven checks cover the handshake,
                consent scopes, frame validity, verify honesty, budget
                honesty, clean shutdown, and malformed-input tolerance.
              </p>
              <p>
                The suite must also prove it can catch a cheat: the bundled
                reference provider ships fourteen <code>--misbehave</code>{" "}
                modes that each break exactly one guarantee — lying about
                costs, flooding past <code>max_frames</code>,
                rubber-stamping verification — and CI asserts every mode is
                caught. A suite that only ever passes proves nothing.
              </p>
            </div>
            <aside className="margin-note">
              <span className="eyebrow">Try it</span>
              <code>contextgraph-inspect stdio -- ./your-provider</code>{" "}
              probes any provider interactively: negotiated capabilities, a
              test query, the full suite, a colored verdict, and a non-zero
              exit for CI.
            </aside>
          </div>
        </section>

        <section className="section" id="implementations">
          <div className="section-head">
            <span className="sec-n">§5</span>
            <h2>Four independent implementations</h2>
          </div>
          <div className="section-body wide">
            <div className="def-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              <div className="def-card">
                <span className="term">rust</span>
                <p>
                  The reference: <code>contextgraph-types</code>,{" "}
                  <code>contextgraph-host</code>, and the conformance suite
                  with the <code>contextgraph-inspect</code> prober.
                </p>
              </div>
              <div className="def-card">
                <span className="term">typescript</span>
                <p>
                  <code>@contextgraphprotocol/typescript-sdk</code> on npm.
                  Zero-dependency; implement three methods, call{" "}
                  <code>runStdioProvider</code>.
                </p>
              </div>
              <div className="def-card">
                <span className="term">python</span>
                <p>
                  <code>contextgraph_sdk</code>, stdlib-only. Any object with{" "}
                  <code>info()</code>, <code>capabilities()</code>,{" "}
                  <code>query()</code> is a provider.
                </p>
              </div>
              <div className="def-card">
                <span className="term">go</span>
                <p>
                  Package <code>contextgraph</code>. Implement the interface,
                  call <code>cg.RunStdioProvider</code>; verification is one
                  optional interface away.
                </p>
              </div>
            </div>
            <p style={{ marginTop: 18, color: "var(--muted)", fontSize: "0.95rem" }}>
              Every SDK is validated by the same Rust oracle —{" "}
              <code>conformance-external.sh</code> points the suite at any
              binary in any language. That shared oracle is the point.{" "}
              <Link href="/docs/sdks" className="prose-link">
                SDK quickstarts →
              </Link>
            </p>
          </div>
        </section>
      </div>

      <section className="paper-band">
        <div className="shell paper-band-inner">
          <div>
            <span className="eyebrow">
              <span className="tick">§</span> Research
            </span>
            <h2>
              A trust architecture for context: the technical report
            </h2>
            <p className="abstract">
              The whitepaper develops the argument end to end: why context
              windows fail as they fill, why the unit of exchange must carry
              provenance and honest cost, how deterministic composition turns
              prompt caches from an accident into a contract, and how an
              adversarial conformance suite keeps every guarantee falsifiable.
            </p>
          </div>
          <div className="paper-card">
            <span className="k">Report</span>
            <span className="v">CGP-TR-2026-01 · July 2026</span>
            <span className="k">Covers</span>
            <span className="v">
              Frame model · wire protocol · budget honesty · conformance
            </span>
            <a href={PAPER_PATH} className="btn btn-solid" download>
              Download PDF
            </a>
            <Link
              href="/research"
              className="btn btn-ghost"
              style={{ width: "100%", justifyContent: "center", marginTop: 10 }}
            >
              Abstract &amp; citation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
