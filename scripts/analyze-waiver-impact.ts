#!/usr/bin/env node

/**
 * Exploratory Analysis: Waiver Wire Impact on Start/Sit Decisions
 *
 * Investigates:
 * 1. What percentage of suboptimality comes from waiver wire vs bench players?
 * 2. Is the 20% projection window too wide?
 * 3. How do different discount rates affect decision rates?
 * 4. Distribution of "missed opportunities" by source
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
  pass_2pt: 2,
  rush_yd: 0.1,
  rush_td: 6,
  rush_2pt: 2,
  rec_yd: 0.1,
  rec_td: 6,
  rec: 0.5,
  rec_2pt: 2,
  fum_lost: -2,
  xpm: 1,
  xpmiss: -1,
  fgmiss: -1,
  sack: 1,
  int: 2,
  def_td: 6,
  pts_allow: -0.02,
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

interface AlternativeAnalysis {
  source: 'bench' | 'waiver';
  playerId: string;
  projectedPoints: number;
  actualPoints: number;
  projectionDiff: number; // vs selected player's projection
  actualDiff: number; // vs selected player's actual
  adjustedActualDiff: number; // after discount
}

interface DecisionAnalysis {
  managerId: string;
  managerName: string;
  leagueId: string;
  week: number;
  position: string;
  selectedPlayer: PlayerProjection;
  alternatives: AlternativeAnalysis[];
  bestBench?: AlternativeAnalysis;
  bestWaiver?: AlternativeAnalysis;
  bestOverall: AlternativeAnalysis;
  missedPointsBench: number;
  missedPointsWaiver: number;
  suboptimalitySource: 'bench' | 'waiver' | 'none';
}

async function fetchFromSleeper<T>(endpoint: string): Promise<T> {
  const baseUrl = 'https://api.sleeper.app/v1';
  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: { 'User-Agent': 'Gauntlet-WaiverAnalysis/1.0.0' },
  });

  if (!response.ok) {
    throw new Error(`Sleeper API error: ${response.status} ${response.statusText}`);
  }

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

/**
 * Analyze alternatives with different thresholds and discounts
 */
function analyzeAlternatives(
  managerRoster: string[],
  managerStarters: string[],
  rosteredPlayers: Set<string>,
  rosterSlot: string,
  selectedPlayer: PlayerProjection,
  allProjections: Map<string, PlayerProjection>,
  playerPositions: Map<string, string>,
  projectionThreshold: number,
  waiverDiscount: number
): AlternativeAnalysis[] {
  const alternatives: AlternativeAnalysis[] = [];

  // 1. Bench players
  for (const playerId of managerRoster) {
    if (managerStarters.includes(playerId)) continue;
    if (playerId === selectedPlayer.playerId) continue;

    const playerPos = playerPositions.get(playerId);
    if (!playerPos || !isPlayerEligible(playerPos, rosterSlot)) continue;

    const projection = allProjections.get(playerId);
    if (!projection) continue;

    const projectionDiff = projection.projectedPoints - selectedPlayer.projectedPoints;
    const actualDiff = projection.actualPoints - selectedPlayer.actualPoints;

    alternatives.push({
      source: 'bench',
      playerId,
      projectedPoints: projection.projectedPoints,
      actualPoints: projection.actualPoints,
      projectionDiff,
      actualDiff,
      adjustedActualDiff: actualDiff, // No discount for bench
    });
  }

  // 2. Waiver wire players (within threshold)
  const maxProjectionDiff = selectedPlayer.projectedPoints * projectionThreshold;

  for (const [playerId, projection] of allProjections) {
    if (rosteredPlayers.has(playerId)) continue;

    const playerPos = playerPositions.get(playerId);
    if (!playerPos || !isPlayerEligible(playerPos, rosterSlot)) continue;

    const projectionDiff = Math.abs(projection.projectedPoints - selectedPlayer.projectedPoints);
    if (projectionDiff > maxProjectionDiff) continue;

    const actualDiff = projection.actualPoints - selectedPlayer.actualPoints;
    const adjustedActualDiff =
      projection.actualPoints * (1 - waiverDiscount) - selectedPlayer.actualPoints;

    alternatives.push({
      source: 'waiver',
      playerId,
      projectedPoints: projection.projectedPoints,
      actualPoints: projection.actualPoints,
      projectionDiff: projection.projectedPoints - selectedPlayer.projectedPoints,
      actualDiff,
      adjustedActualDiff,
    });
  }

  return alternatives;
}

