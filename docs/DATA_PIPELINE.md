# Pipeline de données — préparation futur LLM / base africaine

## Étape actuelle (prototype)

1. **Corpus Markdown** dans `data/corpus/` avec frontmatter YAML (`title`, `sourceType`, `region`, `credibilityTier`).
2. **Chunking** simple au chargement (`src/lib/rag/corpus.ts`).
3. **Retrieval** lexical (`src/lib/rag/retrieve.ts`) pour `/api/chat` et `/api/evidence`.

## Étapes suivantes (roadmap technique)

| Phase | Action |
|-------|--------|
| Ingestion | Scripts pour importer PDF institutionnels → texte brut → Markdown annoté |
| Qualité | Revue humaine par lot ; labels d’erreurs et de biais |
| Embeddings | Stockage embeddings + recherche vectorielle (pgvector, LiteLLM, ou service dédié) |
| Versioning | Git LFS ou registre d’artefacts pour corpus volumineux |
| Séparation prod | Base dédiée (« data center » logique) avec accès API lecture seule depuis l’agent |
| Fine-tuning | Uniquement après volume et validation suffisants ; avant ço : RAG + petit modèle |

## Non-objectifs immédiats

- Entraînement from scratch d’un très grand modèle de langage.
- Indexation aveugle du web sans couche de confiance.

## Indicateurs de qualité suggérés

- Couverture par pays / secteur dans le corpus.
- Part des réponses avec `uncertainty.confidence` au-dessus d’un seuil cible.
- Taux de citations utilisées dans les réponses finales (P2P + agent).
