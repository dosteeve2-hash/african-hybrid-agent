import { loadCorpus } from "@/lib/rag/corpus";
import { retrieveChunks, type RetrievalOptions } from "@/lib/rag/retrieve";
import { scoreFromMeta } from "@/lib/sources/credibility";
import {
  analyzeProfile,
  extractRegionBoost,
  type RecommendationProfilePayload,
} from "@/lib/agent/query-from-profile";
import { auditLogger } from "@/lib/governance/audit";
import type { EvidenceItem, EvidencePack, EvidenceTag } from "@/lib/types/evidence";

function inferTags(text: string, sourceFile: string, region?: string): EvidenceTag[] {
  const t = `${text} ${sourceFile} ${region}`.toLowerCase();
  const tags: EvidenceTag[] = [];

  // Localisation
  if (t.includes("burkina") || t.includes("bf") || t.includes("ouaga")) tags.push("burkina");
  if (
    t.includes("entrepreneur") ||
    t.includes("formalit") ||
    t.includes("micro") ||
    t.includes("activit") ||
    t.includes("business") ||
    t.includes("startup")
  ) {
    tags.push("entrepreneuriat");
  }
  if (t.includes("legal") || t.includes("loi") || t.includes("jurid") || t.includes("droit"))
    tags.push("legal");
  if (
    t.includes("secteur") ||
    t.includes("agric") ||
    t.includes("santé") ||
    t.includes("education") ||
    t.includes("tourisme")
  )
    tags.push("sector");
  if (
    t.includes("culture") ||
    t.includes("biais") ||
    t.includes("stéréotype") ||
    t.includes("langue") ||
    t.includes("tradition")
  )
    tags.push("culture");
  if (t.includes("femme") || t.includes("genre") || t.includes("jeune") || t.includes("youth"))
    tags.push("general");

  if (tags.length === 0) tags.push("general");
  return [...new Set(tags)];
}

export interface BuildEvidenceOptions {
  maxItems?: number;
  minReliability?: number;
  searchMode?: "fast" | "semantic";
  boostRegion?: string;
}

export async function buildEvidencePack(
  queryOrProfile: string | RecommendationProfilePayload,
  options?: BuildEvidenceOptions,
): Promise<EvidencePack> {
  const startTime = performance.now();
  const generatedAt = new Date().toISOString();
  const corpus = await loadCorpus();

  let query: string;
  let boostRegion: string | undefined;

  // Traiter profil P2P ou requête texte libre
  if (typeof queryOrProfile === "string") {
    query = queryOrProfile;
  } else {
    const profile = queryOrProfile;
    const context = analyzeProfile(profile);
    query = context.raw;
    boostRegion = extractRegionBoost(profile);
  }

  const maxItems = options?.maxItems ?? 10;
  const minReliability = options?.minReliability ?? 0;
  const searchMode = options?.searchMode ?? "semantic";
  const boostRegionOpt = options?.boostRegion ?? boostRegion;

  const retrievalOpts: RetrievalOptions = {
    topK: maxItems,
    minRelevanceScore: searchMode === "fast" ? 0 : 0.1,
    searchMode,
    boostRegion: boostRegionOpt,
  };

  const retrieved = retrieveChunks(query, corpus, retrievalOpts);
  const reasons: string[] = [];

  if (corpus.length === 0) {
    reasons.push("Corpus vide : ajouter des fichiers dans data/corpus.");
  }
  if (retrieved.length === 0 && corpus.length > 0) {
    reasons.push(
      "Faible recouvrement avec la requête ; vérifier orthographe ou ajouter sources.",
    );
  }
  if (retrieved.length < 3) {
    reasons.push(`Peu d'extraits trouvés (${retrieved.length}) - résultats potentiellement incomplets.`);
  }

  const items: EvidenceItem[] = retrieved
    .filter((c) => scoreFromMeta(c.meta) >= minReliability)
    .slice(0, maxItems)
    .map((c, idx) => ({
      id: `ev-${c.id}-${idx}`,
      label: c.meta.title ?? c.sourceFile,
      excerpt: c.text.slice(0, 600) + (c.text.length > 600 ? "…" : ""),
      reliabilityScore: scoreFromMeta(c.meta),
      tags: inferTags(c.text, c.sourceFile, c.meta.region),
      retrievedAt: generatedAt,
      sourceRef: c.sourceFile,
      sourceKind: "corpus_markdown",
      corpusChunkId: c.id,
    }));

  const avgRel =
    items.length > 0
      ? items.reduce((s, i) => s + i.reliabilityScore, 0) / items.length / 100
      : 0;

  let confidence = Math.min(1, avgRel * (items.length > 0 ? Math.min(1, items.length / 5) : 0));
  if (items.length === 0) confidence = 0;
  if (reasons.length > 0 && items.length > 0) confidence *= 0.85;

  const executionTimeMs = Math.round(performance.now() - startTime);

  // Audit
  auditLogger.trace("evidence", "pack_built", {
    query: query.slice(0, 100),
    itemsRetrieved: items.length,
    confidence,
    executionTimeMs,
    boostRegion: boostRegionOpt,
  });

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
