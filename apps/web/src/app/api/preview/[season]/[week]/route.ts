import { NextRequest, NextResponse } from 'next/server';
import { getMatchupsByWeek, getRostersByLeague, getUsersByLeague } from '@/lib/api-replacements';
import { sleeperClient } from '@/lib/sleeper/unified-client';
import axios from 'axios';
import reportData from '@/data/report-week2';

const GAUNTLET_LEAGUES = [
  { id: '1263744209295245312', name: 'Gauntlet AFC' },
  { id: '1263740549504962561', name: 'Gauntlet NFC' },
];

interface EspnEventCompetitor {
  id: string;
  homeAway: 'home' | 'away';
  score: string;
  team: { id: string; displayName: string; abbreviation: string };
}

interface EspnEvent {
  id: string;
  date: string; // ISO
  status: {
    type: {
      state: string;
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
  };
  competitions: Array<{
    id: string;
    status: {
      type: {
        state: string;
        description: string;
        detail: string;
        shortDetail: string;
        clock?: number;
        period?: number;
      };
    };
    competitors: EspnEventCompetitor[];
  }>;
}

interface EspnScoreboard {
  events: EspnEvent[];
}

interface GameWindow {
  name: string;
  games: Array<{
    eventId: string;
    startTime: string;
    homeTeam: string;
    awayTeam: string;
    homeAbbrev: string;
    awayAbbrev: string;
  }>;
}

interface PlayerInfo {
  id: string;
  name: string;
  team: string;
}

interface TeamSlateInfo {
  players: PlayerInfo[];
  projectedPoints: number;
}

interface TeamInfo {
  rosterId: number;
  leagueId: string;
  teamName: string;
  ownerName: string;
  starters: string[];
  projectedPoints: number;
  record: { wins: number; losses: number };
  powerRanking: { rank: number; score: number } | null;
  winProbability?: number;
  impliedOdds?: string;
}

interface FantasyMatchup {
  matchupId: number;
  leagueId: string;
  leagueName: string;
  teamA: TeamInfo;
  teamB: TeamInfo;
  playersAtStake: {
    thursday: PlayerInfo[];
    sundayEarly: PlayerInfo[];
    sundayLate: PlayerInfo[];
    sundayNight: PlayerInfo[];
    mondayNight: PlayerInfo[];
  };
  slateBreakdown: {
    thursday: { teamA: TeamSlateInfo; teamB: TeamSlateInfo };
    sundayEarly: { teamA: TeamSlateInfo; teamB: TeamSlateInfo };
    sundayLate: { teamA: TeamSlateInfo; teamB: TeamSlateInfo };
    sundayNight: { teamA: TeamSlateInfo; teamB: TeamSlateInfo };
    mondayNight: { teamA: TeamSlateInfo; teamB: TeamSlateInfo };
  };
  bettingOdds?: {
    favorite: 'teamA' | 'teamB';
    spread: number;
    moneylineA: string;
    moneylineB: string;
  };
}

// Helper to resolve a user-facing team name
function resolveTeamName(roster: any, owner: any): string {
  const rosterMetaName = ((roster?.metadata as any) || {})?.team_name as string | undefined;
  const ownerMetaName = ((owner?.metadata as any) || {})?.team_name as string | undefined;
  const ownerDisplay = owner?.displayName as string | undefined;
  const ownerUser = owner?.username as string | undefined;
  const name = rosterMetaName || ownerMetaName || ownerDisplay || ownerUser;
  if (!name) return `Team ${roster?.rosterId ?? ''}`.trim();
  return String(name);
}

// Fetch ESPN scoreboard for NFL games
async function fetchEspnScoreboard(): Promise<EspnScoreboard> {
  const url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
  const { data } = await axios.get(url, { timeout: 10000 });
  return data as EspnScoreboard;
}

// Group NFL games by time windows
function groupGamesByWindow(events: EspnEvent[]): GameWindow[] {
  const windows: GameWindow[] = [
    { name: 'Thursday Night', games: [] },
    { name: 'Sunday Noon (1:00 PM ET)', games: [] },
    { name: 'Sunday Late Afternoon (4:25 PM ET)', games: [] },
    { name: 'Sunday Night (8:20 PM ET)', games: [] },
    { name: 'Monday Night', games: [] },
  ];

  for (const event of events) {
    const competition = event.competitions[0];
    const homeTeam = competition?.competitors?.find(c => c.homeAway === 'home');
    const awayTeam = competition?.competitors?.find(c => c.homeAway === 'away');

    if (!homeTeam || !awayTeam) continue;

    const gameInfo = {
      eventId: event.id,
      startTime: event.date,
      homeTeam: homeTeam.team.displayName,
      awayTeam: awayTeam.team.displayName,
      homeAbbrev: homeTeam.team.abbreviation,
      awayAbbrev: awayTeam.team.abbreviation,
    };

    // Map games to windows based on their actual time patterns
    const gameTime = event.date;

    if (gameTime.includes('2025-09-19T00:15Z')) {
      // Thursday Night Football (MIA @ BUF)
      windows[0].games.push(gameInfo);
    } else if (gameTime.includes('2025-09-21T17:00Z')) {
      // Sunday 1:00 PM ET games
      windows[1].games.push(gameInfo);
    } else if (gameTime.includes('2025-09-21T20:0') || gameTime.includes('2025-09-21T20:2')) {
      // Sunday 4:25 PM ET games (20:05Z and 20:25Z)
      windows[2].games.push(gameInfo);
    } else if (gameTime.includes('2025-09-22T00:20Z')) {
      // Sunday Night Football (KC @ NYG)
      windows[3].games.push(gameInfo);
    } else if (gameTime.includes('2025-09-23T00:15Z')) {
      // Monday Night Football (DET @ BAL)
      windows[4].games.push(gameInfo);
    }
  }

  return windows;
}

// Get player's NFL team abbreviation and names from Sleeper API
async function getPlayerData(season: string): Promise<{
  teamMapping: Map<string, string>;
  playerNames: Map<string, string>;
}> {
  try {
    const players = await sleeperClient.fetchAllPlayers();

    const teamMapping = new Map<string, string>();
    const playerNames = new Map<string, string>();

    for (const [playerId, playerData] of Object.entries(players as Record<string, any>)) {
      if (playerData.team) {
        teamMapping.set(playerId, playerData.team);
      }
      if (playerData.full_name || playerData.first_name) {
        const name =
          playerData.full_name ||
          `${playerData.first_name || ''} ${playerData.last_name || ''}`.trim();
        playerNames.set(playerId, name);
      }
    }

    return { teamMapping, playerNames };
  } catch (error) {
    console.error('Failed to fetch player data:', error);
    return { teamMapping: new Map(), playerNames: new Map() };
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { season: string; week: string } }
) {
  try {
    const season = params.season;
    const weekNumber = parseInt(params.week, 10);

    if (!season || Number.isNaN(weekNumber)) {
      return NextResponse.json({ error: 'Invalid season or week parameter' }, { status: 400 });
    }

    // Fetch data in parallel
    const [espnData, playerData, nflState, powerRankingsData, week1Report, week2Report] =
      await Promise.all([
        fetchEspnScoreboard(),
        getPlayerData(season),
        sleeperClient.fetchNFLState(),
        fetch(`http://localhost:3002/api/reports/2025/2`)
          .then(r => r.json())
          .catch(() => ({ ok: false })),
        fetch(`http://localhost:3002/api/reports/2025/1`)
          .then(r => r.json())
          .catch(() => ({ ok: false })),
        fetch(`http://localhost:3002/api/reports/2025/2`)
          .then(r => r.json())
          .catch(() => ({ ok: false })),
      ]);

    const gameWindows = groupGamesByWindow(espnData.events);

    // Build power rankings lookup using hardcoded Week 2 data
    const powerRankingsLookup = new Map<string, { rank: number; score: number }>();
    if (reportData.powerRankings) {
      for (const pr of reportData.powerRankings) {
        powerRankingsLookup.set(`${pr.leagueId}-${pr.rosterId}`, {
          rank: pr.rank,
          score: pr.normalized || 0,
        });
      }
    }

    // Fetch matchup data for both leagues
    const allMatchups: FantasyMatchup[] = [];

    for (const league of GAUNTLET_LEAGUES) {
      try {
        const [rosters, users, matchups, leagueData, rawProjections] = await Promise.all([
          getRostersByLeague(league.id),
          getUsersByLeague(league.id),
          getMatchupsByWeek(league.id, weekNumber),
          sleeperClient.fetchLeague(league.id),
          sleeperClient.fetchWeeklyProjections(weekNumber, season),
        ]);

        // Build lookups
        const usersById = new Map<string, any>(users.map((u: any) => [u.id, u]));
        const rostersById = new Map<number, any>(rosters.map((r: any) => [r.rosterId, r]));

        // Process projections
        const rawProjectionsArray: any[] = Array.isArray(rawProjections)
          ? rawProjections
          : rawProjections
            ? Object.entries(rawProjections).map(([playerId, projection]) => ({
                ...(typeof projection === 'object' && projection !== null ? projection : {}),
                player_id: playerId,
              }))
            : [];

        // Use raw Sleeper projections (not sim projections) for player projections
        const projectionOf = (playerId: string): number => {
          const proj = rawProjectionsArray.find(p => p.player_id === playerId);
          return proj?.points || 0;
        };

        // Get team records from historical matchups
        const teamRecords = new Map<number, { wins: number; losses: number }>();

        // Fetch weeks 1 and 2 matchups to calculate records
        try {
          const [week1Matchups, week2Matchups] = await Promise.all([
            getMatchupsByWeek(league.id, 1),
            getMatchupsByWeek(league.id, 2),
          ]);

          // Process historical matchups to calculate wins/losses
          for (const weekMatchups of [week1Matchups, week2Matchups]) {
            const matchupPairs = new Map<number, any[]>();
            for (const m of weekMatchups as any[]) {
              if (!matchupPairs.has(m.matchupId)) matchupPairs.set(m.matchupId, []);
              matchupPairs.get(m.matchupId)!.push(m);
            }

            for (const [_, pair] of matchupPairs) {
              if (pair.length === 2) {
                const [a, b] = pair;
                const aWon = (a.points || 0) > (b.points || 0);
                const bWon = (b.points || 0) > (a.points || 0);

                if (!teamRecords.has(a.rosterId))
                  teamRecords.set(a.rosterId, { wins: 0, losses: 0 });
                if (!teamRecords.has(b.rosterId))
                  teamRecords.set(b.rosterId, { wins: 0, losses: 0 });

                if (aWon) {
                  teamRecords.get(a.rosterId)!.wins++;
                  teamRecords.get(b.rosterId)!.losses++;
                } else if (bWon) {
                  teamRecords.get(b.rosterId)!.wins++;
                  teamRecords.get(a.rosterId)!.losses++;
                }
              }
            }
          }
        } catch (error) {
          console.warn('Failed to fetch historical matchups for records:', error);
        }

        // Group matchups by matchupId
        const pairs = new Map<number, any[]>();
        for (const m of matchups as any[]) {
          if (m.matchupId == null) continue;
          const arr = pairs.get(m.matchupId) || [];
          arr.push(m);
          pairs.set(m.matchupId, arr);
        }

        // Process each matchup pair
        for (const [matchupId, group] of pairs.entries()) {
          if (group.length !== 2) continue;

          const [a, b] = group.sort((x, y) => x.rosterId - y.rosterId);
          const rosterA = rostersById.get(a.rosterId);
          const rosterB = rostersById.get(b.rosterId);
          const ownerA = rosterA ? usersById.get(rosterA.ownerId) : null;
          const ownerB = rosterB ? usersById.get(rosterB.ownerId) : null;

          if (!rosterA || !rosterB || !ownerA || !ownerB) continue;

          const startersA = (a.starters || []) as string[];
          const startersB = (b.starters || []) as string[];

          // Group players by game windows and track per-team breakdown
          const playersAtStake = {
            thursday: [] as PlayerInfo[],
            sundayEarly: [] as PlayerInfo[],
            sundayLate: [] as PlayerInfo[],
            sundayNight: [] as PlayerInfo[],
            mondayNight: [] as PlayerInfo[],
          };

          const slateBreakdown = {
            thursday: {
              teamA: { players: [] as PlayerInfo[], projectedPoints: 0 },
              teamB: { players: [] as PlayerInfo[], projectedPoints: 0 },
            },
            sundayEarly: {
              teamA: { players: [] as PlayerInfo[], projectedPoints: 0 },
              teamB: { players: [] as PlayerInfo[], projectedPoints: 0 },
            },
            sundayLate: {
              teamA: { players: [] as PlayerInfo[], projectedPoints: 0 },
              teamB: { players: [] as PlayerInfo[], projectedPoints: 0 },
            },
            sundayNight: {
              teamA: { players: [] as PlayerInfo[], projectedPoints: 0 },
              teamB: { players: [] as PlayerInfo[], projectedPoints: 0 },
            },
            mondayNight: {
              teamA: { players: [] as PlayerInfo[], projectedPoints: 0 },
              teamB: { players: [] as PlayerInfo[], projectedPoints: 0 },
            },
          };

          // Helper function to process players
          const processPlayer = (playerId: string, isTeamA: boolean) => {
            const playerTeam = playerData.teamMapping.get(playerId);
            const playerName = playerData.playerNames.get(playerId);
            const playerProjection = projectionOf(playerId);

            if (!playerTeam || !playerName) return;

            const playerInfo = {
              id: playerId,
              name: playerName,
              team: playerTeam,
            };

            // Find which game window this player's team is playing in
            for (const window of gameWindows) {
              const hasGame = window.games.some(
                game => game.homeAbbrev === playerTeam || game.awayAbbrev === playerTeam
              );

              if (hasGame) {
                const windowKey = window.name.includes('Thursday')
                  ? 'thursday'
                  : window.name.includes('Noon')
                    ? 'sundayEarly'
                    : window.name.includes('Late Afternoon')
                      ? 'sundayLate'
                      : window.name.includes('Sunday Night')
                        ? 'sundayNight'
                        : 'mondayNight';

                playersAtStake[windowKey].push(playerInfo);

                if (isTeamA) {
                  slateBreakdown[windowKey].teamA.players.push(playerInfo);
                  slateBreakdown[windowKey].teamA.projectedPoints += playerProjection;
                } else {
                  slateBreakdown[windowKey].teamB.players.push(playerInfo);
                  slateBreakdown[windowKey].teamB.projectedPoints += playerProjection;
                }
                break;
              }
            }
          };

          // Process Team A starters
          for (const playerId of startersA) {
            processPlayer(playerId, true);
          }

          // Process Team B starters
          for (const playerId of startersB) {
            processPlayer(playerId, false);
          }

          // Get team records and power rankings
          const teamARecord = teamRecords.get(a.rosterId) || { wins: 0, losses: 0 };
          const teamBRecord = teamRecords.get(b.rosterId) || { wins: 0, losses: 0 };
          const teamAPowerRank = powerRankingsLookup.get(`${league.id}-${a.rosterId}`);
          const teamBPowerRank = powerRankingsLookup.get(`${league.id}-${b.rosterId}`);

          // Calculate team projected points
          const teamAProjected = startersA.reduce((sum, pid) => sum + projectionOf(pid), 0);
          const teamBProjected = startersB.reduce((sum, pid) => sum + projectionOf(pid), 0);

          // Calculate win probabilities and betting odds
          const totalProjected = teamAProjected + teamBProjected;
          const teamAWinProb = totalProjected > 0 ? teamAProjected / totalProjected : 0.5;
          const teamBWinProb = 1 - teamAWinProb;

          // Convert to betting odds format
          const teamAOdds =
            teamAWinProb > 0.5
              ? `-${Math.round((100 * teamAWinProb) / (1 - teamAWinProb))}`
              : `+${Math.round((100 * (1 - teamAWinProb)) / teamAWinProb)}`;
          const teamBOdds =
            teamBWinProb > 0.5
              ? `-${Math.round((100 * teamBWinProb) / (1 - teamBWinProb))}`
              : `+${Math.round((100 * (1 - teamBWinProb)) / teamBWinProb)}`;

          const matchup: FantasyMatchup = {
            matchupId,
            leagueId: league.id,
            leagueName: league.name,
            teamA: {
              rosterId: a.rosterId,
              leagueId: league.id,
              teamName: resolveTeamName(rosterA, ownerA),
              ownerName: ownerA?.displayName || ownerA?.username || 'Unknown',
              starters: startersA,
              projectedPoints: teamAProjected,
              record: teamARecord,
              powerRanking: teamAPowerRank || null,
              winProbability: teamAWinProb,
              impliedOdds: teamAOdds,
            },
            teamB: {
              rosterId: b.rosterId,
              leagueId: league.id,
              teamName: resolveTeamName(rosterB, ownerB),
              ownerName: ownerB?.displayName || ownerB?.username || 'Unknown',
              starters: startersB,
              projectedPoints: teamBProjected,
              record: teamBRecord,
              powerRanking: teamBPowerRank || null,
              winProbability: teamBWinProb,
              impliedOdds: teamBOdds,
            },
            playersAtStake,
            slateBreakdown,
            bettingOdds: {
              favorite: teamAWinProb > teamBWinProb ? 'teamA' : 'teamB',
              spread: Math.abs(teamAProjected - teamBProjected),
              moneylineA: teamAOdds,
              moneylineB: teamBOdds,
            },
          };

          allMatchups.push(matchup);
        }
      } catch (error) {
        console.error(`Failed to process league ${league.id}:`, error);
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        season,
        week: weekNumber,
        lastUpdated: new Date().toISOString(),
        gameWindows,
        matchups: allMatchups,
        contextualReports: {
          week1: week1Report.ok ? week1Report.data : null,
          week2: week2Report.ok ? week2Report.data : null,
        },
        powerRankings: powerRankingsData.ok ? powerRankingsData.data?.powerRankings : null,
      },
    });
  } catch (error) {
    console.error('Week preview route error:', error);
    return NextResponse.json({ error: 'Failed to fetch week preview data' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
