import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEntity } from "../../actions";
import { Icon } from "@/components/Icon";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { GalleryBulkUpload } from "@/components/admin/GalleryBulkUpload";
import { requireStaff } from "@/lib/auth";
import { BADGE_LABELS, getEntity } from "@/lib/admin/entities";
import { formatDate } from "@/lib/format";
import { createSessionClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ entity: string }>; searchParams: Promise<{ ok?: string; supprime?: string }> };

export async function generateMetadata({ params }: Props) {
  return { title: getEntity((await params).entity)?.label ?? "Admin" };
}

export default async function EntityListPage({ params, searchParams }: Props) {
  const { entity } = await params;
  const config = getEntity(entity);
  if (!config) notFound();
  await requireStaff(config.roles);
  const sp = await searchParams;

  const supabase = await createSessionClient();
  let q = supabase.from(config.table).select("*");
  for (const o of config.orderBy) q = q.order(o.column, { ascending: o.ascending });
  const { data: rows, error } = await q.limit(500);

  const un = config.feminine ? "une" : "un";
  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-extrabold">{config.label}</h1>
        <Link href={`/admin/${config.key}/nouveau`} className="btn btn-primary"><Icon name="plus" size={18} /> Ajouter {un} {config.singular}</Link>
      </div>
      {sp.ok && <p role="status" className="mt-4 rounded-xl bg-success/10 p-3 font-semibold text-success">Enregistré avec succès.</p>}
      {sp.supprime && <p role="status" className="mt-4 rounded-xl bg-success/10 p-3 font-semibold text-success">Élément supprimé.</p>}
      {error && <p role="alert" className="mt-4 text-[#b42318]">Erreur de chargement : {error.message}</p>}

      {config.key === "galerie" && <GalleryBulkUpload />}

      <div className="relative mt-6 overflow-x-auto rounded-2xl bg-surface ring-1 ring-line">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-surface-2">
            <tr>
              {config.columns.map((c) => <th key={c.name} scope="col" className="p-3 font-semibold">{c.label}</th>)}
              <th scope="col" className="p-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).length === 0 && (
              <tr><td colSpan={config.columns.length + 1} className="p-6 text-center text-muted">Aucun élément pour le moment.</td></tr>
            )}
            {(rows ?? []).map((row) => (
              <tr key={row.id} className="border-t border-line align-middle">
                {config.columns.map((c) => {
                  const v = row[c.name];
                  return (
                    <td key={c.name} className="p-3">
                      {c.kind === "image" ? (
                        v ? <Image src={v} alt="" width={64} height={44} className="h-11 w-16 rounded object-cover" unoptimized /> : <span className="text-muted">—</span>
                      ) : c.kind === "bool" ? (
                        v ? <span className="badge badge-green">Oui</span> : <span className="badge badge-soft">Non</span>
                      ) : c.kind === "date" ? (
                        formatDate(v) || <span className="text-muted">—</span>
                      ) : c.kind === "badge" ? (
                        <span className="badge badge-soft">{BADGE_LABELS[v] ?? v}</span>
                      ) : (
                        <span className={c.name === config.titleField ? "font-semibold" : ""}>{v ?? <span className="text-muted">—</span>}</span>
                      )}
                    </td>
                  );
                })}
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/${config.key}/${row.id}`} className="btn btn-outline !px-3 !py-1.5 text-sm"><Icon name="edit" size={16} /> Modifier</Link>
                    <ConfirmButton
                      action={deleteEntity.bind(null, config.key, row.id)}
                      message={`Supprimer définitivement « ${row[config.titleField] || config.singular} » ?`}
                      className="btn btn-outline !px-3 !py-1.5 text-sm text-[#b42318]"
                    >
                      <Icon name="trash" size={16} /> <span className="sr-only">Supprimer {String(row[config.titleField] ?? "")}</span>
                    </ConfirmButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
