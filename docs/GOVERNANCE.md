# Gouvernance des connaissances (agent hybride africain)

## Objectifs

- Réduire la **dépendance aux récits biaisés** (moteurs de recherche, médias lointains) en privilégiant un **corpus versionné** et des métadonnées de confiance.
- **Séparer** clairement : extraits sources, synthèse modèle, avis utilisateur.
- **Assumer l’incertitude** : chaque `EvidencePack` inclut `uncertainty` (confiance, raisons).

## Politique de sources (niveaux)

| Niveau `credibilityTier` (fichiers `data/corpus`) | Interprétation |
|----------------------------------------------------|----------------|
| `official` | Texte issu ou calqué sur source institutionnelle (à maintenir manuellement) |
| `high` | ONG reconnue, partenaire, publication validée |
| `medium` | Notes internes, synthèses de travail |
| `low` | Rappels méthodologiques, opinions, contenu à contre-vérifier |

Les scores numériques sont des **heuristiques** ; une revue humaine régulière reste nécessaire avant usage juridique ou médical.

## Anti-biais opérationnels

- Pas de « vérité » implicite du web sans citation dans une future couche recherche.
- Refuser ou étiqueter fortement les affirmations sans couverture corpus (voir seuils dans `src/lib/governance/rules.ts`).
- Documenter les jeux de données : provenance, date d’ingestion, licence.

## Évolution

- Whitelist / blacklist par domaine pour une future recherche web contrôlée.
- Traçabilité des prompts et versions de corpus (voir `docs/DATA_PIPELINE.md`).
