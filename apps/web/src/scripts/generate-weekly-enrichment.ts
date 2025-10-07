/**
 * Weekly Enrichment Script
 *
 * Fetches data from stats hub APIs and generates contextual narratives
 *
 * Usage: npx tsx apps/web/src/scripts/generate-weekly-enrichment.ts --week 4
 */

import fs from 'fs';
import path from 'path';
import {
  generatePositionalTrendNarrative,
  generateLuckNarrative,
  generateScatterOutlierNarrative,
  generateTransactionNarrative,
  generateStartSitNarrative,
  type Narrative,
} from '../lib/narrative-generators.js';
import { NARRATIVE_CONFIG } from '../config/narrative-thresholds.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const WEEK = process.argv.find(arg => arg.startsWith('--week'))?.split('=')[1] || '4';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

console.log(`\n🔍 ============================================`);
console.log(`📊 Generating Week ${WEEK} Enrichment Data`);
console.log(`🔍 ============================================\n`);

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
// FETCH STATS HUB DATA
// ============================================================================

async function fetchStatsData() {
  console.log('📥 Fetching stats hub data...');

  try {
    // Read from local API route (simulating what the frontend does)
    // In production, you'd call the actual API
    const { buildStatsDataset, serializeStatsDataset } = await import('../lib/stats/compose');
    const { CURRENT_LEAGUES } = await import('../config/leagues');

    const leagueIds = CURRENT_LEAGUES.map(l => l.id);
    const labels = CURRENT_LEAGUES.map(l => l.name);

    const dataset = await buildStatsDataset({
      leagueIds,
      labels,
      weekRange: { from: 1, to: parseInt(WEEK) },
    });

    const serialized = serializeStatsDataset(dataset);

    console.log(`✅ Loaded stats for ${serialized.teams.length} teams`);
    return serialized;
  } catch (error) {
    console.error('❌ Failed to fetch stats data:', error);
    throw error;
  }
}

async function fetchTransactionData() {
  console.log('📥 Fetching transaction data...');

  try {
    // This would normally call the transactions API
    // For now, we'll return empty array and you can populate later
    console.log('⚠️  Transaction data not yet integrated - skipping');
    return [];
  } catch (error) {
    console.warn('⚠️  Failed to fetch transaction data:', error);
    return [];
  }
}

async function fetchStartSitData() {
  console.log('📥 Fetching start/sit efficiency data...');

  try {
    // This would call the start/sit API
    console.log('⚠️  Start/sit data not yet integrated - skipping');
    return null;
  } catch (error) {
    console.warn('⚠️  Failed to fetch start/sit data:', error);
    return null;
  }
}

// ============================================================================
// PROCESS POSITIONAL TRENDS
// ============================================================================

