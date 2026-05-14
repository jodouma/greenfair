import { GreenfairData } from "../types/greenfair";
import { methodologySections } from "../data/methodology";

interface MethodologyPageProps {
  data: GreenfairData;
}

export function MethodologyPage({ data }: MethodologyPageProps) {
  return (
    <div className="space-y-6">
      <section className="panel p-6 text-sm leading-7 text-slate-300">
        <h3 className="text-2xl">Méthodologie</h3>
        <p className="mt-3">{data.methodology.description}</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        {methodologySections.map((section) => (
          <section key={section.title} className="panel p-6">
            <h3 className="text-xl">{section.title}</h3>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-300">
              {section.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-6">
          <h3 className="text-xl">Seuils unifiés</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {data.methodology.thresholds.map((threshold) => (
              <li key={threshold.label}>• {threshold.label}: score ≥ {threshold.minScore}</li>
            ))}
          </ul>
        </section>
        <section className="panel p-6">
          <h3 className="text-xl">Limites et hypothèses</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {data.methodology.limits.map((limit) => (
              <li key={limit}>• {limit}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel p-6">
        <h3 className="text-xl">Indicateurs et sécurité</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="font-semibold text-white">Indicateurs</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {data.indicators.map((indicator) => (
                <li key={indicator.code}>
                  • {indicator.label} ({indicator.direction === "negative" ? "inversé" : "positif"})
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-white">Note sécurité</p>
            <p className="mt-2">{data.metadata.securityNotice}</p>
            <p className="mt-2">Aucune clé frontend n'est nécessaire pour le fonctionnement de l'application.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
