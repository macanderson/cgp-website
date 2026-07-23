# Context Graph Protocol — microsite

The marketing and documentation microsite for the [Context Graph Protocol](https://github.com/macanderson/context-graph-protocol): an open wire protocol for context retrieval built on typed, budgeted, provenance-carrying frames.

**Live:** https://context-graph-protocol.vercel.app

## Stack

- [Next.js](https://nextjs.org) (App Router, fully static output)
- STIX Two Text + IBM Plex Mono via `next/font` (self-hosted at build time)
- No CSS framework — one hand-written design system in `app/globals.css`

## Structure

| Path | What it is |
| --- | --- |
| `app/` | Pages: home, `/docs/*` (6 documentation pages), `/research`, `/brand` |
| `components/` | Logo mark, hero figure, docs nav, code blocks, theme toggle |
| `public/brand/` | Brand assets — mark + horizontal/vertical lockups, light + dark SVG |
| `public/papers/` | The downloadable technical report (PDF) |
| `public/llms.txt` | AI-agent discovery index (llms-full.txt has complete docs) |
| `paper/` | HTML sources for the PDF, OG image, and apple icon |
| `scripts/gen-lockups.mjs` | Regenerates brand SVGs (cuts STIX Two Text to outlines via fontkit) |

## Develop

```sh
pnpm install
pnpm dev
```

## Regenerate artifacts

Brand lockups (requires macOS for the system STIX Two Text font):

```sh
node scripts/gen-lockups.mjs
```

Paper PDF and social images (requires Chrome):

```sh
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=public/papers/context-graph-protocol.pdf paper/paper.html
"$CHROME" --headless --screenshot=public/og/og-home.png \
  --window-size=1200,630 --hide-scrollbars paper/og.html
```

## License

Site code MIT. The Context Graph Protocol specification and implementations are MIT OR Apache-2.0; the technical report is CC BY 4.0.
