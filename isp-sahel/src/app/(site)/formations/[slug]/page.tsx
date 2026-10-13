import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDocuments, getFiliere, getFilieres, getParametres } from "@/lib/data";
import { documentHref } from "@/lib/documents";
import { telHref } from "@/lib/format";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getFilieres()).map((f) => ({ slug: f.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await getFiliere((await params).slug);
  if (!f) return {};
  return {
    title: f.nom,
    description: `${f.description} Licence et Master à l'ISP SAHEL, diplôme reconnu par l'État.`,
    alternates: { canonical: `/formations/${f.slug}` },
    openGraph: f.image_url ? { images: [{ url: f.image_url }] } : undefined,
  };
}

export default async function FilierePage({ params }: Props) {
  const { slug } = await params;
  const [f, p, documents, filieres] = await Promise.all([getFiliere(slug), getParametres(), getDocuments(), getFilieres()]);
  if (!f) notFound();

  const programme =
    documents.find((d) => d.id === f.programme_document_id) ??
    documents.find((d) => d.rubrique === "programme" && d.filiere_id === f.id);
  const programmeHref = programme ? documentHref(programme) : null;
  const autres = filieres.filter((x) => x.id !== f.id);

  return (
    <>
      <PageHeader title={f.nom} crumbs={[{ href: "/formations", label: "Formations" }]} intro={f.accroche}>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Points clés">
          <li className="badge badge-gold"><Icon name="shield" size={14} /> Diplôme reconnu par l&apos;État</li>
          <li className="badge bg-white/15 text-white"><Icon name="check" size={14} /> Inscriptions ouvertes</li>
          <li className="badge bg-white/15 text-white"><Icon name="file" size={14} /> Admission sur dossier</li>
        </ul>
      </PageHeader>

      <div className="container-page mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {f.image_url ? (
            <Image src={f.image_url} alt={`Illustration de la filière ${f.nom}`} width={1200} height={750} sizes="(min-width: 1024px) 45rem, 100vw" className="aspect-[16/10] w-full rounded-2xl object-cover" priority />
          ) : null}
          <section aria-labelledby="presentation" className="mt-8">
            <h2 id="presentation" className="text-2xl font-extrabold">Présentation</h2>
            <p className="mt-3 text-lg">{f.description}</p>
          </section>
          <section aria-labelledby="debouches" className="mt-8">
            <h2 id="debouches" className="text-2xl font-extrabold">Débouchés</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {f.debouches.map((d) => (
                <li key={d} className="card flex items-center gap-3 p-4">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"><Icon name="briefcase" size={18} /></span>
                  <span className="font-medium">{d}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start" aria-label="Informations pratiques">
          <div className="card p-6">
            <h2 className="text-lg font-bold">Durée &amp; scolarité</h2>
            <dl className="mt-4 divide-y divide-line">
              <div className="flex justify-between gap-4 py-3"><dt className="text-muted">Licence</dt><dd className="text-right font-semibold">{f.duree_licence}<br />{p.frais_licence}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-muted">Master</dt><dd className="text-right font-semibold">{f.duree_master}<br />{p.frais_master}</dd></div>
            </dl>
            <div className="mt-5 grid gap-3">
              {programmeHref ? (
                <a href={programmeHref} className="btn btn-outline"><Icon name="download" size={18} /> Télécharger le programme (PDF)</a>
              ) : (
                <span className="btn btn-outline" aria-disabled="true"><Icon name="file" size={18} /> Programme (PDF) bientôt disponible</span>
              )}
              <Link href={`/admission?filiere=${encodeURIComponent(f.slug)}#preinscription`} className="btn btn-primary">S&apos;inscrire</Link>
              <a href={telHref(p.telephone_1)} className="btn btn-accent"><Icon name="phone" size={18} /> Appeler le {p.telephone_1}</a>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-lg font-bold">Autres filières</h2>
            <ul className="mt-3 space-y-1">
              {autres.map((x) => (
                <li key={x.id}><Link href={`/formations/${x.slug}`} className="inline-flex min-h-11 items-center gap-2 text-link hover:underline"><Icon name="chevronRight" size={16} /> {x.nom}</Link></li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: f.nom,
          description: f.description,
          provider: { "@type": "CollegeOrUniversity", name: SITE.nom, sameAs: SITE.url },
          educationalCredentialAwarded: "Licence, Master",
        }}
      />
    </>
  );
}
