import { z } from "zod";

const texte = (min: number, max: number, msg: string) =>
  z.string().trim().min(min, msg).max(max, `${max} caractères maximum`);

/** Téléphone : chiffres, espaces, +, -, (), . — entre 8 et 15 chiffres. */
export const telephoneSchema = z
  .string()
  .trim()
  .regex(/^[+(\d][\d\s()+.-]{6,24}$/, "Numéro de téléphone invalide")
  .refine((v) => {
    const n = v.replace(/\D/g, "").length;
    return n >= 8 && n <= 15;
  }, "Numéro de téléphone invalide");

const emailOptionnel = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((v) => (v ? v : undefined))
  .pipe(z.email("Adresse e-mail invalide").optional());

export const preinscriptionSchema = z.object({
  nom: texte(2, 120, "Indiquez votre nom complet"),
  telephone: telephoneSchema,
  email: emailOptionnel,
  filiere: texte(2, 150, "Choisissez une filière"),
  niveau: z.enum(["Licence", "Master"], { message: "Choisissez un niveau" }),
  message: z.string().trim().max(2000, "2000 caractères maximum").optional().transform((v) => v || undefined),
});
export type PreinscriptionInput = z.infer<typeof preinscriptionSchema>;

export const contactSchema = z.object({
  nom: texte(2, 120, "Indiquez votre nom"),
  email: z.string().trim().max(200).pipe(z.email("Adresse e-mail invalide")),
  telephone: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || undefined)
    .pipe(telephoneSchema.optional()),
  sujet: z.string().trim().max(150).optional().transform((v) => v || undefined),
  message: texte(5, 5000, "Votre message est trop court"),
});
export type ContactInput = z.infer<typeof contactSchema>;

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
  whatsapp?: string;
};

/** Convertit les erreurs zod en { champ: message } (premier message par champ). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Champ piège anti-robots : doit rester vide. */
export const HONEYPOT_FIELD = "site_web";
/** Un humain met plus de 2 secondes à remplir un formulaire. */
export const MIN_FILL_MS = 2000;
