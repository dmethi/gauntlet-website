/**
 * Snapshot Runner - Executes live odds snapshot logic
 *
 * This file imports and runs the comprehensive-live-snapshot script
 * from the @gauntlet/server package directly within the Vercel API route.
 *
 * Architecture:
 * - Imports utilities from @gauntlet/server package
 * - Runs the same logic as GitHub Actions workflow
 * - Returns structured result for HTTP response
 * - Handles database connection cleanup
 *
 * Requirements:
 * - DATABASE_URL env var must be set in Vercel
 * - Prisma client must be generated
 * - @gauntlet/server must be in workspace dependencies
 */

import type { CompleteSnapshot, DebugPlayer, SimulationPlayer } from '@gauntlet/types';

// Import utilities from server package
import {
  createChildLogger,
  createGauntletAPIClient,
  createMetrics,
  disconnect,
  saveSnapshotIfChanged,
} from '@gauntlet/server';
import { sleeperClient } from '@/lib/sleeper/unified-client';

import type { MetricsSummary } from '@gauntlet/types';

interface SnapshotResult {
  savedCount: number;
  skippedCount: number;
  failedCount: number;
  totalProcessed: number;
  week: number;
  duration: number;
  metrics: MetricsSummary;
}

/**
 * Helper to capture individual matchup data combining API and Sleeper data
 */
const captureIndividualMatchup = async (
  leagueId: string,
  week: number,
  matchupId: number,
  teamNames: Map<number, string>,
  apiClient: ReturnType<typeof createGauntletAPIClient>,
): Promise<CompleteSnapshot | null> => {
  try {
    // Get fresh current scores directly from Sleeper API
    const matchups = await sleeperClient.fetchMatchups(leagueId, week);
    const matchupPair = matchups.filter(m => m.matchup_id === matchupId);

    if (matchupPair.length !== 2) return null;

    // Fetch simulation from Gauntlet API
    const data = await apiClient.fetchMatchupSimulation(leagueId, week, matchupId);
    const sim = data.simulation;

    const toDebugPlayers = (players: SimulationPlayer[]): DebugPlayer[] =>
      players.map(p => {
        // Ensure position is valid for sim-engine validation
        // Valid positions: QB, RB, WR, TE, K, DEF, DST
        let position = p.position;
        if (!position || !['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DST'].includes(position)) {
          // Default to RB for flex positions or unknown players
          position = 'RB';
        }

        return {
          name: p.name || p.playerName || p.id,
          position,
          nflTeam: p.nflTeam || '',
          currentScore: p.currentScore,
          remainingProjection: p.projection,
          fullProjection: p.fullProjection || p.projection,
          gameState: p.gameState,
        };
      });

    const team1Players = toDebugPlayers(sim.teams?.[0]?.players || []);
    const team2Players = toDebugPlayers(sim.teams?.[1]?.players || []);

    // Extract projection totals
    const team1RawProj = sim.teams[0].players.reduce((sum, p) => sum + p.projection, 0);
    const team2RawProj = sim.teams[1].players.reduce((sum, p) => sum + p.projection, 0);

    // Use FRESH current scores from direct Sleeper API
    const team1CurrentScore =
      matchupPair.find(m => m.roster_id === sim.teams[0].rosterId)?.points || 0;
    const team2CurrentScore =
      matchupPair.find(m => m.roster_id === sim.teams[1].rosterId)?.points || 0;

    // Simulated means
    const team1SimMean = sim.team1Scores.mean;
    const team2SimMean = sim.team2Scores.mean;

    // Win probabilities
    const team1WinProb = sim.team1WinPct;
    const team2WinProb = sim.team2WinPct;

    // Get team names
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
        simulatedMean: team1SimMean,
        currentScore: team1CurrentScore,
        winProbability: team1WinProb,
      },
      team2: {
        rosterId: sim.teams[1].rosterId,
        rawProjectionTotal: team2RawProj,
        simulatedMean: team2SimMean,
        currentScore: team2CurrentScore,
        winProbability: team2WinProb,
      },
      spread: sim.impliedOdds.spread,
      total: sim.impliedOdds.total,
      moneyLineA: calculateMoneyLine(team1WinProb),
      moneyLineB: calculateMoneyLine(team2WinProb),
      capturedAt: new Date().toISOString(),
      team1Name,
      team2Name,
      team1Players,
      team2Players,
    };
  } catch (error) {
    console.error(
      `[SNAPSHOT] Failed to capture matchup ${matchupId} in league ${leagueId}:`,
      error,
    );
    return null;
  }
};

/**
 * Run the live odds snapshot
 *
 * This is the main entry point called by the Vercel cron endpoint.
 * It replicates the logic from comprehensive-live-snapshot.ts but
 * returns a result object instead of exiting the process.
 */
export const runLiveSnapshot = async (): Promise<SnapshotResult> => {
  const jobStartTime = Date.now();
  const metrics = createMetrics();
  const apiClient = createGauntletAPIClient({}, metrics);

  let savedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  try {
    const week = await apiClient.getCurrentWeek();
    const leagueIds = ['1263744209295245312', '1263740549504962561'];

    const jobLogger = createChildLogger({ job: 'vercel-cron-snapshot', week });

    jobLogger.info({
      event: 'job_started',
      message: `Starting live odds snapshot for week ${week} (Vercel Cron)`,
    });

    // Capture individual matchups for detailed data
    for (const leagueId of leagueIds) {
      const leagueName = leagueId.includes('3245') ? 'AFC' : 'NFC';
      jobLogger.debug({ event: 'processing_league', leagueId, leagueName });

      const teamNames = await apiClient.getTeamNames(leagueId);
      jobLogger.debug({ event: 'team_names_fetched', count: teamNames.size, leagueId });

      for (let matchupId = 1; matchupId <= 6; matchupId++) {
        const snapshot = await captureIndividualMatchup(
          leagueId,
          week,
          matchupId,
          teamNames,
          apiClient,
        );

        if (snapshot) {
          const result = await saveSnapshotIfChanged(snapshot, metrics);
          if (result.saved) {
            savedCount++;
          } else {
            skippedCount++;
          }
        } else {
          metrics.increment('matchup.capture_failed');
          jobLogger.warn({
            event: 'matchup_capture_failed',
            matchupId,
            leagueId,
          });
          failedCount++;
        }

        // Small delay to avoid API overload
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const jobDuration = Date.now() - jobStartTime;
    const summary = metrics.getSummary();

    jobLogger.info({
      event: 'job_completed',
      duration: jobDuration,
      savedCount,
      skippedCount,
      failedCount,
      totalProcessed: savedCount + skippedCount + failedCount,
      metrics: summary,
      message: 'Live odds snapshot finished (Vercel Cron)',
    });

    return {
      savedCount,
      skippedCount,
      failedCount,
      totalProcessed: savedCount + skippedCount + failedCount,
      week,
      duration: jobDuration,
      metrics: summary,
    };
  } catch (error) {
    console.error('[SNAPSHOT] Fatal error:', error);
    throw error;
  } finally {
    // Clean up database connection
    await disconnect();
  }
};
