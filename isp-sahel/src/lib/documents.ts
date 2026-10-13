import type { DocumentItem } from "./types";

/** Lien de téléchargement d'un document, ou null si aucun fichier n'est encore déposé. */
export function documentHref(d: Pick<DocumentItem, "id" | "chemin_storage">): string | null {
  return d.chemin_storage ? `/documents/${d.id}/telecharger` : null;
}
