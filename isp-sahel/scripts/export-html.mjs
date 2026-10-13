/**
 * Exporte le site en HTML statique (+ PHP pour les formulaires) pour un
 * hébergement mutualisé classique (Hostinger, cPanel…), sans Node.js.
 *
 * Usage :
 *   npm run build && npx next start -p 3100   (dans un autre terminal, sans variables Supabase)
 *   node scripts/export-html.mjs http://localhost:3100 ../isp-sahel-html
 *
 * Le dossier produit se dépose tel quel dans public_html.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const base = (process.argv[2] || "http://localhost:3100").replace(/\/$/, "");
const out = path.resolve(process.argv[3] || path.join(root, "..", "isp-sahel-html"));
const tpl = path.join(root, "static-export");

const get = async (p) => {
  const res = await fetch(base + p);
  if (!res.ok && p !== "/page-inexistante") throw new Error(`${res.status} ${p}`);
  return res;
};

// ─── 1. Liste des pages (sitemap) ──────────────────────────────────────
const sitemap = await (await get("/sitemap.xml")).text();
const pages = [...sitemap.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
console.log(`${pages.length} pages à exporter`);

if (existsSync(out)) {
  // On conserve les éventuels fichiers déposés par l'établissement.
  for (const keep of ["documents/fichiers", "donnees"]) {
    if (existsSync(path.join(out, keep))) cpSync(path.join(out, keep), path.join(root, ".export-keep", keep), { recursive: true });
  }
  rmSync(out, { recursive: true, force: true });
}
mkdirSync(out, { recursive: true });

// ─── 2. Ressources fixes ───────────────────────────────────────────────
const IMAGE_DIRS = ["brand", "hero", "filieres", "gallery", "equipe", "partenaires"];
for (const dir of IMAGE_DIRS) cpSync(path.join(root, "public", dir), path.join(out, dir), { recursive: true });
cpSync(path.join(root, "src/app/favicon.ico"), path.join(out, "favicon.ico"));
cpSync(path.join(root, "public/anim.js"), path.join(out, "anim.js"));
cpSync(path.join(root, "src/app/icon.png"), path.join(out, "icon.png"));
cpSync(path.join(root, "src/app/apple-icon.png"), path.join(out, "apple-icon.png"));
writeFileSync(path.join(out, "og.png"), Buffer.from(await (await get("/opengraph-image")).arrayBuffer()));
cpSync(tpl, out, { recursive: true });
if (existsSync(path.join(root, ".export-keep"))) {
  cpSync(path.join(root, ".export-keep"), out, { recursive: true });
  rmSync(path.join(root, ".export-keep"), { recursive: true, force: true });
}

// ─── 3. Transformation du HTML ─────────────────────────────────────────
// Largeur d'origine de chaque image, pour générer des variantes WebP adaptées.
const BUCKETS = [128, 256, 640, 1080, 1600];
const imageWidths = new Map();
const variants = new Map();
for (const dir of IMAGE_DIRS) {
  for (const f of readdirSync(path.join(root, "public", dir))) {
    if (!/\.(jpe?g|png)$/i.test(f)) continue;
    imageWidths.set(`/${dir}/${f}`, (await sharp(path.join(root, "public", dir, f)).metadata()).width);
  }
}

let cssHref = null;
const decode = (s) => s.replace(/&amp;/g, "&");

async function transform(html) {
  html = html.replace(/<!-- -->/g, "");
  // Feuille de style unique
  html = html.replace(/<link rel="stylesheet" href="(\/_next\/static\/css\/[^"]+)"[^>]*\/?>/g, (_, href) => {
    cssHref = href;
    return '<link rel="stylesheet" href="/assets/css/site.css"/>';
  });
  // Scripts Next.js (on garde uniquement le JSON-LD)
  html = html.replace(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g, "");
  html = html.replace(/<link[^>]+(\/_next\/static\/chunks|as="script"|as="image")[^>]*\/?>/g, "");
  html = html.replace(/<meta name="next-size-adjust"[^>]*\/?>/g, "");
  // Thème + script du site
  html = html.replace("</head>", '<script src="/assets/js/theme.js"></script><script src="/assets/js/site.js" defer></script><script src="/anim.js" defer></script></head>');
  // Images : variantes WebP redimensionnées (srcset) + fichier d'origine en secours (src)
  html = html.replace(/\s(?:srcSet|srcset)="([^"]*)"/g, (_, set) => {
    const seen = new Set();
    const out = [];
    for (const cand of decode(set).split(/,\s*/)) {
      const m = /^\/_next\/image\?url=([^&]+)&w=(\d+)\S*\s+(\S+)$/.exec(cand.trim());
      if (!m) continue;
      const file = decodeURIComponent(m[1]);
      const orig = imageWidths.get(file);
      if (!orig) continue;
      const bucket = BUCKETS.find((b) => b >= Number(m[2])) ?? BUCKETS[BUCKETS.length - 1];
      const width = Math.min(bucket, orig);
      const url = `/img/${width}${file.replace(/\.(jpe?g|png)$/i, ".webp")}`;
      if (seen.has(url)) continue;
      seen.add(url);
      variants.set(url, { file, width });
      out.push(m[3].endsWith("w") ? `${url} ${width}w` : `${url} ${m[3]}`);
    }
    return out.length ? ` srcset="${out.join(", ")}"` : "";
  });
  html = html.replace(/\/_next\/image\?url=([^&"]+)[^"]*/g, (_, u) => decodeURIComponent(decode(u)));
  // Icônes et image de partage (URL avec empreinte)
  html = html.replace(/\/icon\.png\?[^"]*/g, "/icon.png").replace(/\/apple-icon\.png\?[^"]*/g, "/apple-icon.png");
  html = html.replace(/https?:\/\/[^"]*\/opengraph-image\?[^"]*/g, "https://ispsahel.com/og.png");
  // Pas d'espace admin dans la version HTML
  html = html.replace(/<li><a[^>]*href="\/admin"[^>]*>[\s\S]*?<\/a><\/li>/g, "");
  html = html.replace(/<p[^>]*><a[^>]*href="\/admin"[^>]*>Espace admin<\/a><\/p>/g, "");
  // Formulaires → envoi.php
  html = html.replace(/<input type="hidden" name="\$ACTION[^>]*\/?>/g, "");
  html = html.replace(/<form([^>]*?)\saction="[^"]*"([^>]*?)\sencType="multipart\/form-data" method="POST">/g, (m, a, b) => {
    return `<form${a}${b} action="/envoi.php" method="post" data-form="1">`;
  });
  html = html.replace(/(<form[^>]*data-form="1">)([\s\S]*?)(<\/form>)/g, (m, open, body, close) => {
    const type = body.includes('name="niveau"') ? "preinscription" : "contact";
    return `${open.replace('data-form="1"', `data-form="${type}"`)}<input type="hidden" name="formulaire" value="${type}"/>${body}${close}`;
  });
  return html;
}

