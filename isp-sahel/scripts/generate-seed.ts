/**
 * Génère supabase/seed.sql à partir de src/lib/seed-data.ts.
 * Usage : npm run seed:sql
 * Le seed est idempotent (ON CONFLICT DO NOTHING) : il ne remplace jamais une
 * donnée modifiée depuis l'administration.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import {
  PARAMETRES_LIBELLES,
  SEED_ARTICLES,
  SEED_CATEGORIES,
  SEED_DOCUMENTS,
  SEED_EQUIPE,
  SEED_FILIERES,
  SEED_GALERIE,
  SEED_PARAMETRES,
  SEED_PARTENAIRES,
  SEED_TEMOIGNAGES,
} from "../src/lib/seed-data";

const lit = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return `array[${v.map(lit).join(", ")}]::text[]`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

function insert(table: string, rows: Record<string, unknown>[], conflict = "id"): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]!);
  const values = rows.map((r) => `  (${cols.map((c) => lit(r[c])).join(", ")})`).join(",\n");
  return `insert into public.${table} (${cols.join(", ")}) values\n${values}\non conflict (${conflict}) do nothing;\n`;
}

const strip = <T extends object>(rows: T[], omit: string[] = []) =>
  rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !omit.includes(k))));

const sql = [
  "-- ════════════════════════════════════════════════════════════════════",
  "-- ISP SAHEL — données de départ (généré par scripts/generate-seed.ts)",
  "-- Ne pas modifier à la main : éditez src/lib/seed-data.ts puis npm run seed:sql",
  "-- ════════════════════════════════════════════════════════════════════",
  "",
  insert(
    "parametres",
    Object.entries(SEED_PARAMETRES).map(([cle, valeur]) => ({ cle, valeur, libelle: PARAMETRES_LIBELLES[cle] ?? null })),
    "cle",
  ),
  insert("categories", strip(SEED_CATEGORIES)),
  // Les filières référencent leurs programmes (documents) : on insère d'abord sans le lien.
  insert("filieres", strip(SEED_FILIERES).map((f) => ({ ...f, programme_document_id: null }))),
  insert("documents", strip(SEED_DOCUMENTS)),
  ...SEED_FILIERES.filter((f) => f.programme_document_id).map(
    (f) => `update public.filieres set programme_document_id = ${lit(f.programme_document_id)} where id = ${lit(f.id)} and programme_document_id is null;`,
  ),
  "",
  insert("articles", strip(SEED_ARTICLES, ["categorie"])),
  insert("galerie_photos", strip(SEED_GALERIE)),
  insert("equipe", strip(SEED_EQUIPE)),
  insert("partenaires", strip(SEED_PARTENAIRES)),
  insert("temoignages", strip(SEED_TEMOIGNAGES)),
].join("\n");

const out = path.resolve(import.meta.dirname, "../supabase/seed.sql");
writeFileSync(out, sql);
console.log("Écrit :", out);
