export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Vrai si les clés publiques Supabase sont configurées. */
export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Vrai si la clé service_role est disponible (serveur uniquement). */
export const hasServiceRole = () =>
  isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
