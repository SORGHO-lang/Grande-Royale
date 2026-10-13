import { deleteStaffUser, updateStaffRole } from "../../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { UserCreateForm } from "@/components/admin/UserCreateForm";
import { requireStaff } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata = { title: "Utilisateurs" };

export default async function UtilisateursPage() {
  const me = await requireStaff(["admin"]);
  const supabase = await createSessionClient();
  const { data: profils } = await supabase.from("profils").select("id, nom, role, created_at").order("created_at");
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-extrabold">Utilisateurs</h1>
      <p className="mt-1 text-muted">Comptes ayant accès à l&apos;administration. Il n&apos;y a pas d&apos;inscription publique.</p>
      <ul className="mt-6 divide-y divide-line rounded-2xl bg-surface ring-1 ring-line">
        {(profils ?? []).map((p) => (
          <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{p.nom || "Sans nom"} {p.id === me.id && <span className="badge badge-soft">vous</span>}</p>
              <p className="text-sm text-muted">{p.role === "admin" ? "Administrateur" : "Éditeur"}</p>
            </div>
            {p.id !== me.id && (
              <div className="flex gap-2">
                <form action={updateStaffRole.bind(null, p.id, p.role === "admin" ? "editeur" : "admin")}>
                  <button className="btn btn-outline !px-3 !py-1.5 text-sm" type="submit">{p.role === "admin" ? "Passer éditeur" : "Passer admin"}</button>
                </form>
                <ConfirmButton action={deleteStaffUser.bind(null, p.id)} message={`Supprimer le compte de ${p.nom ?? "cet utilisateur"} ?`} className="btn btn-outline !px-3 !py-1.5 text-sm text-[#b42318]">Supprimer</ConfirmButton>
              </div>
            )}
          </li>
        ))}
      </ul>
      <section className="card mt-8 p-6">
        <h2 className="text-xl font-bold">Ajouter un compte</h2>
        <div className="mt-4"><UserCreateForm /></div>
      </section>
    </div>
  );
}
