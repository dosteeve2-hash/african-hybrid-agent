# CLAUDE.md — African Hybrid Agent

## Projet

**African Hybrid Agent** — moteur IA hybride sans biais occidental pour entrepreneurs africains.
Il alimente **Problem to Project Africa** via une API d'Evidence Packs.

- **URL prod** : https://burkinacollect.vercel.app
- **Stack** : Next.js 16 + TypeScript + PostgreSQL/pgvector + Redis + Anthropic Claude API
- **Repo** : `C:\Users\pc\Documents\GitHub\african-hybrid-agent`

---

## Architecture

```
src/
  app/
    api/          — Route Handlers Next.js (chat, evidence, corpus, health, audit, search)
    admin/        — Dashboard CRUD corpus
    corpus/       — Visualiseur de sources
    hub/          — Page d'accueil agent
    monitoring/   — Stats temps réel
  lib/
    agent/        — Orchestration des requêtes hybrides
    cache/        — Redis (11 fonctions de cache)
    db/           — PostgreSQL + pgvector (10 tables, 3 views)
    governance/   — Scoring crédibilité sources
    llm/          — Client Anthropic Claude API
    rag/          — TF-IDF + similarité cosinus + synonymes africains
    sources/      — Corpus loader (14 sources, ~550 chunks)
    types/        — Types TypeScript partagés
data/corpus/      — Sources markdown (BF, ML, SN, CI, GH, NG, CM, KE, UG, RW, TZ, ET, ZA)
```

---

## API Endpoints principaux

| Méthode | Route | Usage |
|---------|-------|-------|
| POST | `/api/chat` | Chat avec sessions et citations |
| POST | `/api/evidence` | Evidence Pack (pour P2P Africa) |
| GET | `/api/corpus` | Liste des sources corpus |
| GET | `/api/health` | Santé du système |
| GET | `/api/audit` | Logs audit (dev only) |
| GET/DELETE | `/api/cache` | Stats et gestion cache Redis |
| POST | `/api/search/vector` | Recherche sémantique pgvector |

---

## Modes de recherche

- **`semantic`** (défaut) — TF-IDF + cosinus + synonymes africains, plus précis
- **`fast`** — keyword match simple, rapide
- **`hybrid`** — combinaison des deux

---

## Paramètres clés Evidence Pack

```typescript
{
  query?: string,                    // Requête libre
  recommendationProfile?: {          // Profil P2P Africa
    country: string,
    region: string,
    preferredSector: string,
    skills: string[],
    observedProblem: string,
    constraints: string,
  },
  searchMode?: "semantic" | "fast" | "hybrid",
  maxItems?: number,                 // défaut: 8
  boostRegion?: string,              // ex: "BF", "ML", "SN"
}
```

---

## Corpus — Ajouter une source

```markdown
<!-- data/corpus/nom-source.md -->
---
title: "Titre de la source"
sourceType: "official" | "ngo" | "research" | "media"
region: "BF" | "ML" | "SN" | "CI" | "GH" | "NG" | "CM" | ...
credibilityTier: "high" | "medium" | "low"
---

# Contenu de la source...
```

Le service recharge automatiquement à la prochaine requête.

---

## Règles de développement

1. **TypeScript strict** — zéro `any`, zéro `@ts-ignore`
2. **`npm run build` → 0 erreur** avant tout push
3. **Credentials jamais côté client** — `OPENAI_API_KEY`, clés DB/Redis → côté serveur uniquement
4. **Chunking 200-400 tokens** pour les nouvelles sources corpus
5. **Audit trail** — chaque réponse IA doit être loggée via AuditService

---

## Variables d'environnement

```env
# LLM — optionnel (fonctionne sans)
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# PostgreSQL (optionnel — fallback corpus en mémoire si absent)
DATABASE_URL=postgresql://postgres:password@localhost:5432/african_agent

# Redis (optionnel — cache désactivé si absent)
REDIS_URL=redis://localhost:6379

# Sécurité API
AGENT_API_KEY=your-secret-key  # protection routes /api/* en production
NODE_ENV=production
```

---

## Commandes

```bash
npm run dev              # Dev local (port 3000, Turbopack)
npm run build            # Build production — doit passer 0 erreur
npm run lint             # ESLint
npm test -- --forceExit  # 36 tests Jest
npx tsc --noEmit         # Check types seul

# Infrastructure locale (optionnel)
docker-compose -f docker-compose.postgres.yml up -d
```

---

## Notes importantes

- L'agent fonctionne **sans PostgreSQL et sans Redis** — fallback corpus en mémoire
- L'agent fonctionne **sans `OPENAI_API_KEY`** — répond avec citations seulement, sans synthèse LLM
- **Codes région** : BF=Burkina, ML=Mali, SN=Sénégal, CI=Côte d'Ivoire, GH=Ghana, NG=Nigeria
- Audit logs désactivés en production (retournent 403)
- Les tests Jest couvrent RAG, cache, governance et corpus loader
- `src/app/hub/page.tsx` — page principale de l'interface agent

---

## Contexte SDC (Steeve Donald Compaore)

Projet de l'écosystème **FORGE Afrika** — même propriétaire que Mifa_Life_shop, CompTrack, P2P Africa.
Charte graphique : Nuit Sahélienne (#070e1f fond) + Or (#f0a832) + Cyan (#2dd4ff) + Vert (#22d98a).
