import Link from "next/link";
import { Icon } from "@/components/Icon";
import { requireStaff } from "@/lib/auth";
import { ENTITIES } from "@/lib/admin/entities";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata = { title: "Tableau de bord" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ refus?: string }> }) {
  const staff = await requireStaff();
  const { refus } = await searchParams;
  const supabase = await createSessionClient();
  const entities = ENTITIES.filter((e) => e.roles.includes(staff.role));
  const counts = await Promise.all(entities.map((e) => supabase.from(e.table).select("id", { count: "exact", head: true })));
  const nouveaux =
    staff.role === "admin"
      ? await Promise.all([
          supabase.from("preinscriptions").select("id", { count: "exact", head: true }).eq("statut", "nouveau"),
          supabase.from("messages_contact").select("id", { count: "exact", head: true }).eq("statut", "nouveau"),
        ])
      : null;

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Bonjour{staff.nom ? `, ${staff.nom}` : ""} 👋</h1>
      <p className="mt-1 text-muted">Gérez les contenus du site de l&apos;ISP SAHEL.</p>
      {refus && <p role="alert" className="mt-4 rounded-xl bg-[#b42318]/10 p-3 font-semibold text-[#b42318]">Vous n&apos;avez pas accès à cette rubrique.</p>}

      {nouveaux && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href="/admin/preinscriptions" className="card flex items-center gap-4 p-5 hover:shadow-lg">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold text-navy"><Icon name="graduation" /></span>
            <span><span className="block text-2xl font-extrabold">{nouveaux[0].count ?? 0}</span><span className="text-muted">nouvelle(s) pré-inscription(s)</span></span>
          </Link>
          <Link href="/admin/messages" className="card flex items-center gap-4 p-5 hover:shadow-lg">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold text-navy"><Icon name="mail" /></span>
            <span><span className="block text-2xl font-extrabold">{nouveaux[1].count ?? 0}</span><span className="text-muted">nouveau(x) message(s)</span></span>
          </Link>
        </div>
      )}

      <h2 className="mt-10 text-xl font-bold">Contenus</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {entities.map((e, i) => (
          <li key={e.key}>
            <div className="card flex h-full flex-col p-5">
              <span className="flex items-center gap-2 font-semibold"><Icon name={e.icon} size={18} className="text-link" /> {e.label}</span>
              <span className="mt-2 text-3xl font-extrabold">{counts[i]?.count ?? 0}</span>
              <div className="mt-4 flex gap-2">
                <Link href={`/admin/${e.key}`} className="btn btn-outline !px-3 !py-1.5 text-sm">Gérer</Link>
                <Link href={`/admin/${e.key}/nouveau`} className="btn btn-primary !px-3 !py-1.5 text-sm" aria-label={`Ajouter : ${e.singular}`}><Icon name="plus" size={16} /> Ajouter</Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
