import { NextRequest, NextResponse } from 'next/server';
import { type LineupPlayer, simulateMatchupProbabilityFromPlayers } from '@gauntlet/sim-engine';
import { ScoringSettings, calculateLeagueProjections } from '@/lib/calculate-league-projections';
import { prisma } from '@/lib/prisma';

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
  highestScoringMatchup: MatchupOdds[];
  lowestScoringMatchup: MatchupOdds[];
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
    const odds = Math.round(-(probability / (1 - probability)) * 100);
    return `${odds}`;
  } else {
    // Positive odds for underdogs
    const odds = Math.round(((1 - probability) / probability) * 100);
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

  const result = simulation.mean + z * stdDev;

  // Debug extreme values
  if (result < 0 || result > 300) {
    console.warn(
      `⚠️ [SAMPLE] Extreme sampled score: ${result.toFixed(1)} (mean=${simulation.mean.toFixed(1)}, stdDev=${stdDev.toFixed(1)}, z=${z.toFixed(2)})`
    );
  }

  return result;
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

// Calculate probabilities for matchup total scores using Monte Carlo simulation
function calculateMatchupScoringProbabilities(
  matchups: Array<{ team1: { simulation: any }; team2: { simulation: any }; simulation?: any }>,
  isHighest: boolean = true,
  iterations: number = 5000
) {
  const scoringCounts = new Array(matchups.length).fill(0);

  // Run simulations to see which matchup most often has the highest/lowest total score
  for (let iter = 0; iter < iterations; iter++) {
    const simulatedTotals = matchups.map(matchup => {
      const team1Score = sampleTeamScore(matchup.team1.simulation);
      const team2Score = sampleTeamScore(matchup.team2.simulation);
      return team1Score + team2Score;
    });

    // Find the matchup with the highest/lowest total in this iteration
    let targetIndex = 0;
    let bestTotal = simulatedTotals[0];

    for (let i = 1; i < simulatedTotals.length; i++) {
      if (isHighest) {
        if (simulatedTotals[i] > bestTotal) {
          bestTotal = simulatedTotals[i];
          targetIndex = i;
        }
      } else {
        if (simulatedTotals[i] < bestTotal) {
          bestTotal = simulatedTotals[i];
          targetIndex = i;
        }
      }
    }

    scoringCounts[targetIndex]++;
  }

  // Convert to probabilities
  return scoringCounts.map(count => count / iterations);
}

// Get stored simulation results for a team from the database
async function getStoredTeamSimulation(
  leagueId: string,
  week: number,
  rosterId: number
): Promise<{ mean: number; p10: number; p50: number; p90: number } | null> {
  console.log(
    `🔍 [LEAGUE ODDS] Getting stored simulation for roster ${rosterId} in league ${leagueId} week ${week}`
  );

  // Import Prisma client
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Find the matchup this team is in
    const matchup = await prisma.matchup.findFirst({
      where: {
        leagueId,
        week,
        rosterId,
      },
    });

    if (!matchup || !matchup.matchupId) {
      console.warn(
        `❌ [LEAGUE ODDS] No matchup found for roster ${rosterId} in league ${leagueId} week ${week}`
      );
      return null;
    }

    console.log(`✅ [LEAGUE ODDS] Found matchup ${matchup.matchupId} for roster ${rosterId}`);

    // Get the stored simulation for this matchup
    const storedSim = await prisma.matchupSimulation.findFirst({
      where: {
        leagueId,
        week,
        matchupId: matchup.matchupId,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!storedSim) {
      console.warn(`❌ [LEAGUE ODDS] No stored simulation found for matchup ${matchup.matchupId}`);
      return null;
    }

    console.log(`📊 [LEAGUE ODDS] Found stored simulation for matchup ${matchup.matchupId}:`);
    console.log(
      `    Team A: ${storedSim.teamAWinPct.toFixed(3)} win% (${storedSim.teamAMean.toFixed(1)} pts)`
    );
    console.log(
      `    Team B: ${storedSim.teamBWinPct.toFixed(3)} win% (${storedSim.teamBMean.toFixed(1)} pts)`
    );

    // Determine if this roster is team A or team B in the matchup
    const matchupTeams = await prisma.matchup.findMany({
      where: {
        leagueId,
        week,
        matchupId: matchup.matchupId,
      },
      select: { rosterId: true },
      orderBy: { rosterId: 'asc' }, // Ensure consistent ordering
    });

    const isTeamA = matchupTeams[0]?.rosterId === rosterId;
    console.log(
      `🏈 [LEAGUE ODDS] Roster ${rosterId} is ${isTeamA ? 'Team A' : 'Team B'} in matchup ${matchup.matchupId}`
    );
    console.log(`    Matchup teams: [${matchupTeams.map(t => t.rosterId).join(', ')}]`);

    const result = {
      mean: isTeamA ? storedSim.teamAMean : storedSim.teamBMean,
      p10: isTeamA ? storedSim.teamAP10 : storedSim.teamBP10,
      p50: isTeamA ? storedSim.teamAMedian : storedSim.teamBMedian,
      p90: isTeamA ? storedSim.teamAP90 : storedSim.teamBP90,
    };

    console.log(
      `📈 [LEAGUE ODDS] Returning simulation for roster ${rosterId}: mean=${result.mean.toFixed(1)}, p50=${result.p50.toFixed(1)}, range=${result.p10.toFixed(1)}-${result.p90.toFixed(1)}`
    );

    return result;
  } catch (error) {
    console.error(`💥 [LEAGUE ODDS] Database error in getStoredTeamSimulation:`, error);
    return null;
  } finally {
    await prisma.$disconnect();
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

    // Determine season dynamically from leagues (fallback to current calendar year)
    const leaguesMeta = await prisma.league.findMany({
      where: { id: { in: ['1263744209295245312', '1263740549504962561'] } },
      select: { id: true, season: true },
    });
    const detectedSeason =
      leaguesMeta.find(l => l.id === '1263744209295245312')?.season ||
      leaguesMeta.find(l => l.id === '1263740549504962561')?.season ||
      new Date().getFullYear().toString();

    // Fetch raw projections once for both leagues using detected season
    const rawProjections = await fetchRawProjections(detectedSeason, week);
    const hasProjections = rawProjections.length > 0;
    if (!hasProjections) {
      console.warn(
        `⚠️ [LEAGUE ODDS] No projections available for season ${detectedSeason}, week ${week}. Falling back to stored simulations only.`
      );
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
        const leagueProjections = hasProjections
          ? calculateLeagueProjections(rawProjections, scoringSettings)
          : ({} as Record<string, { points: number }>);
        const getPlayerProjection = (playerId: string): number => {
          return leagueProjections[playerId]?.points || 0;
        };

        // Get stored simulation results for each team in this league
        console.log(
          `🔄 [LEAGUE ODDS] Processing ${matchups.length} teams in ${leagueNames[leagueId as keyof typeof leagueNames]}`
        );

        for (const team of matchups) {
          console.log(
            `🔍 [LEAGUE ODDS] Processing team ${team.rosterId} with ${team.starters?.length || 0} starters`
          );

          if (!team.starters || team.starters.length === 0) {
            console.warn(`⚠️ [LEAGUE ODDS] Skipping team ${team.rosterId} - no starters`);
            continue;
          }

          // Compute projection total up front
          let totalProjection = (team.starters || []).reduce(
            (sum: number, playerId: string) => sum + getPlayerProjection(playerId),
            0
          );

          let simulation;
          try {
            simulation = await getStoredTeamSimulation(leagueId, week, team.rosterId);
            if (!simulation) {
              if (hasProjections && totalProjection > 0) {
                // Build a simulation fallback from projections
                // Estimate std dev as 18% of mean, derive p10/p90 using ~1.28 std devs
                const mean = totalProjection;
                const stdDev = Math.max(6, mean * 0.18);
                const p10 = Math.max(0, mean - 1.28 * stdDev);
                const p90 = Math.max(p10 + 1, mean + 1.28 * stdDev);
                simulation = {
                  mean,
                  p10,
                  p50: mean,
                  p90,
                };
                console.warn(
                  `🧮 [LEAGUE ODDS] Using projection-based fallback sim for team ${team.rosterId}: mean=${mean.toFixed(
                    1
                  )}`
                );
              } else {
                console.warn(
                  `❌ [LEAGUE ODDS] Skipping team ${team.rosterId} - no stored simulation and no projections`
                );
                continue;
              }
            }
          } catch (error) {
            console.error(
              `💥 [LEAGUE ODDS] Error getting stored simulation for team ${team.rosterId}:`,
              error
            );
            continue;
          }

          if (!hasProjections && simulation) {
            totalProjection = simulation.mean;
          }

          console.log(`✅ [LEAGUE ODDS] Adding team ${team.rosterId} to allTeams array`);

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
      console.warn('⚠️ [LEAGUE ODDS] No teams available to compute odds. Returning empty payload.');
      const empty: LeagueWideOdds = {
        week,
        highestScorer: [],
        lowestScorer: [],
        closestMatchup: [],
        biggestBlowout: [],
        highestScoringMatchup: [],
        lowestScoringMatchup: [],
        lastUpdated: new Date().toISOString(),
      };
      return NextResponse.json(empty);
    }

    console.log(`📈 Running calculations on ${allTeams.length} teams total...`);

    // Calculate probabilities for all teams for highest/lowest scorer using Monte Carlo
    console.log(`🎲 Running Monte Carlo simulations for scoring probabilities...`);
    console.log(`📊 Input teams for Monte Carlo (${allTeams.length} total):`);
    allTeams.slice(0, 5).forEach((team, i) => {
      console.log(
        `  [${i}] ${getTeamName(team.team)}: mean=${team.simulation.mean.toFixed(1)}, p10-p90=${team.simulation.p10.toFixed(1)}-${team.simulation.p90.toFixed(1)}`
      );
    });

    const highestScorerProbs = calculateScoringProbabilities(allTeams, false, 25000);
    const lowestScorerProbs = calculateScoringProbabilities(allTeams, true, 25000);

    console.log(`🏆 Top 5 highest scorer probabilities:`);
    highestScorerProbs.slice(0, 5).forEach((prob, i) => {
      console.log(`  [${i}] ${getTeamName(allTeams[i].team)}: ${(prob * 100).toFixed(1)}%`);
    });
    console.log(`📉 Top 5 lowest scorer probabilities:`);
    const sortedLowestWithIndex = lowestScorerProbs
      .map((prob, i) => ({ prob, i }))
      .sort((a, b) => b.prob - a.prob);
    sortedLowestWithIndex.slice(0, 5).forEach(({ prob, i }) => {
      console.log(`  [${i}] ${getTeamName(allTeams[i].team)}: ${(prob * 100).toFixed(1)}%`);
    });

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

    // NOTE: Will calculate highest/lowest scoring probabilities after latestMatchupsForScoring is defined below

    // Fetch LATEST matchup simulations for live scoring data (separate from actualMatchups)
    const latestMatchupSimulations = await prisma.matchupSimulation.findMany({
      where: {
        week,
        league: {
          name: { in: ['Gauntlet AFC', 'Gauntlet NFC'] },
        },
      },
      include: {
        league: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get unique latest simulations (most recent per matchup)
    const uniqueLatestSims = new Map();
    latestMatchupSimulations.forEach(sim => {
      const key = `${sim.leagueId}-${sim.matchupId}`;
      if (!uniqueLatestSims.has(key)) {
        uniqueLatestSims.set(key, sim);
      }
    });

    const latestSimulations = Array.from(uniqueLatestSims.values());
    console.log(`🔄 Using ${latestSimulations.length} latest simulations for live scoring data`);

    // Fetch matchup details for latest simulations to get real team names
    const latestMatchupDetails = new Map();
    for (const sim of latestSimulations) {
      const matchups = await prisma.matchup.findMany({
        where: { leagueId: sim.leagueId, week, matchupId: sim.matchupId },
        include: {
          roster: {
            include: {
              owner: {
                select: { displayName: true, username: true, metadata: true },
              },
            },
          },
        },
      });

      if (matchups.length === 2) {
        latestMatchupDetails.set(`${sim.leagueId}-${sim.matchupId}`, {
          team1: getTeamName(matchups[0]),
          team2: getTeamName(matchups[1]),
          leagueId: sim.leagueId,
          team1Simulation: {
            mean: sim.teamAMean,
            p10: sim.teamAP10,
            p50: sim.teamAMedian,
            p90: sim.teamAP90,
          },
          team2Simulation: {
            mean: sim.teamBMean,
            p10: sim.teamBP10,
            p50: sim.teamBMedian,
            p90: sim.teamBP90,
          },
        });
      }
    }

    // Create latest matchups structure for scoring calculations
    const latestMatchupsForScoring = latestSimulations
      .map(sim => {
        const details = latestMatchupDetails.get(`${sim.leagueId}-${sim.matchupId}`);
        if (!details) return null;

        return {
          matchupId: sim.matchupId,
          leagueId: sim.leagueId,
          team1: {
            leagueId: sim.leagueId,
            simulation: details.team1Simulation,
          },
          team2: {
            leagueId: sim.leagueId,
            simulation: details.team2Simulation,
          },
          margin: Math.abs(sim.teamAMean - sim.teamBMean),
          simulation: sim,
        };
      })
      .filter(
        (
          m
        ): m is {
          matchupId: number;
          leagueId: string;
          team1: { leagueId: string; simulation: any };
          team2: { leagueId: string; simulation: any };
          margin: number;
          simulation: any;
        } => Boolean(m)
      );

    console.log(
      `🎯 Created ${latestMatchupsForScoring.length} latest matchups for scoring calculations`
    );

    // Calculate scoring probabilities with LATEST live data or fallback to actual matchups
    let liveHighestScoringProbabilities: number[] = [];
    let liveLowestScoringProbabilities: number[] = [];

    if (latestMatchupsForScoring.length > 0) {
      console.log(`🏆 Running Monte Carlo for LIVE highest scoring matchup probabilities...`);
      liveHighestScoringProbabilities = calculateMatchupScoringProbabilities(
        latestMatchupsForScoring.map(m => ({
          team1: m.team1,
          team2: m.team2,
          simulation: m.simulation,
        })),
        true,
        15000
      );
      console.log(`📉 Running Monte Carlo for LIVE lowest scoring matchup probabilities...`);
      liveLowestScoringProbabilities = calculateMatchupScoringProbabilities(
        latestMatchupsForScoring.map(m => ({
          team1: m.team1,
          team2: m.team2,
          simulation: m.simulation,
        })),
        false,
        15000
      );
    } else {
      console.log(
        `⚠️ No stored simulations found - using actual matchups for LIVE scoring calculations`
      );
      // Fallback to using actual matchups when no stored simulations exist
      liveHighestScoringProbabilities = calculateMatchupScoringProbabilities(
        actualMatchups,
        true,
        15000
      );
      liveLowestScoringProbabilities = calculateMatchupScoringProbabilities(
        actualMatchups,
        false,
        15000
      );
    }

    console.log(
      `⚖️ Top 3 closest matchup probabilities:`,
      closestProbabilities.slice(0, 3).map(p => (p * 100).toFixed(1) + '%')
    );
    console.log(
      `💥 Top 3 biggest blowout probabilities:`,
      biggestProbabilities.slice(0, 3).map(p => (p * 100).toFixed(1) + '%')
    );
    console.log(
      `🔥 LIVE highest scoring probabilities:`,
      liveHighestScoringProbabilities.slice(0, 3).map(p => (p * 100).toFixed(1) + '%')
    );
    console.log(
      `❄️ LIVE lowest scoring probabilities:`,
      liveLowestScoringProbabilities.slice(0, 3).map(p => (p * 100).toFixed(1) + '%')
    );

    // Add probabilities to matchups (for closest/biggest blowouts)
    const matchupsWithProbs = [...actualMatchups].map((matchup, index) => ({
      ...matchup,
      closestProb: closestProbabilities[index],
      biggestProb: biggestProbabilities[index],
    }));

    // Add LIVE scoring probabilities to matchups (use stored sims if available, otherwise actual matchups)
    const liveMatchupsWithProbs =
      latestMatchupsForScoring.length > 0
        ? [...latestMatchupsForScoring].map((matchup, index) => ({
            ...matchup,
            liveHighestScoringProb: liveHighestScoringProbabilities[index],
            liveLowestScoringProb: liveLowestScoringProbabilities[index],
          }))
        : [...actualMatchups].map((matchup, index) => ({
            ...matchup,
            liveHighestScoringProb: liveHighestScoringProbabilities[index],
            liveLowestScoringProb: liveLowestScoringProbabilities[index],
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

    // Build highest scoring matchup odds using LIVE Monte Carlo probabilities
    const highestScoringMatchup: MatchupOdds[] = liveMatchupsWithProbs
      .map(matchup => {
        // Handle both stored simulation data and fallback actual matchup data
        let team1Name: string,
          team2Name: string,
          team1Proj: number,
          team2Proj: number,
          margin: number;

        if (latestMatchupsForScoring.length > 0) {
          // Using stored simulation data
          const details = latestMatchupDetails.get(`${matchup.leagueId}-${matchup.matchupId}`);
          if (!details) return null;
          team1Name = details.team1;
          team2Name = details.team2;
          team1Proj = matchup.team1.simulation.mean;
          team2Proj = matchup.team2.simulation.mean;
          margin = matchup.margin;
        } else {
          // Using actual matchup fallback data - get names using getTeamName helper
          team1Name = getTeamName((matchup as any).team1.team);
          team2Name = getTeamName((matchup as any).team2.team);
          team1Proj = (matchup as any).team1.simulation.mean;
          team2Proj = (matchup as any).team2.simulation.mean;
          margin = (matchup as any).margin;
        }

        return {
          matchupId: matchup.matchupId,
          team1: {
            name: team1Name,
            leagueId: matchup.leagueId,
            projection: Math.round(team1Proj * 100) / 100,
          },
          team2: {
            name: team2Name,
            leagueId: matchup.leagueId,
            projection: Math.round(team2Proj * 100) / 100,
          },
          projectedMargin: Math.round(margin * 100) / 100,
          probability: Math.round(matchup.liveHighestScoringProb * 1000) / 1000,
          odds: probabilityToAmericanOdds(matchup.liveHighestScoringProb),
          color: probabilityToColor(matchup.liveHighestScoringProb),
        };
      })
      .filter((m): m is MatchupOdds => Boolean(m))
      .sort((a, b) => b.probability - a.probability); // Sort by highest probability first

    // Build lowest scoring matchup odds using LIVE Monte Carlo probabilities
    const lowestScoringMatchup: MatchupOdds[] = liveMatchupsWithProbs
      .map(matchup => {
        // Handle both stored simulation data and fallback actual matchup data
        let team1Name: string,
          team2Name: string,
          team1Proj: number,
          team2Proj: number,
          margin: number;

        if (latestMatchupsForScoring.length > 0) {
          // Using stored simulation data
          const details = latestMatchupDetails.get(`${matchup.leagueId}-${matchup.matchupId}`);
          if (!details) return null;
          team1Name = details.team1;
          team2Name = details.team2;
          team1Proj = matchup.team1.simulation.mean;
          team2Proj = matchup.team2.simulation.mean;
          margin = matchup.margin;
        } else {
          // Using actual matchup fallback data - get names using getTeamName helper
          team1Name = getTeamName((matchup as any).team1.team);
          team2Name = getTeamName((matchup as any).team2.team);
          team1Proj = (matchup as any).team1.simulation.mean;
          team2Proj = (matchup as any).team2.simulation.mean;
          margin = (matchup as any).margin;
        }

        return {
          matchupId: matchup.matchupId,
          team1: {
            name: team1Name,
            leagueId: matchup.leagueId,
            projection: Math.round(team1Proj * 100) / 100,
          },
          team2: {
            name: team2Name,
            leagueId: matchup.leagueId,
            projection: Math.round(team2Proj * 100) / 100,
          },
          projectedMargin: Math.round(margin * 100) / 100,
          probability: Math.round(matchup.liveLowestScoringProb * 1000) / 1000,
          odds: probabilityToAmericanOdds(matchup.liveLowestScoringProb),
          color: probabilityToColor(matchup.liveLowestScoringProb),
        };
      })
      .filter((m): m is MatchupOdds => Boolean(m))
      .sort((a, b) => b.probability - a.probability); // Sort by highest probability first

    // Build response
    const leagueWideOdds: LeagueWideOdds = {
      week,
      highestScorer: highestScorerOdds,
      lowestScorer: lowestScorerOdds,
      closestMatchup: closestMatchupOdds,
      biggestBlowout: biggestBlowoutOdds,
      highestScoringMatchup,
      lowestScoringMatchup,
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
    console.log(
      `🔥 LIVE highest scoring: ${highestScoringMatchup[0]?.team1.name} vs ${highestScoringMatchup[0]?.team2.name} (${(highestScoringMatchup[0]?.team1.projection + highestScoringMatchup[0]?.team2.projection)?.toFixed(1)} pts)`
    );
    console.log(
      `❄️ LIVE lowest scoring: ${lowestScoringMatchup[0]?.team1.name} vs ${lowestScoringMatchup[0]?.team2.name} (${(lowestScoringMatchup[0]?.team1.projection + lowestScoringMatchup[0]?.team2.projection)?.toFixed(1)} pts)`
    );

    return NextResponse.json(leagueWideOdds);
  } catch (error) {
    console.error('❌ Error calculating league-wide odds:', error);
    return NextResponse.json({ error: 'Failed to calculate league-wide odds' }, { status: 500 });
  }
}
