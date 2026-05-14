import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Layout } from "./components/Layout";
import { GreenfairData, PageKey } from "./types/greenfair";

const OverviewPage = lazy(() =>
  import("./pages/OverviewPage").then((module) => ({ default: module.OverviewPage }))
);
const CountryDashboardPage = lazy(() =>
  import("./pages/CountryDashboardPage").then((module) => ({ default: module.CountryDashboardPage }))
);
const CompareCountriesPage = lazy(() =>
  import("./pages/CompareCountriesPage").then((module) => ({ default: module.CompareCountriesPage }))
);
const TunisiaFocusPage = lazy(() =>
  import("./pages/TunisiaFocusPage").then((module) => ({ default: module.TunisiaFocusPage }))
);
const ForecastPage = lazy(() =>
  import("./pages/ForecastPage").then((module) => ({ default: module.ForecastPage }))
);
const ClusteringPage = lazy(() =>
  import("./pages/ClusteringPage").then((module) => ({ default: module.ClusteringPage }))
);
const MethodologyPage = lazy(() =>
  import("./pages/MethodologyPage").then((module) => ({ default: module.MethodologyPage }))
);

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="panel p-8">
      <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Chargement</p>
      <h3 className="mt-3 text-2xl">{label}</h3>
      <p className="mt-3 text-sm text-slate-400">Préparation des données et des visualisations…</p>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>("overview");
  const [selectedCountry, setSelectedCountry] = useState("Tunisia");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["Tunisia", "Morocco", "Kenya"]);
  const [data, setData] = useState<GreenfairData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("./data/greenfairData.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json() as Promise<GreenfairData>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
        }
      })
      .catch((fetchError: Error) => {
        if (!cancelled) {
          setError(fetchError.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const page = useMemo(() => {
    if (!data) {
      return <LoadingPanel label="Ouverture du dashboard" />;
    }

    switch (activePage) {
      case "overview":
        return <OverviewPage data={data} />;
      case "country":
        return (
          <CountryDashboardPage
            data={data}
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
          />
        );
      case "compare":
        return (
          <CompareCountriesPage
            data={data}
            selectedCountries={selectedCountries}
            onSelectCountries={setSelectedCountries}
          />
        );
      case "tunisia":
        return <TunisiaFocusPage data={data} />;
      case "forecast":
        return <ForecastPage data={data} />;
      case "clustering":
        return <ClusteringPage data={data} />;
      case "methodology":
        return <MethodologyPage data={data} />;
      default:
        return <OverviewPage data={data} />;
    }
  }, [activePage, data, selectedCountries, selectedCountry]);

  if (error) {
    return (
      <Layout activePage={activePage} onNavigate={setActivePage}>
        <div className="panel border-rose-400/20 bg-rose-500/10 p-8">
          <h3 className="text-2xl">Chargement impossible</h3>
          <p className="mt-3 text-sm text-rose-100/90">
            Le fichier `greenfairData.json` n&apos;a pas pu être chargé: {error}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      <Suspense fallback={<LoadingPanel label="Chargement de la page" />}>{page}</Suspense>
    </Layout>
  );
}
