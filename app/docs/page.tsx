import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { DocsPager } from "@/components/DocsPager";
import { GITHUB_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Introduction",
  description:
    "What the Context Graph Protocol (CGP) is: an open wire protocol for context retrieval built on typed, budgeted, provenance-carrying frames. The seven guarantees and how CGP composes with MCP.",
  alternates: { canonical: "/docs" },
};

export default function DocsIntro() {
  return (
    <>
      <span className="eyebrow">
        <span className="tick">01</span> Introduction
      </span>
      <h1>The Context Graph Protocol</h1>
      <p className="lede">
        An open wire protocol for context retrieval. A host asks providers for
        frames relevant to a goal, under a token budget; each provider returns
        frames that carry their own origin, their honest cost, and a
        human-readable citation label.
      </p>

      <p>
        CGP specifies <strong>context retrieval</strong>: typed, budgeted,
        provenance-carrying, consent-gated, conformance-verified frames that a
        host composes into a prompt. The unit of exchange is a{" "}
        <strong>frame</strong>, never a blob. A frame states what it is, where
        it came from, what it costs, when it was true, and how to cite it.
      </p>
      <p>
        The current revision is <code>contextgraph/1.0-draft</code>. The
        specification, reference implementation, conformance suite, and SDKs
        are dual-licensed <code>MIT OR Apache-2.0</code> and developed in the
        open at{" "}
        <a href={GITHUB_URL} target="_blank" rel="noopener">
          macanderson/context-graph-protocol
        </a>
        .
      </p>

      <h2>The seven guarantees</h2>
      <p>
        Every design decision in the protocol serves one of seven properties.
        They compose, and the combination is the point — remove any one and
        the trust model collapses back to the blob-pipe.
      </p>
      <ul>
        <li>
          <strong>Provenance.</strong> Frames carry a chain of origin records
          — file, URI, range, digest, derivation method — so every passage in
          a prompt can be traced to its source.
        </li>
        <li>
          <strong>Budget honesty.</strong> <code>token_cost</code> is computed
          by a canonical rule and the sum across frames must never exceed the
          query&rsquo;s <code>max_tokens</code>. Hosts drop the frames of any
          provider that lies, with a loud report.
        </li>
        <li>
          <strong>Consent enforcement.</strong> A provider declares its data
          flow — reads, writes, egress, egress scopes. A host must never
          auto-enable an egress provider or transmit a query before consent is
          recorded.
        </li>
        <li>
          <strong>Conformance.</strong> &ldquo;CGP conformant&rdquo; is a
          machine-checked claim, not a self-attestation.
        </li>
        <li>
          <strong>Citation.</strong> Every frame carries a human-readable{" "}
          <code>citation_label</code>, so the host can attribute what it used.
        </li>
        <li>
          <strong>Version stability.</strong> Versions interoperate if and
          only if they share a major family; additive changes are minor.
        </li>
        <li>
          <strong>Temporal validity.</strong> Frames may declare{" "}
          <code>valid_from</code> / <code>valid_to</code>, and queries may pin
          retrieval to an instant with <code>as_of</code>.
        </li>
      </ul>

      <h2>Scope: CGP and MCP compose</h2>
      <p>
        CGP does <em>not</em> specify tool invocation — that is the Model
        Context Protocol&rsquo;s scope, and CGP will not absorb it. MCP
        connects tools: an action protocol. CGP connects context: a
        retrieval-evidence protocol. An agent needing both composes them — CGP
        frames feed the prompt, MCP tools do the work.
      </p>
      <div className="callout">
        <strong>Frame content is untrusted data.</strong> A conforming host
        delimits frame content as quoted material, never as instructions — the
        same security principle that separates an email body from its headers.
        CGP makes that contract part of the protocol rather than leaving it to
        host discretion.
      </div>

      <h2>The shape of a session</h2>
      <p>
        A host opens with a handshake, the provider answers with its identity
        and capabilities, and only then do queries flow. Everything is a
        single JSON envelope per message.
      </p>
      <CodeBlock
        title="Lifecycle"
        code={`handshake  →  handshake_ack
query      →  frames        (repeated; correlated by id)
verify     →  verified      (optional, capability-gated)
shutdown`}
      />
      <p>
        Continue with{" "}
        <Link href="/docs/concepts">Core concepts</Link> for the frame model,
        or jump straight to the{" "}
        <Link href="/docs/sdks">SDK quickstarts</Link> to build a provider in
        TypeScript, Python, or Go.
      </p>
      <DocsPager slug="" />
    </>
  );
}
