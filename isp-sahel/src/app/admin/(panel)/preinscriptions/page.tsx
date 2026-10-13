import { Icon } from "@/components/Icon";
import { Filtres, SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { requireStaff } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata = { title: "Pré-inscriptions" };

export default async function PreinscriptionsPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  await requireStaff(["admin"]);
  const { statut } = await searchParams;
  const supabase = await createSessionClient();
  let q = supabase.from("preinscriptions").select("id, nom, telephone, email, filiere, niveau, message, statut, created_at").order("created_at", { ascending: false }).limit(500);
  if (statut === "nouveau" || statut === "traite") q = q.eq("statut", statut);
  const { data } = await q;
  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-extrabold">Pré-inscriptions</h1>
        <a download href="/admin/export/preinscriptions" className="btn btn-primary"><Icon name="download" size={18} /> Exporter en CSV</a>
      </div>
      <Filtres base="/admin/preinscriptions" statut={statut} />
      <SubmissionsTable
        table="preinscriptions"
        rows={data ?? []}
        columns={[{ name: "telephone", label: "Téléphone" }, { name: "email", label: "E-mail" }, { name: "filiere", label: "Filière" }, { name: "niveau", label: "Niveau" }, { name: "message", label: "Message" }]}
      />
    </div>
  );
}
