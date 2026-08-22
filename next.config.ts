import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,

  /**
   * The site is files. Every route prerenders — `next build` reports each one
   * as static — and it is served from S3 behind CloudFront with no server
   * anywhere in the path, so `export` is what the deployment target actually
   * is rather than an optimisation.
   *
   * It is set unconditionally, not behind an env flag. The bucket already held
   * an exported build, uploaded by hand during the migration off Vercel, that
   * this repository could not reproduce: `next build` alone writes `.next/`
   * and no `out/`. A deploy job would have had nothing to upload, and the
   * failure would have read as a broken workflow rather than a missing three
   * lines of configuration.
   *
   * `trailingSlash: false` above is why the output is `docs.html` rather than
   * `docs/index.html`, which is what the CloudFront function in front of the
   * bucket rewrites for (`url_rewrite_mode = "html_suffix"` in the CGP stack).
   * Changing one without the other serves 404s for every page but the root.
   */
  output: "export",

  /**
   * Deliberately not `headers()`. A static export has no server to apply
   * response headers, and Next only warns about the combination — it does not
   * fail the build, so the configuration would have looked live while doing
   * nothing at all.
   *
   * The two headers this replaced (`Content-Disposition: inline` and a
   * one-hour `Cache-Control` for `/papers/*`) belong at the edge now. The
   * upload sets cache lifetimes per object, and anything finer is a CloudFront
   * response-headers policy in `modules/static-site` — see
   * `oxagen-aws-infra`.
   */
};

export default nextConfig;
