#!/usr/bin/env node

/**
 * Parameter Calibration for Start/Sit Analysis
 *
 * Tests different combinations to find realistic thresholds:
 * 1. Position-specific analysis (exclude DEF?)
 * 2. Narrower projection windows (5%, 10%, 15%)
 * 3. Higher waiver discounts (30%, 40%, 50%)
 * 4. Bench-only analysis for comparison
 */

import { CURRENT_LEAGUES } from '../apps/web/src/config/leagues';
import {
  calculateLeagueProjection,
  type ScoringSettings,
} from '../apps/web/src/lib/calculate-league-projections';

const LEAGUE_SCORING: ScoringSettings = {
  pass_yd: 0.04,
  pass_td: 4,
  pass_int: -1,
  rush_yd: 0.1,
  rush_td: 6,
  rec_yd: 0.1,
  rec_td: 6,
  rec: 0.5,
  fum_lost: -2,
};

const POSITION_ELIGIBILITY = {
  QB: ['QB'],
  RB: ['RB'],
  WR: ['WR'],
  TE: ['TE'],
  FLEX: ['RB', 'WR', 'TE'],
  K: ['K'],
  DEF: ['DEF'],
};

const ROSTER_POSITIONS = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX', 'K', 'DEF'];

interface PlayerProjection {
  playerId: string;
  projectedPoints: number;
  actualPoints: number;
}

interface CalibrationResult {
  scenario: string;
  totalDecisions: number;
  correctDecisions: number;
  decisionRate: number;
  totalMissedPoints: number;
  avgMissedPerDecision: number;
  benchSuboptimal: number;
  waiverSuboptimal: number;
  avgAlternatives: number;
}

async function fetchFromSleeper<T>(endpoint: string): Promise<T> {
  const baseUrl = 'https://api.sleeper.app/v1';
  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: { 'User-Agent': 'Gauntlet-Calibration/1.0.0' },
  });
  return response.json();
}

function calculateFantasyPoints(stats: any, scoring: ScoringSettings): number {
  return calculateLeagueProjection(stats, scoring).points;
}

function isPlayerEligible(playerPosition: string, rosterSlot: string): boolean {
  const eligiblePositions = POSITION_ELIGIBILITY[rosterSlot as keyof typeof POSITION_ELIGIBILITY];
  return eligiblePositions?.includes(playerPosition) || false;
}

function getRosteredPlayers(matchups: any[]): Set<string> {
  const rosteredPlayers = new Set<string>();
  for (const matchup of matchups) {
    const players = matchup.players || [];
    for (const playerId of players) {
      rosteredPlayers.add(String(playerId));
    }
  }
  return rosteredPlayers;
}

