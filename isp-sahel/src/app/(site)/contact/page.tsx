import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getParametres } from "@/lib/data";
import { telHref, whatsappHref } from "@/lib/format";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez l'ISP SAHEL à Ouagadougou (quartier Dassasgho) : +226 50 39 33 33, +226 07 33 33 37, contact@ispsahel.com, WhatsApp.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const p = await getParametres();
  const { lat, lng } = SITE.geo;
  const d = 0.012;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;

  const coords = [
    { icon: "pin", label: "Adresse", value: p.adresse },
    ...[p.telephone_1, p.telephone_2].filter(Boolean).map((t) => ({ icon: "phone", label: "Téléphone", value: t, href: telHref(t) })),
    { icon: "mail", label: "E-mail", value: p.email, href: `mailto:${p.email}` },
    { icon: "whatsapp", label: "WhatsApp", value: `+${p.whatsapp.replace(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5")}`, href: whatsappHref(p.whatsapp), external: true },
  ];

  return (
    <>
      <PageHeader title="Contact" intro="Une question sur nos formations ou l'inscription ? Écrivez-nous ou appelez-nous." />
      <div className="container-page mt-10 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <section aria-labelledby="coordonnees">
          <h2 id="coordonnees" className="text-2xl font-extrabold">Nos coordonnées</h2>
          <ul className="mt-5 space-y-3">
            {coords.map((c, i) => (
              <li key={i} className="card flex items-center gap-4 p-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"><Icon name={c.icon} size={20} /></span>
                <span className="min-w-0">
                  <span className="block text-sm text-muted">{c.label}</span>
                  {"href" in c && c.href ? (
                    <a href={c.href} {...("external" in c && c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="break-words font-semibold text-link underline-offset-4 hover:underline">{c.value}</a>
                  ) : (
                    <span className="font-semibold">{c.value}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-line">
            <iframe title="Carte : ISP SAHEL, quartier Dassasgho, Ouagadougou" src={mapSrc} className="block h-72 w-full" loading="lazy" referrerPolicy="no-referrer" />
          </div>
          <p className="mt-2 text-sm text-muted">
            Emplacement indicatif (quartier Dassasgho).{" "}
            <a className="underline" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`} target="_blank" rel="noopener noreferrer">Ouvrir la carte</a>
          </p>
        </section>
        <section aria-labelledby="ecrire" className="card p-6 sm:p-8">
          <h2 id="ecrire" className="text-2xl font-extrabold">Écrivez-nous</h2>
          <p className="mt-2 text-muted">Nous répondons par e-mail ou par téléphone.</p>
          <div className="mt-6"><ContactForm /></div>
        </section>
      </div>
    </>
  );
}
