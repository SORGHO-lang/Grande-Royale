/**
 * Crée (ou promeut) le premier administrateur.
 * Usage : npm run create-admin -- <email> <mot-de-passe> "<Nom affiché>"
 * Lit NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY depuis .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";

for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);

const [email, password, nom = "Administrateur"] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !password) {
  console.error('Usage : npm run create-admin -- <email> <mot-de-passe> "<Nom>"');
  process.exit(1);
}
if (password.length < 10) {
  console.error("Le mot de passe doit contenir au moins 10 caractères.");
  process.exit(1);
}
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (.env.local).");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

let userId;
const { data: created, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
if (error) {
  // L'utilisateur existe peut-être déjà : on le retrouve.
  const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
  userId = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
  if (!userId) {
    console.error("Création impossible :", error.message);
    process.exit(1);
  }
  console.log("Utilisateur existant trouvé, promotion en administrateur.");
} else {
  userId = created.user.id;
}

const { error: e2 } = await db.from("profils").upsert({ id: userId, nom, role: "admin" });
if (e2) {
  console.error("Profil non enregistré :", e2.message);
  process.exit(1);
}
console.log(`✓ Administrateur prêt : ${email}. Connectez-vous sur /admin/connexion.`);
