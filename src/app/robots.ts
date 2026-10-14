import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/th/shots/", "/en/shots/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
