# Agent Hybride Africain v0.2

Prototype autonome pour un **LLM africain fiable** : interface intégrée, API riche, corpus local versionné, RAG sémantique, gouvernance des sources, et paquets de preuves pour Problem to Project Africa.

## Vision

Créer un assistant intelligent qui :
- 🌍 **Connaît l'Afrique** sans biais occidental
- 🎯 **Aide les entrepreneurs** locaux à transformer problèmes en projets viables
- 📊 **Cite sources fiables** : gouvernance stricte, audit trail complet
- 🤝 **Intègre Problem to Project Africa** : injection de contexte + profils utilisateur
- 🔄 **Apprend localement** : corpus versionnée, pas de surveillance occidentale

---

## Demarrage rapide

### Installation

```bash
cd "C:\Users\pc\Documents\New Project"
npm install
copy .env.example .env.local  # ou create .env.local avec variables ci-dessous
npm run dev
```

### Accès

- **Interface web** : `http://localhost:3000`
- **Test API** : `http://localhost:3000/test`
- **Santé** : `GET /api/health`
- **Chat** : `POST /api/chat`
- **Evidence Pack** : `POST /api/evidence`
- **Corpus audit** : `GET /api/corpus`

---

## Architecture

### Composants clés

```
src/
├── app/
│   ├── page.tsx              # UI chat principal
│   ├── test/page.tsx         # Page test interactive
│   └── api/
│       ├── chat/route.ts     # Chat conversationnel
│       ├── evidence/route.ts # Evidence Pack (pour P2P)
│       ├── corpus/route.ts   # Audit corpus
│       ├── health/route.ts   # Health check
│       └── audit/route.ts    # Logs d'audit (dev seulement)
├── lib/
│   ├── agent/
│   │   ├── orchestrator.ts          # Cœur logique agent
│   │   ├── system-prompt.ts         # Prompts système
│   │   ├── evidence-pack-builder.ts # Construction paquets preuves
│   │   └── query-from-profile.ts    # Parsing profils P2P
│   ├── rag/
│   │   ├── corpus.ts        # Chargement corpus + chunking
│   │   ├── retrieve.ts      # Récupération sémantique + fast
│   │   └── embeddings.ts    # TF-IDF, synonymes, relevance
│   ├── llm/
│   │   └── generate.ts      # Appel OpenAI-compatible + synthèse locale
│   ├── governance/
│   │   ├── rules.ts         # Règles gouvernance
│   │   ├── credibility.ts   # Scoring fiabilité sources
│   │   └── audit.ts         # Logging + audit trail
│   └── types/
│       ├── chat.ts          # Types messages et réponses
│       └── evidence.ts      # Types paquets preuves
data/
├── corpus/
│   ├── gouvernance-locale-burkina.md
│   ├── agriculture-agroecologie-ouest-africain.md
│   ├── entrepreneuriat-femmes-inclusion-financiere.md
│   ├── numerique-innovation-afrique.md
│   └── [autres sources...]
docs/
├── DATA_PIPELINE.md     # Roadmap technique
├── GOVERNANCE.md        # Politique sources
├── API_REFERENCE.md     # Référence API détaillée (NEW)
└── DEPLOYMENT.md        # Guide déploiement prod (NEW)
```

---

## Variables d'environnement

### Essentielles

```env
# LLM (optionnel - fonctionne sans)
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# Sécurité API
AGENT_API_KEY=votre-clé-secrète-api  # Protège /api/evidence
```

### Optionnelles

```env
# Pour déploiement
NODE_ENV=development|production
PUBLIC_URL=http://localhost:3000
```

---

## Utilisation

### 1. Chat simple

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Comment faire entrepreneuriat au Burkina?" }
    ],
    "mode": "general",
    "searchMode": "semantic"
  }'
```

### 2. Evidence Pack (Problem to Project Africa)

```bash
curl -X POST http://localhost:3000/api/evidence \
  -H "Content-Type: application/json" \
  -d '{
    "recommendationProfile": {
      "country": "Burkina Faso",
      "preferredSector": "agriculture",
      "observedProblem": "Productivité faible, manque formation",
      "skills": ["organisation", "vente"],
      "constraints": "Budget <1M FCFA"
    },
    "maxItems": 8,
    "searchMode": "semantic"
  }'
```

### 3. Audit corpus

```bash
curl -X GET http://localhost:3000/api/corpus
```

---

## Modes recherche

### 🚀 Sémantique (défaut, recommandé)

**Algorithme**: TF-IDF + similarité cosinus + dictionnaire synonymes africains

**Avantages**:
- Comprend sens, pas juste mots clés
- Boost géographique (BF, ML, SN, etc.)
- Scoring fiabilité intégré
- Capture contexte

**Temps**: 20-50ms

### ⚡ Fast (lexical)

**Algorithme**: Tokenisation simple + matching

**Avantages**:
- Très rapide
- Faible overhead

**Temps**: 5-15ms

---

## Données disponibles

### Corpus initial

| Source | Couverture | Crédibilité | Chunks |
| --- | --- | --- | --- |
| **Gouvernance locale Burkina** | Structures traditionnelles + modernes | high | ~25 |
| **Agriculture agroécologie** | Zaï, demi-lune, cultures de rente | high | ~35 |
| **Entrepreneuriat femmes** | Tontines, fintech, secteurs viables | high | ~30 |
| **Numérique et innovation** | 4G, paiement mobile, fintech | medium | ~28 |
| **Autres sources** | Divers (gouvernance, etc.) | variable | ~138 |

**Total**: ~256 chunks, 5-10 sources

### Ajouter sources

```markdown
---
title: "Titre complet"
sourceType: "government|ngo|community|reference|product"
region: "BF|ML|SN|CI|GH|..."
credibilityTier: "official|high|medium|low"
---

