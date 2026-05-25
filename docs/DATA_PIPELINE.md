# Pipeline de donnees

## Etape actuelle

1. Corpus Markdown dans `data/corpus/` avec frontmatter YAML.
2. Chunking simple au chargement via `src/lib/rag/corpus.ts`.
3. Retrieval lexical via `src/lib/rag/retrieve.ts`.
4. Sorties API : `/api/chat`, `/api/evidence`, `/api/health`.

## Roadmap technique

| Phase | Action |
| --- | --- |
| Ingestion | Importer PDF institutionnels, archives locales et notes terrain vers Markdown annote |
| Qualite | Revue humaine par lot, labels d'erreurs, detection de biais |
| Embeddings | Ajouter recherche vectorielle avec pgvector ou service dedie |
| Versioning | Versionner corpus, schemas, prompts et politiques de source |
| Production | Exposer une API lecture seule pour les apps clientes |
| Fine-tuning | Lancer seulement apres volume, consentement et validation suffisants |

## Non-objectifs immediats

- Entrainement from scratch d'un tres grand modele.
- Indexation aveugle du web sans couche de confiance.

## Indicateurs

- Couverture par pays, secteur, langue et type de source.
- Part des reponses avec confiance au-dessus du seuil cible.
- Taux de citations effectivement utilisees dans les reponses.
