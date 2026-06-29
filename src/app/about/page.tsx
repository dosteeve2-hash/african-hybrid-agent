"use client";

import Link from "next/link";
import { BrandMotion } from "@/components/motion/brand-motion";

// ── Stack technique ───────────────────────────────────────────────────────────

const STACK = [
  {
    name: "Next.js",
    desc: "App Router, Server Components, streaming SSE — architecture edge-ready",
    color: "var(--text2)",
  },
  {
    name: "Supabase + pgvector",
    desc: "Base vectorielle PostgreSQL pour le RAG sémantique et les embeddings",
    color: "var(--cyan)",
  },
  {
    name: "OpenAI / Anthropic Claude",
    desc: "LLM hybride — Claude & GPT selon le contexte et la disponibilité",
    color: "var(--gold)",
  },
  {
    name: "BM25 + TF-IDF",
    desc: "Scoring sémantique africain avec synonymes locaux et boost géographique",
    color: "var(--green)",
  },
];

// ── Valeurs ───────────────────────────────────────────────────────────────────

const VALUES = [
  {
    icon: "◈",
    title: "Fiabilité des sources",
    body: "Chaque document du corpus est scoré de 40 à 95 selon sa crédibilité. Sources officielles, ONG locales, recherches universitaires africaines.",
    color: "var(--gold)",
  },
  {
    icon: "◇",
    title: "Neutralité éditoriale",
    body: "Algorithme anti-biais qui priorise les sources africaines sur les perspectives extérieures. 54 pays, une voix équilibrée.",
    color: "var(--cyan)",
  },
  {
    icon: "◉",
    title: "Accessibilité panafricaine",
    body: "Conçu pour fonctionner en français et en langues locales. L'IA africaine pour tous, des grandes villes aux zones rurales.",
    color: "var(--green)",
  },
];

// ── Stats mission ─────────────────────────────────────────────────────────────

const STATS = [
  { label: "Pays couverts", value: "54" },
  { label: "Documents corpus", value: "24+" },
  { label: "Fragments indexés", value: "256" },
  { label: "Score crédibilité", value: "40–95" },
];

// ── Page principale ───────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-56px)]">
      <BrandMotion />

      {/* ── Héro ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-[var(--border)] bg-[var(--bg2)]/60 px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p
            data-hero="1"
            className="font-mono text-[11px] uppercase tracking-widest text-[var(--text3)] mb-4"
          >
            À propos
          </p>
          <h1
            data-hero="2"
            className="text-3xl font-bold text-[var(--text)] sm:text-5xl leading-tight"
          >
            <span className="font-serif italic text-[var(--gold)]">Aisha</span>
            {" — "}
            L&apos;intelligence africaine
          </h1>
          <p
            data-hero="3"
            className="text-xl sm:text-2xl font-medium text-[var(--text2)] mt-2"
          >
            au service de l&apos;Afrique
          </p>
          <p
            data-hero="4"
            className="mt-6 text-base leading-relaxed text-[var(--text2)] max-w-2xl mx-auto"
          >
            Un agent IA RAG spécialisé sur les 54 pays africains — sources locales vérifiées,
            anti-biais occidental, accessible en français et en langues locales.
          </p>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <section className="px-5 py-14 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text3)] mb-3">
                Mission
              </p>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
                L&apos;infrastructure intellectuelle africaine
              </h2>
              <p className="text-sm leading-relaxed text-[var(--text2)] mb-4">
                Aisha est un agent RAG (Retrieval-Augmented Generation) sémantique alimenté
                exclusivement par des sources africaines vérifiées. Il couvre agriculture,
                entrepreneuriat, gouvernance, culture et innovation à travers les 54 pays du continent.
              </p>
              <p className="text-sm leading-relaxed text-[var(--text2)]">
                Chaque réponse cite ses sources avec un score de crédibilité transparent —
                zéro biais occidental, priorité aux voix locales et aux savoirs traditionnels.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[var(--border2)] bg-[var(--bg3)]/60 p-5 text-center"
                >
                  <p className="text-3xl font-bold font-serif italic text-[var(--gold)]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text3)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stack technique ───────────────────────────────────────────────── */}
      <section className="border-t border-[var(--border)] bg-[var(--bg2)]/40 px-5 py-14 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text3)] mb-3">
            Stack technique
          </p>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-8">Technologies</h2>
          <div data-reveal-group className="grid gap-3 sm:grid-cols-2">
            {STACK.map((tech) => (
              <div
                key={tech.name}
                className="flex items-start gap-4 rounded-xl border border-[var(--border2)] bg-[var(--bg3)]/60 p-4 transition-colors hover:border-[var(--gold)]/30"
              >
                <div
                  className="w-1 h-10 rounded-full shrink-0 mt-0.5"
                  style={{ background: tech.color }}
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{tech.name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--text3)]">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Valeurs ───────────────────────────────────────────────────────── */}
      <section className="px-5 py-14 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text3)] mb-3">
            Valeurs
          </p>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-8">Nos engagements</h2>
          <div data-reveal-group className="grid gap-4 sm:grid-cols-3">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-xl border border-[var(--border2)] bg-[var(--bg3)]/60 p-5 transition-colors hover:border-[var(--gold)]/30"
              >
                <span className="text-2xl leading-none" style={{ color: v.color }}>
                  {v.icon}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-[var(--text)]">{v.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text3)]">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fondateur ─────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--border)] bg-[var(--bg2)]/40 px-5 py-14 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text3)] mb-3">
            Équipe
          </p>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-8">Fondateur</h2>
          <div className="flex items-start gap-6">
            <div className="shrink-0 w-14 h-14 rounded-full bg-[var(--gold)] flex items-center justify-center font-serif italic text-xl font-bold text-[var(--bg)]">
              SD
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--text)]">
                Steeve Donald Compaore{" "}
                <span role="img" aria-label="Burkina Faso">🇧🇫</span>
              </p>
              <p className="font-mono text-xs text-[var(--text3)] mt-0.5">
                Burkina Faso · GitHub: dosteeve2-hash
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text2)] max-w-xl italic border-l-2 border-[var(--gold)]/40 pl-4">
                &ldquo;Construire l&rsquo;infrastructure intellectuelle africaine — une réponse sourcée à la fois.&rdquo;
              </p>
              <a
                href="https://github.com/dosteeve2-hash/african-hybrid-agent"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 font-mono text-[11px] uppercase tracking-wider text-[var(--text3)] hover:text-[var(--gold)] transition-colors"
              >
                GitHub ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--border)] px-5 py-14 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
            Prêt à explorer l&rsquo;Afrique ?
          </h2>
          <p className="text-sm text-[var(--text2)] mb-8">
            Pose ta première question à Aisha — en français ou en langue locale.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[var(--bg)] hover:bg-[var(--gold2)] transition-colors"
          >
            Essayer Aisha →
          </Link>
        </div>
      </section>
    </div>
  );
}
