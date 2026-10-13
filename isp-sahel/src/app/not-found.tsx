import Link from "next/link";
import SiteLayout from "./(site)/layout";

export default function NotFound() {
  return (
    <SiteLayout>
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-6xl font-black text-gold">404</p>
      <h1 className="mt-3 text-3xl font-extrabold">Page introuvable</h1>
      <p className="mt-2 max-w-md text-muted">La page demandée n&apos;existe pas ou a été déplacée.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-primary">Retour à l&apos;accueil</Link>
        <Link href="/formations" className="btn btn-outline">Voir les formations</Link>
      </div>
    </div>
    </SiteLayout>
  );
}
