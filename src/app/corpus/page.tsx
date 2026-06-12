'use client';

import { useState } from 'react';

const SOURCES = [
  {
    title: 'Santé et Éducation en Afrique de l\'Ouest',
    filename: 'sante-education-afrique-ouest.md',
    regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG'],
    credibility: 'high',
    chunks: 60,
    topics: ['santé', 'éducation', 'formation', 'nutrition', 'mentalité'],
    keywords: ['accès santé', 'qualité eau', 'vaccination', 'employabilité'],
  },
  {
    title: 'Eau, Assainissement et Hygiène',
    filename: 'eau-assainissement-hygiene-afrique.md',
    regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'TZ', 'ET', 'RW'],
    credibility: 'high',
    chunks: 50,
    topics: ['eau', 'assainissement', 'hygiène', 'santé'],
    keywords: ['accès eau', 'toilettes', 'Bio-sand', 'choléra'],
  },
  {
    title: 'Énergie Renouvelable et Électricité',
    filename: 'energie-renouvelable-electricite.md',
    regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'ET', 'RW', 'TZ', 'CM', 'ZA'],
    credibility: 'high',
    chunks: 55,
    topics: ['énergie', 'électricité', 'solaire', 'efficacité'],
    keywords: ['off-grid SHS', 'mini-grids', 'LPG', 'LED efficiency'],
  },
  {
    title: 'Pêche, Aquaculture et Ressources Marines',
    filename: 'peche-aquaculture-ressources-marines.md',
    regions: ['SN', 'CI', 'GH', 'NG', 'KE', 'TZ', 'MZ', 'ZA'],
    credibility: 'high',
    chunks: 48,
    topics: ['pêche', 'aquaculture', 'ressources marines', 'durabilité'],
    keywords: ['pêche artisanale', 'tilapia', 'transformation poisson'],
  },
  {
    title: 'Droit Foncier et Conflits Terre',
    filename: 'droit-foncier-propriete-conflits-terre.md',
    regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'ET', 'RW', 'TZ'],
    credibility: 'high',
    chunks: 52,
    topics: ['droit foncier', 'propriété', 'conflits', 'cadastre'],
    keywords: ['tenure', 'femmes droits', 'digitalisation cadastre'],
  },
  {
    title: 'Transport, Logistique et Commerce',
    filename: 'transport-logistique-commerce-local.md',
    regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'ET', 'RW', 'TZ', 'CM'],
    credibility: 'high',
    chunks: 55,
    topics: ['transport', 'logistique', 'commerce', 'e-commerce'],
    keywords: ['chaînes valeur', 'mini-grids', 'AfCFTA'],
  },
  {
    title: 'Changement Climatique et Résilience',
    filename: 'changement-climatique-resilience.md',
    regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'ET', 'RW', 'TZ', 'CM', 'ZA'],
    credibility: 'high',
    chunks: 58,
    topics: ['climat', 'résilience', 'agriculture', 'conservation'],
    keywords: ['sécheresse', 'variétés adaptées', 'reforestation'],
  },
  {
    title: 'Genre, Femmes et Droits',
    filename: 'genre-femmes-droits.md',
    regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'ET', 'RW', 'TZ', 'CM'],
    credibility: 'high',
    chunks: 52,
    topics: ['genre', 'femmes', 'droits', 'autonomisation'],
    keywords: ['entrepreneuriat', 'violence', 'santé reproductive'],
  },
  {
    title: 'Artisanat Traditionnel et Commerce Créatif',
    filename: 'artisanat-commerce-creaitif.md',
    regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'CM', 'KE', 'ET', 'UG'],
    credibility: 'high',
    chunks: 50,
    topics: ['artisanat', 'créatif', 'commerce', 'tourisme'],
    keywords: ['tissage', 'céramique', 'fair-trade', 'e-commerce'],
  },
  {
    title: 'Jeunesse, Employabilité et Opportunités',
    filename: 'jeunesse-employabilite.md',
    regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'ET', 'RW', 'TZ', 'CM', 'ZA'],
    credibility: 'high',
    chunks: 58,
    topics: ['jeunesse', 'emploi', 'entrepreneuriat', 'digital'],
    keywords: ['apprenticeship', 'startup', 'creative economy'],
  },
  {
    title: 'Gouvernance Locale Burkina',
    filename: 'gouvernance-locale-burkina.md',
    regions: ['BF'],
    credibility: 'official',
    chunks: 25,
    topics: ['gouvernance', 'civil society', 'local'],
    keywords: ['chefs', 'municipalités', 'participation'],
  },
  {
    title: 'Agriculture & Agroécologie Ouest-Africaine',
    filename: 'agriculture-agroecologie-ouest-africain.md',
    regions: ['BF', 'ML', 'SN', 'CI', 'GH'],
    credibility: 'high',
    chunks: 35,
    topics: ['agriculture', 'agroécologie', 'productivité'],
    keywords: ['zaï', 'demi-lune', 'niébé', 'viabilité économique'],
  },
  {
    title: 'Entrepreneuriat Femmes & Inclusion Financière',
    filename: 'entrepreneuriat-femmes-inclusion-financiere.md',
    regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG'],
    credibility: 'high',
    chunks: 30,
    topics: ['entrepreneuriat', 'femmes', 'finance', 'tontines'],
    keywords: ['microfinance', 'tontines', 'secteurs viables'],
  },
  {
    title: 'Numérique & Innovation Afrique',
    filename: 'numerique-innovation-afrique.md',
    regions: ['BF', 'ML', 'SN', 'CI', 'GH', 'NG', 'KE', 'UG', 'TZ', 'ET'],
    credibility: 'medium',
    chunks: 28,
    topics: ['numérique', 'innovation', 'technologie'],
    keywords: ['4G', 'paiement mobile', 'agriculture digitale'],
  },
];

