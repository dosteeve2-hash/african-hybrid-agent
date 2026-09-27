/**
 * @jest-environment node
 */
import { chatCacheKey } from "@/lib/cache/chat-cache-key";
import type { ChatMessage } from "@/lib/types/chat";

const q = (content: string): ChatMessage[] => [{ role: "user", content }];

const prix = q("Quel est le prix du maïs au Burkina Faso ?");
const pme = q("Comment financer une PME à Bobo-Dioulasso ?");

describe("chatCacheKey", () => {
  it("donne des clés différentes à deux questions différentes", () => {
    // La régression que ce test verrouille : l'ancienne clé tronquait le base64
    // à 32 caractères, soit `[{"role":"user","content` — identique pour toute
    // question. Les deux clés ci-dessous étaient donc égales, et la 2e question
    // d'une session recevait la réponse de la 1re pendant 24 h.
    expect(chatCacheKey("s1", { messages: prix, mode: "general" })).not.toEqual(
      chatCacheKey("s1", { messages: pme, mode: "general" }),
    );
  });

  it("est stable pour des entrées identiques", () => {
    expect(chatCacheKey("s1", { messages: prix, mode: "general" })).toEqual(
      chatCacheKey("s1", { messages: prix, mode: "general" }),
    );
  });

  it("sépare les modes et les options, qui changent la réponse", () => {
    const general = chatCacheKey("s1", { messages: prix, mode: "general" });
    const research = chatCacheKey("s1", { messages: prix, mode: "research" });
    const boosted = chatCacheKey("s1", {
      messages: prix,
      mode: "general",
      options: { boostRegion: "Hauts-Bassins" },
    });

    expect(new Set([general, research, boosted]).size).toBe(3);
  });

  it("sépare les sessions", () => {
    expect(chatCacheKey("s1", { messages: prix, mode: "general" })).not.toEqual(
      chatCacheKey("s2", { messages: prix, mode: "general" }),
    );
  });

  it("distingue une question de suite de la question seule", () => {
    const suite: ChatMessage[] = [
      ...prix,
      { role: "assistant", content: "Environ 200 FCFA le kilo." },
      { role: "user", content: "Et à Ouagadougou ?" },
    ];

    expect(chatCacheKey("s1", { messages: suite, mode: "general" })).not.toEqual(
      chatCacheKey("s1", { messages: prix, mode: "general" }),
    );
  });
});
