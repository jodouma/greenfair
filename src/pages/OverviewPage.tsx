import { Activity, Award, Leaf, TrendingUp } from "lucide-react";
import { GreenfairData } from "../types/greenfair";
import { formatScore } from "../utils/formatting";
import { ScoreCard } from "../components/ScoreCard";
import { ResponsiveChartCard } from "../components/ResponsiveChartCard";
import { RankingChart } from "../components/RankingChart";
import { ComparisonChart } from "../components/ComparisonChart";
import { EvolutionChart } from "../components/EvolutionChart";
import { ForecastChart } from "../components/ForecastChart";
import { WarningBanner } from "../components/WarningBanner";

interface OverviewPageProps {
  data: GreenfairData;
}

export function OverviewPage({ data }: OverviewPageProps) {
  const spotlightCountries = ["Tunisia", "Morocco", "Kenya", "Viet Nam"];
  const spotlightRows = data.latestScores.filter((row) => spotlightCountries.includes(row.country));

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h3 className="text-2xl">GreenFair Score — Tableau de bord de durabilité</h3>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
          Le GreenFair Score synthétise 15 indicateurs World Bank en trois piliers pondérés afin de comparer les
          trajectoires nationales de durabilité. Le tableau de bord distingue clairement les données observées,
          les scénarios extrapolés et les projections modèles pour soutenir une lecture prudente et pédagogique.
        </p>
      </section>

      <div className="card-grid">
        <ScoreCard
          title="Meilleur score actuel"
          value={data.overview.bestCurrentCountry}
          subtitle={formatScore(data.overview.bestCurrentScore)}
          icon={<Award className="h-5 w-5" />}
        />
        <ScoreCard
          title="Rang actuel de la Tunisie"
          value={`#${data.overview.tunisiaRank}`}
          subtitle="Classement 2025"
          accent="from-sky-400/40"
          icon={<Leaf className="h-5 w-5" />}
        />
        <ScoreCard
          title="Score moyen GreenFair"
          value={formatScore(data.overview.averageGreenfairScore)}
          subtitle="Moyenne des 10 pays en 2025"
          accent="from-amber-400/40"
          icon={<Activity className="h-5 w-5" />}
        />
        <ScoreCard
          title="Pilier global le plus solide"
          value={data.overview.strongestGlobalPillar}
          subtitle="Lecture moyenne du panel"
          accent="from-emerald-300/40"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <WarningBanner warnings={data.dataWarnings.slice(0, 2)} />

      <div className="grid gap-6 xl:grid-cols-2">
        <ResponsiveChartCard title="Classement global 2025" subtitle="Scores GreenFair actuels">
          <RankingChart data={data.rankings} />
        </ResponsiveChartCard>
        <ResponsiveChartCard title="Comparaison des piliers" subtitle="Lecture groupée des scores 2025">
          <ComparisonChart countries={data.latestScores} />
        </ResponsiveChartCard>
      </div>

      <ResponsiveChartCard
        title="Evolution comparée 1998-2025"
        subtitle="Les années 2024-2025 sont affichées comme scénarios extrapolés"
      >
        <EvolutionChart data={data.yearlyScores} countries={spotlightCountries} />
      </ResponsiveChartCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <ResponsiveChartCard title="Projection 2030" subtitle="Scénario modèle, non prévision officielle">
          <ForecastChart data={data.projection2030} valueKey="score" color="#38bdf8" />
        </ResponsiveChartCard>
        <section className="panel p-6">
          <h3 className="text-xl">Lecture rapide</h3>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
            <p>Le panel reste marqué par des écarts importants entre performance sociale et performance environnementale.</p>
            <p>La plupart des pays conservent une zone intermédiaire de transition plutôt qu'un leadership durable affirmé.</p>
            <p>Les scénarios 2030 doivent être lus comme supports de discussion stratégique et non comme verdicts définitifs.</p>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Pays mis en avant</p>
              <ul className="mt-2 space-y-2 text-slate-300">
                {spotlightRows.map((row) => (
                  <li key={row.country}>
                    {row.country}: {formatScore(row.greenfairScore)} - {row.level}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
