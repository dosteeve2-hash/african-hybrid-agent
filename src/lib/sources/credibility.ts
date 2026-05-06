import type { CorpusMeta } from "@/lib/rag/corpus";

export function scoreFromMeta(meta: CorpusMeta): number {
  const tier = meta.credibilityTier ?? "medium";
  switch (tier) {
    case "official":
      return 95;
    case "high":
      return 85;
    case "medium":
      return 65;
    case "low":
      return 40;
    default:
      return 55;
  }
}
