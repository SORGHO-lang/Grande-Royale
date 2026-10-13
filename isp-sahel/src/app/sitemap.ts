import type { MetadataRoute } from "next";
import { getArticles, getFilieres } from "@/lib/data";
import { NAV, SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [filieres, { items: articles }] = await Promise.all([getFilieres(), getArticles({ perPage: 500 })]);
  const now = new Date();
  return [
    ...NAV.map((n) => ({ url: `${SITE.url}${n.href === "/" ? "" : n.href}`, lastModified: now, changeFrequency: "weekly" as const, priority: n.href === "/" ? 1 : 0.8 })),
    ...filieres.map((f) => ({ url: `${SITE.url}/formations/${f.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...articles.map((a) => ({ url: `${SITE.url}/actualites/${a.slug}`, lastModified: a.publie_le ? new Date(a.publie_le) : now, changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: `${SITE.url}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE.url}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
