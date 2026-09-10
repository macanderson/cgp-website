import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * The deploy path is the one thing in this repository that a green build says
 * nothing about, and it is also the one thing that has already gone wrong:
 * issue #12 froze merges to `main` for seven weeks because nobody could say
 * from the tree alone what served the public apex.
 *
 * docs/adr/0006 records the answer. These tests are what stop that record from
 * quietly ceasing to be true — each one pins a property whose loss is silent
 * at the moment it happens and expensive later.
 */

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (p: string) => readFileSync(`${root}${p}`, "utf8");

const deployWorkflow = read(".github/workflows/deploy.yml");
const nextConfig = read("next.config.ts");
const site = read("lib/site.ts");

describe("the publish step cannot evict the protocol repository's output", () => {
  // `schema/` and `spec/` under this bucket belong to
  // macanderson/context-graph-protocol, which publishes into it separately.
  // `aws s3 sync --delete` removes anything the local build did not produce,
  // and deleting a file it did not expect is not an error — so without these
  // excludes every schema URL the specification hands out 404s, silently, on
  // the next merge here. The deploy role is additionally denied write on both
  // prefixes in IAM; that deny turns this from a silent break into a failed
  // job, but only the excludes keep the job passing.
  for (const prefix of ["schema/*", "spec/*"]) {
    it(`excludes ${prefix} from the --delete sync`, () => {
      expect(deployWorkflow).toContain(`--exclude '${prefix}'`);
    });
  }

  it("still runs the destructive sync with --delete, so the excludes matter", () => {
    expect(deployWorkflow).toContain("--delete");
  });
});

describe("the deploy authenticates the way the IAM role expects", () => {
  // There is no stored AWS key. The job exchanges its OIDC token for a session
  // on `gha-deploy-cgp-website`, whose trust policy names exactly one subject:
  // `repo:macanderson/cgp-website:environment:production`. Dropping the
  // `environment:` line reads like removing ceremony and actually removes the
  // claim the role matches on, so the deploy fails rather than loosens — but
  // it fails at the point where it is least obvious why.
  it("keeps the production environment that mints the trusted OIDC subject", () => {
    expect(deployWorkflow).toContain("environment: production");
  });

  it("assumes the role in the account the site was migrated to", () => {
    expect(deployWorkflow).toContain(
      "arn:aws:iam::916294258235:role/gha-deploy-cgp-website",
    );
  });

  it("verifies the public hostname after publishing, not just the bucket", () => {
    // A green `s3 sync` proves bytes reached a bucket. It says nothing about
    // DNS, TLS, or whether the distribution in front of it serves them.
    expect(deployWorkflow).toContain("https://contextgraphprotocol.org/");
  });
});

describe("the build produces something a bucket can hold", () => {
  it("keeps output: export, without which there is no out/ to upload", () => {
    expect(nextConfig).toMatch(/output:\s*"export"/);
  });

  it("names the apex as the canonical origin for every absolute URL", () => {
    expect(site).toContain('SITE_URL = "https://contextgraphprotocol.org"');
  });
});

describe("no Vercel deploy path can return", () => {
  // The apex was on Vercel until that account was suspended and every site
  // behind it began answering 402. What made #12 a P0 was not Vercel itself
  // but a *second* way to publish this domain: a project whose Git
  // integration pointed here, so whoever deployed last won. A committed
  // `vercel.json` or `.vercel/` link would re-create exactly that — a deploy
  // route that bypasses this workflow, its excludes, and its verification.
  for (const artifact of ["vercel.json", ".vercel", ".vercelignore"]) {
    it(`does not track ${artifact}`, () => {
      expect(existsSync(`${root}${artifact}`)).toBe(false);
    });
  }
});