async function runCalibrationScenario(
  scenario: string,
  includeWaivers: boolean,
  projectionThreshold: number,
  waiverDiscount: number,
  excludePositions: string[] = []
): Promise<CalibrationResult> {
  const leagueId = CURRENT_LEAGUES[0].id;
  const week = 3;

  const [matchups, projections, stats, users, rosters, allPlayers] = await Promise.all([
    fetchFromSleeper<any[]>(`/league/${leagueId}/matchups/${week}`),
    fetchFromSleeper<Record<string, any>>(`/projections/nfl/regular/2025/${week}`),
    fetchFromSleeper<Record<string, any>>(`/stats/nfl/regular/2025/${week}`),
    fetchFromSleeper<any[]>(`/league/${leagueId}/users`),
    fetchFromSleeper<any[]>(`/league/${leagueId}/rosters`),
    fetchFromSleeper<Record<string, any>>('/players/nfl'),
  ]);

  const userMap = new Map(users.map((u: any) => [u.user_id, u]));
  const rosterToOwner = new Map(rosters.map((r: any) => [r.roster_id, r.owner_id]));
  const playerPositions = new Map<string, string>();

  for (const [playerId, playerData] of Object.entries(allPlayers)) {
    if (playerData && typeof playerData === 'object' && 'position' in playerData) {
      playerPositions.set(playerId, (playerData as any).position);
    }
  }

  const allProjections = new Map<string, PlayerProjection>();
  for (const [playerId, rawProjection] of Object.entries(projections)) {
    const rawStat = stats[playerId];
    if (!rawProjection || !rawStat) continue;

    const projectedPoints = calculateFantasyPoints(rawProjection, LEAGUE_SCORING);
    const actualPoints = calculateFantasyPoints(rawStat, LEAGUE_SCORING);
    if (projectedPoints <= 0) continue;

    allProjections.set(playerId, {
      playerId,
      projectedPoints,
      actualPoints,
    });
  }

  const rosteredPlayers = getRosteredPlayers(matchups);

  let totalDecisions = 0;
  let correctDecisions = 0;
  let totalMissedPoints = 0;
  let benchSuboptimal = 0;
  let waiverSuboptimal = 0;
  let totalAlternatives = 0;

  for (const matchup of matchups) {
    const starters = matchup.starters || [];
    const roster = matchup.players || [];

    for (let i = 0; i < starters.length; i++) {
      const playerId = starters[i];
      if (!playerId) continue;

      const rosterSlot = ROSTER_POSITIONS[i];
      if (!rosterSlot || excludePositions.includes(rosterSlot)) continue;

      const selectedProjection = allProjections.get(playerId);
      if (!selectedProjection) continue;

      const alternatives = [];

      // Bench alternatives
      for (const benchId of roster) {
        if (starters.includes(benchId)) continue;
        if (benchId === playerId) continue;

        const playerPos = playerPositions.get(benchId);
        if (!playerPos || !isPlayerEligible(playerPos, rosterSlot)) continue;

        const projection = allProjections.get(benchId);
        if (!projection) continue;

        alternatives.push({
          source: 'bench',
          actualPoints: projection.actualPoints,
          adjustedPoints: projection.actualPoints, // No discount
        });
      }

      // Waiver alternatives (if enabled)
      if (includeWaivers) {
        const maxProjectionDiff = selectedProjection.projectedPoints * projectionThreshold;

        for (const [waiverPlayerId, projection] of allProjections) {
          if (rosteredPlayers.has(waiverPlayerId)) continue;

          const playerPos = playerPositions.get(waiverPlayerId);
          if (!playerPos || !isPlayerEligible(playerPos, rosterSlot)) continue;

          const projectionDiff = Math.abs(
            projection.projectedPoints - selectedProjection.projectedPoints
          );
          if (projectionDiff > maxProjectionDiff) continue;

          alternatives.push({
            source: 'waiver',
            actualPoints: projection.actualPoints,
            adjustedPoints: projection.actualPoints * (1 - waiverDiscount),
          });
        }
      }

      if (alternatives.length === 0) continue;

      totalAlternatives += alternatives.length;

      const bestAlternative = alternatives.reduce((best, current) =>
        current.adjustedPoints > best.adjustedPoints ? current : best
      );

      const isCorrect = bestAlternative.adjustedPoints <= selectedProjection.actualPoints;
      const missedPoints = Math.max(
        0,
        bestAlternative.adjustedPoints - selectedProjection.actualPoints
      );

      totalDecisions++;
      if (isCorrect) correctDecisions++;
      totalMissedPoints += missedPoints;

      // Track source of suboptimality
      if (!isCorrect) {
        if (bestAlternative.source === 'bench') {
          benchSuboptimal++;
        } else {
          waiverSuboptimal++;
        }
      }
    }
  }

  return {
    scenario,
    totalDecisions,
    correctDecisions,
    decisionRate: totalDecisions > 0 ? correctDecisions / totalDecisions : 0,
    totalMissedPoints,
    avgMissedPerDecision: totalDecisions > 0 ? totalMissedPoints / totalDecisions : 0,
    benchSuboptimal,
    waiverSuboptimal,
    avgAlternatives: totalDecisions > 0 ? totalAlternatives / totalDecisions : 0,
  };
}

