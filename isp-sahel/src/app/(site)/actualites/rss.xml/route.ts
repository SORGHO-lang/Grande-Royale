import { getArticles } from "@/lib/data";
import { SITE } from "@/lib/site";

export const revalidate = 600;

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET() {
  const { items } = await getArticles({ perPage: 30 });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Actualités — ISP SAHEL</title>
  <link>${SITE.url}/actualites</link>
  <atom:link href="${SITE.url}/actualites/rss.xml" rel="self" type="application/rss+xml"/>
  <description>${esc(SITE.presentation)}</description>
  <language>fr</language>
${items
  .map(
    (a) => `  <item>
    <title>${esc(a.titre)}</title>
    <link>${SITE.url}/actualites/${a.slug}</link>
    <guid isPermaLink="true">${SITE.url}/actualites/${a.slug}</guid>
    <pubDate>${new Date(a.publie_le ?? Date.now()).toUTCString()}</pubDate>
    ${a.categorie ? `<category>${esc(a.categorie.nom)}</category>` : ""}
    <description>${esc(a.extrait)}</description>
  </item>`,
  )
  .join("\n")}
</channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
