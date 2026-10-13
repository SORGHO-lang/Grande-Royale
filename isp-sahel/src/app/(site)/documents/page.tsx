import type { Metadata } from "next";
import { DocumentsBrowser } from "@/components/ui/DocumentsBrowser";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDocuments, getFilieres } from "@/lib/data";
import { documentHref } from "@/lib/documents";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Documents",
  description: "Documents officiels, programmes des filières et formulaires de l'ISP SAHEL à télécharger.",
  alternates: { canonical: "/documents" },
};

export default async function DocumentsPage() {
  const [docs, filieres] = await Promise.all([getDocuments(), getFilieres()]);
  return (
    <>
      <PageHeader title="Documents" intro="Règlement, guides, programmes et formulaires : tous les documents utiles en un seul endroit." />
      <div className="container-page mt-10">
        <DocumentsBrowser
          docs={docs.map((d) => ({
            id: d.id,
            titre: d.titre,
            description: d.description,
            rubrique: d.rubrique,
            filiere: filieres.find((f) => f.id === d.filiere_id)?.nom ?? null,
            nom_fichier: d.nom_fichier,
            taille: d.taille,
            publie_le: d.publie_le,
            href: documentHref(d),
          }))}
        />
      </div>
    </>
  );
}
