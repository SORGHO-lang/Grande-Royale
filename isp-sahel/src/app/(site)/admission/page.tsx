import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PreinscriptionForm } from "@/components/forms/PreinscriptionForm";
import { PageHeader, SectionTitle } from "@/components/ui/PageHeader";
import { getFilieres, getParametres } from "@/lib/data";
import { lignes, telHref, whatsappHref } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Admission et pré-inscription en ligne",
  description: "Étapes d'admission à l'ISP SAHEL, pièces à fournir, conditions d'accès en Licence et en Master, et formulaire de pré-inscription en ligne.",
  alternates: { canonical: "/admission" },
};

const ETAPES = [
  { titre: "Pré-inscription en ligne", texte: "Remplissez le formulaire ci-dessous (ou écrivez-nous sur WhatsApp).", icon: "file" },
  { titre: "Rappel par l'établissement", texte: "Notre scolarité vous rappelle pour vous conseiller et confirmer votre choix.", icon: "phone" },
  { titre: "Dépôt des pièces à la scolarité", texte: "Vous déposez votre dossier complet à la scolarité, à Dassasgho.", icon: "briefcase" },
  { titre: "Inscription et rentrée", texte: "Vous finalisez votre inscription et rejoignez votre promotion à la rentrée.", icon: "graduation" },
];

export default async function AdmissionPage() {
  const [p, filieres] = await Promise.all([getParametres(), getFilieres()]);
  const pieces = lignes(p.pieces_dossier);

  return (
    <>
      <PageHeader title="Admission" intro="Rejoindre l'ISP SAHEL en 4 étapes simples, en Licence ou en Master." />

      <section aria-labelledby="etapes" className="container-page mt-12">
        <SectionTitle id="etapes" eyebrow="Comment ça marche ?" title="Les étapes de l'admission" />
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map((e, i) => (
            <li key={e.titre} className="card relative p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold text-lg font-black text-navy" aria-hidden="true">{i + 1}</span>
              <h3 className="mt-4 text-lg font-bold"><span className="sr-only">Étape {i + 1} : </span>{e.titre}</h3>
              <p className="mt-2 text-muted">{e.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page mt-16 grid gap-6 lg:grid-cols-2">
        <div className="card p-6 sm:p-8">
          <h2 className="text-xl font-extrabold">Pièces habituelles du dossier</h2>
          <ul className="mt-4 space-y-2">
            {pieces.map((x) => (
              <li key={x} className="flex gap-3"><Icon name="check" className="mt-1 shrink-0 text-success" size={18} /> {x}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">Liste indicative, à confirmer auprès de la scolarité.</p>
        </div>
        <div className="card p-6 sm:p-8">
          <h2 className="text-xl font-extrabold">Conditions d&apos;accès</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="font-bold text-link">Licence</dt>
              <dd className="text-muted">Baccalauréat ou diplôme équivalent.</dd>
            </div>
            <div>
              <dt className="font-bold text-link">Master</dt>
              <dd className="text-muted">Licence dans une filière compatible.</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-muted">Conditions à confirmer auprès de la scolarité. Admission sur dossier.</p>
          <Link href="/scolarite" className="mt-5 inline-flex min-h-11 items-center gap-1 font-semibold text-link underline underline-offset-4">
            Frais de scolarité et calendrier <Icon name="arrow" size={16} />
          </Link>
        </div>
      </section>

      <section id="preinscription" aria-labelledby="titre-preinscription" className="container-page mt-16 scroll-mt-32">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="card p-6 sm:p-8">
            <h2 id="titre-preinscription" className="text-2xl font-extrabold">Formulaire de pré-inscription</h2>
            <p className="mt-2 text-muted">Remplissez ce formulaire : notre scolarité vous rappelle pour la suite.</p>
            <div className="mt-6">
              <PreinscriptionForm filieres={filieres.map((f) => ({ slug: f.slug, nom: f.nom }))} whatsapp={p.whatsapp} />
            </div>
          </div>
          <aside className="space-y-4" aria-label="Autres moyens de s'inscrire">
            <div className="card bg-gradient-to-br from-brand to-navy p-6 text-white">
              <h2 className="text-lg font-bold">Vous préférez parler à quelqu&apos;un ?</h2>
              <p className="mt-2 text-white/85">La scolarité répond à vos questions par téléphone.</p>
              <div className="mt-4 grid gap-3">
                {[p.telephone_1, p.telephone_2].map((t) => (
                  <a key={t} href={telHref(t)} className="btn btn-accent"><Icon name="phone" size={18} /> {t}</a>
                ))}
                <a href={whatsappHref(p.whatsapp, "Bonjour ISP SAHEL, je souhaite des informations sur l'inscription.")} target="_blank" rel="noopener noreferrer" className="btn btn-light">
                  <span aria-hidden="true">💬</span> WhatsApp
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
