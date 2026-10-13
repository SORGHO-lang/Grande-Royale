import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { JsonLd } from "@/components/ui/JsonLd";
import { getParametres } from "@/lib/data";
import { SITE } from "@/lib/site";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const p = await getParametres();

  const org = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: SITE.nom,
    alternateName: SITE.sigle,
    url: SITE.url,
    logo: `${SITE.url}${SITE.logo}`,
    description: SITE.presentation,
    slogan: SITE.slogan,
    foundingDate: String(SITE.anneeOuverture),
    founder: { "@type": "Person", name: SITE.fondateur },
    email: p.email,
    telephone: [p.telephone_1, p.telephone_2].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      streetAddress: `Quartier ${SITE.quartier}`,
      addressLocality: SITE.ville,
      addressCountry: "BF",
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
  };

  return (
    <>
      <JsonLd data={org} />
      <Header telephone={p.telephone_1} />
      <main id="contenu" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer p={p} />
      <WhatsAppFloat numero={p.whatsapp} />
    </>
  );
}
