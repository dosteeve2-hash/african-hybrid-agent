"use client";

import Link from "next/link";
import { useState } from "react";

type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: "live" | "beta" | "conception" | "dev";
  stack: string[];
  href: string;
  github?: string;
  accent: string;
  icon: string;
  connects: string[];
};

const PROJECTS: Project[] = [
  {
    id: "aisha",
    name: "Aisha",
    tagline: "Agent IA Africain Souverain",
    description:
      "LLM local (Ollama) + corpus encyclopédique sur l'Afrique de l'Ouest. Langues, cultures, histoire, savoirs traditionnels. 100% offline, 0% big tech.",
    status: "live",
    stack: ["Next.js", "Ollama", "BM25", "TypeScript"],
    href: "/",
    github: "https://github.com/dosteeve2-hash/african-hybrid-agent",
    accent: "#10b981",
    icon: "◈",
    connects: ["p2p", "burkina", "mifa"],
  },
  {
    id: "p2p",
    name: "Problem to Project Africa",
    tagline: "Transformer idées africaines en projets exécutables",
    description:
      "Plateforme AI-powered pour aider les talents africains à structurer leurs idées en projets concrets, adaptés à leur réalité locale.",
    status: "conception",
    stack: ["Next.js", "Supabase", "Claude API", "Tailwind"],
    href: "https://github.com/dosteeve2-hash",
    github: "https://github.com/dosteeve2-hash",
    accent: "#f59e0b",
    icon: "◇",
    connects: ["aisha", "burkina"],
  },
  {
    id: "burkina",
    name: "BurkinaCollect",
    tagline: "Collecte de données terrain au Burkina Faso",
    description:
      "Application de collecte de données communautaires pour les projets de développement au Burkina. Fonctionne hors-ligne, sync automatique.",
    status: "dev",
    stack: ["React Native", "SQLite", "Supabase", "PWA"],
    href: "https://github.com/dosteeve2-hash",
    github: "https://github.com/dosteeve2-hash",
    accent: "#ef4444",
    icon: "◉",
    connects: ["aisha", "p2p"],
  },
  {
    id: "mifa",
    name: "Mifa Life Shop",
    tagline: "E-commerce africain premium",
    description:
      "Boutique en ligne premium avec produits africains authentiques. Artisanat, mode, art. Passerelle entre la diaspora et les artisans locaux.",
    status: "dev",
    stack: ["Next.js", "Supabase", "Tailwind", "TypeScript"],
    href: "https://github.com/dosteeve2-hash/Mifa_Life_shop",
    github: "https://github.com/dosteeve2-hash/Mifa_Life_shop",
    accent: "#8b5cf6",
    icon: "◆",
    connects: ["aisha"],
  },
];

const STATUS_LABELS: Record<Project["status"], { label: string; color: string }> = {
  live:       { label: "Live",       color: "#10b981" },
  beta:       { label: "Beta",       color: "#3b82f6" },
  dev:        { label: "En dev",     color: "#f59e0b" },
  conception: { label: "Conception", color: "#6b7280" },
};

