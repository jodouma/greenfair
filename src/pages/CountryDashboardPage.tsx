import { GreenfairData } from "../types/greenfair";
import { CountrySelector } from "../components/CountrySelector";
import { ScoreCard } from "../components/ScoreCard";
import { MetricBadge } from "../components/MetricBadge";
import { ResponsiveChartCard } from "../components/ResponsiveChartCard";
import { PillarRadar } from "../components/PillarRadar";
import { EvolutionChart } from "../components/EvolutionChart";
import { formatDelta, formatScore, pillarLabel } from "../utils/formatting";

interface CountryDashboardPageProps {
  data: GreenfairData;
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
}

export function CountryDashboardPage({ data, selectedCountry, onSelectCountry }: CountryDashboardPageProps) {
  const country = data.latestScores.find((row) => row.country === selectedCountry) ?? data.latestScores[0];
  const evolution = data.yearlyScores.filter((row) => row.country === country.country);

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <CountrySelector countries={data.countries} value={country.country} onChange={(value) => onSelectCountry(String(value))} />
      </section>

      <div className="card-grid">
        <ScoreCard title="Score actuel" value={formatScore(country.greenfairScore)} subtitle={country.country} />
        <ScoreCard title="Rang" value={`#${country.rank}`} subtitle="Classement 2025" accent="from-sky-400/40" />
        <ScoreCard title="Prévision 2026" value={formatScore(country.forecast2026.score)} subtitle={`Variation ${formatDelta(country.forecast2026.variation)}`} accent="from-amber-400/40" />
        <ScoreCard title="Projection 2030" value={formatScore(country.projection2030.score)} subtitle={`Variation ${formatDelta(country.projection2030.variation)}`} accent="from-emerald-300/40" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ResponsiveChartCard title={`Radar des piliers — ${country.country}`} subtitle="Scores sur 100">
          <PillarRadar country={country} />
        </ResponsiveChartCard>
        <section className="panel p-6">
          <div className="flex items-center gap-3">
            <MetricBadge label={country.level} score={country.greenfairScore} />
            <span className="text-sm text-slate-400">Cluster {country.cluster}</span>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            <p>Pilier le plus solide: <span className="font-semibold text-white">{pillarLabel(country.strongestPillar)}</span></p>
            <p>Pilier le plus fragile: <span className="font-semibold text-white">{pillarLabel(country.weakestPillar)}</span></p>
            <p>Lecture prudente: le scénario 2026 prolonge les dynamiques historiques, tandis que 2030 reste une projection modèle à usage démonstratif.</p>
            <div>
              <p className="font-semibold text-white">Recommandations statiques</p>
              <ul className="mt-3 space-y-2">
                {country.recommendations.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      <ResponsiveChartCard title="Evolution temporelle du score" subtitle="1998-2025, avec scénarios extrapolés en fin de période">
        <EvolutionChart data={evolution} countries={[country.country]} />
      </ResponsiveChartCard>
    </div>
  );
}
