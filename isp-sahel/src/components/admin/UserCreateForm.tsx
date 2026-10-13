"use client";
import { useActionState } from "react";
import { createStaffUser, type AdminState } from "@/app/admin/actions";

export function UserCreateForm() {
  const [state, action, pending] = useActionState(createStaffUser, { status: "idle" } as AdminState);
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2" aria-live="polite">
        {state.status === "success" && <p className="rounded-xl bg-success/10 p-3 font-semibold text-success">{state.message}</p>}
        {state.status === "error" && <p className="rounded-xl bg-[#b42318]/10 p-3 font-semibold text-[#b42318]">{state.message}</p>}
      </div>
      <div><label htmlFor="u-nom" className="field-label">Nom</label><input id="u-nom" name="nom" required className="field" /></div>
      <div><label htmlFor="u-email" className="field-label">E-mail</label><input id="u-email" name="email" type="email" required className="field" autoComplete="off" /></div>
      <div>
        <label htmlFor="u-role" className="field-label">Rôle</label>
        <select id="u-role" name="role" className="field" defaultValue="editeur">
          <option value="editeur">Éditeur (actualités, galerie, documents)</option>
          <option value="admin">Administrateur (tout)</option>
        </select>
      </div>
      <div><label htmlFor="u-pass" className="field-label">Mot de passe provisoire (10 caractères min.)</label><input id="u-pass" name="password" type="password" minLength={10} required className="field" autoComplete="new-password" /></div>
      <div><button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Création…" : "Créer le compte"}</button></div>
    </form>
  );
}
