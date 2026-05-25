import { loadCorpus, type CorpusChunk } from "@/lib/rag/corpus";
import { computeRelevanceScore } from "@/lib/rag/embeddings";
import { scoreFromMeta } from "@/lib/sources/credibility";

export interface RetrievalOptions {
  topK?: number;
  minRelevanceScore?: number;
  boostRegion?: string;
  searchMode?: "fast" | "semantic";
}

export type RetrievedChunk = CorpusChunk & {
  source: string;
  relevanceScore: number;
  credibility: number;
};

const STOP = new Set([
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "de",
  "du",
  "et",
  "ou",
  "a",
  "au",
  "aux",
  "pour",
  "par",
  "sur",
  "dans",
  "est",
  "son",
  "sa",
  "ses",
  "ce",
  "cette",
  "ces",
  "qui",
  "que",
  "dont",
  "avec",
  "sans",
  "plus",
  "moins",
  "tres",
  "comme",
  "the",
  "and",
  "or",
  "of",
  "to",
  "an",
  "in",
  "on",
  "for",
  "with",
]);

function tokenizeFast(q: string): string[] {
  return q
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-zA-Z0-9]+/u)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function enrichChunk(c: CorpusChunk, relevanceScore: number): RetrievedChunk {
  const credibility = scoreFromMeta(c.meta);
  return {
    ...c,
    source: c.sourceFile,
    relevanceScore: Number(Math.max(0, Math.min(1, relevanceScore)).toFixed(3)),
    credibility,
  };
}

function retrieveChunksFast(
  query: string,
  chunks: CorpusChunk[],
  topK: number,
): RetrievedChunk[] {
  const tokens = new Set(tokenizeFast(query));
  if (tokens.size === 0) return chunks.slice(0, topK).map((c) => enrichChunk(c, 0));

  const scored = chunks.map((c) => {
    const hay = `${c.meta.title ?? ""} ${c.text}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "");
    let lexical = 0;
    for (const t of tokens) {
      if (hay.includes(t)) lexical += 1;
    }
    const relevance = Math.min(1, lexical / Math.max(1, tokens.size));
    return { c, score: relevance };
  });

  scored.sort((a, b) => b.score - a.score);
  const filtered = scored.filter((s) => s.score > 0);
  return (filtered.length ? filtered : scored)
    .slice(0, topK)
    .map((s) => enrichChunk(s.c, s.score));
}

function retrieveChunksSemantic(
  query: string,
  chunks: CorpusChunk[],
  topK: number,
  minScore: number,
  boostRegion?: string,
): RetrievedChunk[] {
  if (!query.trim()) return chunks.slice(0, topK).map((c) => enrichChunk(c, 0));

  const scored = chunks.map((c) => {
    const fullText = `${c.meta.title ?? ""} ${c.text}`;
    const score = computeRelevanceScore(
      query,
      fullText,
      {
        region: c.meta.region,
        credibilityScore: scoreFromMeta(c.meta),
      },
      boostRegion,
    );
    return { c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const filtered = scored.filter((s) => s.score >= minScore);
  const shouldFallback = filtered.length === 0 && minScore <= 0.1;
  return (filtered.length > 0 ? filtered : shouldFallback ? scored : [])
    .slice(0, topK)
    .map((s) => enrichChunk(s.c, s.score));
}

function normalizeArgs(
  chunksOrOptions?: CorpusChunk[] | number | RetrievalOptions,
  maybeOptions?: number | RetrievalOptions,
): {
  chunks?: CorpusChunk[];
  options: RetrievalOptions;
} {
  if (Array.isArray(chunksOrOptions)) {
    const options =
      typeof maybeOptions === "number"
        ? { topK: maybeOptions }
        : (maybeOptions ?? {});
    return { chunks: chunksOrOptions, options };
  }

  if (typeof chunksOrOptions === "number") {
    return { options: { topK: chunksOrOptions } };
  }

  return { options: chunksOrOptions ?? {} };
}

export function retrieveChunks(
  query: string,
  chunks: CorpusChunk[],
  options?: number | RetrievalOptions,
): RetrievedChunk[];
export function retrieveChunks(
  query: string,
  options?: number | RetrievalOptions,
): Promise<RetrievedChunk[]>;
export function retrieveChunks(
  query: string,
  chunksOrOptions?: CorpusChunk[] | number | RetrievalOptions,
  maybeOptions?: number | RetrievalOptions,
): RetrievedChunk[] | Promise<RetrievedChunk[]> {
  const { chunks, options } = normalizeArgs(chunksOrOptions, maybeOptions);
  const topK = options.topK ?? 5;
  const minRelevanceScore = options.minRelevanceScore ?? 0.1;
  const mode = options.searchMode ?? "semantic";

  const run = (sourceChunks: CorpusChunk[]): RetrievedChunk[] => {
    if (sourceChunks.length === 0) return [];
    if (mode === "fast") return retrieveChunksFast(query, sourceChunks, topK);
    return retrieveChunksSemantic(
      query,
      sourceChunks,
      topK,
      minRelevanceScore,
      options.boostRegion,
    );
  };

  if (chunks) return run(chunks);
  return loadCorpus().then(run);
}
