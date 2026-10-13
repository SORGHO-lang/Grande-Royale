import Link from "next/link";
import { notFound } from "next/navigation";
import { saveEntity } from "../../../actions";
import { loadRelations } from "../load";
import { EntityForm } from "@/components/admin/EntityForm";
import { requireStaff } from "@/lib/auth";
import { getEntity } from "@/lib/admin/entities";
import { toDatetimeLocal } from "@/lib/admin/parse";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata = { title: "Modifier" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditEntityPage({ params }: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await params;
  const config = getEntity(entity);
  if (!config || !UUID.test(id)) notFound();
  await requireStaff(config.roles);
  const supabase = await createSessionClient();
  const { data: row } = await supabase.from(config.table).select("*").eq("id", id).maybeSingle();
  if (!row) notFound();
  for (const f of config.fields) if (f.type === "datetime") row[f.name] = toDatetimeLocal(row[f.name]);
  const relations = await loadRelations(config);
  return (
    <div className="max-w-4xl">
      <Link href={`/admin/${config.key}`} className="text-sm text-link underline">← {config.label}</Link>
      <h1 className="mt-2 text-3xl font-extrabold">Modifier : {String(row[config.titleField] || config.singular)}</h1>
      {config.table === "articles" && row.statut === "publie" && (
        <p className="mt-2"><a href={`/actualites/${row.slug}`} target="_blank" className="text-sm text-link underline">Voir l&apos;article sur le site ↗</a></p>
      )}
      <div className="mt-6">
        <EntityForm action={saveEntity.bind(null, config.key, id)} fields={config.fields} values={row} relations={relations} backHref={`/admin/${config.key}`} />
      </div>
    </div>
  );
}
