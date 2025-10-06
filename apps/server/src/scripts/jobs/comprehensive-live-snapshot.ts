#!/usr/bin/env node
/**
 * Comprehensive Live Odds Snapshot Script
 * Combines BOTH APIs to capture complete data:
 * - League Odds API: Overall rankings & team projections (128+ pts)
 * - Individual Matchup APIs: Current scores & live data
 *
 * Writes to: LiveWinProbSample (historical time-series data)
 */

import { disconnect } from '../../lib/historical-data.js';
import { gauntletAPI } from '../../lib/gauntlet-api-client.js';
import { saveSnapshotIfChanged } from '../../lib/snapshot-validator.js';
import type { CompleteSnapshot } from '@gauntlet/types';

/**
 * Helper to capture individual matchup data combining API and Sleeper data
 */
const captureIndividualMatchup = async (
  leagueId: string,
  week: number,
  matchupId: number,
  teamNames: Map<number, string>
): Promise<CompleteSnapshot | null> => {
  try {
    // Get fresh current scores directly from Sleeper API
    const sleeperResponse = await fetch(
      `https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`
    );
    const matchups = await sleeperResponse.json();
    const matchupPair = matchups.filter((m: any) => m.matchup_id === matchupId);

    if (matchupPair.length !== 2) return null;

    // Fetch simulation from Gauntlet API
    const data = await gauntletAPI.fetchMatchupSimulation(leagueId, week, matchupId);
    const sim = data.simulation;

    const toDebugPlayers = (
      players: any[]
    ): Array<{
      name: string;
      position: string;
      nflTeam: string;
      currentScore: number;
      remainingProjection: number;
      fullProjection: number;
      gameState?: { state: string; desc: string; minutesRemaining: number };
    }> =>
      players.map(p => ({
        name: p.name || p.playerName || p.id,
        position: p.position || 'FLEX',
        nflTeam: p.nflTeam,
        currentScore: Number(p.currentScore || 0),
        remainingProjection: Number(p.projection || 0),
        fullProjection: Number(p.fullProjection || p.projection || 0),
        gameState: p.gameState
          ? {
              state: String(p.gameState.state),
              desc: String(p.gameState.gameDescription || ''),
              minutesRemaining: Number(p.gameState.minutesRemaining ?? 0),
            }
          : undefined,
      }));

    const team1Players = toDebugPlayers(sim.teams?.[0]?.players || []);
    const team2Players = toDebugPlayers(sim.teams?.[1]?.players || []);

    // Extract the EXACT data your screenshot shows
    const team1RawProj = sim.teams[0].players.reduce(
      (sum: number, p: any) => sum + p.projection,
      0
    );
    const team2RawProj = sim.teams[1].players.reduce(
      (sum: number, p: any) => sum + p.projection,
      0
    );

    // Use FRESH current scores from direct Sleeper API instead of cached simulation data
    const team1CurrentScore =
      matchupPair.find((m: any) => m.roster_id === sim.teams[0].rosterId)?.points || 0;
    const team2CurrentScore =
      matchupPair.find((m: any) => m.roster_id === sim.teams[1].rosterId)?.points || 0;

    // The simulated means are what show as "Proj:" in your screenshot
    const team1SimMean = sim.team1Scores.mean;
    const team2SimMean = sim.team2Scores.mean;

    // Convert odds to win probabilities
    const team1WinProb = sim.team1WinPct;
    const team2WinProb = sim.team2WinPct;

    // Get team names for better logging
    const team1Name = teamNames.get(sim.teams[0].rosterId) || `Roster ${sim.teams[0].rosterId}`;
    const team2Name = teamNames.get(sim.teams[1].rosterId) || `Roster ${sim.teams[1].rosterId}`;

    // Calculate money lines
    const calculateMoneyLine = (prob: number): number => {
      if (prob >= 0.5) {
        return -Math.round((prob / (1 - prob)) * 100);
      } else {
        return Math.round(((1 - prob) / prob) * 100);
      }
    };

    return {
      week,
      leagueId,
      matchupId,
      team1: {
        rosterId: sim.teams[0].rosterId,
        rawProjectionTotal: team1RawProj,
        simulatedMean: team1SimMean, // This matches your screenshot "Proj:" values
        currentScore: team1CurrentScore,
        winProbability: team1WinProb,
      },
      team2: {
        rosterId: sim.teams[1].rosterId,
        rawProjectionTotal: team2RawProj,
        simulatedMean: team2SimMean, // This matches your screenshot "Proj:" values
        currentScore: team2CurrentScore,
        winProbability: team2WinProb,
      },
      spread: sim.impliedOdds.spread,
      total: sim.impliedOdds.total,
      moneyLineA: calculateMoneyLine(team1WinProb),
      moneyLineB: calculateMoneyLine(team2WinProb),
      capturedAt: new Date().toISOString(),
      // Add team names for better logging
      team1Name,
      team2Name,
      team1Players,
      team2Players,
    };
  } catch (error) {
    console.error(
      `❌ Failed to capture matchup ${matchupId}:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
};

const main = async (): Promise<void> => {
  const week = await gauntletAPI.getCurrentWeek();
  const leagueIds = ['1263744209295245312', '1263740549504962561'];

  console.log(`🚀 Comprehensive live odds snapshot for week ${week}`);
  console.log(`📸 Combining League Odds + Individual Matchup APIs for complete data\n`);

  // 1. Capture league odds for team rankings
  console.log('📊 Capturing league-wide odds...');
  const leagueOdds = await gauntletAPI.fetchLeagueOdds(week);
  console.log(`✅ League odds captured: ${leagueOdds.highestScorer?.length || 0} teams ranked\n`);

  // 2. Capture individual matchups for detailed data
  console.log('📊 Capturing individual matchup details...');

  let savedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const leagueId of leagueIds) {
    const leagueName = leagueId.includes('3245') ? 'AFC' : 'NFC';
    console.log(`\n🏆 ${leagueName} League (${leagueId}):`);
    console.log('📋 Fetching team names...');

    const teamNames = await gauntletAPI.getTeamNames(leagueId);
    console.log(`✅ Found ${teamNames.size} team names\n`);

    for (let matchupId = 1; matchupId <= 6; matchupId++) {
      const snapshot = await captureIndividualMatchup(leagueId, week, matchupId, teamNames);

      if (snapshot) {
        const result = await saveSnapshotIfChanged(snapshot);
        if (result.saved) {
          savedCount++;
        } else {
          skippedCount++;
        }
      } else {
        console.log(`❌ Failed to capture M${matchupId}\n`);
        failedCount++;
      }

      // Small delay to avoid API overload
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Complete snapshot finished!');
  console.log('='.repeat(60));
  console.log(`📊 Results Summary:`);
  console.log(`   ✅ Saved: ${savedCount} matchups (data changed)`);
  console.log(`   ⏭️  Skipped: ${skippedCount} matchups (no change since last run)`);
  if (failedCount > 0) {
    console.log(`   ❌ Failed: ${failedCount} matchups`);
  }
  console.log(`   📈 Total processed: ${savedCount + skippedCount + failedCount} matchups`);
  console.log('');
  console.log('📊 Captured data includes:');
  console.log('   ✅ League odds & team rankings (128+ pt projections)');
  console.log('   ✅ Win probabilities (translated from odds)');
  console.log('   ✅ Live matchup scores (current player scores)');
  console.log('   ✅ Simulated means (matches your screenshot "Proj:" values)');
  console.log('\n📈 Perfect data for score-over-time and win-probability-over-time charts!');
  console.log("💡 Deduplication: Skips saving when scores/projections haven't changed");
};

main()
  .catch(e => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnect();
  });
