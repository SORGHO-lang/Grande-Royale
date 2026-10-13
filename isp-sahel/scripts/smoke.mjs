/**
 * Contrôle de chaque page dans un vrai navigateur, de 320 à 1440 px :
 * débordement horizontal, erreurs console, images sans alt, boutons sans nom.
 * Usage : node scripts/smoke.mjs [http://localhost:3000] [dossier-captures]
 */
import { chromium } from "@playwright/test";
const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const shots = process.argv[3];
const pages = ["/", "/institut", "/formations", "/formations/genie-civil-btp", "/admission", "/scolarite", "/vie-etudiante", "/partenaires", "/galerie", "/actualites", "/actualites/des-diplomes-reconnus-par-l-etat", "/documents", "/contact", "/mentions-legales", "/confidentialite", "/page-inexistante", "/admin/connexion"];
const widths = [320, 390, 768, 1024, 1440];
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let problems = 0;
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  for (const p of pages) {
    consoleErrors.length = 0;
    await page.goto(base + p, { waitUntil: "networkidle" });
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      noAlt: [...document.querySelectorAll("img:not([alt])")].length,
      unnamedButtons: [...document.querySelectorAll("button, a")].filter((b) => b.offsetParent !== null && !(b.textContent || "").trim() && !b.getAttribute("aria-label") && !b.querySelector("img[alt]:not([alt=''])")).map((b) => b.outerHTML.slice(0, 80)),
      lang: document.documentElement.lang,
      h1: document.querySelectorAll("h1").length,
    }));
    const errs = consoleErrors.filter((e) => !/404 \(Not Found\)/.test(e) || p !== "/page-inexistante");
    const issues = [];
    if (r.overflow > 0) issues.push(`débordement ${r.overflow}px`);
    if (r.noAlt) issues.push(`${r.noAlt} image(s) sans alt`);
    if (r.unnamedButtons.length) issues.push(`bouton/lien sans nom : ${r.unnamedButtons.join(" | ")}`);
    if (r.lang !== "fr") issues.push("lang≠fr");
    if (r.h1 !== 1) issues.push(`${r.h1} h1`);
    if (errs.length) issues.push(`console : ${errs.join(" | ").slice(0, 300)}`);
    if (issues.length) {
      problems++;
      console.log(`✗ ${w}px ${p} — ${issues.join(" ; ")}`);
    }
    if (shots && w === 390) await page.screenshot({ path: `${shots}/m${p.replace(/\//g, "_") || "_"}.png`, fullPage: true });
    if (shots && w === 1440) await page.screenshot({ path: `${shots}/d${p.replace(/\//g, "_") || "_"}.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log(problems ? `${problems} problème(s)` : `Toutes les pages sont conformes sur ${widths.join(", ")} px ✓`);
process.exit(problems ? 1 : 0);
