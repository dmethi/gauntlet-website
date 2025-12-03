/**
 * Cross-League Battle Simulator (Client-side)
 *
 * This module provides types and utilities for cross-league battle results.
 * The actual simulation runs on the server via API routes.
 */

import { LEAGUE_IDS } from '@/lib/constants';
import { sleeperClient } from '@/lib/sleeper/unified-client';
import type {
  CrossLeagueBattleResults,
  CrossLeagueMatchup,
  CrossLeagueSimulationConfig,
  CrossLeaguePlayer,
} from '../types';
import {
  fetchCurrentStandings,
  getTeamsBySeed,
} from './standings-calculator';

/**
 * Default simulation configuration
 */
const DEFAULT_CONFIG: CrossLeagueSimulationConfig = {
  iterations: 10000,
  useProjections: true,
};

/**
 * Fetch roster with projections for a team
 */
const fetchTeamRoster = async (
  leagueId: string,
  rosterId: number,
  week: number
): Promise<CrossLeaguePlayer[]> => {
  try {
    // Fetch matchups to get starters
    const matchups = await sleeperClient.fetchMatchups(leagueId, week);
    const teamMatchup = matchups.find((m) => m.roster_id === rosterId);
    
    if (!teamMatchup?.starters) {
      return [];
    }

    // Fetch all players metadata
    const allPlayers = await sleeperClient.fetchAllPlayers();
    
    // Fetch projections for the week
    const projections = await sleeperClient.fetchWeeklyProjections(week, '2024');

    // Build player list
    const roster: CrossLeaguePlayer[] = teamMatchup.starters
      .filter((playerId) => playerId && playerId !== '0') // Filter out empty slots
      .map((playerId) => {
        const player = allPlayers[playerId];
        const projection = projections[playerId];
        
        // Get current score from matchup if available
        const currentScore = teamMatchup.players_points?.[playerId] || 0;
        
        return {
          playerId,
          name: player?.full_name || player?.first_name || 'Unknown',
          position: player?.position || 'FLEX',
          team: player?.team || null,
          projection: projection?.pts_ppr || projection?.pts_half_ppr || projection?.pts_std || 0,
          currentScore,
        };
      });

    return roster;
  } catch (error) {
    console.error(`Error fetching roster for ${leagueId}/${rosterId}:`, error);
    return [];
  }
};

/**
 * Fetch cross-league battle simulation results via API
 * This fetches per-matchup win probabilities from the existing matchup simulate API
 */
