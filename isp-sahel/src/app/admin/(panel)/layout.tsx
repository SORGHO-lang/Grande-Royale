import Image from "next/image";
import Link from "next/link";
import { logout } from "../actions";
import { Icon } from "@/components/Icon";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireStaff } from "@/lib/auth";
import { ENTITIES } from "@/lib/admin/entities";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <main className="px-4 py-16"><SetupNotice /></main>;
  const staff = await requireStaff();

  const items = [
    { href: "/admin", label: "Tableau de bord", icon: "home" },
    ...ENTITIES.filter((e) => e.roles.includes(staff.role)).map((e) => ({ href: `/admin/${e.key}`, label: e.label, icon: e.icon })),
    ...(staff.role === "admin"
      ? [
          { href: "/admin/preinscriptions", label: "Pré-inscriptions", icon: "graduation" },
          { href: "/admin/messages", label: "Messages", icon: "mail" },
          { href: "/admin/parametres", label: "Paramètres", icon: "settings" },
          { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "lock" },
        ]
      : []),
  ];

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-line bg-navy text-white lg:border-b-0">
        <div className="flex items-center gap-3 p-4">
          <Image src={SITE.logo} alt="" width={40} height={40} className="rounded-full" />
          <div className="min-w-0">
            <p className="font-extrabold leading-tight">ISP SAHEL</p>
            <p className="truncate text-xs text-white/75">{staff.nom || staff.email} · {staff.role === "admin" ? "Administrateur" : "Éditeur"}</p>
          </div>
        </div>
        <AdminNav items={items} />
        <div className="flex gap-2 p-4 pt-0 lg:flex-col">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-white/85 hover:bg-white/10" target="_blank">
            <Icon name="external" size={16} /> Voir le site
          </Link>
          <form action={logout}>
            <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-white/85 hover:bg-white/10">
              <Icon name="logout" size={16} /> Se déconnecter
            </button>
          </form>
        </div>
      </aside>
      <main id="contenu" className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
