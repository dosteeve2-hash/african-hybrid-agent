<div align="center">

# 🌍 African Hybrid AI Agent

### *Le premier agent IA hybride conçu pour et par l'Afrique*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Claude API](https://img.shields.io/badge/Anthropic-Claude-D97757?style=for-the-badge)](https://anthropic.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F0A832?style=for-the-badge)](./LICENSE)

**[🌐 Live Demo](https://burkinacollect.vercel.app)** · **[📖 API Reference](docs/API_REFERENCE.md)** · **[🐛 Report Bug](https://github.com/dosteeve2-hash/african-hybrid-agent/issues)**

</div>

---

## ✨ À propos

**African Hybrid Agent** est un agent IA hybride conçu pour répondre sans biais occidental aux besoins d'information des entrepreneurs et citoyens africains. Il s'appuie sur un corpus local versionné (gouvernance, agriculture, entrepreneuriat, numérique) et intègre une gouvernance stricte des sources.

Ce projet est le moteur de contexte de **[Problem to Project Africa](https://problem-to-projects-africa.vercel.app)** : il génère des "Evidence Packs" — des paquets de preuves contextuelles pour transformer des idées en projets financables.

---

## 🎯 Fonctionnalités

- ✅ **RAG Sémantique** — TF-IDF + similarité cosinus + dictionnaire de synonymes africains
- ✅ **Evidence Pack** — Génération de preuves contextuelles pour Problem to Project Africa
- ✅ **Gouvernance stricte** — Scoring de crédibilité par source (official/high/medium/low)
- ✅ **Corpus versionné** — ~256 chunks sur gouvernance, agriculture, entrepreneuriat, numérique
- ✅ **Boost géographique** — Priorisation des sources locales (BF, ML, SN, CI, GH...)
- ✅ **Audit trail** — Logs complets, tracabilité de chaque réponse
- ✅ **API REST complète** — Chat, Evidence, Corpus, Health, Audit
- ✅ **Tests Jest** — Coverage sur les modules critiques
- 🚧 **pgvector** — Embeddings persistants (en développement)
- 🚧 **Multi-langue** — Mooré, Dioula, Bambara (planifié)

---

## 🛠️ Stack technique

| Technologie | Rôle |
|-------------|------|
| [Next.js 16](https://nextjs.org/) | Framework + API Route Handlers |
| [TypeScript 5](https://www.typescriptlang.org/) | Typage strict |
| [Anthropic Claude API](https://anthropic.com/) | Génération de texte LLM |
| [PostgreSQL + pg](https://www.postgresql.org/) | Stockage corpus + metadata |
| [Redis](https://redis.io/) | Cache des résultats RAG |
| [Tailwind CSS v4](https://tailwindcss.com/) | Interface UI |
| [GSAP](https://greensock.com/gsap/) | Animations |
| [Jest](https://jestjs.io/) | Tests unitaires |
| [Vercel](https://vercel.com/) | Déploiement |

---

## 🚀 Installation locale

```bash
# 1. Cloner le projet
git clone https://github.com/dosteeve2-hash/african-hybrid-agent.git
cd african-hybrid-agent

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
```

Renseigner dans `.env.local` :

```env
# LLM (optionnel — fonctionne sans)
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# Sécurité API
AGENT_API_KEY=votre-clé-secrète-api
```

```bash
# 4. Lancer en développement
npm run dev
# → http://localhost:3000

# 5. Générer les embeddings corpus
npm run generate-embeddings

# 6. Lancer les tests
npm test
```

---

## 🔌 API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/chat` | POST | Chat conversationnel avec RAG |
| `/api/evidence` | POST | Evidence Pack pour Problem to Project Africa |
| `/api/corpus` | GET | Audit du corpus chargé |
| `/api/health` | GET | Health check |
| `/api/audit` | GET | Logs d'audit (dev seulement) |

### Exemple — Chat

```bash
curl -X POST https://burkinacollect.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{ "role": "user", "content": "Comment créer une entreprise au Burkina?" }],
    "mode": "general",
    "searchMode": "semantic"
  }'
```

### Exemple — Evidence Pack

```bash
curl -X POST https://burkinacollect.vercel.app/api/evidence \
  -H "Content-Type: application/json" \
  -d '{
    "recommendationProfile": {
      "country": "Burkina Faso",
      "preferredSector": "agriculture",
      "observedProblem": "Faible productivité agricole",
      "skills": ["organisation", "vente"],
      "constraints": "Budget < 1M FCFA"
    },
    "maxItems": 8
  }'
```

---

## 📊 Corpus disponible

| Source | Couverture | Crédibilité | Chunks |
|--------|-----------|-------------|--------|
| Gouvernance locale Burkina | Structures traditionnelles + modernes | high | ~25 |
| Agriculture agroécologie | Zaï, demi-lune, cultures de rente | high | ~35 |
| Entrepreneuriat femmes | Tontines, fintech, secteurs viables | high | ~30 |
| Numérique et innovation | 4G, paiement mobile, fintech | medium | ~28 |
| Autres sources | Divers | variable | ~138 |

**Total** : ~256 chunks · 5-10 sources

---

## 🗺️ Roadmap

### ✅ v0.2 — Actuel
- [x] RAG sémantique (TF-IDF + synonymes africains)
- [x] Evidence Pack + profils Problem to Project Africa
- [x] Gouvernance stricte des sources
- [x] Audit trail complet
- [x] API test interactive

### 🔧 v0.3 — En cours
- [ ] PostgreSQL + pgvector pour embeddings persistants
- [ ] Import PDF + OCR automatisé
- [ ] Dashboard admin corpus
- [ ] Webhooks intégration Problem to Project Africa

### 🚀 v1.0 — Futur
- [ ] Multi-langue (Mooré, Dioula, Bambara)
- [ ] Application mobile (Android/iOS)
- [ ] Intégration WhatsApp / SMS
- [ ] Fine-tuning sur corpus africain validé

---

## 🔒 Gouvernance des sources

| Tier | Score | Interprétation |
|------|-------|----------------|
| `official` | 95 | Source institutionnelle vérifiée |
| `high` | 85 | ONG partenaire, publication validée |
| `medium` | 65 | Notes internes, travaux en cours |
| `low` | 40 | Opinion, à contre-vérifier |

**Principes anti-biais** : prioriser les sources locales africaines, signaler les affirmations sans couverture, conserver les contradictions visibles.

---

## 🤝 Contribuer

Pour ajouter des sources au corpus :

```markdown
---
title: "Titre complet de la source"
sourceType: "government|ngo|community|reference"
region: "BF|ML|SN|CI|GH|..."
credibilityTier: "official|high|medium|low"
---

# Contenu de la source...
```

Placer dans `data/corpus/nom-source.md`, ouvrir une PR.

---

## 📄 Licence

MIT © 2026 [Steve Donald Compaoré](https://github.com/dosteeve2-hash)

---

<div align="center">

**Un assistant qui connaît l'Afrique — sans biais, sans intermédiaire**

*Fait avec ❤️ pour l'entrepreneuriat africain authentique · [burkinacollect.vercel.app](https://burkinacollect.vercel.app)*

</div>
