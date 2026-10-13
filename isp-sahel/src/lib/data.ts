import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "./supabase/config";
import { createPublicClient } from "./supabase/server";
import {
  SEED_ARTICLES,
  SEED_CATEGORIES,
  SEED_DOCUMENTS,
  SEED_EQUIPE,
  SEED_FILIERES,
  SEED_GALERIE,
  SEED_PARAMETRES,
  SEED_PARTENAIRES,
  SEED_TEMOIGNAGES,
} from "./seed-data";
import type {
  Article,
  Categorie,
  DocumentItem,
  Filiere,
  GaleriePhoto,
  MembreEquipe,
  Parametres,
  Partenaire,
  Temoignage,
} from "./types";

/**
 * Couche d'accès aux données publiques.
 * Avec Supabase : lecture via la clé anonyme (RLS = contenus publiés uniquement).
 * Sans Supabase (mode démo) : données du seed.
 */
async function query<T>(label: string, fallback: T, run: () => PromiseLike<{ data: unknown; error: unknown }>): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    const { data, error } = await run();
    if (error) throw error;
    return (data ?? fallback) as T;
  } catch (err) {
    console.error(`[data] ${label} :`, err);
    return fallback;
  }
}

const db = () => createPublicClient();
const byOrder = <T extends { ordre: number }>(a: T, b: T) => a.ordre - b.ordre;

export const getParametres = cache(async (): Promise<Parametres> => {
  const rows = await query<{ cle: string; valeur: string }[]>("parametres", [], () =>
    db().from("parametres").select("cle, valeur"),
  );
  const result: Parametres = { ...SEED_PARAMETRES };
  for (const row of rows) result[row.cle] = row.valeur;
  return result;
});

export const getFilieres = cache(async (): Promise<Filiere[]> =>
  query("filieres", SEED_FILIERES.filter((f) => f.publie).sort(byOrder), () =>
    db().from("filieres").select("*").eq("publie", true).order("ordre"),
  ),
);

export const getFiliere = cache(async (slug: string): Promise<Filiere | null> => {
  const all = await getFilieres();
  return all.find((f) => f.slug === slug) ?? null;
});

export const getCategories = cache(async (): Promise<Categorie[]> =>
  query("categories", [...SEED_CATEGORIES].sort(byOrder), () =>
    db().from("categories").select("*").order("ordre"),
  ),
);

function seedArticlesPublies(): Article[] {
  const now = Date.now();
  return SEED_ARTICLES.filter((a) => a.statut === "publie" && a.publie_le && Date.parse(a.publie_le) <= now)
    .map((a) => ({ ...a, categorie: SEED_CATEGORIES.find((c) => c.id === a.categorie_id) ?? null }))
    .sort((a, b) => Date.parse(b.publie_le!) - Date.parse(a.publie_le!));
}

const ARTICLE_COLUMNS = "id, slug, titre, extrait, contenu, image_url, categorie_id, statut, publie_le, categorie:categories(id, slug, nom, ordre)";

export async function getArticles(opts: { page?: number; perPage?: number; categorie?: string } = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = opts.perPage ?? 9;
  const from = (page - 1) * perPage;

  if (!isSupabaseConfigured()) {
    let items = seedArticlesPublies();
    if (opts.categorie) items = items.filter((a) => a.categorie?.slug === opts.categorie);
    return { items: items.slice(from, from + perPage), total: items.length, page, perPage };
  }

  try {
    let q = db()
      .from("articles")
      .select(opts.categorie ? ARTICLE_COLUMNS.replace("categorie:categories(", "categorie:categories!inner(") : ARTICLE_COLUMNS, { count: "exact" })
      .eq("statut", "publie")
      .lte("publie_le", new Date().toISOString())
      .order("publie_le", { ascending: false })
      .range(from, from + perPage - 1);
    if (opts.categorie) q = q.eq("categorie.slug", opts.categorie);
    const { data, error, count } = await q;
    if (error) throw error;
    return { items: (data ?? []) as unknown as Article[], total: count ?? 0, page, perPage };
  } catch (err) {
    console.error("[data] articles :", err);
    return { items: [] as Article[], total: 0, page, perPage };
  }
}

export const getArticle = cache(async (slug: string): Promise<Article | null> => {
  if (!isSupabaseConfigured()) return seedArticlesPublies().find((a) => a.slug === slug) ?? null;
  const rows = await query<Article[]>("article", [], () =>
    db()
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .eq("slug", slug)
      .eq("statut", "publie")
      .lte("publie_le", new Date().toISOString())
      .limit(1),
  );
  return rows[0] ?? null;
});

export const getDocuments = cache(async (): Promise<DocumentItem[]> =>
  query("documents", SEED_DOCUMENTS.filter((d) => d.visible), () =>
    db().from("documents").select("*").eq("visible", true).order("rubrique").order("titre"),
  ),
);

export const getGalerie = cache(async (): Promise<GaleriePhoto[]> =>
  query("galerie", SEED_GALERIE.filter((p) => p.publie).sort(byOrder), () =>
    db().from("galerie_photos").select("*").eq("publie", true).order("ordre").order("created_at"),
  ),
);

export const getEquipe = cache(async (): Promise<MembreEquipe[]> =>
  query("equipe", SEED_EQUIPE.filter((m) => m.publie).sort(byOrder), () =>
    db().from("equipe").select("*").eq("publie", true).order("ordre"),
  ),
);

export const getPartenaires = cache(async (): Promise<Partenaire[]> =>
  query("partenaires", SEED_PARTENAIRES.filter((p) => p.publie).sort(byOrder), () =>
    db().from("partenaires").select("*").eq("publie", true).order("ordre"),
  ),
);

export const getTemoignages = cache(async (): Promise<Temoignage[]> =>
  query("temoignages", SEED_TEMOIGNAGES.filter((t) => t.publie).sort(byOrder), () =>
    db().from("temoignages").select("*").eq("publie", true).order("ordre"),
  ),
);
