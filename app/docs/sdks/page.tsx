import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { DocsPager } from "@/components/DocsPager";
import { GITHUB_URL, NPM_TS_SDK_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "SDKs & host",
  description:
    "Build a CGP provider in TypeScript, Python, or Go with zero-dependency SDKs, and run providers with the Rust host: fan-out routing, consent gating, deterministic composition.",
  alternates: { canonical: "/docs/sdks" },
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
    query: { kinds: ["doc"] }, correlation: true, verify: true,
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
        return {"query": {"kinds": ["doc"]},
                "correlation": True, "verify": True}

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

func (myProvider) Query(_ cg.ContextQuery) cg.ContextQueryResult {
	content := "Install the binding, then implement the required methods."
	return cg.ContextQueryResult{Frames: []cg.ContextFrame{{
		ID: "doc:1", Kind: "doc", Title: "Getting started",
		Content: content, Score: 0.9,
		TokenCost:     cg.BudgetTokens(content),
		CitationLabel: "start.md L1-10"}}}
}

func main() { cg.RunStdioProvider(myProvider{}) }`;

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

      <h2>TypeScript</h2>
      <p>
        Published on npm as{" "}
        <a href={NPM_TS_SDK_URL} target="_blank" rel="noopener">
          <code>@contextgraphprotocol/typescript-sdk</code>
        </a>
        .
      </p>
      <CodeBlock
        title="npm install @contextgraphprotocol/typescript-sdk"
        lang="typescript"
        code={TS}
      />

      <h2>Python</h2>
      <p>
        The <code>contextgraph_sdk</code> package lives in the repository
        under <code>sdk/python</code> — stdlib-only, typed
        (<code>py.typed</code>). Any object with the three methods is a
        provider.
      </p>
      <CodeBlock title="sdk/python — contextgraph_sdk" lang="python" code={PY} />

      <h2>Go</h2>
      <p>
        Module{" "}
        <code>github.com/macanderson/context-graph-protocol/sdk/go/contextgraph</code>
        . Implement <code>cg.Verifier</code> to answer verification.
      </p>
      <CodeBlock title="sdk/go — package contextgraph" lang="go" code={GO} />

      <h2>Validate any of them</h2>
      <CodeBlock
        title="The shared oracle"
        lang="shell"
        code={`./.github/scripts/conformance-external.sh -- node dist/examples/example-docs.js
./.github/scripts/conformance-external.sh -- python3 examples/example_docs.py
./.github/scripts/conformance-external.sh -- ./cg-go-example`}
      />

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
