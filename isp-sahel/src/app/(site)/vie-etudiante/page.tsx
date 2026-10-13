import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { TemoignageCard } from "@/components/ui/cards";
import { PageHeader, SectionTitle } from "@/components/ui/PageHeader";
import { getTemoignages } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Vie étudiante",
  description: "Espace étudiant, ressources pédagogiques, stages et insertion professionnelle, réseau des anciens : la vie étudiante à l'ISP SAHEL.",
  alternates: { canonical: "/vie-etudiante" },
};

const RUBRIQUES = [
  {
    icon: "users",
    titre: "Espace étudiant",
    texte: "Demandez vos relevés de notes, attestations d'inscription et attestations de scolarité auprès de la scolarité.",
    lien: { href: "/documents", label: "Formulaires de demande" },
  },
  {
    icon: "book",
    titre: "Ressources pédagogiques",
    texte: "Programmes, guides et documents utiles à votre parcours sont disponibles dans la rubrique Documents.",
    lien: { href: "/documents", label: "Accéder aux documents" },
  },
  {
    icon: "briefcase",
    titre: "Stages & insertion professionnelle",
    texte: "Des stages pour mettre en pratique vos compétences dans le BTP, l'informatique et les télécoms.",
    lien: { href: "/partenaires", label: "Nos partenaires" },
  },
  {
    icon: "graduation",
    titre: "Alumni",
    texte: "Le réseau des diplômés de l'ISP SAHEL : restez en contact avec votre institut et vos promotions.",
    lien: { href: "/contact?sujet=Réseau%20des%20anciens", label: "Rejoindre le réseau" },
  },
];

export default async function VieEtudiantePage() {
  const temoignages = await getTemoignages();
  return (
    <>
      <PageHeader title="Vie étudiante" intro="Accompagnement, ressources, stages et réseau : votre parcours ne s'arrête pas aux salles de cours." />
      <section aria-label="Services aux étudiants" className="container-page mt-12">
        <ul className="grid gap-5 sm:grid-cols-2">
          {RUBRIQUES.map((r) => (
            <li key={r.titre} className="card flex flex-col p-6 sm:p-8">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary"><Icon name={r.icon} size={24} /></span>
              <h2 className="mt-4 text-xl font-bold">{r.titre}</h2>
              <p className="mt-2 flex-1 text-muted">{r.texte}</p>
              <Link href={r.lien.href} className="mt-4 inline-flex min-h-11 items-center gap-1 self-start font-semibold text-link underline underline-offset-4">
                {r.lien.label} <Icon name="arrow" size={16} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="temoignages" className="container-page mt-16">
        <SectionTitle id="temoignages" eyebrow="Témoignages" title="Paroles d'étudiants et de diplômés" />
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {temoignages.map((t) => <li key={t.id}><TemoignageCard t={t} /></li>)}
        </ul>
      </section>
    </>
  );
}
