import type Anthropic from "@anthropic-ai/sdk";
import type { CorpusChunk } from "@/lib/rag/corpus";

// Lazy-initialize to avoid issues in test environments (TextEncoder, etc.)
let _anthropic: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!_anthropic) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { default: AnthropicSDK } = require("@anthropic-ai/sdk") as { default: typeof Anthropic };
    _anthropic = new AnthropicSDK({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });
  }
  return _anthropic;
}

type LLMResult = { text: string; model: string; provider: "claude" | "openai" | "local" };

// ── Context formatting ────────────────────────────────────────────────────────

function formatContext(chunks: CorpusChunk[]): string {
  if (chunks.length === 0) return "";
  return (
    "\n\n---\nCONTEXTE CORPUS (sources africaines vérifiées — priorise ces données):\n\n" +
    chunks
      .map(
        (c, i) =>
          `[Source ${i + 1}] ${c.meta.title ?? c.sourceFile} (${c.meta.region ?? "Afrique"}, crédibilité: ${c.meta.credibilityTier ?? "medium"})\n${c.text}`,
      )
      .join("\n\n---\n\n") +
    "\n---"
  );
}

// ── Claude API ────────────────────────────────────────────────────────────────

export async function generateWithClaude(params: {
  system: string;
  userMessages: { role: "user" | "assistant"; content: string }[];
  corpusChunks: CorpusChunk[];
  model?: string;
}): Promise<LLMResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;

  const model = params.model ?? process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
  const systemWithContext = params.system + formatContext(params.corpusChunks);

  const message = await getAnthropic().messages.create({
    model,
    max_tokens: 1500,
    temperature: 0.3,
    system: systemWithContext,
    messages: params.userMessages,
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("")
    .trim();

  if (!text) throw new Error("Réponse Claude vide.");
  return { text, model, provider: "claude" };
}

// ── Streaming Claude API ──────────────────────────────────────────────────────

export async function* streamWithClaude(params: {
  system: string;
  userMessages: { role: "user" | "assistant"; content: string }[];
  corpusChunks: CorpusChunk[];
  model?: string;
}): AsyncGenerator<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY manquante");

  const model = params.model ?? process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
  const systemWithContext = params.system + formatContext(params.corpusChunks);

  const stream = getAnthropic().messages.stream({
    model,
    max_tokens: 1500,
    temperature: 0.3,
    system: systemWithContext,
    messages: params.userMessages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

// ── OpenAI-compatible fallback ────────────────────────────────────────────────

export async function generateWithOpenAI(params: {
  system: string;
  userMessages: { role: "user" | "assistant"; content: string }[];
  corpusChunks: CorpusChunk[];
}): Promise<LLMResult | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const base = (process.env.OPENAI_BASE_URL?.trim() ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL?.trim() ?? "gpt-4o-mini";
  const systemWithContext = params.system + formatContext(params.corpusChunks);

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemWithContext },
        ...params.userMessages,
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`OpenAI HTTP ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Réponse OpenAI vide.");
  return { text, model, provider: "openai" };
}

// ── Local synthesis (no external API) ────────────────────────────────────────

export function synthesizeLocally(query: string, chunks: CorpusChunk[]): string {
  if (chunks.length === 0) {
    return (
      `Je n'ai trouvé aucun extrait pertinent dans le corpus pour : "${query}".\n\n` +
      `Pour améliorer les résultats : ajoute des fichiers .md dans data/corpus/ ou configure ANTHROPIC_API_KEY / OPENAI_API_KEY.`
    );
  }

  const intro = `Synthèse locale (sans LLM externe) — extraits bruts du corpus africain.\n\n`;
  const body = chunks
    .map(
      (c, i) =>
        `**[${i + 1}] ${c.meta.title ?? c.sourceFile}** _(${c.meta.region ?? "Afrique"})_\n${c.text}`,
    )
    .join("\n\n");

  return intro + body;
}

// ── Primary entry point ───────────────────────────────────────────────────────

export async function generateResponse(params: {
  system: string;
  userMessages: { role: "user" | "assistant"; content: string }[];
  corpusChunks: CorpusChunk[];
  preferClaude?: boolean;
}): Promise<LLMResult> {
  // Try Claude first
  try {
    const result = await generateWithClaude(params);
    if (result) return result;
  } catch (e) {
    console.error("[generate] Claude failed:", (e as Error).message);
  }

  // Fallback to OpenAI
  try {
    const result = await generateWithOpenAI(params);
    if (result) return result;
  } catch (e) {
    console.error("[generate] OpenAI failed:", (e as Error).message);
  }

  // Local synthesis
  const lastUser = [...params.userMessages].reverse().find((m) => m.role === "user");
  return {
    text: synthesizeLocally(lastUser?.content ?? "", params.corpusChunks),
    model: "local-synthesis",
    provider: "local",
  };
}

// Legacy export for backward compatibility
export async function generateOpenAICompatible(params: {
  system: string;
  userMessages: { role: "user" | "assistant"; content: string }[];
  corpusChunks: CorpusChunk[];
}): Promise<{ text: string } | null> {
  const result = await generateResponse(params);
  return result.provider !== "local" ? { text: result.text } : null;
}

export { synthesizeLocally as synthesizeWithoutLLM };
