import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { ArticleCard } from "@/components/ui/cards";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getArticle, getArticles } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export async function generateStaticParams() {
  const { items } = await getArticles({ perPage: 50 });
  return items.map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArticle((await params).slug);
  if (!a) return {};
  return {
    title: a.titre,
    description: a.extrait,
    alternates: { canonical: `/actualites/${a.slug}` },
    openGraph: { type: "article", title: a.titre, description: a.extrait, publishedTime: a.publie_le ?? undefined, images: a.image_url ? [{ url: a.image_url }] : undefined },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();
  const { items } = await getArticles({ perPage: 4 });
  const autres = items.filter((x) => x.id !== a.id).slice(0, 3);
  const url = `${SITE.url}/actualites/${a.slug}`;

  return (
    <>
      <PageHeader title={a.titre} crumbs={[{ href: "/actualites", label: "Actualités" }]}>
        <p className="mt-4 flex flex-wrap items-center gap-2 text-white/85">
          {a.categorie ? <span className="badge badge-gold">{a.categorie.nom}</span> : null}
          <time dateTime={a.publie_le ?? undefined}>Publié le {formatDate(a.publie_le)}</time>
        </p>
      </PageHeader>
      <article className="container-page mt-10 max-w-3xl">
        {a.image_url ? (
          <Image src={a.image_url} alt="" width={1200} height={675} sizes="(min-width: 768px) 48rem, 100vw" className="aspect-[16/9] w-full rounded-2xl object-cover" priority />
        ) : null}
        <p className="mt-8 text-xl font-medium">{a.extrait}</p>
        <div className="prose-content mt-6" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(a.contenu) }} />

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <span className="inline-flex items-center gap-2 font-semibold"><Icon name="share" size={18} /> Partager :</span>
          <a href={`https://wa.me/?text=${encodeURIComponent(`${a.titre} — ${url}`)}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#157a3a] !py-2 text-white hover:bg-[#0f6630]">
            WhatsApp<span className="sr-only"> (nouvel onglet)</span>
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#1659c9] !py-2 text-white hover:bg-[#0f4aa8]">
            Facebook<span className="sr-only"> (nouvel onglet)</span>
          </a>
        </div>
        <p className="mt-8"><Link href="/actualites" className="inline-flex min-h-11 items-center gap-1 font-semibold text-link"><Icon name="chevronLeft" size={18} /> Toutes les actualités</Link></p>
      </article>

      {autres.length > 0 && (
        <section aria-labelledby="autres" className="container-page mt-12">
          <h2 id="autres" className="text-2xl font-extrabold">À lire aussi</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{autres.map((x) => <ArticleCard key={x.id} a={x} />)}</div>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: a.titre,
          description: a.extrait,
          datePublished: a.publie_le,
          image: a.image_url ? [a.image_url.startsWith("http") ? a.image_url : `${SITE.url}${a.image_url}`] : undefined,
          publisher: { "@type": "CollegeOrUniversity", name: SITE.nom, logo: { "@type": "ImageObject", url: `${SITE.url}${SITE.logo}` } },
          mainEntityOfPage: url,
        }}
      />
    </>
  );
}
