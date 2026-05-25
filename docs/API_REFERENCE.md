# API Reference - Agent Hybride Africain v0.2

## Endpoints disponibles

### 1. POST `/api/chat` - Chat conversationnel

Envoyez des messages et recevez des réponses intelligentes basées sur le corpus local.

#### Requête

```json
{
  "messages": [
    { "role": "user", "content": "Comment faire entrepreneuriat au Burkina?" }
  ],
  "mode": "general",
  "searchMode": "semantic",
  "boostRegion": "BF",
  "maxCitations": 6
}
```

#### Paramètres

| Param | Type | Défaut | Description |
| --- | --- | --- | --- |
| `messages[]` | Array | **requis** | Historique du chat. Chaque message: `{ role: "user"|"assistant", content: string }` |
| `mode` | string | `"general"` | `"general"` ou `"research"` (structure plus rigoureuse) |
| `searchMode` | string | `"semantic"` | `"semantic"` (TF-IDF + synonymes) ou `"fast"` (lexical simple) |
| `boostRegion` | string | - | Code région pour priorité géographique: `"BF"`, `"ML"`, `"SN"`, etc. |
| `maxCitations` | number | `6` | Nombre d'extraits à récupérer du corpus |

#### Réponse

```json
{
  "reply": "Réponse textuelle...",
  "citations": [
    {
      "id": "chunk-id",
      "sourceFile": "nom-fichier.md",
      "excerpt": "...",
      "credibilityScore": 85,
      "sourceType": "ngo",
      "region": "BF",
      "title": "Titre source"
    }
  ],
  "providerUsed": "openai-compatible|local-synthesis",
  "mode": "general|research",
  "confidence": 0.75,
  "warnings": [],
  "agentSteps": ["Étape 1...", "Étape 2..."]
}
```

---

### 2. POST `/api/evidence` - Evidence Pack (Paquet de preuves)

Récupère les preuves les plus fiables pour une requête ou un profil Problem to Project Africa.

#### Requête Option A: Requête libre

```json
{
  "query": "Entrepreneuriat femmes secteur transformation alimentaire Burkina",
  "maxItems": 10,
  "minReliability": 0,
  "searchMode": "semantic"
}
```

#### Requête Option B: Profil P2P

```json
{
  "recommendationProfile": {
    "country": "Burkina Faso",
    "region": "Ouagadougou",
    "preferredSector": "agriculture",
    "skills": ["vente", "organisation"],
    "observedProblem": "jeunes compétents mais pas de cadrage projet",
    "constraints": "budget faible"
  },
  "maxItems": 8,
  "boostRegion": "BF"
}
```

#### Paramètres

| Param | Type | Défaut | Description |
| --- | --- | --- | --- |
| `query` | string | - | Texte libre de recherche |
| `recommendationProfile` | Object | - | Profil P2P (alternative à `query`) |
| `maxItems` | number | `10` | Nombre d'items à retourner |
| `minReliability` | number | `0` | Score minimum fiabilité (0-100) |
| `searchMode` | string | `"semantic"` | Mode recherche: `"semantic"` ou `"fast"` |
| `boostRegion` | string | - | Code région pour boost géo |

#### Réponse

```json
{
  "schemaVersion": "1.0",
  "generatedAt": "2026-05-11T10:30:00Z",
  "querySummary": "...",
  "items": [
    {
      "id": "ev-chunk-0",
      "label": "Titre source",
      "excerpt": "...",
      "reliabilityScore": 85,
      "tags": ["burkina", "entrepreneuriat"],
      "retrievedAt": "2026-05-11T10:30:00Z",
      "sourceRef": "fichier.md",
      "sourceKind": "corpus_markdown",
      "corpusChunkId": "chunk-id"
    }
  ],
  "uncertainty": {
    "confidence": 0.78,
    "reasons": []
  }
}
```

---

### 3. GET `/api/corpus` - Audit du corpus

Liste tous les fichiers du corpus avec métadonnées et statistiques.

#### Réponse

```json
{
  "totalSources": 8,
  "totalChunks": 256,
  "sources": [
    {
      "sourceFile": "entrepreneuriat-femmes.md",
      "title": "Entrepreneuriat des femmes",
      "sourceType": "ngo",
      "region": "BF",
      "credibilityScore": 85,
      "credibilityLabel": "source solide",
      "chunks": 32
    }
  ]
}
```

---

### 4. GET `/api/audit?component=&level=&lastN=50` - Logs d'audit

**⚠️ Développement seulement** - Récupère les logs d'audit interne.

#### Query Parameters

| Param | Type | Description |
| --- | --- | --- |
| `component` | string | Filtrer: `"retrieval"`, `"agent"`, `"evidence"` |
| `level` | string | Filtrer: `"info"`, `"warning"`, `"error"` |
| `lastN` | number | Nombre dernier logs (défaut 50) |

