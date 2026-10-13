import Image from "next/image";
import Link from "next/link";
import { NAV, SITE } from "@/lib/site";
import { telHref, whatsappHref } from "@/lib/format";
import type { Parametres } from "@/lib/types";
import { Icon } from "../Icon";

export function Footer({ p }: { p: Parametres }) {
  return (
    <footer className="mt-16 bg-navy text-white">
      <div className="h-1.5 bg-gradient-to-r from-gold via-sky to-green" aria-hidden="true" />
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <Image src={SITE.logo} alt="Logo de l'ISP SAHEL" width={56} height={56} className="h-14 w-14 rounded-full bg-white" />
            <div>
              <p className="text-xl font-extrabold">ISP SAHEL</p>
              <p className="text-sm text-white/80">{SITE.nom}</p>
            </div>
          </div>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1 text-sm font-bold text-navy">
            <Icon name="shield" size={16} /> {SITE.mentionCle}
          </p>
          <p className="mt-3 text-sm text-white/80">{SITE.slogan}</p>
        </div>

        <nav aria-label="Liens rapides">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gold">Liens rapides</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-9 items-center text-white/90 hover:text-gold hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gold">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex gap-2"><Icon name="pin" size={18} className="mt-0.5 shrink-0" /> {p.adresse}</li>
            {[p.telephone_1, p.telephone_2].filter(Boolean).map((t) => (
              <li key={t}>
                <a href={telHref(t)} className="inline-flex min-h-9 items-center gap-2 hover:text-gold hover:underline">
                  <Icon name="phone" size={18} /> {t}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${p.email}`} className="inline-flex min-h-9 items-center gap-2 hover:text-gold hover:underline">
                <Icon name="mail" size={18} /> {p.email}
              </a>
            </li>
            <li>
              <a href={whatsappHref(p.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 hover:text-gold hover:underline">
                <Icon name="whatsapp" size={18} /> WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gold">Informations</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li><Link href="/admission#preinscription" className="inline-flex min-h-9 items-center hover:text-gold hover:underline">Pré-inscription en ligne</Link></li>
            <li><Link href="/mentions-legales" className="inline-flex min-h-9 items-center hover:text-gold hover:underline">Mentions légales</Link></li>
            <li><Link href="/confidentialite" className="inline-flex min-h-9 items-center hover:text-gold hover:underline">Politique de confidentialité</Link></li>
            <li><a href="/actualites/rss.xml" className="inline-flex min-h-9 items-center gap-2 hover:text-gold hover:underline"><Icon name="rss" size={16} /> Flux RSS</a></li>
            <li><Link href="/admin" className="inline-flex min-h-9 items-center text-white/70 hover:text-gold hover:underline">Espace admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="container-page py-5 pb-20 text-center text-xs leading-relaxed text-white/80 [overflow-wrap:anywhere] sm:pb-5">
          Autorisation d&apos;ouverture n° {SITE.autorisation} — Arrêté n° {SITE.arrete} — ©️ 2026 ISP SAHEL
        </p>
      </div>
    </footer>
  );
}
