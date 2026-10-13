"use client";
import { useId, useState } from "react";
import { formatTaille } from "@/lib/format";
import { acceptAttribute, DOCUMENT_TYPES, MAX_DOCUMENT_MB } from "@/lib/uploads";
import { Icon } from "../Icon";
import { uploadToStorage } from "./uploadClient";

export function FileUpload({ name, label, defaultValue, defaultName, folder, error }: { name: string; label: string; defaultValue?: string | null; defaultName?: string | null; folder: string; error?: string }) {
  const id = useId();
  const [path, setPath] = useState(defaultValue ?? "");
  const [fileName, setFileName] = useState(defaultName ?? "");
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await uploadToStorage(file, "document", folder);
      setPath(r.path);
      setFileName(file.name.slice(0, 200));
      setInfo(`${formatTaille(file.size)} — sera vérifié à l'enregistrement`);
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      <input type="hidden" name={name} value={path} />
      <input type="hidden" name={`${name}__nom`} value={fileName} />
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-line p-4 sm:flex-row sm:items-center">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-link"><Icon name="file" size={22} /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{path ? fileName || path.split("/").pop() : "Aucun fichier"}</p>
          {info && <p className="text-sm text-muted">{info}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <label htmlFor={id} className="btn btn-outline cursor-pointer">{busy ? "Téléversement…" : path ? "Remplacer" : "Choisir un fichier"}</label>
          <input id={id} type="file" accept={acceptAttribute("document")} onChange={onFile} disabled={busy} className="sr-only" />
          {path && <button type="button" className="btn btn-outline" onClick={() => { setPath(""); setFileName(""); setInfo(null); }}>Retirer</button>}
        </div>
      </div>
      <p className="mt-1 text-sm text-muted">
        Formats : {Object.keys(DOCUMENT_TYPES).join(", ").toUpperCase()} — {MAX_DOCUMENT_MB} Mo maximum. Le fichier remplacé est supprimé à l&apos;enregistrement.
      </p>
      {(msg || error) && <p className="field-error" role="alert">{msg || error}</p>}
    </fieldset>
  );
}