function processPositionalTrends(dataset: any): Narrative[] {
  console.log('\n🔍 Processing positional trends...');

  const narratives: Narrative[] = [];
  const positions = ['QB', 'RB', 'WR', 'TE', 'DEF'];
  const currentWeekNum = parseInt(WEEK);

  const positionsMap = new Map(dataset.positions);
  const teamsMap = new Map(dataset.teams);

  for (const position of positions) {
    const posData = positionsMap.get(position) as any;
    if (!posData || !posData.teams) continue;

    const posTeamsMap = new Map(posData.teams);

    // Calculate league median for this position
    const allTeamScores: number[] = [];
    const teamWeekScores = new Map<string, { currentWeek: number; previous: number[] }>();

    for (const [teamKey, teamPosData] of posTeamsMap.entries() as any) {
      const currentWeekScore = teamPosData.scores.find((s: any) => s.week === currentWeekNum);
      const previousWeekScores = teamPosData.scores
        .filter((s: any) => s.week < currentWeekNum && s.week >= 1)
        .map((s: any) => s.value);

      if (currentWeekScore && previousWeekScores.length > 0) {
        allTeamScores.push(currentWeekScore.value);
        teamWeekScores.set(teamKey, {
          currentWeek: currentWeekScore.value,
          previous: previousWeekScores,
        });
      }
    }

    const leagueMedian = median(allTeamScores);

    // Calculate ranks for current week and previous weeks
    const currentWeekRanks = new Map<string, number>();
    const sortedCurrentWeek = Array.from(teamWeekScores.entries())
      .map(([key, data]) => ({ key, score: data.currentWeek }))
      .sort((a, b) => b.score - a.score);

    sortedCurrentWeek.forEach((item, index) => {
      currentWeekRanks.set(item.key, index + 1);
    });

    // Calculate previous average ranks
    const numPreviousWeeks = currentWeekNum - 1;
    const previousRanksByWeek: Map<number, Map<string, number>> = new Map();

    for (let week = 1; week < currentWeekNum; week++) {
      const weekScores = Array.from(posTeamsMap.entries())
        .map(([teamKey, teamPosData]: [any, any]) => {
          const weekScore = teamPosData.scores.find((s: any) => s.week === week);
          return { teamKey, score: weekScore?.value || 0 };
        })
        .filter((item: any) => item.score > 0)
        .sort((a: any, b: any) => b.score - a.score);

      const weekRanks = new Map<string, number>();
      weekScores.forEach((item, index) => {
        weekRanks.set(item.teamKey, index + 1);
      });

      previousRanksByWeek.set(week, weekRanks);
    }

    // Calculate average previous rank for each team
    const previousAvgRanks = new Map<string, number>();
    for (const [teamKey] of posTeamsMap.entries() as any) {
      const ranks: number[] = [];
      for (const [_, weekRanks] of previousRanksByWeek.entries()) {
        const rank = weekRanks.get(teamKey);
        if (rank) ranks.push(rank);
      }

      if (ranks.length > 0) {
        const avgRank = ranks.reduce((sum: number, r: number) => sum + r, 0) / ranks.length;
        previousAvgRanks.set(teamKey, avgRank);
      }
    }

    // Generate narratives for each team
    for (const [teamKey, scores] of teamWeekScores.entries()) {
      const teamInfo = teamsMap.get(teamKey) as any;
      if (!teamInfo) continue;

      const currentRank = currentWeekRanks.get(teamKey);
      const previousAvgRank = previousAvgRanks.get(teamKey);

      if (!currentRank || !previousAvgRank) continue;

      const previousAvgPoints =
        scores.previous.reduce((sum, p) => sum + p, 0) / scores.previous.length;

      // Build week-by-week history
      const weekByWeek: Array<{ week: number; points: number; rank: number }> = [];
      for (let week = 1; week < currentWeekNum; week++) {
        const weekRanks = previousRanksByWeek.get(week);
        const weekScore = (posTeamsMap.get(teamKey) as any)?.scores.find(
          (s: any) => s.week === week,
        );

        if (weekRanks && weekScore) {
          weekByWeek.push({
            week,
            points: weekScore.value,
            rank: weekRanks.get(teamKey) || 0,
          });
        }
      }

      const narrative = generatePositionalTrendNarrative({
        teamName: teamInfo.teamInfo.teamName,
        leagueName: teamInfo.teamInfo.leagueName,
        position,
        currentWeek: {
          points: scores.currentWeek,
          rank: currentRank,
          leagueMedian,
        },
        previousWeeks: {
          avgPoints: previousAvgPoints,
          avgRank: previousAvgRank,
          weekByWeek,
        },
      });

      if (narrative) {
        narratives.push(narrative);
      }
    }
  }

  console.log(`✅ Generated ${narratives.length} positional trend narratives`);
  return narratives;
}

// ============================================================================
// PROCESS LUCK ANALYSIS
// ============================================================================

