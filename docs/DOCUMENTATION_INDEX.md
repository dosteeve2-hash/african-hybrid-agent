# Documentation Index - Agent Hybride Africain v0.2

## 📖 Commencer ici

### Pour les utilisateurs
1. **[README.md](./README.md)** - Vue d'ensemble, démarrage, vision du projet
2. **[QUICK_START.md](./QUICK_START.md)** - Commandes prêtes à copier-coller
3. **[http://localhost:3000/test](http://localhost:3000/test)** - Interface interactive

### Pour les développeurs
1. **[API_REFERENCE.md](./docs/API_REFERENCE.md)** - Documentation complète des APIs
2. **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Guides production, Docker, Vercel, etc.
3. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Status complet et checklist

---

## 📚 Documentation complète

### 🎯 Projet & Architecture
- **[README.md](./README.md)** (400 lignes)
  - Vision: LLM africain fiable, anti-biais
  - Architecture modulaire décrite
  - Données disponibles
  - Connexion Problem to Project Africa

- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)**
  - Checklist complet v0.2
  - Prêt pour production?
  - Roadmap v0.3+
  - Statistiques

- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)**
  - Avant/après v0.1 → v0.2
  - Améliorations majeures par domaine
  - Chiffres de progression
  - Status final

### 🔌 APIs & Intégration
- **[API_REFERENCE.md](./docs/API_REFERENCE.md)** (400 lignes)
  - Tous endpoints détaillés
  - Paramètres + réponses
  - Exemples curl complets
  - Codes région supportés
  - Erreurs courantes

- **[QUICK_START.md](./QUICK_START.md)** (300 lignes)
  - Commandes démarrage
  - Tests APIs prêtes
  - Configuration .env
  - Examples curl
  - Docker quick start
  - Troubleshooting

### 🚀 Déploiement & Production
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** (500 lignes)
  - Docker + docker-compose
  - Vercel deployment
  - Railway.app deployment
  - Scaling horizontal
  - Monitoring
  - Sécurité production
  - Performance optimization
  - Troubleshooting

### 🏛️ Gouvernance & Sources
- **[GOVERNANCE.md](./docs/GOVERNANCE.md)** (200 lignes)
  - Politique sources
  - Scoring crédibilité
  - Anti-biais opérationnel
  - Evolution future

### 📊 Pipeline données
- **[DATA_PIPELINE.md](./docs/DATA_PIPELINE.md)**
  - Étapes actuelles
  - Roadmap technique
  - Non-objectifs
  - Indicateurs

### 📋 Historique
- **[CHANGELOG.md](./CHANGELOG.md)**
  - v0.2.0 détails complets
  - v0.1.0 initial
  - Roadmap futures versions

---

## 🗂️ Structure de fichiers

```
c:\Users\pc\Documents\New Project\
├── 📖 Documentation
│   ├── README.md                    # Vue d'ensemble
│   ├── PROJECT_STATUS.md            # Status final
│   ├── IMPROVEMENTS.md              # Avant/après
│   ├── QUICK_START.md               # Commandes rapides
│   ├── CHANGELOG.md                 # Historique
│   └── docs/
│       ├── API_REFERENCE.md         # Docs APIs détaillées
│       ├── DEPLOYMENT.md            # Guide production
│       ├── GOVERNANCE.md            # Politique sources
│       └── DATA_PIPELINE.md         # Pipeline données

├── 🔧 Code source
│   ├── package.json                 # Dependencies
│   ├── tsconfig.json                # TypeScript config
│   ├── next.config.ts               # Next.js config
│   ├── eslint.config.mjs            # Linting
│   ├── postcss.config.mjs           # CSS processing
│   │
│   └── src/
│       ├── app/
│       │   ├── page.tsx             # UI chat principal
│       │   ├── test/page.tsx        # Page test interactive
│       │   ├── layout.tsx           # Layout Next.js
│       │   ├── globals.css          # Styles globaux
│       │   └── api/                 # Route handlers
│       │       ├── chat/route.ts    # POST /api/chat
│       │       ├── evidence/route.ts# POST /api/evidence
│       │       ├── corpus/route.ts  # GET /api/corpus
│       │       ├── health/route.ts  # GET /api/health
│       │       └── audit/route.ts   # GET /api/audit
│       │
│       └── lib/
│           ├── agent/
│           │   ├── orchestrator.ts          # Cœur agent
│           │   ├── system-prompt.ts        # System prompts
│           │   ├── evidence-pack-builder.ts# Evidence Pack
│           │   └── query-from-profile.ts   # P2P profiles
│           │
│           ├── rag/
│           │   ├── corpus.ts       # Chargement corpus
│           │   ├── retrieve.ts     # Retrieval sémantique
│           │   └── embeddings.ts   # TF-IDF + synonymes
│           │
│           ├── llm/
│           │   └── generate.ts     # OpenAI-compatible
│           │
│           ├── governance/
│           │   ├── rules.ts        # Règles
│           │   ├── credibility.ts  # Scoring fiabilité
│           │   └── audit.ts        # Audit logs
│           │
│           └── types/
│               ├── chat.ts         # Types chat
│               └── evidence.ts     # Types evidence

├── 📚 Données
│   └── corpus/
│       ├── gouvernance-locale-burkina.md
│       ├── agriculture-agroecologie-ouest-africain.md
│       ├── entrepreneuriat-femmes-inclusion-financiere.md
│       ├── numerique-innovation-afrique.md
│       └── [autres sources...]

└── schemas/
    └── evidence-pack.schema.json
```

