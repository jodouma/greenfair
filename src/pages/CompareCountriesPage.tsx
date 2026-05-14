import { GreenfairData } from "../types/greenfair";
import { CountrySelector } from "../components/CountrySelector";
import { ResponsiveChartCard } from "../components/ResponsiveChartCard";
import { EvolutionChart } from "../components/EvolutionChart";
import { ComparisonChart } from "../components/ComparisonChart";
import { explainCountryGap } from "../utils/recommendations";

interface CompareCountriesPageProps {
  data: GreenfairData;
  selectedCountries: string[];
  onSelectCountries: (countries: string[]) => void;
}

export function CompareCountriesPage({ data, selectedCountries, onSelectCountries }: CompareCountriesPageProps) {
  const countries = data.latestScores.filter((row) => selectedCountries.includes(row.country));

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <CountrySelector
          countries={data.countries}
          value={selectedCountries}
          onChange={(value) => onSelectCountries(value as string[])}
          multiple
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <ResponsiveChartCard title="Evolution comparée" subtitle="Lecture des trajectoires sur la totalité de la période">
          <EvolutionChart data={data.yearlyScores.filter((row) => selectedCountries.includes(row.country))} countries={selectedCountries} />
        </ResponsiveChartCard>
        <ResponsiveChartCard title="Piliers actuels comparés" subtitle="Scores 2025 sur 100">
          <ComparisonChart countries={countries} />
        </ResponsiveChartCard>
      </div>

      <section className="panel p-6">
        <h3 className="text-xl">Interprétation comparative</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {countries.map((country) => (
            <article key={country.country} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
              <p className="font-semibold text-white">{country.country}</p>
              <p className="mt-2">{explainCountryGap(country)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
