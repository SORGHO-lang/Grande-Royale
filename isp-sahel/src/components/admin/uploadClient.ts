"use client";
import { createClient } from "@/lib/supabase/browser";
import { BUCKETS, storagePath, validateUpload, type UploadKind } from "@/lib/uploads";

/** Téléverse un fichier directement vers Supabase Storage (session de l'utilisateur, RLS). */
export async function uploadToStorage(file: File, kind: UploadKind, folder: string): Promise<{ path: string; publicUrl: string | null; name: string }> {
  const err = validateUpload(file, kind);
  if (err) throw new Error(err);
  const supabase = createClient();
  const bucket = BUCKETS[kind];
  const path = storagePath(folder, file.name, crypto.randomUUID().slice(0, 8));
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false, cacheControl: "31536000" });
  if (error) throw new Error(`Échec du téléversement : ${error.message}`);
  const publicUrl = kind === "image" ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null;
  return { path, publicUrl, name: file.name.slice(0, 200) };
}
