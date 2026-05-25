/**
 * Construit une requete texte pour retrieval a partir d'un profil
 * compatible Problem to Project Africa. Les champs sont volontairement souples.
 */

export type RecommendationProfilePayload = {
  country?: string;
  region?: string;
  mode?: string;
  level?: string;
  domain?: string;
  skills?: string[];
  preferredSector?: string;
  timePerWeek?: string;
  goal?: string;
  projectPreference?: string;
  idea?: string;
  observedProblem?: string;
  constraints?: string;
  resources?: string;
  audience?: string;
  language?: string;
};

export type QueryContext = {
  primaryFocus: string; // Le besoin principal
  secondaryTopics: string[]; // Sujets connexes
  geographicContext: string; // Région de focus
  trustLevel: "official" | "high" | "medium"; // Préférence de fiabilité
  raw: string; // Requête construite brute
};

/**
 * Analyse le profil pour extraire le contexte principal et construire une requête optimisée
 */
export function analyzeProfile(profile: RecommendationProfilePayload): QueryContext {
  // Déterminer le focus principal
  let primaryFocus = profile.observedProblem || profile.idea || profile.goal || "entrepreneuriat";

  // Secteur si fourni
  if (profile.preferredSector) {
    primaryFocus = `${profile.preferredSector}: ${primaryFocus}`;
  }

  // Topics secondaires
  const secondaryTopics: string[] = [];
  if (profile.skills?.length) {
    secondaryTopics.push(...profile.skills);
  }
  if (profile.domain) {
    secondaryTopics.push(profile.domain);
  }
  if (profile.level) {
    secondaryTopics.push(`niveau ${profile.level}`);
  }

  // Contexte géographique
  let geographicContext = profile.country || "Afrique";
  if (profile.region) {
    geographicContext = `${profile.region}, ${geographicContext}`;
  }

  // Déterminer le niveau de confiance attendu
  const trustLevel: "official" | "high" | "medium" =
    profile.constraints?.includes("juridique") || profile.constraints?.includes("financier")
      ? "official"
      : profile.constraints?.includes("terrain")
        ? "high"
        : "medium";

  // Construire la requête brute
  const parts: string[] = [];
  parts.push(primaryFocus);
  if (secondaryTopics.length > 0) {
    parts.push(`competences: ${secondaryTopics.join(", ")}`);
  }
  parts.push(`contexte: ${geographicContext}`);
  if (profile.goal) {
    parts.push(`pour: ${profile.goal}`);
  }
  if (profile.resources) {
    parts.push(`ressources: ${profile.resources}`);
  }
  if (profile.constraints) {
    parts.push(`contraintes: ${profile.constraints}`);
  }

  return {
    primaryFocus,
    secondaryTopics,
    geographicContext,
    trustLevel,
    raw: parts.join("; "),
  };
}

/**
 * Construit une requête texte optimisée pour la recherche
 */
export function buildRetrievalQuery(profile: RecommendationProfilePayload): string {
  const context = analyzeProfile(profile);
  return context.raw || "Burkina Faso entrepreneuriat contexte local";
}

/**
 * Extrait la région pour booster la recherche géographique
 */
export function extractRegionBoost(profile: RecommendationProfilePayload): string | undefined {
  if (profile.region) {
    // Normaliser les codes pays
    const regionMap: Record<string, string> = {
      "Burkina": "BF",
      "Burkina Faso": "BF",
      "Mali": "ML",
      "Senegal": "SN",
      "Côte d'Ivoire": "CI",
      "Ghana": "GH",
      "Nigeria": "NG",
      "Cameroun": "CM",
      "Kenya": "KE",
      "Uganda": "UG",
      "Rwanda": "RW",
      "Tanzania": "TZ",
      "Ethiopia": "ET",
      "South Africa": "ZA",
    };
    return regionMap[profile.region] || profile.region;
  }
  if (profile.country) {
    const countryMap: Record<string, string> = {
      "Burkina Faso": "BF",
      "Mali": "ML",
      "Senegal": "SN",
      "Côte d'Ivoire": "CI",
      "Ghana": "GH",
      "Nigeria": "NG",
      "Cameroun": "CM",
      "Kenya": "KE",
      "Uganda": "UG",
      "Rwanda": "RW",
      "Tanzania": "TZ",
      "Ethiopia": "ET",
      "South Africa": "ZA",
    };
    return countryMap[profile.country];
  }
  return undefined;
}
