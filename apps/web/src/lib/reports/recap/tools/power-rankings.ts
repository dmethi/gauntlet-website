import { sleeperClient } from '@/lib/sleeper/unified-client';
import { LEAGUE_IDS } from '@/lib/constants';
import { getRealNameByRoster } from '@/lib/username-mapping';
import type { ReportTool } from './base';
import type { PowerRanking, RankingChange, TierSummary } from '../types';

/**
 * Power Rankings Tool
 * Fetches current and previous week rankings with movement tracking and dynamic tier clustering.
 */

interface PowerRankingsArgs {
  currentWeek: number;
}

interface PowerRankingsResult {
  currentWeek: number;
  rankings: PowerRanking[];
  changes: RankingChange;
}

/**
 * Dynamically clusters teams into tiers based on natural gaps in power scores.
 * Uses gap-based clustering to identify meaningful tier boundaries.
 *
 * Algorithm:
 * 1. Calculate gaps between consecutive teams (sorted by power score)
 * 2. Find significant gaps (> mean + 0.5 * stddev)
 * 3. Create tier breaks at those gaps
 * 4. Ensure minimum tier size of 2 teams
 * 5. Limit to max 6 tiers for readability
 */
const assignDynamicTiers = (rankings: PowerRanking[]): void => {
  if (rankings.length === 0) return;

  // Calculate gaps between consecutive teams
  const gaps: { index: number; gap: number }[] = [];
  for (let i = 0; i < rankings.length - 1; i++) {
    const gap = rankings[i].powerScore - rankings[i + 1].powerScore;
    gaps.push({ index: i, gap });
  }

  // Calculate gap statistics
  const gapValues = gaps.map(g => g.gap);
  const meanGap = gapValues.reduce((sum, g) => sum + g, 0) / gapValues.length;
  const variance =
    gapValues.reduce((sum, g) => sum + Math.pow(g - meanGap, 2), 0) / gapValues.length;
  const stdDevGap = Math.sqrt(variance);

  // Find significant gaps (lowered threshold to be more sensitive: mean + 0.25 * stddev)
  const significantGapThreshold = meanGap + 0.25 * stdDevGap;

  // Get all significant gaps, sorted by size
  const significantGaps = gaps
    .filter(g => g.gap > significantGapThreshold)
    .sort((a, b) => b.gap - a.gap); // Sort by gap size, largest first

  // Take top 7 gaps (allows up to 8 tiers)
  const tierBreaks = significantGaps
    .slice(0, 7)
    .map(g => g.index)
    .sort((a, b) => a - b); // Sort by position

  // Assign tier numbers with smarter break logic
  let currentTier = 1;
  let tierStart = 0;
  let _forcedBreaks = 0; // Track how many breaks we forced due to tier size

  for (let i = 0; i < rankings.length; i++) {
    // Assign current tier first
    rankings[i].tier = currentTier;

    const currentTierSize = i - tierStart + 1; // Include current team in size

    // After assigning tier, check if we should create a break AFTER this team
    if (i < rankings.length - 1) {
      // FORCE a tier break if current tier is getting too large (>6 teams)
      if (currentTierSize > 6) {
        currentTier++;
        tierStart = i + 1;
        _forcedBreaks++;
      }
      // Check if there's a natural tier break AFTER this team (gap from i to i+1)
      else if (tierBreaks.includes(i)) {
        const gapAfterThisTeam = gaps.find(g => g.index === i);
        const isLargeGap = gapAfterThisTeam && gapAfterThisTeam.gap > meanGap + 0.5 * stdDevGap;
        const isExceptionalGap =
          gapAfterThisTeam && gapAfterThisTeam.gap > meanGap + 1.0 * stdDevGap;
        const isSignificantGap = gapAfterThisTeam && gapAfterThisTeam.gap > significantGapThreshold;

        // Create tier break if:
        // 1. Current tier has at least 2 teams AND gap is significant, OR
        // 2. Gap is exceptional (allows single-team tiers for dominant teams)
        const shouldBreak =
          (currentTierSize >= 2 && (isLargeGap || isSignificantGap)) || isExceptionalGap;

        if (shouldBreak) {
          currentTier++;
          tierStart = i + 1;
        }
      }
    }
  }
};

/**
 * Calculate z-scores for an array of values.
 * Z-score = (value - mean) / standardDeviation
 */
const calculateZScores = (values: number[]): number[] => {
  const mean = values.reduce((sum, v) => sum + v, 0) / (values.length || 1);
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / Math.max(1, values.length - 1);
  const stdDev = Math.sqrt(variance || 0);

  if (stdDev === 0) return values.map(() => 0);
  return values.map(v => (v - mean) / stdDev);
};

/**
 * Calculates power rankings using the OFFICIAL Stats Hub algorithm:
 * - 50% z-score of average points per game
 * - 30% z-score of expected wins (cumulative)
 * - 20% z-score of rolling 3-week average
 *
 * This matches the formula shown in the Stats Hub "Power Rankings Evolution" section.
 */
