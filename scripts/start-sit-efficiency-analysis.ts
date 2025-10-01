#!/usr/bin/env node

/**
 * Start/Sit Efficiency Analysis Script
 *
 * Analyzes manager decision-making efficiency by evaluating:
 * 1. Did they pick the best starter from available alternatives?
 * 2. What percentage of maximum possible points did they achieve?
 *
 * Alternative pool includes:
 * - Manager's own bench players (eligible for the position slot)
 * - Waiver wire players (available for pickup, within 20% projection range)
 *
 * Evaluation criteria:
 * - Uses pre-game projections to determine "reasonable alternatives" (20% threshold)
 * - Judges decisions based on actual points scored (custom league scoring)
 * - Discounts waiver wire options by fixed percentage (cost of pickup)
 */

import { CURRENT_LEAGUES } from '../apps/web/src/config/leagues';
import {
  calculateLeagueProjection,
  type ScoringSettings,
} from '../apps/web/src/lib/calculate-league-projections';

// Configuration - CALIBRATED PARAMETERS
const PROJECTION_THRESHOLD = 0.15; // 15% threshold for "reasonable alternatives"
const WAIVER_DISCOUNT = 0.35; // 35% penalty for waiver wire pickups (realistic cost)
const CURRENT_SEASON = '2025';
const WEEKS_TO_ANALYZE = [1, 2, 3, 4]; // Completed weeks only
// Position weights for skill-based scoring (higher = more skill required)
const POSITION_WEIGHTS = {
  FLEX: 1.0, // Hardest decision - RB/WR/TE choice with most alternatives
  QB: 0.8, // Important but typically fewer viable alternatives
  RB1: 0.7, // Skill-based with moderate alternatives
  RB2: 0.7,
  WR1: 0.7,
  WR2: 0.7,
  TE: 0.6, // Often fewer alternatives on bench/waivers
  K: 0.4, // Somewhat predictable but limited skill component
  DEF: 0.3, // Most volatile - more luck than skill
};

// League scoring settings (from /apps/web/data/fantasy-league.json)
const LEAGUE_SCORING: ScoringSettings = {
  pass_yd: 0.04, // 1 point per 25 yards
  pass_td: 4,
  pass_int: -1,
  pass_2pt: 2,
  rush_yd: 0.1, // 1 point per 10 yards
  rush_td: 6,
  rush_2pt: 2,
  rec_yd: 0.1, // 1 point per 10 yards
  rec_td: 6,
  rec: 0.5, // Half PPR
  rec_2pt: 2,
  fum_lost: -2,
  // Kicking
  xpm: 1,
  xpmiss: -1,
  fgmiss: -1,
  // Defense (simplified - full settings in data file)
  sack: 1,
  int: 2,
  def_td: 6,
  pts_allow: -0.02,
};

// Position eligibility for each roster slot
const POSITION_ELIGIBILITY = {
  QB: ['QB'],
  RB: ['RB'],
  WR: ['WR'],
  TE: ['TE'],
  FLEX: ['RB', 'WR', 'TE'],
  K: ['K'],
  DEF: ['DEF'],
};

// Roster structure: ["QB", "RB", "RB", "WR", "WR", "TE", "FLEX", "K", "DEF", "BN"...]
const ROSTER_POSITIONS = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX', 'K', 'DEF'];

interface PlayerData {
  id: string;
  name: string;
  position: string;
  team?: string;
}

interface PlayerProjection {
  playerId: string;
  projectedPoints: number;
  actualPoints: number;
  rawProjection: any;
  rawStats: any;
}

interface AlternativePlayer extends PlayerProjection {
  source: 'bench' | 'waiver';
  adjustedActualPoints: number; // After applying waiver discount
}

interface PositionDecision {
  managerId: string;
  managerName: string;
  leagueId: string;
  week: number;
  position: string;
  selectedPlayer: PlayerProjection;
  alternatives: AlternativePlayer[];
  optimalPlayer: AlternativePlayer;
  decisionCorrect: boolean;
  pointsLeft: number; // Points lost by not selecting optimal
  efficiencyRate: number; // Percentage of max possible points achieved
  // Risk analysis
  isRiskyDecision: boolean; // Selected player had lower projection than alternatives
  riskyAlternatives: AlternativePlayer[]; // Players with higher projections they passed on
  projectionDifferential: number; // How much lower was selected player's projection vs best alternative
  actualOutcome: number; // Actual point differential (positive = risky decision paid off)
}

