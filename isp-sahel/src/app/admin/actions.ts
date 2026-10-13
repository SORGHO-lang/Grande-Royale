"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertStaff } from "@/lib/auth";
import { getEntity } from "@/lib/admin/entities";
import { parseEntityForm } from "@/lib/admin/parse";
import { PARAMETRES_LIBELLES } from "@/lib/seed-data";
import { hasServiceRole, isSupabaseConfigured, SUPABASE_URL } from "@/lib/supabase/config";
import { createServiceClient, createSessionClient } from "@/lib/supabase/server";
import { DOCUMENT_TYPES, extensionOf, IMAGE_TYPES, isSafeStoragePath, MAX_DOCUMENT_MB, MAX_IMAGE_MB, BUCKETS } from "@/lib/uploads";
import { clientIp, hashIp, rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export type AdminState = { status: "idle" | "error" | "success"; message?: string; errors?: Record<string, string> };

const mediaPrefix = () => (SUPABASE_URL ? `${SUPABASE_URL}/storage/v1/object/public/${BUCKETS.image}/` : "");

function revalidateSite() {
  revalidatePath("/", "layout");
}

// ─── Connexion / déconnexion ───────────────────────────────────────────
export async function login(_prev: AdminState, fd: FormData): Promise<AdminState> {
  if (!isSupabaseConfigured()) return { status: "error", message: "Supabase n'est pas configuré." };
  const parsed = z.object({ email: z.email(), password: z.string().min(6).max(200) }).safeParse({
    email: String(fd.get("email") ?? "").trim(),
    password: String(fd.get("password") ?? ""),
  });
  if (!parsed.success) return { status: "error", message: "E-mail ou mot de passe invalide." };

  const ip = hashIp(clientIp(await headers()));
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000).ok) {
    return { status: "error", message: "Trop de tentatives. Réessayez dans 15 minutes." };
  }
  const supabase = await createSessionClient();
  const { data: auth, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !auth.user) return { status: "error", message: "E-mail ou mot de passe incorrect." };
  const { data: profil } = await supabase.from("profils").select("role").eq("id", auth.user.id).maybeSingle();
  if (!profil) {
    await supabase.auth.signOut();
    return { status: "error", message: "Ce compte n'a pas accès à l'administration." };
  }
  redirect("/admin");
}

export async function logout() {
  if (isSupabaseConfigured()) await (await createSessionClient()).auth.signOut();
  redirect("/admin/connexion");
}

// ─── Vérification d'un fichier téléversé directement vers Storage ──────
async function verifyStoredFile(bucket: "documents" | "media", path: string) {
  if (!isSafeStoragePath(path)) return { error: "Chemin de fichier invalide." } as const;
  if (!hasServiceRole()) return { error: "Clé service_role manquante." } as const;
  const db = createServiceClient();
  const dir = path.slice(0, path.lastIndexOf("/"));
  const name = path.slice(path.lastIndexOf("/") + 1);
  const { data, error } = await db.storage.from(bucket).list(dir, { search: name, limit: 5 });
  const obj = data?.find((o) => o.name === name);
  if (error || !obj) return { error: "Fichier introuvable dans le stockage. Téléversez-le à nouveau." } as const;

  const meta = (obj.metadata ?? {}) as { size?: number; mimetype?: string };
  const ext = extensionOf(name);
  const types = bucket === "documents" ? DOCUMENT_TYPES : IMAGE_TYPES;
  const maxMb = bucket === "documents" ? MAX_DOCUMENT_MB : MAX_IMAGE_MB;
  const mime = (meta.mimetype ?? "").toLowerCase();
  if (!types[ext]?.includes(mime) || !meta.size || meta.size > maxMb * 1024 * 1024) {
    await db.storage.from(bucket).remove([path]);
    return { error: "Fichier refusé (type ou taille non autorisés). Il a été supprimé." } as const;
  }
  return { size: meta.size, mime } as const;
}

const publicPathFromUrl = (url: string | null | undefined) => {
  const prefix = mediaPrefix();
  return url && prefix && url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : null;
};

