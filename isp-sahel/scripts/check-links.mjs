/**
 * Explore le site à partir de la page d'accueil et vérifie que chaque lien
 * interne, image et ressource répond (aucun lien mort).
 * Usage : npm run check:links -- [http://localhost:3000]
 */
const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const seen = new Map(); // url -> status
const queue = ["/", "/sitemap.xml", "/robots.txt", "/actualites/rss.xml", "/admin/connexion"];
const errors = [];

const extract = (html) => {
  const out = new Set();
  for (const m of html.matchAll(/\s(?:href|src)="([^"#]*)(?:#[^"]*)?"/g)) out.add(m[1]);
  for (const m of html.matchAll(/srcSet="([^"]+)"/gi)) for (const part of m[1].split(",")) out.add(part.trim().split(" ")[0]);
  return [...out].filter((u) => u && (u.startsWith("/") && !u.startsWith("//")) ).map((u) => u.replace(/&amp;/g, "&"));
};

while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  const res = await fetch(base + path, { redirect: "manual" }).catch((e) => ({ status: 0, e }));
  seen.set(path, res.status);
  if (res.status >= 400 || res.status === 0) {
    errors.push(`${res.status} ${path}`);
    continue;
  }
  const type = res.headers?.get?.("content-type") ?? "";
  if (type.includes("text/html")) {
    const html = await res.text();
    for (const link of extract(html)) {
      if (link.startsWith("/_next/static")) {
        if (!seen.has(link)) queue.push(link);
        continue;
      }
      if (!seen.has(link) && !queue.includes(link)) queue.push(link);
    }
  }
}
const pages = [...seen.keys()].filter((p) => !p.startsWith("/_next"));
console.log(`${seen.size} URL vérifiées (${pages.length} pages et ressources hors /_next).`);
if (errors.length) {
  console.error("Liens en erreur :\n" + errors.join("\n"));
  process.exit(1);
}
console.log("Aucun lien mort ✓");
