"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV, SITE } from "@/lib/site";
import { telHref } from "@/lib/format";
import { Icon } from "../Icon";
import { ThemeToggle } from "./ThemeToggle";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ telephone }: { telephone: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  // Fait défiler la barre mobile jusqu'à l'onglet actif.
  useEffect(() => {
    const active = stripRef.current?.querySelector<HTMLElement>("[aria-current='page']");
    active?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-navy">
        Aller au contenu
      </a>
      <div className="container-page flex h-16 items-center gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="ISP SAHEL — accueil">
          <Image src={SITE.logo} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full" priority />
          <span className="min-w-0 leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-link">ISP SAHEL</span>
            <span className="hidden truncate text-xs text-muted sm:block xl:hidden 2xl:block">{SITE.nom}</span>
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="ml-auto hidden xl:block">
          <ul className="flex items-center whitespace-nowrap text-sm font-medium 2xl:gap-0.5 2xl:text-[0.9rem]">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="inline-flex min-h-11 items-center rounded-full px-2 hover:bg-surface-2 2xl:px-2.5 aria-[current=page]:bg-primary aria-[current=page]:text-on-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 xl:ml-2">
          <a href={telHref(telephone)} className="btn btn-accent hidden !px-4 sm:inline-flex xl:hidden 2xl:inline-flex" aria-label={`Appeler le ${telephone}`}>
            <Icon name="phone" size={18} /> Appeler
          </a>
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface-2 xl:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} size={24} />
          </button>
        </div>
      </div>

      {/* Barre de navigation défilable (mobile / tablette) */}
      <nav aria-label="Navigation rapide" className="border-t border-line xl:hidden">
        <ul ref={stripRef} className="no-scrollbar container-page flex gap-1 overflow-x-auto py-1.5 text-sm font-medium">
          {NAV.map((item) => (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className="inline-flex min-h-11 items-center rounded-full px-3 hover:bg-surface-2 aria-[current=page]:bg-primary aria-[current=page]:text-on-primary"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Menu burger plein écran */}
      <div
        id="menu-mobile"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto bg-surface xl:hidden"
      >
        <nav aria-label="Menu" className="container-page py-4">
          <ul className="grid gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="flex min-h-12 items-center justify-between rounded-xl px-4 text-lg font-semibold hover:bg-surface-2 aria-[current=page]:bg-primary aria-[current=page]:text-on-primary"
                >
                  {item.label}
                  <Icon name="chevronRight" size={18} />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href={telHref(telephone)} className="btn btn-accent">
              <Icon name="phone" size={18} /> Appeler le {telephone}
            </a>
            <Link href="/admission#preinscription" className="btn btn-primary">
              Pré-inscription en ligne
            </Link>
          </div>
          <p className="mt-6 text-center text-sm">
            <Link href="/admin" className="text-muted underline">Espace admin</Link>
          </p>
        </nav>
      </div>
    </header>
  );
}
