/**
 * BM25 retrieval engine with African multilingual synonym expansion.
 * BM25 outperforms TF-IDF via length normalization and term saturation.
 */

// ── Constants ────────────────────────────────────────────────────────────────
const BM25_K1 = 1.5;
const BM25_B = 0.75;

// ── Multilingual African synonym dictionary ──────────────────────────────────
export const AFRICAN_SYNONYMS: Record<string, string[]> = {
  // Agriculture / Agroécologie
  agriculture: ["farming", "culture", "recolte", "semence", "agro", "agroecologie", "zai", "cultivation"],
  agroecologie: ["agriculture", "zai", "demi-lune", "productivite", "ecologie", "durable"],
  semence: ["graine", "seed", "variete", "plantation"],
  irrigation: ["eau", "arrosage", "pompe", "canal", "barrage"],
  // Bambara (Mali)
  "so": ["maison", "famille", "foyer"],
  "jiri": ["arbre", "bois", "foret"],
  "sene": ["agriculture", "champ", "culture"],
  // Mooré (Burkina Faso)
  "pugsore": ["paysan", "agriculteur", "cultivateur"],
  "zaka": ["maison", "famille", "village"],
  "naab": ["chef", "roi", "autorite"],
  // Wolof (Sénégal)
  "xam-xam": ["connaissance", "savoir", "education"],
  "liggey": ["travail", "emploi", "activite"],
  "ndey": ["mere", "femme", "famille"],
  // Hausa (Niger/Nigeria)
  "noma": ["agriculture", "farming", "culture"],
  "kasuwanci": ["commerce", "business", "marche"],
  "ilimi": ["education", "ecole", "formation"],

  // Entrepreneuriat & Finance
  entrepreneuriat: ["business", "creation", "projet", "entreprise", "startup", "initiative", "commerce"],
  microfinance: ["tontine", "credit", "epargne", "financement", "pret"],
  tontine: ["epargne", "credit", "microfinance", "collecte", "financement"],
  startup: ["entreprise", "innovation", "technologie", "projet"],

  // Gouvernance & Social
  gouvernance: ["gestion", "administration", "politique", "direction", "leadership", "decentralisation"],
  decentralisation: ["commune", "municipal", "gouvernance", "locale"],
  communaute: ["village", "quartier", "association", "groupe", "collectif"],

  // Jeunesse & Education
  jeune: ["jeunesse", "youth", "adolescent", "etudiant", "futur"],
  education: ["formation", "ecole", "apprentissage", "enseignement", "savoir", "universite"],
  emploi: ["travail", "job", "metier", "activite", "liggey", "noma"],

  // Genre
  femme: ["femmes", "feminin", "genre", "egalite", "female", "girl", "mere"],
  genre: ["femme", "homme", "egalite", "equite", "droits"],

  // Technologie & Numérique
  technologie: ["digital", "tech", "numerique", "innovation", "internet"],
  numerique: ["digital", "tech", "technologie", "innovation", "mobile", "internet"],
  mobile: ["telephone", "smartphone", "sms", "numerique"],

  // Environnement & Eau
  eau: ["hydrologie", "ressource", "irrigation", "hygiene", "assainissement", "pompe"],
  sante: ["medecin", "maladie", "health", "hygiene", "soins", "hopital"],
  climat: ["environnement", "meteo", "secheresse", "weather", "ecologie", "changement"],
  secheresse: ["aridite", "desertification", "climat", "eau"],

  // Energie
  energie: ["electricite", "solaire", "renouvelable", "panneau", "bioenergie"],
  solaire: ["panneaux", "photovoltaique", "energie", "electricite"],

  // Pêche
  peche: ["poisson", "aquaculture", "filet", "pirogue", "lac", "fleuve", "mer"],
  aquaculture: ["peche", "elevage", "poisson", "etang"],
};

export const STOP_WORDS = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "à", "au", "aux",
  "pour", "par", "sur", "dans", "est", "son", "sa", "ses", "ce", "cette", "ces",
  "qui", "que", "dont", "avec", "sans", "plus", "moins", "très", "comme", "mais",
  "donc", "car", "ni", "ne", "pas", "plus", "il", "elle", "ils", "elles", "on",
  "nous", "vous", "me", "te", "se", "lui", "leur", "en", "y", "cela", "ça",
  "the", "and", "or", "of", "to", "a", "an", "in", "on", "for", "with", "is",
  "are", "was", "were", "be", "been", "by", "at", "from", "this", "that", "it",
]);

// ── Tokenization ─────────────────────────────────────────────────────────────

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-zA-ZÀ-ÿ0-9'-]+/)
    .map((w) => w.replace(/^[-']+|[-']+$/g, ""))
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

export function expandWithSynonyms(tokens: string[]): string[] {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    const syns = AFRICAN_SYNONYMS[token];
    if (syns) {
      for (const s of syns) expanded.add(s);
    }
    // Also check if any synonym key starts with this token (prefix matching)
    for (const [key, values] of Object.entries(AFRICAN_SYNONYMS)) {
      if (key.startsWith(token) && key !== token) {
        expanded.add(key);
        values.forEach((v) => expanded.add(v));
      }
    }
  }
  return Array.from(expanded);
}

