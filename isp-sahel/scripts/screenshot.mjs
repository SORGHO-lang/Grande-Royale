// Capture d'écran d'une page (outil de développement).
// Usage : node scripts/screenshot.mjs <url> <sortie.png> [largeur] [--full] [--dark]
import { chromium } from "@playwright/test";
const [url, out, width = "390"] = process.argv.slice(2);
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: Number(width), height: 844 }, deviceScaleFactor: 1 });
if (process.argv.includes("--dark")) await page.addInitScript(() => localStorage.setItem("theme", "dark"));
await page.goto(url, { waitUntil: "networkidle" });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log(`débordement horizontal : ${overflow}px`);
await page.screenshot({ path: out, fullPage: process.argv.includes("--full") });
await browser.close();
