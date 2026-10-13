import Link from "next/link";
import { notFound } from "next/navigation";
import { saveEntity } from "../../../actions";
import { loadRelations } from "../load";
import { EntityForm } from "@/components/admin/EntityForm";
import { requireStaff } from "@/lib/auth";
import { getEntity } from "@/lib/admin/entities";

export const metadata = { title: "Ajouter" };

export default async function NewEntityPage({ params }: { params: Promise<{ entity: string }> }) {
  const config = getEntity((await params).entity);
  if (!config) notFound();
  await requireStaff(config.roles);
  const relations = await loadRelations(config);
  return (
    <div className="max-w-4xl">
      <Link href={`/admin/${config.key}`} className="text-sm text-link underline">← {config.label}</Link>
      <h1 className="mt-2 text-3xl font-extrabold">Ajouter {config.feminine ? "une" : "un"} {config.singular}</h1>
      <div className="mt-6">
        <EntityForm action={saveEntity.bind(null, config.key, null)} fields={config.fields} values={{}} relations={relations} backHref={`/admin/${config.key}`} />
      </div>
    </div>
  );
}
