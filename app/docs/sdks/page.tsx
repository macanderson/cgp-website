import type { Metadata } from "next";
import { ogImages } from "@/lib/og";
import { CodeBlock } from "@/components/CodeBlock";
import { DocsPager } from "@/components/DocsPager";
import { GITHUB_URL, NPM_TS_SDK_URL } from "@/lib/site";
import {
  CRATE_MAJOR,
  CRATE_VERSION,
  GO_SDK_URL,
  PROTOCOL_VERSION,
  PUBLISHED_CRATES,
  PYPI_SDK_URL,
  RUST_MSRV,
  SDK_PUBLISHED_VERSION,
  SDK_PUBLISH_ISSUE_URL,
  SDK_REGISTRY_CHECKED,
  cratesIoUrl,
  docsRsUrl,
} from "@/lib/protocol";

export const metadata: Metadata = {
  title: "SDKs & host",
  description:
    "Add the Rust crates from crates.io, build a CGP provider in TypeScript, Python, or Go with zero-dependency SDKs, and run providers with the Rust host: fan-out routing, consent gating, deterministic composition.",
  alternates: { canonical: "/docs/sdks" },
  ...ogImages("/docs/sdks"),
};

const TS = `import {
  runStdioProvider,
  budgetTokens,
  type Provider,
} from "@contextgraphprotocol/typescript-sdk";

const provider: Provider = {
  info: () => ({
    name: "my-docs-provider",
    version: "0.1.0",
    data_flow: { reads: true, writes: false, egress: false,
                 egress_scopes: ["local-only"] },
  }),
  capabilities: () => ({
    query: { kinds: ["doc"] }, correlation: true,
  }),
  query: () => {
    const content = "Install the binding, then implement the required methods.";
    return {
      frames: [{
        id: "doc:1", kind: "doc", title: "Getting started",
        content,
        content_digest: \`sha256:\${"11".repeat(32)}\`,
        score: 0.9,
        token_cost: budgetTokens(content),
        citation_label: "start.md L1-10",
      }],
      truncated: false,
    };
  },
};

runStdioProvider(provider);`;

const PY = `from contextgraph_sdk import run_stdio_provider, budget_tokens

class MyDocsProvider:
    def info(self):
        return {"name": "my-docs-provider", "version": "0.1.0",
                "data_flow": {"reads": True, "writes": False,
                              "egress": False,
                              "egress_scopes": ["local-only"]}}

    def capabilities(self):
        return {"query": {"kinds": ["doc"]}, "correlation": True}

    def query(self, query):
        content = "Install the binding, then implement the required methods."
        return {"frames": [{
            "id": "doc:1", "kind": "doc", "title": "Getting started",
            "content": content,
            "content_digest": "sha256:" + ("11" * 32),
            "score": 0.9,
            "token_cost": budget_tokens(content),
            "citation_label": "start.md L1-10"}],
            "truncated": False}

run_stdio_provider(MyDocsProvider())`;

const GO = `package main

import cg "github.com/macanderson/context-graph-protocol/sdk/go/contextgraph"

type myProvider struct{}

func (myProvider) Info() cg.ProviderInfo {
	return cg.ProviderInfo{Name: "my-docs-provider", Version: "0.1.0",
		DataFlow: cg.DataFlow{Reads: true,
			EgressScopes: []string{"local-only"}}}
}

func (myProvider) Capabilities() cg.Capabilities {
	return cg.Capabilities{Query: cg.QueryCapability{Kinds: []string{"doc"}},
		Correlation: true}
}

func (myProvider) Query(_ cg.ContextQuery) (cg.ContextQueryResult, error) {
	content := "Install the binding, then implement the required methods."
	return cg.ContextQueryResult{Frames: []cg.ContextFrame{{
		ID: "doc:1", Kind: "doc", Title: "Getting started",
		Content: cg.Ptr(content), Score: 0.9,
		TokenCost:     cg.BudgetTokens(content),
		CitationLabel: "start.md L1-10"}}}, nil
}

func main() { cg.RunStdioProvider(myProvider{}) }`;

