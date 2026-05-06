/**
 * Règles produit — contre-biais, incertitude, sources.
 * Complété par docs/GOVERNANCE.md
 */

/** Si la confiance evidence globale est sous ce seuil, on expose un avertissement côté consommateur */
export const MIN_EVIDENCE_CONFIDENCE_WARNING = 0.35;

/** Seuil minimal relatif pour afficher « preuves faibles » dans les métadonnées hybrides */
export const MIN_AVG_RELIABILITY_WARNING = 45;

/** Domaines ou motifs institutionnels prioritaires pour futures whitelist (.gov.bf, etc.) */
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
1. Priorité aux réalités locales et aux sources vérifiables.
2. Ne pas présenter les angles médiatiques lointains comme des faits du terrain.
3. Afficher l'incertitude quand le corpus ou les preuves sont insuffisants.
4. Les extraits RAG sont des matières premières, pas des conclusions définitives sans validation humaine périodique.
`.trim();
