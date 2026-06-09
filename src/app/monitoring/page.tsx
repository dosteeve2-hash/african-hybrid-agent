"use client";

import { useCallback, useEffect, useState } from "react";

type AnalyticsData = {
  requests: { total: number; lastHour: number; last24h: number };
  latency: { avgMs: number; p95Ms: number };
  providers: Record<string, number>;
  searchModes: Record<string, number>;
  confidence: Record<string, number>;
  topQueries: Array<{ query: string; count: number }>;
  regionActivity: Record<string, number>;
  hourlyVolume: Array<{ label: string; count: number }>;
  corpus: {
    totalSources: number;
    totalChunks: number;
    byTier: Record<string, number>;
    sources: Array<{ file: string; title: string; region: string; tier: string; chunks: number }>;
  };
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "green" | "blue" | "amber" | "red";
}) {
  const colors = {
    green: "text-emerald-400",
    blue: "text-sky-400",
    amber: "text-amber-400",
    red: "text-red-400",
  };
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colors[accent ?? "green"]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

// ── Mini bar chart ─────────────────────────────────────────────────────────────

function BarChart({ data, label }: { data: Record<string, number>; label: string }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  const colors = [
    "bg-emerald-500",
    "bg-sky-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
  ];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="mb-3 text-sm font-medium text-zinc-300">{label}</p>
      {entries.length === 0 ? (
        <p className="text-xs text-zinc-600">Aucune donnée</p>
      ) : (
        <div className="space-y-2">
          {entries.map(([key, value], i) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span className="w-24 shrink-0 truncate text-zinc-400">{key}</span>
              <div className="flex-1 h-4 rounded bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded transition-all ${colors[i % colors.length]}`}
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-zinc-400">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Hourly volume sparkline ────────────────────────────────────────────────────

function HourlyChart({ data }: { data: Array<{ label: string; count: number }> }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const last12 = data.slice(-12);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="mb-3 text-sm font-medium text-zinc-300">Volume requêtes (24h)</p>
      <div className="flex items-end gap-0.5 h-16">
        {last12.map(({ label, count }) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-sm bg-emerald-600/70 hover:bg-emerald-500 transition-all"
              style={{ height: `${Math.max((count / max) * 100, count > 0 ? 8 : 2)}%` }}
              title={`${label}: ${count}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
        <span>{last12[0]?.label}</span>
        <span>maintenant</span>
      </div>
    </div>
  );
}

// ── Tier badge ────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const cfg: Record<string, string> = {
    official: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
    high: "bg-sky-900/50 text-sky-300 border-sky-700",
    medium: "bg-amber-900/50 text-amber-300 border-amber-700",
    low: "bg-red-900/50 text-red-300 border-red-700",
  };
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${cfg[tier] ?? cfg.medium}`}>
      {tier}
    </span>
  );
}

// ── System health status ──────────────────────────────────────────────────────

function HealthCheck() {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: "error" }));
  }, []);

  const isUp = (health as Record<string, unknown>)?.status === "ok";

  return (
    <div className={`rounded-xl border p-4 ${isUp ? "border-emerald-800 bg-emerald-950/20" : "border-red-800 bg-red-950/20"}`}>
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isUp ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
        <p className={`text-sm font-medium ${isUp ? "text-emerald-300" : "text-red-300"}`}>
          {health === null ? "Vérification..." : isUp ? "Système opérationnel" : "Problème détecté"}
        </p>
      </div>
      {health && (
        <p className="mt-1 text-xs text-zinc-500">
          DB: {String((health as Record<string, Record<string,unknown>>).database?.connected ?? "N/A")} ·
          Cache: {String((health as Record<string, Record<string,unknown>>).cache?.connected ?? "N/A")}
        </p>
      )}
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setLastRefresh(new Date());
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    const timer = setInterval(fetchData, 30_000);
    return () => clearInterval(timer);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-sm text-zinc-400">Métriques temps réel — Agent Aisha</p>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <p className="text-xs text-zinc-600">
                Actualisé {lastRefresh.toLocaleTimeString("fr-FR")}
              </p>
            )}
            <button
              onClick={() => void fetchData()}
              disabled={loading}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading ? "Actualisation…" : "↻ Actualiser"}
            </button>
          </div>
        </div>

        {/* System health */}
        <HealthCheck />

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total requêtes"
            value={data?.requests.total ?? 0}
            sub="depuis démarrage"
            accent="green"
          />
          <StatCard
            label="Dernière heure"
            value={data?.requests.lastHour ?? 0}
            sub={`${data?.requests.last24h ?? 0} dernières 24h`}
            accent="blue"
          />
          <StatCard
            label="Latence moy."
            value={data ? `${data.latency.avgMs}ms` : "—"}
            sub={`p95: ${data?.latency.p95Ms ?? 0}ms`}
            accent="amber"
          />
          <StatCard
            label="Sources corpus"
            value={data?.corpus.totalSources ?? 0}
            sub={`${data?.corpus.totalChunks ?? 0} chunks BM25`}
            accent="green"
          />
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          {data && <HourlyChart data={data.hourlyVolume} />}
          {data && <BarChart data={data.providers} label="LLM Provider" />}
          {data && <BarChart data={data.searchModes} label="Mode de recherche" />}
        </div>

        {/* Second row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {data && <BarChart data={data.confidence} label="Distribution de confiance" />}
          {data && Object.keys(data.regionActivity).length > 0 && (
            <BarChart data={data.regionActivity} label="Activité par région" />
          )}
        </div>

        {/* Top queries */}
        {data && data.topQueries.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="mb-3 text-sm font-medium text-zinc-300">Top requêtes</p>
            <div className="space-y-2">
              {data.topQueries.map(({ query, count }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-5 shrink-0 text-center text-xs text-zinc-600">{i + 1}</span>
                  <p className="flex-1 truncate text-zinc-300">{query}</p>
                  <span className="shrink-0 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{count}×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Corpus table */}
        {data && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-300">Sources corpus</p>
              <div className="flex gap-2 text-xs">
                {Object.entries(data.corpus.byTier).map(([tier, count]) => (
                  <span key={tier} className="text-zinc-500">{count} {tier}</span>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-500">
                    <th className="pb-2 font-medium">Titre</th>
                    <th className="pb-2 font-medium">Région</th>
                    <th className="pb-2 font-medium">Crédibilité</th>
                    <th className="pb-2 text-right font-medium">Chunks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.corpus.sources.map((src) => (
                    <tr key={src.file} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-2 pr-4 text-zinc-300 max-w-xs truncate">{src.title}</td>
                      <td className="py-2 pr-4 text-zinc-500">{src.region}</td>
                      <td className="py-2 pr-4"><TierBadge tier={src.tier} /></td>
                      <td className="py-2 text-right text-zinc-400">{src.chunks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!data && !loading && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
            Impossible de charger les analytics.
          </div>
        )}
      </div>
    </div>
  );
}
