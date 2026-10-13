import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "./supabase/config";
import { createSessionClient } from "./supabase/server";
import type { Role } from "./types";

export type Staff = { id: string; email: string; nom: string | null; role: Role };

/** Utilisateur connecté ET présent dans `profils`, sinon null. */
export const getStaff = cache(async (): Promise<Staff | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profil } = await supabase.from("profils").select("nom, role").eq("id", user.id).maybeSingle();
  if (!profil) return null;
  return { id: user.id, email: user.email ?? "", nom: profil.nom, role: profil.role as Role };
});

/** Exige un compte du personnel (et éventuellement un rôle). Redirige sinon. */
export async function requireStaff(roles?: Role[]): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/admin/connexion");
  if (roles && !roles.includes(staff.role)) redirect("/admin?refus=1");
  return staff;
}

/** Variante pour les Server Actions : lève une erreur au lieu de rediriger. */
export async function assertStaff(roles?: Role[]): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) throw new Error("Non authentifié");
  if (roles && !roles.includes(staff.role)) throw new Error("Accès refusé");
  return staff;
}

export function canAccess(role: Role, allowed: Role[]): boolean {
  return allowed.includes(role);
}
