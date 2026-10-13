"use client";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { addGalleryPhotos } from "@/app/admin/actions";
import { acceptAttribute, MAX_IMAGE_MB } from "@/lib/uploads";
import { uploadToStorage } from "./uploadClient";

/** Téléversement de plusieurs photos d'un coup dans un album. */
export function GalleryBulkUpload() {
  const id = useId();
  const router = useRouter();
  const [album, setAlbum] = useState("Remise de diplômes");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 50);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    const lines: string[] = [];
    const ok: { url: string; legende: string; alt: string }[] = [];
    for (const [i, file] of files.entries()) {
      setLog([...lines, `Téléversement ${i + 1}/${files.length} : ${file.name}…`]);
      try {
        const { publicUrl } = await uploadToStorage(file, "image", "galerie");
        if (publicUrl) ok.push({ url: publicUrl, legende: "", alt: "" });
        lines.push(`✓ ${file.name}`);
      } catch (err) {
        lines.push(`✗ ${file.name} : ${(err as Error).message}`);
      }
    }
    if (ok.length) {
      const res = await addGalleryPhotos(ok, album);
      lines.push(res.message ?? "");
    }
    setLog(lines);
    setBusy(false);
    router.refresh();
  }

  return (
    <section aria-labelledby="ajout-multiple" className="card mt-6 p-5">
      <h2 id="ajout-multiple" className="text-lg font-bold">Ajout multiple de photos</h2>
      <p className="text-sm text-muted">Sélectionnez plusieurs images (JPG, PNG, WebP, AVIF — {MAX_IMAGE_MB} Mo max chacune). Ajoutez ensuite légendes et descriptions via « Modifier ».</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor={`${id}-album`} className="field-label">Album</label>
          <input id={`${id}-album`} className="field" value={album} onChange={(e) => setAlbum(e.target.value)} maxLength={100} />
        </div>
        <label htmlFor={id} className="btn btn-primary cursor-pointer">{busy ? "Envoi en cours…" : "Choisir des photos"}</label>
        <input id={id} type="file" multiple accept={acceptAttribute("image")} onChange={onFiles} disabled={busy} className="sr-only" />
      </div>
      {log.length > 0 && <ul className="mt-3 space-y-1 text-sm" role="status">{log.map((l, i) => <li key={i}>{l}</li>)}</ul>}
    </section>
  );
}
