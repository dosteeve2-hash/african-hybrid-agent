import { NextResponse } from "next/server";

import { loadCorpus } from "@/lib/rag/corpus";

export async function GET() {
  const corpus = await loadCorpus();
  return NextResponse.json({
    ok: true,
    corpusChunks: corpus.length,
    hasLlmKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
  });
}
