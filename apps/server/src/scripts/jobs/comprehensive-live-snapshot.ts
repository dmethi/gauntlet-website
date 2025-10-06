#!/usr/bin/env node
/**
 * Comprehensive Live Odds Snapshot Script
 * Combines BOTH APIs to capture complete data:
 * - League Odds API: Overall rankings & team projections (128+ pts)
 * - Individual Matchup APIs: Current scores & live data
 *
 * Writes to: LiveWinProbSample (historical time-series data)
 */

import {
  createChildLogger,
  createGauntletAPIClient,
  createMetrics,
  disconnect,
  logger,
  saveSnapshotIfChanged,
} from '@/lib';
import type {
  CompleteSnapshot,
  DebugPlayer,
  SimulationPlayer,
  SleeperMatchup,
} from '@gauntlet/types';

/**
 * Helper to capture individual matchup data combining API and Sleeper data
 */
const captureIndividualMatchup = async (
  leagueId: string,
  week: number,
  matchupId: number,
  teamNames: Map<number, string>,
  apiClient: ReturnType<typeof createGauntletAPIClient>
): Promise<CompleteSnapshot | null> => {
  try {
    // Get fresh current scores directly from Sleeper API
    const sleeperResponse = await fetch(
      `https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`
    );
    const matchups = (await sleeperResponse.json()) as SleeperMatchup[];
    const matchupPair = matchups.filter(m => m.matchup_id === matchupId);

    if (matchupPair.length !== 2) return null;

    // Fetch simulation from Gauntlet API
    const data = await apiClient.fetchMatchupSimulation(leagueId, week, matchupId);
    const sim = data.simulation;

    const toDebugPlayers = (players: SimulationPlayer[]): DebugPlayer[] =>
      players.map(p => ({
        name: p.name || p.playerName || p.id,
        position: p.position || 'FLEX',
        nflTeam: p.nflTeam || '',
        currentScore: p.currentScore,
        remainingProjection: p.projection,
        fullProjection: p.fullProjection || p.projection,
        gameState: p.gameState,
      }));

    const team1Players = toDebugPlayers(sim.teams?.[0]?.players || []);
    const team2Players = toDebugPlayers(sim.teams?.[1]?.players || []);

    // Extract the EXACT data your screenshot shows
    const team1RawProj = sim.teams[0].players.reduce((sum, p) => sum + p.projection, 0);
    const team2RawProj = sim.teams[1].players.reduce((sum, p) => sum + p.projection, 0);

    // Use FRESH current scores from direct Sleeper API instead of cached simulation data
    const team1CurrentScore =
      matchupPair.find(m => m.roster_id === sim.teams[0].rosterId)?.points || 0;
    const team2CurrentScore =
      matchupPair.find(m => m.roster_id === sim.teams[1].rosterId)?.points || 0;

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
    logger.error({
      event: 'matchup_capture_failed',
      matchupId,
      leagueId,
      week,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
};

const main = async (): Promise<void> => {
  // Create metrics and API client
  const metrics = createMetrics();
  const apiClient = createGauntletAPIClient({}, metrics);
  const jobStartTime = Date.now();

  const week = await apiClient.getCurrentWeek();
  const leagueIds = ['1263744209295245312', '1263740549504962561'];

  // Create job-specific logger
  const jobLogger = createChildLogger({ job: 'live-snapshot', week });

  jobLogger.info({
    event: 'job_started',
    message: `Starting comprehensive live odds snapshot for week ${week}`,
  });

  // 1. Capture league odds for team rankings
  jobLogger.debug({ event: 'fetching_league_odds', week });
  const leagueOdds = await apiClient.fetchLeagueOdds(week);
  jobLogger.debug({
    event: 'league_odds_captured',
    teamsRanked: leagueOdds.highestScorer?.length || 0,
  });

  // 2. Capture individual matchups for detailed data
  jobLogger.debug({ event: 'fetching_matchup_details' });

  let savedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const leagueId of leagueIds) {
    const leagueName = leagueId.includes('3245') ? 'AFC' : 'NFC';
    jobLogger.debug({ event: 'processing_league', leagueId, leagueName });

    jobLogger.debug({ event: 'fetching_team_names', leagueId });
    const teamNames = await apiClient.getTeamNames(leagueId);
    jobLogger.debug({ event: 'team_names_fetched', count: teamNames.size, leagueId });

    for (let matchupId = 1; matchupId <= 6; matchupId++) {
      const snapshot = await captureIndividualMatchup(
        leagueId,
        week,
        matchupId,
        teamNames,
        apiClient
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

  // Report metrics
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
    message: 'Comprehensive live odds snapshot finished',
  });
};

main()
  .catch(e => {
    logger.error({
      event: 'fatal_error',
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      message: 'Fatal error in live snapshot job',
    });
    process.exit(1);
  })
  .finally(async () => {
    await disconnect();
  });
