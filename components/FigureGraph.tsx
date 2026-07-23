/**
 * Figure 1 — a context graph, drawn the way the spec defines it: frames as
 * nodes, labelled relations as edges. The accent node is the query anchor;
 * the open node is a `reference` representation frame (no inline content).
 * Edge labels use the six published `rel` names.
 */
const NODE_LABEL = {
  fontSize: 10.5,
  fontFamily: "var(--font-mono), ui-monospace, monospace",
} as const;

const EDGE_LABEL = {
  fontSize: 9,
  fontFamily: "var(--font-mono), ui-monospace, monospace",
} as const;

function Edge({
  x1,
  y1,
  x2,
  y2,
  label,
  lx,
  ly,
  delay,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  lx: number;
  ly: number;
  delay: number;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <g>
      <line
        className="edge"
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--muted)"
        strokeWidth={1.4}
        style={{ ["--edge-len" as string]: len, animationDelay: `${delay}ms` }}
      />
      <text {...EDGE_LABEL} x={lx} y={ly} fill="var(--faint)">
        {label}
      </text>
    </g>
  );
}

function Node({
  x,
  y,
  r = 8,
  variant,
  label,
  sub,
  tx,
  ty,
  anchor = "start",
  delay,
}: {
  x: number;
  y: number;
  r?: number;
  variant: "accent" | "filled" | "open";
  label: string;
  sub?: string;
  tx: number;
  ty: number;
  anchor?: "start" | "middle" | "end";
  delay: number;
}) {
  return (
    <g>
      {variant === "open" ? (
        <circle
          className="node"
          cx={x}
          cy={y}
          r={r}
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeWidth={3}
          style={{ animationDelay: `${delay}ms` }}
        />
      ) : (
        <circle
          className="node"
          cx={x}
          cy={y}
          r={r}
          fill={variant === "accent" ? "var(--accent)" : "var(--ink)"}
          style={{ animationDelay: `${delay}ms` }}
        />
      )}
      <text {...NODE_LABEL} x={tx} y={ty} textAnchor={anchor} fill="var(--ink)" fontWeight={600}>
        {label}
      </text>
      {sub ? (
        <text {...NODE_LABEL} x={tx} y={ty + 14} textAnchor={anchor} fill="var(--muted)">
          {sub}
        </text>
      ) : null}
    </g>
  );
}

export function FigureGraph() {
  return (
    <figure className="figure" aria-label="Diagram of a context graph">
      <svg viewBox="0 0 560 400" className="fig-anim" role="img">
        <title>
          A context graph: typed frames as nodes, labelled relations as edges,
          centred on a query anchor.
        </title>

        {/* edges (drawn first, under nodes) */}
        <Edge x1={168} y1={206} x2={296} y2={128} label="code.references" lx={196} ly={152} delay={150} />
        <Edge x1={312} y1={124} x2={352} y2={238} label="code.calls" lx={340} ly={180} delay={300} />
        <Edge x1={452} y1={182} x2={318} y2={126} label="doc.documents" lx={392} ly={140} delay={450} />
        <Edge x1={256} y1={322} x2={172} y2={220} label="code.references" lx={222} ly={282} delay={600} />
        <Edge x1={244} y1={334} x2={128} y2={350} label="episode.follows" lx={168} ly={326} delay={750} />

        {/* nodes */}
        <Node x={156} y={212} r={9} variant="accent" label="anchor" sub="file:///src/net.rs" tx={40} ty={186} delay={0} />
        <Node x={306} y={122} variant="filled" label="snippet" sub="retry_loop" tx={296} ty={94} delay={250} />
        <Node x={356} y={248} variant="filled" label="symbol" sub="Backoff" tx={372} ty={252} delay={400} />
        <Node x={460} y={186} r={10} variant="open" label="doc · reference" sub="runbook (by hash)" tx={452} ty={224} delay={550} />
        <Node x={258} y={330} variant="filled" label="episode" sub="incident-42" tx={274} ty={334} delay={700} />
        <Node x={116} y={352} r={6} variant="filled" label="episode" sub="incident-41" tx={52} ty={378} delay={850} />
      </svg>
      <figcaption className="figcaption">
        <span className="fig-n">Fig. 1</span> — A context graph. A graph frame
        is a node with its labelled edges; the host names anchors, and
        graph-capable providers boost frames within a few relation hops. The
        open node is a <code>reference</code> frame: no inline content, still
        verifiable by hash.
      </figcaption>
    </figure>
  );
}
