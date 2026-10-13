/**
 * Génère les visuels de substitution (logo, favicon, photos).
 * À REMPLACER par les vrais fichiers de l'établissement (voir README §Assets).
 * Usage : npm run assets   (n'écrase pas un fichier existant, sauf --force)
 */
import sharp from "sharp";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pub = (p) => path.join(root, "public", p);
const force = process.argv.includes("--force");

const AFRICA =
  "M41 22 L50 20 L57 23 L63 22 L69 26 L73 33 L80 37 L78 43 L73 47 L71 55 L67 63 L63 71 L58 78 L53 79 L51 72 L50 64 L47 57 L43 55 L36 54 L30 51 L26 45 L27 37 L32 30 L36 25 Z M74 64 L77 61 L78 66 L75 71 L73 69 Z";

function leaves(side) {
  // Lauriers : une série d'ellipses le long d'un arc.
  const out = [];
  for (let i = 0; i < 9; i++) {
    const a = side === "l" ? 120 + i * 13 : 60 - i * 13;
    const rad = (a * Math.PI) / 180;
    const cx = 50 + 36 * Math.cos(rad);
    const cy = 50 + 36 * Math.sin(rad);
    const rot = a + 90;
    out.push(`<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="5" ry="2.2" transform="rotate(${rot.toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="#1e9a3c"/>`);
  }
  return out.join("");
}

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="49" fill="#f5b800"/>
  <circle cx="50" cy="50" r="45.5" fill="#14409a"/>
  <circle cx="50" cy="50" r="41" fill="none" stroke="#0a9de0" stroke-width="0.8"/>
  ${leaves("l")}${leaves("r")}
  <path d="${AFRICA}" fill="#f5b800" transform="translate(6 2) scale(0.88)"/>
  <text x="50" y="93" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="8" fill="#ffffff">ISP SAHEL</text>