const CREDIBILITY_SCORE: Record<string, number> = {
  official: 95,
  high: 88,
  medium: 70,
  low: 50,
};

export default function CorpusPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const filtered = SOURCES.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const totalChunks = SOURCES.reduce((sum, s) => sum + s.chunks, 0);
  const totalRegions = new Set(SOURCES.flatMap((s) => s.regions)).size;
  const totalTopics = new Set(SOURCES.flatMap((s) => s.topics)).size;

  return (
    <div className="min-h-screen px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-serif italic text-3xl font-bold text-[var(--text)] sm:text-4xl">
            Corpus de Connaissances
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text3)]">
            <span className="text-[var(--gold)]">{SOURCES.length}</span> sources ·{' '}
            <span className="text-[var(--gold)]">{totalChunks}</span> fragments ·{' '}
            <span className="text-[var(--gold)]">{totalRegions}</span> régions · RAG BM25 + TF-IDF
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Sources', value: SOURCES.length },
            { label: 'Fragments', value: totalChunks },
            { label: 'Régions', value: totalRegions },
            { label: 'Topics uniques', value: totalTopics },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--border2)] bg-[var(--bg3)] p-4"
            >
              <div className="font-mono text-2xl font-bold text-[var(--gold)]">{stat.value}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text3)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par titre, topic ou keyword…"
          className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg3)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text3)] focus:border-[var(--gold)] focus:outline-none transition-colors"
        />

        {/* Results count */}
        {searchTerm && (
          <p className="font-mono text-[11px] text-[var(--text3)]">
            <span className="text-[var(--gold)]">{filtered.length}</span> résultat{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Cards grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((source, idx) => {
            const score = CREDIBILITY_SCORE[source.credibility] ?? 70;
            const isExpanded = expandedIdx === idx;

            return (
              <div
                key={idx}
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                className="group cursor-pointer rounded-xl border border-[var(--border2)] bg-[var(--bg3)] p-5 transition-all duration-200 hover:border-[var(--gold)]/50 hover:shadow-[0_0_20px_var(--gold)]/5"
              >
                {/* Title row */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold leading-snug text-[var(--text)]">
                    {source.title}
                  </h3>
                  <span className="shrink-0 rounded-full border border-[var(--gold)]/20 bg-[var(--gold)]/10 px-2 py-0.5 font-mono text-[10px] text-[var(--gold)]">
                    {source.chunks} chunks
                  </span>
                </div>

                {/* Credibility bar */}
                <div className="mb-3">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border2)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${score}%`,
                        background: 'linear-gradient(to right, var(--gold), var(--cyan))',
                      }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-[var(--text3)]">
                    Crédibilité {score}/100 · {source.credibility}
                  </p>
                </div>

                {/* Regions */}
                <div className="mb-3 flex flex-wrap gap-1">
                  {source.regions.map((r) => (
                    <span
                      key={r}
                      className="rounded border border-[var(--border)] bg-[var(--bg2)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text3)]"
                    >
                      {r}
                    </span>
                  ))}
                </div>

                {/* Topics */}
                <div className="flex flex-wrap gap-1.5">
                  {source.topics.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[var(--gold)]/20 bg-[var(--gold)]/10 px-2 py-0.5 font-mono text-[10px] text-[var(--gold)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Expand hint */}
                <p className="mt-3 font-mono text-[10px] text-[var(--text3)] transition-colors group-hover:text-[var(--gold)]">
                  {isExpanded ? '▲ Réduire' : '▼ Voir keywords'}
                </p>

                {/* Expanded keywords */}
                {isExpanded && (
                  <div className="mt-3 border-t border-[var(--border)] pt-3">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--text3)]">
                      Keywords
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {source.keywords.map((k) => (
                        <span
                          key={k}
                          className="rounded border border-[var(--border2)] bg-[var(--bg2)] px-2 py-0.5 text-xs text-[var(--text2)]"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Usage note */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-5">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--gold)]">
            Utilisation
          </p>
          <ul className="space-y-1.5 text-xs leading-relaxed text-[var(--text2)]">
            <li>· Cliquez sur une source pour révéler les keywords détaillés</li>
            <li>· La barre de recherche filtre par titre, topic ou keyword</li>
            <li>· Le système utilise BM25 + TF-IDF pour le retrieval sémantique</li>
            <li>· Toutes les sources incluent du contexte africain authentique avec données réelles</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
