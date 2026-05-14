import { PillarKey } from "../types/greenfair";
import { PILLAR_LABELS } from "./constants";

export function formatScore(value: number): string {
  return `${value.toFixed(1)}/100`;
}

export function formatDelta(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}

export function pillarLabel(key: PillarKey): string {
  return PILLAR_LABELS[key];
}
