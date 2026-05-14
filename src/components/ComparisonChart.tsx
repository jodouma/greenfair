import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LatestScoreRow } from "../types/greenfair";

interface ComparisonChartProps {
  countries: LatestScoreRow[];
}

export function ComparisonChart({ countries }: ComparisonChartProps) {
  const data = countries.map((country) => ({
    country: country.country,
    Environnement: country.pillarScores.environment,
    Social: country.pillarScores.social,
    Economie: country.pillarScores.economy
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="country" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fill: "#cbd5e1" }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Environnement" fill="#10b981" radius={[8, 8, 0, 0]} />
        <Bar dataKey="Social" fill="#38bdf8" radius={[8, 8, 0, 0]} />
        <Bar dataKey="Economie" fill="#f59e0b" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