---

## 🚀 Quick navigation

### Je veux...

| Question | Document |
| --- | --- |
| Démarrer dev rapide | [QUICK_START.md](./QUICK_START.md) section DÉMARRAGE |
| Tester une API | [API_REFERENCE.md](./docs/API_REFERENCE.md) ou [http://localhost:3000/test](#) |
| Déployer prod | [DEPLOYMENT.md](./docs/DEPLOYMENT.md) |
| Ajouter source | [GOVERNANCE.md](./docs/GOVERNANCE.md) + data/corpus/ |
| Comprendre architecture | [README.md](./README.md#architecture) |
| Voir exemple code | [API_REFERENCE.md](./docs/API_REFERENCE.md#exemples) |
| Configurer LLM | [README.md](./README.md#variables) |
| Scaling horizontal | [DEPLOYMENT.md](./docs/DEPLOYMENT.md#7-performance-et-scaling) |
| Voir progrès v0.2 | [IMPROVEMENTS.md](./IMPROVEMENTS.md) |
| Connaitre status | [PROJECT_STATUS.md](./PROJECT_STATUS.md) |
| Troubleshoot erreur | [QUICK_START.md](./QUICK_START.md#troubleshooting) |
| Intégrer P2P | [README.md](./README.md#connexion-problem-to-project-africa) |

---

## 📞 Support & Contact

### Resources
- 🧪 Test interface: http://localhost:3000/test
- 📚 API docs: [API_REFERENCE.md](./docs/API_REFERENCE.md)
- 🚀 Deployment: [DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- 💡 Quick tips: [QUICK_START.md](./QUICK_START.md)

### Common tasks
```bash
# Démarrer dev
npm run dev

# Tester APIs
curl http://localhost:3000/api/health | jq

# Build prod
npm run build

# Docker
docker-compose up -d
```

---

## ✅ Checklist pour démarrer

- [ ] Lire [README.md](./README.md) (5 min)
- [ ] Lancer `npm run dev` (2 min)
- [ ] Tester sur http://localhost:3000/test (5 min)
- [ ] Tester une API curl (5 min)
- [ ] Lire [API_REFERENCE.md](./docs/API_REFERENCE.md) (10 min)
- [ ] Ajouter une source corpus (10 min)
- [ ] Consulter [DEPLOYMENT.md](./docs/DEPLOYMENT.md) si production (15 min)

**Total**: ~1 heure pour full onboarding

---

## 📞 Q&A

**Q: Besoin de OPENAI_API_KEY?**  
A: Non, optionnel. Service fonctionne avec synthèse locale.

**Q: Combien de sources corpus?**  
A: 5 sources principales (~256 chunks) en v0.2. Extensible.

**Q: Quel est le débit API?**  
A: ~20-50 requests/sec en retrieval. Scaling PostgreSQL pour futur.

**Q: Support multi-langue?**  
A: Français seulement en v0.2. Multi-langue (mooré, dioula) en v0.3.

**Q: Données en production?**  
A: Corpus versionnée en git. PostgreSQL optional v0.3+.

---

## 🎯 Prochaines étapes

1. **Setup dev**: `npm run dev` + test
2. **Ajouter sources**: Enrichir corpus avec données locales
3. **Intégration P2P**: Connecter avec Problem to Project Africa
4. **Deploy**: Voir [DEPLOYMENT.md](./docs/DEPLOYMENT.md)
5. **Validation**: Test utilisateurs africains
6. **Scaling**: PostgreSQL + pgvector (v0.3)

---

**Version**: 0.2.0 | **Date**: Mai 2026 | **Status**: Production-ready  
**Voir aussi**: [PROJECT_STATUS.md](./PROJECT_STATUS.md)
