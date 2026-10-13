import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { getParametres } from "@/lib/data";

export const metadata: Metadata = { title: "Politique de confidentialité", alternates: { canonical: "/confidentialite" } };

export default async function ConfidentialitePage() {
  const p = await getParametres();
  return (
    <>
      <PageHeader title="Politique de confidentialité" />
      <div className="prose-content container-page mt-10 max-w-3xl">
        <h2>Données collectées</h2>
        <p>
          Le site collecte uniquement les informations que vous saisissez dans les formulaires de <strong>pré-inscription</strong>{" "}
          (nom, téléphone, e-mail facultatif, filière, niveau, message) et de <strong>contact</strong> (nom, e-mail, téléphone facultatif, sujet,
          message).
        </p>
        <h2>Finalité</h2>
        <p>Ces données servent exclusivement à répondre à votre demande et à suivre votre inscription. Elles ne sont ni vendues ni cédées.</p>
        <h2>Sécurité et anti-spam</h2>
        <p>
          Pour limiter les abus, une empreinte non réversible de votre adresse IP est conservée avec votre demande ; l&apos;adresse IP elle-même
          n&apos;est pas enregistrée.
        </p>
        <h2>Durée de conservation</h2>
        <p>Les demandes sont conservées le temps nécessaire à leur traitement et au suivi de l&apos;année académique concernée.</p>
        <h2>Cookies</h2>
        <p>
          Le site public n&apos;utilise pas de cookie publicitaire ni de traceur. Seul votre choix de thème (clair/sombre) est mémorisé dans votre
          navigateur. L&apos;espace d&apos;administration utilise des cookies de session indispensables à la connexion.
        </p>
        <h2>Vos droits</h2>
        <p>
          Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données en écrivant à{" "}
          <a href={`mailto:${p.email}`}>{p.email}</a> ou en appelant le {p.telephone_1}.
        </p>
      </div>
    </>
  );
}
