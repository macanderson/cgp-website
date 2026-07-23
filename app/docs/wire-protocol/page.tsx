import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { DocsPager } from "@/components/DocsPager";

export const metadata: Metadata = {
  title: "Wire protocol",
  description:
    "CGP's NDJSON envelope binding: eight message types over stdio or streamable HTTP, the handshake lifecycle, major-family versioning, correlation ids, and the error vocabulary.",
  alternates: { canonical: "/docs/wire-protocol" },
};

const SESSION = `{"type":"handshake","protocol_version":"contextgraph/1.0-draft"}
{"type":"handshake_ack","protocol_version":"contextgraph/1.0-draft","provider":{…},"capabilities":{…}}
{"type":"query","id":"q1","query":{…}}
{"type":"frames","id":"q1","result":{"frames":[…],"truncated":false}}
{"type":"verify","request":{"frames":[{"provider_id":"docs","frame_id":"doc:1","content_digest":"sha256:…"}]}}
{"type":"verified","response":{"verdicts":[{"frame":{…},"status":"valid"}]}}
{"type":"shutdown"}`;

const QUERY = `{
  "type": "query",
  "id": "q1",
  "query": {
    "goal": "why does the retry loop give up",
    "query_text": "retry loop",
    "kinds": ["snippet"],
    "anchors": ["file:///repo/src/net.rs"],
    "max_frames": 8,
    "max_tokens": 2000,
    "as_of": "2026-07-01T00:00:00Z"
  }
}`;

export default function WireProtocol() {
  return (
    <>
      <span className="eyebrow">
        <span className="tick">03</span> Wire protocol
      </span>
      <h1>Eight envelopes, one per line</h1>
      <p className="lede">
        The semantic layer — frames, queries, capabilities — is defined
        independently of transport. The current binding is NDJSON: every
        message is a single JSON envelope, internally tagged by{" "}
        <code>type</code>.
      </p>

      <p>
        Over <strong>stdio</strong>, exactly one envelope travels per line —
        an envelope must not contain a literal newline. Over{" "}
        <strong>streamable HTTP</strong>, one envelope is the request body and
        one is the response body.
      </p>
      <div className="callout">
        <strong>CGP is not JSON-RPC.</strong> There is no{" "}
        <code>jsonrpc</code> member and no <code>method</code>/
        <code>params</code> split. The lifecycle is informed by MCP —
        handshake before payload — but the framing is its own. A JSON-RPC
        binding may be specified later as an alternate encoding of the same
        semantic layer.
      </div>

      <h2>The envelope vocabulary</h2>
      <div className="table-scroll">
        <table className="field-table">
          <caption>
            <span className="fig-n">Table 1</span> — Envelope types in{" "}
            contextgraph/1.0-draft. verify/verified are additive and
            capability-gated.
          </caption>
          <thead>
            <tr>
              <th>type</th>
              <th>Direction</th>
              <th>Payload</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>handshake</td>
              <td>host → provider</td>
              <td>
                <code>protocol_version</code>
              </td>
            </tr>
            <tr>
              <td>handshake_ack</td>
              <td>provider → host</td>
              <td>
                <code>protocol_version</code>, <code>provider</code>,{" "}
                <code>capabilities</code>
              </td>
            </tr>
            <tr>
              <td>query</td>
              <td>host → provider</td>
              <td>
                <code>query</code> (ContextQuery), optional <code>id</code>
              </td>
            </tr>
            <tr>
              <td>frames</td>
              <td>provider → host</td>
              <td>
                <code>result</code> (ContextQueryResult), optional{" "}
                <code>id</code>
              </td>
            </tr>
            <tr>
              <td>verify</td>
              <td>host → provider</td>
              <td>
                <code>request</code> (VerifyRequest)
              </td>
            </tr>
            <tr>
              <td>verified</td>
              <td>provider → host</td>
              <td>
                <code>response</code> (VerifyResponse)
              </td>
            </tr>
            <tr>
              <td>shutdown</td>
              <td>host → provider</td>
              <td>—</td>
            </tr>
            <tr>
              <td>error</td>
              <td>provider → host</td>
              <td>
                <code>message</code>, optional <code>id</code>,{" "}
                <code>code</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Handshake and lifecycle</h2>
      <p>
        The host opens with <code>handshake</code>; the provider replies with{" "}
        <code>handshake_ack</code> carrying its protocol version, identity,
        and capabilities. <strong>No query payload moves before this
        exchange completes.</strong> The acknowledged version must share the
        host&rsquo;s major family (H1); provider name and version must be
        non-empty (H2); a version-family mismatch must surface as a named
        error, never a hang (H3).
      </p>
      <CodeBlock title="A complete stdio session, in wire order" lang="ndjson" code={SESSION} />

      <h2>Versioning</h2>
      <CodeBlock
        title="Version grammar (ABNF)"
        code={`version-string = "contextgraph/" major "." minor [ "-draft" ]
major          = 1*DIGIT
minor          = 1*DIGIT`}
      />
      <p>
        The major family is the substring up to the first dot. Two versions
        interoperate <em>if and only if</em> they share a major family:{" "}
        <code>contextgraph/1.0-draft</code> and <code>contextgraph/1.0</code>{" "}
        both belong to <code>contextgraph/1</code> and interoperate;{" "}
        <code>contextgraph/2.0</code> does not. This is what lets the spec
        drop <code>-draft</code> at freeze without a flag day. A new optional
        field is a minor change; a removed or renamed field requires a new
        major family.
      </p>

      <h2>Correlation</h2>
      <p>
        <code>query</code>, <code>frames</code>, and <code>error</code> may
        carry an opaque <code>id</code>. A provider that declares{" "}
        <code>capabilities.correlation</code> must echo a request&rsquo;s{" "}
        <code>id</code> verbatim on the corresponding reply (H4) — and a host
        must not send an <code>id</code> to a provider that never declared
        the capability. An envelope with no <code>id</code> is a
        notification: it expects no reply, the shape a future push extension
        needs.
      </p>
      <CodeBlock title="A realistic query" lang="json" code={QUERY} />

      <h2>Errors</h2>
      <p>
        Six codes form an open vocabulary: <code>bad_request</code>,{" "}
        <code>unsupported_kind</code>, <code>budget_unsatisfiable</code>,{" "}
        <code>unavailable</code>, <code>shutting_down</code>,{" "}
        <code>internal</code>. A host treats an unknown or absent code as{" "}
        <code>internal</code>. Robustness is part of the contract: a provider
        must ignore-or-error a malformed line, never crash (R1), and must
        tear down cleanly on <code>shutdown</code> (R2).
      </p>
      <DocsPager slug="wire-protocol" />
    </>
  );
}
