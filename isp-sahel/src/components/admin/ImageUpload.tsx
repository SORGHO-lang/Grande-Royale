"use client";
import Image from "next/image";
import { useId, useState } from "react";
import { acceptAttribute, MAX_IMAGE_MB } from "@/lib/uploads";
import { Icon } from "../Icon";
import { uploadToStorage } from "./uploadClient";

export function ImageUpload({ name, label, defaultValue, folder, required, error }: { name: string; label: string; defaultValue?: string | null; folder: string; required?: boolean; error?: string }) {
  const id = useId();
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const { publicUrl } = await uploadToStorage(file, "image", folder);
      setUrl(publicUrl ?? "");
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <fieldset>
      <legend className="field-label">{label} {required ? <span className="text-[#b42318]">*</span> : null}</legend>
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl bg-surface-2 ring-1 ring-line">
          {url ? <Image src={url} alt="Aperçu" fill sizes="176px" className="object-cover" unoptimized /> : <span className="flex h-full items-center justify-center text-muted"><Icon name="image" size={32} /></span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <label htmlFor={id} className="btn btn-outline cursor-pointer">
            <Icon name="plus" size={18} /> {busy ? "Téléversement…" : url ? "Remplacer" : "Choisir une image"}
          </label>
          <input id={id} type="file" accept={acceptAttribute("image")} onChange={onFile} disabled={busy} className="sr-only" />
          {url && <button type="button" className="btn btn-outline" onClick={() => setUrl("")}>Retirer</button>}
        </div>
      </div>
      <p className="mt-1 text-sm text-muted">JPG, PNG, WebP ou AVIF — {MAX_IMAGE_MB} Mo maximum.</p>
      {(msg || error) && <p className="field-error" role="alert">{msg || error}</p>}
    </fieldset>
  );
}