interface ManagerEfficiency {
  managerId: string;
  managerName: string;
  leagueId: string;
  decisions: PositionDecision[];
  overallDecisionRate: number;
  overallEfficiencyRate: number;
  weightedDecisionScore: number; // Skill-weighted decision score (0-1)
  pointsImpactScore: number; // Points gained over league median
  positionBreakdown: Record<
    string,
    {
      decisionRate: number;
      efficiencyRate: number;
      decisionsCount: number;
      weight: number;
      pointsLost: number;
      pointsLostVsMedian: number;
    }
  >;
}

/**
 * Fetch data from Sleeper API
 */
async function fetchFromSleeper<T>(endpoint: string): Promise<T> {
  const baseUrl = 'https://api.sleeper.app/v1';
  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: { 'User-Agent': 'Gauntlet-StartSit/1.0.0' },
  });

  if (!response.ok) {
    throw new Error(`Sleeper API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get all rosters for a league
 */
async function getLeagueRosters(leagueId: string) {
  return fetchFromSleeper<any[]>(`/league/${leagueId}/rosters`);
}

/**
 * Get all users for a league
 */
async function getLeagueUsers(leagueId: string) {
  return fetchFromSleeper<any[]>(`/league/${leagueId}/users`);
}

/**
 * Get matchup data for a specific week
 */
async function getWeekMatchups(leagueId: string, week: number) {
  return fetchFromSleeper<any[]>(`/league/${leagueId}/matchups/${week}`);
}

/**
 * Get player projections for a week
 */
async function getWeekProjections(season: string, week: number) {
  return fetchFromSleeper<Record<string, any>>(`/projections/nfl/regular/${season}/${week}`);
}

/**
 * Get actual player stats for a week
 */
async function getWeekStats(season: string, week: number) {
  return fetchFromSleeper<Record<string, any>>(`/stats/nfl/regular/${season}/${week}`);
}

/**
 * Get all NFL players data
 */
async function getAllPlayers() {
  return fetchFromSleeper<Record<string, any>>('/players/nfl');
}

/**
 * Calculate fantasy points using league scoring settings
 */
function calculateFantasyPoints(stats: any, scoring: ScoringSettings): number {
  return calculateLeagueProjection(stats, scoring).points;
}

/**
 * Determine which position slot a player was started in
 */
function determineStarterPosition(
  playerId: string,
  starters: string[],
  playerPositions: Map<string, string>
): string | null {
  const starterIndex = starters.indexOf(playerId);
  if (starterIndex === -1) return null;

  const playerPos = playerPositions.get(playerId);
  if (!playerPos) return null;

  // Map starter index to roster position based on standard lineup
  // ["QB", "RB", "RB", "WR", "WR", "TE", "FLEX", "K", "DEF"]
  const positionMap: Record<number, string> = {
    0: 'QB',
    1: 'RB1',
    2: 'RB2',
    3: 'WR1',
    4: 'WR2',
    5: 'TE',
    6: 'FLEX',
    7: 'K',
    8: 'DEF',
  };

  return positionMap[starterIndex] || null;
}

/**
 * Check if a player is eligible for a roster position
 */
function isPlayerEligible(playerPosition: string, rosterSlot: string): boolean {
  const eligiblePositions = POSITION_ELIGIBILITY[rosterSlot as keyof typeof POSITION_ELIGIBILITY];
  return eligiblePositions?.includes(playerPosition) || false;
}

/**
 * Get all players rostered across the league for a given week
 */
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
 * Build alternative players pool for a position decision
 */
function buildAlternativesPool(
  managerRoster: string[],
  managerStarters: string[],
  rosteredPlayers: Set<string>,
  rosterSlot: string,
  selectedPlayer: PlayerProjection,
  allProjections: Map<string, PlayerProjection>,
  playerPositions: Map<string, string>
): AlternativePlayer[] {
  const alternatives: AlternativePlayer[] = [];

  // 1. Manager's own bench players (eligible for this position)
  for (const playerId of managerRoster) {
    if (managerStarters.includes(playerId)) continue; // Skip starters
    if (playerId === selectedPlayer.playerId) continue; // Skip selected player

    const playerPos = playerPositions.get(playerId);
    if (!playerPos || !isPlayerEligible(playerPos, rosterSlot)) continue;

    const projection = allProjections.get(playerId);
    if (!projection) continue;

    alternatives.push({
      ...projection,
      source: 'bench',
      adjustedActualPoints: projection.actualPoints, // No discount for bench
    });
  }

  // 2. Waiver wire players (within projection threshold)
  const projectionThreshold = selectedPlayer.projectedPoints * PROJECTION_THRESHOLD;

  for (const [playerId, projection] of allProjections) {
    if (rosteredPlayers.has(playerId)) continue; // Skip rostered players

    const playerPos = playerPositions.get(playerId);
    if (!playerPos || !isPlayerEligible(playerPos, rosterSlot)) continue;

    // Only include players within projection threshold
    if (
      Math.abs(projection.projectedPoints - selectedPlayer.projectedPoints) > projectionThreshold
    ) {
      continue;
    }

    alternatives.push({
      ...projection,
      source: 'waiver',
      adjustedActualPoints: projection.actualPoints * (1 - WAIVER_DISCOUNT), // Apply discount
    });
  }

  return alternatives;
}

/**
 * Analyze a single position decision
 */
function analyzePositionDecision(
  managerId: string,
  managerName: string,
  leagueId: string,
  week: number,
  rosterSlot: string,
  selectedPlayer: PlayerProjection,
  alternatives: AlternativePlayer[]
): PositionDecision {
  // Find optimal alternative (highest adjusted actual points)
  const allOptions = [
    {
      ...selectedPlayer,
      source: 'selected' as const,
      adjustedActualPoints: selectedPlayer.actualPoints,
    },
    ...alternatives,
  ];

  const optimalPlayer = allOptions.reduce((best, current) =>
    current.adjustedActualPoints > best.adjustedActualPoints ? current : best
  );

  const decisionCorrect = optimalPlayer.playerId === selectedPlayer.playerId;
  const pointsLeft = optimalPlayer.adjustedActualPoints - selectedPlayer.actualPoints;
  const efficiencyRate =
    optimalPlayer.adjustedActualPoints > 0
      ? selectedPlayer.actualPoints / optimalPlayer.adjustedActualPoints
      : selectedPlayer.actualPoints >= 0
        ? 1
        : 0; // Handle division by zero

  // Risk analysis - did they pick someone with lower projection?
  const riskyAlternatives = alternatives.filter(
    alt => alt.projectedPoints > selectedPlayer.projectedPoints
  );
  const isRiskyDecision = riskyAlternatives.length > 0;

  let projectionDifferential = 0;
  let actualOutcome = 0;

  if (isRiskyDecision) {
    const bestProjectedAlternative = riskyAlternatives.reduce((best, current) =>
      current.projectedPoints > best.projectedPoints ? current : best
    );
    projectionDifferential =
      bestProjectedAlternative.projectedPoints - selectedPlayer.projectedPoints;
    actualOutcome = selectedPlayer.actualPoints - bestProjectedAlternative.actualPoints;
  }

  return {
    managerId,
    managerName,
    leagueId,
    week,
    position: rosterSlot,
    selectedPlayer,
    alternatives,
    optimalPlayer,
    decisionCorrect,
    pointsLeft,
    efficiencyRate: Math.min(efficiencyRate, 1), // Cap at 100%
    isRiskyDecision,
    riskyAlternatives,
    projectionDifferential,
    actualOutcome,
  };
}

/**
 * Deduplicate alternatives that appear in multiple positions for the same manager-week
 * A player can only fill one position, so we assign them to where they provide max benefit
 */
function deduplicateManagerDecisions(managerDecisions: PositionDecision[]): PositionDecision[] {
  if (managerDecisions.length === 0) return managerDecisions;

  // Find players that appear as optimal in multiple positions
  const playerPositions = new Map<string, PositionDecision[]>();

  for (const decision of managerDecisions) {
    if (!decision.decisionCorrect && decision.pointsLeft > 0) {
      const playerId = decision.optimalPlayer.playerId;
      if (!playerPositions.has(playerId)) {
        playerPositions.set(playerId, []);
      }
      playerPositions.get(playerId)!.push(decision);
    }
  }

  // For players appearing in multiple positions, keep them only in the position with max benefit
  const adjustedDecisions = [...managerDecisions];

  for (const [playerId, decisionsWithPlayer] of playerPositions) {
    if (decisionsWithPlayer.length <= 1) continue; // No duplication

    // Sort by points benefit (descending) and keep player in the position with highest benefit
    decisionsWithPlayer.sort((a, b) => b.pointsLeft - a.pointsLeft);
    const bestPosition = decisionsWithPlayer[0];

    // For other positions, find the next best alternative (excluding this player)
    for (let i = 1; i < decisionsWithPlayer.length; i++) {
      const decision = decisionsWithPlayer[i];
      const decisionIndex = adjustedDecisions.indexOf(decision);

      // Find next best alternative excluding the duplicated player
      const otherAlternatives = decision.alternatives.filter(alt => alt.playerId !== playerId);

      if (otherAlternatives.length === 0) {
        // No other alternatives, mark as correct decision (no better option available)
        adjustedDecisions[decisionIndex] = {
          ...decision,
          decisionCorrect: true,
          pointsLeft: 0,
          efficiencyRate: 1.0,
          optimalPlayer: {
            ...decision.selectedPlayer,
            source: 'selected' as const,
            adjustedActualPoints: decision.selectedPlayer.actualPoints,
          },
        };
      } else {
        // Use next best alternative
        const nextBestAlternative = otherAlternatives.reduce((best, current) =>
          current.adjustedActualPoints > best.adjustedActualPoints ? current : best
        );

        const newPointsLeft =
          nextBestAlternative.adjustedActualPoints - decision.selectedPlayer.actualPoints;
        const newDecisionCorrect =
          nextBestAlternative.playerId === decision.selectedPlayer.playerId;
        const newEfficiencyRate =
          nextBestAlternative.adjustedActualPoints > 0
            ? decision.selectedPlayer.actualPoints / nextBestAlternative.adjustedActualPoints
            : decision.selectedPlayer.actualPoints >= 0
              ? 1
              : 0;

        adjustedDecisions[decisionIndex] = {
          ...decision,
          optimalPlayer: nextBestAlternative,
          pointsLeft: newPointsLeft,
          decisionCorrect: newDecisionCorrect,
          efficiencyRate: Math.min(newEfficiencyRate, 1),
        };
      }
    }
  }

  return adjustedDecisions;
}

/**
 * Analyze start/sit efficiency for a single week and league
 */
async function analyzeWeek(leagueId: string, week: number): Promise<PositionDecision[]> {
  console.log(`\n📊 Analyzing ${leagueId} Week ${week}...`);

  // Fetch all required data
  const [matchups, projections, stats, users, rosters, allPlayers] = await Promise.all([
    getWeekMatchups(leagueId, week),
    getWeekProjections(CURRENT_SEASON, week),
    getWeekStats(CURRENT_SEASON, week),
    getLeagueUsers(leagueId),
    getLeagueRosters(leagueId),
    getAllPlayers(),
  ]);

  // Build lookup maps
  const userMap = new Map(users.map((u: any) => [u.user_id, u]));
  const rosterToOwner = new Map(rosters.map((r: any) => [r.roster_id, r.owner_id]));
  const playerPositions = new Map<string, string>();

  for (const [playerId, playerData] of Object.entries(allPlayers)) {
    if (playerData && typeof playerData === 'object' && 'position' in playerData) {
      playerPositions.set(playerId, (playerData as any).position);
    }
  }

  // Build projections map with calculated points
  const allProjections = new Map<string, PlayerProjection>();

  for (const [playerId, rawProjection] of Object.entries(projections)) {
    const rawStat = stats[playerId];
    if (!rawProjection || !rawStat) continue;

    const projectedPoints = calculateFantasyPoints(rawProjection, LEAGUE_SCORING);
    const actualPoints = calculateFantasyPoints(rawStat, LEAGUE_SCORING);

    if (projectedPoints <= 0) continue; // Skip players with no projection

    allProjections.set(playerId, {
      playerId,
      projectedPoints,
      actualPoints,
      rawProjection,
      rawStats: rawStat,
    });
  }

  // Get all rostered players for waiver wire determination
  const rosteredPlayers = getRosteredPlayers(matchups);

  const decisions: PositionDecision[] = [];

  // Analyze each matchup
  for (const matchup of matchups) {
    const rosterId = matchup.roster_id;
    const ownerId = rosterToOwner.get(rosterId);
    const user = userMap.get(ownerId);
    const managerName = user?.display_name || `Manager ${rosterId}`;

    const starters = matchup.starters || [];
    const roster = matchup.players || [];

    const managerDecisions: PositionDecision[] = [];

    // Analyze each starter
    for (let i = 0; i < starters.length; i++) {
      const playerId = starters[i];
      if (!playerId) continue;

      const rosterSlot = ROSTER_POSITIONS[i];
      if (!rosterSlot) continue;

      const selectedProjection = allProjections.get(playerId);
      if (!selectedProjection) continue;

      // Build alternatives pool
      const alternatives = buildAlternativesPool(
        roster,
        starters,
        rosteredPlayers,
        rosterSlot,
        selectedProjection,
        allProjections,
        playerPositions
      );

      if (alternatives.length === 0) continue; // No alternatives available

      // Analyze decision
      const decision = analyzePositionDecision(
        ownerId || String(rosterId),
        managerName,
        leagueId,
        week,
        rosterSlot,
        selectedProjection,
        alternatives
      );

      managerDecisions.push(decision);
    }

    // Deduplicate alternatives that appear in multiple positions
    const deduplicatedDecisions = deduplicateManagerDecisions(managerDecisions);
    decisions.push(...deduplicatedDecisions);
  }

  console.log(`   ✅ Analyzed ${decisions.length} position decisions`);
  return decisions;
}

/**
 * Calculate manager-level efficiency metrics with weighted scoring
 */
function calculateManagerEfficiency(decisions: PositionDecision[]): ManagerEfficiency[] {
  const managerDecisions = new Map<string, PositionDecision[]>();

  // Group decisions by manager
  for (const decision of decisions) {
    const key = `${decision.leagueId}-${decision.managerId}`;
    if (!managerDecisions.has(key)) {
      managerDecisions.set(key, []);
    }
    managerDecisions.get(key)!.push(decision);
  }

  // Calculate league medians for points impact scoring (manager total points lost per position)
  // First, group decisions by manager and position to get manager-level totals
  const managerPositionTotals = new Map<string, Map<string, number>>();
  for (const decision of decisions) {
    const managerKey = `${decision.leagueId}-${decision.managerId}`;
    if (!managerPositionTotals.has(managerKey)) {
      managerPositionTotals.set(managerKey, new Map());
    }
    const managerPositions = managerPositionTotals.get(managerKey)!;
    const currentTotal = managerPositions.get(decision.position) || 0;
    managerPositions.set(decision.position, currentTotal + Math.max(0, decision.pointsLeft));
  }

  // Now calculate medians based on manager totals, not individual decisions
  const positionMedians = new Map<string, number>();
  const positionManagerTotals = new Map<string, number[]>();

  for (const [managerKey, positions] of managerPositionTotals) {
    for (const [position, total] of positions) {
      if (!positionManagerTotals.has(position)) {
        positionManagerTotals.set(position, []);
      }
      positionManagerTotals.get(position)!.push(total);
    }
  }

  for (const [position, totals] of positionManagerTotals) {
    const sorted = totals.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    positionMedians.set(position, median);
  }

  const results: ManagerEfficiency[] = [];

  for (const [key, managerDecisionList] of managerDecisions) {
    const firstDecision = managerDecisionList[0];
    const correctDecisions = managerDecisionList.filter(d => d.decisionCorrect).length;
    const totalEfficiency = managerDecisionList.reduce((sum, d) => sum + d.efficiencyRate, 0);

    // Calculate weighted decision score
    let weightedCorrectDecisions = 0;
    let totalWeight = 0;
    let totalPointsImpact = 0;

    // Position breakdown
    const positionBreakdown: Record<
      string,
      {
        decisionRate: number;
        efficiencyRate: number;
        decisionsCount: number;
        weight: number;
        pointsLost: number;
        pointsLostVsMedian: number;
      }
    > = {};

    const positionGroups = new Map<string, PositionDecision[]>();
    for (const decision of managerDecisionList) {
      if (!positionGroups.has(decision.position)) {
        positionGroups.set(decision.position, []);
      }
      positionGroups.get(decision.position)!.push(decision);
    }

    for (const [position, posDecisions] of positionGroups) {
      const correct = posDecisions.filter(d => d.decisionCorrect).length;
      const efficiency = posDecisions.reduce((sum, d) => sum + d.efficiencyRate, 0);
      const pointsLost = posDecisions.reduce((sum, d) => sum + Math.max(0, d.pointsLeft), 0);
      const positionMedian = positionMedians.get(position) || 0;
      // Positive means manager performed better than median (lost fewer points)
      // Now comparing manager's total to median total (both are totals, not per-decision)
      const pointsLostVsMedian = positionMedian - pointsLost;

      const weight = POSITION_WEIGHTS[position as keyof typeof POSITION_WEIGHTS] || 0.5;

      // Contribute to weighted totals
      weightedCorrectDecisions += correct * weight;
      totalWeight += posDecisions.length * weight;
      totalPointsImpact += pointsLostVsMedian;

      positionBreakdown[position] = {
        decisionRate: correct / posDecisions.length,
        efficiencyRate: efficiency / posDecisions.length,
        decisionsCount: posDecisions.length,
        weight,
        pointsLost,
        pointsLostVsMedian,
      };
    }

    const weightedDecisionScore = totalWeight > 0 ? weightedCorrectDecisions / totalWeight : 0;

    results.push({
      managerId: firstDecision.managerId,
      managerName: firstDecision.managerName,
      leagueId: firstDecision.leagueId,
      decisions: managerDecisionList,
      overallDecisionRate: correctDecisions / managerDecisionList.length,
      overallEfficiencyRate: totalEfficiency / managerDecisionList.length,
      weightedDecisionScore,
      pointsImpactScore: totalPointsImpact,
      positionBreakdown,
    });
  }

  return results.sort((a, b) => b.weightedDecisionScore - a.weightedDecisionScore);
}

/**
 * Get detailed roster context for each manager's decisions
 */
function getManagerRosterContext(decisions: PositionDecision[]): any[] {
  const managerWeeks = new Map<string, Map<number, any>>();

  // Group decisions by manager and week
  for (const decision of decisions) {
    const managerKey = `${decision.managerId}-${decision.leagueId}`;
    if (!managerWeeks.has(managerKey)) {
      managerWeeks.set(managerKey, new Map());
    }
    if (!managerWeeks.get(managerKey)!.has(decision.week)) {
      managerWeeks.get(managerKey)!.set(decision.week, {
        managerId: decision.managerId,
        managerName: decision.managerName,
        leagueId: decision.leagueId,
        week: decision.week,
        startingLineup: [],
        benchPlayers: [],
        waiverAlternatives: [],
        decisions: [],
      });
    }

    const weekData = managerWeeks.get(managerKey)!.get(decision.week)!;
    weekData.decisions.push(decision);

    // Add started player
    weekData.startingLineup.push({
      position: decision.position,
      player: decision.selectedPlayer,
      pointsScored: decision.selectedPlayer.actualPoints,
    });

    // Add alternatives
    for (const alt of decision.alternatives) {
      if (alt.source === 'bench') {
        if (!weekData.benchPlayers.find((p: any) => p.playerId === alt.playerId)) {
          weekData.benchPlayers.push({
            player: alt,
            pointsScored: alt.actualPoints,
            wasAlternativeFor: [decision.position],
          });
        } else {
          weekData.benchPlayers
            .find((p: any) => p.playerId === alt.playerId)
            .wasAlternativeFor.push(decision.position);
        }
      } else if (alt.source === 'waiver') {
        if (!weekData.waiverAlternatives.find((p: any) => p.playerId === alt.playerId)) {
          weekData.waiverAlternatives.push({
            player: alt,
            pointsScored: alt.actualPoints,
            adjustedPoints: alt.adjustedActualPoints,
            wasAlternativeFor: [decision.position],
          });
        } else {
          weekData.waiverAlternatives
            .find((p: any) => p.playerId === alt.playerId)
            .wasAlternativeFor.push(decision.position);
        }
      }
    }
  }

  // Flatten into array
  const result = [];
  for (const [managerKey, weeks] of managerWeeks) {
    for (const [week, weekData] of weeks) {
      result.push(weekData);
    }
  }

  return result.sort((a, b) => {
    if (a.managerName !== b.managerName) return a.managerName.localeCompare(b.managerName);
    return a.week - b.week;
  });
}

/**
 * Get worst decisions across all managers (most points left on table)
 */
function getWorstDecisions(decisions: PositionDecision[], count: number = 10) {
  return decisions
    .filter(d => d.pointsLeft > 0)
    .sort((a, b) => b.pointsLeft - a.pointsLeft)
    .slice(0, count)
    .map(decision => ({
      ...decision,
      weight: POSITION_WEIGHTS[decision.position as keyof typeof POSITION_WEIGHTS] || 0.5,
    }));
}

/**
 * Get best risky decisions (lower projection but higher actual performance)
 */
function getBestRiskyDecisions(decisions: PositionDecision[], count: number = 10) {
  return decisions
    .filter(d => d.isRiskyDecision && d.actualOutcome > 0)
    .sort((a, b) => b.actualOutcome - a.actualOutcome)
    .slice(0, count)
    .map(decision => ({
      ...decision,
      weight: POSITION_WEIGHTS[decision.position as keyof typeof POSITION_WEIGHTS] || 0.5,
    }));
}

/**
 * Main analysis function
 */
async function analyzeStartSitEfficiency() {
  console.log('🚀 Starting Start/Sit Efficiency Analysis...\n');
  console.log(`Configuration (WEIGHTED SCORING):`);
  console.log(`- Projection threshold: ${PROJECTION_THRESHOLD * 100}% (reasonable similarity)`);
  console.log(`- Waiver discount: ${WAIVER_DISCOUNT * 100}% (realistic pickup cost)`);
  console.log(`- Position weights: FLEX(1.0), QB(0.8), RB/WR(0.7), TE(0.6), K(0.4), DEF(0.3)`);
  console.log(`- Weeks: ${WEEKS_TO_ANALYZE.join(', ')}`);
  console.log(`- Leagues: ${CURRENT_LEAGUES.map(l => l.name).join(', ')}`);

  const allDecisions: PositionDecision[] = [];

  // Analyze each week for each league
  for (const league of CURRENT_LEAGUES) {
    for (const week of WEEKS_TO_ANALYZE) {
      try {
        const weekDecisions = await analyzeWeek(league.id, week);
        allDecisions.push(...weekDecisions);
      } catch (error) {
        console.error(`❌ Error analyzing ${league.name} Week ${week}:`, error);
      }
    }
  }

  console.log(`\n📈 Analysis complete! Processed ${allDecisions.length} total decisions\n`);

  // Calculate manager efficiency
  const managerEfficiencies = calculateManagerEfficiency(allDecisions);

  // Display results
  console.log('📊 MANAGER START/SIT EFFICIENCY RANKINGS (Weighted by Position Skill)\n');
  console.log(
    'Rank | Manager                 | League | Weighted Score | Points vs Median | Raw Rate | Decisions'
  );
  console.log('-'.repeat(95));

  managerEfficiencies.forEach((manager, index) => {
    const rank = (index + 1).toString().padStart(4);
    const name = manager.managerName.padEnd(23);
    const league = manager.leagueId.includes('44209') ? 'AFC' : 'NFC';
    const weightedScore = (manager.weightedDecisionScore * 100).toFixed(1) + '%';
    const pointsImpact =
      manager.pointsImpactScore >= 0
        ? '+' + manager.pointsImpactScore.toFixed(1)
        : manager.pointsImpactScore.toFixed(1);
    const rawRate = (manager.overallDecisionRate * 100).toFixed(1) + '%';
    const decisions = manager.decisions.length.toString();

    console.log(
      `${rank} | ${name} | ${league.padEnd(6)} | ${weightedScore.padStart(12)} | ${pointsImpact.padStart(14)} | ${rawRate.padStart(6)} | ${decisions.padStart(9)}`
    );
  });

  // Position breakdown for top manager
  if (managerEfficiencies.length > 0) {
    const topManager = managerEfficiencies[0];
    console.log(`\n🏆 Position Breakdown - ${topManager.managerName}:\n`);

    for (const [position, metrics] of Object.entries(topManager.positionBreakdown)) {
      const impact =
        metrics.pointsLostVsMedian >= 0
          ? '+' + metrics.pointsLostVsMedian.toFixed(1)
          : metrics.pointsLostVsMedian.toFixed(1);
      console.log(
        `${position.padEnd(6)}: ${(metrics.decisionRate * 100).toFixed(1)}% correct (wt: ${metrics.weight}), ${impact} pts vs median (${metrics.decisionsCount} decisions)`
      );
    }
  }

  // League averages
  const afcDecisions = allDecisions.filter(d => d.leagueId.includes('44209'));
  const nfcDecisions = allDecisions.filter(d => d.leagueId.includes('40549'));

  console.log('\n📊 LEAGUE AVERAGES:\n');
  if (afcDecisions.length > 0) {
    const afcCorrect = afcDecisions.filter(d => d.decisionCorrect).length;
    const afcEfficiency = afcDecisions.reduce((sum, d) => sum + d.efficiencyRate, 0);
    console.log(
      `AFC: ${((afcCorrect / afcDecisions.length) * 100).toFixed(1)}% correct, ${((afcEfficiency / afcDecisions.length) * 100).toFixed(1)}% efficient`
    );
  }

  if (nfcDecisions.length > 0) {
    const nfcCorrect = nfcDecisions.filter(d => d.decisionCorrect).length;
    const nfcEfficiency = nfcDecisions.reduce((sum, d) => sum + d.efficiencyRate, 0);
    console.log(
      `NFC: ${((nfcCorrect / nfcDecisions.length) * 100).toFixed(1)}% correct, ${((nfcEfficiency / nfcDecisions.length) * 100).toFixed(1)}% efficient`
    );
  }

  // Generate insights for UI - get all decisions (UI will filter)
  const worstDecisions = getWorstDecisions(allDecisions, 999);
  const bestRiskyDecisions = getBestRiskyDecisions(allDecisions, 999);

  const rosterContext = getManagerRosterContext(allDecisions);

  console.log(`\n💡 INSIGHTS FOR UI:`);
  console.log(`- ${worstDecisions.length} worst decisions identified (most points left on table)`);
  console.log(
    `- ${bestRiskyDecisions.length} best risky decisions identified (bold moves that paid off)`
  );
  console.log(`- ${managerEfficiencies.length} managers with full breakdowns`);
  console.log(`- ${rosterContext.length} manager-week roster contexts generated`);

  console.log('\n✅ Analysis complete!');

  // Export data for UI implementation
  const exportData = {
    configuration: {
      projectionThreshold: PROJECTION_THRESHOLD,
      waiverDiscount: WAIVER_DISCOUNT,
      positionWeights: POSITION_WEIGHTS,
      weeks: WEEKS_TO_ANALYZE,
      season: CURRENT_SEASON,
      weightedScoring: true,
    },
    managerEfficiencies,
    worstDecisions,
    bestRiskyDecisions,
    rosterContext,
    leagueStats: {
      totalDecisions: allDecisions.length,
      avgWeightedScore:
        managerEfficiencies.reduce((sum, m) => sum + m.weightedDecisionScore, 0) /
        managerEfficiencies.length,
      avgPointsImpact:
        managerEfficiencies.reduce((sum, m) => sum + m.pointsImpactScore, 0) /
        managerEfficiencies.length,
    },
    timestamp: new Date().toISOString(),
  };

  // Optional: Write to file for analysis
  const fs = await import('fs');
  const outputPath = `start-sit-analysis-${Date.now()}.json`;
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
  console.log(`💾 Detailed results exported to: ${outputPath}`);
}

// Run analysis
if (require.main === module) {
  analyzeStartSitEfficiency().catch(console.error);
}
