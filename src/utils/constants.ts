import { PageKey, PillarKey } from "../types/greenfair";

export const PAGE_META: Array<{ key: PageKey; label: string; shortLabel: string }> = [
  { key: "overview", label: "Tableau de bord global", shortLabel: "Global" },
  { key: "country", label: "Analyse par pays", shortLabel: "Pays" },
  { key: "compare", label: "Comparaison", shortLabel: "Comparer" },
  { key: "tunisia", label: "Focus Tunisie", shortLabel: "Tunisie" },
  { key: "forecast", label: "Prévisions", shortLabel: "Prévisions" },
  { key: "clustering", label: "Clustering", shortLabel: "Clusters" },
  { key: "methodology", label: "Méthodologie", shortLabel: "Méthodo" }
];

export const PILLAR_LABELS: Record<PillarKey, string> = {
  environment: "Environnement",
  social: "Social",
  economy: "Economie"
};

export const PILLAR_COLORS: Record<PillarKey, string> = {
  environment: "#10b981",
  social: "#38bdf8",
  economy: "#f59e0b"
};

export const DATA_TYPE_LABELS: Record<string, string> = {
  observed: "Données observées",
  extrapolated_scenario: "Scénario extrapolé",
  projection_scenario: "Projection modèle"
};