// Correspondances pour la version HTML :
//  - nom de filière → slug (présélection du formulaire via ?filiere=)
//  - document → nom de fichier attendu dans documents/fichiers/
const slugify = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/['’]/g, "-")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-").slice(0, 80).replace(/-+$/g, "");
const unescape = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const formationsHtml = (await (await get("/formations")).text()).replace(/<!-- -->/g, "");
const filiereSlugs = new Map([...formationsHtml.matchAll(/<a[^>]*aria-label="En savoir plus sur la filière ([^"]+)"[^>]*href="\/formations\/([a-z0-9-]+)"/g)].map((m) => [unescape(m[1]), m[2]]));
const documentsHtml = (await (await get("/documents")).text()).replace(/<!-- -->/g, "");
const docRows = [...documentsHtml.matchAll(/<li class="flex flex-col gap-3 p-4[^"]*">([\s\S]*?)<\/li>/g)].map((m) => {
  const titre = unescape(/<p class="font-semibold">([^<]+)<\/p>/.exec(m[1])?.[1] ?? "");
  const filiere = unescape(/<span>Filière : ([^<]+)<\/span>/.exec(m[1])?.[1] ?? "");
  return { titre, filiere, fichier: slugify(titre) };
});
const programmeParFiliere = new Map(docRows.filter((d) => d.filiere).map((d) => [d.filiere, d.fichier]));

function enrich(html) {
  // Options de filière : data-slug
  html = html.replace(/<option value="([^"]+)">/g, (m, v) => (filiereSlugs.has(unescape(v)) ? `<option value="${v}" data-slug="${filiereSlugs.get(unescape(v))}">` : m));
  // Lignes de la page Documents : data-fichier
  html = html.replace(/<li class="(flex flex-col gap-3 p-4[^"]*)">([\s\S]*?<p class="font-semibold">([^<]+)<\/p>)/g, (m, cls, body, titre) => `<li class="${cls}" data-fichier="${slugify(unescape(titre))}">${body}`);
  // Fiche filière : bouton « Programme »
  const h1 = /<h1[^>]*>([^<]+)<\/h1>/.exec(html)?.[1];
  const prog = h1 && programmeParFiliere.get(unescape(h1));
  if (prog) html = html.replace(/<span class="btn btn-outline" aria-disabled="true">/, `<span class="btn btn-outline" aria-disabled="true" data-fichier="${prog}">`);
  return html;
}

