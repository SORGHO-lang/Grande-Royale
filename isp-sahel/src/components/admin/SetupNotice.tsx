import Link from "next/link";

export function SetupNotice() {
  return (
    <div className="card mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-extrabold">Administration non configurée</h1>
      <p className="mt-3 text-muted [overflow-wrap:anywhere]">
        Le site fonctionne actuellement en <strong>mode démo</strong> (données d&apos;exemple). Pour activer l&apos;espace d&apos;administration,
        renseignez les variables <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> et{" "}
        <code>SUPABASE_SERVICE_ROLE_KEY</code>, appliquez les migrations puis créez le premier administrateur (voir le README).
      </p>
      <Link href="/" className="btn btn-primary mt-6">Retour au site</Link>
    </div>
  );
}
