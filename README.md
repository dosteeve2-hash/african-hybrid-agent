# Agent hybride africain (prototype)

Projet **distinct** de **Problem to Project Africa** : service autonome (API + interface minimale) centré perspectives africaines, corpus local vérifiable progressivement, réutilisable comme backend par P2P ou d'autres apps.

## Démarrage

```bash
cd "C:\Users\pc\Documents\New Project"
npm install
copy .env.example .env.local
npm run dev
```

- UI : `http://localhost:3000`
- Santé + taille du corpus : `GET http://localhost:3000/api/health`
- Chat : `POST http://localhost:3000/api/chat` avec `{ "messages": [{ "role": "user", "content": "..." }], "mode": "general" | "research" }`
- Evidence (pour Problem to Project Africa) : `POST http://localhost:3000/api/evidence` avec `{ "recommendationProfile": { ... } }` ou `{ "query": "..." }`. Optionnel : `Authorization: Bearer <AGENT_API_KEY>`.

Sans `OPENAI_API_KEY`, le prototype renvoie une **synthèse locale** à partir des fichiers `data/corpus/*.md` uniquement.

## Corpus (RAG)

Ajoute des fichiers Markdown dans `data/corpus/` avec un en-tête YAML optionnel :

```yaml
---
title: Mon titre
sourceType: government | ngo | community | reference
region: BF
credibilityTier: official | high | medium | low
---
```

## Intégration Problem to Project Africa

Depuis l'autre dépôt, appelle cette API en HTTP (URL de prod ou tunnel local). Contrat stable : `/api/chat` + `/api/health`.

## Suite

- Ingestion PDF institutionnels, embeddings, revue humaine.
- Couche « recherche web » avec filtre de crédibilité (après validation des politiques de source).
