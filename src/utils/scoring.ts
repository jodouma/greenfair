export function getLevel(score: number): string {
  if (score >= 70) {
    return "Leader durable";
  }
  if (score >= 55) {
    return "Potentiel solide";
  }
  if (score >= 40) {
    return "Transition fragile";
  }
  return "Priorité critique";
}

export function getLevelTone(score: number): string {
  if (score >= 70) {
    return "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30";
  }
  if (score >= 55) {
    return "bg-sky-500/15 text-sky-200 ring-sky-400/30";
  }
  if (score >= 40) {
    return "bg-amber-500/15 text-amber-100 ring-amber-400/30";
  }
  return "bg-rose-500/15 text-rose-100 ring-rose-400/30";
}
