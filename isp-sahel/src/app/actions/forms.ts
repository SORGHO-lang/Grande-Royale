"use server";

import { headers } from "next/headers";
import { sendNotification } from "@/lib/email";
import { whatsappHref } from "@/lib/format";
import { getParametres } from "@/lib/data";
import { clientIp, hashIp, rateLimit } from "@/lib/rate-limit";
import { hasServiceRole } from "@/lib/supabase/config";
import { createServiceClient } from "@/lib/supabase/server";
import {
  contactSchema,
  fieldErrors,
  HONEYPOT_FIELD,
  MIN_FILL_MS,
  preinscriptionSchema,
  type FormState,
} from "@/lib/validation";

const LIMITE = 5; // envois
const FENETRE_MS = 15 * 60 * 1000; // par 15 minutes

const valeurs = (fd: FormData, champs: string[]) =>
  Object.fromEntries(champs.map((c) => [c, String(fd.get(c) ?? "")]));

/** Vérifications anti-spam communes. Renvoie un état d'erreur ou null. */
async function antiSpam(fd: FormData, table: string): Promise<{ blocked: FormState | null; ipHash: string; bot: boolean }> {
  const ipHash = hashIp(clientIp(await headers()));
  // Robot : champ piège rempli ou formulaire envoyé trop vite → on simule un succès.
  const startedAt = Number(fd.get("_t") ?? 0);
  if (String(fd.get(HONEYPOT_FIELD) ?? "") !== "" || (startedAt && Date.now() - startedAt < MIN_FILL_MS)) {
    return { blocked: null, ipHash, bot: true };
  }
  const tooMany: FormState = {
    status: "error",
    message: "Trop d'envois depuis votre connexion. Merci de réessayer dans quelques minutes ou de nous appeler.",
  };
  if (!rateLimit(`${table}:${ipHash}`, LIMITE, FENETRE_MS).ok) return { blocked: tooMany, ipHash, bot: false };
  if (hasServiceRole()) {
    const { count } = await createServiceClient()
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", new Date(Date.now() - FENETRE_MS).toISOString());
    if ((count ?? 0) >= LIMITE) return { blocked: tooMany, ipHash, bot: false };
  }
  return { blocked: null, ipHash, bot: false };
}

/** Enregistre en base ; en mode démo (sans Supabase), journalise seulement hors production. */
async function enregistrer(table: string, row: Record<string, unknown>): Promise<boolean> {
  if (!hasServiceRole()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[mode démo] ${table} :`, row);
      return true;
    }
    return false;
  }
  const { error } = await createServiceClient().from(table).insert(row);
  if (error) console.error(`[forms] insertion ${table} :`, error);
  return !error;
}

export async function submitPreinscription(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = valeurs(fd, ["nom", "telephone", "email", "filiere", "niveau", "message"]);
  const parsed = preinscriptionSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: "Merci de corriger les champs indiqués.", errors: fieldErrors(parsed.error), values };
  }
  const d = parsed.data;
  const p = await getParametres();
  const whatsapp = whatsappHref(
    p.whatsapp,
    `Bonjour ISP SAHEL, je souhaite me pré-inscrire.\nNom : ${d.nom}\nTéléphone : ${d.telephone}${d.email ? `\nE-mail : ${d.email}` : ""}\nFilière : ${d.filiere}\nNiveau : ${d.niveau}`,
  );

  const { blocked, ipHash, bot } = await antiSpam(fd, "preinscriptions");
  if (blocked) return { ...blocked, values };
  if (bot) return { status: "success", message: "Merci ! Votre pré-inscription a bien été envoyée.", whatsapp };

  const saved = await enregistrer("preinscriptions", {
    nom: d.nom,
    telephone: d.telephone,
    email: d.email ?? null,
    filiere: d.filiere,
    niveau: d.niveau,
    message: d.message ?? null,
    ip_hash: ipHash,
  });
  const mailed = await sendNotification({
    subject: `Nouvelle pré-inscription — ${d.nom} (${d.niveau})`,
    replyTo: d.email,
    rows: [["Nom", d.nom], ["Téléphone", d.telephone], ["E-mail", d.email], ["Filière", d.filiere], ["Niveau", d.niveau], ["Message", d.message]],
  });

  if (!saved && !mailed) {
    return {
      status: "error",
      message: `L'envoi n'a pas abouti. Envoyez votre demande via WhatsApp ou appelez le ${p.telephone_1}.`,
      values,
      whatsapp,
    };
  }
  return {
    status: "success",
    message: "Merci ! Votre pré-inscription a bien été enregistrée. Notre scolarité vous rappellera très prochainement.",
    whatsapp,
  };
}

export async function submitContact(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = valeurs(fd, ["nom", "email", "telephone", "sujet", "message"]);
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: "Merci de corriger les champs indiqués.", errors: fieldErrors(parsed.error), values };
  }
  const d = parsed.data;
  const { blocked, ipHash, bot } = await antiSpam(fd, "messages_contact");
  if (blocked) return { ...blocked, values };
  if (bot) return { status: "success", message: "Merci, votre message a bien été envoyé." };

  const saved = await enregistrer("messages_contact", {
    nom: d.nom,
    email: d.email,
    telephone: d.telephone ?? null,
    sujet: d.sujet ?? null,
    message: d.message,
    ip_hash: ipHash,
  });
  const mailed = await sendNotification({
    subject: `Message du site — ${d.sujet ?? d.nom}`,
    replyTo: d.email,
    rows: [["Nom", d.nom], ["E-mail", d.email], ["Téléphone", d.telephone], ["Sujet", d.sujet], ["Message", d.message]],
  });
  if (!saved && !mailed) {
    const p = await getParametres();
    return { status: "error", message: `L'envoi n'a pas abouti. Écrivez-nous à ${p.email} ou appelez le ${p.telephone_1}.`, values };
  }
  return { status: "success", message: "Merci, votre message a bien été envoyé. Nous vous répondrons rapidement." };
}
