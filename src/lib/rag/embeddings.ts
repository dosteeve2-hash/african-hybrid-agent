/**
 * Embeddings simples basés sur TF-IDF et recherche sémantique légère
 * Permet une récupération plus intelligente sans dépendre d'un modèle externe
 */

export type TextVector = {
  text: string;
  vector: number[];
  normalizedVector: number[];
  keywords: string[];
};

// Dictionnaire de synonymes africains/français pour améliorer la sémantique
const SEMANTIC_SYNONYMS: Record<string, string[]> = {
  entrepreneuriat: ["business", "creation", "projet", "entreprise", "startup", "initiative"],
  agriculture: ["farming", "culture", "recolte", "semence", "agro", "agroecologie", "zai"],
  agroecologie: ["agriculture", "zai", "demi-lune", "productivite"],
  education: ["formation", "ecole", "apprentissage", "enseignement", "savoir"],
  gouvernance: ["gestion", "administration", "politique", "direction", "leadership"],
  jeune: ["jeunesse", "youth", "adolescent", "enfant", "futur"],
  femme: ["femmes", "feminin", "genre", "egalite", "female", "girl"],
  femmes: ["femme", "feminin", "genre", "egalite", "female", "girl"],
  technologie: ["digital", "tech", "numerique", "innovation"],
  numerique: ["digital", "tech", "technologie", "innovation"],
  eau: ["hydrologie", "ressource", "irrigation", "sante", "hygiene"],
  sante: ["medecin", "maladie", "health", "hygiene", "soins"],
  climat: ["environnement", "meteo", "secheresse", "weather", "ecologie"],
};

function normalizeText(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

export function tokenize(text: string, minLen = 3): string[] {
  const FRENCH_STOP = new Set([
    "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "à", "au", "aux",
    "pour", "par", "sur", "dans", "est", "son", "sa", "ses", "ce", "cette", "ces",
    "qui", "que", "dont", "avec", "sans", "plus", "moins", "très", "comme",
    "the", "and", "or", "of", "to", "a", "an", "in", "on", "for", "with", "is",
  ]);

  return normalizeText(text)
    .split(/[^a-zA-ZÀ-ÿ0-9]+/)
    .filter((w) => w.length >= minLen && !FRENCH_STOP.has(w));
}

export function buildTFIDFVector(
  text: string,
  allTexts: string[],
): TextVector {
  const tokens = tokenize(text);
  const vocabulary = Array.from(
    new Set([...allTexts.flatMap((doc) => tokenize(doc)), ...tokens]),
  ).sort();

  // TF (Term Frequency) - fréquence des termes dans ce document
  const tf: Record<string, number> = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  // IDF (Inverse Document Frequency) - dans combien de documents ce terme apparaît
  const idf: Record<string, number> = {};
  for (const token of vocabulary) {
    let docsWithToken = 0;
    for (const doc of allTexts) {
      if (tokenize(doc).includes(token)) {
        docsWithToken++;
      }
    }
    idf[token] = Math.log((allTexts.length + 1) / (1 + docsWithToken)) + 1;
  }

  // TF-IDF score pour chaque token
  const vector: number[] = vocabulary.map((token) => {
    return (tf[token] || 0) * (idf[token] || 0);
  });

  // Normalisation L2
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  const normalizedVector = magnitude > 0 ? vector.map((v) => v / magnitude) : vector;

  return {
    text,
    vector,
    normalizedVector,
    keywords: tokens.slice(0, 10), // Top 10 mots clés
  };
}

export function cosineSimilarity(v1: number[], v2: number[]): number {
  const len = Math.min(v1.length, v2.length);
  if (len === 0) return 0;

  let dot = 0;
  let mag1 = 0;
  let mag2 = 0;
  for (let i = 0; i < len; i++) {
    const a = v1[i] || 0;
    const b = v2[i] || 0;
    dot += a * b;
    mag1 += a * a;
    mag2 += b * b;
  }
  const denom = Math.sqrt(mag1) * Math.sqrt(mag2);
  if (denom === 0) return 0;
  return Math.max(0, Math.min(1, dot / denom));
}

/**
 * Enrichit les tokens avec des synonymes sémantiques
 */
export function expandWithSynonyms(tokens: string[]): string[] {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    const syns = SEMANTIC_SYNONYMS[normalizeText(token)];
    if (syns) {
      syns.forEach((s) => expanded.add(normalizeText(s)));
    }
  }
  return Array.from(expanded);
}

/**
 * Calcule un score de pertinence basé sur:
 * - Similarité textuelle TF-IDF
 * - Présence de synonymes
 * - Proximité de régions géographiques
 */
export function computeRelevanceScore(
  query: string,
  documentText: string,
  docMeta?: { region?: string; credibilityScore?: number },
  queryRegion?: string,
): number {
  const queryTokens = tokenize(query);
  const expandedQuery = expandWithSynonyms(queryTokens);
  const docTokens = tokenize(documentText);

  // Score de correspondance lexicale
  let lexicalScore = 0;
  for (const token of expandedQuery) {
    if (docTokens.includes(token)) {
      lexicalScore++;
    }
  }
  lexicalScore = Math.min(1, lexicalScore / expandedQuery.length);

  // Score de proximité géographique
  let regionScore = 0;
  if (queryRegion && docMeta?.region) {
    regionScore = queryRegion === docMeta.region ? 0.2 : -0.1;
  }

  // Score de crédibilité
  const credScore = (docMeta?.credibilityScore ?? 60) / 100;

  // Score final: combinaison pondérée
  return 0.6 * lexicalScore + 0.2 * credScore + 0.2 * Math.max(0, regionScore);
}
