import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/property";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
