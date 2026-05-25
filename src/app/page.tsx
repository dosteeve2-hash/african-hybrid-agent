"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import type { ChatMessage, ChatMode, ChatResponseBody } from "@/lib/types/chat";
import type { EvidencePack } from "@/lib/types/evidence";

const starterPrompts = [
  "Comment construire un LLM africain fiable sans reprendre les biais du web ?",
  "Analyse un probleme d'entrepreneuriat jeune au Burkina et propose les sources a verifier.",
  "Comment Problem to Project Africa peut appeler cet agent pour enrichir ses recommandations ?",
];

type P2PProfile = {
  country: string;
  region: string;
  preferredSector: string;
  skills: string;
  observedProblem: string;
  goal: string;
  constraints: string;
};

type UiMessage = ChatMessage & {
  meta?: ChatResponseBody;
};

type CorpusAudit = {
  totalChunks: number;
  totalSources: number;
  sources: {
    sourceFile: string;
    title: string;
    sourceType: string;
    region: string;
    credibilityScore: number;
    credibilityLabel: string;
    chunks: number;
  }[];
};

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export default function Home() {
  const [input, setInput] = useState(starterPrompts[0]);
  const [mode, setMode] = useState<ChatMode>("research");
  const [loading, setLoading] = useState(false);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [evidence, setEvidence] = useState<EvidencePack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [corpusAudit, setCorpusAudit] = useState<CorpusAudit | null>(null);
  const [profile, setProfile] = useState<P2PProfile>({
    country: "Burkina Faso",
    region: "Ouagadougou / zones periurbaines",
    preferredSector: "entrepreneuriat, agriculture, education",
    skills: "vente, organisation communautaire, outils numeriques",
    observedProblem:
      "jeunes avec competences pratiques mais peu de sources fiables pour cadrer un projet",
    goal: "transformer un probleme local en projet faisable",
    constraints: "budget faible, connexion parfois instable, besoin de validation terrain",
  });

  const lastAssistant = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadAudit() {
      try {
        const res = await fetch("/api/corpus");
        if (!res.ok) return;
        const data = (await res.json()) as CorpusAudit;
        if (!cancelled) setCorpusAudit(data);
      } catch {
        if (!cancelled) setCorpusAudit(null);
      }
    }

    void loadAudit();
    return () => {
      cancelled = true;
    };
  }, []);

  async function send(promptOverride?: string) {
    const content = (promptOverride ?? input).trim();
    if (!content || loading) return;

    const nextMessages: UiMessage[] = [
      ...messages,
      { role: "user", content },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          mode,
        }),
      });
      const data = (await res.json()) as ChatResponseBody & { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Erreur ${res.status}`);
        return;
      }
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply, meta: data },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur reseau");
    } finally {
      setLoading(false);
    }
  }

  async function buildEvidence() {
    const query =
      input.trim() ||
      [...messages].reverse().find((m) => m.role === "user")?.content ||
      starterPrompts[1];

    setEvidenceLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = (await res.json()) as EvidencePack & { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Erreur ${res.status}`);
        return;
      }
      setEvidence(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur evidence");
    } finally {
      setEvidenceLoading(false);
    }
  }

  async function buildProfileEvidence() {
    setEvidenceLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationProfile: {
            country: profile.country,
            region: profile.region,
            preferredSector: profile.preferredSector,
            skills: profile.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
            observedProblem: profile.observedProblem,
            goal: profile.goal,
            constraints: profile.constraints,
            mode: "prototype",
            language: "fr",
          },
        }),
      });
      const data = (await res.json()) as EvidencePack & { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Erreur ${res.status}`);
        return;
      }
      setEvidence(data);
      setInput(data.querySummary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur profil P2P");
    } finally {
      setEvidenceLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0d0b] text-stone-100">
      <section className="border-b border-stone-800 bg-[#111611]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                Prototype autonome - LLM africain + agent RAG
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-5xl">
                Un agent qui repond avec culture locale, sources visibles et
                incertitude assumee.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-stone-300">
                Le prototype sert de noyau pour un futur LLM africain : corpus
                local, API chat, evidence pack pour Problem to Project Africa,
                verification des sources et fallback fonctionnel sans cle API.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Corpus local" value="5 fichiers" tone="green" />
              <Metric label="API prete" value="/chat + /evidence" tone="blue" />
              <Metric label="Mode offline" value="synthese locale" tone="amber" />
            </div>
          </div>

          <div className="border border-stone-800 bg-[#0d1110] p-5">
            <h2 className="text-lg font-semibold">Pipeline agent</h2>
            <ol className="mt-4 space-y-3 text-sm text-stone-300">
              <li>1. Comprendre la demande, le pays, le secteur et le besoin.</li>
              <li>2. Recuperer les fragments pertinents du corpus versionne.</li>
              <li>3. Classer les sources par fiabilite et afficher les limites.</li>
              <li>4. Injecter le contexte dans un LLM ou synthese locale.</li>
              <li>5. Renvoyer une reponse sourcable et reutilisable par API.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <div className="min-h-[620px] border border-stone-800 bg-[#101413]">
          <div className="border-b border-stone-800 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Console du LLM-agent</h2>
                <p className="mt-1 text-sm text-stone-400">
                  Teste une question, inspecte les citations et genere un paquet
                  de preuves pour un autre produit.
                </p>
              </div>
              <div className="flex rounded-md border border-stone-700 p-1">
                <button
                  type="button"
                  onClick={() => setMode("general")}
                  className={`px-3 py-2 text-sm ${
                    mode === "general"
                      ? "bg-emerald-600 text-white"
                      : "text-stone-300 hover:bg-stone-800"
                  }`}
                >
                  General
                </button>
                <button
                  type="button"
                  onClick={() => setMode("research")}
                  className={`px-3 py-2 text-sm ${
                    mode === "research"
                      ? "bg-emerald-600 text-white"
                      : "text-stone-300 hover:bg-stone-800"
                  }`}
                >
                  Recherche
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="border border-stone-700 px-3 py-2 text-left text-xs text-stone-300 hover:border-emerald-500 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              placeholder="Pose une question sur un secteur, un probleme, une competence ou un contexte africain..."
              className="w-full resize-y border border-stone-700 bg-[#0a0d0b] p-4 text-stone-100 placeholder:text-stone-600 focus:border-emerald-500 focus:outline-none"
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void send()}
                disabled={loading || !input.trim()}
                className="bg-emerald-600 px-5 py-2.5 font-medium text-white disabled:opacity-40"
              >
                {loading ? "Analyse..." : "Envoyer a l'agent"}
              </button>
              <button
                type="button"
                onClick={() => void buildEvidence()}
                disabled={evidenceLoading}
                className="border border-sky-500 px-5 py-2.5 font-medium text-sky-200 disabled:opacity-40"
              >
                {evidenceLoading ? "Construction..." : "Generer evidence pack"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setEvidence(null);
                  setError(null);
                }}
                className="border border-stone-700 px-5 py-2.5 font-medium text-stone-300"
              >
                Reinitialiser
              </button>
            </div>

            {error ? (
              <p className="border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="border border-dashed border-stone-700 p-5 text-sm text-stone-400">
                  Aucune conversation pour le moment. Lance un prompt pour voir
                  le retrieval, les citations et la confiance agent.
                </div>
              ) : (
                messages.map((message, index) => (
                  <MessageBlock key={`${message.role}-${index}`} message={message} />
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <Panel title="Etat du dernier tour">
            {lastAssistant?.meta ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Metric
                    label="Confiance"
                    value={pct(lastAssistant.meta.confidence)}
                    tone="green"
                  />
                  <Metric
                    label="Provider"
                    value={lastAssistant.meta.providerUsed}
                    tone="blue"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-300">
                    Etapes agent
                  </h3>
                  <ul className="mt-2 space-y-2 text-sm text-stone-400">
                    {lastAssistant.meta.agentSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
                {lastAssistant.meta.warnings.length > 0 ? (
                  <div className="border border-amber-700 bg-amber-950/30 p-3 text-sm text-amber-100">
                    {lastAssistant.meta.warnings.join(" ")}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-stone-400">
                Les indicateurs apparaitront apres une reponse.
              </p>
            )}
          </Panel>

          <Panel title="Simulation P2P">
            <div className="space-y-3">
              <TextField
                label="Pays"
                value={profile.country}
                onChange={(value) =>
                  setProfile((current) => ({ ...current, country: value }))
                }
              />
              <TextField
                label="Secteur"
                value={profile.preferredSector}
                onChange={(value) =>
                  setProfile((current) => ({
                    ...current,
                    preferredSector: value,
                  }))
                }
              />
              <TextField
                label="Competences"
                value={profile.skills}
                onChange={(value) =>
                  setProfile((current) => ({ ...current, skills: value }))
                }
              />
              <label className="block text-xs font-medium uppercase tracking-wide text-stone-500">
                Probleme observe
                <textarea
                  value={profile.observedProblem}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      observedProblem: event.target.value,
                    }))
                  }
                  rows={3}
                  className="mt-1 w-full resize-y border border-stone-700 bg-[#0a0d0b] p-2 text-sm normal-case tracking-normal text-stone-100 focus:border-emerald-500 focus:outline-none"
                />
              </label>
              <button
                type="button"
                onClick={() => void buildProfileEvidence()}
                disabled={evidenceLoading}
                className="w-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
              >
                Tester le pont P2P
              </button>
            </div>
          </Panel>

          <Panel title="Evidence pack API">
            {evidence ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Metric
                    label="Confiance"
                    value={pct(evidence.uncertainty.confidence)}
                    tone="amber"
                  />
                  <Metric
                    label="Preuves"
                    value={String(evidence.items.length)}
                    tone="green"
                  />
                </div>
                <p className="text-xs text-stone-500">
                  Requete: {evidence.querySummary}
                </p>
                <div className="space-y-2">
                  {evidence.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="border border-stone-800 bg-[#0a0d0b] p-3"
                    >
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-medium text-stone-200">
                          {item.label}
                        </span>
                        <span className="text-emerald-300">
                          {item.reliabilityScore}/100
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-stone-400">
                        {item.excerpt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-400">
                Clique sur Generer evidence pack pour voir le JSON exploitable
                par Problem to Project Africa.
              </p>
            )}
          </Panel>

          <Panel title="Politique source">
            <ul className="space-y-2 text-sm text-stone-400">
              <li>Sources officielles ou terrain documente en priorite.</li>
              <li>Opinion, rumeur et synthese media marquees comme fragiles.</li>
              <li>Incertitude visible quand le corpus ne suffit pas.</li>
              <li>Validation humaine prevue avant ingestion massive.</li>
            </ul>
          </Panel>

          <Panel title="Audit corpus">
            {corpusAudit ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Metric
                    label="Sources"
                    value={String(corpusAudit.totalSources)}
                    tone="green"
                  />
                  <Metric
                    label="Fragments"
                    value={String(corpusAudit.totalChunks)}
                    tone="blue"
                  />
                </div>
                <div className="space-y-2">
                  {corpusAudit.sources.slice(0, 4).map((source) => (
                    <div
                      key={source.sourceFile}
                      className="border border-stone-800 bg-[#0a0d0b] p-3"
                    >
                      <div className="text-xs font-medium text-stone-200">
                        {source.title}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-500">
                        <span>{source.region}</span>
                        <span>{source.sourceType}</span>
                        <span>{source.chunks} fragments</span>
                        <span className="text-emerald-300">
                          {source.credibilityScore}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-400">
                Chargement de la liste des sources.
              </p>
            )}
          </Panel>
        </aside>
      </section>
    </main>
  );
}

function MessageBlock({ message }: { message: UiMessage }) {
  const isUser = message.role === "user";

  return (
    <article
      className={`border p-4 ${
        isUser
          ? "border-stone-700 bg-[#151817]"
          : "border-emerald-900 bg-[#0b1511]"
      }`}
    >
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
        {isUser ? "Utilisateur" : "Agent"}
      </div>
      <div className="whitespace-pre-wrap text-sm leading-6 text-stone-200">
        {message.content}
      </div>
      {message.meta?.citations.length ? (
        <div className="mt-4 border-t border-stone-800 pt-4">
          <h3 className="text-sm font-semibold text-stone-300">
            Sources recuperees
          </h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {message.meta.citations.map((citation) => (
              <div
                key={citation.id}
                className="border border-stone-800 bg-[#0a0d0b] p-3"
              >
                <div className="flex flex-wrap gap-2 text-xs text-stone-500">
                  <span className="font-mono text-emerald-300">
                    {citation.id}
                  </span>
                  <span>{citation.region ?? "region ouverte"}</span>
                  <span>{citation.credibilityScore}/100</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-stone-400">
                  {citation.excerpt}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-medium uppercase tracking-wide text-stone-500">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full border border-stone-700 bg-[#0a0d0b] p-2 text-sm normal-case tracking-normal text-stone-100 focus:border-emerald-500 focus:outline-none"
      />
    </label>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-stone-800 bg-[#101413] p-4">
      <h2 className="mb-3 text-base font-semibold text-stone-100">{title}</h2>
      {children}
    </section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "blue" | "amber";
}) {
  const color =
    tone === "green"
      ? "text-emerald-300"
      : tone === "blue"
        ? "text-sky-300"
        : "text-amber-300";

  return (
    <div className="border border-stone-800 bg-[#0a0d0b] p-3">
      <div className="text-xs uppercase tracking-wide text-stone-500">
        {label}
      </div>
      <div className={`mt-1 text-sm font-semibold ${color}`}>{value}</div>
    </div>
  );
}
