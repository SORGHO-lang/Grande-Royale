import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ArticleCard } from "@/components/ui/cards";
import { PageHeader } from "@/components/ui/PageHeader";
import { getArticles, getCategories } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Actualités",
  description: "Annonces, événements, recherche et vie étudiante : toute l'actualité de l'ISP SAHEL.",
  alternates: { canonical: "/actualites" },
};

type Props = { searchParams: Promise<{ page?: string; categorie?: string }> };

export default async function ActualitesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const categories = await getCategories();
  const categorie = categories.find((c) => c.slug === sp.categorie)?.slug;
  const { items, total, perPage } = await getArticles({ page, perPage: 9, categorie });
  const pages = Math.max(1, Math.ceil(total / perPage));

  const href = (params: { page?: number; categorie?: string }) => {
    const q = new URLSearchParams();
    if (params.categorie) q.set("categorie", params.categorie);
    if (params.page && params.page > 1) q.set("page", String(params.page));
    const s = q.toString();
    return s ? `/actualites?${s}` : "/actualites";
  };

  return (
    <>
      <PageHeader title="Actualités" intro="Annonces, événements, recherche et vie étudiante à l'ISP SAHEL." />
      <div className="container-page mt-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <nav aria-label="Catégories">
            <ul className="no-scrollbar flex gap-2 overflow-x-auto">
              <li className="shrink-0">
                <Link href="/actualites" aria-current={!categorie ? "page" : undefined} className="badge badge-soft min-h-11 px-4 aria-[current=page]:bg-primary aria-[current=page]:text-on-primary">Toutes</Link>
              </li>
              {categories.map((c) => (
                <li key={c.id} className="shrink-0">
                  <Link href={href({ categorie: c.slug })} aria-current={categorie === c.slug ? "page" : undefined} className="badge badge-soft min-h-11 px-4 aria-[current=page]:bg-primary aria-[current=page]:text-on-primary">{c.nom}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <a href="/actualites/rss.xml" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link"><Icon name="rss" size={16} /> Flux RSS</a>
        </div>

        {items.length === 0 ? (
          <p className="mt-10 rounded-2xl bg-surface p-8 text-center text-muted ring-1 ring-line">Aucun article dans cette rubrique pour le moment.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => <ArticleCard key={a.id} a={a} />)}
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
            {page > 1 && <Link href={href({ page: page - 1, categorie })} className="btn btn-outline" rel="prev">Précédent</Link>}
            <span className="px-3 text-sm text-muted">Page {page} sur {pages}</span>
            {page < pages && <Link href={href({ page: page + 1, categorie })} className="btn btn-outline" rel="next">Suivant</Link>}
          </nav>
        )}
      </div>
    </>
  );
}
