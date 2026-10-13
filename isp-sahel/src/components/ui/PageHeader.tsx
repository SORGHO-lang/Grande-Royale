import Link from "next/link";
import { Icon } from "../Icon";
import { JsonLd } from "./JsonLd";
import { SITE } from "@/lib/site";

type Crumb = { href: string; label: string };

/** Bandeau de titre des pages intérieures, avec fil d'Ariane. */
export function PageHeader({
  title,
  intro,
  crumbs = [],
  children,
}: {
  title: string;
  intro?: React.ReactNode;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  const trail: Crumb[] = [{ href: "/", label: "Accueil" }, ...crumbs];
  return (
    <section className="fx-gradient relative overflow-hidden bg-gradient-to-br from-[var(--hero-from)] to-[var(--hero-to)] text-white">
      <div className="fx-blob pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/15" aria-hidden="true" />
      <div className="fx-blob pointer-events-none absolute -bottom-32 [animation-delay:-8s] left-1/3 h-64 w-64 rounded-full bg-sky/15" aria-hidden="true" />
      <div className="container-page relative py-10 sm:py-14">
        <nav aria-label="Fil d'Ariane">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-white/85">
            {trail.map((c, i) => (
              <li key={c.href} className="flex items-center gap-1">
                {i > 0 && <Icon name="chevronRight" size={14} />}
                <Link href={c.href} className="underline-offset-2 hover:underline">{c.label}</Link>
              </li>
            ))}
            <li className="flex items-center gap-1" aria-current="page">
              <Icon name="chevronRight" size={14} /> <span className="font-semibold text-white">{title}</span>
            </li>
          </ol>
        </nav>
        <h1 className="fx-up mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
        {intro ? <div className="fx-up mt-3 max-w-2xl text-base text-white/90 sm:text-lg" style={{ "--d": "120ms" } as React.CSSProperties}>{intro}</div> : null}
        {children}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [...trail, { href: "", label: title }].map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            ...(c.href ? { item: `${SITE.url}${c.href === "/" ? "" : c.href}` } : {}),
          })),
        }}
      />
    </section>
  );
}

export function SectionTitle({ eyebrow, title, intro, center = false, id }: { eyebrow?: string; title: string; intro?: React.ReactNode; center?: boolean; id?: string }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 id={id} className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h2>
      {intro ? <div className="mt-3 text-muted">{intro}</div> : null}
    </div>
  );
}

/** Mention visible pour les contenus non encore fournis par l'établissement. */
export function ACompleter({ children = "À compléter" }: { children?: React.ReactNode }) {
  return (
    <span className="badge badge-soft border border-dashed border-line font-medium italic text-muted">{children}</span>
  );
}
