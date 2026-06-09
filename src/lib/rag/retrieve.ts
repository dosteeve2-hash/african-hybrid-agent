import { loadCorpus, type CorpusChunk } from "@/lib/rag/corpus";
import {
  buildBM25Index,
  bm25Score,
  expandWithSynonyms,
  tokenize,
  credibilityBoost,
  geoBoost,
  type BM25Index,
} from "@/lib/rag/embeddings";
import { scoreFromMeta } from "@/lib/sources/credibility";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RetrievalOptions {
  topK?: number;
  minRelevanceScore?: number;
  boostRegion?: string;
  searchMode?: "fast" | "semantic" | "hybrid";
}

export type RetrievedChunk = CorpusChunk & {
  source: string;
  relevanceScore: number;
  bm25Score: number;
  credibility: number;
};

// ── In-memory BM25 index (singleton per process) ──────────────────────────────

let bm25Index: BM25Index | null = null;
let indexedChunks: CorpusChunk[] = [];

async function getOrBuildIndex(): Promise<{ index: BM25Index; chunks: CorpusChunk[] }> {
  if (bm25Index && indexedChunks.length > 0) {
    return { index: bm25Index, chunks: indexedChunks };
  }
  const chunks = await loadCorpus();
  bm25Index = buildBM25Index(
    chunks.map((c) => ({ id: c.id, text: `${c.meta.title ?? ""} ${c.text}` }))
  );
  indexedChunks = chunks;
  return { index: bm25Index, chunks };
}

export function invalidateBM25Index(): void {
  bm25Index = null;
  indexedChunks = [];
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function buildRetrievedChunk(chunk: CorpusChunk, rawScore: number): RetrievedChunk {
  const cred = scoreFromMeta(chunk.meta);
  const regions = chunk.meta.regions ?? (chunk.meta.region ? [chunk.meta.region] : []);
  return {
    ...chunk,
    source: chunk.sourceFile,
    bm25Score: rawScore,
    relevanceScore: rawScore,
    credibility: cred,
  };
}

function applyBoosts(
  chunks: Array<{ chunk: CorpusChunk; score: number }>,
  boostRegion?: string,
): Array<{ chunk: CorpusChunk; score: number }> {
  return chunks.map(({ chunk, score }) => {
    const regions = chunk.meta.regions ?? (chunk.meta.region ? [chunk.meta.region] : []);
    const cred = chunk.meta.credibilityTier ?? "medium";
    const boosted = score * credibilityBoost(cred) * geoBoost(regions, boostRegion);
    return { chunk, score: boosted };
  });
}

// ── Fast retrieval (keyword matching) ─────────────────────────────────────────

function retrieveFast(
  query: string,
  chunks: CorpusChunk[],
  topK: number,
  boostRegion?: string,
): RetrievedChunk[] {
  const tokens = new Set(tokenize(query));
  if (tokens.size === 0) return chunks.slice(0, topK).map((c) => buildRetrievedChunk(c, 0));

  const scored = chunks.map((c) => {
    const hay = `${c.meta.title ?? ""} ${c.text}`.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
    let hits = 0;
    for (const t of tokens) if (hay.includes(t)) hits++;
    return { chunk: c, score: hits / tokens.size };
  });

  const boosted = applyBoosts(scored, boostRegion);
  boosted.sort((a, b) => b.score - a.score);
  const filtered = boosted.filter((s) => s.score > 0);
  return (filtered.length ? filtered : boosted)
    .slice(0, topK)
    .map(({ chunk, score }) => buildRetrievedChunk(chunk, score));
}

// ── BM25 semantic retrieval ───────────────────────────────────────────────────

function retrieveBM25(
  query: string,
  chunks: CorpusChunk[],
  index: BM25Index,
  topK: number,
  minScore: number,
  boostRegion?: string,
): RetrievedChunk[] {
  const queryTokens = expandWithSynonyms(tokenize(query));
  if (queryTokens.length === 0) return chunks.slice(0, topK).map((c) => buildRetrievedChunk(c, 0));

  const scored = index.documents.map((doc, i) => ({
    chunk: chunks[i],
    score: bm25Score(queryTokens, doc, index),
  }));

  const boosted = applyBoosts(scored, boostRegion);
  boosted.sort((a, b) => b.score - a.score);

  const maxScore = boosted[0]?.score ?? 1;
  const normalized = boosted.map(({ chunk, score }) => ({
    chunk,
    score: maxScore > 0 ? score / maxScore : 0,
  }));

  const filtered = normalized.filter((s) => s.score >= minScore);
  const results = (filtered.length > 0 ? filtered : normalized).slice(0, topK);
  return results.map(({ chunk, score }) => buildRetrievedChunk(chunk, score));
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function retrieveChunks(
  query: string,
  options?: RetrievalOptions,
): Promise<RetrievedChunk[]>;
export function retrieveChunks(
  query: string,
  chunks: CorpusChunk[],
  options?: RetrievalOptions,
): RetrievedChunk[];
export function retrieveChunks(
  query: string,
  chunksOrOptions?: CorpusChunk[] | RetrievalOptions,
  maybeOptions?: RetrievalOptions,
): RetrievedChunk[] | Promise<RetrievedChunk[]> {
  if (Array.isArray(chunksOrOptions)) {
    const opts = maybeOptions ?? {};
    const topK = opts.topK ?? 6;
    const minScore = opts.minRelevanceScore ?? 0.05;
    const mode = opts.searchMode ?? "semantic";
    const idx = buildBM25Index(
      chunksOrOptions.map((c) => ({ id: c.id, text: `${c.meta.title ?? ""} ${c.text}` }))
    );
    if (mode === "fast") return retrieveFast(query, chunksOrOptions, topK, opts.boostRegion);
    return retrieveBM25(query, chunksOrOptions, idx, topK, minScore, opts.boostRegion);
  }

  // Async path — use global index
  const rawOpts = chunksOrOptions as RetrievalOptions | number | undefined;
  const opts: RetrievalOptions = typeof rawOpts === "number" ? { topK: rawOpts } : (rawOpts ?? {});
  const topK = opts.topK ?? 6;
  const minScore = opts.minRelevanceScore ?? 0.05;
  const mode = opts.searchMode ?? "semantic";

  if (mode === "fast") {
    return loadCorpus().then((chunks) => retrieveFast(query, chunks, topK, opts.boostRegion));
  }

  return getOrBuildIndex().then(({ index, chunks }) =>
    retrieveBM25(query, chunks, index, topK, minScore, opts.boostRegion)
  );
}
