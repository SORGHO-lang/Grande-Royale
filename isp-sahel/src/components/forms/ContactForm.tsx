"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitContact } from "@/app/actions/forms";
import { contactSchema, fieldErrors, type FormState } from "@/lib/validation";
import { Icon } from "../Icon";
import { AntiSpam, TextArea, TextField } from "./Field";
import { useStartedAt } from "./useStartedAt";

export function ContactForm({ defaultSujet }: { defaultSujet?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitContact, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [sujet, setSujet] = useState(defaultSujet);
  useStartedAt(formRef);

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("sujet");
    if (s) setSujet(s.slice(0, 150));
  }, []);

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  const errors = { ...state.errors, ...clientErrors };
  const v = state.status === "error" ? state.values ?? {} : {};

  function validate(e: React.FormEvent<HTMLFormElement>) {
    const r = contactSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!r.success) {
      e.preventDefault();
      setClientErrors(fieldErrors(r.error));
      e.currentTarget.querySelector<HTMLElement>(`[name="${String(r.error.issues[0]?.path[0])}"]`)?.focus();
    } else setClientErrors({});
  }

  return (
    <form ref={formRef} action={action} onSubmit={validate} noValidate className="relative grid gap-5">
      <div ref={statusRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {state.status === "success" && (
          <p className="flex items-start gap-2 rounded-xl border border-success/40 bg-success/10 p-4 font-semibold text-success"><Icon name="check" className="mt-0.5 shrink-0" /> {state.message}</p>
        )}
        {state.status === "error" && state.message && (
          <p className="rounded-xl border border-[#b42318]/40 bg-[#b42318]/10 p-4 font-semibold text-[#b42318] dark:text-[#ff9a8f]">{state.message}</p>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nom" name="nom" required autoComplete="name" maxLength={120} defaultValue={v.nom} error={errors.nom} />
        <TextField label="E-mail" name="email" type="email" required autoComplete="email" maxLength={200} defaultValue={v.email} error={errors.email} />
        <TextField label="Téléphone" name="telephone" type="tel" autoComplete="tel" inputMode="tel" maxLength={30} defaultValue={v.telephone} error={errors.telephone} />
        <TextField key={sujet} label="Sujet" name="sujet" maxLength={150} defaultValue={v.sujet ?? sujet} error={errors.sujet} />
      </div>
      <TextArea label="Message" name="message" required rows={6} maxLength={5000} defaultValue={v.message} error={errors.message} />
      <AntiSpam />
      <button type="submit" className="btn btn-primary justify-self-start" disabled={pending}>
        {pending ? "Envoi en cours…" : "Envoyer le message"}
      </button>
    </form>
  );
}
