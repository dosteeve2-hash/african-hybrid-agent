/**
 * jsdom ne fournit pas les globales de l'API fetch : `new Request(...)` y est
 * indéfini. Ce module n'a rien de DOM, on l'exécute donc sous Node.
 *
 * @jest-environment node
 */
import {
  checkRateLimit,
  clientIdentifier,
  resetLocalRateLimits,
  AI_RATE_LIMIT,
} from "@/lib/rate-limit";

// Redis est optionnel dans ce projet et absent des tests : `initializeRedis`
// renvoie false, on exerce donc le compteur de repli en mémoire — précisément
// le chemin qui doit rester fermé si Redis tombe.
jest.mock("@/lib/cache/redis", () => ({
  initializeRedis: jest.fn(async () => false),
  getFromCache: jest.fn(async () => null),
  setInCache: jest.fn(async () => true),
}));

describe("checkRateLimit", () => {
  beforeEach(() => resetLocalRateLimits());

  it("laisse passer les requêtes sous le quota", async () => {
    const first = await checkRateLimit("1.2.3.4", { limit: 3, windowSeconds: 60 });
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);
  });

  it("bloque une fois le quota atteint", async () => {
    const options = { limit: 3, windowSeconds: 60 };
    for (let i = 0; i < 3; i++) {
      expect((await checkRateLimit("1.2.3.4", options)).allowed).toBe(true);
    }
    const blocked = await checkRateLimit("1.2.3.4", options);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("compte chaque appelant séparément", async () => {
    const options = { limit: 1, windowSeconds: 60 };
    expect((await checkRateLimit("1.1.1.1", options)).allowed).toBe(true);
    expect((await checkRateLimit("2.2.2.2", options)).allowed).toBe(true);
    expect((await checkRateLimit("1.1.1.1", options)).allowed).toBe(false);
  });

  // Sans Redis le compteur n'est pas partagé entre instances : l'appelant doit
  // pouvoir le savoir plutôt que de croire la limite globale.
  it("signale que le compteur n'est pas partagé quand Redis est absent", async () => {
    const result = await checkRateLimit("1.2.3.4", { limit: 5, windowSeconds: 60 });
    expect(result.shared).toBe(false);
  });

  it("rouvre le quota une fois la fenêtre passée", async () => {
    const options = { limit: 1, windowSeconds: 60 };
    const nowSpy = jest.spyOn(Date, "now");

    nowSpy.mockReturnValue(1_000_000);
    expect((await checkRateLimit("1.2.3.4", options)).allowed).toBe(true);
    expect((await checkRateLimit("1.2.3.4", options)).allowed).toBe(false);

    // 61 s plus tard, la fenêtre de 60 s est close.
    nowSpy.mockReturnValue(1_000_000 + 61_000);
    expect((await checkRateLimit("1.2.3.4", options)).allowed).toBe(true);

    nowSpy.mockRestore();
  });

  it("applique 20 requêtes par heure par défaut", async () => {
    expect(AI_RATE_LIMIT).toEqual({ limit: 20, windowSeconds: 3600 });
    for (let i = 0; i < 20; i++) {
      expect((await checkRateLimit("1.2.3.4")).allowed).toBe(true);
    }
    expect((await checkRateLimit("1.2.3.4")).allowed).toBe(false);
  });
});

describe("clientIdentifier", () => {
  const req = (headers: Record<string, string>) =>
    new Request("https://example.test/api/chat", { headers });

  it("prend la première adresse de x-forwarded-for", () => {
    expect(clientIdentifier(req({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))).toBe("203.0.113.9");
  });

  it("retombe sur x-real-ip", () => {
    expect(clientIdentifier(req({ "x-real-ip": "203.0.113.9" }))).toBe("203.0.113.9");
  });

  // Sans en-tête, tous les appelants partagent le seau « unknown » : plus
  // restrictif que pas de limite du tout, ce qui est le comportement voulu.
  it("renvoie « unknown » en l'absence d'en-tête", () => {
    expect(clientIdentifier(req({}))).toBe("unknown");
  });
});