export default function HubPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isConnected = (a: string, b: string) => {
    const pa = PROJECTS.find((p) => p.id === a);
    return pa?.connects.includes(b) ?? false;
  };

  return (
    <div className="min-h-screen bg-[#0a0a08] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-800 py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #10b981 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-900/60 bg-emerald-950/40 px-4 py-1.5 text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Écosystème Tech Africain — Steve Donald Compaoré
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            L&apos;Écosystème{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
              Africa First
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-stone-400 leading-relaxed">
            Des projets tech interconnectés, construits pour l&apos;Afrique et par l&apos;Afrique.
            Souverains, offline-first, centrés sur les réalités locales.
          </p>
        </div>
      </section>

      {/* Projects grid */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-10 text-sm font-semibold uppercase tracking-widest text-stone-500">
          Projets actifs
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {PROJECTS.map((project) => {
            const status = STATUS_LABELS[project.status];
            const isHovered = hoveredId === project.id;
            const isRelated =
              hoveredId !== null &&
              hoveredId !== project.id &&
              (isConnected(hoveredId, project.id) || isConnected(project.id, hoveredId));

            return (
              <a
                key={project.id}
                href={project.href}
                target={project.href.startsWith("http") ? "_blank" : "_self"}
                rel="noreferrer"
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative rounded-xl border transition-all duration-300"
                style={{
                  borderColor: isHovered
                    ? project.accent + "60"
                    : isRelated
                      ? project.accent + "30"
                      : "#292524",
                  background: isHovered
                    ? `radial-gradient(ellipse 100% 80% at 0% 0%, ${project.accent}08 0%, transparent 60%), #111110`
                    : isRelated
                      ? `${project.accent}06`
                      : "#111110",
                  opacity: hoveredId && !isHovered && !isRelated ? 0.5 : 1,
                  transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                }}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-2xl leading-none"
                        style={{ color: project.accent }}
                      >
                        {project.icon}
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-white">{project.name}</h3>
                        <p
                          className="text-xs"
                          style={{ color: project.accent + "cc" }}
                        >
                          {project.tagline}
                        </p>
                      </div>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                      style={{
                        background: status.color + "18",
                        color: status.color,
                        border: `1px solid ${status.color}40`,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mb-4 text-sm text-stone-400 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Stack */}
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded px-2 py-0.5 text-[11px] font-mono text-stone-500"
                        style={{ background: "#1c1b19", border: "1px solid #292524" }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Connected to */}
                  {project.connects.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
                      <span>Connecté à :</span>
                      {project.connects.map((cid) => {
                        const cp = PROJECTS.find((p) => p.id === cid);
                        return cp ? (
                          <span
                            key={cid}
                            className="rounded px-1.5 py-0.5 font-medium"
                            style={{
                              color: cp.accent,
                              background: cp.accent + "18",
                            }}
                          >
                            {cp.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                {/* Bottom action bar */}
                <div
                  className="flex items-center justify-between border-t px-6 py-3"
                  style={{ borderColor: "#1c1b19" }}
                >
                  <span className="text-xs text-stone-600">
                    {project.href.startsWith("http") ? "↗ GitHub" : "→ Ouvrir"}
                  </span>
                  <span
                    className="text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: project.accent }}
                  >
                    Explorer →
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Vision section */}
      <section className="border-t border-stone-800 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            <VisionCard
              icon="◎"
              title="Souveraineté"
              body="LLMs locaux avec Ollama. Données hébergées en Afrique dans le futur. Aucune dépendance aux GAFA."
              color="#10b981"
            />
            <VisionCard
              icon="◑"
              title="Interconnexion"
              body="Chaque projet alimente les autres. Aisha apprend du corpus de BurkinaCollect. P2P s'appuie sur Aisha pour les recommandations."
              color="#f59e0b"
            />
            <VisionCard
              icon="◐"
              title="Africa First"
              body="Burkina Faso et Mali comme marché primaire. Langues locales intégrées. Réalités africaines au cœur, pas en annexe."
              color="#8b5cf6"
            />
          </div>
        </div>
      </section>

      {/* Setup CTA */}
      <section className="border-t border-stone-800 py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-2 text-sm text-stone-500 uppercase tracking-widest">Mode souverain</p>
          <h3 className="mb-3 text-xl font-semibold text-white">
            Lancer Aisha en local — 0 API externe
          </h3>
          <p className="mb-6 text-sm text-stone-400">
            Installe Ollama, télécharge llama3.2, configure{" "}
            <code className="rounded bg-stone-900 px-1.5 py-0.5 text-xs text-emerald-400">
              OLLAMA_URL=http://localhost:11434
            </code>{" "}
            et lance{" "}
            <code className="rounded bg-stone-900 px-1.5 py-0.5 text-xs text-stone-300">
              npm run dev
            </code>
            .
          </p>
          <Link
            href="https://github.com/dosteeve2-hash/african-hybrid-agent/blob/main/SETUP_LOCAL.md"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-800 bg-emerald-950/40 px-5 py-2.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-900/40"
          >
            Lire SETUP_LOCAL.md →
          </Link>
        </div>
      </section>
    </div>
  );
}

function VisionCard({
  icon,
  title,
  body,
  color,
}: {
  icon: string;
  title: string;
  body: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "#292524", background: "#111110" }}
    >
      <span className="mb-3 block text-xl" style={{ color }}>
        {icon}
      </span>
      <h4 className="mb-2 text-sm font-semibold text-white">{title}</h4>
      <p className="text-xs text-stone-500 leading-relaxed">{body}</p>
    </div>
  );
}
