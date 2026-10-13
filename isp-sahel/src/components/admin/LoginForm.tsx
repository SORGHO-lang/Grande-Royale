"use client";
import { useActionState } from "react";
import { login, type AdminState } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { status: "idle" } as AdminState);
  return (
    <form action={action} className="grid gap-4">
      {state.status === "error" && <p role="alert" className="rounded-xl bg-[#b42318]/10 p-3 font-semibold text-[#b42318] dark:text-[#ff9a8f]">{state.message}</p>}
      <div>
        <label htmlFor="email" className="field-label">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
    </form>
  );
}
