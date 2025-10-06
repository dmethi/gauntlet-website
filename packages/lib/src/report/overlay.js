export function computeVolatilityLabel(input) {
  const { leadChanges, avgDeltaPct, maxSwingPct = 0 } = input;
  // Heuristics tuned for our WP sampling cadence
  if (leadChanges >= 10 || maxSwingPct >= 8 || avgDeltaPct >= 5) return 'Chaos';
  if (leadChanges >= 4 || maxSwingPct >= 4 || avgDeltaPct >= 2) return 'Balanced';
  return 'Chalk';
}
export function buildMatchupOverlay(inputs) {
  const {
    teamAName,
    teamBName,
    leadChanges,
    avgDeltaPct,
    maxSwingPct = 0,
    startersSumA = 0,
    startersSumB = 0,
    benchSumA = 0,
    benchSumB = 0,
    qbA = 0,
    qbB = 0,
    defA = 0,
    defB = 0,
  } = inputs;
  const outcome = {
    volatility: computeVolatilityLabel({ leadChanges, avgDeltaPct, maxSwingPct }),
  };
  // Deterministic variety via seed
  const seed = Math.abs(
    (teamAName + '|' + teamBName + '|' + String(inputs.matchupId))
      .split('')
      .reduce((a, c) => (a * 33 + c.charCodeAt(0)) % 2147483647, 5381)
  );
  const rand = (min, max) => min + ((seed % 1000) / 1000) * (max - min);
  const pick = arr => arr[Math.floor(rand(0, arr.length))];
  // Fine selection (max one per matchup)
  // Categories: Bench Management, Lineup Malpractice, Hubris Penalty
  const benchThreshold = 28; // points
  const lineupGapThreshold = 18; // startersSum difference vs opponent
  const aBenchHeavy = benchSumA >= benchThreshold && benchSumA > benchSumB + 5;
  const bBenchHeavy = benchSumB >= benchThreshold && benchSumB > benchSumA + 5;
  const benchLinesA = [
    `${teamAName} left ${benchSumA.toFixed(1)} on the pine. Rotisserie regret.`,
    `${teamAName} benched a buffet: ${benchSumA.toFixed(1)} pts unused.`,
    `${teamAName} donated ${benchSumA.toFixed(1)} pts to the waiver gods.`,
  ];
  const benchLinesB = [
    `${teamBName} left ${benchSumB.toFixed(1)} on the pine. Rotisserie regret.`,
    `${teamBName} benched a buffet: ${benchSumB.toFixed(1)} pts unused.`,
    `${teamBName} donated ${benchSumB.toFixed(1)} pts to the waiver gods.`,
  ];
  const startersDelta = Math.abs(startersSumA - startersSumB);
  const malpracticeLines = [
    'Lineup Malpractice: suboptimal starts galore.',
    'Lineup Audit Requested: decisions under review.',
    'Start/Sit Tribunal convened. Bring exhibits.',
  ];
  const hubrisLines = [
    'Hubris Penalty: vibes over data backfired.',
    'Confidence Tax applied. The model keeps receipts.',
    'Arrogance Surcharge assessed at checkout.',
  ];
  if (!outcome.fineText) {
    if (aBenchHeavy) outcome.fineText = pick(benchLinesA);
    else if (bBenchHeavy) outcome.fineText = pick(benchLinesB);
    else if (startersDelta >= lineupGapThreshold) outcome.fineText = pick(malpracticeLines);
    else if (rand(0, 1) > 0.7) outcome.fineText = pick(hubrisLines);
  }
  // Curses (max one per team)
  // Target clear positional blowouts at QB/DEF
  const qbGap = Math.abs(qbA - qbB);
  const defGap = Math.abs(defA - defB);
  const qbGapThresh = 15;
  const defGapThresh = 10;
  if (qbGap >= qbGapThresh) {
    const qLines = [
      (hi, lo) => `QB Desert Curse: ${hi.toFixed(1)} to ${lo.toFixed(1)} gulf.`,
      (hi, lo) => `Signal Caller Smiting: ${hi.toFixed(1)} vs ${lo.toFixed(1)}.`,
      (hi, lo) => `Air Raid Omen: ${hi.toFixed(1)} > ${lo.toFixed(1)} by miles.`,
    ];
    const line = pick(qLines);
    if (qbA > qbB) outcome.curseTextB = line(qbA, qbB);
    else outcome.curseTextA = line(qbB, qbA);
  }
  if (defGap >= defGapThresh) {
    const dLines = [
      (hi, lo) => `Defense Doom: ${hi.toFixed(1)} vs ${lo.toFixed(1)} swing.`,
      (hi, lo) => `Shield Shatter: ${hi.toFixed(1)} to ${lo.toFixed(1)} split.`,
      (hi, lo) => `Wall of Woe: ${hi.toFixed(1)} > ${lo.toFixed(1)} by plenty.`,
    ];
    const line = pick(dLines);
    if (defA > defB && !outcome.curseTextB) outcome.curseTextB = line(defA, defB);
    else if (defB > defA && !outcome.curseTextA) outcome.curseTextA = line(defB, defA);
  }
  return outcome;
}
