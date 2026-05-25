# Changelog

## v0.2.0 - Mai 2026

### ✨ Nouvelles fonctionnalités

#### RAG et recherche améliorée
- **Recherche sémantique**: Implémentation TF-IDF + similarité cosinus + dictionnaire synonymes africains
- **Deux modes recherche**: `semantic` (défaut, intelligent) vs `fast` (lexical, rapide)
- **Boost géographique**: Priorité zones géographiques selon `boostRegion`
- **Scoring intelligent**: Combinaison lexique + crédibilité source + proximité région

#### Gouvernance et audit
- **Système d'audit complet**: Tracabilité complète retrieval + réponses
- **Logs d'audit**: `/api/audit` (dev seulement) avec filtrage component/level
- **Scoring fiabilité amélioré**: Quatre tiers (official/high/medium/low) avec scores 0-100

#### APIs enrichies
- **Options avancées `/api/chat`**: `searchMode`, `boostRegion`, `maxCitations`
- **Evidence Pack 2.0**: Support profils P2P + options recherche avancées
- **Nouveau `/api/audit`**: Accès logs audit (sécurité: dev seulement)
- **Amélioration `/api/evidence`**: Support `recommendationProfile` + options de recherche

#### Profile Problem to Project Africa
- **Analyse de profils**: `analyzeProfile()` extrait contexte principal + topics
- **Query building smart**: Génération requêtes optimisées à partir profils
- **Region boost**: Mappage pays → codes région pour priorité recherche

#### Interface de test
- **Page `/test` interactive**: Interface pour tester toutes APIs en temps réel
- **JSON export**: Télécharger résultats tests
- **Mode toggle P2P**: Tester avec profils directement

#### Corpus enrichi
- **Gouvernance locale Burkina**: Structures traditionnelles + modernes, collectivités
- **Agriculture agroécologie**: Zaï, demi-lune, cultures viables, rentabilité
- **Entrepreneuriat femmes**: Tontines, IMF, secteurs viables, modèles accompagnement
- **Numérique et innovation**: Télécom, fintech, enjeux infrastructure, solutions locales

#### System prompts révisés
- **Prompts plus riches**: Contexte mieux expliqué, perspectives africaines prioritaires
- **Separation modes**: Research vs General avec hints spécifiques
- **Anti-biais renforcé**: Éviter stéréotypes coloniaux, citer sources explicitement

### 📊 Améliorations

- Refactor `orchestrator.ts`: Support `AgentRunOptions` avancées + timing
- Performance monitoring: Temps d'exécution par étape
- Logging structuré: Component-based avec levels (info/warning/error/trace)
- Types TypeScript: Meilleures interfaces + optionalité

### 📚 Documentation

- **API_REFERENCE.md** (NEW): Référence complète avec exemples curl
- **DEPLOYMENT.md** (NEW): Guides Docker, Vercel, Railway, scaling, sécurité
- **README.md** (UPDATED): Architecture complète, données, gouvernance
- **docs/GOVERNANCE.md** (UPDATED): Politique sources avec examples

### 🔒 Sécurité

- Audit logs: Désactivés en production (`NODE_ENV=production` → 403)
- API key: `AGENT_API_KEY` protège `/api/evidence`
- Audit logger: Instance singleton, max 1000 logs en mémoire

### ⚠️ Breaking changes

- `retrieveChunks()` signature changée: Support `RetrievalOptions` objet (backward compatible avec legacy topK)
- `buildEvidencePack()` peut accepter `RecommendationProfilePayload` (avant: string seulement)

### 🐛 Bugfixes

- Corpus cache clearing: Ajout `clearCorpusCache()` pour hot-reload sources
- Stop words français/anglais: Amélioration tokenization
- Confidence calculation: Mieux pondéré avec nombre items + coverage

### 📈 Performance

- TF-IDF caching: Vectors pré-calculés
- Lazy loading corpus: Chargé à première requête
- Query optimization: Mode fast pour requêtes simples

---

## v0.1.0 - Avril 2026 (Initial)

### Fonctionnalités initiales
- Interface chat simple
- RAG lexical basique
- API `/api/chat`, `/api/evidence`, `/api/corpus`
- Corpus initial (4 sources)
- Gouvernance basique (tiers crédibilité)
- Support OPENAI_API_KEY
- Synthèse locale sans LLM

---

## Roadmap futures versions

### v0.3.0 (Q3 2026)
- [ ] PostgreSQL + pgvector persistent embeddings
- [ ] PDF ingestion + OCR
- [ ] Dashboard admin corpus
- [ ] Webhooks Problem to Project Africa
- [ ] Multi-language (mooré, dioula)

### v0.4.0 (Q4 2026)
- [ ] Web scraper controlé + validation humaine
- [ ] Real-time collaboration source validation
- [ ] Mobile app (React Native)
- [ ] WhatsApp/SMS integration

### v1.0.0 (2027)
- [ ] Fine-tuning post-corpus large
- [ ] Marketplace sources (paiement contributeurs)
- [ ] Intégration ONG partenaires
- [ ] Support 10+ pays africains
