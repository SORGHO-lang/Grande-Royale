"use client";
import { useActionState } from "react";
import { saveParametres, type AdminState } from "@/app/admin/actions";

const LONGS = new Set(["mot_dg", "calendrier_academique", "pieces_dossier"]);

export function ParametresForm({ values, labels }: { values: Record<string, string>; labels: Record<string, string> }) {
  const [state, action, pending] = useActionState(saveParametres, { status: "idle" } as AdminState);
  return (
    <form action={action} className="grid gap-5">
      <div aria-live="polite">
        {state.status === "success" && <p className="rounded-xl bg-success/10 p-3 font-semibold text-success">{state.message}</p>}
        {state.status === "error" && <p className="rounded-xl bg-[#b42318]/10 p-3 font-semibold text-[#b42318]">{state.message}</p>}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {Object.entries(labels).map(([cle, label]) => (
          <div key={cle} className={LONGS.has(cle) ? "md:col-span-2" : ""}>
            <label htmlFor={`p-${cle}`} className="field-label">{label}</label>
            {LONGS.has(cle) ? (
              <textarea id={`p-${cle}`} name={cle} rows={cle === "mot_dg" ? 8 : 6} defaultValue={values[cle] ?? ""} className="field" aria-invalid={state.errors?.[cle] ? true : undefined} />
            ) : (
              <input id={`p-${cle}`} name={cle} defaultValue={values[cle] ?? ""} className="field" aria-invalid={state.errors?.[cle] ? true : undefined} />
            )}
            {state.errors?.[cle] && <p className="field-error" role="alert">{state.errors[cle]}</p>}
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 border-t border-line bg-surface/95 py-3 backdrop-blur">
        <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer les paramètres"}</button>
      </div>
    </form>
  );
}
