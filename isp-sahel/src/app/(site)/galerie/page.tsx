import type { Metadata } from "next";
import { Gallery } from "@/components/ui/Gallery";
import { PageHeader } from "@/components/ui/PageHeader";
import { getGalerie } from "@/lib/data";
import { slugify } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Galerie",
  description: "Photos de la vie de l'ISP SAHEL : cérémonies de remise de diplômes Licence et Master, diplômés et proches.",
  alternates: { canonical: "/galerie" },
};

export default async function GaleriePage() {
  const photos = await getGalerie();
  const albums = [...new Set(photos.map((p) => p.album))];
  return (
    <>
      <PageHeader title="Galerie" intro="Moments forts de l'institut : cérémonies, promotions, vie étudiante." />
      <div className="container-page mt-12">
        {photos.length === 0 ? (
          <p className="text-muted">Aucune photo pour le moment.</p>
        ) : (
          albums.map((album) => (
            <section key={album} aria-labelledby={`album-${slugify(album)}`} className="mb-12">
              <h2 id={`album-${slugify(album)}`} className="text-2xl font-extrabold">{album}</h2>
              <div className="mt-5">
                <Gallery photos={photos.filter((p) => p.album === album).map(({ id, image_url, legende, alt }) => ({ id, image_url, legende, alt }))} />
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
