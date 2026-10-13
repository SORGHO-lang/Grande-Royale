import Link from "next/link";
import { deleteSubmission, setStatut } from "@/app/admin/actions";
import { formatDate, telHref } from "@/lib/format";
import { ConfirmButton } from "./ConfirmButton";

type Row = Record<string, string | null> & { id: string; statut: string; created_at: string };

export function SubmissionsTable({ table, rows, columns }: { table: "preinscriptions" | "messages_contact"; rows: Row[]; columns: { name: string; label: string }[] }) {
  return (
    <ul className="mt-6 grid gap-3">
      {rows.length === 0 && <li className="card p-6 text-center text-muted">Aucune demande pour ce filtre.</li>}
      {rows.map((r) => (
        <li key={r.id} className={`card p-5 ${r.statut === "nouveau" ? "border-l-4 border-l-gold" : "opacity-80"}`}>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <p className="text-lg font-bold">{r.nom}</p>
              <p className="text-sm text-muted">{formatDate(r.created_at)} · {new Date(r.created_at).toISOString().slice(11, 16)} (UTC)</p>
            </div>
            <span className={`badge ${r.statut === "nouveau" ? "badge-gold" : "badge-green"} self-start`}>{r.statut === "nouveau" ? "Nouveau" : "Traité"}</span>
          </div>
          <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {columns.map((c) =>
              r[c.name] ? (
                <div key={c.name} className={c.name === "message" ? "sm:col-span-2" : ""}>
                  <dt className="inline font-semibold">{c.label} : </dt>
                  <dd className="inline whitespace-pre-wrap break-words">
                    {c.name === "telephone" ? <a className="text-link underline" href={telHref(r[c.name]!)}>{r[c.name]}</a> : c.name === "email" ? <a className="text-link underline" href={`mailto:${r[c.name]}`}>{r[c.name]}</a> : r[c.name]}
                  </dd>
                </div>
              ) : null,
            )}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={setStatut.bind(null, table, r.id, r.statut === "nouveau" ? "traite" : "nouveau")}>
              <button type="submit" className="btn btn-outline !px-3 !py-1.5 text-sm">{r.statut === "nouveau" ? "Marquer comme traité" : "Marquer comme nouveau"}</button>
            </form>
            <ConfirmButton action={deleteSubmission.bind(null, table, r.id)} message={`Supprimer la demande de ${r.nom} ?`} className="btn btn-outline !px-3 !py-1.5 text-sm text-[#b42318]">Supprimer</ConfirmButton>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Filtres({ base, statut }: { base: string; statut?: string }) {
  const f = [{ v: undefined, l: "Toutes" }, { v: "nouveau", l: "Nouvelles" }, { v: "traite", l: "Traitées" }];
  return (
    <nav aria-label="Filtrer par statut" className="mt-4 flex gap-2">
      {f.map((x) => (
        <Link key={x.l} href={x.v ? `${base}?statut=${x.v}` : base} aria-current={statut === x.v ? "page" : undefined} className="badge badge-soft min-h-10 px-4 aria-[current=page]:bg-primary aria-[current=page]:text-on-primary">{x.l}</Link>
      ))}
    </nav>
  );
}
