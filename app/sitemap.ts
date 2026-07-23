import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const LAST_MODIFIED = new Date("2026-07-23");

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1.0 },
    { path: "/docs", priority: 0.9 },
    { path: "/docs/concepts", priority: 0.9 },
    { path: "/docs/wire-protocol", priority: 0.9 },
    { path: "/docs/schema", priority: 0.8 },
    { path: "/docs/conformance", priority: 0.8 },
    { path: "/docs/sdks", priority: 0.8 },
    { path: "/research", priority: 0.8 },
    { path: "/brand", priority: 0.4 },
  ];
  return routes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "weekly" as const,
    priority,
  }));
}
