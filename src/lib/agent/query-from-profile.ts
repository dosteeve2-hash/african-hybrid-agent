/**
 * Construit une requête texte pour retrieval à partir d’un profil
 * compatible Problem to Project Africa (clés optionnelles tolérées).
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
};

export function buildRetrievalQuery(profile: RecommendationProfilePayload): string {
  const parts: string[] = [];
  if (profile.country) parts.push(`Pays: ${profile.country}`);
  if (profile.region) parts.push(`Région: ${profile.region}`);
  if (profile.mode) parts.push(`Mode: ${profile.mode}`);
  if (profile.preferredSector) parts.push(`Secteur: ${profile.preferredSector}`);
  if (profile.domain) parts.push(`Domaine: ${profile.domain}`);
  if (profile.skills?.length) parts.push(`Compétences: ${profile.skills.join(", ")}`);
  if (profile.goal) parts.push(`Objectif: ${profile.goal}`);
  if (profile.observedProblem) parts.push(`Problème observé: ${profile.observedProblem}`);
  if (profile.idea) parts.push(`Idée: ${profile.idea}`);
  if (profile.constraints) parts.push(`Contraintes: ${profile.constraints}`);
  return parts.join(". ") || "Burkina Faso entrepreneuriat contexte local";
}
