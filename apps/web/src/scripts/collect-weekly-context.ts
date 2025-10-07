/**
 * Weekly Context Collection Script
 *
 * Collects all relevant data from stats hub and outputs a comprehensive JSON
 * that can be used to manually write enriched narratives
 *
 * Usage: npx tsx apps/web/src/scripts/collect-weekly-context.ts --week=4
 */

import fs from 'fs';
import path from 'path';

const WEEK = parseInt(process.argv.find(arg => arg.startsWith('--week'))?.split('=')[1] || '4');

console.log(`\n📊 Collecting Week ${WEEK} Context Data\n`);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

// ============================================================================
// FETCH STATS DATA
// ============================================================================

async function fetchStatsData() {
  console.log('📥 Fetching stats hub data...');

  try {
    const { buildStatsDataset, serializeStatsDataset } = await import('../lib/stats/compose.js');
    const { CURRENT_LEAGUES } = await import('../config/leagues.js');

    const leagueIds = CURRENT_LEAGUES.map(l => l.id);
    const labels = CURRENT_LEAGUES.map(l => l.name);

    const dataset = await buildStatsDataset({
      leagueIds,
      labels,
      weekRange: { from: 1, to: WEEK },
    });

    const serialized = serializeStatsDataset(dataset);
    console.log(`✅ Loaded stats for ${serialized.teams.length} teams`);
    return serialized;
  } catch (error) {
    console.error('❌ Failed to fetch stats data:', error);
    throw error;
  }
}

// ============================================================================
// PROCESS POSITIONAL TRENDS
// ============================================================================

