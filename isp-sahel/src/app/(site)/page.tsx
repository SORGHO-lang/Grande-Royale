import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ArticleCard, FiliereCard, PartenaireCard, StatsBand, TemoignageCard, TrustBox } from "@/components/ui/cards";
import { SectionTitle } from "@/components/ui/PageHeader";
import { getArticles, getFilieres, getParametres, getPartenaires, getTemoignages } from "@/lib/data";
import { telHref } from "@/lib/format";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export default async function HomePage() {
  const [p, filieres, partenaires, temoignages, { items: articles }] = await Promise.all([
    getParametres(),
    getFilieres(),
    getPartenaires(),
    getTemoignages(),
    getArticles({ perPage: 3 }),
  ]);

  const atouts = [
    {
      icon: "shield",
      titre: "Diplômes reconnus par l'État",
      texte: `Un établissement ouvert en ${SITE.anneeOuverture} sous l'autorisation du ${SITE.ministere}.`,
    },
    {
      icon: "briefcase",
      titre: "Filières d'avenir",
      texte: "Génie civil, topographie, informatique, gestion, réseaux : des domaines au cœur du développement des infrastructures et du numérique.",
    },
    {
      icon: "phone",
      titre: "Un parcours clair, accompagné",
      texte: "Pré-inscription, rappel, dépôt du dossier, rentrée : notre scolarité vous accompagne par téléphone à chaque étape.",
    },
  ];

  return (
    <>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--hero-from)] to-[var(--hero-to)] pb-16 text-white">
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-sky/20 blur-2xl" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-8 pt-8 sm:pt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:pt-16">
          <div>
            <div className="flex items-center gap-3">
              <Image src={SITE.logo} alt="Logo de l'ISP SAHEL" width={72} height={72} className="h-16 w-16 rounded-full shadow-lg sm:h-[72px] sm:w-[72px]" priority />
              <span className="badge badge-gold"><Icon name="shield" size={16} /> {SITE.mentionCle}</span>
            </div>
            <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.1] sm:text-5xl lg:text-[3.4rem]">
              Institut Supérieur Privé <span className="text-gold">du Sahel</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/90 sm:text-xl">{SITE.accroche}</p>
            <p className="mt-3 text-sm font-semibold tracking-wide text-white/75">{SITE.slogan}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/scolarite" className="btn btn-accent text-base">
                Scolarité &amp; inscription <Icon name="arrow" size={18} />
              </Link>
              <a href={telHref(p.telephone_1)} className="btn btn-light text-base" aria-label={`Appeler l'ISP SAHEL au ${p.telephone_1}`}>
                <span aria-hidden="true">📞</span> Appeler
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
            <div className="absolute -inset-3 rotate-3 rounded-[2rem] bg-gold/90" aria-hidden="true" />
            <Image
              src="/hero/diplomee.jpg"
              alt="Remise d'un diplôme de Master professionnel à un diplômé de l'ISP SAHEL en toge bleue et étole jaune"
              width={731}
              height={853}
              sizes="(min-width: 1024px) 28rem, (min-width: 640px) 24rem, 90vw"
              className="relative aspect-[6/7] w-full rounded-[1.75rem] object-cover shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* 2. Chiffres clés */}
      <StatsBand p={p} />

      {/* 3. Encadré de confiance */}
      <section className="container-page mt-12">
        <TrustBox />
      </section>

      {/* 4. Nos filières */}
      <section aria-labelledby="titre-filieres" className="container-page mt-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionTitle
            id="titre-filieres"
            eyebrow="Formations"
            title="Nos filières"
            intro="Cinq filières de Licence et de Master, au cœur des besoins du Burkina Faso en infrastructures et en numérique."
          />
          <Link href="/formations" className="btn btn-outline shrink-0 self-start sm:self-auto">Toutes les formations</Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filieres.map((f) => (
            <FiliereCard key={f.id} f={f} />
          ))}
        </div>
      </section>

      {/* 5. Pourquoi choisir ISP SAHEL ? */}
      <section aria-labelledby="titre-pourquoi" className="mt-16 bg-surface-2 py-14">
        <div className="container-page">
          <SectionTitle id="titre-pourquoi" eyebrow="Nos atouts" title="Pourquoi choisir ISP SAHEL ?" center />
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {atouts.map((a, i) => (
              <li key={a.titre} className="card relative p-6">
                <span className="absolute right-5 top-4 text-5xl font-black text-line" aria-hidden="true">{i + 1}</span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary">
                  <Icon name={a.icon} size={24} />
                </span>
                <h3 className="mt-4 text-lg font-bold">{a.titre}</h3>
                <p className="mt-2 text-muted">{a.texte}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <Link href="/admission#preinscription" className="btn btn-primary">Je me pré-inscris</Link>
          </div>
        </div>
      </section>

      {/* 6. Ils nous font confiance */}
      <section aria-labelledby="titre-partenaires" className="container-page mt-16">
        <SectionTitle id="titre-partenaires" eyebrow="Partenaires" title="Ils nous font confiance" center />
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {partenaires.map((pa) => (
            <li key={pa.id}><PartenaireCard p={pa} /></li>
          ))}
        </ul>
        <p className="mt-6 text-center">
          <Link href="/partenaires" className="font-semibold text-link underline underline-offset-4">Découvrir nos partenariats</Link>
        </p>
      </section>

      {/* 7. Témoignages */}
      <section aria-labelledby="titre-temoignages" className="container-page mt-16">
        <SectionTitle id="titre-temoignages" eyebrow="Témoignages" title="Ils parlent de l'ISP SAHEL" center />
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {temoignages.slice(0, 4).map((t) => (
            <li key={t.id}><TemoignageCard t={t} /></li>
          ))}
        </ul>
      </section>

      {/* 8. Dernières actualités */}
      {articles.length > 0 && (
        <section aria-labelledby="titre-actus" className="container-page mt-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionTitle id="titre-actus" eyebrow="Actualités" title="Dernières actualités" />
            <Link href="/actualites" className="btn btn-outline shrink-0 self-start sm:self-auto">Toutes les actualités</Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} a={a} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
