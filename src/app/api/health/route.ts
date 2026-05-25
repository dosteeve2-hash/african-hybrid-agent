import { NextResponse } from "next/server";

import { loadCorpus } from "@/lib/rag/corpus";
import { scoreFromMeta } from "@/lib/sources/credibility";

export async function GET() {
  const corpus = await loadCorpus();
  const sourceFiles = new Set(corpus.map((chunk) => chunk.sourceFile));
  const avgCredibility =
    corpus.length > 0
      ? corpus.reduce((sum, chunk) => sum + scoreFromMeta(chunk.meta), 0) /
        corpus.length
      : 0;

  return NextResponse.json({
    ok: true,
    corpusChunks: corpus.length,
    sourceFiles: sourceFiles.size,
    avgCredibility: Number(avgCredibility.toFixed(1)),
    hasLlmKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
  });
}