function processPositionalTrends(dataset: any) {
  console.log('📊 Processing positional trends...');

  const positions = ['QB', 'RB', 'WR', 'TE', 'DEF'];
  const positionsMap = new Map(dataset.positions);
  const teamsMap = new Map(dataset.teams);
  const results: any[] = [];

  for (const position of positions) {
    const posData = positionsMap.get(position) as any;
    if (!posData || !posData.teams) continue;

    const posTeamsMap = new Map(posData.teams);

    // Calculate ranks for each week
    const weeklyRanks: Map<number, Map<string, number>> = new Map();

    for (let week = 1; week <= WEEK; week++) {
      const weekScores = Array.from(posTeamsMap.entries())
        .map(([teamKey, teamPosData]: [any, any]) => {
          const weekScore = teamPosData.scores.find((s: any) => s.week === week);
          return { teamKey, score: weekScore?.value || 0 };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

      const ranks = new Map<string, number>();
      weekScores.forEach((item, index) => {
        ranks.set(item.teamKey, index + 1);
      });

      weeklyRanks.set(week, ranks);
    }

    // For each team, compile their positional data
    for (const [teamKey, teamPosData] of posTeamsMap.entries() as any) {
      const teamInfo = teamsMap.get(teamKey) as any;
      if (!teamInfo) continue;

      const weeklyData: any[] = [];
      let currentWeekPoints = 0;
      let currentWeekRank = 0;

      for (let week = 1; week <= WEEK; week++) {
        const weekScore = teamPosData.scores.find((s: any) => s.week === week);
        const weekRank = weeklyRanks.get(week)?.get(teamKey) || 0;

        if (weekScore && weekScore.value > 0) {
          weeklyData.push({
            week,
            points: weekScore.value,
            rank: weekRank,
          });

          if (week === WEEK) {
            currentWeekPoints = weekScore.value;
            currentWeekRank = weekRank;
          }
        }
      }

      if (weeklyData.length > 0) {
        const previousWeeks = weeklyData.filter(w => w.week < WEEK);
        const avgPreviousPoints =
          previousWeeks.length > 0
            ? previousWeeks.reduce((sum, w) => sum + w.points, 0) / previousWeeks.length
            : 0;
        const avgPreviousRank =
          previousWeeks.length > 0
            ? previousWeeks.reduce((sum, w) => sum + w.rank, 0) / previousWeeks.length
            : 0;

        results.push({
          teamName: teamInfo.teamInfo.teamName,
          leagueName: teamInfo.teamInfo.leagueName,
          position,
          currentWeek: {
            week: WEEK,
            points: currentWeekPoints,
            rank: currentWeekRank,
          },
          previousWeeks: {
            avgPoints: avgPreviousPoints,
            avgRank: avgPreviousRank,
            weekByWeek: previousWeeks,
          },
          allWeeks: weeklyData,
          // Calculated metrics
          rankChange: avgPreviousRank - currentWeekRank,
          pointsChange: currentWeekPoints - avgPreviousPoints,
          pointsChangePct:
            avgPreviousPoints > 0 ? (currentWeekPoints - avgPreviousPoints) / avgPreviousPoints : 0,
        });
      }
    }
  }

  console.log(`✅ Processed ${results.length} team-position combinations`);
  return results;
}

// ============================================================================
// PROCESS LUCK & SCHEDULE (Using Stats Hub Logic)
// ============================================================================

function processLuckAndSchedule(dataset: any, currentWeek: number) {
  console.log('🍀 Processing luck and schedule analysis...');

  const allTeamEntries = Array.from(dataset.teams) as any[];
  const results: any[] = [];

  // Build head-to-head record matrix (exactly like ScheduleAnalysis.tsx)
  const scheduleMatrix = new Map<
    string,
    Map<string, { wins: number; losses: number; totalGames: number }>
  >();

  // Initialize matrix for all teams
  for (const [teamKey] of allTeamEntries) {
    scheduleMatrix.set(teamKey, new Map());
    for (const [opponentKey] of allTeamEntries) {
      if (teamKey !== opponentKey) {
        scheduleMatrix.get(teamKey)!.set(opponentKey, { wins: 0, losses: 0, totalGames: 0 });
      }
    }
  }

  // Calculate hypothetical records: "What if Team A played Team B's schedule?"
  for (const [teamAKey, teamA] of allTeamEntries) {
    for (const [teamBKey, teamB] of allTeamEntries) {
      if (teamAKey === teamBKey) continue;

      const record = scheduleMatrix.get(teamAKey)?.get(teamBKey);
      if (!record) continue;

      // Compare Team A's scores against Team B's opponent scores
      for (let week = 1; week <= currentWeek; week++) {
        const teamAScore = teamA.teamScores.find((d: any) => d.week === week)?.value || 0;
        const teamBOppScore = teamB.opponentScores.find((d: any) => d.week === week)?.value || 0;

        // Only count weeks where both teams have data
        if (teamAScore > 0 && teamBOppScore > 0) {
          if (teamAScore > teamBOppScore) {
            record.wins++;
          } else if (teamAScore < teamBOppScore) {
            record.losses++;
          }
          record.totalGames++;
        }
      }
    }
  }

  // Calculate schedule difficulty: "How would other teams do with YOUR schedule?"
  const scheduleDifficulty = allTeamEntries
    .map(([scheduleOwnerKey, scheduleOwner]) => {
      let totalWins = 0;
      let totalGames = 0;

      // For each other team, see how they would do with this schedule
      for (const [teamKey] of allTeamEntries) {
        if (teamKey === scheduleOwnerKey) continue;

        const record = scheduleMatrix.get(teamKey)?.get(scheduleOwnerKey);
        if (record) {
          totalWins += record.wins;
          totalGames += record.totalGames;
        }
      }

      return {
        teamKey: scheduleOwnerKey,
        teamName: scheduleOwner.teamInfo.teamName,
        leagueName: scheduleOwner.teamInfo.leagueName,
        avgWinPct: totalGames > 0 ? totalWins / totalGames : 0,
        totalGames,
        difficultyRank: 0, // Will be assigned after sorting
      };
    })
    .sort((a, b) => a.avgWinPct - b.avgWinPct); // Lowest win% = hardest schedule

  // Assign difficulty ranks
  scheduleDifficulty.forEach((item, index) => {
    item.difficultyRank = index + 1;
  });

  // Process each team
  for (const [teamKey, teamData] of allTeamEntries) {
    const teamScores = teamData.teamScores.filter((s: any) => s.value > 0);
    const opponentScores = teamData.opponentScores.filter((s: any) => s.value > 0);

    if (teamScores.length === 0) continue;

    // Calculate actual wins/losses
    let actualWins = 0;
    let actualLosses = 0;
    for (let i = 0; i < Math.min(teamScores.length, opponentScores.length); i++) {
      if (teamScores[i].value > opponentScores[i].value) actualWins++;
      else if (teamScores[i].value < opponentScores[i].value) actualLosses++;
    }

    // Get this team's record with their own schedule
    const myRecord = scheduleMatrix.get(teamKey)?.get(teamKey);
    const actualGames = actualWins + actualLosses;

    // Expected wins: average of what this team did vs all OTHER schedules
    const teamRecord = scheduleMatrix.get(teamKey);
    let expectedWinsSum = 0;
    let expectedGamesSum = 0;

    if (teamRecord) {
      for (const [opponentKey, record] of teamRecord.entries()) {
        if (opponentKey !== teamKey && record.totalGames > 0) {
          expectedWinsSum += record.wins;
          expectedGamesSum += record.totalGames;
        }
      }
    }

    const expectedWins =
      expectedGamesSum > 0 ? (expectedWinsSum / expectedGamesSum) * actualGames : actualWins;

    // Get schedule difficulty info
    const scheduleInfo = scheduleDifficulty.find(s => s.teamKey === teamKey);

    // Calculate counterfactual: "How many teams would have X record with MY schedule?"
    const othersWithMySchedule = new Map<number, number>(); // wins -> count
    for (let w = 0; w <= actualGames; w++) {
      othersWithMySchedule.set(w, 0);
    }

    for (const [otherKey] of allTeamEntries) {
      if (otherKey === teamKey) continue;

      const otherRecord = scheduleMatrix.get(otherKey)?.get(teamKey);
      if (otherRecord && otherRecord.totalGames > 0) {
        const projectedWins = Math.round((otherRecord.wins / otherRecord.totalGames) * actualGames);
        othersWithMySchedule.set(projectedWins, (othersWithMySchedule.get(projectedWins) || 0) + 1);
      }
    }

    let teamsWithBetter = 0;
    let teamsWithSame = 0;
    let teamsWithWorse = 0;

    for (const [wins, count] of othersWithMySchedule.entries()) {
      if (wins > actualWins) teamsWithBetter += count;
      else if (wins === actualWins) teamsWithSame += count;
      else teamsWithWorse += count;
    }

    results.push({
      teamKey,
      teamName: teamData.teamInfo.teamName,
      leagueName: teamData.teamInfo.leagueName,
      record: {
        wins: actualWins,
        losses: actualLosses,
        games: actualGames,
      },
      expectedWins: Math.round(expectedWins * 10) / 10,
      luckRating: Math.round((actualWins - expectedWins) * 10) / 10,
      schedule: {
        avgWinPct: scheduleInfo?.avgWinPct || 0,
        difficultyRank: scheduleInfo?.difficultyRank || 0,
        totalTeams: scheduleDifficulty.length,
      },
      counterfactual: {
        teamsWithBetter,
        teamsWithSame,
        teamsWithWorse,
        totalOtherTeams: teamsWithBetter + teamsWithSame + teamsWithWorse,
      },
      scoring: {
        avgPointsFor:
          teamScores.reduce((sum: number, s: any) => sum + s.value, 0) / teamScores.length,
        avgPointsAgainst:
          opponentScores.reduce((sum: number, s: any) => sum + s.value, 0) / opponentScores.length,
      },
    });
  }

  console.log(`✅ Processed luck/schedule for ${results.length} teams`);
  return results;
}

// ============================================================================
// PROCESS SCATTER DATA
// ============================================================================

function processScatterData(dataset: any) {
  console.log('📈 Processing scatter chart data...');

  const teamsMap = new Map(dataset.teams);
  const positionsMap = new Map(dataset.positions);
  const results: any = { overall: [], byPosition: {} };

  // Overall team efficiency
  const overallData: any[] = [];
  for (const [teamKey, teamData] of teamsMap.entries() as any) {
    const teamScores = teamData.teamScores.filter((s: any) => s.value > 0);
    const oppScores = teamData.opponentScores.filter((s: any) => s.value > 0);

    if (teamScores.length > 0) {
      const avgFor =
        teamScores.reduce((sum: number, s: any) => sum + s.value, 0) / teamScores.length;
      const avgAgainst =
        oppScores.reduce((sum: number, s: any) => sum + s.value, 0) / oppScores.length;

      overallData.push({
        teamKey,
        teamName: teamData.teamInfo.teamName,
        leagueName: teamData.teamInfo.leagueName,
        pointsFor: avgFor,
        pointsAgainst: avgAgainst,
      });
    }
  }

  // Calculate z-scores
  const forValues = overallData.map(d => d.pointsFor);
  const againstValues = overallData.map(d => d.pointsAgainst);
  const forMedian = median(forValues);
  const againstMedian = median(againstValues);
  const forStd = stdDev(forValues);
  const againstStd = stdDev(againstValues);

  results.overall = overallData.map(d => ({
    ...d,
    zScoreFor: forStd > 0 ? (d.pointsFor - forMedian) / forStd : 0,
    zScoreAgainst: againstStd > 0 ? (d.pointsAgainst - againstMedian) / againstStd : 0,
    quadrant:
      d.pointsFor > forMedian && d.pointsAgainst < againstMedian
        ? 'upper-left'
        : d.pointsFor > forMedian && d.pointsAgainst > againstMedian
          ? 'upper-right'
          : d.pointsFor < forMedian && d.pointsAgainst < againstMedian
            ? 'lower-left'
            : 'lower-right',
  }));

  // By position (simplified - just do RB as example)
  for (const position of ['QB', 'RB', 'WR', 'TE', 'DEF']) {
    const posData = positionsMap.get(position) as any;
    if (!posData || !posData.teams) continue;

    const posTeamsMap = new Map(posData.teams);
    const positionScores: any[] = [];

    for (const [teamKey, teamPosData] of posTeamsMap.entries() as any) {
      const teamInfo = teamsMap.get(teamKey) as any;
      if (!teamInfo) continue;

      const scores = teamPosData.scores.filter((s: any) => s.value > 0);
      if (scores.length > 0) {
        const avgScore = scores.reduce((sum: number, s: any) => sum + s.value, 0) / scores.length;
        positionScores.push({
          teamKey,
          teamName: teamInfo.teamInfo.teamName,
          leagueName: teamInfo.teamInfo.leagueName,
          avgScore,
        });
      }
    }

    results.byPosition[position] = positionScores;
  }

  console.log(
    `✅ Processed scatter data for overall + ${Object.keys(results.byPosition).length} positions`,
  );
  return results;
}

// ============================================================================
// PROCESS NARRATIVE PATTERNS (Rich Contextual Analysis)
// ============================================================================

function processNarrativePatterns(dataset: any, currentWeek: number) {
  console.log('📝 Processing narrative patterns...');

  const teamsMap = new Map(dataset.teams);
  const positionsMap = new Map(dataset.positions);
  const allTeamEntries = Array.from(dataset.teams) as any[];
  const results: any[] = [];

  // Calculate league-wide position averages for each week
  const leagueAvgByPosWeek = new Map<string, number>(); // "QB-1" -> avg points

  for (const position of ['QB', 'RB', 'WR', 'TE', 'DEF']) {
    const posData = positionsMap.get(position) as any;
    if (!posData || !posData.teams) continue;

    const posTeamsMap = new Map(posData.teams);

    for (let week = 1; week <= currentWeek; week++) {
      const weekScores = Array.from(posTeamsMap.values())
        .map((teamPosData: any) => {
          const weekScore = teamPosData.scores.find((s: any) => s.week === week);
          return weekScore?.value || 0;
        })
        .filter(score => score > 0);

      const avg =
        weekScores.length > 0 ? weekScores.reduce((sum, s) => sum + s, 0) / weekScores.length : 0;

      leagueAvgByPosWeek.set(`${position}-${week}`, avg);
    }
  }

  // Process each team
  for (const [teamKey, teamData] of teamsMap.entries() as any) {
    const teamScores = teamData.teamScores.filter((s: any) => s.value > 0);
    const opponentScores = teamData.opponentScores.filter((s: any) => s.value > 0);

    if (teamScores.length === 0) continue;

    // PATTERN 1: Win/Loss Correlation with Scoring
    const scoringRanks: number[] = [];
    const outcomes: ('W' | 'L')[] = [];

    for (let week = 1; week <= currentWeek; week++) {
      const weekScore = teamScores.find((s: any) => s.week === week);
      const oppScore = opponentScores.find((s: any) => s.week === week);

      if (weekScore && oppScore) {
        // Calculate rank for this week
        const allWeekScores = Array.from(teamsMap.values())
          .map((t: any) => t.teamScores.find((s: any) => s.week === week)?.value || 0)
          .filter(s => s > 0)
          .sort((a, b) => b - a);

        const rank = allWeekScores.findIndex(s => s === weekScore.value) + 1;
        scoringRanks.push(rank);
        outcomes.push(weekScore.value > oppScore.value ? 'W' : 'L');
      }
    }

    const topScoringWeeks = scoringRanks.filter(r => r <= 5).length;
    const lowScoringWeeks = scoringRanks.filter(r => r > 12).length;
    const winsInTopScoring = outcomes.filter((o, i) => o === 'W' && scoringRanks[i] <= 5).length;
    const lossesInTopScoring = outcomes.filter((o, i) => o === 'L' && scoringRanks[i] <= 5).length;

    // PATTERN 2-7: Position-level analysis
    const positionalAnalysis: any = {};

    for (const position of ['QB', 'RB', 'WR', 'TE', 'DEF']) {
      const posData = positionsMap.get(position) as any;
      if (!posData || !posData.teams) continue;

      const posTeamsMap = new Map(posData.teams);
      const teamPosData = posTeamsMap.get(teamKey) as any;

      if (!teamPosData) continue;

      const validScores = teamPosData.scores.filter(
        (s: any) => s.week >= 1 && s.week <= currentWeek && s.value > 0,
      );

      if (validScores.length === 0) continue;

      // Calculate PPW and season rank
      const ppw =
        validScores.reduce((sum: number, s: any) => sum + s.value, 0) / validScores.length;

      // Calculate vs league average
      let advantageVsLeague = 0;
      for (const score of validScores) {
        const leagueAvg = leagueAvgByPosWeek.get(`${position}-${score.week}`) || 0;
        advantageVsLeague += score.value - leagueAvg;
      }
      advantageVsLeague = advantageVsLeague / validScores.length;

      // Calculate weekly ranks and streaks
      const weeklyRanks: number[] = [];
      for (let week = 1; week <= currentWeek; week++) {
        const weekScore = validScores.find((s: any) => s.week === week);
        if (!weekScore) continue;

        const allWeekPosScores = Array.from(posTeamsMap.values())
          .map((tpd: any) => tpd.scores.find((s: any) => s.week === week)?.value || 0)
          .filter(s => s > 0)
          .sort((a, b) => b - a);

        const rank = allWeekPosScores.findIndex(s => s === weekScore.value) + 1;
        weeklyRanks.push(rank);
      }

      // Consistency patterns
      const neverOutsideTop3 = weeklyRanks.every(r => r <= 3);
      const neverOutsideTop5 = weeklyRanks.every(r => r <= 5);
      const bottom3Count = weeklyRanks.filter(r => r >= 22).length;
      const consecutiveBottom3 = bottom3Count >= 3 && weeklyRanks.slice(-3).every(r => r >= 22);

      // Recent trend
      const recentWeekRank = weeklyRanks[weeklyRanks.length - 1] || 0;
      const recentWeekPoints = validScores[validScores.length - 1]?.value || 0;
      const previousAvg =
        validScores.length > 1
          ? validScores.slice(0, -1).reduce((sum: number, s: any) => sum + s.value, 0) /
            (validScores.length - 1)
          : 0;
      const isBestOfSeason = recentWeekPoints === Math.max(...validScores.map((s: any) => s.value));

      positionalAnalysis[position] = {
        ppw: Math.round(ppw * 10) / 10,
        advantageVsLeague: Math.round(advantageVsLeague * 10) / 10,
        percentageEdge:
          advantageVsLeague > 0
            ? Math.round((advantageVsLeague / (ppw - advantageVsLeague)) * 1000) / 10
            : 0,
        weeklyRanks,
        avgRank:
          weeklyRanks.length > 0
            ? Math.round((weeklyRanks.reduce((sum, r) => sum + r, 0) / weeklyRanks.length) * 10) /
              10
            : 0,
        consistency: {
          neverOutsideTop3,
          neverOutsideTop5,
          consecutiveBottom3,
          bottom3Weeks: bottom3Count,
        },
        recentTrend: {
          weekRank: recentWeekRank,
          weekPoints: Math.round(recentWeekPoints * 10) / 10,
          isBestOfSeason,
          improvement: Math.round((recentWeekPoints - previousAvg) * 10) / 10,
        },
      };
    }

    // Net positional balance
    const strengths = Object.entries(positionalAnalysis)
      .filter(([_, data]: any) => data.advantageVsLeague > 3)
      .sort(([_, a]: any, [__, b]: any) => b.advantageVsLeague - a.advantageVsLeague);

    const weaknesses = Object.entries(positionalAnalysis)
      .filter(([_, data]: any) => data.advantageVsLeague < -3)
      .sort(([_, a]: any, [__, b]: any) => a.advantageVsLeague - b.advantageVsLeague);

    const netAdvantage = Object.values(positionalAnalysis).reduce(
      (sum: number, data: any) => sum + data.advantageVsLeague,
      0,
    );

    results.push({
      teamKey,
      teamName: teamData.teamInfo.teamName,
      leagueName: teamData.teamInfo.leagueName,

      // Pattern 1: Win/Loss correlation
      winLossPattern: {
        scoringRanks,
        outcomes,
        topScoringWeeks,
        lowScoringWeeks,
        winsInTopScoring,
        lossesInTopScoring,
        record: {
          wins: outcomes.filter(o => o === 'W').length,
          losses: outcomes.filter(o => o === 'L').length,
        },
      },

      // Pattern 2-6: Position analysis
      positionalAnalysis,

      // Pattern 3 & 7: Trade-offs
      positionalBalance: {
        strengths: strengths.slice(0, 2), // Top 2
        weaknesses: weaknesses.slice(0, 2), // Bottom 2
        netAdvantage: Math.round(netAdvantage * 10) / 10,
      },
    });
  }

  console.log(`✅ Processed narrative patterns for ${results.length} teams`);
  return results;
}

// ============================================================================
// FETCH TRANSACTION ANALYSIS
// ============================================================================

async function fetchTransactionAnalysis(week: number) {
  console.log('💸 Fetching transaction analysis...');

  try {
    // TODO: Replace with actual transaction API endpoint
    // For now, fetch from stats API which has transaction data
    const response = await fetch(`http://localhost:3000/api/stats`);

    if (!response.ok) {
      console.warn('⚠️  Transaction API returned', response.status);
      return {
        thisWeek: [],
        seasonTop: [],
        seasonBottom: [],
        trades: [],
        note: 'Transaction data unavailable - API returned error',
      };
    }

    const data = await response.json();

    // Extract transaction data if available
    const transactionData = data.transactions || {};

    console.log('✅ Transaction analysis fetched');
    return {
      thisWeek: transactionData.weeklyTransactions?.[week] || [],
      seasonTop: transactionData.topTransactions || [],
      seasonBottom: transactionData.bottomTransactions || [],
      trades: transactionData.trades || [],
      rawData: transactionData, // Keep full data for manual analysis
    };
  } catch (error) {
    console.warn('⚠️  Failed to fetch transaction analysis:', (error as Error).message);
    return {
      thisWeek: [],
      seasonTop: [],
      seasonBottom: [],
      trades: [],
      note: 'Transaction analysis failed - manual review needed',
    };
  }
}

// ============================================================================
// FETCH START/SIT ANALYSIS
// ============================================================================

async function fetchStartSitAnalysis(week: number) {
  console.log('🎯 Fetching start/sit analysis...');

  try {
    // TODO: This should call a dedicated start/sit API endpoint
    // For now, extract from stats API
    const response = await fetch(`http://localhost:3000/api/stats`);

    if (!response.ok) {
      console.warn('⚠️  Start/sit API returned', response.status);
      return {
        thisWeekBest: [],
        thisWeekWorst: [],
        managerEfficiency: [],
        note: 'Start/sit data unavailable - API returned error',
      };
    }

    const data = await response.json();

    // Extract start/sit data if available
    const startSitData = data.startSit || {};

    console.log('✅ Start/sit analysis fetched');
    return {
      thisWeekBest: startSitData.weeklyBest?.[week] || [],
      thisWeekWorst: startSitData.weeklyWorst?.[week] || [],
      managerEfficiency: startSitData.efficiency || [],
      rawData: startSitData, // Keep full data for manual analysis
    };
  } catch (error) {
    console.warn('⚠️  Failed to fetch start/sit analysis:', (error as Error).message);
    return {
      thisWeekBest: [],
      thisWeekWorst: [],
      managerEfficiency: [],
      note: 'Start/sit analysis failed - manual review needed',
    };
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function collectContext() {
  try {
    const statsData = await fetchStatsData();

    const context = {
      week: WEEK,
      season: '2025',
      generatedAt: new Date().toISOString(),
      metadata: {
        totalTeams: statsData.teams.length,
        totalPositions: statsData.positions.length,
        currentWeek: statsData.currentWeek || WEEK,
      },

      // Raw stats data (for reference)
      rawStats: statsData,

      // Processed insights
      positionalTrends: processPositionalTrends(statsData),
      luckAndSchedule: processLuckAndSchedule(statsData, WEEK),
      scatterData: processScatterData(statsData),
      narrativePatterns: processNarrativePatterns(statsData, WEEK),

      // Additional analysis sections
      transactions: await fetchTransactionAnalysis(WEEK),
      startSit: await fetchStartSitAnalysis(WEEK),
    };

    // Write to file
    const outputPath = path.join(process.cwd(), `apps/web/data/week${WEEK}-context.json`);
    fs.writeFileSync(outputPath, JSON.stringify(context, null, 2));

    console.log(`\n✅ Week ${WEEK} context generated!`);
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📊 Summary:`);
    console.log(`   • Teams: ${context.metadata.totalTeams}`);
    console.log(`   • Positional trends: ${context.positionalTrends.length} entries`);
    console.log(`   • Luck/schedule: ${context.luckAndSchedule.length} teams`);
    console.log(`   • Scatter data: ${context.scatterData.overall.length} teams`);
    console.log(
      `   • Narrative patterns: ${context.narrativePatterns.length} teams (14 pattern types)`,
    );
    console.log(
      `   • Transactions: ${context.transactions.thisWeek?.length || 0} this week, ${context.transactions.seasonTop?.length || 0} season top`,
    );
    console.log(
      `   • Start/Sit: ${context.startSit.thisWeekBest?.length || 0} best, ${context.startSit.thisWeekWorst?.length || 0} worst\n`,
    );
  } catch (error) {
    console.error('\n❌ Failed to collect context:', error);
    process.exit(1);
  }
}

collectContext();
