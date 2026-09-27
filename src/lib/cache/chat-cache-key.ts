import { createHash } from "node:crypto";

import type { ChatMessage, ChatMode } from "@/lib/types/chat";

/**
 * Tout ce qui change la réponse d'un tour de chat, et rien d'autre.
 * `mode` et les options en font partie : la même question posée en mode
 * `research` avec un autre `boostRegion` ne donne pas la même réponse, donc
 * ne doit pas partager son entrée de cache.
 */
export type ChatCacheInput = {
  messages: ChatMessage[];
  mode: ChatMode;
  /** Sérialisé tel quel : `unknown` dit honnêtement qu'on ne l'inspecte pas. */
  options?: unknown;
};

/**
 * Clé de cache d'un tour de chat : `<sessionId>:<empreinte>`.
 *
 * L'empreinte est un SHA-256 de la conversation entière. La version précédente
 * prenait `Buffer.from(JSON.stringify(messages)).toString("base64").slice(0, 32)`,
 * et ces 32 caractères de base64 ne couvrent que 24 octets du JSON — soit
 * exactement `[{"role":"user","content`. Le texte de la question tombait donc
 * hors de la clé : dans une session donnée, la 2e question recevait la réponse
 * de la 1re, servie pendant 24 h avec `fromCache: true`. Un condensé ne tronque
 * rien, et fait de la longueur fixe un choix plutôt qu'un accident.
 */
export function chatCacheKey(sessionId: string, input: ChatCacheInput): string {
  const empreinte = createHash("sha256")
    .update(
      JSON.stringify({
        messages: input.messages.map((m) => ({ role: m.role, content: m.content })),
        mode: input.mode,
        options: input.options ?? {},
      }),
    )
    .digest("hex");

  return `${sessionId}:${empreinte}`;
}