const dest = (p) => (p === "/" ? path.join(out, "index.html") : path.join(out, p, "index.html"));
for (const p of pages) {
  const html = enrich(await transform(await (await get(p)).text()));
  mkdirSync(path.dirname(dest(p)), { recursive: true });
  writeFileSync(dest(p), html);
}
writeFileSync(path.join(out, "404.html"), await transform(await (await get("/page-inexistante")).text()));

// ─── 3 bis. Génération des variantes WebP ──────────────────────────────
for (const [url, { file, width }] of variants) {
  const dest = path.join(out, url);
  mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(path.join(root, "public", file)).resize({ width, withoutEnlargement: true }).webp({ quality: 76 }).toFile(dest);
}
console.log(`${variants.size} variantes d'images WebP générées`);

// ─── 4. CSS, flux RSS, sitemap, robots ─────────────────────────────────
mkdirSync(path.join(out, "assets/css"), { recursive: true });
writeFileSync(path.join(out, "assets/css/site.css"), await (await get(cssHref)).text());
mkdirSync(path.join(out, "actualites"), { recursive: true });
writeFileSync(path.join(out, "actualites/rss.xml"), await (await get("/actualites/rss.xml")).text());
writeFileSync(path.join(out, "sitemap.xml"), sitemap);
writeFileSync(path.join(out, "robots.txt"), "User-agent: *\nAllow: /\nDisallow: /donnees/\n\nSitemap: https://ispsahel.com/sitemap.xml\n");

// ─── 5. Contrôles ──────────────────────────────────────────────────────
const all = pages.map(dest).concat(path.join(out, "404.html"));
const leftovers = all.filter((f) => /_next\/|\$ACTION|self\.__next/.test(readFileSync(f, "utf8")));
if (leftovers.length) {
  console.error("Restes Next.js dans :", leftovers);
  process.exit(1);
}
writeFileSync(
  path.join(out, "documents/fichiers/NOMS-DES-FICHIERS.txt"),
  "Déposez ici les documents à télécharger, en les nommant EXACTEMENT ainsi\n(PDF de préférence ; Word, Excel, PowerPoint, ZIP acceptés aussi). Le bouton « Télécharger » apparaît tout seul.\n\n" +
    docRows.map((d) => `${d.fichier}.pdf   ←  ${d.titre}`).join("\n") + "\n",
);
console.log(`Export terminé → ${out}`);