function processLuckAnalysis(dataset: any): Narrative[] {
  console.log('\n🔍 Processing luck analysis...');

  const narratives: Narrative[] = [];
  const teamsMap = new Map(dataset.teams);

  // We need to calculate schedule matrix
  // This is complex - for now, we'll use simplified logic
  // In production, you'd use the actual schedule analysis calculations

  for (const [teamKey, teamData] of teamsMap.entries() as any) {
    const teamScores = teamData.teamScores.filter((s: any) => s.value > 0);
    const opponentScores = teamData.opponentScores.filter((s: any) => s.value > 0);

    if (teamScores.length === 0) continue;

    const wins = teamScores.filter((s: any, i: number) => {
      const oppScore = opponentScores[i];
      return oppScore && s.value > oppScore.value;
    }).length;

    const losses = teamScores.length - wins;

    // Simplified expected wins calculation
    const allScoresInLeague: number[] = [];
    for (const [_, otherTeam] of teamsMap.entries() as any) {
      const scores = otherTeam.teamScores.filter((s: any) => s.value > 0);
      allScoresInLeague.push(...scores.map((s: any) => s.value));
    }

    let expectedWins = 0;
    for (const teamScore of teamScores) {
      const beatenTeams = allScoresInLeague.filter(s => teamScore.value > s).length;
      expectedWins += beatenTeams / allScoresInLeague.length;
    }

    // Calculate schedule strength
    const scheduleStrength =
      opponentScores.reduce((sum: number, s: any) => sum + s.value, 0) / opponentScores.length;

    // Calculate difficulty rank (simplified)
    const allScheduleStrengths: Array<{ teamKey: string; strength: number }> = [];
    for (const [key, team] of teamsMap.entries() as any) {
      const oppScores = team.opponentScores.filter((s: any) => s.value > 0);
      if (oppScores.length > 0) {
        const strength =
          oppScores.reduce((sum: number, s: any) => sum + s.value, 0) / oppScores.length;
        allScheduleStrengths.push({ teamKey: key, strength });
      }
    }

    allScheduleStrengths.sort((a, b) => b.strength - a.strength); // Hardest first
    const difficultyRank = allScheduleStrengths.findIndex(item => item.teamKey === teamKey) + 1;

    // Counterfactual analysis (simplified for now)
    const counterfactual = {
      teamsWithSameRecord: Math.floor(Math.random() * 5) + 3, // Placeholder
      teamsWithBetter: Math.floor(Math.random() * 8),
      teamsWithWorse: 24 - wins - Math.floor(Math.random() * 8),
    };

    const narrative = generateLuckNarrative({
      teamName: teamData.teamInfo.teamName,
      leagueName: teamData.teamInfo.leagueName,
      record: { wins, losses, expectedWins },
      schedule: { strength: scheduleStrength, difficultyRank },
      counterfactual,
    });

    if (narrative) {
      narratives.push(narrative);
    }
  }

  console.log(`✅ Generated ${narratives.length} luck analysis narratives`);
  return narratives;
}

// ============================================================================
// PROCESS SCATTER OUTLIERS
// ============================================================================

