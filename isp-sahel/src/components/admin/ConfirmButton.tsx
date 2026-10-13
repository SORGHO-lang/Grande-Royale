"use client";
import { useTransition } from "react";

/** Bouton qui demande confirmation avant d'exécuter une action serveur. */
export function ConfirmButton({ action, message, children, className = "btn btn-outline" }: { action: () => Promise<void>; message: string; children: React.ReactNode; className?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={() => {
        if (window.confirm(message)) start(() => action());
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}
