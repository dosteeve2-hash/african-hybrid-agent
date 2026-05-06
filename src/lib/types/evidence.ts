/**
 * Paquet de preuves renvoyé par l’agent hybride (corpus local ;
 * extension future : URL web + cache avec validation).
 */

export type EvidenceTag =
  | "burkina"
  | "entrepreneuriat"
  | "legal"
  | "sector"
  | "culture"
  | "general";

export type EvidenceSourceKind =
  | "corpus_markdown"
  | "web"
  | "institutional_pdf"
  | "user_validated";

/** Une entrée de preuve vérifiable */
export type EvidenceItem = {
  id: string;
  /** Texte court ou titre affichable */
  label: string;
  /** Extrait ou résumé sourcé */
  excerpt: string;
  /** Fiabilité 0–100 (politique corpus + tier métadonnées) */
  reliabilityScore: number;
  /** Tags pour filtrage / analytics */
  tags: EvidenceTag[];
  /** Horodatage de récupération côté agent */
  retrievedAt: string;
  /** Référence fichier corpus ou URL si disponible */
  sourceRef?: string;
  sourceKind: EvidenceSourceKind;
  /** Id chunk corpus si applicable */
  corpusChunkId?: string;
};

export type EvidenceUncertainty = {
  /** Confiance globale agrégée 0–1 */
  confidence: number;
  /** Raisons possibles : corpus vide, score faible, contradiction */
  reasons: string[];
};

export type EvidencePack = {
  schemaVersion: "1.0";
  generatedAt: string;
  /** Requête ou contexte utilisé pour la recherche */
  querySummary: string;
  items: EvidenceItem[];
  uncertainty: EvidenceUncertainty;
};
