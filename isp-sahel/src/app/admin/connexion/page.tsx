import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { getStaff } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SITE } from "@/lib/site";

export const metadata = { title: "Connexion" };
export const dynamic = "force-dynamic";

export default async function ConnexionPage() {
  if (!isSupabaseConfigured()) return <main className="px-4 py-16"><SetupNotice /></main>;
  if (await getStaff()) redirect("/admin");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="card w-full max-w-sm p-8">
        <div className="flex flex-col items-center text-center">
          <Image src={SITE.logo} alt="Logo ISP SAHEL" width={72} height={72} className="rounded-full" />
          <h1 className="mt-4 text-2xl font-extrabold">Espace d&apos;administration</h1>
          <p className="mt-1 text-sm text-muted">Réservé au personnel de l&apos;ISP SAHEL.</p>
        </div>
        <div className="mt-6"><LoginForm /></div>
        <p className="mt-6 text-center text-sm"><Link href="/" className="text-link underline">← Retour au site</Link></p>
      </div>
    </main>
  );
}
