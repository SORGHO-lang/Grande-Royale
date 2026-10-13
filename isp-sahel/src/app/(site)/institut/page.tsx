import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { MembreCard, TrustBox } from "@/components/ui/cards";
import { ACompleter, PageHeader, SectionTitle } from "@/components/ui/PageHeader";
import { getEquipe, getParametres } from "@/lib/data";
import { lignes, typoFr } from "@/lib/format";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "L'institut",
  description: `Présentation de l'ISP SAHEL, établissement reconnu par l'État ouvert en ${SITE.anneeOuverture} à Ouagadougou : histoire, reconnaissance officielle, direction et équipe pédagogique.`,
  alternates: { canonical: "/institut" },
};

export default async function InstitutPage() {
  const [p, equipe] = await Promise.all([getParametres(), getEquipe()]);
  const motDg = lignes(p.mot_dg);
  const fondateur = equipe.find((m) => /OUALI/i.test(m.nom));

  const histoire = [
    { annee: "2009", titre: "Autorisation d'ouverture", texte: `Autorisation d'ouverture n° ${SITE.autorisation}.` },
    { annee: "2010", titre: "Ouverture de l'institut", texte: `Arrêté n° ${SITE.arrete} et ouverture de l'ISP SAHEL.` },
    { annee: "Aujourd'hui", titre: `${p.stat_etudiants} étudiants`, texte: `${p.stat_etudiants} étudiants et ${p.stat_diplomes} diplômes de Licence et de Master.` },
  ];

  return (
    <>
      <PageHeader title="L'institut" crumbs={[]} intro={SITE.presentation} />

      <section aria-labelledby="a-propos" className="container-page mt-12 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0">
          <SectionTitle id="a-propos" eyebrow="À propos" title="Une école supérieure reconnue par l'État" />
          <p className="mt-4 text-lg">{SITE.presentation}</p>
          <p className="mt-4 text-muted">
            Fondé par le {SITE.fondateur}, l&apos;institut est situé à {SITE.ville}, dans le quartier {SITE.quartier}. Il a ouvert ses portes en{" "}
            {SITE.anneeOuverture} sous l&apos;autorisation du {SITE.ministere}.
          </p>
          <div className="mt-6"><TrustBox /></div>
        </div>
        <aside aria-labelledby="devise" className="card flex min-w-0 flex-col justify-center bg-gradient-to-br from-brand to-navy p-8 text-white">
          <p id="devise" className="text-sm font-bold uppercase tracking-wider text-gold">Notre devise</p>
          <p className="mt-3 text-2xl font-extrabold leading-snug">{SITE.slogan}</p>
          <p className="mt-4 text-white/85">Devise inscrite sur notre logo : <strong className="text-white">« {SITE.devise} »</strong></p>
        </aside>
      </section>

      <section aria-labelledby="mot-dg" className="container-page mt-16">
        <div className="card grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr]">
          {fondateur?.photo_url ? (
            <Image
              src={fondateur.photo_url}
              alt={`Photo de ${fondateur.nom}, ${fondateur.fonction}`}
              width={160}
              height={160}
              className="h-32 w-32 rounded-full object-cover ring-4 ring-gold sm:h-40 sm:w-40"
            />
          ) : (
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold text-navy"><Icon name="quote" size={30} /></span>
          )}
          <div className="min-w-0">
            <h2 id="mot-dg" className="text-2xl font-extrabold">Le mot du Fondateur et Directeur Général</h2>
            {motDg.length ? (
              <div className="mt-4 space-y-3 text-lg leading-relaxed">
                {motDg.map((l, i) =>
                  /^«.*»$/.test(l) ? (
                    <blockquote key={i} className="border-l-4 border-gold pl-4 text-xl font-semibold italic text-link sm:text-2xl">
                      {typoFr(l)}
                    </blockquote>
                  ) : (
                    <p key={i}>{typoFr(l)}</p>
                  ),
                )}
              </div>
            ) : (
              <p className="mt-4"><ACompleter>Mot du Fondateur et Directeur Général à compléter</ACompleter></p>
            )}
            <p className="mt-6 font-bold">Dr OUALI Palamanga</p>
            <p className="text-sm text-muted">Fondateur et Directeur Général de l&apos;ISP SAHEL</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="reconnaissance" className="container-page mt-16">
        <SectionTitle id="reconnaissance" eyebrow="Reconnaissance officielle" title="Des diplômes reconnus par l'État" />
        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <dt className="text-sm font-semibold text-muted">Autorisation d&apos;ouverture</dt>
            <dd className="mt-1 [overflow-wrap:anywhere] text-base font-bold sm:text-lg">n° {SITE.autorisation}</dd>
          </div>
          <div className="card p-5">
            <dt className="text-sm font-semibold text-muted">Arrêté</dt>
            <dd className="mt-1 [overflow-wrap:anywhere] text-base font-bold sm:text-lg">n° {SITE.arrete}</dd>
          </div>
          <div className="card p-5 md:col-span-2">
            <dt className="text-sm font-semibold text-muted">Autorité de tutelle</dt>
            <dd className="mt-1 text-lg font-bold">{SITE.ministere}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="histoire" className="container-page mt-16">
        <SectionTitle id="histoire" eyebrow="Chronologie" title="Notre histoire" />
        <ol className="relative mt-8 space-y-8 border-l-4 border-gold pl-6 sm:pl-8">
          {histoire.map((h) => (
            <li key={h.annee} className="relative">
              <span className="absolute -left-[2.45rem] top-1 h-5 w-5 rounded-full border-4 border-bg bg-primary sm:-left-[2.95rem]" aria-hidden="true" />
              <p className="text-sm font-bold uppercase tracking-wide text-link">{h.annee}</p>
              <h3 className="text-xl font-bold">{h.titre}</h3>
              <p className="mt-1 [overflow-wrap:anywhere] text-muted">{h.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="equipe" className="container-page mt-16">
        <SectionTitle id="equipe" eyebrow="Direction & équipe pédagogique" title="Ceux qui font l'ISP SAHEL" />
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {equipe.map((m) => <li key={m.id}><MembreCard m={m} /></li>)}
        </ul>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/formations" className="btn btn-primary">Découvrir nos formations</Link>
          <Link href="/contact" className="btn btn-outline">Nous contacter</Link>
        </div>
      </section>
    </>
  );
}
