"use client";
import { useEffect, type RefObject } from "react";

/** Renseigne le champ caché « _t » avec l'heure d'affichage du formulaire. */
export function useStartedAt(form: RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    const input = form.current?.querySelector<HTMLInputElement>("input[name='_t']");
    if (input) input.value = String(Date.now());
  }, [form]);
}
