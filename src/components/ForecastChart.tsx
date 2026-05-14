import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ProjectionRow } from "../types/greenfair";

interface ForecastChartProps {
  data: ProjectionRow[];
  valueKey: "score" | "referenceScore";
  color?: string;
}

export function ForecastChart({ data, valueKey, color = "#10b981" }: ForecastChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="country" tick={{ fill: "#cbd5e1", fontSize: 12 }} interval={0} angle={-18} textAnchor="end" height={70} />
        <YAxis domain={[0, 100]} tick={{ fill: "#cbd5e1" }} />
        <Tooltip />
        <Bar dataKey={valueKey} fill={color} radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