#### Réponse

```json
{
  "totalLogs": 5,
  "logs": [
    {
      "timestamp": "2026-05-11T10:30:00Z",
      "level": "info",
      "component": "retrieval",
      "action": "search_executed",
      "data": {
        "queryText": "...",
        "mode": "semantic",
        "retrievedChunkIds": ["chunk-0", "chunk-1"],
        "executionTimeMs": 42
      }
    }
  ]
}
```

---

### 5. GET `/api/health` - Santé du service

Vérifie l'état du service.

#### Réponse

```json
{
  "status": "ok",
  "timestamp": "2026-05-11T10:30:00Z",
  "version": "0.2.0",
  "corpusReady": true,
  "llmConfigured": true
}
```

---

## Exemples d'utilisation

### Exemple 1: Chat simple

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Quels sont les défis entrepreneuriat jeunes au Burkina?" }
    ],
    "mode": "general"
  }'
```

### Exemple 2: Evidence Pack pour profil P2P

```javascript
const response = await fetch("http://localhost:3000/api/evidence", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    recommendationProfile: {
      country: "Burkina Faso",
      preferredSector: "agriculture",
      skills: ["organisation", "vente"],
      observedProblem: "Productivité faible, besoins techniques",
      constraints: "Budget <1M FCFA, accès eau limité"
    },
    maxItems: 8
  })
});
const pack = await response.json();
console.log(`Confiance: ${(pack.uncertainty.confidence * 100).toFixed(0)}%`);
pack.items.forEach(item => {
  console.log(`- ${item.label} [${item.reliabilityScore}]`);
});
```

### Exemple 3: Recherche mode recherche rigoureux

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Décris les modèles de gouvernance locale Burkina avec sources primaires" }
    ],
    "mode": "research",
    "searchMode": "semantic",
    "boostRegion": "BF",
    "maxCitations": 8
  }'
```

---

## Codes de région

Utilisez ces codes pour `boostRegion`:

| Code | Pays |
| --- | --- |
| `BF` | Burkina Faso |
| `ML` | Mali |
| `SN` | Sénégal |
| `CI` | Côte d'Ivoire |
| `GH` | Ghana |
| `NG` | Nigeria |
| `CM` | Cameroun |
| `KE` | Kenya |
| `UG` | Uganda |
| `RW` | Rwanda |
| `TZ` | Tanzania |
| `ET` | Ethiopia |
| `ZA` | South Africa |

---

## Authentification

Si `AGENT_API_KEY` est définie, protégez `/api/evidence` avec Bearer token:

```bash
curl -X POST http://localhost:3000/api/evidence \
  -H "Authorization: Bearer votre_clé_api" \
  -H "Content-Type: application/json" \
  -d '{ "query": "..." }'
```

---

## Modes de recherche

### `semantic` (défaut, recommandé)
- **Algorithme**: TF-IDF + similarité cosinus + synonymes
- **Avantages**: Capture sens, pas juste mots clés
- **Cas d'usage**: Recherches complexes, profils P2P, mode recherche

### `fast`
- **Algorithme**: Tokenisation lexicale simple
- **Avantages**: Rapide, faible latence
- **Cas d'usage**: Requêtes simples, applications temps-réel

---

## Niveaux de confiance des sources

| Tier | Score | Interprétation |
| --- | --- | --- |
| `official` | 95 | Source institutionnelle vérifiée |
| `high` | 85 | ONG partenaire, publication validée |
| `medium` | 65 | Notes internes, travaux en cours |
| `low` | 40 | Opinion, à contre-vérifier |

---

## Erreurs courantes

### `"Corpus vide: ajouter fichiers dans data/corpus"`
→ Ajoutez des fichiers `.md` avec frontmatter YAML dans `data/corpus/`

### `"Aucune OPENAI_API_KEY"`
→ Service fonctionne toujours en synthèse locale, moins puissant

### `"HTTP 401: Unauthorized"`
→ Vérifiez `Authorization: Bearer ...` si `AGENT_API_KEY` défini

### `"Faible recouvrement lexical"`
→ Corpus petit ou requête trop spécifique. Ajoutez plus de sources ou simplifiez.

---

## Performance

- **Recherche corpus**: ~20-50ms (semantic), ~5-15ms (fast)
- **LLM appel**: 1-3s (selon modèle et contexte)
- **Evidence Pack**: ~50-150ms
- **Audit logs**: <1ms (en mémoire)

---

## Développement et test

Accédez à la page de test interactive: `http://localhost:3000/test`

Récupérez logs audit: `GET /api/audit?lastN=20&level=info`
