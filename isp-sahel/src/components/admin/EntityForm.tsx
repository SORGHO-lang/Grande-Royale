"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import type { AdminState } from "@/app/admin/actions";
import type { Field } from "@/lib/admin/entities";
import { FileUpload } from "./FileUpload";
import { ImageUpload } from "./ImageUpload";
import { RichTextEditor } from "./RichTextEditor";

type Props = {
  action: (prev: AdminState, fd: FormData) => Promise<AdminState>;
  fields: Field[];
  values: Record<string, unknown>;
  relations: Record<string, { value: string; label: string }[]>;
  backHref: string;
};

const str = (v: unknown) => (v === null || v === undefined ? "" : Array.isArray(v) ? v.join("\n") : String(v));

export function EntityForm({ action, fields, values, relations, backHref }: Props) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as AdminState);
  const statusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "error") statusRef.current?.focus();
  }, [state]);
  const err = (n: string) => state.errors?.[n];

  return (
    <form action={formAction} className="grid gap-6">
      <div ref={statusRef} tabIndex={-1} aria-live="assertive" className="outline-none">
        {state.status === "error" && <p className="rounded-xl border border-[#b42318]/40 bg-[#b42318]/10 p-4 font-semibold text-[#b42318] dark:text-[#ff9a8f]">{state.message}</p>}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((f) => {
          const v = values[f.name] ?? f.defaultValue;
          const id = `f-${f.name}`;
          const wrap = (control: React.ReactNode, labelled = true) => (
            <div key={f.name} className={f.full || f.type === "richtext" ? "md:col-span-2" : ""}>
              {labelled && (
                <label htmlFor={id} className="field-label">
                  {f.label} {f.required ? <span className="text-[#b42318]">*</span> : null}
                </label>
              )}
              {control}
              {f.help && <p id={`${id}-help`} className="mt-1 text-sm text-muted">{f.help}</p>}
              {labelled && err(f.name) && <p className="field-error" role="alert">{err(f.name)}</p>}
            </div>
          );
          const common = {
            id,
            name: f.name,
            "aria-invalid": err(f.name) ? true : undefined,
            "aria-describedby": f.help ? `${id}-help` : undefined,
            className: "field",
          };
          switch (f.type) {
            case "textarea":
            case "lines":
              return wrap(<textarea {...common} rows={f.type === "lines" ? 5 : 4} defaultValue={str(v)} required={f.required} maxLength={f.max} />);
            case "richtext":
              return wrap(<RichTextEditor name={f.name} label={f.label} defaultValue={str(v)} />, false);
            case "number":
              return wrap(<input {...common} type="number" inputMode="numeric" defaultValue={str(v)} />);
            case "boolean":
              return (
                <div key={f.name} className="flex items-center">
                  <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 font-semibold">
                    <input type="checkbox" name={f.name} defaultChecked={Boolean(v)} className="h-5 w-5 accent-[var(--brand)]" />
                    {f.label}
                  </label>
                </div>
              );
            case "select":
              return wrap(
                <select {...common} defaultValue={str(v)} required={f.required}>
                  {!f.required && <option value="">—</option>}
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>,
              );
            case "relation":
              return wrap(
                <select {...common} defaultValue={str(v)}>
                  <option value="">— Aucune —</option>
                  {(relations[f.name] ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>,
              );
            case "image":
              return (
                <div key={f.name} className="md:col-span-2">
                  <ImageUpload name={f.name} label={f.label} defaultValue={str(v)} folder={f.folder ?? "divers"} required={f.required} error={err(f.name)} />
                </div>
              );
            case "file":
              return (
                <div key={f.name} className="md:col-span-2">
                  <FileUpload name={f.name} label={f.label} defaultValue={str(v)} defaultName={str(values.nom_fichier)} folder={f.folder ?? "documents"} error={err(f.name)} />
                </div>
              );
            case "datetime":
              return wrap(<input {...common} type="datetime-local" defaultValue={str(v)} />);
            case "url":
              return wrap(<input {...common} type="url" inputMode="url" placeholder="https://" defaultValue={str(v)} maxLength={f.max} />);
            default:
              return wrap(<input {...common} type="text" defaultValue={str(v)} required={f.required && f.type !== "slug"} maxLength={f.max} />);
          }
        })}
      </div>
      <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl">
        <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</button>
        <Link href={backHref} className="btn btn-outline">Annuler</Link>
      </div>
    </form>
  );
}