// ─── CRUD générique ────────────────────────────────────────────────────
export async function saveEntity(entityKey: string, id: string | null, _prev: AdminState, fd: FormData): Promise<AdminState> {
  const config = getEntity(entityKey);
  if (!config) return { status: "error", message: "Module inconnu." };
  let staff;
  try {
    staff = await assertStaff(config.roles);
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }

  const { data, errors } = parseEntityForm(config, fd, mediaPrefix());
  if (Object.keys(errors).length) return { status: "error", message: "Merci de corriger les champs indiqués.", errors };

  const supabase = await createSessionClient();
  let previous: Record<string, unknown> | null = null;
  if (id) {
    const { data: prev } = await supabase.from(config.table).select("*").eq("id", id).maybeSingle();
    if (!prev) return { status: "error", message: "Élément introuvable." };
    previous = prev;
  }

  // Images téléversées : vérification du type réel côté stockage.
  for (const f of config.fields.filter((x) => x.type === "image")) {
    const path = publicPathFromUrl(data[f.name] as string | null);
    if (path && data[f.name] !== previous?.[f.name]) {
      const check = await verifyStoredFile("media", path);
      if ("error" in check) return { status: "error", errors: { [f.name]: check.error! }, message: check.error };
    }
  }

  // Règles propres à certaines entités.
  if (config.table === "articles") {
    if (data.statut === "publie" && !data.publie_le) data.publie_le = (previous?.publie_le as string) ?? new Date().toISOString();
    if (!id) data.auteur_id = staff.id;
  }
  if (config.table === "documents") {
    if (!data.publie_le) data.publie_le = (previous?.publie_le as string) ?? new Date().toISOString();
    const path = data.chemin_storage as string | null;
    if (path && path !== previous?.chemin_storage) {
      const check = await verifyStoredFile("documents", path);
      if ("error" in check) return { status: "error", errors: { chemin_storage: check.error! }, message: check.error };
      data.mime = check.mime;
      data.taille = check.size;
      data.nom_fichier = String(fd.get("chemin_storage__nom") ?? "").trim().slice(0, 200) || path.split("/").pop();
    }
    if (!path) Object.assign(data, { mime: null, taille: null, nom_fichier: null });
  }

  const query = id ? supabase.from(config.table).update(data).eq("id", id) : supabase.from(config.table).insert(data);
  const { error } = await query;
  if (error) {
    console.error(`[admin] ${config.table} :`, error);
    const msg = error.code === "23505" ? "Cette adresse (slug) est déjà utilisée." : error.code === "42501" ? "Accès refusé." : "Enregistrement impossible.";
    return { status: "error", message: msg, errors: error.code === "23505" ? { slug: msg } : undefined };
  }

  // Ancien fichier remplacé : suppression du stockage.
  if (config.table === "documents" && previous?.chemin_storage && previous.chemin_storage !== data.chemin_storage) {
    await supabase.storage.from("documents").remove([previous.chemin_storage as string]);
  }

  revalidateSite();
  redirect(`/admin/${config.key}?ok=1`);
}

export async function deleteEntity(entityKey: string, id: string) {
  const config = getEntity(entityKey);
  if (!config) throw new Error("Module inconnu");
  await assertStaff(config.roles);
  const supabase = await createSessionClient();
  const { data: row } = await supabase.from(config.table).select("*").eq("id", id).maybeSingle();
  const { error } = await supabase.from(config.table).delete().eq("id", id);
  if (error) throw new Error("Suppression impossible");
  if (row && config.table === "documents" && row.chemin_storage) {
    await supabase.storage.from("documents").remove([row.chemin_storage]);
  }
  if (row && config.table === "galerie_photos") {
    const path = publicPathFromUrl(row.image_url);
    if (path) await supabase.storage.from("media").remove([path]);
  }
  revalidateSite();
  redirect(`/admin/${config.key}?supprime=1`);
}

// ─── Galerie : ajout multiple ──────────────────────────────────────────
export async function addGalleryPhotos(items: { url: string; legende: string; alt: string }[], album: string): Promise<AdminState> {
  await assertStaff(["admin", "editeur"]);
  const prefix = mediaPrefix();
  const albumClean = album.trim().slice(0, 100) || "Galerie";
  const rows = [];
  for (const it of items.slice(0, 50)) {
    if (!prefix || !it.url.startsWith(prefix)) return { status: "error", message: "Image invalide." };
    const check = await verifyStoredFile("media", decodeURIComponent(it.url.slice(prefix.length)));
    if ("error" in check) return { status: "error", message: check.error };
    const legende = it.legende.trim().slice(0, 300);
    rows.push({ image_url: it.url, legende, alt: it.alt.trim().slice(0, 300) || legende || `Photo — ${albumClean}`, album: albumClean });
  }
  const supabase = await createSessionClient();
  const { data: last } = await supabase.from("galerie_photos").select("ordre").order("ordre", { ascending: false }).limit(1).maybeSingle();
  const start = (last?.ordre ?? 0) + 1;
  const { error } = await supabase.from("galerie_photos").insert(rows.map((r, i) => ({ ...r, ordre: start + i })));
  if (error) return { status: "error", message: "Enregistrement impossible." };
  revalidateSite();
  return { status: "success", message: `${rows.length} photo(s) ajoutée(s).` };
}

