import { createHash } from "node:crypto";

/**
 * Limitation de débit en mémoire (fenêtre glissante, par clé).
 * Première barrière, par instance ; une seconde vérification est faite en base
 * (nombre d'envois récents pour la même empreinte d'IP).
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): { ok: boolean; retryAfterMs: number } {
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfterMs: windowMs - (now - hits[0]!) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return { ok: true, retryAfterMs: 0 };
}

export function resetRateLimit() {
  buckets.clear();
}

/** Empreinte non réversible de l'IP (on ne stocke jamais l'IP en clair). */
export function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT || "isp-sahel";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}
