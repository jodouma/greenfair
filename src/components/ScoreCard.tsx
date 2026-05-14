import { ReactNode } from "react";

interface ScoreCardProps {
  title: string;
  value: string;
  subtitle: string;
  accent?: string;
  icon?: ReactNode;
}

export function ScoreCard({ title, value, subtitle, accent = "from-emerald-400/40", icon }: ScoreCardProps) {
  return (
    <div className={`panel overflow-hidden p-5`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent} to-transparent`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-300">{title}</p>
          <p className="mt-3 text-3xl font-extrabold text-white">{value}</p>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        </div>
        {icon ? <div className="rounded-2xl bg-white/10 p-3 text-emerald-200">{icon}</div> : null}
      </div>
    </div>
  );
}
