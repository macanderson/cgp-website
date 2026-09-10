# 6. `cgp-website` owns `contextgraphprotocol.org`, and Vercel is not in the path

- Status: accepted
- Date: 2026-09-10

## Context

Issue #12 was filed as a P0 on 2026-07-23 and froze merges to `main`. Its
claim was that the Vercel project `oxagen/context-graph-protocol`
(`prj_s3lfCDvK9H9PwgvkpXiho1juiR63`) held `contextgraphprotocol.org` while its
Git integration pointed at *this* repository, so every push here silently
overwrote a hand-deployed fumadocs app that lived in
`macanderson/context-graph-protocol` under `site/`. The topology was deferred
to `macanderson/context-graph-protocol#57`, and #1 was blocked behind it.

Every element of that description has since stopped being true, in three
separate moves that were never written down in one place — which is why the
freeze outlived the hazard.

**The apex left Vercel.** The Vercel account was suspended over an unpaid
balance and every site behind it began answering `402`. The site was migrated
to S3 + CloudFront, and `9c2e44f` repointed the deploy at AWS account
`916294258235` after `oxagen-aws-infra` moved the infrastructure there.

**The competing app was deleted.** `macanderson/context-graph-protocol#57`
closed with the maintainer's decision recorded as **retire `site/`**, enacted
in that repository's #68. The `site/` copies of the protocol docs had drifted
stale rather than richer — they still documented the capability surface
ADR 0004 removed there — so the deletion removed wrong documentation, not
unique documentation. There is no second app that wants this domain.

**The freeze itself became the risk.** With merges to `main` stopped, the
deploy workflow that publishes the apex never ran, so the public site could
only drift further from the repository that is supposed to define it.

Observed 2026-09-10, which is the evidence this record rests on:

| host | answers |
| --- | --- |
| `contextgraphprotocol.org` | `200`, `server: AmazonS3`, `x-cache: … from cloudfront`, title from `app/layout.tsx` |
| `www.contextgraphprotocol.org` | `200`, same content, **no redirect** |
| `context-graph-protocol.vercel.app` | `402`, `x-vercel-error: DEPLOYMENT_DISABLED` |
| `cgp.oxagen.sh` | does not resolve — `NXDOMAIN` |
| `contextgraphprotocol.org/schema/contextgraph-envelope.schema.json` | `200` — published by the *protocol* repository into the same bucket |

## Decision

**This repository is the sole publisher of `contextgraphprotocol.org`.** The
path is `main` → `.github/workflows/deploy.yml` → `s3://cgp-site-916294258235`
→ CloudFront `E3FOT1HB57C89U`. Merging to `main` is a production change and is
meant to be one; the freeze in #12 is lifted.

**Vercel is not a fallback and nothing here may depend on it.** The
`.vercel.app` host is dead by suspension, the apex's DNS points at CloudFront,
and no Vercel deploy from any repository can reach it.

**The bucket has two tenants and the site is the guest.** `schema/` and
`spec/` under it belong to `macanderson/context-graph-protocol`. The
`--delete` sync in the deploy job excludes both; the deploy role is
additionally denied write and delete on those prefixes in IAM. The excludes
are the mechanism, the deny is the backstop, and dropping the excludes fails
the deploy loudly rather than 404-ing every schema URL the specification hands
out.

## Consequences

- `scripts/deploy-hygiene.test.ts` asserts the four properties above against
  the workflow file, so this record cannot quietly stop being true: the
  `schema/`+`spec/` excludes, `environment: production` (the OIDC subject the
  role trusts), `output: "export"` in `next.config.ts`, and the absence of any
  Vercel deploy artifact in the tree.
- Duplicate content across the apex and `www.` is now the *only* live host
  problem, and it is one 308 in CloudFront, not a code change here. Every page
  already emits `rel="canonical"` at the apex, which is what search engines
  read while that redirect does not exist. Tracked in #1.
- If a second site is ever wanted at this domain, it takes this bucket and
  this workflow, or it takes a different domain. "Two repositories, one
  domain, whoever pushed last" is the arrangement this record exists to
  prevent from recurring.
