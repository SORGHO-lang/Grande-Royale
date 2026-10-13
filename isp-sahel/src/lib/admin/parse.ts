import { slugify } from "../format";
import { sanitizeArticleHtml } from "../sanitize";
import { isSafeStoragePath } from "../uploads";
import type { EntityConfig } from "./entities";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LOCAL_IMAGE = /^\/[a-z0-9/_.-]+\.(jpe?g|png|webp|avif|svg)$/i;

export type ParseResult = { data: Record<string, unknown>; errors: Record<string, string> };

/**
 * Convertit et valide les données d'un formulaire d'administration
 * selon la configuration de l'entité (fonction pure, testée unitairement).
 *
 * @param mediaPrefix préfixe autorisé pour les images téléversées
 *   (ex. https://xxx.supabase.co/storage/v1/object/public/media/)
 */
export function parseEntityForm(config: EntityConfig, fd: FormData, mediaPrefix: string): ParseResult {
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  const raw = (name: string) => {
    const v = fd.get(name);
    return typeof v === "string" ? v.trim() : "";
  };

  for (const f of config.fields) {
    const v = raw(f.name);
    const fail = (msg: string) => (errors[f.name] = msg);

    if (f.type !== "boolean" && f.type !== "number" && f.type !== "slug" && f.required && !v) {
      fail("Champ obligatoire");
      continue;
    }
    if (f.max && v.length > f.max && f.type !== "richtext") {
      fail(`${f.max} caractères maximum`);
      continue;
    }

    switch (f.type) {
      case "text":
      case "textarea":
        data[f.name] = v || (f.required ? v : null);
        break;
      case "richtext":
        if (v.length > 200_000) fail("Contenu trop long");
        else data[f.name] = sanitizeArticleHtml(v);
        break;
      case "number": {
        const n = v === "" ? Number(f.defaultValue ?? 0) : Number.parseInt(v, 10);
        if (!Number.isFinite(n) || Math.abs(n) > 1_000_000) fail("Nombre invalide");
        else data[f.name] = n;
        break;
      }
      case "boolean":
        data[f.name] = v === "on" || v === "true" || v === "1";
        break;
      case "select":
        if (v && !f.options?.some((o) => o.value === v)) fail("Valeur non autorisée");
        else data[f.name] = v || null;
        break;
      case "relation":
        if (v && !UUID.test(v)) fail("Sélection invalide");
        else data[f.name] = v || null;
        break;
      case "image":
        if (v && !LOCAL_IMAGE.test(v) && !(mediaPrefix && v.startsWith(mediaPrefix) && !v.includes(".."))) fail("Image invalide : téléversez une image.");
        else data[f.name] = v || null;
        break;
      case "file":
        if (v && !isSafeStoragePath(v)) fail("Fichier invalide");
        else data[f.name] = v || null;
        break;
      case "lines":
        data[f.name] = v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 50);
        break;
      case "datetime": {
        if (!v) {
          data[f.name] = null;
          break;
        }
        // Ouagadougou est en UTC+0 toute l'année.
        const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) ? `${v}:00Z` : v;
        const t = Date.parse(iso);
        if (Number.isNaN(t)) fail("Date invalide");
        else data[f.name] = new Date(t).toISOString();
        break;
      }
      case "slug": {
        const s = slugify(v || raw(f.from ?? ""));
        if (!s) fail("Adresse invalide");
        else data[f.name] = s;
        break;
      }
      case "url":
        if (v && !/^https?:\/\/[^\s]+$/i.test(v)) fail("Adresse web invalide (doit commencer par https://)");
        else data[f.name] = v || null;
        break;
    }
  }
  return { data, errors };
}

/** Valeur d'un champ datetime-local à partir d'un ISO (UTC+0). */
export function toDatetimeLocal(iso: string | null | undefined): string {
  return iso ? new Date(iso).toISOString().slice(0, 16) : "";
}
