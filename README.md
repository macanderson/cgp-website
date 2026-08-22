# Context Graph Protocol — microsite

The marketing and documentation microsite for the [Context Graph Protocol](https://github.com/macanderson/context-graph-protocol): an open wire protocol for context retrieval built on typed, budgeted, provenance-carrying frames.

**Live:** https://contextgraphprotocol.org

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

## Deploy

`contextgraphprotocol.org` is S3 + CloudFront in AWS account `578673726240`. It
was on Vercel until that account was suspended over an unpaid balance and every
site behind it began answering `402`; Vercel is not a fallback and nothing here
may depend on it.

`.github/workflows/deploy.yml` publishes on every push to `main`, on manual
dispatch, and on a `protocol-updated` repository dispatch from
`macanderson/context-graph-protocol` — the rendered docs quote the
specification, so a protocol merge that did not rebuild this site would leave
the two describing different things.

Four things about that job are load-bearing:

- **`output: "export"` in `next.config.ts`.** Every route prerenders and the
  site is served from a bucket with no server anywhere in the path. `next build`
  without it writes `.next/` and no `out/`, so there would be nothing to
  upload. `app/robots.ts` and `app/sitemap.ts` additionally need
  `export const dynamic = "force-static"` or the export fails outright.
- **`trailingSlash: false` pairs with the CloudFront function.** It is why the
  output is `docs.html` rather than `docs/index.html`, which is the shape the
  distribution's URL rewrite expects. Changing one without the other serves 404s
  for every page but the root.
- **`environment: production` is what authenticates it.** There is no stored AWS
  key; the job exchanges its OIDC token for a session on `gha-deploy-cgp-website`,
  which trusts that exact subject and nothing else.
- **`schema/` and `spec/` are excluded from the sync.** They belong to the
  protocol repository, which publishes into this same bucket. Without the
  excludes, `--delete` would remove them silently. That role is also denied
  write on those prefixes in IAM, so dropping the flags fails the deploy rather
  than breaking the other repository's output.

Uploads run in two passes: fingerprinted assets under `/_next/static` cached for
a year, everything else `no-cache` so a deploy is visible immediately. The job
then waits for the CloudFront invalidation and re-checks the public hostname,
because a green `s3 sync` only proves bytes reached a bucket.

Infrastructure lives in the `oxagen-aws-infra` repository (`stacks/cgp`,
`stacks/ci-deploy`).

## License

Site code MIT. The Context Graph Protocol specification and implementations are MIT OR Apache-2.0; the technical report is CC BY 4.0.
