import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RankingChartProps {
  data: Array<{ country: string; greenfairScore: number }>;
}

export function RankingChart({ data }: RankingChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#cbd5e1" }} />
        <YAxis type="category" width={92} dataKey="country" tick={{ fill: "#e2e8f0", fontSize: 12 }} />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.06)" }} />
        <Bar dataKey="greenfairScore" fill="#10b981" radius={[0, 10, 10, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
