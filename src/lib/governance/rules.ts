/**
 * Regles produit : contre-biais, incertitude, sources.
 * Complete par docs/GOVERNANCE.md.
 */

/** Si la confiance evidence globale est sous ce seuil, on expose un avertissement cote consommateur. */
export const MIN_EVIDENCE_CONFIDENCE_WARNING = 0.35;

/** Seuil minimal relatif pour afficher "preuves faibles" dans les metadonnees hybrides. */
export const MIN_AVG_RELIABILITY_WARNING = 45;

/** Domaines ou motifs institutionnels prioritaires pour une future whitelist. */
export const PREFERRED_SOURCE_HINTS = [
  ".gov.",
  "institut",
  "minister",
  "universit",
  "banque mondiale",
  "BAD",
] as const;

export const GOVERNANCE_SUMMARY_FR = `
Principes:
1. Priorite aux realites locales et aux sources verifiables.
2. Ne pas presenter les angles mediatiques lointains comme des faits du terrain.
3. Afficher l'incertitude quand le corpus ou les preuves sont insuffisants.
4. Les extraits RAG sont des matieres premieres, pas des conclusions definitives sans validation humaine periodique.
`.trim();
