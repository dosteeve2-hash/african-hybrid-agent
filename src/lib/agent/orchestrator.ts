import { buildAgentSystemPrompt } from "@/lib/agent/system-prompt";
import { generateOpenAICompatible, synthesizeWithoutLLM } from "@/lib/llm/generate";
import { loadCorpus } from "@/lib/rag/corpus";
import { retrieveChunks } from "@/lib/rag/retrieve";
import { scoreFromMeta } from "@/lib/sources/credibility";
import type { ChatMessage, ChatMode, ChatResponseBody, Citation } from "@/lib/types/chat";

function lastUserMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user") return messages[i].content;
  }
  return "";
}

function toConversation(
  messages: ChatMessage[],
): { role: "user" | "assistant"; content: string }[] {
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of messages) {
    if (m.role === "system") continue;
    if (m.role === "user" || m.role === "assistant") {
      out.push({ role: m.role, content: m.content });
    }
  }
  return out;
}

export async function runAgentTurn(params: {
  messages: ChatMessage[];
  mode: ChatMode;
}): Promise<ChatResponseBody> {
  const warnings: string[] = [];
  const mode = params.mode;

  if (!process.env.OPENAI_API_KEY?.trim()) {
    warnings.push(
      "Aucune OPENAI_API_KEY : réponses limitées à une synthèse locale du dossier data/corpus (ajoute une clé ou Ollama pour un vrai dialoguer).",
    );
  }

  const corpus = await loadCorpus();
  if (corpus.length === 0) {
    warnings.push(
      "Corpus vide : ajoute des fichiers .md dans data/corpus pour alimenter le RAG.",
    );
  }

  const query = lastUserMessage(params.messages);
  const retrieved = retrieveChunks(query, corpus, 6);

  const citations: Citation[] = retrieved.map((c) => ({
    id: c.id,
    sourceFile: c.sourceFile,
    excerpt: c.text.slice(0, 280) + (c.text.length > 280 ? "…" : ""),
    credibilityScore: scoreFromMeta(c.meta),
    sourceType: c.meta.sourceType ?? "unspecified",
    region: c.meta.region,
  }));

  const system = buildAgentSystemPrompt(mode);
  const conv = toConversation(params.messages);

  try {
    const llm = await generateOpenAICompatible({
      system,
      userMessages: conv,
      corpusChunks: retrieved,
    });

    if (llm) {
      return {
        reply: llm.text,
        citations,
        providerUsed: "openai-compatible",
        mode,
        warnings,
      };
    }
  } catch (e) {
    warnings.push(
      `Erreur LLM : ${e instanceof Error ? e.message : String(e)} — bascule locale.`,
    );
  }

  return {
    reply: synthesizeWithoutLLM(query, retrieved),
    citations,
    providerUsed: "local-synthesis",
    mode,
    warnings,
  };
}
