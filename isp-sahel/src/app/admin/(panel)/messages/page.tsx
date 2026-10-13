import { Icon } from "@/components/Icon";
import { Filtres, SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { requireStaff } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata = { title: "Messages de contact" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  await requireStaff(["admin"]);
  const { statut } = await searchParams;
  const supabase = await createSessionClient();
  let q = supabase.from("messages_contact").select("id, nom, email, telephone, sujet, message, statut, created_at").order("created_at", { ascending: false }).limit(500);
  if (statut === "nouveau" || statut === "traite") q = q.eq("statut", statut);
  const { data } = await q;
  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-extrabold">Messages de contact</h1>
        <a download href="/admin/export/messages" className="btn btn-primary"><Icon name="download" size={18} /> Exporter en CSV</a>
      </div>
      <Filtres base="/admin/messages" statut={statut} />
      <SubmissionsTable
        table="messages_contact"
        rows={data ?? []}
        columns={[{ name: "email", label: "E-mail" }, { name: "telephone", label: "Téléphone" }, { name: "sujet", label: "Sujet" }, { name: "message", label: "Message" }]}
      />
    </div>
  );
}
