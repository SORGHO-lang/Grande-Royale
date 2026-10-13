import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHeader, SectionTitle } from "@/components/ui/PageHeader";
import { getFilieres, getParametres } from "@/lib/data";
import { parseCalendrier, telHref } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Scolarité — frais, calendrier et FAQ",
  description: "Frais de scolarité de l'ISP SAHEL (Licence 350 000 F CFA, Master 600 000 F CFA), processus d'inscription, calendrier académique et questions fréquentes.",
  alternates: { canonical: "/scolarite" },
};

const PROCESSUS = [
  { titre: "Dossier", texte: "Constitution et dépôt du dossier de candidature." },
  { titre: "Étude / concours", texte: "Étude du dossier par l'établissement (ou concours selon le cas)." },
  { titre: "Résultats", texte: "Communication des résultats d'admission." },
  { titre: "Inscription administrative et paiement", texte: "Finalisation de l'inscription à la scolarité et règlement des frais." },
  { titre: "Inscription pédagogique et carte d'étudiant", texte: "Inscription aux enseignements et remise de la carte d'étudiant." },
];

export default async function ScolaritePage() {
  const [p, filieres] = await Promise.all([getParametres(), getFilieres()]);
  const calendrier = parseCalendrier(p.calendrier_academique);

  const faq = [
    { q: "Les diplômes sont-ils reconnus ?", r: "Oui, les diplômes de l'ISP SAHEL sont reconnus par l'État." },
    { q: "Quels sont les frais de scolarité ?", r: `${p.frais_licence} pour la Licence, ${p.frais_master} pour le Master.` },
    { q: "Quelles filières proposez-vous ?", r: filieres.map((f) => f.nom).join(" ; ") + "." },
    {
      q: "Comment m'inscrire ?",
      r: `Par téléphone au ${p.telephone_1} / ${p.telephone_2.replace("+226 ", "")}, par WhatsApp ou via le formulaire de pré-inscription en ligne.`,
    },
  ];

  return (
    <>
      <PageHeader title="Scolarité" intro="Processus d'inscription, frais, calendrier et réponses à vos questions." />

      <section aria-labelledby="processus" className="container-page mt-12">
        <SectionTitle id="processus" eyebrow="Admission & inscription" title="Le processus en 5 étapes" />
        <ol className="mt-8 grid gap-4 md:grid-cols-5">
          {PROCESSUS.map((e, i) => (
            <li key={e.titre} className="card p-5">
              <span className="text-3xl font-black text-gold" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-bold"><span className="sr-only">Étape {i + 1} : </span>{e.titre}</h3>
              <p className="mt-1 text-sm text-muted">{e.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="frais" className="container-page mt-16 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle id="frais" eyebrow="Frais" title="Frais de scolarité" />
          <div className="relative mt-6 overflow-hidden rounded-2xl ring-1 ring-line">
            <table className="w-full bg-surface text-left">
              <caption className="sr-only">Frais de scolarité annuels par cycle</caption>
              <thead className="bg-primary text-on-primary">
                <tr><th scope="col" className="p-4">Cycle</th><th scope="col" className="p-4">Frais de scolarité</th></tr>
              </thead>
              <tbody>
                <tr className="border-t border-line"><th scope="row" className="p-4 font-semibold">Licence</th><td className="p-4 text-xl font-extrabold text-link">{p.frais_licence}</td></tr>
                <tr className="border-t border-line"><th scope="row" className="p-4 font-semibold">Master</th><td className="p-4 text-xl font-extrabold text-link">{p.frais_master}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 card p-6">
            <h3 className="text-lg font-bold">Conditions d&apos;admission</h3>
            <ul className="mt-3 space-y-2">
              <li className="flex gap-2"><Icon name="check" className="mt-1 shrink-0 text-success" size={18} /> <span><strong>Licence :</strong> baccalauréat ou équivalent.</span></li>
              <li className="flex gap-2"><Icon name="check" className="mt-1 shrink-0 text-success" size={18} /> <span><strong>Master :</strong> Licence dans une filière compatible.</span></li>
            </ul>
            <p className="mt-3 text-sm text-muted">À confirmer auprès de la scolarité.</p>
          </div>
        </div>

        <div>
          <SectionTitle eyebrow={`Année ${p.annee_academique}`} title="Calendrier académique" />
          <p className="mt-3"><span className="badge badge-soft">Indicatif</span></p>
          <ol className="mt-4 divide-y divide-line rounded-2xl bg-surface ring-1 ring-line">
            {calendrier.map((c, i) => (
              <li key={i} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-4">
                <span className={`shrink-0 text-sm font-semibold sm:w-40 ${/compl/i.test(c.periode) ? "italic text-muted" : "text-link"}`}>{c.periode}</span>
                <span className="font-medium">{c.evenement}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="faq" className="container-page mt-16">
        <SectionTitle id="faq" eyebrow="FAQ" title="Questions fréquentes" />
        <div className="mt-6 space-y-3">
          {faq.map((f) => (
            <details key={f.q} className="card group p-0 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-semibold">
                {f.q}
                <Icon name="chevronDown" className="shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 text-muted">{f.r}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/admission#preinscription" className="btn btn-primary">Formulaire de pré-inscription</Link>
          <a href={telHref(p.telephone_1)} className="btn btn-accent"><Icon name="phone" size={18} /> {p.telephone_1}</a>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.r } })),
        }}
      />
    </>
  );
}
