import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

const paths = ["", "/projects/chaoperty-handheld", "/projects/chaoperty-web-admin", "/demo", "/demo/handheld", "/demo/web-admin"];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((l) => paths.map((p) => ({ url: `${siteUrl}/${l}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })));
}
