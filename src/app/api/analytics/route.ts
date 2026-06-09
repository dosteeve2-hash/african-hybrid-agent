import { NextResponse } from "next/server";
import { auditLogger } from "@/lib/governance/audit";
import { loadCorpus } from "@/lib/rag/corpus";

export const dynamic = "force-dynamic";

export async function GET() {
  const logs = auditLogger.getLogs();
  const retrievalLogs = logs.filter((l) => l.component === "retrieval");
  const responseLogs = logs.filter((l) => l.component === "agent");

  // ── Request volume ──────────────────────────────────────────────────────────
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  const totalRequests = retrievalLogs.length;
  const requestsLastHour = retrievalLogs.filter(
    (l) => now - new Date(l.timestamp).getTime() < oneHour,
  ).length;
  const requestsLast24h = retrievalLogs.filter(
    (l) => now - new Date(l.timestamp).getTime() < oneDay,
  ).length;

  // ── Response time ───────────────────────────────────────────────────────────
  const responseTimes = responseLogs
    .map((l) => (l.data as Record<string, unknown>).executionTimeMs as number)
    .filter((v) => typeof v === "number" && !isNaN(v));

  const avgLatencyMs =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;
  const p95LatencyMs =
    responseTimes.length > 0
      ? Math.round(responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)] ?? 0)
      : 0;

  // ── Provider breakdown ──────────────────────────────────────────────────────
  const providerCounts: Record<string, number> = {};
  for (const log of responseLogs) {
    const p = String((log.data as Record<string, unknown>).providerUsed ?? "unknown");
    providerCounts[p] = (providerCounts[p] ?? 0) + 1;
  }

  // ── Top queries ─────────────────────────────────────────────────────────────
  const queryCounts: Record<string, number> = {};
  for (const log of retrievalLogs) {
    const q = String((log.data as Record<string, unknown>).queryText ?? "").slice(0, 80);
    if (q) queryCounts[q] = (queryCounts[q] ?? 0) + 1;
  }
  const topQueries = Object.entries(queryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  // ── Confidence distribution ─────────────────────────────────────────────────
  const confidenceValues = responseLogs
    .map((l) => Number((l.data as Record<string, unknown>).confidence))
    .filter((v) => !isNaN(v));

  const confidenceBuckets = {
    "0-25%": confidenceValues.filter((v) => v < 0.25).length,
    "25-50%": confidenceValues.filter((v) => v >= 0.25 && v < 0.5).length,
    "50-75%": confidenceValues.filter((v) => v >= 0.5 && v < 0.75).length,
    "75-100%": confidenceValues.filter((v) => v >= 0.75).length,
  };

  // ── Corpus stats ────────────────────────────────────────────────────────────
  const corpus = await loadCorpus();
  const bySource = new Map<string, { title: string; region: string; tier: string; chunks: number }>();
  for (const chunk of corpus) {
    const src = bySource.get(chunk.sourceFile);
    if (src) { src.chunks++; continue; }
    bySource.set(chunk.sourceFile, {
      title: chunk.meta.title ?? chunk.sourceFile,
      region: chunk.meta.region ?? "N/A",
      tier: chunk.meta.credibilityTier ?? "medium",
      chunks: 1,
    });
  }
  const corpusByTier: Record<string, number> = {};
  for (const src of bySource.values()) {
    corpusByTier[src.tier] = (corpusByTier[src.tier] ?? 0) + 1;
  }

  // ── Search mode breakdown ────────────────────────────────────────────────────
  const modeCounts: Record<string, number> = {};
  for (const log of retrievalLogs) {
    const m = String((log.data as Record<string, unknown>).mode ?? "semantic");
    modeCounts[m] = (modeCounts[m] ?? 0) + 1;
  }

  // ── Region activity ──────────────────────────────────────────────────────────
  const regionCounts: Record<string, number> = {};
  for (const log of retrievalLogs) {
    const r = String((log.data as Record<string, unknown>).boostRegion ?? "");
    if (r) regionCounts[r] = (regionCounts[r] ?? 0) + 1;
  }

  // ── Hourly volume (last 24h) ─────────────────────────────────────────────────
  const hourlyBuckets: number[] = new Array(24).fill(0);
  for (const log of retrievalLogs) {
    const age = now - new Date(log.timestamp).getTime();
    if (age < oneDay) {
      const bucket = Math.floor(age / oneHour);
      hourlyBuckets[bucket]++;
    }
  }
  const hourlyVolume = hourlyBuckets.reverse().map((count, i) => ({
    label: `${23 - i}h`,
    count,
  }));

  return NextResponse.json({
    requests: {
      total: totalRequests,
      lastHour: requestsLastHour,
      last24h: requestsLast24h,
    },
    latency: {
      avgMs: avgLatencyMs,
      p95Ms: p95LatencyMs,
    },
    providers: providerCounts,
    searchModes: modeCounts,
    confidence: confidenceBuckets,
    topQueries,
    regionActivity: regionCounts,
    hourlyVolume,
    corpus: {
      totalSources: bySource.size,
      totalChunks: corpus.length,
      byTier: corpusByTier,
      sources: [...bySource.entries()].map(([file, data]) => ({ file, ...data })),
    },
  });
}
