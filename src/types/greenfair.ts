export type PageKey =
  | "overview"
  | "country"
  | "compare"
  | "tunisia"
  | "forecast"
  | "clustering"
  | "methodology";

export type PillarKey = "environment" | "social" | "economy";

export interface CountryMeta {
  code: string;
  name: string;
}

export interface IndicatorMeta {
  code: string;
  label: string;
  pillar: PillarKey;
  direction: "positive" | "negative";
  unit: string;
}

export interface YearMeta {
  year: number;
  dataType: "observed" | "extrapolated_scenario" | "projection_scenario";
}

export interface ScoreRow {
  countryCode: string;
  country: string;
  year: number;
  dataType: YearMeta["dataType"];
  greenfairScore: number;
  level: string;
  pillarScores: Record<PillarKey, number>;
}

export interface LatestScoreRow {
  countryCode: string;
  country: string;
  rank: number;
  greenfairScore: number;
  level: string;
  pillarScores: Record<PillarKey, number>;
  strongestPillar: PillarKey;
  weakestPillar: PillarKey;
  cluster: number;
  forecast2026: {
    year: number;
    score: number;
    variation: number;
    level: string;
  };
  projection2030: {
    year: number;
    score: number;
    variation: number;
    level: string;
  };
  recommendations: string[];
}

export interface ProjectionRow {
  country: string;
  countryCode: string;
  year: number;
  referenceYear: number;
  referenceScore: number;
  score: number;
  variation: number;
  level: string;
  dataType?: YearMeta["dataType"];
}

export interface ClusterRow {
  country: string;
  countryCode: string;
  cluster: number;
  clusterLabel: string;
  pc1: number;
  pc2: number;
}

export interface ModelComparisonRow {
  id: string;
  label: string;
  purpose: string;
  notes: string;
  mae: number;
  rmse: number;
  r2: number;
}

export interface GreenfairData {
  metadata: {
    generatedAt: string;
    sourceNotebook: string;
    dataSource: string;
    securityNotice: string;
  };
  countries: CountryMeta[];
  indicators: IndicatorMeta[];
  pillars: Array<{ id: PillarKey; label: string; weight: number; color: string }>;
  weights: Record<PillarKey, number>;
  negativeIndicators: string[];
  years: YearMeta[];
  yearlyScores: ScoreRow[];
  latestScores: LatestScoreRow[];
  rankings: Array<{ countryCode: string; country: string; rank: number; greenfairScore: number; level: string }>;
  pillarScores: Array<{
    countryCode: string;
    country: string;
    environment: number;
    social: number;
    economy: number;
    greenfairScore: number;
  }>;
  clusterAssignments: ClusterRow[];
  forecast2026: ProjectionRow[];
  projection2030: ProjectionRow[];
  modelComparison: ModelComparisonRow[];
  recommendationsByCountry: Record<string, string[]>;
  overview: {
    bestCurrentCountry: string;
    bestCurrentScore: number;
    tunisiaRank: number;
    averageGreenfairScore: number;
    strongestGlobalPillar: string;
  };
  countryGroups: {
    tunisiaComparison: string[];
    cluster0: string[];
    cluster1: string[];
  };
  dataWarnings: string[];
  methodology: {
    description: string;
    thresholds: Array<{ label: string; minScore: number }>;
    limits: string[];
  };
}
