import { sleeperClient } from '@/lib/sleeper/unified-client';
import {
  calculateLeagueProjection,
  type ScoringSettings,
} from '@/lib/calculate-league-projections';
import { CURRENT_LEAGUES } from '@/config/leagues';
import { resolveCompletedWeeks } from '@/shared/utils/season-weeks';
import type {
  AlternativePlayer,
  ManagerEfficiencyDetailed as ManagerEfficiency,
  PlayerProjection,
  PositionBreakdownMetrics,
  PositionDecision,
  StartSitDataDetailed as StartSitData,
} from '@/features/start-sit/types';

// Configuration
const PROJECTION_THRESHOLD = 0.15; // 15%
const WAIVER_DISCOUNT = 0.35; // 35%
const FALLBACK_SEASON = '2025';
const FALLBACK_WEEKS = [1, 2, 3, 4];

const POSITION_WEIGHTS: Record<string, number> = {
  FLEX: 1.0,
  QB: 0.8,
  RB1: 0.7,
  RB2: 0.7,
  WR1: 0.7,
  WR2: 0.7,
  TE: 0.6,
  K: 0.4,
  DEF: 0.3,
};

const POSITION_ELIGIBILITY: Record<string, string[]> = {
  QB: ['QB'],
  RB: ['RB'],
  WR: ['WR'],
  TE: ['TE'],
  FLEX: ['RB', 'WR', 'TE'],
  K: ['K'],
  DEF: ['DEF'],
};

const ROSTER_POSITIONS = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX', 'K', 'DEF'];

const calculateFantasyPoints = (stats: any, scoring: ScoringSettings): number => {
  return calculateLeagueProjection(stats, scoring).points;
};

const isPlayerEligible = (playerPosition: string, rosterSlot: string): boolean => {
  const eligible = POSITION_ELIGIBILITY[rosterSlot] || [];
  return eligible.includes(playerPosition);
};

const buildAlternativesPool = (
  managerRoster: string[],
  managerStarters: string[],
  rosteredPlayers: Set<string>,
  rosterSlot: string,
  selectedPlayer: PlayerProjection,
  allProjections: Map<string, PlayerProjection>,
  playerPositions: Map<string, string>,
): AlternativePlayer[] => {
  const alternatives: AlternativePlayer[] = [];

  for (const playerId of managerRoster) {
    if (managerStarters.includes(playerId)) continue;
    if (playerId === selectedPlayer.playerId) continue;

    const playerPos = playerPositions.get(playerId);
    if (!playerPos || !isPlayerEligible(playerPos, rosterSlot)) continue;

    const projection = allProjections.get(playerId);
    if (!projection) continue;

    alternatives.push({
      ...projection,
      source: 'bench',
      adjustedActualPoints: projection.actualPoints,
    });
  }

  const projectionThreshold = selectedPlayer.projectedPoints * PROJECTION_THRESHOLD;

  for (const [playerId, projection] of allProjections) {
    if (rosteredPlayers.has(playerId)) continue;

    const playerPos = playerPositions.get(playerId);
    if (!playerPos || !isPlayerEligible(playerPos, rosterSlot)) continue;

    if (
      Math.abs(projection.projectedPoints - selectedPlayer.projectedPoints) > projectionThreshold
    ) {
      continue;
    }

    alternatives.push({
      ...projection,
      source: 'waiver',
      adjustedActualPoints: projection.actualPoints * (1 - WAIVER_DISCOUNT),
    });
  }

  return alternatives;
};