# Contenu...
```

Placer dans `data/corpus/nom-source.md`, recharger service.

---

## APIs en détail

Voir [API_REFERENCE.md](docs/API_REFERENCE.md) pour documentation complète.

### `/api/chat` (POST)

Chat conversationnel avec RAG.

**Paramètres** : `messages[]`, `mode` (general|research), `searchMode` (semantic|fast), `maxCitations`, `boostRegion`

**Réponse** : `reply`, `citations[]`, `confidence`, `agentSteps`, `warnings`

### `/api/evidence` (POST)

Evidence Pack pour recherche ou profil P2P.

**Paramètres** : `query` ou `recommendationProfile`, `maxItems`, `searchMode`, `minReliability`

**Réponse** : `items[]`, `uncertainty`, `confidence`

### `/api/corpus` (GET)

Audit du corpus chargé.

**Réponse** : `sources[]`, `totalChunks`, `totalSources`

### `/api/audit` (GET) — Dev seulement

Logs d'audit (développement seulement, returns 403 en production).

---

## Gouvernance des sources

### Scoring crédibilité

| Tier | Score | Interprétation |
| --- | --- | --- |
| `official` | 95 | Source institutionnelle vérifiée |
| `high` | 85 | ONG partenaire, publication validée |
| `medium` | 65 | Notes internes, travaux en cours |
| `low` | 40 | Opinion, à contre-vérifier |

### Anti-biais

- ✅ Prioriser sources locales africaines
- ✅ Signaler affirmations sans couverture corpus
- ✅ Documenter provenance, date, licence
- ✅ Garder contradictions visibles
- ❌ Pas de web-scraping aveugle

Voir [GOVERNANCE.md](docs/GOVERNANCE.md) pour détails.

---

## Roadmap

### Phase actuelle (v0.2) ✅

- ✅ RAG sémantique (TF-IDF + synonymes africains)
- ✅ Audit logs complet + tracabilité
- ✅ Evidence Pack avancé + profils P2P
- ✅ Corpus enrichi (gouvernance, agriculture, entrepreneuriat femmes, numérique)
- ✅ API test interactive
- ✅ Gouvernance stricte des sources

### Phase prochaine (v0.3) 🔄

- [ ] PostgreSQL + pgvector pour embeddings persistant
- [ ] Import PDF + OCR automated
- [ ] Web scraper + validation humaine
- [ ] Multi-langue (mooré, dioula, bambara)
- [ ] Dashboard admin corpus
- [ ] Webhooks intégration Problem to Project Africa

### Futur (v1.0+)

- [ ] Fine-tuning post-corpus validé
- [ ] Real-time collaboration source validation
- [ ] Mobile app (Android/iOS)
- [ ] Intégration WhatsApp/SMS
- [ ] Marché sources (paiement contributeurs)

---

## Déploiement

Voir [DEPLOYMENT.md](docs/DEPLOYMENT.md) pour :
- 🐳 Docker + docker-compose
- ☁️ Vercel, Railway.app
- 📊 Monitoring et scaling
- 🔒 Sécurité production
- 🚀 Performance optimization

### Quick start Docker

```bash
docker-compose up -d
# Service sur http://localhost:3000
```

---

## Performance

| Opération | Latence | Notes |
| --- | --- | --- |
| Recherche corpus (semantic) | 20-50ms | TF-IDF pré-calculé |
| Chat sans LLM | 100-300ms | Synthèse locale |
| Chat avec LLM | 1-3s | Appel OpenAI-compatible |
| Evidence Pack | 50-150ms | Même RAG que chat |
| Audit logs query | <1ms | En mémoire |

---

## Développement

### Lancer dev

```bash
npm run dev  # localhost:3000 avec hot reload
```

### Tester APIs

```bash
npm test    # Jest (optionnel, à configurer)
```

### Linter

```bash
npm run lint
```

---

## Support et contribution

### Questions?

- 📘 Lire [API_REFERENCE.md](docs/API_REFERENCE.md)
- 🧪 Tester sur `/test` page interactive
- 📊 Vérifier `/api/corpus` pour sources disponibles

### Améliorations

Pour ajouter sources ou signaler bugs:

1. Créer issue/PR
2. Formater source avec frontmatter YAML
3. Valider crédibilité (tier officiel minimum)
4. Tester sur `/api/evidence` avant merge

---

## Connexion Problem to Project Africa

Le projet Agent Hybride peut servir de **moteur de contexte** pour P2P:

1. **P2P envoie profil** (`POST /api/evidence`):
   ```json
   { "recommendationProfile": { "country": "BF", "sector": "agriculture", ... } }
   ```

2. **Agent retourne Evidence Pack**:
   ```json
   { "items": [...sources], "uncertainty": { "confidence": 0.78 } }
   ```

3. **P2P exploite**:
   - Enrichit recommandations avec contexte local
   - Affiche sources fiables
   - Documente raisons recommandations

---

## Licence

MIT / Ouvrir

---

## Auteurs

Développé pour initiatives entrepreneuriat africain authentique.

**Dernière mise à jour**: Mai 2026 | **Version**: 0.2.0
