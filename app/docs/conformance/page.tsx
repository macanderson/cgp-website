import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { DocsPager } from "@/components/DocsPager";

export const metadata: Metadata = {
  title: "Conformance",
  description:
    "How CGP conformance works: seven machine checks, an adversarial RED suite with fourteen misbehave modes, the contextgraph-inspect prober, and RFC 8785 golden fixtures.",
  alternates: { canonical: "/docs/conformance" },
};

export default function Conformance() {
  return (
    <>
      <span className="eyebrow">
        <span className="tick">05</span> Conformance
      </span>
      <h1>A claim you can check</h1>
      <p className="lede">
        &ldquo;CGP conformant&rdquo; means green on{" "}
        <code>contextgraph-conformance</code> for your declared capability set
        — a checkable claim, not a self-attestation.
      </p>

      <h2>The seven checks</h2>
      <div className="table-scroll">
        <table className="field-table">
          <caption>
            <span className="fig-n">Table 4</span> — Conformance checks.
            Checks skip when a capability is not declared; skips are reported,
            never silent.
          </caption>
          <thead>
            <tr>
              <th>Check</th>
              <th>Proves</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>handshake</td>
              <td>
                Completes the handshake with non-empty identity and
                capabilities.
              </td>
            </tr>
            <tr>
              <td>consent-scope</td>
              <td>
                Egress scopes are truthful and consistent with{" "}
                <code>data_flow.egress</code>.
              </td>
            </tr>
            <tr>
              <td>frame-validity</td>
              <td>
                Every frame: <code>score ∈ [0,1]</code>, non-empty title and
                citation label, well-formed timestamps and digests.
              </td>
            </tr>
            <tr>
              <td>verify-honesty</td>
              <td>
                A verify-capable provider answers by comparing digests — it
                never rubber-stamps <code>valid</code>.
              </td>
            </tr>
            <tr>
              <td>budget-honesty</td>
              <td>
                Canonical <code>token_cost</code>, sum ≤{" "}
                <code>max_tokens</code>, count ≤ <code>max_frames</code>.
              </td>
            </tr>
            <tr>
              <td>shutdown-clean</td>
              <td>Tears down on <code>shutdown</code> without error.</td>
            </tr>
            <tr>
              <td>malformed-input-tolerance</td>
              <td>
                A garbage line is ignored or errored — never a crash (stdio
                only).
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>The RED suite: proving the suite itself</h2>
      <p>
        A suite that only ever passes proves nothing about its ability to
        catch a broken provider. The bundled reference provider ships{" "}
        <strong>fourteen <code>--misbehave</code> modes</strong>, each
        breaking exactly one guarantee — lying about costs, under-reporting
        budget, flooding past <code>max_frames</code>, dropping correlation
        ids, rubber-stamping verification, declaring false egress scopes —
        and CI asserts every mode is caught by at least one check. The mode
        list is discovered from the binary&rsquo;s own <code>--help</code>,
        so adding a misbehaviour without a catching check turns CI red.
      </p>

      <h2>Probing a provider</h2>
      <p>
        <code>contextgraph-inspect</code> is an interactive prober, analogous
        to MCP&rsquo;s inspector. It prints negotiated capabilities,
        optionally fires a test query, runs the full suite, and exits
        non-zero when non-conformant — CI-friendly by construction.
      </p>
      <CodeBlock
        title="contextgraph-inspect"
        lang="shell"
        code={`contextgraph-inspect stdio -- ./your-provider
contextgraph-inspect stdio --json -- ./your-provider
contextgraph-inspect stdio --query "goal text" -- ./your-provider
contextgraph-inspect http https://my-provider.example.com/contextgraph`}
      />
      <p>
        External implementations — any language — are validated by pointing
        the same Rust oracle at the binary:
      </p>
      <CodeBlock
        title="Validate an external provider"
        lang="shell"
        code={`cargo build --workspace --bins
./.github/scripts/conformance-external.sh -- node dist/examples/example-docs.js`}
      />

      <h2>Golden fixtures</h2>
      <p>
        Cross-language byte-exactness rests on golden fixtures: five JSON
        files plus a manifest, published for fixture profile 1.1.0. Each
        fixture carries the source object, the digest-profile-normalized
        object, the exact RFC 8785 (JCS) canonical UTF-8 text, and the
        SHA-256 of those canonical bytes. The manifest pins the protocol and
        profile versions, records the generation command, and carries a
        digest for every other file — so a fixture can&rsquo;t drift
        silently.
      </p>
      <div className="callout">
        <strong>Honest gaps, declared.</strong> The spec lists what the suite
        cannot check — host-binding rules like consent gating and
        budget-liar dropping, and content-byte matching beyond digest grammar
        — because a conformance suite that quietly omitted the rules it
        cannot check would be exactly the self-attestation the project
        rejects.
      </div>
      <DocsPager slug="conformance" />
    </>
  );
}