const calculateRankings = async (week: number): Promise<PowerRanking[]> => {
  // Fetch all matchups up to the given week for both leagues
  const [afcMatchups, nfcMatchups, afcRosters, nfcRosters] = await Promise.all([
    Promise.all(
      Array.from({ length: week }, (_, i) => sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, i + 1)),
    ),
    Promise.all(
      Array.from({ length: week }, (_, i) => sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, i + 1)),
    ),
    sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.AFC),
    sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.NFC),
  ]);

  interface TeamMetrics {
    rosterId: number;
    leagueId: string;
    league: 'AFC' | 'NFC';
    teamName: string;
    ownerName: string;
    wins: number;
    losses: number;
    totalPoints: number;
    avgPoints: number;
    expectedWins: number;
    rolling3Avg: number;
    powerScore?: number;
  }

  const allMetrics: TeamMetrics[] = [];

  // First pass: collect all weekly scores for ALL teams
  // We need this to calculate expected wins across both leagues
  interface WeeklyScore {
    rosterId: number;
    leagueId: string;
    week: number;
    points: number;
  }
  const allWeeklyScores: WeeklyScore[] = [];

  // Collect scores from both leagues
  for (const { leagueId, matchups } of [
    { leagueId: LEAGUE_IDS.AFC, matchups: afcMatchups },
    { leagueId: LEAGUE_IDS.NFC, matchups: nfcMatchups },
  ]) {
    for (let w = 0; w < week; w++) {
      matchups[w].forEach(m => {
        allWeeklyScores.push({
          rosterId: m.roster_id,
          leagueId,
          week: w + 1,
          points: m.points || 0,
        });
      });
    }
  }

  // Second pass: calculate metrics for each team
  for (const { leagueId, league, matchups, rosters } of [
    {
      leagueId: LEAGUE_IDS.AFC,
      league: 'AFC' as const,
      matchups: afcMatchups,
      rosters: afcRosters,
    },
    {
      leagueId: LEAGUE_IDS.NFC,
      league: 'NFC' as const,
      matchups: nfcMatchups,
      rosters: nfcRosters,
    },
  ]) {
    for (const roster of rosters) {
      let totalPoints = 0;
      let totalExpectedWins = 0;
      const weeklyPoints: number[] = [];
      let wins = 0;
      let losses = 0;

      // Calculate metrics across all weeks
      for (let w = 0; w < week; w++) {
        const weekMatchups = matchups[w];
        const myMatchup = weekMatchups.find(m => m.roster_id === roster.roster_id);

        if (myMatchup) {
          const points = myMatchup.points || 0;
          totalPoints += points;
          weeklyPoints.push(points);

          // Expected wins: how many teams LEAGUE-WIDE would this score have beaten?
          // This matches Stats Hub which compares against all 24 teams
          const allScoresThisWeek = allWeeklyScores.filter(s => s.week === w + 1);
          const teamsBeaten = allScoresThisWeek.filter(s => points > s.points).length;
          const totalTeams = allScoresThisWeek.length;
          const expectedWinsThisWeek = totalTeams > 0 ? teamsBeaten / totalTeams : 0;
          totalExpectedWins += expectedWinsThisWeek;

          // Actual win/loss (within league)
          const opponent = weekMatchups.find(
            m => m.matchup_id === myMatchup.matchup_id && m.roster_id !== roster.roster_id,
          );
          if (opponent) {
            if (points > (opponent.points || 0)) wins++;
            else if (points < (opponent.points || 0)) losses++;
          }
        }
      }

      // Calculate rolling 3-week average (or all available weeks if < 3)
      const last3Weeks = weeklyPoints.slice(-3);
      const rolling3Avg = last3Weeks.reduce((sum, p) => sum + p, 0) / last3Weeks.length;

      const ownerName =
        getRealNameByRoster(leagueId, roster.roster_id) || roster.metadata?.owner_name || 'Unknown';
      const teamName = roster.metadata?.team_name || ownerName || `Team ${roster.roster_id}`;

      allMetrics.push({
        rosterId: roster.roster_id,
        leagueId,
        league,
        teamName,
        ownerName,
        wins,
        losses,
        totalPoints,
        avgPoints: totalPoints / week,
        expectedWins: totalExpectedWins,
        rolling3Avg,
      });
    }
  }

  // Calculate z-scores for all three metrics
  const avgPointsValues = allMetrics.map(m => m.avgPoints);
  const expectedWinsValues = allMetrics.map(m => m.expectedWins);
  const rolling3Values = allMetrics.map(m => m.rolling3Avg);

  const zAvgPoints = calculateZScores(avgPointsValues);
  const zExpectedWins = calculateZScores(expectedWinsValues);
  const zRolling3 = calculateZScores(rolling3Values);

  // Apply the power ranking formula: 50% avg pts + 30% expected wins + 20% rolling avg
  allMetrics.forEach((team, index) => {
    const powerScore =
      0.5 * zAvgPoints[index] + 0.3 * zExpectedWins[index] + 0.2 * zRolling3[index];
    team.powerScore = powerScore;
  });

  // Normalize scores to Stats Hub scale: 100 + (weightedZScore * 15)
  // Note: We do NOT re-normalize by mean/stdDev because z-scores already have mean=0
  allMetrics.forEach(team => {
    const normalizedScore = Math.round((100 + (team.powerScore || 0) * 15) * 100) / 100;
    team.powerScore = normalizedScore;
  });

  // Sort by normalized power score (highest first)
  allMetrics.sort((a, b) => (b.powerScore || 0) - (a.powerScore || 0));

  // Convert to PowerRanking objects
  const rankings: PowerRanking[] = allMetrics.map((team, index) => {
    return {
      rank: index + 1,
      previousRank: 0, // Will be set when comparing weeks
      movement: 0,
      rosterId: team.rosterId,
      leagueId: team.leagueId,
      teamName: team.teamName,
      ownerName: team.ownerName,
      record: `${team.wins}-${team.losses}`,
      pointsFor: Math.round(team.totalPoints * 100) / 100,
      league: team.league,
      powerScore: team.powerScore || 100,
      tier: 1, // Will be set by assignDynamicTiers
    };
  });

  // Assign dynamic tiers based on natural clustering
  assignDynamicTiers(rankings);

  return rankings;
};

