import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { ClusterRow } from "../types/greenfair";

interface ClusterChartProps {
  data: ClusterRow[];
}

export function ClusterChart({ data }: ClusterChartProps) {
  const cluster0 = data.filter((row) => row.cluster === 0);
  const cluster1 = data.filter((row) => row.cluster === 1);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="pc1" name="PC1" tick={{ fill: "#cbd5e1" }} />
        <YAxis dataKey="pc2" name="PC2" tick={{ fill: "#cbd5e1" }} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value: number) => value.toFixed(2)} />
        <Scatter data={cluster0} fill="#10b981" name="Cluster 0" />
        <Scatter data={cluster1} fill="#38bdf8" name="Cluster 1" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
