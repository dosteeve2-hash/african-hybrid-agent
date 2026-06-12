"use client";

import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import { BrandMotion } from "@/components/motion/brand-motion";
import type { ChatMessage, ChatMode, ChatResponseBody, Citation, StreamChunk } from "@/lib/types/chat";

// ── Types ─────────────────────────────────────────────────────────────────────

type UiMessage = {
  role: "user" | "assistant";
  content: string;
  meta?: Partial<ChatResponseBody>;
  streaming?: boolean;
};

type CorpusStats = {
  totalChunks: number;
  totalSources: number;
};

// ── Starter prompts ────────────────────────────────────────────────────────────

const STARTERS = [
  "Quelles solutions agroécologiques marchent en zone sahélienne ?",
  "Comment les femmes accèdent au financement au Burkina Faso ?",
  "Quelles innovations numériques transforment l'agriculture en Afrique de l'Ouest ?",
  "Comment monter une coopérative agricole au Mali ?",
];

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  try {
    return marked(text, { breaks: true, gfm: true }) as string;
  } catch {
    return text;
  }
}

// ── Credibility badge ──────────────────────────────────────────────────────────

function CredBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? "bg-emerald-900/50 text-emerald-300 border-emerald-700"
      : score >= 75
        ? "bg-sky-900/50 text-sky-300 border-sky-700"
        : score >= 55
          ? "bg-amber-900/50 text-amber-300 border-amber-700"
          : "bg-red-900/50 text-red-300 border-red-700";
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${color}`}>
      {score}/100
    </span>
  );
}

// ── Citation card ─────────────────────────────────────────────────────────────

function CitationCard({ citation }: { citation: Citation }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-zinc-200 truncate">
            {citation.title ?? citation.sourceFile}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-zinc-500">
            {citation.region && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5">{citation.region}</span>
            )}
            {citation.sourceType && citation.sourceType !== "unspecified" && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5">{citation.sourceType}</span>
            )}
            <CredBadge score={citation.credibilityScore} />
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Voir extrait"
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>
      {expanded && (
        <p className="mt-2 leading-5 text-zinc-400 border-t border-zinc-800 pt-2">
          {citation.excerpt}
        </p>
      )}
    </div>
  );
}

// ── Message block ─────────────────────────────────────────────────────────────

function MessageBlock({ msg }: { msg: UiMessage }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isUser
            ? "bg-[var(--bg3)] border border-[var(--border2)] font-mono text-[var(--text2)]"
            : "bg-[var(--gold)] text-[var(--bg)] font-serif italic"
        }`}
      >
        {isUser ? "U" : "A"}
      </div>

      <div className={`flex-1 min-w-0 space-y-3 ${isUser ? "items-end flex flex-col" : ""}`}>
        {/* Bubble */}
        <div
          className={`rounded-xl px-4 py-3 max-w-prose ${
            isUser
              ? "bg-[var(--gold)]/10 border border-[var(--gold)]/25 text-[var(--text)] text-sm"
              : "bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text2)] text-sm"
          } ${msg.streaming ? "cursor-blink" : ""}`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          ) : (
            <div
              className="prose-african leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
          )}
        </div>

        {/* Citations */}
        {!isUser && msg.meta?.citations && msg.meta.citations.length > 0 && !msg.streaming && (
          <div className="w-full space-y-1.5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--text3)]">
              {msg.meta.citations.length} source{msg.meta.citations.length > 1 ? "s" : ""} récupérée{msg.meta.citations.length > 1 ? "s" : ""}
            </p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {msg.meta.citations.map((c) => (
                <CitationCard key={c.id} citation={c} />
              ))}
            </div>
          </div>
        )}

        {/* Metadata bar */}
        {!isUser && msg.meta && !msg.streaming && (
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-[var(--text3)]">
            {msg.meta.confidence !== undefined && (
              <span>
                Confiance:{" "}
                <span className={msg.meta.confidence >= 0.6 ? "text-[var(--green)]" : "text-amber-400"}>
                  {Math.round(msg.meta.confidence * 100)}%
                </span>
              </span>
            )}
            {msg.meta.providerUsed && (
              <span>
                via{" "}
                <span className="text-[var(--text2)]">{msg.meta.providerUsed}</span>
              </span>
            )}
            {msg.meta.perf?.totalMs && (
              <span>{msg.meta.perf.totalMs}ms</span>
            )}
          </div>
        )}

        {/* Warnings */}
        {!isUser && msg.meta?.warnings && msg.meta.warnings.length > 0 && !msg.streaming && (
          <div className="rounded-lg border border-amber-800/50 bg-amber-950/30 px-3 py-2 text-xs text-amber-300">
            {msg.meta.warnings.join(" ")}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Loading dots ──────────────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--gold)] flex items-center justify-center text-xs font-bold font-serif italic text-[var(--bg)]">
        A
      </div>
      <div className="rounded-xl border border-[var(--border2)] bg-[var(--bg3)] px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("general");
  const [loading, setLoading] = useState(false);
  const [streamMode, setStreamMode] = useState(true);
  const [boostRegion, setBoostRegion] = useState("");
  const [corpusStats, setCorpusStats] = useState<CorpusStats | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/corpus")
      .then((r) => r.json())
      .then((d) => setCorpusStats({ totalChunks: d.totalChunks, totalSources: d.totalSources }))
      .catch(() => null);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(promptOverride?: string) {
    const content = (promptOverride ?? input).trim();
    if (!content || loading) return;

    const history = [...messages, { role: "user" as const, content }];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      if (streamMode) {
        await sendStreaming(history);
      } else {
        await sendBlocking(history);
      }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function sendStreaming(history: UiMessage[]) {
    // Add placeholder assistant message
    const placeholderIndex = history.length;
    setMessages([...history, { role: "assistant", content: "", streaming: true }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: history.map(({ role, content }) => ({ role, content })),
        mode,
        stream: true,
        boostRegion: boostRegion || undefined,
      }),
    });

    if (!res.ok || !res.body) {
      setMessages((prev) => {
        const next = [...prev];
        next[placeholderIndex] = { role: "assistant", content: "Erreur lors du streaming.", streaming: false };
        return next;
      });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";
    let citations: Citation[] = [];
    let meta: Partial<ChatResponseBody> = {};
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const event = JSON.parse(line.slice(6)) as StreamChunk;
          if (event.type === "text") {
            accumulated += event.content;
            setMessages((prev) => {
              const next = [...prev];
              next[placeholderIndex] = {
                role: "assistant",
                content: accumulated,
                streaming: true,
                meta: { citations },
              };
              return next;
            });
          } else if (event.type === "citations") {
            citations = event.citations;
          } else if (event.type === "done") {
            meta = event.meta;
          }
        } catch { /* ignore parse errors */ }
      }
    }

    setMessages((prev) => {
      const next = [...prev];
      next[placeholderIndex] = {
        role: "assistant",
        content: accumulated,
        streaming: false,
        meta: { ...meta, citations },
      };
      return next;
    });
  }

  async function sendBlocking(history: UiMessage[]) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: history.map(({ role, content }) => ({ role, content })),
        mode,
        boostRegion: boostRegion || undefined,
      }),
    });
    const data = (await res.json()) as ChatResponseBody & { error?: string };
    if (!res.ok) {
      setMessages((prev) => [...prev, { role: "assistant", content: data.error ?? `Erreur ${res.status}` }]);
      return;
    }
    setMessages((prev) => [...prev, { role: "assistant", content: data.reply, meta: data }]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      <BrandMotion />
      {/* Hero bar — only on empty state */}
      {messages.length === 0 && (
        <div className="border-b border-[var(--border)] bg-[var(--bg2)]/60 px-5 py-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 data-hero="1" className="text-2xl font-bold text-[var(--text)] sm:text-3xl">
              Bienvenue sur{" "}
              <span className="font-serif italic text-[var(--gold)]">Aisha</span>
            </h1>
            <p data-hero="2" className="mt-2 text-sm text-[var(--text2)]">
              Agent IA spécialisé Afrique subsaharienne — sources locales vérifiées, anti-biais, RAG sémantique BM25.
            </p>
            {corpusStats && (
              <div className="mt-3 flex items-center justify-center gap-4 font-mono text-xs text-[var(--text3)]">
                <span>{corpusStats.totalSources} sources corpus</span>
                <span>·</span>
                <span>{corpusStats.totalChunks} fragments indexés</span>
                <span>·</span>
                <span className="text-[var(--gold)]">BM25 + Claude API</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div data-reveal-group className="grid gap-2 sm:grid-cols-2">
              {STARTERS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => void send(prompt)}
                  disabled={loading}
                  className="rounded-xl border border-[var(--border2)] bg-[var(--bg3)]/60 p-4 text-left text-sm text-[var(--text2)] hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/5 hover:text-[var(--text)] transition-all disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBlock key={i} msg={msg} />
          ))}

          {loading && !streamMode && <ThinkingDots />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--border)] bg-[var(--bg2)]/90 backdrop-blur px-5 py-4 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-3">
          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Mode toggle */}
            <div className="flex rounded-lg border border-[var(--border2)] p-0.5">
              {(["general", "research"] as ChatMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 rounded-md transition-colors font-mono text-[11px] uppercase tracking-wider ${
                    mode === m
                      ? "bg-[var(--gold)] text-[var(--bg)] font-bold"
                      : "text-[var(--text3)] hover:text-[var(--text2)]"
                  }`}
                >
                  {m === "general" ? "Général" : "Recherche"}
                </button>
              ))}
            </div>

            {/* Stream toggle */}
            <button
              onClick={() => setStreamMode(!streamMode)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                streamMode
                  ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold)]"
                  : "border-[var(--border2)] text-[var(--text3)]"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${streamMode ? "bg-[var(--gold)]" : "bg-[var(--text3)]"}`} />
              Streaming
            </button>

            {/* Region boost */}
            <input
              type="text"
              value={boostRegion}
              onChange={(e) => setBoostRegion(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="Région (BF, ML…)"
              className="w-28 rounded-lg border border-[var(--border2)] bg-[var(--bg3)] px-2.5 py-1 font-mono text-xs text-[var(--text2)] placeholder:text-[var(--text3)] focus:border-[var(--gold)] focus:outline-none transition-colors"
            />
          </div>

          {/* Text input */}
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Pose une question sur l'Afrique... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
              className="flex-1 resize-none rounded-xl border border-[var(--border2)] bg-[var(--bg3)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text3)] focus:border-[var(--gold)] focus:outline-none min-h-[48px] max-h-32 overflow-y-auto transition-colors"
              style={{ height: "auto" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
              }}
            />
            <button
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[var(--bg)] hover:bg-[var(--gold2)] disabled:opacity-40 transition-colors shrink-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ...
                </span>
              ) : (
                "Envoyer →"
              )}
            </button>
          </div>

          <p className="text-center font-mono text-[10px] text-[var(--text3)]">
            Aisha peut se tromper. Vérifie les informations critiques auprès de sources locales.
          </p>
        </div>
      </div>
    </div>
  );
}