// ─── Pré-inscriptions & messages ───────────────────────────────────────
export async function setStatut(table: "preinscriptions" | "messages_contact", id: string, statut: "nouveau" | "traite") {
  await assertStaff(["admin"]);
  const supabase = await createSessionClient();
  await supabase.from(table).update({ statut }).eq("id", id);
  revalidatePath(`/admin/${table === "preinscriptions" ? "preinscriptions" : "messages"}`);
}

export async function deleteSubmission(table: "preinscriptions" | "messages_contact", id: string) {
  await assertStaff(["admin"]);
  const supabase = await createSessionClient();
  await supabase.from(table).delete().eq("id", id);
  revalidatePath(`/admin/${table === "preinscriptions" ? "preinscriptions" : "messages"}`);
}

// ─── Paramètres du site ────────────────────────────────────────────────
export async function saveParametres(_prev: AdminState, fd: FormData): Promise<AdminState> {
  try {
    await assertStaff(["admin"]);
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
  const errors: Record<string, string> = {};
  const rows = Object.keys(PARAMETRES_LIBELLES).map((cle) => {
    const valeur = String(fd.get(cle) ?? "").trim();
    if (valeur.length > 10_000) errors[cle] = "Texte trop long";
    return { cle, valeur, libelle: PARAMETRES_LIBELLES[cle] };
  });
  const wa = rows.find((r) => r.cle === "whatsapp");
  if (wa && !/^\d{8,15}$/.test(wa.valeur)) errors.whatsapp = "Format attendu : indicatif + numéro, chiffres uniquement (ex. 22650393333).";
  const email = rows.find((r) => r.cle === "email");
  if (email && !z.email().safeParse(email.valeur).success) errors.email = "Adresse e-mail invalide";
  for (const k of ["telephone_1", "adresse", "frais_licence", "frais_master"]) {
    if (!rows.find((r) => r.cle === k)?.valeur) errors[k] = "Champ obligatoire";
  }
  if (Object.keys(errors).length) return { status: "error", message: "Merci de corriger les champs indiqués.", errors };

  const supabase = await createSessionClient();
  const { error } = await supabase.from("parametres").upsert(rows, { onConflict: "cle" });
  if (error) return { status: "error", message: "Enregistrement impossible." };
  revalidateSite();
  return { status: "success", message: "Paramètres enregistrés." };
}

// ─── Utilisateurs (admin uniquement) ───────────────────────────────────
export async function createStaffUser(_prev: AdminState, fd: FormData): Promise<AdminState> {
  try {
    await assertStaff(["admin"]);
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
  const parsed = z
    .object({
      email: z.email("E-mail invalide"),
      nom: z.string().trim().min(2, "Nom requis").max(120),
      role: z.enum(["admin", "editeur"]),
      password: z.string().min(10, "10 caractères minimum").max(200),
    })
    .safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Données invalides" };
  }
  if (!hasServiceRole()) return { status: "error", message: "Clé service_role manquante." };
  const admin = createServiceClient();
  const { data, error } = await admin.auth.admin.createUser({ email: parsed.data.email, password: parsed.data.password, email_confirm: true });
  if (error || !data.user) return { status: "error", message: error?.message ?? "Création impossible." };
  const { error: e2 } = await admin.from("profils").insert({ id: data.user.id, nom: parsed.data.nom, role: parsed.data.role });
  if (e2) return { status: "error", message: "Compte créé mais profil non enregistré." };
  revalidatePath("/admin/utilisateurs");
  return { status: "success", message: `Compte créé pour ${parsed.data.email}.` };
}

export async function updateStaffRole(id: string, role: "admin" | "editeur") {
  const me = await assertStaff(["admin"]);
  if (id === me.id) throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  const supabase = await createSessionClient();
  await supabase.from("profils").update({ role }).eq("id", id);
  revalidatePath("/admin/utilisateurs");
}

export async function deleteStaffUser(id: string) {
  const me = await assertStaff(["admin"]);
  if (id === me.id) throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  if (!hasServiceRole()) throw new Error("Clé service_role manquante.");
  await createServiceClient().auth.admin.deleteUser(id);
  revalidatePath("/admin/utilisateurs");
}
