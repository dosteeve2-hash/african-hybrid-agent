import { buildAgentSystemPrompt } from "@/lib/agent/system-prompt";
import {
  generateResponse,
  streamWithOllama,
  streamWithClaude,
  synthesizeLocally,
} from "@/lib/llm/generate";
import { loadCorpus } from "@/lib/rag/corpus";
import { retrieveChunks, type RetrievalOptions } from "@/lib/rag/retrieve";
import { scoreFromMeta } from "@/lib/sources/credibility";
import { auditLogger, type RetrievalAudit, type ResponseAudit } from "@/lib/governance/audit";
import type { ChatMessage, ChatMode, ChatResponseBody, Citation, StreamChunk } from "@/lib/types/chat";

// ── Helpers ───────────────────────────────────────────────────────────────────

function lastUserMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user") return messages[i].content;
  }
  return "";
}

function toConversation(messages: ChatMessage[]): { role: "user" | "assistant"; content: string }[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

function estimateConfidence(citations: Citation[]): number {
  if (citations.length === 0) return 0;
  const avgReliability = citations.reduce((s, c) => s + c.credibilityScore, 0) / citations.length;
  const coverage = Math.min(1, citations.length / 5);
  return Number(((avgReliability / 100) * 0.7 + coverage * 0.3).toFixed(2));
}

// ── Run options ───────────────────────────────────────────────────────────────

export interface AgentRunOptions {
  mode?: ChatMode;
  searchMode?: "fast" | "semantic" | "hybrid";
  boostRegion?: string;
  maxCitations?: number;
  model?: string;
}

type AgentRunParams = {
  messages: ChatMessage[];
  mode?: ChatMode;
  options?: AgentRunOptions;
};

function normalizeArgs(
  input: AgentRunParams | ChatMessage[],
  opts?: AgentRunOptions,
): AgentRunParams {
  if (Array.isArray(input)) return { messages: input, mode: opts?.mode, options: opts };
  return input;
}

// ── Standard (non-streaming) turn ─────────────────────────────────────────────

export async function runAgentTurn(
  input: AgentRunParams | ChatMessage[],
  legacyOpts?: AgentRunOptions,
): Promise<ChatResponseBody> {
  const params = normalizeArgs(input, legacyOpts);
  const t0 = performance.now();
  const warnings: string[] = [];
  const mode: ChatMode = params.mode ?? params.options?.mode ?? "general";
  const searchMode = params.options?.searchMode ?? "semantic";
  const maxCitations = params.options?.maxCitations ?? 6;

  if (!process.env.ANTHROPIC_API_KEY?.trim() && !process.env.OPENAI_API_KEY?.trim()) {
    warnings.push("Aucune clé API configurée — synthèse locale uniquement.");
  }

  const corpus = await loadCorpus();
  if (corpus.length === 0) warnings.push("Corpus vide : ajoute des fichiers .md dans data/corpus/.");

  const query = lastUserMessage(params.messages);
  const t1 = performance.now();

  const retrievalOpts: RetrievalOptions = {
    topK: maxCitations,
    minRelevanceScore: searchMode === "fast" ? 0 : 0.05,
    searchMode: searchMode === "hybrid" ? "semantic" : searchMode,
    boostRegion: params.options?.boostRegion,
  };

  const retrieved = await retrieveChunks(query, retrievalOpts);
  const retrievalMs = Math.round(performance.now() - t1);

  const retrievalAudit: RetrievalAudit = {
    queryText: query,
    queriedAt: new Date().toISOString(),
    mode: searchMode === "hybrid" ? "semantic" : (searchMode as "fast" | "semantic"),
    topK: maxCitations,
    minRelevanceScore: retrievalOpts.minRelevanceScore,
    boostRegion: params.options?.boostRegion,
    retrievedChunkIds: retrieved.map((c) => c.id),
    totalChunksEvaluated: corpus.length,
    executionTimeMs: retrievalMs,
  };
  auditLogger.retrieval(retrievalAudit);

  const citations: Citation[] = retrieved.map((c) => ({
    id: c.id,
    sourceFile: c.sourceFile,
    excerpt: c.text.slice(0, 300) + (c.text.length > 300 ? "…" : ""),
    credibilityScore: scoreFromMeta(c.meta),
    sourceType: c.meta.sourceType ?? "unspecified",
    region: c.meta.region,
    title: c.meta.title,
  }));

  const confidence = estimateConfidence(citations);
  const agentSteps = [
    `Analyse query & expansion synonymes (mode: ${searchMode}).`,
    `BM25 retrieval dans ${corpus.length} chunks → ${retrieved.length} sélectionnés.`,
    `Scoring crédibilité + boost géo (${params.options?.boostRegion ?? "aucun"}).`,
  ];

  const system = buildAgentSystemPrompt(mode);
  const conv = toConversation(params.messages);

  const t2 = performance.now();
  const llmResult = await generateResponse({
    system,
    userMessages: conv,
    corpusChunks: retrieved,
    preferClaude: true,
  });
  const generationMs = Math.round(performance.now() - t2);
  const totalMs = Math.round(performance.now() - t0);

  agentSteps.push(`Génération via ${llmResult.provider} (${llmResult.model}) en ${generationMs}ms.`);

  const providerUsed: import("@/lib/types/chat").LLMProvider =
    llmResult.provider === "ollama"
      ? "ollama"
      : llmResult.provider === "claude"
        ? "claude"
        : llmResult.provider === "openai"
          ? "openai-compatible"
          : "local-synthesis";

  const responseAudit: ResponseAudit = {
    queryText: query,
    respondedAt: new Date().toISOString(),
    providerUsed: providerUsed === "local-synthesis" ? "local-synthesis" : "openai-compatible",
    confidence,
    citationCount: citations.length,
    warningCount: warnings.length,
    executionTimeMs: generationMs,
    model: llmResult.model,
  };
  auditLogger.response(responseAudit);

  return {
    reply: llmResult.text,
    response: llmResult.text,
    citations,
    chunks: retrieved.map((c) => c.id),
    providerUsed,
    model: llmResult.model,
    mode,
    warnings,
    confidence,
    agentSteps,
    perf: { totalMs, retrievalMs, generationMs },
  };
}

// ── Streaming turn (Claude API SSE) ───────────────────────────────────────────

export async function* streamAgentTurn(
  input: AgentRunParams | ChatMessage[],
  legacyOpts?: AgentRunOptions,
): AsyncGenerator<StreamChunk> {
  const params = normalizeArgs(input, legacyOpts);
  const t0 = performance.now();
  const mode: ChatMode = params.mode ?? params.options?.mode ?? "general";
  const searchMode = params.options?.searchMode ?? "semantic";
  const maxCitations = params.options?.maxCitations ?? 6;

  const query = lastUserMessage(params.messages);
  const corpus = await loadCorpus();

  const retrieved = await retrieveChunks(query, {
    topK: maxCitations,
    minRelevanceScore: 0.05,
    searchMode: searchMode === "hybrid" ? "semantic" : (searchMode as "fast" | "semantic"),
    boostRegion: params.options?.boostRegion,
  });

  const citations: Citation[] = retrieved.map((c) => ({
    id: c.id,
    sourceFile: c.sourceFile,
    excerpt: c.text.slice(0, 300) + (c.text.length > 300 ? "…" : ""),
    credibilityScore: scoreFromMeta(c.meta),
    sourceType: c.meta.sourceType ?? "unspecified",
    region: c.meta.region,
    title: c.meta.title,
  }));

  // Yield citations before text starts
  yield { type: "citations", citations };

  const system = buildAgentSystemPrompt(mode);
  const conv = toConversation(params.messages);

  const hasOllama = !!process.env.OLLAMA_URL || true; // always try Ollama first
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY?.trim();
  let streamProvider: import("@/lib/types/chat").LLMProvider = "local-synthesis";

  // Priority: Ollama (local) → Claude → local synthesis
  let streamed = false;
  try {
    for await (const chunk of streamWithOllama({
      system,
      userMessages: conv,
      corpusChunks: retrieved,
      model: params.options?.model,
    })) {
      if (!streamed) { streamed = true; streamProvider = "ollama"; }
      yield { type: "text", content: chunk };
    }
  } catch {
    // Ollama not running — try Claude
    if (hasAnthropicKey) {
      try {
        for await (const chunk of streamWithClaude({
          system,
          userMessages: conv,
          corpusChunks: retrieved,
          model: params.options?.model,
        })) {
          if (!streamed) { streamed = true; streamProvider = "claude"; }
          yield { type: "text", content: chunk };
        }
      } catch {
        // fall through
      }
    }
  }

  if (!streamed) {
    yield { type: "text", content: synthesizeLocally(query, retrieved) };
  }

  const totalMs = Math.round(performance.now() - t0);
  const confidence = estimateConfidence(citations);

  yield {
    type: "done",
    meta: {
      chunks: retrieved.map((c) => c.id),
      providerUsed: streamProvider,
      mode,
      warnings: streamProvider === "local-synthesis" ? ["Ollama non disponible et aucune clé API — synthèse locale."] : [],
      confidence,
      agentSteps: [
        `BM25 retrieval: ${retrieved.length}/${corpus.length} chunks.`,
        `Génération via ${streamProvider} (streaming).`,
        `Total: ${totalMs}ms.`,
      ],
      perf: { totalMs },
    },
  };
}