/**
 * Generates tier summaries from ranked teams.
 * Creates simple tier labels like "Tier 1", "Tier 2", etc.
 * These can be enhanced with AI-generated labels later.
 */
const generateTierSummaries = (rankings: PowerRanking[]): TierSummary[] => {
  const tierMap = new Map<number, PowerRanking[]>();

  // Group teams by tier
  rankings.forEach(team => {
    if (!tierMap.has(team.tier)) {
      tierMap.set(team.tier, []);
    }
    tierMap.get(team.tier)!.push(team);
  });

  // Create tier summaries
  const summaries: TierSummary[] = [];
  const sortedTiers = Array.from(tierMap.keys()).sort((a, b) => a - b);

  sortedTiers.forEach(tierNum => {
    const teams = tierMap.get(tierNum)!;
    const scores = teams.map(t => t.powerScore);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    summaries.push({
      tier: tierNum,
      label: `Tier ${tierNum}`, // Simple label, can be enhanced by Gemini
      teams,
      scoreRange: { min: minScore, max: maxScore },
      avgScore: Math.round(avgScore * 100) / 100,
      teamCount: teams.length,
    });
  });

  return summaries;
};

/**
 * Tool: Fetches power rankings with movement tracking and dynamic tiers.
 */
export const fetchPowerRankingsTool: ReportTool<PowerRankingsArgs, PowerRankingsResult> = {
  name: 'fetch_power_rankings',
  description:
    'Fetches current and previous week power rankings with movement tracking and dynamic tier clustering',

  parameters: {
    type: 'object',
    properties: {
      currentWeek: {
        type: 'number',
        description: 'Current NFL week (1-18)',
      },
    },
    required: ['currentWeek'],
  },

  execute: async (args: PowerRankingsArgs): Promise<PowerRankingsResult> => {
    // Calculate current and previous week rankings
    const [currentRankings, previousRankings] = await Promise.all([
      calculateRankings(args.currentWeek),
      args.currentWeek > 1 ? calculateRankings(args.currentWeek - 1) : Promise.resolve([]),
    ]);

    // Calculate movement
    if (previousRankings.length > 0) {
      currentRankings.forEach(current => {
        const previous = previousRankings.find(
          p => p.leagueId === current.leagueId && p.rosterId === current.rosterId,
        );
        if (previous) {
          current.previousRank = previous.rank;
          current.movement = previous.rank - current.rank; // Positive = moved up
        } else {
          current.previousRank = current.rank;
          current.movement = 0;
        }
      });
    } else {
      // First week, no movement
      currentRankings.forEach(ranking => {
        ranking.previousRank = ranking.rank;
        ranking.movement = 0;
      });
    }

    // Identify notable changes
    const biggestRiser =
      currentRankings.filter(r => r.movement > 0).sort((a, b) => b.movement - a.movement)[0] ||
      null;

    const biggestFaller =
      currentRankings.filter(r => r.movement < 0).sort((a, b) => a.movement - b.movement)[0] ||
      null;

    const topThree = currentRankings.slice(0, 3);

    const notableChanges = currentRankings.filter(r => Math.abs(r.movement) >= 3);

    // Generate tier summaries
    const tiers = generateTierSummaries(currentRankings);

    const changes: RankingChange = {
      biggestRiser,
      biggestFaller,
      topThree,
      notableChanges,
      tiers,
    };

    return {
      currentWeek: args.currentWeek,
      rankings: currentRankings,
      changes,
    };
  },
};