function processScatterOutliers(dataset: any): Narrative[] {
  console.log('\n🔍 Processing scatter outliers...');

  const narratives: Narrative[] = [];
  const teamsMap = new Map(dataset.teams);
  const positions = ['Overall', 'QB', 'RB', 'WR', 'TE', 'DEF'];

  for (const chartType of positions) {
    const dataPoints: Array<{
      teamKey: string;
      teamName: string;
      leagueName: string;
      xValue: number;
      yValue: number;
    }> = [];

    // Collect data points
    for (const [teamKey, teamData] of teamsMap.entries() as any) {
      const teamScores = teamData.teamScores.filter((s: any) => s.value > 0);
      const oppScores = teamData.opponentScores.filter((s: any) => s.value > 0);

      if (teamScores.length === 0) continue;

      const xValue =
        teamScores.reduce((sum: number, s: any) => sum + s.value, 0) / teamScores.length;
      const yValue = oppScores.reduce((sum: number, s: any) => sum + s.value, 0) / oppScores.length;

      dataPoints.push({
        teamKey,
        teamName: teamData.teamInfo.teamName,
        leagueName: teamData.teamInfo.leagueName,
        xValue,
        yValue,
      });
    }

    // Calculate statistics
    const xValues = dataPoints.map(d => d.xValue);
    const yValues = dataPoints.map(d => d.yValue);

    const xMedian = median(xValues);
    const yMedian = median(yValues);
    const xStd = stdDev(xValues);
    const yStd = stdDev(yValues);

    // Generate narratives for outliers
    for (const point of dataPoints) {
      const zX = xStd > 0 ? (point.xValue - xMedian) / xStd : 0;
      const zY = yStd > 0 ? (point.yValue - yMedian) / yStd : 0;

      let quadrant: 'upper-left' | 'upper-right' | 'lower-left' | 'lower-right';
      if (zX > 0 && zY < 0) quadrant = 'upper-left';
      else if (zX > 0 && zY > 0) quadrant = 'upper-right';
      else if (zX < 0 && zY < 0) quadrant = 'lower-left';
      else quadrant = 'lower-right';

      const narrative = generateScatterOutlierNarrative({
        teamName: point.teamName,
        leagueName: point.leagueName,
        chartType: chartType === 'Overall' ? 'Team Efficiency' : chartType,
        xValue: point.xValue,
        yValue: point.yValue,
        zX,
        zY,
        quadrant,
      });

      if (narrative) {
        narratives.push(narrative);
      }
    }
  }

  console.log(`✅ Generated ${narratives.length} scatter outlier narratives`);
  return narratives;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function generateEnrichment() {
  try {
    // Fetch all data
    const statsData = await fetchStatsData();
    const transactionData = await fetchTransactionData();
    const startSitData = await fetchStartSitData();

    // Process each section
    const positionalTrends = NARRATIVE_CONFIG.enabled.positionalTrends
      ? processPositionalTrends(statsData)
      : [];

    const luckAnalysis = NARRATIVE_CONFIG.enabled.luckAnalysis
      ? processLuckAnalysis(statsData)
      : [];

    const scatterOutliers = NARRATIVE_CONFIG.enabled.scatterOutliers
      ? processScatterOutliers(statsData)
      : [];

    const transactions: Narrative[] = [];
    const startSit: Narrative[] = [];

    // Filter by severity and limit
    const filterAndLimit = (narratives: Narrative[], maxCount: number) => {
      return narratives
        .filter(n => {
          if (NARRATIVE_CONFIG.minSeverity === 'critical') return n.severity === 'critical';
          if (NARRATIVE_CONFIG.minSeverity === 'moderate')
            return n.severity === 'critical' || n.severity === 'moderate';
          return true;
        })
        .sort((a, b) => {
          const severityOrder = { critical: 3, moderate: 2, minor: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        })
        .slice(0, maxCount);
    };

    const enrichment = {
      week: parseInt(WEEK),
      season: '2025',
      generatedAt: new Date().toISOString(),
      summary: {
        totalNarratives:
          positionalTrends.length +
          luckAnalysis.length +
          scatterOutliers.length +
          transactions.length +
          startSit.length,
        bySection: {
          positionalTrends: positionalTrends.length,
          luckAnalysis: luckAnalysis.length,
          scatterOutliers: scatterOutliers.length,
          transactions: transactions.length,
          startSit: startSit.length,
        },
      },
      narratives: {
        positionalTrends: filterAndLimit(
          positionalTrends,
          NARRATIVE_CONFIG.maxNarrativesPerSection.positionalTrends,
        ),
        luckAnalysis: filterAndLimit(
          luckAnalysis,
          NARRATIVE_CONFIG.maxNarrativesPerSection.luckAnalysis,
        ),
        scatterOutliers: filterAndLimit(
          scatterOutliers,
          NARRATIVE_CONFIG.maxNarrativesPerSection.scatterOutliers,
        ),
        transactions: filterAndLimit(
          transactions,
          NARRATIVE_CONFIG.maxNarrativesPerSection.transactions,
        ),
        startSit: filterAndLimit(startSit, NARRATIVE_CONFIG.maxNarrativesPerSection.startSit),
      },
    };

    // Write to file
    const outputPath = path.join(process.cwd(), `apps/web/data/week${WEEK}-enrichment.json`);
    fs.writeFileSync(outputPath, JSON.stringify(enrichment, null, 2));

    console.log(`\n✅ ============================================`);
    console.log(`📁 Week ${WEEK} enrichment generated!`);
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📊 Total narratives: ${enrichment.summary.totalNarratives}`);
    console.log(`   • Positional trends: ${enrichment.narratives.positionalTrends.length}`);
    console.log(`   • Luck analysis: ${enrichment.narratives.luckAnalysis.length}`);
    console.log(`   • Scatter outliers: ${enrichment.narratives.scatterOutliers.length}`);
    console.log(`   • Transactions: ${enrichment.narratives.transactions.length}`);
    console.log(`   • Start/sit: ${enrichment.narratives.startSit.length}`);
    console.log(`✅ ============================================\n`);

    // Print sample narratives
    console.log(`\n📝 Sample Narratives:\n`);

    if (enrichment.narratives.positionalTrends.length > 0) {
      console.log('🔥 Positional Trends:');
      enrichment.narratives.positionalTrends.slice(0, 3).forEach((n: any) => {
        console.log(`   ${n.severity.toUpperCase()}: ${n.narrative}\n`);
      });
    }

    if (enrichment.narratives.luckAnalysis.length > 0) {
      console.log('\n🍀 Luck Analysis:');
      enrichment.narratives.luckAnalysis.slice(0, 3).forEach((n: any) => {
        console.log(`   ${n.severity.toUpperCase()}: ${n.narrative}\n`);
      });
    }

    if (enrichment.narratives.scatterOutliers.length > 0) {
      console.log('\n📊 Scatter Outliers:');
      enrichment.narratives.scatterOutliers.slice(0, 3).forEach((n: any) => {
        console.log(`   ${n.severity.toUpperCase()}: ${n.narrative}\n`);
      });
    }
  } catch (error) {
    console.error('\n❌ Failed to generate enrichment:', error);
    process.exit(1);
  }
}

generateEnrichment();
