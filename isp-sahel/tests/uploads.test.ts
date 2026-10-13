import { describe, expect, it } from "vitest";
import { isSafeStoragePath, sanitizeFileName, storagePath, validateUpload } from "@/lib/uploads";

const MB = 1024 * 1024;

describe("validation des téléversements", () => {
  it("accepte les formats bureautiques autorisés", () => {
    const cases: [string, string][] = [
      ["programme.pdf", "application/pdf"],
      ["reglement.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      ["cours.pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
      ["notes.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      ["liste.csv", "text/csv"],
      ["lisez-moi.txt", "text/plain"],
      ["archives.zip", "application/zip"],
      ["ancien.doc", "application/msword"],
    ];
    for (const [name, type] of cases) expect(validateUpload({ name, type, size: MB }, "document"), name).toBeNull();
  });

  it("refuse les exécutables, les extensions déguisées et les incohérences MIME", () => {
    expect(validateUpload({ name: "virus.exe", type: "application/x-msdownload", size: 100 }, "document")).toMatch(/Format non autorisé/);
    expect(validateUpload({ name: "page.html", type: "text/html", size: 100 }, "document")).toMatch(/Format non autorisé/);
    expect(validateUpload({ name: "faux.pdf", type: "text/html", size: 100 }, "document")).toMatch(/ne correspond pas/);
    expect(validateUpload({ name: "image.svg", type: "image/svg+xml", size: 100 }, "image")).toMatch(/Format non autorisé/);
  });

  it("applique les limites de taille", () => {
    expect(validateUpload({ name: "gros.pdf", type: "application/pdf", size: 21 * MB }, "document")).toMatch(/trop volumineux/);
    expect(validateUpload({ name: "photo.jpg", type: "image/jpeg", size: 6 * MB }, "image")).toMatch(/trop volumineux/);
    expect(validateUpload({ name: "vide.pdf", type: "application/pdf", size: 0 }, "document")).toMatch(/vide/);
  });

  it("assainit les noms de fichiers", () => {
    expect(sanitizeFileName("../../etc/Règlement Intérieur (2026).PDF")).toBe("reglement-interieur-2026.pdf");
    expect(sanitizeFileName("C:\\Users\\x\\Été<script>.docx")).toBe("ete-script.docx");
    expect(sanitizeFileName("....pdf")).toBe("fichier.pdf");
  });

  it("produit des chemins de stockage sûrs et rejette les chemins piégés", () => {
    const p = storagePath("documents", "Guide de l'étudiant.pdf", "a1b2c3d4");
    expect(p).toMatch(/^documents\/\d{4}\/\d{2}\/a1b2c3d4-guide-de-l-etudiant\.pdf$/);
    expect(isSafeStoragePath(p)).toBe(true);
    expect(isSafeStoragePath("documents/../secret.pdf")).toBe(false);
    expect(isSafeStoragePath("/etc/passwd")).toBe(false);
  });
});
