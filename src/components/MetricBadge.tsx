import { getLevelTone } from "../utils/scoring";

interface MetricBadgeProps {
  label: string;
  score?: number;
}

export function MetricBadge({ label, score = 50 }: MetricBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getLevelTone(score)}`}>
      {label}
    </span>
  );
}
