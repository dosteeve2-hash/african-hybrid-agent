# Gouvernance des connaissances

## Objectifs

- Reduire la dependance aux recits biaises en privilegiant un corpus versionne et des metadonnees de confiance.
- Separer clairement les extraits sources, la synthese modele et les avis utilisateur.
- Assumer l'incertitude : chaque `EvidencePack` inclut `uncertainty` avec confiance et raisons.

## Politique de sources

| Niveau `credibilityTier` | Interpretation |
| --- | --- |
| `official` | Source institutionnelle maintenue manuellement |
| `high` | ONG reconnue, partenaire, publication validee |
| `medium` | Notes internes ou syntheses de travail |
| `low` | Rappel methodologique, opinion ou contenu a contre-verifier |

Les scores numeriques sont des heuristiques. Une revue humaine reguliere reste necessaire avant un usage juridique, medical ou financier.

## Anti-biais operationnels

- Ne pas traiter le web comme verite implicite.
- Etiqueter les affirmations sans couverture corpus.
- Documenter provenance, date d'ingestion, licence et responsable de validation.
- Garder les contradictions visibles quand plusieurs sources divergent.

## Evolution

- Whitelist et blacklist de domaines pour une future recherche web controlee.
- Tracabilite des prompts et versions de corpus.
- Journal d'audit pour les validations humaines.
