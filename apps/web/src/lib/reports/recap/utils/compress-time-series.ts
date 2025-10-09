/**
 * Game Flow Time-Series Compression
 *
 * Compresses 60-68 database samples spanning the entire week down to 3-5
 * narrative-critical moments for LLM context efficiency.
 *
 * Algorithm:
 * 1. Filter for in-game samples (where actual scoring happens)
 * 2. Identify key moments: game start, lead changes, scoring runs, swings
 * 3. Calculate excitement metrics from full in-game data
 * 4. Return compressed output (3-5 points)
 */

import type {
  CompressedGameFlow,
  CompressedGameFlowPoint,
  ExcitementMetrics,
  LiveMatchupUpdate,
} from '../types';

/**
 * Filter time series to in-game samples only.
 * Excludes pre-game (all scores 0) and captures meaningful game progression.
 */
const filterToInGameSamples = (samples: LiveMatchupUpdate[]): LiveMatchupUpdate[] => {
  return samples.filter(
    s =>
      // Include samples where scoring has started
      s.currentScoreA > 0 ||
      s.currentScoreB > 0 ||
      // Or game is marked as in progress
      (s.gameProgress > 0 && s.gameProgress < 1),
  );
};

/**
 * Calculate excitement metrics from in-game samples.
 */
const calculateExcitementMetrics = (samples: LiveMatchupUpdate[]): ExcitementMetrics => {
  if (samples.length < 2) {
    return {
      leadChanges: 0,
      maxComeback: 0,
      volatility: 0,
      maxSwing: 0,
      clutchFactor: 0,
      totalSamples: samples.length,
    };
  }

  // Calculate win probability volatility
  const winProbChanges = samples.slice(1).map((s, i) => Math.abs(s.winProbA - samples[i].winProbA));
  const avgChange = winProbChanges.reduce((a, b) => a + b, 0) / winProbChanges.length;
  const maxChange = Math.max(...winProbChanges);

  // Count lead changes
  let leadChanges = 0;
  for (let i = 1; i < samples.length; i++) {
    const prevLeader = samples[i - 1].currentScoreA > samples[i - 1].currentScoreB ? 'A' : 'B';
    const currLeader = samples[i].currentScoreA > samples[i].currentScoreB ? 'A' : 'B';
    if (
      prevLeader !== currLeader &&
      Math.abs(samples[i].currentScoreA - samples[i].currentScoreB) > 3
    ) {
      leadChanges++;
    }
  }

  // Calculate max comeback (largest deficit overcome)
  let maxComeback = 0;
  for (let i = 0; i < samples.length; i++) {
    const diff = Math.abs(samples[i].currentScoreA - samples[i].currentScoreB);
    maxComeback = Math.max(maxComeback, diff);
  }

  // Clutch factor: volatility in final 25% of samples
  const finalQuarter = samples.slice(Math.floor(samples.length * 0.75));
  let clutchVolatility = 0;
  if (finalQuarter.length > 1) {
    for (let i = 1; i < finalQuarter.length; i++) {
      clutchVolatility += Math.abs(finalQuarter[i].winProbA - finalQuarter[i - 1].winProbA);
    }
    clutchVolatility /= finalQuarter.length - 1;
  }
  const clutchFactor = Math.min(100, clutchVolatility * 200);

  return {
    leadChanges,
    maxComeback: Math.round(maxComeback),
    volatility: Math.round(avgChange * 100),
    maxSwing: Math.round(maxChange * 100),
    clutchFactor: Math.round(clutchFactor),
    totalSamples: samples.length,
  };
};

/**
 * Extract key narrative moments from in-game samples.
 * Returns 3-5 most significant moments for narrative generation.
 */
