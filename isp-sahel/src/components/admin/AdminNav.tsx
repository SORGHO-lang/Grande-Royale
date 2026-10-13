"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../Icon";

export function AdminNav({ items }: { items: { href: string; label: string; icon: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="px-2 pb-3">
      <ul className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {items.map((it) => {
          const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
          return (
            <li key={it.href} className="shrink-0">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-white/90 hover:bg-white/10 aria-[current=page]:bg-gold aria-[current=page]:text-navy"
              >
                <Icon name={it.icon} size={18} /> {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