</svg>`;

function photoSvg({ w, h, from, to, title, subtitle, motif }) {
  const motifs = {
    graduate: `<g transform="translate(${w * 0.5} ${h * 0.55})" fill="#0d2a6b" opacity="0.9">
        <circle cx="0" cy="-${h * 0.16}" r="${h * 0.09}" fill="#3b2a20"/>
        <path d="M-${h * 0.22} ${h * 0.45} Q-${h * 0.2} -${h * 0.02} 0 -${h * 0.05} Q${h * 0.2} -${h * 0.02} ${h * 0.22} ${h * 0.45} Z" fill="#14409a"/>
        <path d="M-${h * 0.07} -${h * 0.04} L-${h * 0.12} ${h * 0.45} L-${h * 0.04} ${h * 0.45} Z M${h * 0.07} -${h * 0.04} L${h * 0.12} ${h * 0.45} L${h * 0.04} ${h * 0.45} Z" fill="#f5b800"/>
        <path d="M-${h * 0.15} -${h * 0.25} L0 -${h * 0.31} L${h * 0.15} -${h * 0.25} L0 -${h * 0.19} Z" fill="#0d2a6b"/>
      </g>`,
    building: `<g fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="${w / 160}">
        <rect x="${w * 0.2}" y="${h * 0.35}" width="${w * 0.18}" height="${h * 0.5}"/><rect x="${w * 0.42}" y="${h * 0.2}" width="${w * 0.2}" height="${h * 0.65}"/><rect x="${w * 0.66}" y="${h * 0.45}" width="${w * 0.14}" height="${h * 0.4}"/>
        <path d="M${w * 0.1} ${h * 0.85} H${w * 0.9} M${w * 0.62} ${h * 0.12} V${h * 0.85} M${w * 0.62} ${h * 0.12} H${w * 0.85} V${h * 0.2}"/></g>`,
    map: `<g fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="${w / 200}">
        ${[0.2, 0.3, 0.4, 0.5, 0.6].map((r) => `<ellipse cx="${w * 0.5}" cy="${h * 0.55}" rx="${w * r * 0.6}" ry="${h * r * 0.5}"/>`).join("")}
        <path d="M${w * 0.5} ${h * 0.1} V${h * 0.95} M${w * 0.1} ${h * 0.55} H${w * 0.9}"/></g>`,
    code: `<g fill="#ffffff" fill-opacity="0.3" font-family="DejaVu Sans Mono, monospace" font-size="${h / 9}">
        <text x="${w * 0.12}" y="${h * 0.35}">&lt;/&gt; if (avenir) {</text><text x="${w * 0.18}" y="${h * 0.52}">  construire();</text><text x="${w * 0.12}" y="${h * 0.69}">}</text></g>`,
    chart: `<g fill="#ffffff" fill-opacity="0.3">${[0.3, 0.5, 0.4, 0.65, 0.55, 0.8].map((v, i) => `<rect x="${w * (0.15 + i * 0.12)}" y="${h * (0.9 - v)}" width="${w * 0.08}" height="${h * v}" rx="4"/>`).join("")}</g>`,
    network: `<g stroke="#ffffff" stroke-opacity="0.35" stroke-width="${w / 220}" fill="#ffffff" fill-opacity="0.3">
        ${[[0.2, 0.3], [0.5, 0.2], [0.8, 0.35], [0.3, 0.75], [0.7, 0.75], [0.5, 0.5]].map(([x, y]) => `<circle cx="${w * x}" cy="${h * y}" r="${h / 22}"/>`).join("")}
        <path fill="none" d="M${w * 0.2} ${h * 0.3} L${w * 0.5} ${h * 0.5} L${w * 0.5} ${h * 0.2} M${w * 0.8} ${h * 0.35} L${w * 0.5} ${h * 0.5} L${w * 0.3} ${h * 0.75} M${w * 0.5} ${h * 0.5} L${w * 0.7} ${h * 0.75}"/></g>`,
    crowd: `<g>${Array.from({ length: 7 }, (_, i) => {
        const x = w * (0.12 + i * 0.13);
        const y = h * (0.62 + (i % 2) * 0.04);
        return `<circle cx="${x}" cy="${y - h * 0.17}" r="${h * 0.06}" fill="#3b2a20"/><path d="M${x - h * 0.11} ${h} Q${x - h * 0.1} ${y - h * 0.08} ${x} ${y - h * 0.09} Q${x + h * 0.1} ${y - h * 0.08} ${x + h * 0.11} ${h} Z" fill="#14409a"/><path d="M${x - h * 0.03} ${y - h * 0.08} L${x - h * 0.06} ${h} L${x - h * 0.01} ${h} Z M${x + h * 0.03} ${y - h * 0.08} L${x + h * 0.06} ${h} L${x + h * 0.01} ${h} Z" fill="#f5b800"/><path d="M${x - h * 0.09} ${y - h * 0.25} L${x} ${y - h * 0.29} L${x + h * 0.09} ${y - h * 0.25} L${x} ${y - h * 0.21} Z" fill="#0d2a6b"/>`;
      }).join("")}</g>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <circle cx="${w * 0.9}" cy="${h * 0.1}" r="${h * 0.35}" fill="#f5b800" fill-opacity="0.18"/>
    ${motifs[motif] ?? ""}
    <rect x="0" y="${h - h * 0.16}" width="${w}" height="${h * 0.16}" fill="#0d2a6b" fill-opacity="0.55"/>
    <text x="${w * 0.04}" y="${h - h * 0.065}" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="${h * 0.055}" fill="#ffffff">${title}</text>
    <rect x="${w - h * 0.36}" y="${h * 0.03}" width="${h * 0.33}" height="${h * 0.07}" rx="${h * 0.035}" fill="#0d2a6b" fill-opacity="0.7"/>
    <text x="${w - h * 0.195}" y="${h * 0.077}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="${h * 0.032}" fill="#f5b800">${subtitle}</text>
  </svg>`;
}

async function write(rel, buf) {
  const file = pub(rel);
  if (existsSync(file) && !force) return console.log("conservé :", rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, buf);
  console.log("créé    :", rel);
}

const jpg = (svg) => sharp(Buffer.from(svg)).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

/** ICO contenant une image PNG 32×32 (format accepté par tous les navigateurs). */
async function ico(svg) {
  const data = await png(svg, 32);
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
  header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
  header.writeUInt32LE(data.length, 14); header.writeUInt32LE(22, 18);
  return Buffer.concat([header, data]);
}

const SUB = "Photo à remplacer";
const photos = [
  ["hero/diplomee.jpg", { w: 1200, h: 1400, from: "#0a9de0", to: "#0d2a6b", title: "Diplômée ISP SAHEL", subtitle: SUB, motif: "graduate" }],
  ["filieres/genie-civil-btp.jpg", { w: 1200, h: 750, from: "#14409a", to: "#0d2a6b", title: "Génie civil – BTP", subtitle: SUB, motif: "building" }],
  ["filieres/geometre-topographie.jpg", { w: 1200, h: 750, from: "#1e9a3c", to: "#0d2a6b", title: "Géomètre Topographie", subtitle: SUB, motif: "map" }],
  ["filieres/systemes-informatiques.jpg", { w: 1200, h: 750, from: "#0a9de0", to: "#14409a", title: "Systèmes Informatiques", subtitle: SUB, motif: "code" }],
  ["filieres/informatique-gestion.jpg", { w: 1200, h: 750, from: "#14409a", to: "#1e9a3c", title: "Informatique de Gestion", subtitle: SUB, motif: "chart" }],
  ["filieres/reseaux-telecoms.jpg", { w: 1200, h: 750, from: "#0d2a6b", to: "#0a9de0", title: "Réseaux &amp; Télécoms", subtitle: SUB, motif: "network" }],
];

await write("brand/logo.svg", Buffer.from(logoSvg));
await write("brand/logo.png", await png(logoSvg, 512));
await write("../src/app/icon.png", await png(logoSvg, 192));
await write("../src/app/apple-icon.png", await sharp(Buffer.from(logoSvg)).resize(180, 180).flatten({ background: "#ffffff" }).png().toBuffer());
await write("../src/app/favicon.ico", await ico(logoSvg));
for (const [rel, opts] of photos) await write(rel, await jpg(photoSvg(opts)));
