import type { CorpusChunk } from "@/lib/rag/corpus";

function formatContextBlock(chunks: CorpusChunk[]): string {
  return chunks
    .map((c) => `[${c.id}] (fichier: ${c.sourceFile})\n${c.text}`)
    .join("\n\n---\n\n");
}

export async function generateOpenAICompatible(params: {
  system: string;
  userMessages: { role: "user" | "assistant"; content: string }[];
  corpusChunks: CorpusChunk[];
}): Promise<{ text: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const base =
    process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  if (!apiKey) {
    return null;
  }

  const context =
    params.corpusChunks.length > 0
      ? `\n\nCONTEXTE (corpus local - a privilegier pour les faits):\n${formatContextBlock(params.corpusChunks)}`
      : "";

  const messages = [
    { role: "system" as const, content: params.system + context },
    ...params.userMessages,
  ];

  const url = `${base.replace(/\/$/, "")}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.35,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`LLM HTTP ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Reponse LLM vide.");
  }
  return { text };
}

export function synthesizeWithoutLLM(
  query: string,
  chunks: CorpusChunk[],
): string {
  if (chunks.length === 0) {
    return `Je n'ai trouve aucun extrait pertinent dans le corpus local pour : "${query}".\n\nAjoute des fichiers .md dans data/corpus avec metadonnees (voir exemple), ou configure OPENAI_API_KEY / Ollama pour elargir la reponse.`;
  }

  const header =
    "Reponse prototype sans modele externe - uniquement des extraits du corpus versionne local. A lire comme matiere brute, pas comme article fini.\n\n";

  const body = chunks
    .map((c) => `### [${c.id}] - ${c.sourceFile}\n${c.text}`)
    .join("\n\n");

  return `${header}${body}`;
}
