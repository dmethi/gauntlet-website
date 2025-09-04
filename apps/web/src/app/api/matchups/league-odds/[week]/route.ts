import { NextRequest, NextResponse } from 'next/server';
import { type LineupPlayer, simulateMatchupProbabilityFromPlayers } from '@gauntlet/sim-engine';
import { ScoringSettings, calculateLeagueProjections } from '@/lib/calculate-league-projections';

interface TeamOdds {
  teamId: string;
  teamName: string;
  leagueId: string;
  leagueName: string;
  probability: number;
  odds: string; // American odds format (+150, -200, etc.)
  projectedRange: { p10: number; p50: number; p90: number };
  totalProjection: number;
  color: string; // RdYlGn color for heatmap
}

interface MatchupOdds {
  matchupId: number;
  team1: { name: string; leagueId: string; projection: number };
  team2: { name: string; leagueId: string; projection: number };
  projectedMargin: number;
  probability: number;
  odds: string;
  color: string;
}

interface LeagueWideOdds {
  week: number;
  highestScorer: TeamOdds[];
  lowestScorer: TeamOdds[];
  closestMatchup: MatchupOdds[];
  biggestBlowout: MatchupOdds[];
  lastUpdated: string;
}

// Fetch raw projections from Sleeper
async function fetchRawProjections(season: string, week: number): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.sleeper.com/projections/nfl/${season}/${week}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF&order_by=pts_half_ppr`,
      {
        headers: {
          'User-Agent': 'Gauntlet-Website/1.0.0',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.warn(`🔥 [LEAGUE ODDS] Failed to fetch projections: ${response.status}`);
      return [];
    }

    const projections = await response.json();
    console.log(`📊 [LEAGUE ODDS] Fetched raw projections for ${projections.length} players`);
    return projections;
  } catch (error) {
    console.error('❌ [LEAGUE ODDS] Error fetching projections:', error);
    return [];
  }
}

// Get matchups from database directly
async function getMatchupsFromDB(leagueId: string, week: number) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const matchups = await prisma.matchup.findMany({
        where: {
          leagueId,
          week,
        },
        include: {
          roster: {
            include: {
              owner: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                  metadata: true,
                },
              },
            },
          },
        },
        orderBy: [{ matchupId: 'asc' }, { rosterId: 'asc' }],
      });

      // Get league info with scoring settings
      const league = await prisma.league.findUnique({
        where: { id: leagueId },
        select: { id: true, name: true, scoringSettings: true },
      });

      if (!league) {
        throw new Error(`League ${leagueId} not found`);
      }

      // Get all unique player IDs
      const allPlayerIds = new Set<string>();
      matchups.forEach(matchup => {
        [...(matchup.starters || []), ...(matchup.players || [])].forEach(playerId => {
          if (playerId) allPlayerIds.add(playerId);
        });
      });

      // Get player details
      const players = await prisma.player.findMany({
        where: { id: { in: Array.from(allPlayerIds) } },
        select: { id: true, fullName: true, position: true, team: true },
      });
      const playersMap = new Map(players.map(p => [p.id, p]));

      return { matchups, league, playersMap };
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error fetching matchups from DB:', error);
    throw error;
  }
}

// Helper functions for team data
const getTeamName = (matchup: any) =>
  matchup.roster?.owner?.metadata?.team_name ||
  matchup.roster?.owner?.displayName ||
  matchup.roster?.owner?.username ||
  `Team ${matchup.rosterId}`;

// Convert probability to American odds format
function probabilityToAmericanOdds(probability: number): string {
  if (probability <= 0) return '+∞';
  if (probability >= 1) return '-∞';

  if (probability >= 0.5) {
    // Negative odds for favorites
    const odds = Math.round(-100 / (probability / (1 - probability)));
    return `${odds}`;
  } else {
    // Positive odds for underdogs
    const odds = Math.round(100 * ((1 - probability) / probability));
    return `+${odds}`;
  }
}

// Generate RdYlGn color based on probability (Red = low, Yellow = medium, Green = high)
function probabilityToColor(probability: number, reverse: boolean = false): string {
  // Normalize probability to 0-1 range for color mapping
  let normalizedProb = Math.max(0, Math.min(1, probability));

  // For lowest scorer, reverse the color scale (high probability of being lowest = red)
  if (reverse) {
    normalizedProb = 1 - normalizedProb;
  }

  // RdYlGn color scale
  if (normalizedProb < 0.33) {
    // Red to Yellow
    const ratio = normalizedProb / 0.33;
    const r = 255;
    const g = Math.round(255 * ratio);
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  } else if (normalizedProb < 0.66) {
    // Yellow to Green
    const ratio = (normalizedProb - 0.33) / 0.33;
    const r = Math.round(255 * (1 - ratio));
    const g = 255;
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Green
    const ratio = (normalizedProb - 0.66) / 0.34;
    const r = 0;
    const g = 255;
    const b = Math.round(128 * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// Sample a score from a team's distribution using normal approximation
function sampleTeamScore(simulation: { mean: number; p10: number; p90: number }): number {
  // Estimate standard deviation from P10/P90 (roughly 1.28 std devs from mean)
  const stdDev = (simulation.p90 - simulation.p10) / (2 * 1.28);

  // Generate normal random sample
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  return simulation.mean + z * stdDev;
}

// Calculate probabilities for highest/lowest scorer using proper Monte Carlo simulation
function calculateScoringProbabilities(
  allTeams: any[],
  isLowestScorer: boolean = false,
  iterations: number = 10000
) {
  const winCounts = new Array(allTeams.length).fill(0);

  // Run Monte Carlo simulations
  for (let iter = 0; iter < iterations; iter++) {
    // Sample scores for all teams
    const scores = allTeams.map(team => sampleTeamScore(team.simulation));

    // Find winner (highest or lowest scorer)
    let winnerIndex = 0;
    let bestScore = scores[0];

    for (let i = 1; i < scores.length; i++) {
      if (isLowestScorer) {
        if (scores[i] < bestScore) {
          bestScore = scores[i];
          winnerIndex = i;
        }
      } else {
        if (scores[i] > bestScore) {
          bestScore = scores[i];
          winnerIndex = i;
        }
      }
    }

    winCounts[winnerIndex]++;
  }

  // Convert to probabilities
  return winCounts.map(count => count / iterations);
}

// Get actual matchups from both leagues
function getActualMatchups(allTeams: any[]) {
  const matchupMap = new Map<string, any[]>();

  // Group teams by matchupId within each league
  allTeams.forEach(teamData => {
    const key = `${teamData.leagueId}-${teamData.team.matchupId}`;
    if (!matchupMap.has(key)) {
      matchupMap.set(key, []);
    }
    matchupMap.get(key)!.push(teamData);
  });

  // Convert to matchup pairs and calculate margins
  const matchups: Array<{
    matchupId: number;
    leagueId: string;
    team1: any;
    team2: any;
    margin: number;
  }> = [];

  matchupMap.forEach((teams, _key) => {
    if (teams.length === 2) {
      const [team1, team2] = teams;
      const margin = Math.abs(team1.simulation.mean - team2.simulation.mean);

      matchups.push({
        matchupId: team1.team.matchupId,
        leagueId: team1.leagueId,
        team1,
        team2,
        margin,
      });
    }
  });

  return matchups;
}

// Calculate probabilities for matchup margins using Monte Carlo simulation
function calculateMatchupMarginProbabilities(
  actualMatchups: Array<{ team1: any; team2: any; margin: number }>,
  isClosest: boolean = true,
  iterations: number = 5000
) {
  const marginCounts = new Array(actualMatchups.length).fill(0);

  // Run simulations to see which matchup most often has the desired margin characteristic
  for (let iter = 0; iter < iterations; iter++) {
    const simulatedMargins = actualMatchups.map(matchup => {
      const team1Score = sampleTeamScore(matchup.team1.simulation);
      const team2Score = sampleTeamScore(matchup.team2.simulation);
      return Math.abs(team1Score - team2Score);
    });

    // Find the matchup with the closest/biggest margin in this iteration
    let targetIndex = 0;
    let bestMargin = simulatedMargins[0];

    for (let i = 1; i < simulatedMargins.length; i++) {
      if (isClosest) {
        if (simulatedMargins[i] < bestMargin) {
          bestMargin = simulatedMargins[i];
          targetIndex = i;
        }
      } else {
        if (simulatedMargins[i] > bestMargin) {
          bestMargin = simulatedMargins[i];
          targetIndex = i;
        }
      }
    }

    marginCounts[targetIndex]++;
  }

  // Convert to probabilities
  return marginCounts.map(count => count / iterations);
}

// Run simulation for a single team
async function simulateTeamScore(
  team: any,
  playersMap: Map<string, any>,
  getPlayerProjection: (playerId: string) => number
): Promise<{ mean: number; p10: number; p50: number; p90: number }> {
  // Convert starters to LineupPlayer format
  const starters: LineupPlayer[] = (team.starters || []).map((playerId: string) => {
    const player = playersMap.get(playerId);
    return {
      id: playerId,
      name: player?.fullName || 'Unknown Player',
      position: player?.position || 'UNKNOWN',
      projection: getPlayerProjection(playerId),
    };
  });

  try {
    // Run simulation for this team vs a dummy opponent (we only care about team1 results)
    const dummyOpponent: LineupPlayer[] = starters.map(s => ({ ...s, projection: 0 }));
    const simulation = await simulateMatchupProbabilityFromPlayers(
      starters,
      dummyOpponent,
      1000,
      0
    );

    return {
      mean: simulation.team1Scores.mean,
      p10: simulation.team1Scores.p10,
      p50: simulation.team1Scores.median,
      p90: simulation.team1Scores.p90,
    };
  } catch (error) {
    console.error(`Error simulating team score for ${getTeamName(team)}:`, error);
    // Fallback to simple projection sum
    const totalProjection = starters.reduce((sum, player) => sum + player.projection, 0);
    return {
      mean: totalProjection,
      p10: totalProjection * 0.8,
      p50: totalProjection,
      p90: totalProjection * 1.2,
    };
  }
}

export async function GET(request: NextRequest, { params }: { params: { week: string } }) {
  const week = parseInt(params.week);

  if (isNaN(week) || week < 1 || week > 18) {
    return NextResponse.json({ error: 'Invalid week parameter' }, { status: 400 });
  }

  try {
    console.log(`🎯 Calculating league-wide odds for Week ${week}...`);

    // The two Gauntlet leagues
    const leagueIds = ['1263744209295245312', '1263740549504962561']; // AFC and NFC
    const leagueNames = {
      '1263744209295245312': 'Gauntlet AFC',
      '1263740549504962561': 'Gauntlet NFC',
    };

    // Fetch raw projections once for both leagues
    const rawProjections = await fetchRawProjections('2025', week);
    if (rawProjections.length === 0) {
      throw new Error('No projection data available');
    }

    // Collect all teams and their simulated scores
    const allTeams: Array<{
      team: any;
      leagueId: string;
      leagueName: string;
      simulation: { mean: number; p10: number; p50: number; p90: number };
      totalProjection: number;
    }> = [];

    // Process each league
    for (const leagueId of leagueIds) {
      try {
        console.log(`📊 Processing league ${leagueNames[leagueId as keyof typeof leagueNames]}...`);

        const { matchups, league, playersMap } = await getMatchupsFromDB(leagueId, week);

        if (matchups.length === 0) {
          console.warn(`⚠️ No matchups found for league ${leagueId}, week ${week}`);
          continue;
        }

        // Calculate league-specific projections
        const scoringSettings = (league.scoringSettings as ScoringSettings) || {};
        const leagueProjections = calculateLeagueProjections(rawProjections, scoringSettings);
        const getPlayerProjection = (playerId: string): number => {
          return leagueProjections[playerId]?.points || 0;
        };

        // Simulate each team in this league
        for (const team of matchups) {
          if (!team.starters || team.starters.length === 0) continue;

          const simulation = await simulateTeamScore(team, playersMap, getPlayerProjection);
          const totalProjection = (team.starters || []).reduce(
            (sum: number, playerId: string) => sum + getPlayerProjection(playerId),
            0
          );

          allTeams.push({
            team,
            leagueId,
            leagueName: leagueNames[leagueId as keyof typeof leagueNames],
            simulation,
            totalProjection,
          });
        }

        console.log(`✅ Processed ${matchups.length} teams from ${league.name}`);
      } catch (error) {
        console.error(`❌ Error processing league ${leagueId}:`, error);
        continue;
      }
    }

    if (allTeams.length === 0) {
      throw new Error('No teams found across both leagues');
    }

    console.log(`📈 Running calculations on ${allTeams.length} teams total...`);

    // Calculate probabilities for all teams for highest/lowest scorer using Monte Carlo
    console.log(`🎲 Running Monte Carlo simulations for scoring probabilities...`);
    const highestScorerProbs = calculateScoringProbabilities(allTeams, false, 25000);
    const lowestScorerProbs = calculateScoringProbabilities(allTeams, true, 25000);

    console.log(
      `🏆 Top 3 highest scorer probabilities:`,
      highestScorerProbs.slice(0, 3).map(p => (p * 100).toFixed(1) + '%')
    );
    console.log(
      `📉 Top 3 lowest scorer probabilities:`,
      lowestScorerProbs.slice(0, 3).map(p => (p * 100).toFixed(1) + '%')
    );

    // Build highest scorer odds for all teams
    const highestScorerOdds: TeamOdds[] = allTeams
      .map((team, index) => ({
        teamId: team.team.rosterId.toString(),
        teamName: getTeamName(team.team),
        leagueId: team.leagueId,
        leagueName: team.leagueName,
        probability: Math.round(highestScorerProbs[index] * 1000) / 1000,
        odds: probabilityToAmericanOdds(highestScorerProbs[index]),
        projectedRange: {
          p10: Math.round(team.simulation.p10 * 100) / 100,
          p50: Math.round(team.simulation.p50 * 100) / 100,
          p90: Math.round(team.simulation.p90 * 100) / 100,
        },
        totalProjection: Math.round(team.totalProjection * 100) / 100,
        color: probabilityToColor(highestScorerProbs[index]),
      }))
      .sort((a, b) => b.probability - a.probability);

    // Build lowest scorer odds for all teams
    const lowestScorerOdds: TeamOdds[] = allTeams
      .map((team, index) => ({
        teamId: team.team.rosterId.toString(),
        teamName: getTeamName(team.team),
        leagueId: team.leagueId,
        leagueName: team.leagueName,
        probability: Math.round(lowestScorerProbs[index] * 1000) / 1000,
        odds: probabilityToAmericanOdds(lowestScorerProbs[index]),
        projectedRange: {
          p10: Math.round(team.simulation.p10 * 100) / 100,
          p50: Math.round(team.simulation.p50 * 100) / 100,
          p90: Math.round(team.simulation.p90 * 100) / 100,
        },
        totalProjection: Math.round(team.totalProjection * 100) / 100,
        color: probabilityToColor(lowestScorerProbs[index], true), // Reverse colors for lowest
      }))
      .sort((a, b) => b.probability - a.probability);

    // Get actual matchups and calculate closest/biggest blowout odds
    const actualMatchups = getActualMatchups(allTeams);

    console.log(`📊 Found ${actualMatchups.length} actual matchups for probability calculation`);

    // Calculate simulation-based probabilities for matchup margins
    console.log(`🎯 Running Monte Carlo for closest matchup probabilities...`);
    const closestProbabilities = calculateMatchupMarginProbabilities(actualMatchups, true, 15000);
    console.log(`💥 Running Monte Carlo for biggest blowout probabilities...`);
    const biggestProbabilities = calculateMatchupMarginProbabilities(actualMatchups, false, 15000);

    console.log(
      `⚖️ Top 3 closest matchup probabilities:`,
      closestProbabilities.slice(0, 3).map(p => (p * 100).toFixed(1) + '%')
    );
    console.log(
      `💥 Top 3 biggest blowout probabilities:`,
      biggestProbabilities.slice(0, 3).map(p => (p * 100).toFixed(1) + '%')
    );

    // Add probabilities to matchups
    const matchupsWithProbs = [...actualMatchups].map((matchup, index) => ({
      ...matchup,
      closestProb: closestProbabilities[index],
      biggestProb: biggestProbabilities[index],
    }));

    // Build closest matchup odds (ALL matchups, sorted by highest probability of being closest)
    const closestMatchupOdds: MatchupOdds[] = matchupsWithProbs
      .map(matchup => ({
        matchupId: matchup.matchupId,
        team1: {
          name: getTeamName(matchup.team1.team),
          leagueId: matchup.team1.leagueId,
          projection: Math.round(matchup.team1.simulation.mean * 100) / 100,
        },
        team2: {
          name: getTeamName(matchup.team2.team),
          leagueId: matchup.team2.leagueId,
          projection: Math.round(matchup.team2.simulation.mean * 100) / 100,
        },
        projectedMargin: Math.round(matchup.margin * 100) / 100,
        probability: Math.round(matchup.closestProb * 1000) / 1000,
        odds: probabilityToAmericanOdds(matchup.closestProb),
        color: probabilityToColor(matchup.closestProb),
      }))
      .sort((a, b) => b.probability - a.probability); // Sort by highest probability first

    // Build biggest blowout odds (ALL matchups, sorted by highest probability of being biggest blowout)
    const biggestBlowoutOdds: MatchupOdds[] = matchupsWithProbs
      .map(matchup => ({
        matchupId: matchup.matchupId,
        team1: {
          name: getTeamName(matchup.team1.team),
          leagueId: matchup.team1.leagueId,
          projection: Math.round(matchup.team1.simulation.mean * 100) / 100,
        },
        team2: {
          name: getTeamName(matchup.team2.team),
          leagueId: matchup.team2.leagueId,
          projection: Math.round(matchup.team2.simulation.mean * 100) / 100,
        },
        projectedMargin: Math.round(matchup.margin * 100) / 100,
        probability: Math.round(matchup.biggestProb * 1000) / 1000,
        odds: probabilityToAmericanOdds(matchup.biggestProb),
        color: probabilityToColor(matchup.biggestProb),
      }))
      .sort((a, b) => b.probability - a.probability); // Sort by highest probability first

    // Build response
    const leagueWideOdds: LeagueWideOdds = {
      week,
      highestScorer: highestScorerOdds,
      lowestScorer: lowestScorerOdds,
      closestMatchup: closestMatchupOdds,
      biggestBlowout: biggestBlowoutOdds,
      lastUpdated: new Date().toISOString(),
    };

    console.log(`✅ Calculated league-wide odds for Week ${week}`);
    console.log(
      `🏆 Highest score favorite: ${highestScorerOdds[0].teamName} (${highestScorerOdds[0].odds})`
    );
    console.log(
      `📉 Lowest score favorite: ${lowestScorerOdds[0].teamName} (${lowestScorerOdds[0].odds})`
    );
    console.log(
      `⚖️  Closest matchup: ${closestMatchupOdds[0].team1.name} vs ${closestMatchupOdds[0].team2.name} (${closestMatchupOdds[0].projectedMargin} pt margin)`
    );
    console.log(
      `💥 Biggest blowout: ${biggestBlowoutOdds[0].team1.name} vs ${biggestBlowoutOdds[0].team2.name} (${biggestBlowoutOdds[0].projectedMargin} pt margin)`
    );

    return NextResponse.json(leagueWideOdds);
  } catch (error) {
    console.error('❌ Error calculating league-wide odds:', error);
    return NextResponse.json({ error: 'Failed to calculate league-wide odds' }, { status: 500 });
  }
}