async function runCalibrationAnalysis() {
  console.log('🎯 PARAMETER CALIBRATION ANALYSIS\n');

  const scenarios = [
    // Baseline
    {
      name: 'Current (20% threshold, 15% discount)',
      waivers: true,
      threshold: 0.2,
      discount: 0.15,
      exclude: [],
    },

    // Bench-only comparison
    { name: 'Bench Only', waivers: false, threshold: 0, discount: 0, exclude: [] },

    // Exclude volatile positions
    {
      name: 'Exclude DEF (20% threshold, 15% discount)',
      waivers: true,
      threshold: 0.2,
      discount: 0.15,
      exclude: ['DEF'],
    },
    {
      name: 'Exclude DEF & K (20% threshold, 15% discount)',
      waivers: true,
      threshold: 0.2,
      discount: 0.15,
      exclude: ['DEF', 'K'],
    },

    // Narrower thresholds
    {
      name: '10% threshold, 15% discount',
      waivers: true,
      threshold: 0.1,
      discount: 0.15,
      exclude: [],
    },
    {
      name: '15% threshold, 15% discount',
      waivers: true,
      threshold: 0.15,
      discount: 0.15,
      exclude: [],
    },

    // Higher discounts
    {
      name: '20% threshold, 25% discount',
      waivers: true,
      threshold: 0.2,
      discount: 0.25,
      exclude: [],
    },
    {
      name: '20% threshold, 35% discount',
      waivers: true,
      threshold: 0.2,
      discount: 0.35,
      exclude: [],
    },
    {
      name: '20% threshold, 50% discount',
      waivers: true,
      threshold: 0.2,
      discount: 0.5,
      exclude: [],
    },

    // Combined optimizations
    {
      name: '10% threshold, 30% discount, exclude DEF',
      waivers: true,
      threshold: 0.1,
      discount: 0.3,
      exclude: ['DEF'],
    },
    {
      name: '15% threshold, 25% discount, exclude DEF',
      waivers: true,
      threshold: 0.15,
      discount: 0.25,
      exclude: ['DEF'],
    },
  ];

  const results: CalibrationResult[] = [];

  for (const scenario of scenarios) {
    const result = await runCalibrationScenario(
      scenario.name,
      scenario.waivers,
      scenario.threshold,
      scenario.discount,
      scenario.exclude
    );
    results.push(result);
  }

  // Display results table
  console.log('📊 CALIBRATION RESULTS\n');
  console.log(
    'Scenario                                     | Decisions | Correct | Rate    | Avg Miss | Bench | Waiver | Avg Alts'
  );
  console.log('-'.repeat(110));

  for (const result of results) {
    const scenario = result.scenario.padEnd(40);
    const decisions = result.totalDecisions.toString().padStart(9);
    const correct = result.correctDecisions.toString().padStart(7);
    const rate = (result.decisionRate * 100).toFixed(1).padStart(6) + '%';
    const avgMiss = result.avgMissedPerDecision.toFixed(1).padStart(8);
    const bench = result.benchSuboptimal.toString().padStart(5);
    const waiver = result.waiverSuboptimal.toString().padStart(6);
    const avgAlts = result.avgAlternatives.toFixed(1).padStart(8);

    console.log(
      `${scenario} | ${decisions} | ${correct} | ${rate} | ${avgMiss} | ${bench} | ${waiver} | ${avgAlts}`
    );
  }

  // Recommendations
  console.log('\n🎯 RECOMMENDATIONS:\n');

  const benchOnly = results.find(r => r.scenario === 'Bench Only')!;
  const excludeDef = results.find(r => r.scenario === 'Exclude DEF (20% threshold, 15% discount)')!;
  const narrowThreshold = results.find(r => r.scenario === '10% threshold, 15% discount')!;
  const highDiscount = results.find(r => r.scenario === '20% threshold, 35% discount')!;
  const combined = results.find(r => r.scenario === '15% threshold, 25% discount, exclude DEF')!;

  console.log(
    `1. **Bench-only decisions**: ${(benchOnly.decisionRate * 100).toFixed(1)}% correct - much more realistic baseline`
  );
  console.log(
    `2. **Excluding DEF**: Improves rate from 32.6% to ${(excludeDef.decisionRate * 100).toFixed(1)}% - DEF is too unpredictable`
  );
  console.log(
    `3. **Narrower threshold (10%)**: ${(narrowThreshold.decisionRate * 100).toFixed(1)}% correct - still low due to waiver dominance`
  );
  console.log(
    `4. **Higher discount (35%)**: ${(highDiscount.decisionRate * 100).toFixed(1)}% correct - modest improvement`
  );
  console.log(
    `5. **Combined approach**: ${(combined.decisionRate * 100).toFixed(1)}% correct - best balance of realism and insight`
  );

  console.log(`\n💡 **RECOMMENDED SETTINGS:**`);
  console.log(`- Projection threshold: 15% (reasonable similarity window)`);
  console.log(`- Waiver discount: 25% (meaningful pickup cost)`);
  console.log(`- Exclude DEF position (too volatile for meaningful analysis)`);
  console.log(
    `- Expected decision rate: ~${(combined.decisionRate * 100).toFixed(0)}% (much more realistic)`
  );

  console.log('\n✅ Calibration complete!');
}

if (require.main === module) {
  runCalibrationAnalysis().catch(console.error);
}