const extractKeyMoments = (samples: LiveMatchupUpdate[]): CompressedGameFlowPoint[] => {
  if (samples.length === 0) return [];

  const keyMoments: CompressedGameFlowPoint[] = [];

  // 1. Always include game start (first in-game sample)
  const first = samples[0];
  keyMoments.push({
    timestamp: first.timestamp.toISOString(),
    teamAScore: first.currentScoreA,
    teamBScore: first.currentScoreB,
    teamAWinProbability: first.winProbA,
    gameProgress: first.gameProgress,
    significance: 'game_start',
    description: 'Games begin',
  });

  // 2. Detect lead changes (must be meaningful margin)
  for (let i = 1; i < samples.length; i++) {
    const curr = samples[i];
    const prev = samples[i - 1];

    const prevLeader = prev.currentScoreA > prev.currentScoreB ? 'A' : 'B';
    const currLeader = curr.currentScoreA > curr.currentScoreB ? 'A' : 'B';
    const margin = Math.abs(curr.currentScoreA - curr.currentScoreB);

    if (prevLeader !== currLeader && margin > 5) {
      keyMoments.push({
        timestamp: curr.timestamp.toISOString(),
        teamAScore: curr.currentScoreA,
        teamBScore: curr.currentScoreB,
        teamAWinProbability: curr.winProbA,
        gameProgress: curr.gameProgress,
        significance: 'lead_change',
        description: `Lead change - Team ${currLeader} takes control`,
      });
    }
  }

  // 3. Detect significant scoring runs (>20 points in span of 3-4 samples)
  for (let i = 3; i < samples.length; i++) {
    const curr = samples[i];
    const recent = samples[i - 3];

    const teamArun = Math.abs(curr.currentScoreA - recent.currentScoreA);
    const teamBrun = Math.abs(curr.currentScoreB - recent.currentScoreB);

    if (teamArun > 20 || teamBrun > 20) {
      const runningTeam = teamArun > teamBrun ? 'A' : 'B';
      const runPoints = Math.max(teamArun, teamBrun);

      // Don't duplicate if we just added a lead change
      const lastMoment = keyMoments[keyMoments.length - 1];
      const timeDiff = curr.timestamp.getTime() - new Date(lastMoment.timestamp).getTime();
      if (timeDiff > 60 * 60 * 1000) {
        // At least 1 hour apart
        keyMoments.push({
          timestamp: curr.timestamp.toISOString(),
          teamAScore: curr.currentScoreA,
          teamBScore: curr.currentScoreB,
          teamAWinProbability: curr.winProbA,
          gameProgress: curr.gameProgress,
          significance: 'scoring_run',
          description: `Team ${runningTeam} goes on ${Math.round(runPoints)}-point run`,
        });
      }
    }
  }

  // 4. Detect dramatic win probability swings (>25%)
  for (let i = 2; i < samples.length; i++) {
    const curr = samples[i];
    const recent = samples[i - 2];

    const winProbSwing = Math.abs(curr.winProbA - recent.winProbA);

    if (winProbSwing > 0.25) {
      // Don't duplicate recent moments
      const lastMoment = keyMoments[keyMoments.length - 1];
      const timeDiff = curr.timestamp.getTime() - new Date(lastMoment.timestamp).getTime();
      if (timeDiff > 60 * 60 * 1000) {
        keyMoments.push({
          timestamp: curr.timestamp.toISOString(),
          teamAScore: curr.currentScoreA,
          teamBScore: curr.currentScoreB,
          teamAWinProbability: curr.winProbA,
          gameProgress: curr.gameProgress,
          significance: 'win_prob_swing',
          description: `Dramatic momentum shift - ${Math.round(winProbSwing * 100)}% swing`,
        });
      }
    }
  }

  // 5. Always include game end (last sample)
  const last = samples[samples.length - 1];
  keyMoments.push({
    timestamp: last.timestamp.toISOString(),
    teamAScore: last.currentScoreA,
    teamBScore: last.currentScoreB,
    teamAWinProbability: last.winProbA,
    gameProgress: last.gameProgress,
    significance: 'game_end',
    description: 'Final score',
  });

  // Remove duplicates by timestamp
  const uniqueMoments = Array.from(new Map(keyMoments.map(m => [m.timestamp, m])).values());

  // Sort chronologically
  uniqueMoments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // If still too many, keep highest priority moments
  if (uniqueMoments.length > 5) {
    const priority = {
      game_start: 1,
      game_end: 1,
      lead_change: 2,
      comeback: 2,
      win_prob_swing: 3,
      scoring_run: 4,
    };

    return uniqueMoments
      .sort((a, b) => priority[a.significance] - priority[b.significance])
      .slice(0, 5)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  return uniqueMoments;
};

/**
 * Compress full week time series to key narrative moments.
 *
 * Takes 60-68 database samples spanning the entire week and compresses to 3-5
 * key moments suitable for LLM narrative generation.
 *
 * @param rawSamples - Full time series from database (60-68 samples over ~7 days)
 * @param leagueId - League identifier
 * @param week - NFL week number
 * @param matchupId - Matchup identifier
 * @returns Compressed game flow with key moments and excitement metrics
 */
export const compressGameFlow = (
  rawSamples: LiveMatchupUpdate[],
  leagueId: string,
  week: number,
  matchupId: number,
): CompressedGameFlow => {
  // Filter to in-game samples only
  const inGameSamples = filterToInGameSamples(rawSamples);

  // Handle edge case: no in-game data
  if (inGameSamples.length === 0) {
    const lastSample = rawSamples[rawSamples.length - 1];
    return {
      matchupId: `${leagueId}-${week}-${matchupId}`,
      leagueId,
      week,
      keyMoments: [],
      excitement: {
        leadChanges: 0,
        maxComeback: 0,
        volatility: 0,
        maxSwing: 0,
        clutchFactor: 0,
        totalSamples: 0,
      },
      compressionRatio: `${rawSamples.length} → 0 points (no in-game data)`,
      finalScore: {
        teamA: lastSample?.currentScoreA || 0,
        teamB: lastSample?.currentScoreB || 0,
      },
    };
  }

  // Extract key moments
  const keyMoments = extractKeyMoments(inGameSamples);

  // Calculate excitement metrics
  const excitement = calculateExcitementMetrics(inGameSamples);

  // Final scores
  const lastSample = inGameSamples[inGameSamples.length - 1];

  return {
    matchupId: `${leagueId}-${week}-${matchupId}`,
    leagueId,
    week,
    keyMoments,
    excitement,
    compressionRatio: `${rawSamples.length} → ${keyMoments.length} points (${Math.round((1 - keyMoments.length / rawSamples.length) * 100)}% reduction)`,
    finalScore: {
      teamA: lastSample.currentScoreA,
      teamB: lastSample.currentScoreB,
    },
  };
};
