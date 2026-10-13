// Tests d'interaction de la version HTML (menu, thème, galerie, documents, formulaires).
// Usage : php -S localhost:8080 -t ../isp-sahel-html <routeur>  puis  node scripts/test-html.mjs
// Attention : envoie de vraies demandes de test (supprimer ensuite isp-sahel-html/donnees/*.csv).
import { chromium } from "@playwright/test";
const B = "http://localhost:8080";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
const ok = (cond, label) => console.log(`${cond ? "✓" : "✗"} ${label}`);

// Menu burger + lien actif
await p.goto(B + "/scolarite", { waitUntil: "networkidle" });
ok(await p.locator("nav[aria-label='Navigation rapide'] a[aria-current=page]").textContent() === "Scolarité", "lien actif dans la barre rapide");
await p.click("button[aria-controls=menu-mobile]");
ok(await p.locator("#menu-mobile").isVisible(), "menu burger s'ouvre");
await p.keyboard.press("Escape");
ok(!(await p.locator("#menu-mobile").isVisible()), "Échap ferme le menu");
ok((await p.locator("a[href='/admin']").count()) === 0, "aucun lien vers l'admin");

// Mode sombre persistant
await p.click("header button[aria-pressed]");
ok((await p.evaluate(() => document.documentElement.dataset.theme)) === "dark", "mode sombre activé");
await p.goto(B + "/", { waitUntil: "networkidle" });
ok((await p.evaluate(() => document.documentElement.dataset.theme)) === "dark", "mode sombre mémorisé");
await p.click("header button[aria-pressed]");

// Galerie
await p.goto(B + "/galerie", { waitUntil: "networkidle" });
await p.click("button[aria-label^='Agrandir la photo']");
ok(await p.locator("dialog[open]").isVisible(), "visionneuse ouverte");
await p.keyboard.press("ArrowRight");
ok((await p.locator("dialog p[aria-live]").textContent()).startsWith("2 /"), "flèche → photo suivante");
await p.keyboard.press("Escape");
ok((await p.locator("dialog[open]").count()) === 0, "Échap ferme la visionneuse");

// Documents : recherche, filtre, fichier déposé
await p.goto(B + "/documents", { waitUntil: "networkidle" });
await p.fill("#doc-recherche", "reglement");
ok((await p.locator("section[aria-labelledby^='rub-'] li:visible").count()) === 1, "recherche « reglement » → 1 résultat");
await p.fill("#doc-recherche", "");
await p.selectOption("#doc-rubrique", "programme");
ok((await p.locator("section[aria-labelledby^='rub-'] li:visible").count()) === 5, "filtre Programmes → 5");
await p.selectOption("#doc-rubrique", "toutes");
const dl = p.locator("li[data-fichier=reglement-interieur] a[download]");
ok((await dl.count()) === 1 && (await dl.getAttribute("href")) === "/documents/fichiers/reglement-interieur.pdf", "document déposé → bouton Télécharger");
ok(/Taille : \d+ Ko/.test(await p.locator("li[data-fichier=reglement-interieur]").textContent()), "taille affichée");

// Actualités : filtre
await p.goto(B + "/actualites?categorie=evenement", { waitUntil: "networkidle" });
ok((await p.locator("main article.card:visible").count()) === 0 && (await p.getByText("Aucun article dans cette rubrique").count()) === 1, "filtre catégorie vide");
await p.goto(B + "/actualites?categorie=annonce", { waitUntil: "networkidle" });
ok((await p.locator("main article.card:visible").count()) === 2, "filtre Annonce → 2 articles");

// Pré-inscription
await p.goto(B + "/admission?filiere=informatique-de-gestion#preinscription", { waitUntil: "networkidle" });
const f = p.locator("form[data-form=preinscription]");
ok((await f.locator("select[name=filiere]").inputValue()) === "Informatique de Gestion", "filière présélectionnée");
await f.locator("button[type=submit]").click();
ok((await f.locator(".field-error").count()) === 3, "3 erreurs de validation côté navigateur");
await f.locator("input[name=nom]").fill("Awa Test");
await f.locator("input[name=telephone]").fill("+226 70 00 00 00");
await f.locator("select[name=niveau]").selectOption("Master");
await p.waitForTimeout(2100);
await f.locator("button[type=submit]").click();
await p.waitForSelector("form[data-form=preinscription] .text-success", { timeout: 10000 });
ok(true, "pré-inscription envoyée : " + (await f.locator(".text-success").textContent()).trim().slice(0, 60));

// Contact avec sujet
await p.goto(B + "/contact?sujet=Devenir%20partenaire", { waitUntil: "networkidle" });
const c = p.locator("form[data-form=contact]");
ok((await c.locator("input[name=sujet]").inputValue()) === "Devenir partenaire", "sujet prérempli");
await c.locator("input[name=nom]").fill("Jean");
await c.locator("input[name=email]").fill("jean@example.com");
await c.locator("textarea[name=message]").fill("Bonjour, nous souhaitons devenir partenaires.");
await p.waitForTimeout(2100);
await c.locator("button[type=submit]").click();
await p.waitForSelector("form[data-form=contact] .text-success", { timeout: 10000 });
ok(true, "message de contact envoyé");

// Programme sur fiche filière (aucun fichier) : reste « bientôt disponible »
await p.goto(B + "/formations/genie-civil-btp", { waitUntil: "networkidle" });
ok((await p.getByText("Programme (PDF) bientôt disponible").count()) === 1, "programme absent → bientôt disponible");

ok(errs.length === 0, "aucune erreur JavaScript" + (errs.length ? " : " + errs.join(" | ") : ""));
await b.close();
