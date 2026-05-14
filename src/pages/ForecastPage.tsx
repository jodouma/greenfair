import { GreenfairData } from "../types/greenfair";
import { ForecastChart } from "../components/ForecastChart";
import { ResponsiveChartCard } from "../components/ResponsiveChartCard";

interface ForecastPageProps {
  data: GreenfairData;
}

export function ForecastPage({ data }: ForecastPageProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <ResponsiveChartCard title="Prévision stratégique 2026" subtitle="Scenario Ridge temporelle">
          <ForecastChart data={data.forecast2026} valueKey="score" />
        </ResponsiveChartCard>
        <ResponsiveChartCard title="Projection 2030" subtitle="Scenario Random Forest lissé">
          <ForecastChart data={data.projection2030} valueKey="score" color="#38bdf8" />
        </ResponsiveChartCard>
      </div>

      <section className="panel p-6">
        <h3 className="text-xl">Comparaison des modèles</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {data.modelComparison.map((model) => (
            <article key={model.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-lg font-semibold text-white">{model.label}</h4>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">R² {model.r2}</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300">{model.purpose}</p>
              <p className="mt-2 text-sm text-slate-400">{model.notes}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-950/50 p-3">
                  <p className="text-slate-400">MAE</p>
                  <p className="mt-1 font-semibold text-white">{model.mae}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/50 p-3">
                  <p className="text-slate-400">RMSE</p>
                  <p className="mt-1 font-semibold text-white">{model.rmse}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/50 p-3">
                  <p className="text-slate-400">R²</p>
                  <p className="mt-1 font-semibold text-white">{model.r2}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel p-6 text-sm leading-7 text-slate-300">
        <h3 className="text-xl text-white">Limites à expliciter</h3>
        <ul className="mt-4 space-y-2">
          <li>• Le baseline naïf sert seulement de point de comparaison minimal.</li>
          <li>• La Ridge temporelle et le Random Forest sont des outils de scénario, pas des machines à prévoir l'avenir avec certitude.</li>
          <li>• La régression linéaire directe valide surtout la cohérence de la formule du score, elle ne doit pas être présentée comme un vrai modèle prédictif.</li>
        </ul>
      </section>
    </div>
  );
}
