import { buildAgentSystemPrompt } from "@/lib/agent/system-prompt";
import { generateOpenAICompatible, synthesizeWithoutLLM } from "@/lib/llm/generate";
import { loadCorpus } from "@/lib/rag/corpus";
import { retrieveChunks, type RetrievalOptions } from "@/lib/rag/retrieve";
import { scoreFromMeta } from "@/lib/sources/credibility";
import { auditLogger, type RetrievalAudit, type ResponseAudit } from "@/lib/governance/audit";
import type { ChatMessage, ChatMode, ChatResponseBody, Citation } from "@/lib/types/chat";

function lastUserMessage(messages: ChatMessage[] = []): string {
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

function estimateConfidence(citations: Citation[]): number {
  if (citations.length === 0) return 0;
  const avgReliability =
    citations.reduce((sum, c) => sum + c.credibilityScore, 0) /
    citations.length;
  const coverage = Math.min(1, citations.length / 4);
  return Number(((avgReliability / 100) * coverage).toFixed(2));
}

export interface AgentRunOptions {
  mode?: ChatMode;
  searchMode?: "fast" | "semantic";
  boostRegion?: string;
  maxCitations?: number;
}

type AgentRunParams = {
  messages: ChatMessage[];
  mode?: ChatMode;
  options?: AgentRunOptions;
};

function normalizeRunArgs(
  paramsOrMessages: AgentRunParams | ChatMessage[],
  options?: AgentRunOptions,
): AgentRunParams {
  if (Array.isArray(paramsOrMessages)) {
    return {
      messages: paramsOrMessages,
      mode: options?.mode,
      options,
    };
  }
  return paramsOrMessages;
}

export async function runAgentTurn(
  paramsOrMessages: AgentRunParams | ChatMessage[],
  legacyOptions?: AgentRunOptions,
): Promise<ChatResponseBody> {
  const params = normalizeRunArgs(paramsOrMessages, legacyOptions);
  const startTime = performance.now();
  const warnings: string[] = [];
  const mode: ChatMode = params.mode ?? params.options?.mode ?? "general";
  const searchMode = params.options?.searchMode ?? "semantic";
  const maxCitations = params.options?.maxCitations ?? 6;

  if (!process.env.OPENAI_API_KEY?.trim()) {
    warnings.push(
      "Aucune OPENAI_API_KEY : reponses limitees a une synthese locale du dossier data/corpus.",
    );
  }

  const corpus = await loadCorpus();
  if (corpus.length === 0) {
    warnings.push(
      "Corpus vide : ajoute des fichiers .md dans data/corpus pour alimenter le RAG.",
    );
  }

  const query = lastUserMessage(params.messages);
  const retrievalStartTime = performance.now();

  // Options de récupération
  const retrievalOpts: RetrievalOptions = {
    topK: maxCitations,
    minRelevanceScore: searchMode === "fast" ? 0 : 0.15,
    searchMode,
    boostRegion: params.options?.boostRegion,
  };

  const retrieved = retrieveChunks(query, corpus, retrievalOpts);
  const retrievalTimeMs = Math.round(performance.now() - retrievalStartTime);

  // Audit de récupération
  const retrievalAudit: RetrievalAudit = {
    queryText: query,
    queriedAt: new Date().toISOString(),
    mode: searchMode,
    topK: maxCitations,
    minRelevanceScore: retrievalOpts.minRelevanceScore,
    boostRegion: params.options?.boostRegion,
    retrievedChunkIds: retrieved.map((c) => c.id),
    totalChunksEvaluated: corpus.length,
    executionTimeMs: retrievalTimeMs,
  };
  auditLogger.retrieval(retrievalAudit);

  const citations: Citation[] = retrieved.map((c) => ({
    id: c.id,
    sourceFile: c.sourceFile,
    excerpt: c.text.slice(0, 280) + (c.text.length > 280 ? "..." : ""),
    credibilityScore: scoreFromMeta(c.meta),
    sourceType: c.meta.sourceType ?? "unspecified",
    region: c.meta.region,
    title: c.meta.title,
  }));

  const confidence = estimateConfidence(citations);
  const agentSteps = [
    `Analyse de la question et extraction des mots-cles (mode: ${searchMode}).`,
    `Recherche locale dans ${corpus.length} fragments du corpus.`,
    `Selection de ${retrieved.length} extraits pertinents avec score de fiabilite.`,
    process.env.OPENAI_API_KEY?.trim()
      ? "Generation LLM avec contexte RAG injecte."
      : "Synthese locale sans appel LLM externe.",
  ];

  const system = buildAgentSystemPrompt(mode);
  const conv = toConversation(params.messages);

  try {
    const llmStartTime = performance.now();
    const llm = await generateOpenAICompatible({
      system,
      userMessages: conv,
      corpusChunks: retrieved,
    });
    const llmTimeMs = Math.round(performance.now() - llmStartTime);

    if (llm) {
      const totalMs = Math.round(performance.now() - startTime);
      const responseAudit: ResponseAudit = {
        queryText: query,
        respondedAt: new Date().toISOString(),
        providerUsed: "openai-compatible",
        confidence,
        citationCount: citations.length,
        warningCount: warnings.length,
        executionTimeMs: llmTimeMs,
        model: process.env.OPENAI_MODEL,
      };
      auditLogger.response(responseAudit);

      return {
        reply: llm.text,
        response: llm.text,
        citations,
        chunks: retrieved.map((chunk) => chunk.id),
        providerUsed: "openai-compatible",
        mode,
        warnings,
        confidence,
        agentSteps,
        perf: {
          totalMs,
          retrievalMs: retrievalTimeMs,
          generationMs: llmTimeMs,
        },
      };
    }
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    warnings.push(`Erreur LLM : ${errMsg} - bascule locale.`);
    auditLogger.error("agent", "LLM call failed", e instanceof Error ? e : new Error(errMsg));
  }

  // Synthèse locale
  const localStartTime = performance.now();
  const localReply = synthesizeWithoutLLM(query, retrieved);
  const localTimeMs = Math.round(performance.now() - localStartTime);

  const responseAudit: ResponseAudit = {
    queryText: query,
    respondedAt: new Date().toISOString(),
    providerUsed: "local-synthesis",
    confidence,
    citationCount: citations.length,
    warningCount: warnings.length,
    executionTimeMs: localTimeMs,
  };
  auditLogger.response(responseAudit);

  const totalTimeMs = Math.round(performance.now() - startTime);
  agentSteps.push(`Temps total: ${totalTimeMs}ms (retrieval: ${retrievalTimeMs}ms).`);

  return {
    reply: localReply,
    response: localReply,
    citations,
    chunks: retrieved.map((chunk) => chunk.id),
    providerUsed: "local-synthesis",
    mode,
    warnings,
    confidence,
    agentSteps,
    perf: {
      totalMs: totalTimeMs,
      retrievalMs: retrievalTimeMs,
      generationMs: localTimeMs,
    },
  };
}
