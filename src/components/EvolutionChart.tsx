import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ScoreRow } from "../types/greenfair";

interface EvolutionChartProps {
  data: ScoreRow[];
  countries: string[];
}

const palette = ["#10b981", "#38bdf8", "#f59e0b", "#fb7185", "#a78bfa"];

export function EvolutionChart({ data, countries }: EvolutionChartProps) {
  const years = Array.from(new Set(data.map((row) => row.year))).sort((a, b) => a - b);
  const chartData = years.map((year) => {
    const row: Record<string, number | string | undefined> = { year };
    for (const country of countries) {
      const match = data.find((item) => item.country === country && item.year === year);
      row[country] = match?.greenfairScore;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="year" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fill: "#cbd5e1" }} />
        <Tooltip />
        <Legend />
        {countries.map((country, index) => (
          <Line
            key={country}
            type="monotone"
            dataKey={country}
            stroke={palette[index % palette.length]}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