const analyzePositionDecision = (
  managerId: string,
  managerName: string,
  leagueId: string,
  week: number,
  rosterSlot: string,
  selectedPlayer: PlayerProjection,
  alternatives: AlternativePlayer[],
): PositionDecision => {
  const allOptions = [
    {
      ...selectedPlayer,
      source: 'selected' as const,
      adjustedActualPoints: selectedPlayer.actualPoints,
    },
    ...alternatives,
  ];

  const optimalPlayer = allOptions.reduce((best, current) =>
    current.adjustedActualPoints > (best as any).adjustedActualPoints ? current : best,
  ) as PositionDecision['optimalPlayer'];

  const decisionCorrect = (optimalPlayer as any).playerId === selectedPlayer.playerId;
  const pointsLeft = (optimalPlayer as any).adjustedActualPoints - selectedPlayer.actualPoints;
  const efficiencyRate =
    (optimalPlayer as any).adjustedActualPoints > 0
      ? selectedPlayer.actualPoints / (optimalPlayer as any).adjustedActualPoints
      : selectedPlayer.actualPoints >= 0
        ? 1
        : 0;

  const riskyAlternatives = alternatives.filter(
    alt => alt.projectedPoints > selectedPlayer.projectedPoints,
  );
  const isRiskyDecision = riskyAlternatives.length > 0;

  let projectionDifferential = 0;
  let actualOutcome = 0;

  if (isRiskyDecision) {
    const bestProjectedAlternative = riskyAlternatives.reduce((best, current) =>
      current.projectedPoints > best.projectedPoints ? current : best,
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
    efficiencyRate: Math.min(efficiencyRate, 1),
    isRiskyDecision,
    riskyAlternatives,
    projectionDifferential,
    actualOutcome,
  };
};

const deduplicateManagerDecisions = (managerDecisions: PositionDecision[]): PositionDecision[] => {
  if (managerDecisions.length === 0) return managerDecisions;

  const playerPositions = new Map<string, PositionDecision[]>();

  for (const decision of managerDecisions) {
    if (!decision.decisionCorrect && decision.pointsLeft > 0) {
      const playerId = (decision.optimalPlayer as any).playerId;
      if (!playerPositions.has(playerId)) {
        playerPositions.set(playerId, []);
      }
      playerPositions.get(playerId)!.push(decision);
    }
  }

  const adjusted = [...managerDecisions];

  for (const [playerId, decisionsWithPlayer] of playerPositions) {
    if (decisionsWithPlayer.length <= 1) continue;

    decisionsWithPlayer.sort((a, b) => b.pointsLeft - a.pointsLeft);
    const bestPosition = decisionsWithPlayer[0];
    void bestPosition; // keep for clarity

    for (let i = 1; i < decisionsWithPlayer.length; i++) {
      const decision = decisionsWithPlayer[i];
      const decisionIndex = adjusted.indexOf(decision);

      const otherAlternatives = decision.alternatives.filter(alt => alt.playerId !== playerId);

      if (otherAlternatives.length === 0) {
        adjusted[decisionIndex] = {
          ...decision,
          decisionCorrect: true,
          pointsLeft: 0,
          efficiencyRate: 1.0,
          optimalPlayer: {
            ...decision.selectedPlayer,
            source: 'selected',
            adjustedActualPoints: decision.selectedPlayer.actualPoints,
          },
        } as any;
      } else {
        const nextBest = otherAlternatives.reduce((best, current) =>
          current.adjustedActualPoints > best.adjustedActualPoints ? current : best,
        );

        const newPointsLeft = nextBest.adjustedActualPoints - decision.selectedPlayer.actualPoints;
        const newDecisionCorrect = nextBest.playerId === decision.selectedPlayer.playerId;
        const newEfficiencyRate =
          nextBest.adjustedActualPoints > 0
            ? decision.selectedPlayer.actualPoints / nextBest.adjustedActualPoints
            : decision.selectedPlayer.actualPoints >= 0
              ? 1
              : 0;

        adjusted[decisionIndex] = {
          ...decision,
          optimalPlayer: nextBest as any,
          pointsLeft: newPointsLeft,
          decisionCorrect: newDecisionCorrect,
          efficiencyRate: Math.min(newEfficiencyRate, 1),
        };
      }
    }
  }

  return adjusted;
};

const getWorstDecisions = (decisions: PositionDecision[], count = 10) => {
  return decisions
    .filter(d => d.pointsLeft > 0)
    .sort((a, b) => b.pointsLeft - a.pointsLeft)
    .slice(0, count)
    .map(d => ({ ...d, weight: POSITION_WEIGHTS[d.position] || 0.5 }));
};

const getBestRiskyDecisions = (decisions: PositionDecision[], count = 10) => {
  return decisions
    .filter(d => d.isRiskyDecision && d.actualOutcome > 0)
    .sort((a, b) => b.actualOutcome - a.actualOutcome)
    .slice(0, count)
    .map(d => ({ ...d, weight: POSITION_WEIGHTS[d.position] || 0.5 }));
};

const getManagerRosterContext = (decisions: PositionDecision[]): any[] => {
  const managerWeeks = new Map<string, Map<number, any>>();

  for (const decision of decisions) {
    const managerKey = `${decision.managerId}-${decision.leagueId}`;
    if (!managerWeeks.has(managerKey)) managerWeeks.set(managerKey, new Map());
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
    weekData.startingLineup.push({
      position: decision.position,
      player: decision.selectedPlayer,
      pointsScored: decision.selectedPlayer.actualPoints,
    });

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
      }
      if (alt.source === 'waiver') {
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

  const result: any[] = [];
  for (const [_managerKey, weeks] of managerWeeks) {
    for (const [_week, weekData] of weeks) result.push(weekData);
  }

  return result.sort((a, b) =>
    a.managerName !== b.managerName ? a.managerName.localeCompare(b.managerName) : a.week - b.week,
  );
};

const calculateManagerEfficiency = (decisions: PositionDecision[]): ManagerEfficiency[] => {
  const managerGroups = new Map<string, PositionDecision[]>();
  for (const decision of decisions) {
    const key = `${decision.leagueId}-${decision.managerId}`;
    if (!managerGroups.has(key)) managerGroups.set(key, []);
    managerGroups.get(key)!.push(decision);
  }

  // Manager totals per position
  const managerPositionTotals = new Map<string, Map<string, number>>();
  for (const decision of decisions) {
    const managerKey = `${decision.leagueId}-${decision.managerId}`;
    if (!managerPositionTotals.has(managerKey)) managerPositionTotals.set(managerKey, new Map());
    const m = managerPositionTotals.get(managerKey)!;
    const cur = m.get(decision.position) || 0;
    m.set(decision.position, cur + Math.max(0, decision.pointsLeft));
  }

  // Medians per position across managers
  const positionMedians = new Map<string, number>();
  const positionManagerTotals = new Map<string, number[]>();
  for (const [_managerKey, positions] of managerPositionTotals) {
    for (const [position, total] of positions) {
      if (!positionManagerTotals.has(position)) positionManagerTotals.set(position, []);
      positionManagerTotals.get(position)!.push(total);
    }
  }
  for (const [position, totals] of positionManagerTotals) {
    const sorted = totals.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
    positionMedians.set(position, median);
  }

  const results: ManagerEfficiency[] = [];
  for (const [_key, managerDecisionList] of managerGroups) {
    const first = managerDecisionList[0];
    const correct = managerDecisionList.filter(d => d.decisionCorrect).length;
    const totalEfficiency = managerDecisionList.reduce((sum, d) => sum + d.efficiencyRate, 0);

    let weightedCorrect = 0;
    let totalWeight = 0;
    let totalPointsImpact = 0;
    const positionBreakdown: Record<string, PositionBreakdownMetrics> = {};

    const positionGroups = new Map<string, PositionDecision[]>();
    for (const d of managerDecisionList) {
      if (!positionGroups.has(d.position)) positionGroups.set(d.position, []);
      positionGroups.get(d.position)!.push(d);
    }

    for (const [position, group] of positionGroups) {
      const correctCount = group.filter(d => d.decisionCorrect).length;
      const efficiency = group.reduce((sum, d) => sum + d.efficiencyRate, 0);
      const pointsLost = group.reduce((sum, d) => sum + Math.max(0, d.pointsLeft), 0);
      const positionMedian = positionMedians.get(position) || 0;
      const pointsLostVsMedian = positionMedian - pointsLost; // positive is better
      const weight = POSITION_WEIGHTS[position] ?? 0.5;

      weightedCorrect += correctCount * weight;
      totalWeight += group.length * weight;
      totalPointsImpact += pointsLostVsMedian;

      positionBreakdown[position] = {
        decisionRate: group.length > 0 ? correctCount / group.length : 0,
        efficiencyRate: group.length > 0 ? efficiency / group.length : 0,
        decisionsCount: group.length,
        weight,
        pointsLost,
        pointsLostVsMedian,
      };
    }

    results.push({
      managerId: first.managerId,
      managerName: first.managerName,
      leagueId: first.leagueId,
      decisions: managerDecisionList,
      overallDecisionRate:
        managerDecisionList.length > 0 ? correct / managerDecisionList.length : 0,
      overallEfficiencyRate:
        managerDecisionList.length > 0 ? totalEfficiency / managerDecisionList.length : 0,
      weightedDecisionScore: totalWeight > 0 ? weightedCorrect / totalWeight : 0,
      pointsImpactScore: totalPointsImpact,
      positionBreakdown,
    });
  }

  return results.sort((a, b) => b.weightedDecisionScore - a.weightedDecisionScore);
};

const getRosteredPlayers = (matchups: any[]): Set<string> => {
  const rostered = new Set<string>();
  for (const m of matchups) {
    const players = m.players || [];
    for (const pid of players) rostered.add(String(pid));
  }
  return rostered;
};

const resolveSeasonAndWeeks = async (options?: {
  season?: string;
  weeks?: number[];
}): Promise<{ season: string; weeks: number[] }> => {
  let season = options?.season;
  let weeks = options?.weeks && options.weeks.length > 0 ? options.weeks : [];

  // Our registered leagues (config/leagues.ts) are the source of truth for
  // which season is "current", not Sleeper's live global NFL state — during
  // the off-season that resets to the upcoming season's week 1, which would
  // otherwise point this analysis at the wrong season with almost no weeks.
  const referenceLeague = CURRENT_LEAGUES[0];

  try {
    if (!season && referenceLeague) {
      season = String(referenceLeague.season);
    }

    if (weeks.length === 0 && referenceLeague) {
      const [league, nflState] = await Promise.all([
        sleeperClient.fetchLeague(referenceLeague.id),
        sleeperClient.fetchNFLState(),
      ]);
      const completedWeeks = resolveCompletedWeeks(league, nflState);
      weeks = Array.from({ length: completedWeeks }, (_, index) => index + 1);
    }
  } catch (error) {
    console.warn('Failed to determine current league week, falling back to default weeks:', error);
  }

  return {
    season: season || FALLBACK_SEASON,
    weeks: weeks.length > 0 ? weeks : FALLBACK_WEEKS,
  };
};

const processLeagueWeek = async (
  league: { id: string },
  week: number,
  season: string,
  scoringSettingsByLeague: Map<string, ScoringSettings>,
  playerPositions: Map<string, string>,
): Promise<PositionDecision[]> => {
  const scoringSettings = scoringSettingsByLeague.get(league.id) || {};

  const [matchups, projections, stats, users, rosters] = await Promise.all([
    sleeperClient.fetchMatchups(league.id, week),
    sleeperClient.fetchWeeklyProjections(week, season),
    sleeperClient.fetchWeeklyPlayerStats(week, season),
    sleeperClient.fetchUsers(league.id),
    sleeperClient.fetchRosters(league.id),
  ]);

  const userMap = new Map((users || []).map((u: any) => [u.user_id, u]));
  const rosterToOwner = new Map((rosters || []).map((r: any) => [r.roster_id, r.owner_id]));

  // Build projections map with calculated points
  const allProjections = new Map<string, PlayerProjection>();

  // Projections and stats can be an object keyed by playerId; convert while preserving IDs
  const entries = projections
    ? Array.isArray(projections)
      ? (projections as any[]).map((p: any) => [String(p.player_id), p] as const)
      : Object.entries(projections as Record<string, any>)
    : [];

  for (const [playerId, rawProjection] of entries) {
    const rawStat = (stats || ({} as any))[playerId];
    if (!rawProjection || !rawStat) continue;

    const projectedPoints = calculateFantasyPoints(rawProjection, scoringSettings);
    const actualPoints = calculateFantasyPoints(rawStat, scoringSettings);
    if (projectedPoints <= 0) continue;

    allProjections.set(String(playerId), {
      playerId: String(playerId),
      projectedPoints,
      actualPoints,
      rawProjection,
      rawStats: rawStat,
    });
  }

  const rosteredPlayers = getRosteredPlayers(matchups || []);
  const weekDecisions: PositionDecision[] = [];

  for (const matchup of matchups || []) {
    const rosterId = matchup.roster_id;
    const ownerId = rosterToOwner.get(rosterId);
    const user = userMap.get(ownerId);
    const managerName = user?.display_name || `Manager ${rosterId}`;
    const starters: string[] = (matchup.starters || []).map((s: any) => String(s));
    const roster: string[] = (matchup.players || []).map((p: any) => String(p));

    const managerDecisions: PositionDecision[] = [];
    for (let i = 0; i < starters.length; i++) {
      const playerId = starters[i];
      if (!playerId) continue;

      const rosterSlot = ROSTER_POSITIONS[i];
      if (!rosterSlot) continue;

      const playerPos = playerPositions.get(playerId);
      if (!playerPos) continue;

      const selectedProjection = allProjections.get(playerId);
      if (!selectedProjection) continue;

      const alternatives = buildAlternativesPool(
        roster,
        starters,
        rosteredPlayers,
        rosterSlot,
        selectedProjection,
        allProjections,
        playerPositions,
      );

      if (alternatives.length === 0) continue;

      const decision = analyzePositionDecision(
        ownerId || String(rosterId),
        managerName,
        league.id,
        week,
        rosterSlot,
        selectedProjection,
        alternatives,
      );
      managerDecisions.push(decision);
    }

    const deduped = deduplicateManagerDecisions(managerDecisions);
    weekDecisions.push(...deduped);
  }

  return weekDecisions;
};

export const analyzeStartSitEfficiency = async (options?: {
  season?: string;
  weeks?: number[];
}): Promise<StartSitData> => {
  const { season, weeks } = await resolveSeasonAndWeeks(options);

  // Fetch massive static data once (players)
  const allPlayers = await sleeperClient.fetchAllPlayers();

  // Build positions map once
  const playerPositions = new Map<string, string>();
  for (const [playerId, playerData] of Object.entries(allPlayers || {})) {
    if (playerData && typeof playerData === 'object' && 'position' in (playerData as any)) {
      playerPositions.set(playerId, (playerData as any).position);
    }
  }

  // Fetch scoring settings for every league up front, in parallel.
  const scoringSettingsByLeague = new Map<string, ScoringSettings>();
  await Promise.all(
    CURRENT_LEAGUES.map(async league => {
      const leagueDetails = await sleeperClient.fetchLeague(league.id);
      scoringSettingsByLeague.set(
        league.id,
        ((leagueDetails as any)?.scoring_settings as ScoringSettings) || {},
      );
    }),
  );

  // Every (league, week) pair is independent — process them all in parallel
  // instead of awaiting one at a time. fetchWeeklyProjections/PlayerStats are
  // per-week only (not per-league), so the in-flight request de-dupe in
  // BrowserSleeperClient collapses the two leagues' identical calls for the
  // same week into a single network request.
  const leagueWeekResults = await Promise.all(
    CURRENT_LEAGUES.flatMap(league =>
      weeks.map(week =>
        processLeagueWeek(league, week, season, scoringSettingsByLeague, playerPositions),
      ),
    ),
  );

  const allDecisions: PositionDecision[] = leagueWeekResults.flat();

  const managerEfficiencies = calculateManagerEfficiency(allDecisions);
  const worstDecisions = getWorstDecisions(allDecisions, 999);
  const bestRiskyDecisions = getBestRiskyDecisions(allDecisions, 999);
  const rosterContext = getManagerRosterContext(allDecisions);

  return {
    configuration: {
      projectionThreshold: PROJECTION_THRESHOLD,
      waiverDiscount: WAIVER_DISCOUNT,
      weeks,
      season,
      weightedScoring: true,
    },
    managerEfficiencies,
    worstDecisions,
    bestRiskyDecisions,
    rosterContext,
    leagueStats: {
      totalDecisions: allDecisions.length,
      avgWeightedScore:
        managerEfficiencies.length > 0
          ? managerEfficiencies.reduce((s, m) => s + m.weightedDecisionScore, 0) /
            managerEfficiencies.length
          : 0,
      avgPointsImpact:
        managerEfficiencies.length > 0
          ? managerEfficiencies.reduce((s, m) => s + m.pointsImpactScore, 0) /
            managerEfficiencies.length
          : 0,
    },
    timestamp: new Date().toISOString(),
  };
};

export type { StartSitData, ManagerEfficiency, PositionDecision };
