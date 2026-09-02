import { initializeRedis, getFromCache, setInCache } from "@/lib/cache/redis";

/** Règle CLAUDE.md : 20 requêtes par utilisateur et par heure sur les endpoints IA. */
export const AI_RATE_LIMIT = { limit: 20, windowSeconds: 3600 } as const;

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Secondes avant la réouverture du quota — sert l'en-tête Retry-After. */
  retryAfter: number;
  /** `false` quand Redis est indisponible : le compteur n'est alors pas partagé. */
  shared: boolean;
}

interface Counter {
  count: number;
  /** Fin de la fenêtre, en millisecondes epoch. */
  expiresAt: number;
}

// Repli en mémoire, propre à une instance. Redis étant optionnel dans ce
// projet, sans ce repli il suffirait de le rendre indisponible pour lever
// toute limite. Il ne remplace pas Redis en production multi-instances : il
// limite par instance, ce que `shared: false` signale à l'appelant.
const localCounters = new Map<string, Counter>();

function pruneExpired(now: number) {
  for (const [key, counter] of localCounters) {
    if (counter.expiresAt <= now) localCounters.delete(key);
  }
}

function bumpLocal(key: string, options: RateLimitOptions, now: number): Counter {
  pruneExpired(now);
  const existing = localCounters.get(key);
  if (existing && existing.expiresAt > now) {
    existing.count += 1;
    return existing;
  }
  const fresh: Counter = { count: 1, expiresAt: now + options.windowSeconds * 1000 };
  localCounters.set(key, fresh);
  return fresh;
}

/** Réinitialise le compteur local. Réservé aux tests. */
export function resetLocalRateLimits(): void {
  localCounters.clear();
}

/**
 * Compte une requête et indique si elle doit passer.
 *
 * Le compteur vit dans Redis quand il est joignable, sinon en mémoire. La
 * fenêtre est fixe, pas glissante : c'est ce que permet un simple compteur
 * à expiration, et c'est suffisant pour borner le coût d'un abus.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = AI_RATE_LIMIT,
): Promise<RateLimitResult> {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  const redisReady = await initializeRedis();

  if (redisReady) {
    const stored = await getFromCache<Counter>(key);
    const counter =
      stored && stored.expiresAt > now
        ? { count: stored.count + 1, expiresAt: stored.expiresAt }
        : { count: 1, expiresAt: now + options.windowSeconds * 1000 };

    const ttl = Math.max(1, Math.ceil((counter.expiresAt - now) / 1000));
    await setInCache(key, counter, ttl);

    return {
      allowed: counter.count <= options.limit,
      limit: options.limit,
      remaining: Math.max(0, options.limit - counter.count),
      retryAfter: ttl,
      shared: true,
    };
  }

  const counter = bumpLocal(key, options, now);
  return {
    allowed: counter.count <= options.limit,
    limit: options.limit,
    remaining: Math.max(0, options.limit - counter.count),
    retryAfter: Math.max(1, Math.ceil((counter.expiresAt - now) / 1000)),
    shared: false,
  };
}

/**
 * Identifie l'appelant. L'application n'a pas d'authentification : l'adresse
 * IP transmise par le proxy est le meilleur identifiant disponible. Elle est
 * usurpable, mais elle borne l'abus le plus courant — une boucle depuis une
 * seule machine qui vide le crédit d'API.
 */
export function clientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
