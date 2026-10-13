import { describe, expect, it } from "vitest";
import { contactSchema, fieldErrors, preinscriptionSchema } from "@/lib/validation";

describe("formulaire de pré-inscription", () => {
  const ok = { nom: "Awa Ouédraogo", telephone: "+226 70 12 34 56", email: "", filiere: "Informatique de Gestion", niveau: "Licence", message: "" };

  it("accepte une demande valide sans e-mail", () => {
    const r = preinscriptionSchema.safeParse(ok);
    expect(r.success).toBe(true);
    expect(r.data?.email).toBeUndefined();
  });

  it("refuse un téléphone invalide, un e-mail mal formé et un niveau inconnu", () => {
    const r = preinscriptionSchema.safeParse({ ...ok, telephone: "abc", email: "pas-un-mail", niveau: "Doctorat" });
    expect(r.success).toBe(false);
    const e = fieldErrors(r.error!);
    expect(Object.keys(e).sort()).toEqual(["email", "niveau", "telephone"]);
  });

  it("refuse un nom vide ou trop long", () => {
    expect(preinscriptionSchema.safeParse({ ...ok, nom: " " }).success).toBe(false);
    expect(preinscriptionSchema.safeParse({ ...ok, nom: "x".repeat(121) }).success).toBe(false);
  });

  it("accepte les formats de numéros burkinabè courants", () => {
    for (const t of ["+226 50 39 33 33", "07 33 33 37", "0022670000000", "(+226) 70-00-00-00"]) {
      expect(preinscriptionSchema.safeParse({ ...ok, telephone: t }).success, t).toBe(true);
    }
  });
});

describe("formulaire de contact", () => {
  it("exige un e-mail et un message", () => {
    const r = contactSchema.safeParse({ nom: "Jean", email: "", message: "" });
    expect(r.success).toBe(false);
    expect(Object.keys(fieldErrors(r.error!))).toEqual(expect.arrayContaining(["email", "message"]));
  });
  it("accepte un message valide avec téléphone facultatif vide", () => {
    expect(contactSchema.safeParse({ nom: "Jean", email: "jean@example.com", telephone: "", sujet: "", message: "Bonjour, je voudrais des informations." }).success).toBe(true);
  });
});
