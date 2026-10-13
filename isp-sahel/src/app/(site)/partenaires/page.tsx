import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PartenaireCard, TemoignageCard } from "@/components/ui/cards";
import { PageHeader, SectionTitle } from "@/components/ui/PageHeader";
import { getPartenaires, getTemoignages } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Partenaires",
  description: "Partenaires académiques (ISTM, Université de Fada N'Gourma) et ONG partenaires (HKI, ACF, CRS) de l'ISP SAHEL.",
  alternates: { canonical: "/partenaires" },
};

export default async function PartenairesPage() {
  const [partenaires, temoignages] = await Promise.all([getPartenaires(), getTemoignages()]);
  const groupes = [
    { id: "academiques", titre: "Partenaires académiques", items: partenaires.filter((p) => p.type === "academique") },
    { id: "ong", titre: "ONG et organisations partenaires", items: partenaires.filter((p) => p.type === "ong") },
  ];
  return (
    <>
      <PageHeader title="Partenaires" intro="Des institutions académiques et des organisations qui accompagnent nos étudiants." />
      {groupes.map((g) => (
        <section key={g.id} aria-labelledby={g.id} className="container-page mt-12">
          <SectionTitle id={g.id} title={g.titre} />
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {g.items.map((p) => <li key={p.id}><PartenaireCard p={p} /></li>)}
          </ul>
        </section>
      ))}

      <section aria-labelledby="temoignages" className="container-page mt-16">
        <SectionTitle id="temoignages" eyebrow="Témoignages" title="Ils témoignent" />
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {temoignages.map((t) => <li key={t.id}><TemoignageCard t={t} /></li>)}
        </ul>
      </section>

      <section className="container-page mt-16">
        <div className="flex flex-col items-start gap-4 rounded-2xl bg-gradient-to-br from-brand to-navy p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Devenir partenaire</h2>
            <p className="mt-1 text-white/85">Stages, recherche, projets communs : construisons ensemble.</p>
          </div>
          <Link href="/contact?sujet=Devenir%20partenaire" className="btn btn-accent shrink-0">Devenir partenaire <Icon name="arrow" size={18} /></Link>
        </div>
      </section>
    </>
  );
}
