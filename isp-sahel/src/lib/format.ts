/** Fonctions de formatage partagées (client et serveur). */

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Ouagadougou" }).format(new Date(iso));
}

export function formatTaille(octets: number | null | undefined): string {
  if (!octets) return "—";
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

/** « +226 50 39 33 33 » → « tel:+22650393333 » */
export function telHref(numero: string): string {
  return `tel:${numero.replace(/[^\d+]/g, "")}`;
}

/** Lien WhatsApp, éventuellement avec un message pré-rempli. */
export function whatsappHref(numero: string, message?: string): string {
  const n = numero.replace(/\D/g, "");
  return `https://wa.me/${n}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

export function initiales(nom: string): string {
  const mots = nom.replace(/^(Dre?|Docteur|Pr)\.?\s+/i, "").split(/\s+/).filter(Boolean);
  return mots.slice(0, 2).map((m) => m[0]!.toUpperCase()).join("");
}

/** Découpe un texte multi-lignes en lignes non vides. */
export function lignes(texte: string | null | undefined): string[] {
  return (texte ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

/** « Période | Événement » → { periode, evenement } */
export function parseCalendrier(texte: string): { periode: string; evenement: string }[] {
  return lignes(texte).map((l) => {
    const [periode, ...reste] = l.split("|");
    return reste.length
      ? { periode: periode.trim(), evenement: reste.join("|").trim() }
      : { periode: "À compléter", evenement: periode.trim() };
  });
}

export function extensionDe(nom: string | null | undefined): string {
  const m = /\.([a-z0-9]+)$/i.exec(nom ?? "");
  return m ? m[1].toUpperCase() : "";
}

/** Typographie française : espaces insécables avant « : ; ! ? » » et après « « ». */
export function typoFr(texte: string): string {
  return texte.replace(/ ([:;!?»])/g, "\u00a0$1").replace(/« /g, "«\u00a0");
}
