import { LatestScoreRow } from "../types/greenfair";
import { pillarLabel } from "./formatting";

export function explainCountryGap(country: LatestScoreRow): string {
  return `${country.country} affiche un pilier fort en ${pillarLabel(country.strongestPillar).toLowerCase()} mais reste freiné par ${pillarLabel(country.weakestPillar).toLowerCase()}.`;
}
