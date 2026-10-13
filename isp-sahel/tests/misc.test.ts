import { beforeEach, describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";
import { formatTaille, parseCalendrier, slugify, telHref, whatsappHref } from "@/lib/format";
import { hashIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { SEED_FILIERES, SEED_PARAMETRES, SEED_TEMOIGNAGES } from "@/lib/seed-data";
import { SITE } from "@/lib/site";

describe("limitation de débit", () => {
  beforeEach(() => resetRateLimit());
  it("bloque au-delà de la limite puis libère après la fenêtre", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 5; i++) expect(rateLimit("ip", 5, 60_000, t0 + i).ok).toBe(true);
    expect(rateLimit("ip", 5, 60_000, t0 + 10).ok).toBe(false);
    expect(rateLimit("autre-ip", 5, 60_000, t0 + 10).ok).toBe(true);
    expect(rateLimit("ip", 5, 60_000, t0 + 60_001).ok).toBe(true);
  });
  it("n'expose pas l'IP en clair", () => {
    expect(hashIp("196.28.1.1")).not.toContain("196");
    expect(hashIp("196.28.1.1")).toHaveLength(32);
  });
});

describe("formatage", () => {
  it("liens téléphone et WhatsApp", () => {
    expect(telHref("+226 50 39 33 33")).toBe("tel:+22650393333");
    expect(whatsappHref("22650393333", "Bonjour")).toBe("https://wa.me/22650393333?text=Bonjour");
  });
  it("tailles, slugs et calendrier", () => {
    expect(formatTaille(1536 * 1024)).toBe("1,5 Mo");
    expect(formatTaille(null)).toBe("—");
    expect(slugify("Génie civil – option BTP")).toBe("genie-civil-option-btp");
    expect(parseCalendrier("Octobre | Rentrée\nExamens")).toEqual([
      { periode: "Octobre", evenement: "Rentrée" },
      { periode: "À compléter", evenement: "Examens" },
    ]);
  });
});

describe("export CSV", () => {
  it("échappe les guillemets, points-virgules et neutralise les formules", () => {
    const csv = toCsv([{ a: 'Dit "bonjour"; ok', b: "=HYPERLINK(1)" }], [{ key: "a", label: "A" }, { key: "b", label: "B" }]);
    expect(csv.startsWith("\uFEFFA;B\r\n")).toBe(true);
    expect(csv).toContain('"Dit ""bonjour""; ok"');
    expect(csv).toContain("'=HYPERLINK(1)");
  });
});

describe("nettoyage HTML", () => {
  it("supprime scripts, gestionnaires d'événements et liens javascript", () => {
    const out = sanitizeArticleHtml('<h2 onclick="x()">T</h2><img src="x" onerror="y()"><a href="javascript:z()">a</a><a href="https://ex.com">b</a><iframe src="x"></iframe>');
    expect(out).not.toMatch(/onclick|onerror|javascript|iframe/);
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
  });
});

describe("données officielles (§2 du cahier des charges)", () => {
  it("reprend exactement les informations fournies", () => {
    expect(SITE.autorisation).toBe("2009-001550/MESSRS/SG/DGERS/DERr");
    expect(SITE.arrete).toBe("2010/098/MESSRS/SG/DGERS/DEPr");
    expect(SEED_PARAMETRES.telephone_1).toBe("+226 50 39 33 33");
    expect(SEED_PARAMETRES.telephone_2).toBe("+226 07 33 33 37");
    expect(SEED_PARAMETRES.email).toBe("contact@ispsahel.com");
    expect(SEED_PARAMETRES.frais_licence).toBe("350 000 F CFA");
    expect(SEED_PARAMETRES.frais_master).toBe("600 000 F CFA");
    expect(SEED_PARAMETRES.stat_etudiants).toBe("1 712");
    expect(SEED_FILIERES).toHaveLength(5);
  });
  it("publie les 4 témoignages validés par les personnes concernées", () => {
    expect(SEED_TEMOIGNAGES.map((t) => t.nom)).toEqual(["LOMPO Ezekiel", "Georges Kabré", "SANOU Rosine", "Diallo Fadima"]);
    expect(SEED_TEMOIGNAGES.every((t) => t.texte && /promotion 2026$/.test(t.fonction ?? ""))).toBe(true);
  });
});

describe("typographie française", () => {
  it("rend insécables les espaces autour des guillemets et avant : ;", async () => {
    const { typoFr } = await import("@/lib/format");
    expect(typoFr("« Bonjour » : oui ; non")).toBe("«\u00a0Bonjour\u00a0»\u00a0: oui\u00a0; non");
  });
});
