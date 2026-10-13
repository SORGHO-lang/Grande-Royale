import Image from "next/image";
import Link from "next/link";
import { formatDate, initiales } from "@/lib/format";
import { SITE } from "@/lib/site";
import type { Article, Filiere, MembreEquipe, Parametres, Partenaire, Temoignage } from "@/lib/types";
import { Icon } from "../Icon";

export function FiliereCard({ f, headingLevel = 3 }: { f: Filiere; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as "h2" | "h3";
  return (
    <article className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-xl hover:shadow-navy/10">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        {f.image_url ? (
          <Image
            src={f.image_url}
            alt={`Illustration de la filière ${f.nom}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand to-navy text-gold">
            <Icon name={f.icone} size={56} />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold text-navy shadow" aria-hidden="true">
          <Icon name={f.icone} size={22} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Licence · Master</p>
        <H className="mt-1 text-lg font-bold leading-snug">{f.nom}</H>
        <p className="mt-2 flex-1 text-[0.95rem] text-muted">{f.description}</p>
        <Link
          href={`/formations/${f.slug}`}
          className="btn btn-outline mt-4 self-start"
          aria-label={`En savoir plus sur la filière ${f.nom}`}
        >
          En savoir plus <Icon name="arrow" size={18} />
        </Link>
      </div>
    </article>
  );
}

export function ArticleCard({ a }: { a: Article }) {
  return (
    <article className="card group relative flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9] bg-surface-2">
        {a.image_url ? (
          <Image src={a.image_url} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand to-navy text-gold"><Icon name="file" size={44} /></div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          {a.categorie ? <span className="badge badge-gold">{a.categorie.nom}</span> : null}
          <time dateTime={a.publie_le ?? undefined}>{formatDate(a.publie_le)}</time>
        </div>
        <h3 className="mt-2 text-lg font-bold leading-snug">
          <Link href={`/actualites/${a.slug}`} className="after:absolute after:inset-0 group-hover:underline">
            {a.titre}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-[0.95rem] text-muted">{a.extrait}</p>
        <span className="mt-3 inline-flex items-center gap-1 font-semibold text-link" aria-hidden="true">
          Lire l&apos;article <Icon name="arrow" size={16} />
        </span>
      </div>
    </article>
  );
}

function Avatar({ nom, photo, size = 64 }: { nom: string; photo: string | null; size?: number }) {
  return photo ? (
    <Image src={photo} alt={`Photo de ${nom}`} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-navy font-bold text-gold"
      style={{ width: size, height: size, fontSize: size / 2.8 }}
      aria-hidden="true"
    >
      {initiales(nom)}
    </span>
  );
}

export function TemoignageCard({ t }: { t: Temoignage }) {
  const complet = Boolean(t.texte?.trim());
  return (
    <figure className="card flex h-full flex-col p-6">
      <Icon name="quote" size={28} className="text-gold" />
      <blockquote className="mt-3 flex-1">
        {complet ? (
          <p className="text-[0.98rem] leading-relaxed">« {t.texte} »</p>
        ) : (
          <p className="italic text-muted">Témoignage à venir</p>
        )}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <Avatar nom={t.nom} photo={t.photo_url} size={48} />
        <span>
          <span className="block font-bold">{t.nom}</span>
          {t.fonction ? <span className="block text-sm text-muted">{t.fonction}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}

export function MembreCard({ m }: { m: MembreEquipe }) {
  return (
    <article className="card flex flex-col items-center p-6 text-center">
      <Avatar nom={m.nom} photo={m.photo_url} size={112} />
      <h3 className="mt-4 text-lg font-bold">{m.nom}</h3>
      <p className="mt-1 text-sm font-medium text-link">{m.fonction}</p>
      {m.bio ? <p className="mt-3 text-sm text-muted">{m.bio}</p> : null}
    </article>
  );
}

export function PartenaireCard({ p }: { p: Partenaire }) {
  const contenu = (
    <>
      <span className="flex h-20 w-full items-center justify-center">
        {p.logo_url ? (
          <Image src={p.logo_url} alt={`Logo ${p.nom}`} width={160} height={80} className="max-h-20 w-auto object-contain" />
        ) : (
          <span className="inline-flex h-16 min-w-16 items-center justify-center rounded-2xl bg-surface-2 px-4 text-xl font-extrabold tracking-wide text-link" aria-hidden="true">
            {p.sigle || initiales(p.nom)}
          </span>
        )}
      </span>
      <span className="mt-3 block font-semibold leading-snug">{p.nom}</span>
      {p.description ? <span className="mt-1 block text-sm text-muted">{p.description}</span> : null}
    </>
  );
  return p.site_url ? (
    <a href={p.site_url} target="_blank" rel="noopener noreferrer" className="card flex flex-col items-center p-5 text-center hover:shadow-lg">
      {contenu}
      <span className="sr-only"> (site externe, nouvel onglet)</span>
    </a>
  ) : (
    <div className="card flex flex-col items-center p-5 text-center">{contenu}</div>
  );
}

export function StatsBand({ p }: { p: Parametres }) {
  const stats = [
    { valeur: p.stat_etudiants, label: "étudiants", icon: "users" },
    { valeur: p.stat_depuis, label: "Depuis", prefix: true, icon: "calendar" },
    { valeur: p.stat_diplomes, label: "diplômes", icon: "graduation" },
    { valeur: p.stat_cycles, label: "cycles · Licence & Master", icon: "route" },
  ];
  return (
    <section aria-labelledby="chiffres-cles" className="relative z-10 -mt-10">
      <h2 id="chiffres-cles" className="sr-only">Chiffres clés</h2>
      <div className="container-page">
        <ul className="grid grid-cols-2 gap-3 rounded-2xl bg-surface p-3 shadow-xl shadow-navy/10 ring-1 ring-line sm:p-4 lg:grid-cols-5">
          {stats.map((s) => (
            <li key={s.label} className="flex flex-col items-center rounded-xl p-3 text-center">
              <Icon name={s.icon} className="text-sky" size={24} />
              {s.prefix ? (
                <>
                  <span className="mt-1 text-sm text-muted">{s.label}</span>
                  <span className="text-2xl font-extrabold text-link sm:text-3xl">{s.valeur}</span>
                </>
              ) : (
                <>
                  <span className="mt-1 text-2xl font-extrabold text-link sm:text-3xl">{s.valeur}</span>
                  <span className="text-sm text-muted">{s.label}</span>
                </>
              )}
            </li>
          ))}
          <li className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gold p-3 text-center font-bold text-navy lg:col-span-1">
            <Icon name="shield" size={24} /> {SITE.mentionCle}
          </li>
        </ul>
      </div>
    </section>
  );
}

export function TrustBox() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border-l-4 border-gold bg-surface p-5 ring-1 ring-line sm:flex-row sm:items-start sm:p-6">
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
        <Icon name="shield" size={26} />
      </span>
      <div className="min-w-0 [overflow-wrap:anywhere]">
        <h2 className="text-lg font-bold">Établissement reconnu par l&apos;État</h2>
        <p className="mt-1 text-muted">
          Ouvert en {SITE.anneeOuverture} sous l&apos;autorisation du {SITE.ministere} (Autorisation d&apos;ouverture
          n° {SITE.autorisation} ; Arrêté n° {SITE.arrete}).
        </p>
      </div>
    </div>
  );
}