// ── BM25 Index ───────────────────────────────────────────────────────────────

export type BM25Document = {
  id: string;
  tokens: string[];
  tf: Map<string, number>;
  length: number;
};

export type BM25Index = {
  documents: BM25Document[];
  df: Map<string, number>;
  avgDocLength: number;
  N: number;
  builtAt: Date;
};

export function buildBM25Index(docs: Array<{ id: string; text: string }>): BM25Index {
  const documents: BM25Document[] = [];
  const df = new Map<string, number>();
  let totalLength = 0;

  for (const doc of docs) {
    const tokens = tokenize(doc.text);
    const tf = new Map<string, number>();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }
    documents.push({ id: doc.id, tokens, tf, length: tokens.length });
    totalLength += tokens.length;

    // Document frequency
    for (const term of tf.keys()) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }

  return {
    documents,
    df,
    avgDocLength: documents.length > 0 ? totalLength / documents.length : 0,
    N: documents.length,
    builtAt: new Date(),
  };
}

export function bm25Score(
  queryTokens: string[],
  doc: BM25Document,
  index: BM25Index,
): number {
  let score = 0;
  for (const term of queryTokens) {
    const df = index.df.get(term) ?? 0;
    if (df === 0) continue;

    const idf = Math.log((index.N - df + 0.5) / (df + 0.5) + 1);
    const tf = doc.tf.get(term) ?? 0;
    const normTf =
      (tf * (BM25_K1 + 1)) /
      (tf + BM25_K1 * (1 - BM25_B + BM25_B * (doc.length / index.avgDocLength)));

    score += idf * normTf;
  }
  return score;
}

// ── Credibility & geo boost ───────────────────────────────────────────────────

export function credibilityBoost(tier: "official" | "high" | "medium" | "low"): number {
  switch (tier) {
    case "official": return 1.3;
    case "high": return 1.15;
    case "medium": return 1.0;
    case "low": return 0.8;
  }
}

export function geoBoost(docRegions: string[], targetRegion?: string): number {
  if (!targetRegion || docRegions.length === 0) return 1.0;
  if (docRegions.some((r) => r.toUpperCase() === targetRegion.toUpperCase())) return 1.25;

  // Sub-region boost: same continent area
  const westAfrica = new Set(["BF", "ML", "SN", "GN", "CI", "TG", "BJ", "NE", "MR", "GW", "NG", "GH", "SL", "LR", "GM"]);
  const eastAfrica = new Set(["KE", "TZ", "ET", "UG", "RW", "BI", "SS", "SO", "ER", "DJ"]);
  const region = (r: string) => {
    if (westAfrica.has(r)) return "west";
    if (eastAfrica.has(r)) return "east";
    return "other";
  };
  const docZone = docRegions.map(region).find((z) => z !== "other") ?? "other";
  const targetZone = region(targetRegion.toUpperCase());
  return docZone !== "other" && docZone === targetZone ? 1.1 : 1.0;
}

// ── Cosine similarity (supports both number[] and Map) ───────────────────────

export function cosineSimilarity(
  a: number[] | Map<string, number>,
  b: number[] | Map<string, number>,
): number {
  if (Array.isArray(a) && Array.isArray(b)) {
    const len = Math.min(a.length, b.length);
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < len; i++) {
      dot += (a[i] ?? 0) * (b[i] ?? 0);
      magA += (a[i] ?? 0) ** 2;
      magB += (b[i] ?? 0) ** 2;
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : Math.max(0, Math.min(1, dot / denom));
  }
  const mapA = a instanceof Map ? a : new Map((a as number[]).map((v, i) => [String(i), v]));
  const mapB = b instanceof Map ? b : new Map((b as number[]).map((v, i) => [String(i), v]));
  let dot = 0, magA = 0, magB = 0;
  for (const [k, va] of mapA) {
    const vb = mapB.get(k) ?? 0;
    dot += va * vb;
    magA += va * va;
  }
  for (const vb of mapB.values()) magB += vb * vb;
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : Math.max(0, Math.min(1, dot / denom));
}

// ── Legacy TF-IDF (backward compatibility for vectors.ts and scripts) ─────────

export type TextVector = {
  text: string;
  vector: number[];
  normalizedVector: number[];
  keywords: string[];
};

export function buildTFIDFVector(text: string, allTexts: string[]): TextVector {
  const tokens = tokenize(text);
  const vocabulary = Array.from(
    new Set([...allTexts.flatMap((d) => tokenize(d)), ...tokens]),
  ).sort();

  const tf: Record<string, number> = {};
  for (const t of tokens) tf[t] = (tf[t] ?? 0) + 1;

  const idf: Record<string, number> = {};
  for (const term of vocabulary) {
    const count = allTexts.filter((d) => tokenize(d).includes(term)).length;
    idf[term] = Math.log((allTexts.length + 1) / (1 + count)) + 1;
  }

  const vector = vocabulary.map((t) => (tf[t] ?? 0) * (idf[t] ?? 0));
  const mag = Math.sqrt(vector.reduce((s, v) => s + v * v, 0));
  const normalizedVector = mag > 0 ? vector.map((v) => v / mag) : vector;

  return { text, vector, normalizedVector, keywords: tokens.slice(0, 10) };
}
