import { NextResponse } from "next/server";

import { loadCorpus } from "@/lib/rag/corpus";
import { labelFromScore, scoreFromMeta } from "@/lib/sources/credibility";

export async function GET() {
  const corpus = await loadCorpus();
  const byFile = new Map<
    string,
    {
      sourceFile: string;
      title: string;
      sourceType: string;
      region: string;
      credibilityScore: number;
      credibilityLabel: string;
      chunks: number;
      excerpt: string;
    }
  >();

  for (const chunk of corpus) {
    const score = scoreFromMeta(chunk.meta);
    const current = byFile.get(chunk.sourceFile);
    if (current) {
      current.chunks += 1;
      continue;
    }

    byFile.set(chunk.sourceFile, {
      sourceFile: chunk.sourceFile,
      title: chunk.meta.title ?? chunk.sourceFile,
      sourceType: chunk.meta.sourceType ?? "unspecified",
      region: chunk.meta.region ?? "unspecified",
      credibilityScore: score,
      credibilityLabel: labelFromScore(score),
      chunks: 1,
      excerpt: chunk.text.slice(0, 220) + (chunk.text.length > 220 ? "..." : ""),
    });
  }

  const sources = [...byFile.values()].sort(
    (a, b) => b.credibilityScore - a.credibilityScore,
  );

  return NextResponse.json({
    schemaVersion: "1.0",
    totalChunks: corpus.length,
    totalSources: sources.length,
    sources,
  });
}