export const runCrossLeagueBattle = async (
  throughWeek: number = 13,
  config: CrossLeagueSimulationConfig = DEFAULT_CONFIG
): Promise<CrossLeagueBattleResults> => {
  // Fetch current standings for both leagues
  const [afcStandings, nfcStandings] = await Promise.all([
    fetchCurrentStandings(LEAGUE_IDS.AFC, throughWeek),
    fetchCurrentStandings(LEAGUE_IDS.NFC, throughWeek),
  ]);

  // Sort teams by seed
  const afcTeamsBySeed = getTeamsBySeed(afcStandings);
  const nfcTeamsBySeed = getTeamsBySeed(nfcStandings);

  // Week 14 is the cross-league battle week
  const battleWeek = throughWeek + 1;

  // Create matchup pairings and fetch win probabilities + rosters
  const matchups: CrossLeagueMatchup[] = [];

  // Fetch all rosters in parallel
  const rosterPromises: Promise<{ seed: number; afcRoster: CrossLeaguePlayer[]; nfcRoster: CrossLeaguePlayer[] }>[] = [];
  
  for (let seed = 1; seed <= 12; seed++) {
    const afcTeam = afcTeamsBySeed[seed - 1];
    const nfcTeam = nfcTeamsBySeed[seed - 1];
    
    if (afcTeam && nfcTeam) {
      rosterPromises.push(
        Promise.all([
          fetchTeamRoster(LEAGUE_IDS.AFC, afcTeam.rosterId, battleWeek),
          fetchTeamRoster(LEAGUE_IDS.NFC, nfcTeam.rosterId, battleWeek),
        ]).then(([afcRoster, nfcRoster]) => ({ seed, afcRoster, nfcRoster }))
      );
    }
  }

  const allRosters = await Promise.all(rosterPromises);
  const rostersBySeed = new Map(allRosters.map((r) => [r.seed, r]));

  for (let seed = 1; seed <= 12; seed++) {
    const afcTeam = afcTeamsBySeed[seed - 1];
    const nfcTeam = nfcTeamsBySeed[seed - 1];

    if (afcTeam && nfcTeam) {
      // For cross-league battle, we use a simplified probability based on
      // the team's historical scoring distributions
      // In a production version, this would call an API for proper matchup simulation
      
      // Use scoring distributions to estimate win probability
      const afcMean = afcTeam.pointsFor / Math.max(afcTeam.wins + afcTeam.losses, 1);
      const nfcMean = nfcTeam.pointsFor / Math.max(nfcTeam.wins + nfcTeam.losses, 1);
      
      // Simple logistic approximation for win probability
      const scoreDiff = afcMean - nfcMean;
      const afcWinProb = 1 / (1 + Math.exp(-scoreDiff / 15)); // 15 is a scaling factor

      // Get roster data
      const rosterData = rostersBySeed.get(seed);

      matchups.push({
        seed,
        afcTeam: {
          rosterId: afcTeam.rosterId,
          teamName: afcTeam.teamName,
          ownerName: afcTeam.ownerName,
          roster: rosterData?.afcRoster,
        },
        nfcTeam: {
          rosterId: nfcTeam.rosterId,
          teamName: nfcTeam.teamName,
          ownerName: nfcTeam.ownerName,
          roster: rosterData?.nfcRoster,
        },
        afcWinProbability: afcWinProb,
        nfcWinProbability: 1 - afcWinProb,
        projectedAfcScore: afcMean,
        projectedNfcScore: nfcMean,
      });
    }
  }

  // Calculate league-level probabilities using Monte Carlo
  let afcLeagueWins = 0;
  let nfcLeagueWins = 0;
  let totalAfcMatchupWins = 0;
  let totalNfcMatchupWins = 0;
  let totalAfcPoints = 0;
  let totalNfcPoints = 0;

  const leagueIterations = config.iterations;

  for (let i = 0; i < leagueIterations; i++) {
    let afcMatchupWins = 0;
    let nfcMatchupWins = 0;
    let iterAfcPoints = 0;
    let iterNfcPoints = 0;

    // Simulate each matchup outcome based on probabilities
    matchups.forEach((matchup) => {
      const rand = Math.random();
      if (rand < matchup.afcWinProbability) {
        afcMatchupWins++;
      } else {
        nfcMatchupWins++;
      }

      // Sample scores (simple normal approximation around projected)
      const afcScore = matchup.projectedAfcScore + (Math.random() - 0.5) * 40;
      const nfcScore = matchup.projectedNfcScore + (Math.random() - 0.5) * 40;
      iterAfcPoints += afcScore;
      iterNfcPoints += nfcScore;
    });

    totalAfcMatchupWins += afcMatchupWins;
    totalNfcMatchupWins += nfcMatchupWins;
    totalAfcPoints += iterAfcPoints;
    totalNfcPoints += iterNfcPoints;

    // Determine league winner (7+ wins, or points tiebreaker at 6-6)
    if (afcMatchupWins > nfcMatchupWins) {
      afcLeagueWins++;
    } else if (nfcMatchupWins > afcMatchupWins) {
      nfcLeagueWins++;
    } else {
      // 6-6 tie - use total points
      if (iterAfcPoints > iterNfcPoints) {
        afcLeagueWins++;
      } else {
        nfcLeagueWins++;
      }
    }
  }

  return {
    afcWinProbability: afcLeagueWins / leagueIterations,
    nfcWinProbability: nfcLeagueWins / leagueIterations,
    expectedAfcWins: totalAfcMatchupWins / leagueIterations,
    expectedNfcWins: totalNfcMatchupWins / leagueIterations,
    expectedAfcTotalPoints: Math.round(totalAfcPoints / leagueIterations),
    expectedNfcTotalPoints: Math.round(totalNfcPoints / leagueIterations),
    matchups,
    simulationCount: config.iterations,
    generatedAt: new Date().toISOString(),
  };
};

