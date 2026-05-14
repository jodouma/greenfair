import { useMemo, useState } from "react";
import greenfairData from "./data/greenfairData.json";
import { Layout } from "./components/Layout";
import { ClusteringPage } from "./pages/ClusteringPage";
import { CompareCountriesPage } from "./pages/CompareCountriesPage";
import { CountryDashboardPage } from "./pages/CountryDashboardPage";
import { ForecastPage } from "./pages/ForecastPage";
import { MethodologyPage } from "./pages/MethodologyPage";
import { OverviewPage } from "./pages/OverviewPage";
import { TunisiaFocusPage } from "./pages/TunisiaFocusPage";
import { GreenfairData, PageKey } from "./types/greenfair";

const data = greenfairData as GreenfairData;

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>("overview");
  const [selectedCountry, setSelectedCountry] = useState("Tunisia");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["Tunisia", "Morocco", "Kenya"]);

  const page = useMemo(() => {
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
  }, [activePage, selectedCountry, selectedCountries]);

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {page}
    </Layout>
  );
}
