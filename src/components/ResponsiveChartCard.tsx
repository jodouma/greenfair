import { ReactNode } from "react";

interface ResponsiveChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ResponsiveChartCard({ title, subtitle, children }: ResponsiveChartCardProps) {
  return (
    <section className="panel p-5">
      <div className="mb-4">
        <h3 className="text-xl">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      <div className="h-80 w-full sm:h-96">{children}</div>
    </section>
  );
}
