import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// `output: export` has no server to run a route handler at request time, so
// Next requires each metadata route to say outright that it is generated at
// build time. Without this the export fails with "export const dynamic =
// force-static ... not configured", and it fails for `robots.txt` first —
// which is misleading, because `sitemap.xml` needs it for exactly the same
// reason and is simply reached second.
export const dynamic = "force-static";

// Search engines and AI agents are both welcome here: the site exists to be
// discovered, quoted, and indexed. /llms.txt is the agent-oriented index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