async function analyzeWaiverImpact(
  projectionThresholds: number[] = [0.1, 0.15, 0.2, 0.25, 0.3],
  waiverDiscounts: number[] = [0.1, 0.15, 0.2, 0.25, 0.3]
) {
  console.log('🔍 WAIVER WIRE IMPACT ANALYSIS\n');

  const leagueId = CURRENT_LEAGUES[0].id; // AFC league for focused analysis
  const week = 3; // Use Week 3 as a sample

  // Fetch data
  const [matchups, projections, stats, users, rosters, allPlayers] = await Promise.all([
    fetchFromSleeper<any[]>(`/league/${leagueId}/matchups/${week}`),
    fetchFromSleeper<Record<string, any>>(`/projections/nfl/regular/2025/${week}`),
    fetchFromSleeper<Record<string, any>>(`/stats/nfl/regular/2025/${week}`),
    fetchFromSleeper<any[]>(`/league/${leagueId}/users`),
    fetchFromSleeper<any[]>(`/league/${leagueId}/rosters`),
    fetchFromSleeper<Record<string, any>>('/players/nfl'),
  ]);

  // Build maps
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

  console.log(`📊 Dataset: AFC League Week ${week}`);
  console.log(`- ${matchups.length} matchups`);
  console.log(`- ${allProjections.size} players with projections & stats`);
  console.log(`- ${rosteredPlayers.size} rostered players\n`);

  // Analyze with base parameters first
  const baseThreshold = 0.2;
  const baseDiscount = 0.15;

  console.log('🎯 BASE ANALYSIS (20% threshold, 15% discount)\n');

  const baseDecisions: DecisionAnalysis[] = [];

  for (const matchup of matchups) {
    const rosterId = matchup.roster_id;
    const ownerId = rosterToOwner.get(rosterId);
    const user = userMap.get(ownerId);
    const managerName = user?.display_name || `Manager ${rosterId}`;

    const starters = matchup.starters || [];
    const roster = matchup.players || [];

    for (let i = 0; i < starters.length; i++) {
      const playerId = starters[i];
      if (!playerId) continue;

      const rosterSlot = ROSTER_POSITIONS[i];
      if (!rosterSlot) continue;

      const selectedProjection = allProjections.get(playerId);
      if (!selectedProjection) continue;

      const alternatives = analyzeAlternatives(
        roster,
        starters,
        rosteredPlayers,
        rosterSlot,
        selectedProjection,
        allProjections,
        playerPositions,
        baseThreshold,
        baseDiscount
      );

      if (alternatives.length === 0) continue;

      // Find best alternatives by source
      const benchAlts = alternatives.filter(a => a.source === 'bench');
      const waiverAlts = alternatives.filter(a => a.source === 'waiver');

      const bestBench =
        benchAlts.length > 0
          ? benchAlts.reduce((best, current) =>
              current.adjustedActualDiff > best.adjustedActualDiff ? current : best
            )
          : undefined;

      const bestWaiver =
        waiverAlts.length > 0
          ? waiverAlts.reduce((best, current) =>
              current.adjustedActualDiff > best.adjustedActualDiff ? current : best
            )
          : undefined;

      const bestOverall = alternatives.reduce((best, current) =>
        current.adjustedActualDiff > best.adjustedActualDiff ? current : best
      );

      const missedPointsBench = bestBench ? Math.max(0, bestBench.adjustedActualDiff) : 0;
      const missedPointsWaiver = bestWaiver ? Math.max(0, bestWaiver.adjustedActualDiff) : 0;

      let suboptimalitySource: 'bench' | 'waiver' | 'none' = 'none';
      if (bestOverall.adjustedActualDiff > 0) {
        suboptimalitySource = bestOverall.source;
      }

      baseDecisions.push({
        managerId: ownerId || String(rosterId),
        managerName,
        leagueId,
        week,
        position: rosterSlot,
        selectedPlayer: selectedProjection,
        alternatives,
        bestBench,
        bestWaiver,
        bestOverall,
        missedPointsBench,
        missedPointsWaiver,
        suboptimalitySource,
      });
    }
  }

  // Analyze results
  console.log(`Total decisions analyzed: ${baseDecisions.length}\n`);

  // Source of suboptimality breakdown
  const suboptimalDecisions = baseDecisions.filter(d => d.suboptimalitySource !== 'none');
  const benchSuboptimal = suboptimalDecisions.filter(d => d.suboptimalitySource === 'bench').length;
  const waiverSuboptimal = suboptimalDecisions.filter(
    d => d.suboptimalitySource === 'waiver'
  ).length;

  console.log('📈 SUBOPTIMALITY BREAKDOWN:');
  console.log(
    `- Total suboptimal decisions: ${suboptimalDecisions.length} (${((suboptimalDecisions.length / baseDecisions.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `- Caused by bench players: ${benchSuboptimal} (${((benchSuboptimal / suboptimalDecisions.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `- Caused by waiver players: ${waiverSuboptimal} (${((waiverSuboptimal / suboptimalDecisions.length) * 100).toFixed(1)}%)`
  );

  // Points left on table breakdown
  const totalMissedBench = baseDecisions.reduce((sum, d) => sum + d.missedPointsBench, 0);
  const totalMissedWaiver = baseDecisions.reduce((sum, d) => sum + d.missedPointsWaiver, 0);
  const totalMissed = totalMissedBench + totalMissedWaiver;

  console.log(`\n💰 POINTS LEFT ON TABLE:`);
  console.log(
    `- From bench players: ${totalMissedBench.toFixed(1)} points (${((totalMissedBench / totalMissed) * 100).toFixed(1)}%)`
  );
  console.log(
    `- From waiver players: ${totalMissedWaiver.toFixed(1)} points (${((totalMissedWaiver / totalMissed) * 100).toFixed(1)}%)`
  );
  console.log(`- Total missed: ${totalMissed.toFixed(1)} points`);

  // Projection threshold analysis
  console.log(`\n🎯 PROJECTION THRESHOLD SENSITIVITY:\n`);

  for (const threshold of projectionThresholds) {
    let decisionsWithAlts = 0;
    let totalAlternatives = 0;
    let waiverAlternatives = 0;

    for (const matchup of matchups) {
      const starters = matchup.starters || [];
      const roster = matchup.players || [];

      for (let i = 0; i < Math.min(starters.length, ROSTER_POSITIONS.length); i++) {
        const playerId = starters[i];
        if (!playerId) continue;

        const rosterSlot = ROSTER_POSITIONS[i];
        const selectedProjection = allProjections.get(playerId);
        if (!selectedProjection) continue;

        const alternatives = analyzeAlternatives(
          roster,
          starters,
          rosteredPlayers,
          rosterSlot,
          selectedProjection,
          allProjections,
          playerPositions,
          threshold,
          baseDiscount
        );

        if (alternatives.length > 0) {
          decisionsWithAlts++;
          totalAlternatives += alternatives.length;
          waiverAlternatives += alternatives.filter(a => a.source === 'waiver').length;
        }
      }
    }

    console.log(
      `${(threshold * 100).toFixed(0)}% threshold: ${decisionsWithAlts} decisions with alternatives (avg ${(totalAlternatives / decisionsWithAlts).toFixed(1)} alts, ${((waiverAlternatives / totalAlternatives) * 100).toFixed(1)}% waiver)`
    );
  }

  // Discount rate sensitivity
  console.log(`\n💸 WAIVER DISCOUNT SENSITIVITY:\n`);

  for (const discount of waiverDiscounts) {
    let correctDecisions = 0;
    let totalDecisions = 0;

    for (const matchup of matchups) {
      const starters = matchup.starters || [];
      const roster = matchup.players || [];

      for (let i = 0; i < Math.min(starters.length, ROSTER_POSITIONS.length); i++) {
        const playerId = starters[i];
        if (!playerId) continue;

        const rosterSlot = ROSTER_POSITIONS[i];
        const selectedProjection = allProjections.get(playerId);
        if (!selectedProjection) continue;

        const alternatives = analyzeAlternatives(
          roster,
          starters,
          rosteredPlayers,
          rosterSlot,
          selectedProjection,
          allProjections,
          playerPositions,
          baseThreshold,
          discount
        );

        if (alternatives.length === 0) continue;

        const bestAlternative = alternatives.reduce((best, current) =>
          current.adjustedActualDiff > best.adjustedActualDiff ? current : best
        );

        if (bestAlternative.adjustedActualDiff <= 0) {
          correctDecisions++;
        }
        totalDecisions++;
      }
    }

    const decisionRate = ((correctDecisions / totalDecisions) * 100).toFixed(1);
    console.log(
      `${(discount * 100).toFixed(0)}% discount: ${decisionRate}% correct decisions (${correctDecisions}/${totalDecisions})`
    );
  }

  // Example bad decisions
  console.log(`\n🚨 TOP 5 WORST WAIVER WIRE "MISTAKES":\n`);

  const waiverMistakes = baseDecisions
    .filter(d => d.suboptimalitySource === 'waiver' && d.bestWaiver)
    .sort((a, b) => b.missedPointsWaiver - a.missedPointsWaiver)
    .slice(0, 5);

  for (const mistake of waiverMistakes) {
    const selectedName =
      allPlayers[mistake.selectedPlayer.playerId]?.full_name || mistake.selectedPlayer.playerId;
    const waiverName =
      allPlayers[mistake.bestWaiver!.playerId]?.full_name || mistake.bestWaiver!.playerId;

    console.log(`${mistake.managerName} (${mistake.position}):`);
    console.log(
      `  Started: ${selectedName} (${mistake.selectedPlayer.actualPoints.toFixed(1)} pts)`
    );
    console.log(
      `  Available: ${waiverName} (${mistake.bestWaiver!.actualPoints.toFixed(1)} pts, proj diff: ${mistake.bestWaiver!.projectionDiff.toFixed(1)})`
    );
    console.log(`  Missed: ${mistake.missedPointsWaiver.toFixed(1)} points after discount\n`);
  }

  console.log('✅ Analysis complete!');
}

// Run analysis
if (require.main === module) {
  analyzeWaiverImpact().catch(console.error);
}
