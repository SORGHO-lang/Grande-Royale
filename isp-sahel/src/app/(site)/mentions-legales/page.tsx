import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { getParametres } from "@/lib/data";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Mentions légales", alternates: { canonical: "/mentions-legales" } };

export default async function MentionsLegalesPage() {
  const p = await getParametres();
  return (
    <>
      <PageHeader title="Mentions légales" />
      <div className="prose-content container-page mt-10 max-w-3xl">
        <h2>Éditeur du site</h2>
        <p>
          {SITE.nom} ({SITE.sigle}) — établissement privé d&apos;enseignement supérieur reconnu par l&apos;État.<br />
          Adresse : {p.adresse}, {SITE.pays}.<br />
          Téléphone : {p.telephone_1} / {p.telephone_2} — E-mail : <a href={`mailto:${p.email}`}>{p.email}</a>
        </p>
        <p>Directeur de la publication : {SITE.fondateur}, Fondateur &amp; Directeur Général.</p>
        <h2>Reconnaissance officielle</h2>
        <p>
          Établissement ouvert en {SITE.anneeOuverture} sous l&apos;autorisation du {SITE.ministere}.<br />
          Autorisation d&apos;ouverture n° {SITE.autorisation} — Arrêté n° {SITE.arrete}.
        </p>
        <h2>Hébergement</h2>
        <p>Site hébergé par Vercel Inc. (vercel.com) ; données hébergées par Supabase (supabase.com).</p>
        <h2>Propriété intellectuelle</h2>
        <p>
          Les contenus de ce site (textes, logo, photographies) sont la propriété de l&apos;ISP SAHEL, sauf mention contraire. Toute
          reproduction sans autorisation préalable est interdite.
        </p>
        <h2>Informations à compléter</h2>
        <p><em>Forme juridique, numéro d&apos;immatriculation (RCCM / IFU) : à compléter par l&apos;établissement.</em></p>
      </div>
    </>
  );
}
