"use client";

import { useCallback, useState } from "react";

type ApiMode = "chat" | "evidence" | "audit" | "corpus";

export default function ApiTestPage() {
  const [mode, setMode] = useState<ApiMode>("chat");
  const [query, setQuery] = useState("Comment faire entrepreneuriat au Burkina?");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // P2P Profile
  const [p2pMode, setP2pMode] = useState(false);
  const [profile, setProfile] = useState({
    country: "Burkina Faso",
    preferredSector: "agriculture",
    observedProblem: "jeunes avec compétences mais pas de sources fiables pour cadrer projet",
    skills: ["vente", "organisation"],
    constraints: "budget faible",
  });

  const handleTest = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let body: unknown;
      let endpoint = "";

      if (mode === "chat") {
        endpoint = "/api/chat";
        body = {
          messages: [{ role: "user", content: query }],
          mode: "general",
          searchMode: "semantic",
          maxCitations: 5,
        };
      } else if (mode === "evidence") {
        endpoint = "/api/evidence";
        body = p2pMode ? { recommendationProfile: profile } : { query };
      } else if (mode === "corpus") {
        endpoint = "/api/corpus";
      } else if (mode === "audit") {
        endpoint = "/api/audit?lastN=10&level=info";
      }

      const response = await fetch(endpoint, {
        method: endpoint === "/api/corpus" || endpoint === "/api/audit" ? "GET" : "POST",
        headers: { "Content-Type": "application/json" },
        body: (endpoint === "/api/corpus" || endpoint === "/api/audit") ? undefined : JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [mode, query, p2pMode, profile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">🧪 Agent Hybride Africain - API Test</h1>
        <p className="text-slate-300 mb-8">
          Testez toutes les fonctionnalités de l'agent en temps réel
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">Mode</h2>
              <div className="space-y-2">
                {(["chat", "evidence", "corpus", "audit"] as ApiMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setResult(null);
                    }}
                    className={`w-full px-4 py-2 rounded text-left transition ${
                      mode === m
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                    }`}
                  >
                    {m === "chat" && "💬 Chat"}
                    {m === "evidence" && "📋 Evidence Pack"}
                    {m === "corpus" && "📚 Corpus Audit"}
                    {m === "audit" && "🔍 Audit Logs"}
                  </button>
                ))}
              </div>
            </div>

            {(mode === "chat" || mode === "evidence") && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-semibold mb-4">Entrée</h2>

                {mode === "evidence" && (
                  <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p2pMode}
                        onChange={(e) => setP2pMode(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Utiliser profil P2P</span>
                    </label>
                  </div>
                )}

                {p2pMode ? (
                  <div className="space-y-3 text-sm">
                    <input
                      type="text"
                      placeholder="Pays"
                      value={profile.country}
                      onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Secteur"
                      value={profile.preferredSector}
                      onChange={(e) =>
                        setProfile({ ...profile, preferredSector: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 text-white"
                    />
                    <textarea
                      placeholder="Problème observé"
                      value={profile.observedProblem}
                      onChange={(e) =>
                        setProfile({ ...profile, observedProblem: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 text-white h-20 resize-none"
                    />
                  </div>
                ) : (
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Entrez votre requête..."
                    className="w-full h-24 px-3 py-2 bg-slate-700 rounded border border-slate-600 text-white resize-none"
                  />
                )}

                <button
                  onClick={handleTest}
                  disabled={loading}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 rounded font-semibold hover:bg-blue-500 disabled:opacity-50 transition"
                >
                  {loading ? "⏳ Traitement..." : "🚀 Tester"}
                </button>
              </div>
            )}

            {mode === "corpus" && (
              <button
                onClick={handleTest}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 rounded font-semibold hover:bg-blue-500 disabled:opacity-50 transition"
              >
                {loading ? "⏳ Audit..." : "🚀 Auditer corpus"}
              </button>
            )}

            {mode === "audit" && (
              <button
                onClick={handleTest}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 rounded font-semibold hover:bg-blue-500 disabled:opacity-50 transition"
              >
                {loading ? "⏳ Chargement..." : "🚀 Récupérer logs"}
              </button>
            )}
          </div>

          {/* Right panel: Results */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 max-h-[600px] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Résultat</h2>

              {error && (
                <div className="bg-red-900/30 border border-red-600 rounded p-4 text-red-200 font-mono text-sm">
                  {error}
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {mode === "chat" && result && typeof result === "object" && "reply" in result && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Réponse</h3>
                        <p className="text-slate-100 whitespace-pre-wrap">
                          {(result as any).reply}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Confiance: {((result as any).confidence * 100).toFixed(0)}%</h3>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Citations ({(result as any).citations?.length})</h3>
                        <div className="space-y-2">
                          {(result as any).citations?.map((c: any, i: number) => (
                            <div key={i} className="bg-slate-700 p-2 rounded text-xs">
                              <strong>{c.title}</strong> ({c.sourceType})
                              <p className="text-slate-400 mt-1">{c.excerpt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {mode === "evidence" && result && (
                    <>
                      <div>
                        <h3 className="font-semibold">Confiance: {((result as any).uncertainty?.confidence * 100).toFixed(0)}%</h3>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Items ({(result as any).items?.length})</h3>
                        <div className="space-y-2">
                          {(result as any).items?.map((item: any, i: number) => (
                            <div key={i} className="bg-slate-700 p-2 rounded text-xs">
                              <strong>{item.label}</strong> (Score: {item.reliabilityScore})
                              <p className="text-slate-400 mt-1">{item.excerpt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {mode === "corpus" && result && (
                    <div>
                      <p className="text-sm">
                        Total: {(result as any).totalSources} sources, {(result as any).totalChunks} chunks
                      </p>
                      <div className="mt-4 space-y-2 text-xs">
                        {(result as any).sources?.map((s: any, i: number) => (
                          <div key={i} className="bg-slate-700 p-2 rounded">
                            <strong>{s.title}</strong> ({s.region}) - {s.chunks} chunks
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mode === "audit" && result && (
                    <div>
                      <p className="text-sm mb-4">Logs: {(result as any).totalLogs}</p>
                      <pre className="bg-black/50 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify((result as any).logs, null, 2).slice(0, 2000)}
                      </pre>
                    </div>
                  )}

                  <div className="mt-4 border-t border-slate-600 pt-4">
                    <button
                      onClick={() => {
                        const element = document.createElement("a");
                        element.setAttribute(
                          "href",
                          "data:text/plain;charset=utf-8," +
                            encodeURIComponent(JSON.stringify(result, null, 2)),
                        );
                        element.setAttribute("download", `result-${Date.now()}.json`);
                        element.style.display = "none";
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      className="text-xs px-3 py-1 bg-slate-600 rounded hover:bg-slate-500"
                    >
                      ⬇️ Télécharger JSON
                    </button>
                  </div>
                </div>
              )}

              {!result && !error && (
                <p className="text-slate-400">Les résultats s'afficheront ici...</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>Agent Hybride Africain v0.2 • Corpus augmenté • RAG sémantique • Audit logs</p>
        </div>
      </div>
    </div>
  );
}
