import type { CorpusChunk } from "@/lib/rag/corpus";

const STOP = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "à", "au", "aux",
  "pour", "par", "sur", "dans", "est", "son", "sa", "ses", "ce", "cette", "ces",
  "qui", "que", "dont", "avec", "sans", "plus", "moins", "très", "comme", "une",
  "the", "and", "or", "of", "to", "a", "an", "in", "on", "for", "with",
]);

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-zA-ZÀ-ÿ0-9]+/u)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

export function retrieveChunks(query: string, chunks: CorpusChunk[], topK = 5): CorpusChunk[] {
  const tokens = new Set(tokenize(query));
  if (tokens.size === 0) return chunks.slice(0, topK);

  const scored = chunks.map((c) => {
    const hay = `${c.meta.title ?? ""} ${c.text}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (hay.includes(t)) score += 1;
    }
    return { c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const filtered = scored.filter((s) => s.score > 0);
  const pick = (filtered.length ? filtered : scored).slice(0, topK).map((s) => s.c);
  return pick;
}
