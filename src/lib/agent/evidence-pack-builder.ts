import { loadCorpus } from "@/lib/rag/corpus";
import { retrieveChunks } from "@/lib/rag/retrieve";
import { scoreFromMeta } from "@/lib/sources/credibility";
import type { EvidenceItem, EvidencePack, EvidenceTag } from "@/lib/types/evidence";

function inferTags(text: string, sourceFile: string): EvidenceTag[] {
  const t = `${text} ${sourceFile}`.toLowerCase();
  const tags: EvidenceTag[] = [];
  if (t.includes("burkina") || t.includes("bf")) tags.push("burkina");
  if (
    t.includes("entrepreneur") ||
    t.includes("formalit") ||
    t.includes("micro") ||
    t.includes("activit")
  ) {
    tags.push("entrepreneuriat");
  }
  if (t.includes("legal") || t.includes("loi") || t.includes("jurid")) tags.push("legal");
  if (t.includes("secteur") || t.includes("agric")) tags.push("sector");
  if (t.includes("culture") || t.includes("biais") || t.includes("stéréotype")) tags.push("culture");
  if (tags.length === 0) tags.push("general");
  return [...new Set(tags)];
}

export async function buildEvidencePack(query: string): Promise<EvidencePack> {
  const generatedAt = new Date().toISOString();
  const corpus = await loadCorpus();
  const retrieved = retrieveChunks(query, corpus, 8);

  const reasons: string[] = [];
  if (corpus.length === 0) {
    reasons.push("Corpus vide : ajouter des fichiers dans data/corpus.");
  }
  if (retrieved.length === 0 && corpus.length > 0) {
    reasons.push("Faible recouvrement lexical avec la requête ; résultats potentiellement peu pertinents.");
  }

  const items: EvidenceItem[] = retrieved.map((c, idx) => ({
    id: `ev-${c.id}-${idx}`,
    label: c.meta.title ?? c.sourceFile,
    excerpt: c.text.slice(0, 600) + (c.text.length > 600 ? "…" : ""),
    reliabilityScore: scoreFromMeta(c.meta),
    tags: inferTags(c.text, c.sourceFile),
    retrievedAt: generatedAt,
    sourceRef: c.sourceFile,
    sourceKind: "corpus_markdown",
    corpusChunkId: c.id,
  }));

  const avgRel =
    items.length > 0
      ? items.reduce((s, i) => s + i.reliabilityScore, 0) / items.length / 100
      : 0;

  let confidence = Math.min(1, avgRel * (items.length > 0 ? 1 : 0));
  if (items.length === 0) confidence = 0;
  if (reasons.length > 0 && items.length > 0) confidence *= 0.85;

  return {
    schemaVersion: "1.0",
    generatedAt,
    querySummary: query.slice(0, 500),
    items,
    uncertainty: {
      confidence,
      reasons,
    },
  };
}
