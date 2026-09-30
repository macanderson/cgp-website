/**
 * The protocol and release facts the site quotes, kept in one place.
 *
 * Each value was read from macanderson/context-graph-protocol at
 * `PROTOCOL_SOURCE_COMMIT`, or from the registry named beside it on the date
 * given. When the protocol moves, change the value here and every page that
 * renders it follows. `public/llms.txt`, `public/llms-full.txt` and
 * `lib/og-cards.json` are static files that cannot import this module, so
 * `lib/protocol.test.ts` holds them to it instead.
 *
 * The pre-freeze name `contextgraph/1.0-draft` has no constant on purpose.
 * It is history and will not change, and pages spell it out so the test can
 * see every place it appears.
 */

/** The commit of the protocol repository's `main` these facts come from. */
export const PROTOCOL_SOURCE_COMMIT = "f2ca66d7a2ddc7fa166f0b019b9e57c0f59bb83f";

/** `contextgraph_types::PROTOCOL_VERSION` in `contextgraph-types/src/lib.rs`. */
export const PROTOCOL_VERSION = "contextgraph/1.0";

/** The protocol froze on this date (`GOVERNANCE.md`, "The contextgraph/1.0 freeze"). */
export const FREEZE_DATE = "2026-08-11";

/**
 * `[workspace.package] version` in `Cargo.toml`, and the version crates.io
 * serves for each published crate (published 2026-09-13, tag
 * `contextgraph-v2.0.0`).
 */
export const CRATE_VERSION = "2.0.0";

/** The major a `Cargo.toml` requirement names, e.g. `contextgraph-types = "2"`. */
export const CRATE_MAJOR = CRATE_VERSION.split(".")[0];

/** The workspace crates that set `publish = true`. Every other crate is unpublished. */
export const PUBLISHED_CRATES = [
  {
    name: "contextgraph-types",
    role: "wire types for frames, queries, capabilities, and provenance",
  },
  {
    name: "contextgraph-host",
    role: "host runtime with discovery, transports, negotiation, routing, and consent gating",
  },
  {
    name: "contextgraph-conformance",
    role: "conformance suite and the contextgraph-inspect binary",
  },
  {
    name: "contextgraph-trace",
    role: `host execution trace types and replay oracles, at sketch stage and outside the ${PROTOCOL_VERSION} stable surface`,
  },
] as const;

export function cratesIoUrl(name: string) {
  return `https://crates.io/crates/${name}`;
}

export function docsRsUrl(name: string) {
  return `https://docs.rs/${name}`;
}

/** The oldest Rust toolchain the crates build with (`rust-version` in `Cargo.toml`). */
export const RUST_MSRV = "1.90";

/**
 * What each SDK registry served when this was last checked. The source tree
 * declares 2.0.0 for the TypeScript and Python packages and for
 * `create-contextgraph-provider`; that release is not published yet.
 */
export const SDK_REGISTRY_CHECKED = "2026-09-29";

export const SDK_PUBLISHED_VERSION = "0.1.0";

/** Tracks the 2.0.0 SDK publish in the protocol repository. */
export const SDK_PUBLISH_ISSUE_URL =
  "https://github.com/macanderson/context-graph-protocol/issues/227";

export const PYPI_SDK_URL = "https://pypi.org/project/contextgraph-sdk/";

export const GO_SDK_URL =
  "https://pkg.go.dev/github.com/macanderson/context-graph-protocol/sdk/go/contextgraph";

/** `docs/stability.md`: the crate version and the protocol version are separate axes. */
export const STABILITY_DOC_URL =
  "https://github.com/macanderson/context-graph-protocol/blob/main/docs/stability.md";
