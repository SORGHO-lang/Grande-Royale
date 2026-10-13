"use client";

import { useMemo, useState } from "react";
import { extensionDe, formatDate, formatTaille } from "@/lib/format";
import { RUBRIQUES } from "@/lib/site";
import type { Rubrique } from "@/lib/types";
import { Icon } from "../Icon";

type Doc = {
  id: string;
  titre: string;
  description: string | null;
  rubrique: Rubrique;
  filiere: string | null;
  nom_fichier: string | null;
  taille: number | null;
  publie_le: string;
  href: string | null;
};

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function DocumentsBrowser({ docs }: { docs: Doc[] }) {
  const [q, setQ] = useState("");
  const [rubrique, setRubrique] = useState<Rubrique | "toutes">("toutes");

  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    return docs.filter(
      (d) =>
        (rubrique === "toutes" || d.rubrique === rubrique) &&
        (!nq || norm(`${d.titre} ${d.description ?? ""} ${d.filiere ?? ""}`).includes(nq)),
    );
  }, [docs, q, rubrique]);

  const groupes = (Object.keys(RUBRIQUES) as Rubrique[])
    .map((r) => ({ r, items: filtered.filter((d) => d.rubrique === r) }))
    .filter((g) => g.items.length);

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label htmlFor="doc-recherche" className="field-label">Rechercher un document</label>
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input id="doc-recherche" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex. : règlement, programme, attestation…" className="field !pl-10" />
          </div>
        </div>
        <div className="md:w-72">
          <label htmlFor="doc-rubrique" className="field-label">Rubrique</label>
          <select id="doc-rubrique" value={rubrique} onChange={(e) => setRubrique(e.target.value as Rubrique | "toutes")} className="field">
            <option value="toutes">Toutes les rubriques</option>
            {(Object.entries(RUBRIQUES) as [Rubrique, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted" aria-live="polite">{filtered.length} document{filtered.length > 1 ? "s" : ""}</p>

      {groupes.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-surface p-8 text-center text-muted ring-1 ring-line">Aucun document ne correspond à votre recherche.</p>
      ) : (
        groupes.map(({ r, items }) => (
          <section key={r} aria-labelledby={`rub-${r}`} className="mt-8">
            <h2 id={`rub-${r}`} className="text-xl font-extrabold">{RUBRIQUES[r]}</h2>
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
              {items.map((d) => {
                const ext = extensionDe(d.nom_fichier);
                return (
                  <li key={d.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                    <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-link sm:inline-flex" aria-hidden="true">
                      <Icon name="file" size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{d.titre}</p>
                      {d.description ? <p className="text-sm text-muted">{d.description}</p> : null}
                      <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted">
                        <span>Type : {ext || "—"}</span>
                        <span>Taille : {formatTaille(d.taille)}</span>
                        <span>Date : {formatDate(d.publie_le)}</span>
                        {d.filiere ? <span>Filière : {d.filiere}</span> : null}
                      </p>
                    </div>
                    {d.href ? (
                      <a href={d.href} className="btn btn-primary shrink-0" aria-label={`Télécharger ${d.titre}${ext ? ` (${ext}, ${formatTaille(d.taille)})` : ""}`}>
                        <Icon name="download" size={18} /> Télécharger
                      </a>
                    ) : (
                      <span className="btn btn-outline shrink-0" aria-disabled="true">Bientôt disponible</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
