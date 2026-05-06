"use client";

import { useState } from "react";

import type { ChatResponseBody } from "@/lib/types/chat";

export default function Home() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"general" | "research">("general");
  const [loading, setLoading] = useState(false);
  const [last, setLast] = useState<ChatResponseBody | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const content = input.trim();
    if (!content || loading) return;
    setLoading(true);
    setError(null);
    setLast(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content }],
          mode,
        }),
      });
      const data = (await res.json()) as ChatResponseBody & { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Erreur ${res.status}`);
        return;
      }
      setLast(data);
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header className="space-y-2 border-b border-stone-800 pb-6">
        <p className="text-sm uppercase tracking-wide text-orange-500">
          Prototype — projet distinct de Problem to Project Africa
        </p>
        <h1 className="text-2xl font-semibold text-stone-100">
          Agent hybride africain (API + RAG local)
        </h1>
        <p className="text-stone-400">
          Corpus versionné dans{" "}
          <code className="rounded bg-stone-900 px-1.5 py-0.5 text-stone-200">
            data/corpus
          </code>
          . Configure{" "}
          <code className="rounded bg-stone-900 px-1.5 py-0.5 text-stone-200">
            OPENAI_API_KEY
          </code>{" "}
          ou Ollama pour les réponses dialoguées.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <label className="text-sm text-stone-400">Mode</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode("general")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === "general"
                ? "bg-orange-600 text-white"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            }`}
          >
            Général
          </button>
          <button
            type="button"
            onClick={() => setMode("research")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === "research"
                ? "bg-orange-600 text-white"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            }`}
          >
            Recherche / dissertation
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="Pose une question (ex. cadre légal micro-entreprise au Burkina, histoire, cuisine ou scolarité)…"
          className="w-full resize-y rounded-xl border border-stone-700 bg-stone-900/80 p-4 text-stone-100 placeholder:text-stone-600 focus:border-orange-600 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={loading || !input.trim()}
          className="self-start rounded-lg bg-orange-600 px-5 py-2.5 font-medium text-white disabled:opacity-40"
        >
          {loading ? "Envoi…" : "Envoyer"}
        </button>
      </section>

      {error ? (
        <p className="rounded-lg border border-red-900/80 bg-red-950/40 p-4 text-red-200">
          {error}
        </p>
      ) : null}

      {last ? (
        <section className="space-y-4 rounded-xl border border-stone-800 bg-stone-900/50 p-5">
          <div className="flex flex-wrap gap-3 text-xs text-stone-500">
            <span>
              Fournisseur :{" "}
              <strong className="text-stone-300">{last.providerUsed}</strong>
            </span>
            <span>
              Mode : <strong className="text-stone-300">{last.mode}</strong>
            </span>
          </div>

          {last.warnings.length > 0 ? (
            <ul className="list-inside list-disc text-sm text-amber-200/90">
              {last.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}

          <article className="whitespace-pre-wrap text-stone-200 leading-relaxed">
            {last.reply}
          </article>

          {last.citations.length > 0 ? (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-stone-400">
                Extraits du corpus (RAG)
              </h2>
              <ul className="space-y-3 text-sm">
                {last.citations.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-stone-800 bg-stone-950/60 p-3"
                  >
                    <div className="mb-1 flex flex-wrap gap-2 text-xs text-stone-500">
                      <span className="font-mono text-orange-400">{c.id}</span>
                      <span>{c.sourceFile}</span>
                      <span>Fiabilité {c.credibilityScore}/100</span>
                      {c.region ? <span>{c.region}</span> : null}
                    </div>
                    <p className="text-stone-300">{c.excerpt}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
