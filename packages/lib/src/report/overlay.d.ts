export type VolatilityLabel = 'Chalk' | 'Balanced' | 'Chaos';
export interface OverlayInputs {
  matchupId: number;
  teamAName: string;
  teamBName: string;
  pointsA: number;
  pointsB: number;
  leadChanges: number;
  avgDeltaPct: number;
  maxSwingPct?: number;
  startersSumA?: number;
  startersSumB?: number;
  benchSumA?: number;
  benchSumB?: number;
  qbA?: number;
  qbB?: number;
  defA?: number;
  defB?: number;
}
export interface OverlayOutcome {
  volatility: VolatilityLabel;
  fineText?: string;
  curseTextA?: string;
  curseTextB?: string;
}
export declare function computeVolatilityLabel(input: {
  leadChanges: number;
  avgDeltaPct: number;
  maxSwingPct?: number;
}): VolatilityLabel;
export declare function buildMatchupOverlay(inputs: OverlayInputs): OverlayOutcome;
