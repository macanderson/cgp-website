import type { Metadata } from "next";
import { ogImages } from "@/lib/og";
import { CodeBlock } from "@/components/CodeBlock";
import { DocsPager } from "@/components/DocsPager";

export const metadata: Metadata = {
  title: "Conformance",
  description:
    "How CGP conformance works: 14 provider checks, host and composition suites, an adversarial RED suite with 31 misbehave modes, the contextgraph-inspect prober, and RFC 8785 golden fixtures.",
  alternates: { canonical: "/docs/conformance" },
  ...ogImages("/docs/conformance"),
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
        <code>contextgraph-conformance</code> for your declared capability
        set. That is a checkable claim, not a self-attestation.
      </p>

      <h2>Provider checks</h2>
      <p>
        The suite runs 14 checks against a provider. A check that does not
        apply to what the provider declared is skipped, and the report lists
        every skip. A skip never fails a run.
      </p>
      <div className="table-scroll">
        <table className="field-table">
          <caption>
            <span className="fig-n">Table 4.</span> Provider checks in{" "}
            <code>contextgraph-conformance</code>.
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
                Declared egress scopes are well-formed and consistent with{" "}
                <code>data_flow.egress</code>.
              </td>
            </tr>
            <tr>
              <td>frame-validity</td>
              <td>
                Every frame has <code>score ∈ [0,1]</code>, a non-empty title
                and citation label, well-formed timestamps and digests, and
                file ranges in the line grammar.
              </td>
            </tr>
            <tr>
              <td>verify-honesty</td>
              <td>
                A provider that advertises <code>verify</code> answers{" "}
                <code>valid</code> for digests it served and{" "}
                <code>stale</code> for mutated ones.
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
              <td>as-of-temporal</td>
              <td>
                At an <code>as_of</code> pin, every returned frame&rsquo;s
                validity window contains the pin.
              </td>
            </tr>
            <tr>
              <td>kinds-filter</td>
              <td>A kind-filtered query returns only that kind.</td>
            </tr>
            <tr>
              <td>anchor-relevance</td>
              <td>
                A graph provider&rsquo;s frames anchor on a <code>uri</code>{" "}
                or a relation target.
              </td>
            </tr>
            <tr>
              <td>provenance-fixture-consistency</td>
              <td>
                Each <code>file</code> provenance digest matches the bytes it
                names.
              </td>
            </tr>
            <tr>
              <td>shutdown-clean</td>
              <td>Tears down on <code>shutdown</code> without error.</td>
            </tr>
            <tr>
              <td>malformed-input-tolerance</td>
              <td>
                Malformed input gets <code>bad_request</code> or is ignored,
                and the provider keeps running. Stdio only.
              </td>
            </tr>
            <tr>
              <td>embedding-fingerprint</td>
              <td>
                A query embedding that contradicts the declared dimension gets{" "}
                <code>bad_request</code>. Stdio only.
              </td>
            </tr>
            <tr>
              <td>correlation</td>
              <td>
                A provider that declares correlation echoes each request{" "}
                <code>id</code>. Stdio only.
              </td>
            </tr>
            <tr>
              <td>attestation</td>
              <td>
                Every provenance attestation the provider serves verifies
                against a key from its handshake. Stdio only.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Host and composition suites</h2>
      <p>
        The host has binding rules too. <code>contextgraph-inspect host</code>{" "}
        runs 9 host checks against the reference host: it rejects a
        wrong-family version, drops an over-budget or frame-flooding provider,
        gates egress on consent, requires a scope receipt, re-hashes file
        provenance, quotes frame content, isolates a crashed provider, and
        audits composition.
      </p>
      <p>
        A host with its own composition layer can run the 4 composition checks
        against it through <code>run_composition_conformance</code>. They
        check that the admitted frames fit the shared budget, that every
        offered frame is either admitted or reported dropped, that a
        quarantined provider contributes nothing, and that the same frame set
        composes in the same order on every run.
      </p>

      <h2>RED suite</h2>
      <p>
        A suite that only ever passes proves nothing about its ability to
        catch a broken provider. The bundled reference provider,{" "}
        <code>contextgraph-example-docs</code>, ships{" "}
        <strong>31 <code>--misbehave</code> modes</strong>. Each breaks
        exactly one guarantee: lying about costs, flooding past{" "}
        <code>max_frames</code>, dropping correlation ids, rubber-stamping
        verification, declaring a false egress scope, or forging a signature.
        CI runs every mode and requires a check to fail on it. A skipped check
        does not count as a catch. The mode list comes from the binary&rsquo;s
        own <code>--help</code>, so a new misbehaviour without a check that
        catches it turns CI red.
      </p>

      <h2>Probing a provider</h2>
      <p>
        <code>contextgraph-inspect</code> is an interactive prober, analogous
        to MCP&rsquo;s inspector. It prints negotiated capabilities,
        optionally fires a test query, runs the full suite, and exits
        non-zero when the provider is not conformant, so CI can gate on it.
        It ships in the <code>contextgraph-conformance</code> crate.
      </p>
      <CodeBlock
        title="contextgraph-inspect"
        lang="shell"
        code={`cargo install contextgraph-conformance
contextgraph-inspect stdio -- ./your-provider
contextgraph-inspect stdio --json -- ./your-provider
contextgraph-inspect stdio --query "goal text" -- ./your-provider
contextgraph-inspect http https://my-provider.example.com/contextgraph
contextgraph-inspect host`}
      />
      <p>
        From a checkout of the protocol repository, point the same Rust
        oracle at a provider written in any language:
      </p>
      <CodeBlock
        title="Validate an external provider"
        lang="shell"
        code={`cargo build --workspace --bins
./.github/scripts/conformance-external.sh -- node sdk/typescript/dist/examples/example-docs.js`}
      />

      <h2>Golden fixtures</h2>
      <p>
        Cross-language byte-exactness rests on golden fixtures: seven JSON
        files plus a manifest, published for fixture profile 1.1.0 under{" "}
        <code>contextgraph-conformance/fixtures/contextgraph-1.0/</code>. They
        cover a fully populated and a minimal <code>ContextFrame</code>,
        compact and reference frames, a minimal <code>ContextQuery</code>,
        missing and blank citation labels, strict unknown-field negatives, and
        RFC 8785 (JCS) normalization vectors.
      </p>
      <p>
        Each frame and query digest case carries four artifacts: the source
        object, the digest-profile-normalized object, the exact JCS UTF-8
        text, and the SHA-256 of those canonical bytes. The manifest pins the
        protocol version and the profile version, records the generation
        command, and carries a digest for every other file, so a fixture
        cannot drift unnoticed.
      </p>
      <div className="callout">
        <strong>Honest gaps, declared.</strong> The spec lists what the suite
        still cannot check. A stdio provider that declares{" "}
        <code>egress: false</code> can open a socket anyway, and nothing on
        the pipe shows it (C3). The HTTP transport rules C4, C7, and C8 have
        no test against a live TLS peer yet. A suite that quietly left these
        out would be the self-attestation the project rejects.
      </div>
      <DocsPager slug="conformance" />
    </>
  );
}
