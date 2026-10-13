import type { Metadata } from "next";
import Link from "next/link";
import { FiliereCard } from "@/components/ui/cards";
import { PageHeader, SectionTitle } from "@/components/ui/PageHeader";
import { getFilieres, getParametres } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Formations — Licence et Master",
  description:
    "Les 5 filières de l'ISP SAHEL en Licence et en Master : Génie civil (BTP, Géomètre Topographie), Ingénierie des Systèmes Informatiques, Informatique de Gestion, Réseaux Informatiques et Télécommunications.",
  alternates: { canonical: "/formations" },
};

export default async function FormationsPage() {
  const [filieres, p] = await Promise.all([getFilieres(), getParametres()]);
  return (
    <>
      <PageHeader
        title="Formations"
        intro="Cinq filières, deux cycles — Licence et Master — et des diplômes reconnus par l'État."
      />

      <section aria-labelledby="recap" className="container-page mt-12">
        <SectionTitle id="recap" eyebrow="En un coup d'œil" title="Tableau récapitulatif" />
        <div className="relative mt-6 overflow-x-auto rounded-2xl ring-1 ring-line">
          <table className="w-full min-w-[40rem] border-collapse bg-surface text-left text-sm sm:text-base">
            <caption className="sr-only">Filières, durées et frais de scolarité</caption>
            <thead className="bg-primary text-on-primary">
              <tr>
                <th scope="col" className="p-3 sm:p-4">Filière</th>
                <th scope="col" className="p-3 sm:p-4">Licence</th>
                <th scope="col" className="p-3 sm:p-4">Master</th>
                <th scope="col" className="p-3 sm:p-4"><span className="sr-only">Fiche</span></th>
              </tr>
            </thead>
            <tbody>
              {filieres.map((f) => (
                <tr key={f.id} className="border-t border-line">
                  <th scope="row" className="p-3 font-semibold sm:p-4">{f.nom}</th>
                  <td className="p-3 sm:p-4">{f.duree_licence}<br /><span className="text-muted">{p.frais_licence}</span></td>
                  <td className="p-3 sm:p-4">{f.duree_master}<br /><span className="text-muted">{p.frais_master}</span></td>
                  <td className="p-3 sm:p-4">
                    <Link href={`/formations/${f.slug}`} className="inline-flex min-h-11 items-center font-semibold text-link underline underline-offset-4">
                      Voir la fiche<span className="sr-only"> {f.nom}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">Durées indicatives, à confirmer auprès de la scolarité.</p>
      </section>

      <section aria-labelledby="filieres" className="container-page mt-16">
        <SectionTitle id="filieres" eyebrow="Nos filières" title="Choisissez votre voie" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filieres.map((f) => <FiliereCard key={f.id} f={f} />)}
        </div>
      </section>
    </>
  );
}
