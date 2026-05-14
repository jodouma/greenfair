import { GreenfairData } from "../types/greenfair";
import { ComparisonChart } from "../components/ComparisonChart";
import { EvolutionChart } from "../components/EvolutionChart";
import { PillarRadar } from "../components/PillarRadar";
import { ResponsiveChartCard } from "../components/ResponsiveChartCard";
import { formatScore, pillarLabel } from "../utils/formatting";

interface TunisiaFocusPageProps {
  data: GreenfairData;
}

export function TunisiaFocusPage({ data }: TunisiaFocusPageProps) {
  const tunisia = data.latestScores.find((row) => row.country === "Tunisia")!;
  const comparisonCountries = data.latestScores.filter((row) => data.countryGroups.tunisiaComparison.includes(row.country));

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h3 className="text-2xl">Focus Tunisie</h3>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
          La Tunisie présente une base sociale plus solide que son socle environnemental. Le tableau ci-dessous propose une lecture nuancée, utile pour un exposé académique ou une démonstration publique, sans surinterpréter les scénarios.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ResponsiveChartCard title="Radar des piliers — Tunisie" subtitle={`Score 2025: ${formatScore(tunisia.greenfairScore)}`}>
          <PillarRadar country={tunisia} />
        </ResponsiveChartCard>
        <section className="panel p-6 text-sm leading-7 text-slate-300">
          <p>Pilier fort: <span className="font-semibold text-white">{pillarLabel(tunisia.strongestPillar)}</span></p>
          <p className="mt-2">Pilier faible: <span className="font-semibold text-white">{pillarLabel(tunisia.weakestPillar)}</span></p>
          <p className="mt-4">La lecture 2026-2030 suggère une trajectoire à consolider, surtout si l'environnement reste en retrait par rapport aux piliers social et économique.</p>
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="font-semibold text-white">Points de vigilance</p>
            <ul className="mt-3 space-y-2">
              {tunisia.recommendations.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <ResponsiveChartCard title="Evolution du score tunisien" subtitle="1998-2025">
        <EvolutionChart data={data.yearlyScores.filter((row) => row.country === "Tunisia")} countries={["Tunisia"]} />
      </ResponsiveChartCard>

      <ResponsiveChartCard title="Tunisie vs comparateurs régionaux" subtitle="Maroc, Egypte, Sénégal, Kenya">
        <ComparisonChart countries={comparisonCountries} />
      </ResponsiveChartCard>
    </div>
  );
}