const CARGO_ADD = `cargo add contextgraph-types@${CRATE_MAJOR}
cargo add contextgraph-host@${CRATE_MAJOR}
cargo install contextgraph-conformance`;

const CARGO_TOML = `[dependencies]
contextgraph-types = "${CRATE_MAJOR}"
contextgraph-host = "${CRATE_MAJOR}"`;

const SDK_PACKAGES = [
  { name: "@contextgraphprotocol/typescript-sdk", registry: "npm", serves: SDK_PUBLISHED_VERSION },
  { name: "contextgraph-sdk", registry: "PyPI", serves: SDK_PUBLISHED_VERSION },
  {
    name: "github.com/macanderson/context-graph-protocol/sdk/go",
    registry: "Go module proxy",
    serves: `v${SDK_PUBLISHED_VERSION}`,
  },
  { name: "create-contextgraph-provider", registry: "npm", serves: "Not published" },
];

export default function Sdks() {
  return (
    <>
      <span className="eyebrow">
        <span className="tick">06</span> SDKs &amp; host
      </span>
      <h1>A provider in three methods</h1>
      <p className="lede">
        Every SDK is zero-dependency, speaks the line-oriented JSON wire over
        stdio, and is validated by the same Rust conformance oracle. Implement{" "}
        <code>info()</code>, <code>capabilities()</code>, and{" "}
        <code>query()</code>; the runtime loop handles the rest.
      </p>
      <p>
        The stdio runtime — <code>runStdioProvider</code> /{" "}
        <code>run_stdio_provider</code> / <code>RunStdioProvider</code> —
        drives the whole lifecycle a host expects: handshake, query (echoing
        the correlation <code>id</code>), verify, shutdown, and it stays
        alive with a typed error on a malformed line rather than crashing.
        Each SDK also exports the canonical budget rule.
      </p>

      <h2>Package versions</h2>
      <div className="table-scroll">
        <table className="field-table">
          <caption>
            <span className="fig-n">Table 5.</span> What each registry served
            on {SDK_REGISTRY_CHECKED}.
          </caption>
          <thead>
            <tr>
              <th>Package</th>
              <th>Registry</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            {PUBLISHED_CRATES.map((crate) => (
              <tr key={crate.name}>
                <td>{crate.name}</td>
                <td>crates.io</td>
                <td>{CRATE_VERSION}</td>
              </tr>
            ))}
            {SDK_PACKAGES.map((pkg) => (
              <tr key={pkg.name}>
                <td>{pkg.name}</td>
                <td>{pkg.registry}</td>
                <td>{pkg.serves}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        The published SDKs are all at {SDK_PUBLISHED_VERSION} and send{" "}
        <code>contextgraph/1.0-draft</code>, the name the protocol had before
        the freeze. A <code>{PROTOCOL_VERSION}</code> host accepts them,
        because both names are in the <code>contextgraph/1</code> family. On
        the protocol repository&rsquo;s <code>main</code>, the TypeScript and
        Python SDKs declare 2.0.0 and send <code>{PROTOCOL_VERSION}</code>,
        and <code>create-contextgraph-provider</code> declares 2.0.0 too.
        None of the three is on npm or PyPI at 2.0.0 yet.{" "}
        <a href={SDK_PUBLISH_ISSUE_URL} target="_blank" rel="noopener">
          Issue #227
        </a>{" "}
        tracks the publish.
      </p>

      <h2>TypeScript</h2>
      <p>
        <code>npm install @contextgraphprotocol/typescript-sdk</code> installs{" "}
        {SDK_PUBLISHED_VERSION} from{" "}
        <a href={NPM_TS_SDK_URL} target="_blank" rel="noopener">
          npm
        </a>
        . The example below runs on that release and on <code>main</code>.
      </p>
      <CodeBlock
        title="npm install @contextgraphprotocol/typescript-sdk"
        lang="typescript"
        code={TS}
      />

      <h2>Python</h2>
      <p>
        <code>pip install contextgraph-sdk</code> installs{" "}
        {SDK_PUBLISHED_VERSION} from{" "}
        <a href={PYPI_SDK_URL} target="_blank" rel="noopener">
          PyPI
        </a>
        . The import name is <code>contextgraph_sdk</code>. It uses only the
        standard library and ships type hints (<code>py.typed</code>). Any
        object with the three methods is a provider.
      </p>
      <CodeBlock title="pip install contextgraph-sdk" lang="python" code={PY} />

      <h2>Go</h2>
      <p>
        Import{" "}
        <a href={GO_SDK_URL} target="_blank" rel="noopener">
          <code>github.com/macanderson/context-graph-protocol/sdk/go/contextgraph</code>
        </a>
        . <code>go get</code> resolves the <code>v{SDK_PUBLISHED_VERSION}</code>{" "}
        tag today. The example follows <code>main</code>, where{" "}
        <code>Content</code> is a <code>*string</code> set with{" "}
        <code>cg.Ptr</code>. In <code>v{SDK_PUBLISHED_VERSION}</code>,{" "}
        <code>Content</code> is a plain <code>string</code> and{" "}
        <code>cg.Ptr</code> does not exist, so write{" "}
        <code>Content: content</code> there. Implement{" "}
        <code>cg.Verifier</code> to answer verification.
      </p>
      <CodeBlock title="Package contextgraph" lang="go" code={GO} />

      <h2>Validate any of them</h2>
      <p>
        Run these from the root of the protocol repository, after{" "}
        <code>cargo build --workspace --bins</code> and a build of each
        SDK&rsquo;s example provider.
      </p>
      <CodeBlock
        title="The shared oracle"
        lang="shell"
        code={`./.github/scripts/conformance-external.sh -- node sdk/typescript/dist/examples/example-docs.js
./.github/scripts/conformance-external.sh -- python3 sdk/python/examples/example_docs.py
./.github/scripts/conformance-external.sh -- ./cg-go-example`}
      />

      <h2>Rust crates</h2>
      <p>
        Four crates are on crates.io at {CRATE_VERSION}. They speak{" "}
        <code>{PROTOCOL_VERSION}</code> and need Rust {RUST_MSRV} or later.
      </p>
      <ul>
        {PUBLISHED_CRATES.map((crate) => (
          <li key={crate.name}>
            <a href={cratesIoUrl(crate.name)} target="_blank" rel="noopener">
              <code>{crate.name}</code>
            </a>
            : {crate.role} (
            <a href={docsRsUrl(crate.name)} target="_blank" rel="noopener">
              API docs
            </a>
            )
          </li>
        ))}
      </ul>
      <CodeBlock title="Add the crates" lang="shell" code={CARGO_ADD} />
      <CodeBlock title="Or in Cargo.toml" lang="toml" code={CARGO_TOML} />
      <p>
        <code>cargo install contextgraph-conformance</code> installs{" "}
        <code>contextgraph-inspect</code>. Depend on the major, as in{" "}
        <code>contextgraph-types = &quot;{CRATE_MAJOR}&quot;</code>, and
        upgrade within {CRATE_MAJOR}.x as usual. Only {CRATE_MAJOR}.x receives
        security fixes. The reference providers and the MCP bridge and server
        stay in the repository and are not published.
      </p>

      <h2>The host side</h2>
      <p>
        <code>contextgraph-host</code> is the Rust host runtime: provider
        discovery, stdio and streamable-HTTP transports, capability
        negotiation, budget-honest fan-out routing, and egress consent
        gating. Register providers in-process, as child processes, or as
        remote HTTP endpoints; <code>query_all</code> fans out concurrently
        with per-provider isolation — a crashed child never affects the
        others — and classifies budget liars so their frames are dropped and
        reported.
      </p>
      <p>
        Composition is deterministic: frames are emitted in canonical{" "}
        <code>FrameId</code> order, independent of arrival order, inside
        explicit <code>&lt;frame&gt;</code> fences as quoted material. Stable
        prefixes turn provider prompt caches from an accident into a contract
        — the worked example in the{" "}
        <a href={`${GITHUB_URL}/blob/main/docs/context-reuse.md`} target="_blank" rel="noopener">
          context-reuse note
        </a>{" "}
        shows a ~7× reduction on the context portion of a 20-turn session.
      </p>
      <DocsPager slug="sdks" />
    </>
  );
}
