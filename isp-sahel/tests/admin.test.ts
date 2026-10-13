import { describe, expect, it } from "vitest";
import { canAccessEntity } from "./helpers";
import { ENTITIES, getEntity } from "@/lib/admin/entities";
import { parseEntityForm } from "@/lib/admin/parse";

const PREFIX = "https://projet.supabase.co/storage/v1/object/public/media/";
const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

describe("rôles", () => {
  it("l'éditeur n'accède qu'aux actualités, documents et galerie", () => {
    const editeur = ENTITIES.filter((e) => canAccessEntity("editeur", e.key)).map((e) => e.key).sort();
    expect(editeur).toEqual(["actualites", "documents", "galerie"]);
    expect(ENTITIES.every((e) => canAccessEntity("admin", e.key))).toBe(true);
  });
});

describe("analyse des formulaires d'administration", () => {
  const articles = getEntity("actualites")!;

  it("génère le slug, nettoie le HTML et convertit la date", () => {
    const { data, errors } = parseEntityForm(
      articles,
      fd({ titre: "Rentrée 2026 : c'est parti !", slug: "", statut: "publie", extrait: "Résumé", contenu: '<p>Ok<script>alert(1)</script><a href="javascript:x">l</a></p>', publie_le: "2026-10-01T08:30", image_url: "" }),
      PREFIX,
    );
    expect(errors).toEqual({});
    expect(data.slug).toBe("rentree-2026-c-est-parti");
    expect(data.contenu).not.toMatch(/script|javascript/);
    expect(data.publie_le).toBe("2026-10-01T08:30:00.000Z");
    expect(data.image_url).toBeNull();
  });

  it("refuse les valeurs hors liste, les images externes et les champs requis vides", () => {
    const { errors } = parseEntityForm(articles, fd({ titre: "", statut: "pirate", extrait: "x", image_url: "https://evil.example/x.jpg" }), PREFIX);
    expect(errors.titre).toBeDefined();
    expect(errors.statut).toBeDefined();
    expect(errors.image_url).toBeDefined();
  });

  it("accepte une image téléversée dans le bucket media", () => {
    const { errors, data } = parseEntityForm(getEntity("galerie")!, fd({ image_url: `${PREFIX}galerie/2026/10/abc-photo.jpg`, alt: "Photo", album: "Cérémonie" }), PREFIX);
    expect(errors).toEqual({});
    expect(data.publie).toBe(false); // case non cochée
    expect(data.ordre).toBe(0);
  });

  it("convertit les débouchés (une ligne = un élément) et valide les fichiers", () => {
    const { data } = parseEntityForm(getEntity("filieres")!, fd({ nom: "Test", description: "D", debouches: "Géomètre\n\n Topographe \n" }), PREFIX);
    expect(data.debouches).toEqual(["Géomètre", "Topographe"]);
    const docs = getEntity("documents")!;
    expect(parseEntityForm(docs, fd({ titre: "T", rubrique: "officiel", chemin_storage: "../x.pdf" }), PREFIX).errors.chemin_storage).toBeDefined();
    expect(parseEntityForm(docs, fd({ titre: "T", rubrique: "officiel", chemin_storage: "documents/2026/10/ab12-reglement.pdf" }), PREFIX).errors).toEqual({});
  });
});
