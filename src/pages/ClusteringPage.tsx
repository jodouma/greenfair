import { GreenfairData } from "../types/greenfair";
import { ClusterChart } from "../components/ClusterChart";
import { ResponsiveChartCard } from "../components/ResponsiveChartCard";

interface ClusteringPageProps {
  data: GreenfairData;
}

export function ClusteringPage({ data }: ClusteringPageProps) {
  return (
    <div className="space-y-6">
      <section className="panel p-6 text-sm leading-7 text-slate-300">
        <h3 className="text-2xl">K-Means et lecture stratégique</h3>
        <p className="mt-3">
          Le clustering sert ici à résumer des profils moyens de durabilité. Pour rester cohérent avec les sorties attendues du notebook, l'affichage retient deux groupes lisibles pour une démonstration académique.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ResponsiveChartCard title="Projection 2D simplifiée" subtitle="Représentation PCA des profils pays">
          <ClusterChart data={data.clusterAssignments} />
        </ResponsiveChartCard>
        <div className="space-y-6">
          <section className="panel p-6">
            <h3 className="text-xl">Cluster 0</h3>
            <p className="mt-2 text-sm text-slate-400">Groupe de transition</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {data.countryGroups.cluster0.map((country) => (
                <li key={country}>• {country}</li>
              ))}
            </ul>
          </section>
          <section className="panel p-6">
            <h3 className="text-xl">Cluster 1</h3>
            <p className="mt-2 text-sm text-slate-400">Groupe émergent plus robuste</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {data.countryGroups.cluster1.map((country) => (
                <li key={country}>• {country}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
