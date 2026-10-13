/**
 * Règles de téléversement, partagées entre navigateur et serveur.
 * Le serveur revérifie systématiquement (extension, type MIME réel stocké, taille).
 */

export const DOCUMENT_TYPES: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ppt: ["application/vnd.ms-powerpoint"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  csv: ["text/csv", "application/vnd.ms-excel", "text/plain"],
  txt: ["text/plain"],
  zip: ["application/zip", "application/x-zip-compressed"],
};

export const IMAGE_TYPES: Record<string, string[]> = {
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  avif: ["image/avif"],
};

export type UploadKind = "document" | "image";

export const MAX_DOCUMENT_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || 20);
export const MAX_IMAGE_MB = 5;

export const BUCKETS: Record<UploadKind, string> = { document: "documents", image: "media" };

export function rulesFor(kind: UploadKind) {
  return kind === "document"
    ? { types: DOCUMENT_TYPES, maxBytes: MAX_DOCUMENT_MB * 1024 * 1024, maxMb: MAX_DOCUMENT_MB }
    : { types: IMAGE_TYPES, maxBytes: MAX_IMAGE_MB * 1024 * 1024, maxMb: MAX_IMAGE_MB };
}

export function acceptAttribute(kind: UploadKind): string {
  const { types } = rulesFor(kind);
  return [...Object.keys(types).map((e) => `.${e}`), ...new Set(Object.values(types).flat())].join(",");
}

export function extensionOf(name: string): string {
  const m = /\.([a-z0-9]{1,8})$/i.exec(name.trim());
  return m ? m[1]!.toLowerCase() : "";
}

/** Nom de fichier sûr : ASCII, minuscules, sans chemin ni caractères spéciaux. */
export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "fichier";
  const ext = extensionOf(base);
  const stem = (ext ? base.slice(0, -(ext.length + 1)) : base)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "fichier";
  return ext ? `${stem}.${ext}` : stem;
}

/** Vérifie un fichier ; renvoie un message d'erreur en français ou null. */
export function validateUpload(file: { name: string; type: string; size: number }, kind: UploadKind): string | null {
  const { types, maxBytes, maxMb } = rulesFor(kind);
  const ext = extensionOf(file.name);
  if (!ext || !types[ext]) {
    return `Format non autorisé. Formats acceptés : ${Object.keys(types).join(", ").toUpperCase()}.`;
  }
  const mime = (file.type || "").split(";")[0]!.trim().toLowerCase();
  if (!mime || !types[ext]!.includes(mime)) {
    return `Le type du fichier (${mime || "inconnu"}) ne correspond pas à l'extension .${ext}.`;
  }
  if (file.size <= 0) return "Le fichier est vide.";
  if (file.size > maxBytes) return `Fichier trop volumineux (maximum ${maxMb} Mo).`;
  return null;
}

/** Chemin de stockage : dossier/AAAA/MM/<aléatoire>-<nom-assaini>. */
export function storagePath(folder: string, fileName: string, random: string): string {
  const d = new Date();
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "divers";
  return `${safeFolder}/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${random}-${sanitizeFileName(fileName)}`;
}

/** Un chemin de stockage valide (aucun « .. », aucun caractère exotique). */
export function isSafeStoragePath(p: string): boolean {
  return /^[a-z0-9-]+\/\d{4}\/\d{2}\/[a-z0-9-]+-[a-z0-9-]+(\.[a-z0-9]{1,8})?$/.test(p);
}
