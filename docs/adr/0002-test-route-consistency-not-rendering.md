# 2. Test route consistency, and let the build test rendering

- Status: accepted
- Date: 2026-08-26

## Context

This repository shipped with no test script at all (issue #17). SCR-001 scopes
test runs to the touched module and SCR-003 requires scoped tests passing
before an issue closes; with no suite, both were satisfied only vacuously.

The obvious reading of "add a test suite" for a Next.js site is component
rendering tests — jsdom, `@testing-library/react`, a render per page. Before
adopting that, it is worth asking what is actually unprotected here.

Every route is prerendered. `next.config.ts` sets `output: "export"`, so
`next build` statically renders each page at build time, and the deploy
workflow already runs `pnpm build` on every pull request. **A component that
throws, a bad import, a server/client boundary violation, or an invalid hook
call already fails CI today.** Rendering tests would re-cover that ground with
a second, weaker renderer.

Weaker, specifically: the pages are React Server Components, several of them
async. `@testing-library/react` cannot render an async server component
directly, so a suite would either test client components only — a small
fraction of the site — or wrap pages in scaffolding that renders them
differently from how Next does. A test that renders the page a different way
than production does can go green while production is broken.

What *is* unprotected is agreement between the several independent lists that
describe the same routes:

- `lib/docs.ts` `DOCS` — drives the sidebar, the pager, and the ordinals.
- `app/docs/*/page.tsx` — decides which routes exist.
- `app/sitemap.ts` — a hardcoded route list, for crawlers.

Nothing forces these to agree, and a disagreement is invisible to the build. A
`DOCS` entry with no page compiles perfectly and puts a 404 in the sidebar. A
page missing from the sitemap builds, deploys, and is simply never indexed. A
sitemap row for a deleted page advertises a 404 to every crawler that reads
it. All three are silent until a human notices, and the sitemap ones may never
be noticed at all.

## Decision

The suite tests **consistency and pure logic**, not rendering.

- **Vitest, `environment: "node"`, no jsdom and no testing-library.** The
  checks need a filesystem, not a DOM.
- **Route-consistency tests read the real `app/` directory** rather than a
  fixture. A fixture listing the expected pages would drift from `app/` in
  precisely the way being guarded against, and would then assert its own
  staleness.
- **`next build` is the rendering test**, and the deploy workflow already runs
  it on every PR. This is recorded here so that "there are no rendering tests"
  reads as a decision rather than an omission.
- **Pure navigation logic is unit-tested** — `docHref` and `docNeighbors`,
  where the index page's empty-string slug makes every truthiness check a
  potential bug.
- **CI runs the suite before the build**, because it is the fast check and its
  failures are the more specific ones.

## Why durable

The tests assert relationships that must hold for the site to be correct, not
the current shape of any markup. Rewriting a page's JSX, restyling the
sidebar, or migrating the component library does not touch them; adding a doc
page correctly does not touch them either. They fail exactly when someone adds
a route to one list and not the others — the case they exist for.

That property is what makes them survive a decade. Rendering snapshots rot
with every visual change and train their readers to update them without
reading; these have no reason to change unless the site's routing contract
does.

They are also cheap enough to never be skipped: no DOM, no browser, no build
step, the whole suite in well under a second. A suite that is fast is a suite
that runs, and SCR-001's scoped inner loop only means anything if the scoped
run is quick.

Choosing not to add jsdom keeps the dependency surface at one devDependency.
`next build` is going to run in CI regardless, so the coverage it provides is
free; paying for a second, less faithful renderer to duplicate it is a cost
with no matching benefit.

## Consequences

- Client-component interaction (the theme toggle, code-block copy) is
  untested. Adding meaningful coverage there means a real browser —
  Playwright — not jsdom, and that is a larger decision to make when there is
  interaction worth protecting. Filed as residue.
- The route-consistency tests read the filesystem, so they must run from the
  repository. This is already true of the build.
- `docs/` markdown content is not validated. Link checking across the rendered
  export is a separate concern, also filed as residue.
