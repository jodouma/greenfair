import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { LatestScoreRow } from "../types/greenfair";
import { PILLAR_COLORS } from "../utils/constants";
import { pillarLabel } from "../utils/formatting";

interface PillarRadarProps {
  country: LatestScoreRow;
}

export function PillarRadar({ country }: PillarRadarProps) {
  const data = Object.entries(country.pillarScores).map(([key, value]) => ({
    pillar: pillarLabel(key as keyof typeof country.pillarScores),
    value
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.12)" />
        <PolarAngleAxis dataKey="pillar" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
        <Radar
          dataKey="value"
          stroke={PILLAR_COLORS.environment}
          fill={PILLAR_COLORS.environment}
          fillOpacity={0.35}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
