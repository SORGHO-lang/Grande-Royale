import { ParametresForm } from "@/components/admin/ParametresForm";
import { requireStaff } from "@/lib/auth";
import { PARAMETRES_LIBELLES, SEED_PARAMETRES } from "@/lib/seed-data";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata = { title: "Paramètres du site" };

export default async function ParametresPage() {
  await requireStaff(["admin"]);
  const supabase = await createSessionClient();
  const { data } = await supabase.from("parametres").select("cle, valeur");
  const values: Record<string, string> = { ...SEED_PARAMETRES };
  for (const r of data ?? []) values[r.cle] = r.valeur;
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-extrabold">Paramètres du site</h1>
      <p className="mt-1 text-muted">Chiffres clés, coordonnées, frais, calendrier académique et mot du Directeur Général.</p>
      <div className="mt-6"><ParametresForm values={values} labels={PARAMETRES_LIBELLES} /></div>
    </div>
  );
}
