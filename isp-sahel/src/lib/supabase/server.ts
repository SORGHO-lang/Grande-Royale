import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createJsClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/** Client lié à la session de l'utilisateur (cookies) — RLS appliquée. */
export async function createSessionClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component : le middleware rafraîchit la session.
        }
      },
    },
  });
}

/** Client anonyme sans cookies — lecture publique, compatible avec le cache statique. */
export function createPublicClient(): SupabaseClient {
  return createJsClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client service_role — contourne la RLS. À n'utiliser que côté serveur, avec parcimonie. */
export function createServiceClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  return createJsClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
