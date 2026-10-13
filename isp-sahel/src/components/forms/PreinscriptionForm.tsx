"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitPreinscription } from "@/app/actions/forms";
import type { FormState } from "@/lib/validation";
import { preinscriptionSchema, fieldErrors } from "@/lib/validation";
import { whatsappHref } from "@/lib/format";
import { Icon } from "../Icon";
import { AntiSpam, SelectField, TextArea, TextField } from "./Field";
import { useStartedAt } from "./useStartedAt";

type Props = { filieres: { slug: string; nom: string }[]; whatsapp: string };

export function PreinscriptionForm({ filieres, whatsapp }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitPreinscription, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [filiere, setFiliere] = useState("");
  useStartedAt(formRef);

  // Pré-sélection de la filière depuis l'URL (?filiere=slug).
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("filiere");
    const f = filieres.find((x) => x.slug === slug);
    if (f) setFiliere(f.nom);
  }, [filieres]);

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  const errors = { ...state.errors, ...clientErrors };
  const v = state.status === "error" ? state.values ?? {} : {};

  function validate(e: React.FormEvent<HTMLFormElement>) {
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const r = preinscriptionSchema.safeParse(data);
    if (!r.success) {
      e.preventDefault();
      setClientErrors(fieldErrors(r.error));
      const first = e.currentTarget.querySelector<HTMLElement>(`[name="${String(r.error.issues[0]?.path[0])}"]`);
      first?.focus();
    } else setClientErrors({});
  }

  /** Lien WhatsApp construit à partir de ce qui est saisi dans le formulaire. */
  function sendWhatsApp() {
    const fd = formRef.current ? new FormData(formRef.current) : new FormData();
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const msg = [
      "Bonjour ISP SAHEL, je souhaite me pré-inscrire.",
      get("nom") && `Nom : ${get("nom")}`,
      get("telephone") && `Téléphone : ${get("telephone")}`,
      get("email") && `E-mail : ${get("email")}`,
      get("filiere") && `Filière : ${get("filiere")}`,
      get("niveau") && `Niveau : ${get("niveau")}`,
    ].filter(Boolean).join("\n");
    window.open(state.whatsapp ?? whatsappHref(whatsapp, msg), "_blank", "noopener,noreferrer");
  }

  return (
    <form ref={formRef} action={action} onSubmit={validate} noValidate className="relative grid gap-5" aria-describedby="preinscription-aide">
      <p id="preinscription-aide" className="text-sm text-muted">Les champs marqués d&apos;un <span className="text-[#b42318]">*</span> sont obligatoires.</p>

      <div ref={statusRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {state.status === "success" && (
          <div className="rounded-xl border border-success/40 bg-success/10 p-4">
            <p className="flex items-start gap-2 font-semibold text-success"><Icon name="check" className="mt-0.5 shrink-0" /> {state.message}</p>
          </div>
        )}
        {state.status === "error" && state.message && (
          <div className="rounded-xl border border-[#b42318]/40 bg-[#b42318]/10 p-4 font-semibold text-[#b42318] dark:text-[#ff9a8f]">{state.message}</div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nom et prénom(s)" name="nom" required autoComplete="name" maxLength={120} defaultValue={v.nom} error={errors.nom} />
        <TextField label="Téléphone" name="telephone" type="tel" required autoComplete="tel" inputMode="tel" maxLength={30} defaultValue={v.telephone} error={errors.telephone} hint="Ex. : +226 70 00 00 00" />
        <TextField label="E-mail" name="email" type="email" autoComplete="email" maxLength={200} defaultValue={v.email} error={errors.email} />
        <SelectField
          label="Niveau"
          name="niveau"
          required
          placeholder="Choisir le niveau"
          defaultValue={v.niveau}
          error={errors.niveau}
          options={[{ value: "Licence", label: "Licence" }, { value: "Master", label: "Master" }]}
        />
      </div>
      <SelectField
        label="Filière souhaitée"
        name="filiere"
        required
        placeholder="Choisir une filière"
        value={filiere || v.filiere || ""}
        onChange={setFiliere}
        error={errors.filiere}
        options={filieres.map((f) => ({ value: f.nom, label: f.nom }))}
      />
      <TextArea label="Message" name="message" rows={3} maxLength={2000} defaultValue={v.message} error={errors.message} />
      <AntiSpam />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Envoi en cours…" : "Envoyer ma pré-inscription"}
        </button>
        <button type="button" onClick={sendWhatsApp} className="btn bg-[#157a3a] text-white hover:bg-[#0f6630]">
          <span aria-hidden="true">💬</span> Envoyer aussi via WhatsApp
        </button>
      </div>
      <p className="text-xs text-muted">
        Vos données servent uniquement à traiter votre demande d&apos;inscription. Voir notre{" "}
        <a href="/confidentialite" className="underline">politique de confidentialité</a>.
      </p>
    </form>
  );
}
