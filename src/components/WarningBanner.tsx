interface WarningBannerProps {
  warnings: string[];
}

export function WarningBanner({ warnings }: WarningBannerProps) {
  return (
    <div className="panel border-amber-400/20 bg-amber-500/10 p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Cadre d'interprétation</p>
      <div className="mt-2 space-y-2 text-sm text-amber-50/90">
        {warnings.map((warning) => (
          <p key={warning}>{warning}</p>
        ))}
      </div>
    </div>
  );
}
