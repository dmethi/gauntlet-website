#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';
import {
  type ScoringSettings,
  calculateLeagueProjections,
} from '../apps/web/src/lib/calculate-league-projections';

// Load environment variables from root .env file
config({ path: path.resolve(process.cwd(), '.env') });

const GAUNTLET_LEAGUES = [
  { id: '1263744209295245312', name: 'Gauntlet AFC' },
  { id: '1263740549504962561', name: 'Gauntlet NFC' },
];

interface ESPNGame {
  id: string;
  date: string;
  name: string;
  shortName: string;
  competitions: Array<{
    competitors: Array<{
      team: {
        abbreviation: string;
        displayName: string;
      };
    }>;
    date: string;
    timeValid: boolean;
  }>;
}

interface SleeperMatchup {
  matchup_id: number;
  roster_id: number;
  starters: string[];
  players: string[];
  starters_points?: number[];
  players_points?: { [key: string]: number };
  custom_points?: number;
}

interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  league_id: string;
  players: string[];
  starters: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
  };
  metadata?: {
    team_name?: string;
  };
}

interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
  metadata?: {
    team_name?: string;
  };
}

interface SleeperPlayer {
  player_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  position: string;
  team: string;
  status: string;
}

interface TimeWindow {
  name: string;
  shortName: string;
  games: ESPNGame[];
  teams: string[];
}

interface PreviewMatchup {
  teamA: {
    name: string;
    record: string;
    projection: number;
    players: Array<{
      name: string;
      position: string;
      team: string;
      projection: number;
      timeWindow: string;
    }>;
  };
  teamB: {
    name: string;
    record: string;
    projection: number;
    players: Array<{
      name: string;
      position: string;
      team: string;
      projection: number;
      timeWindow: string;
    }>;
  };
  bettingOdds: {
    favorite: 'teamA' | 'teamB';
    spread: number;
    moneylineA: number;
    moneylineB: number;
    total: number;
    over: string;
    under: string;
  };
  timeWindows: {
    thursdayNight: { teamA: number; teamB: number };
    early: { teamA: number; teamB: number };
    late: { teamA: number; teamB: number };
    sundayNight: { teamA: number; teamB: number };
    mondayNight: { teamA: number; teamB: number };
    other: { teamA: number; teamB: number };
  };
  narrative: string;
}

interface PreviewData {
  week: number;
  season: string;
  overview: string;
  afc: PreviewMatchup[];
  nfc: PreviewMatchup[];
  leagueOdds: {
    highestScorer: Array<{ team: string; leagueId: string; probability: number; odds: string }>;
    lowestScorer: Array<{ team: string; leagueId: string; probability: number; odds: string }>;
    closestMatchup: Array<{ teams: string[]; leagueId: string; probability: number; odds: string }>;
    biggestBlowout: Array<{ teams: string[]; leagueId: string; probability: number; odds: string }>;
    highestScoringMatchup: Array<{
      teams: string[];
      leagueId: string;
      probability: number;
      odds: string;
    }>;
    lowestScoringMatchup: Array<{
      teams: string[];
      leagueId: string;
      probability: number;
      odds: string;
    }>;
  };
  generatedAt: string;
}

// Sleeper API functions
async function fetchSleeperData(url: string): Promise<any> {
  const response = await fetch(`https://api.sleeper.app/v1${url}`);
  if (!response.ok) {
    throw new Error(`Sleeper API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function getMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
  return fetchSleeperData(`/league/${leagueId}/matchups/${week}`);
}

async function getRosters(leagueId: string): Promise<SleeperRoster[]> {
  return fetchSleeperData(`/league/${leagueId}/rosters`);
}

async function getUsers(leagueId: string): Promise<SleeperUser[]> {
  return fetchSleeperData(`/league/${leagueId}/users`);
}

async function getPlayers(): Promise<{ [key: string]: SleeperPlayer }> {
  return fetchSleeperData('/players/nfl');
}

async function getRawProjections(week: number, season: string = '2025'): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.sleeper.com/projections/nfl/${season}/${week}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF&order_by=pts_half_ppr`,
      {
        headers: { 'User-Agent': 'Gauntlet-Preview-Generator/1.0.0' },
      }
    );

    if (!response.ok) {
      throw new Error(`Sleeper projections API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Convert object format to array format for calculateLeagueProjections
    // The Sleeper API returns data with stats nested under a 'stats' property,
    // but calculateLeagueProjections expects stats at the top level
    const processProjection = (proj: any, playerId?: string) => {
      if (!proj || typeof proj !== 'object') return { player_id: playerId };

      // If stats are nested, flatten them
      if (proj.stats && typeof proj.stats === 'object') {
        return {
          player_id: playerId || proj.player_id,
          ...proj.stats, // Flatten stats to top level
          // Keep other metadata
          category: proj.category,
          week: proj.week,
          season: proj.season,
        };
      }

      // If stats are already at top level
      return {
        player_id: playerId || proj.player_id,
        ...proj,
      };
    };

    return Array.isArray(data)
      ? data.map(proj => processProjection(proj))
      : Object.entries(data).map(([playerId, projection]) =>
          processProjection(projection, playerId)
        );
  } catch (error) {
    console.warn('Could not fetch raw projections, using fallback:', error);
    return [];
  }
}

async function getLeague(leagueId: string): Promise<any> {
  return fetchSleeperData(`/league/${leagueId}`);
}

// ESPN API function
async function getESPNScoreboard(): Promise<{ events: ESPNGame[] }> {
  const response = await fetch(
    'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'
  );
  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Time window utilities
function categorizeTimeWindow(gameDate: string): string {
  const date = new Date(gameDate);
  const dayOfWeek = date.getUTCDay();
  const hour = date.getUTCHours();

  // Monday Night Football: Monday evening games (typically 8:15 PM ET)
  // This could be shown as Monday evening UTC (20-23 hours) or Tuesday early morning UTC (0-3 hours)
  if (dayOfWeek === 1 && hour >= 20) return 'mondayNight'; // Monday evening UTC
  if (dayOfWeek === 2 && hour < 6) return 'mondayNight'; // Tuesday early morning UTC

  // Thursday Night Football: Thursday evening/Friday early morning
  if (dayOfWeek === 4 && hour >= 20) return 'thursdayNight'; // Thursday evening UTC
  if (dayOfWeek === 5 && hour < 6) return 'thursdayNight'; // Friday early morning UTC

  // Sunday Night Football: Sunday evening/Monday early morning
  if (dayOfWeek === 0 && hour >= 20) return 'sundayNight'; // Sunday evening UTC
  if (dayOfWeek === 1 && hour < 6) return 'sundayNight'; // Monday early morning UTC

  // Regular Sunday games (in UTC, Sunday games are typically 17:00-21:00 UTC = 1-5 PM ET)
  if (dayOfWeek === 0) {
    if (hour <= 20) return 'early'; // 1 PM ET games (17:00 UTC) and early afternoon
    return 'late'; // 4 PM ET games and later afternoon (before prime time)
  }

  // Saturday games during certain weeks
  if (dayOfWeek === 6) return 'late';

  return 'other';
}

function getPlayerTimeWindow(playerTeam: string, games: ESPNGame[]): string {
  // Week 4 specific time window assignments based on actual NFL schedule
  const week4TimeWindows: { [key: string]: string } = {
    // Thursday Night
    SEA: 'thursdayNight',
    ARI: 'thursdayNight',

    // Early Sunday (1 PM ET)
    BUF: 'early',
    NO: 'early',
    DET: 'early',
    CLE: 'early',
    NE: 'early',
    CAR: 'early',
    NYG: 'early',
    LAC: 'early',
    TB: 'early',
    PHI: 'early',
    HOU: 'early',
    TEN: 'early',
    ATL: 'early',
    WAS: 'early',
    WSH: 'early',

    // Sunday Morning (international/early)
    MIN: 'early',
    PIT: 'early',

    // Late Sunday (4 PM ET)
    JAX: 'late',
    JAC: 'late',
    SF: 'late',
    IND: 'late',
    LAR: 'late',
    BAL: 'late',
    KC: 'late',
    CHI: 'late',
    LV: 'late',
    LVR: 'late',

    // Sunday Night Football
    GB: 'sundayNight',
    DAL: 'sundayNight',

    // Monday Night Football
    NYJ: 'mondayNight',
    MIA: 'mondayNight',
    CIN: 'mondayNight',
    DEN: 'mondayNight',
  };

  // Handle team abbreviation differences between Sleeper and ESPN
  const normalizedTeam = playerTeam.toUpperCase();
  const timeWindow = week4TimeWindows[normalizedTeam];

  if (timeWindow) {
    return timeWindow;
  }

  // Fallback: try to find the game and use generic categorization
  const teamMappings: { [key: string]: string } = {
    WAS: 'WSH',
    JAC: 'JAX',
    LVR: 'LV',
  };

  const espnTeam = teamMappings[playerTeam] || playerTeam;
  const game = games.find(g =>
    g.competitions[0].competitors.some(
      c => c.team.abbreviation === playerTeam || c.team.abbreviation === espnTeam
    )
  );

  if (!game) {
    return 'BYE';
  }

  return categorizeTimeWindow(game.competitions[0].date);
}

// Betting odds calculation
function calculateBettingOdds(projA: number, projB: number): PreviewMatchup['bettingOdds'] {
  const spread = Math.round((projA - projB) * 2) / 2; // Round to nearest 0.5
  const favorite = spread > 0 ? 'teamA' : 'teamB';
  const absSpread = Math.abs(spread);

  // Convert spread to win probability (rough approximation)
  const favoriteWinProb = 0.5 + absSpread * 0.03;
  const underdogWinProb = 1 - favoriteWinProb;

  // Calculate moneylines
  const favoriteMoneyline =
    favoriteWinProb >= 0.5
      ? -Math.round((favoriteWinProb / (1 - favoriteWinProb)) * 100)
      : Math.round(((1 - favoriteWinProb) / favoriteWinProb) * 100);

  const underdogMoneyline =
    underdogWinProb >= 0.5
      ? -Math.round((underdogWinProb / (1 - underdogWinProb)) * 100)
      : Math.round(((1 - underdogWinProb) / underdogWinProb) * 100);

  const total = Math.round((projA + projB) * 2) / 2;

  return {
    favorite,
    spread: absSpread,
    moneylineA: favorite === 'teamA' ? favoriteMoneyline : underdogMoneyline,
    moneylineB: favorite === 'teamB' ? favoriteMoneyline : underdogMoneyline,
    total,
    over: '-110',
    under: '-110',
  };
}

// Position-based projection fallback
function getPositionProjection(position: string): number {
  const baselines: { [key: string]: number } = {
    QB: 18,
    RB: 12,
    WR: 10,
    TE: 8,
    K: 8,
    DEF: 8,
  };

  const variance = Math.random() * 6 - 3; // -3 to +3 variance
  return Math.max(0, (baselines[position] || 8) + variance);
}

// Analyze game flow based on time window distribution
function analyzeGameFlow(timeWindows: any, teamAName: string, teamBName: string): string {
  const windows = ['thursdayNight', 'early', 'late', 'sundayNight', 'mondayNight'];
  const teamADistribution = windows.map(w => timeWindows[w]?.teamA || 0);
  const teamBDistribution = windows.map(w => timeWindows[w]?.teamB || 0);

  // Find primary windows for each team
  const teamAPrimary = windows[teamADistribution.indexOf(Math.max(...teamADistribution))];
  const teamBPrimary = windows[teamBDistribution.indexOf(Math.max(...teamBDistribution))];

  const windowNames = {
    thursdayNight: 'Thursday night',
    early: 'early Sunday',
    late: 'late Sunday',
    sundayNight: 'Sunday night',
    mondayNight: 'Monday night',
  };

  if (teamAPrimary === teamBPrimary) {
    return `${windowNames[teamAPrimary as keyof typeof windowNames]} heavy for both teams could create early separation`;
  } else {
    return `${teamAName} loads ${windowNames[teamAPrimary as keyof typeof windowNames]}, ${teamBName} counters ${windowNames[teamBPrimary as keyof typeof windowNames]}`;
  }
}

// Create detailed matchup narrative
function createMatchupNarrative(
  teamA: any,
  teamB: any,
  bettingOdds: any,
  gameFlow: string,
  week: number
): string {
  const favoriteTeam = bettingOdds.favorite === 'teamA' ? teamA : teamB;
  const underdogTeam = bettingOdds.favorite === 'teamA' ? teamB : teamA;

  // Analyze team situations based on records
  const getTeamSituation = (record: string, projection: number) => {
    const [wins, losses] = record.split('-').map(Number);
    if (wins === 3) return 'undefeated powerhouse';
    if (wins === 0) return 'desperate winless squad';
    if (wins === 2 && losses === 1) return 'emerging contender';
    if (wins === 1 && losses === 2) return 'season on the brink';
    return 'middle-tier team';
  };

  const favoriteSpread = Math.abs(bettingOdds.spread);
  const totalPoints = bettingOdds.total;

  // Create situation descriptions
  const favSituation = getTeamSituation(favoriteTeam.record, favoriteTeam.projection);
  const underdogSituation = getTeamSituation(underdogTeam.record, underdogTeam.projection);

  // Build narrative components
  let narrative = '';

  // Opening setup
  if (favoriteSpread >= 10) {
    narrative += `Mismatch alert: ${favoriteTeam.name} (${favoriteTeam.record}) should cruise past ${underdogTeam.name} (${underdogTeam.record}) as a ${favoriteSpread}-point favorite. `;
  } else if (favoriteSpread <= 3) {
    narrative += `Pick 'em classic: ${favoriteTeam.name} (${favoriteTeam.record}) vs ${underdogTeam.name} (${underdogTeam.record}) with just a ${favoriteSpread}-point spread. `;
  } else {
    narrative += `${favoriteTeam.name} (${favoriteTeam.record}) favored by ${favoriteSpread} over ${underdogTeam.name} (${underdogTeam.record}), but this has upset potential. `;
  }

  // Total points analysis
  if (totalPoints >= 240) {
    narrative += `Expecting fireworks with a ${totalPoints} total—both offenses have ceiling to reach. `;
  } else if (totalPoints <= 200) {
    narrative += `Low-scoring affair projected (${totalPoints} total), likely decided by defense and field position. `;
  } else {
    narrative += `Standard ${totalPoints} total suggests balanced offensive output. `;
  }

  // Game flow
  narrative += `${gameFlow}. `;

  // Closing based on team situations
  if (favSituation.includes('undefeated') && underdogSituation.includes('winless')) {
    narrative += `Perfect season meets desperation—expect the winless team to play with nothing to lose.`;
  } else if (underdogSituation.includes('brink')) {
    narrative += `Season stakes couldn't be higher for the underdog—this is a must-win game.`;
  } else if (favoriteSpread <= 3) {
    narrative += `Variance will decide this coin flip—whoever gets the better breaks likely takes it.`;
  } else {
    narrative += `Favorite should control, but fantasy football rarely goes according to plan.`;
  }

  return narrative;
}

async function generatePreviewData(week: number, season: string = '2025'): Promise<PreviewData> {
  console.log(`🚀 Generating preview data for Week ${week}, ${season}...`);

  // Fetch all data in parallel
  const [espnData, playersData, rawProjections] = await Promise.all([
    getESPNScoreboard(),
    getPlayers(),
    getRawProjections(week, season),
  ]);

  console.log(
    `📊 Loaded ${Object.keys(playersData).length} players, ${espnData.events.length} games, and ${rawProjections.length} projections`
  );

  // Process both leagues
  const afcMatchups: PreviewMatchup[] = [];
  const nfcMatchups: PreviewMatchup[] = [];

  for (const league of GAUNTLET_LEAGUES) {
    console.log(`🏈 Processing ${league.name}...`);

    const [matchups, rosters, users, leagueInfo] = await Promise.all([
      getMatchups(league.id, week),
      getRosters(league.id),
      getUsers(league.id),
      getLeague(league.id),
    ]);

    // Calculate league-specific projections using proper scoring settings
    const scoringSettings: ScoringSettings = leagueInfo?.scoring_settings || {};
    const leagueProjections = calculateLeagueProjections(rawProjections, scoringSettings);
    console.log(
      `📈 Calculated ${Object.keys(leagueProjections).length} league-specific projections for ${league.name}`
    );

    // Create lookup maps
    const userMap = new Map(users.map(u => [u.user_id, u]));
    const rosterMap = new Map(rosters.map(r => [r.roster_id, r]));

    // Group matchups by matchup_id
    const matchupGroups = new Map<number, SleeperMatchup[]>();
    matchups.forEach(m => {
      if (!matchupGroups.has(m.matchup_id)) {
        matchupGroups.set(m.matchup_id, []);
      }
      matchupGroups.get(m.matchup_id)!.push(m);
    });

    // Process each matchup pair
    for (const [matchupId, matchupPair] of matchupGroups) {
      if (matchupPair.length !== 2) continue;

      const [teamA, teamB] = matchupPair;
      const rosterA = rosterMap.get(teamA.roster_id);
      const rosterB = rosterMap.get(teamB.roster_id);
      const userA = rosterA ? userMap.get(rosterA.owner_id) : null;
      const userB = rosterB ? userMap.get(rosterB.owner_id) : null;

      if (!rosterA || !rosterB || !userA || !userB) continue;

      // Build team data
      const buildTeam = (roster: SleeperRoster, user: SleeperUser, matchupData: SleeperMatchup) => {
        const teamName = roster.metadata?.team_name || user.display_name || user.username;
        const record = `${roster.settings.wins}-${roster.settings.losses}`;

        let projection = 0;
        const players = matchupData.starters
          .map((playerId, index) => {
            const player = playersData[playerId];
            if (!player) return null;

            // Use proper league-specific projection calculation
            const leagueProjection = leagueProjections[playerId];
            const playerProjection =
              leagueProjection?.points || getPositionProjection(player.position);
            projection += playerProjection;

            const timeWindow = getPlayerTimeWindow(player.team || '', espnData.events);

            return {
              name: player.full_name,
              position: player.position,
              team: player.team || 'FA',
              projection: playerProjection,
              timeWindow,
            };
          })
          .filter(Boolean) as any[];

        return { name: teamName, record, projection: Math.round(projection * 10) / 10, players };
      };

      const teamAData = buildTeam(rosterA, userA, teamA);
      const teamBData = buildTeam(rosterB, userB, teamB);

      // Calculate time windows - include all players including BYE/other
      const timeWindows: { [key: string]: { teamA: number; teamB: number } } = {
        thursdayNight: { teamA: 0, teamB: 0 },
        early: { teamA: 0, teamB: 0 },
        late: { teamA: 0, teamB: 0 },
        sundayNight: { teamA: 0, teamB: 0 },
        mondayNight: { teamA: 0, teamB: 0 },
        other: { teamA: 0, teamB: 0 }, // Include other/BYE players
      };

      teamAData.players.forEach(p => {
        if (timeWindows[p.timeWindow]) {
          timeWindows[p.timeWindow].teamA++;
        } else {
          timeWindows.other.teamA++; // Catch all for BYE/other
        }
      });

      teamBData.players.forEach(p => {
        if (timeWindows[p.timeWindow]) {
          timeWindows[p.timeWindow].teamB++;
        } else {
          timeWindows.other.teamB++; // Catch all for BYE/other
        }
      });

      // Generate detailed matchup narrative
      const bettingOdds = calculateBettingOdds(teamAData.projection, teamBData.projection);
      const favoriteTeam = bettingOdds.favorite === 'teamA' ? teamAData : teamBData;
      const underdogTeam = bettingOdds.favorite === 'teamA' ? teamBData : teamAData;

      // Analyze game flow based on time windows
      const gameFlow = analyzeGameFlow(timeWindows, teamAData.name, teamBData.name);

      // Create compelling narrative
      const narrative = createMatchupNarrative(teamAData, teamBData, bettingOdds, gameFlow, week);

      const previewMatchup: PreviewMatchup = {
        teamA: teamAData,
        teamB: teamBData,
        bettingOdds,
        timeWindows,
        narrative,
      };

      if (league.name.includes('AFC')) {
        afcMatchups.push(previewMatchup);
      } else {
        nfcMatchups.push(previewMatchup);
      }
    }
  }

  console.log(
    `✅ Generated ${afcMatchups.length} AFC matchups and ${nfcMatchups.length} NFC matchups`
  );

  // Use real league odds data from simulation results (based on user screenshots)
  const leagueOdds = {
    highestScorer: [
      { team: 'C&G^2', leagueId: 'NFC', probability: 0.119, odds: '+738' },
      { team: 'DJ Herbussy', leagueId: 'NFC', probability: 0.103, odds: '+869' },
      { team: 'Marginal Returns', leagueId: 'NFC', probability: 0.103, odds: '+869' },
      { team: 'Mach 10', leagueId: 'NFC', probability: 0.098, odds: '+917' },
      { team: 'Nacua Matata', leagueId: 'AFC', probability: 0.094, odds: '+965' },
      { team: 'Dont go Chasing Saquon', leagueId: 'NFC', probability: 0.072, odds: '+1297' },
    ],
    lowestScorer: [
      { team: 'cescott25', leagueId: 'NFC', probability: 0.132, odds: '+658' },
      { team: 'vchak', leagueId: 'AFC', probability: 0.12, odds: '+731' },
      { team: '2 Dolla Balla$', leagueId: 'AFC', probability: 0.117, odds: '+752' },
      { team: 'lukebowsh', leagueId: 'NFC', probability: 0.077, odds: '+1205' },
      { team: 'ziyanp22', leagueId: 'NFC', probability: 0.068, odds: '+1377' },
      { team: 'Saint Brown Does Mahomes', leagueId: 'NFC', probability: 0.063, odds: '+1487' },
    ],
    closestMatchup: [
      { teams: ['NielGetsCarried', 'achak7'], leagueId: 'AFC', probability: 0.099, odds: '+913' },
      {
        teams: ['Dr Patel Parikh MD MBA', 'scboom5'],
        leagueId: 'AFC',
        probability: 0.095,
        odds: '+954',
      },
      {
        teams: ['Saint Brown Does Mahomes', 'lukebowsh'],
        leagueId: 'NFC',
        probability: 0.094,
        odds: '+959',
      },
      {
        teams: ['RithikP', 'Jaxson Dart-Njigba'],
        leagueId: 'NFC',
        probability: 0.093,
        odds: '+973',
      },
      {
        teams: ['Dont go Chasing Saquon', 'Marginal Returns'],
        leagueId: 'NFC',
        probability: 0.092,
        odds: '+987',
      },
      {
        teams: ['The Golden Age', 'To Infinity and Bijan'],
        leagueId: 'AFC',
        probability: 0.092,
        odds: '+992',
      },
    ],
    biggestBlowout: [
      { teams: ['Nacua Matata', 'vchak'], leagueId: 'AFC', probability: 0.156, odds: '+541' },
      { teams: ['ziyanp22', 'C&G^2'], leagueId: 'NFC', probability: 0.14, odds: '+617' },
      {
        teams: ['2 Dolla Balla$', 'lol jerry jones'],
        leagueId: 'AFC',
        probability: 0.122,
        odds: '+720',
      },
      { teams: ['vayyala', 'cescott25'], leagueId: 'NFC', probability: 0.078, odds: '+1179' },
      { teams: ['Mach 10', 'DJ Herbussy'], leagueId: 'NFC', probability: 0.076, odds: '+1212' },
      {
        teams: ['Quonspiracy Theorists', 'benweinfeld'],
        leagueId: 'AFC',
        probability: 0.074,
        odds: '+1250',
      },
    ],
    highestScoringMatchup: [
      { teams: ['Mach 10', 'DJ Herbussy'], leagueId: 'NFC', probability: 0.267, odds: '+275' },
      {
        teams: ['Dont go Chasing Saquon', 'Marginal Returns'],
        leagueId: 'NFC',
        probability: 0.231,
        odds: '+333',
      },
      {
        teams: ['Dr Patel Parikh MD MBA', 'scboom5'],
        leagueId: 'AFC',
        probability: 0.086,
        odds: '+1061',
      },
      { teams: ['ziyanp22', 'C&G^2'], leagueId: 'NFC', probability: 0.078, odds: '+1182' },
      {
        teams: ['The Golden Age', 'To Infinity and Bijan'],
        leagueId: 'AFC',
        probability: 0.062,
        odds: '+1508',
      },
      {
        teams: ['Quonspiracy Theorists', 'benweinfeld'],
        leagueId: 'AFC',
        probability: 0.062,
        odds: '+1518',
      },
    ],
    lowestScoringMatchup: [
      {
        teams: ['Saint Brown Does Mahomes', 'lukebowsh'],
        leagueId: 'NFC',
        probability: 0.202,
        odds: '+396',
      },
      { teams: ['vayyala', 'cescott25'], leagueId: 'NFC', probability: 0.18, odds: '+456' },
      {
        teams: ['2 Dolla Balla$', 'lol jerry jones'],
        leagueId: 'AFC',
        probability: 0.112,
        odds: '+795',
      },
      { teams: ['Nacua Matata', 'vchak'], leagueId: 'AFC', probability: 0.084, odds: '+1093' },
      {
        teams: ['The Golden Age', 'To Infinity and Bijan'],
        leagueId: 'AFC',
        probability: 0.076,
        odds: '+1209',
      },
      {
        teams: ['Quonspiracy Theorists', 'benweinfeld'],
        leagueId: 'AFC',
        probability: 0.073,
        odds: '+1268',
      },
    ],
  };

  return {
    week,
    season,
    overview: `Week ${week} arrives with tiers crystallizing. Three undefeateds face their toughest tests yet, while 0-3 squads are staring down must-win scenarios. The sims see chaos brewing—expect shootouts, blowouts, and the kind of variance that makes or breaks seasons.`,
    afc: afcMatchups,
    nfc: nfcMatchups,
    leagueOdds,
    generatedAt: new Date().toISOString(),
  };
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: tsx generate-week-preview.ts <week> [season]');
    console.error('Example: tsx generate-week-preview.ts 4 2025');
    process.exit(1);
  }

  const week = parseInt(args[0]);
  const season = args[1] || '2025';

  if (!Number.isInteger(week) || week < 1 || week > 18) {
    console.error('Week must be between 1 and 18');
    process.exit(1);
  }

  try {
    const previewData = await generatePreviewData(week, season);

    // Write to file
    const outputPath = path.resolve(
      process.cwd(),
      `apps/web/src/data/preview-week${week}-${season}.json`
    );

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(previewData, null, 2));

    console.log(`✅ Preview data generated successfully!`);
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📊 ${previewData.afc.length + previewData.nfc.length} matchups processed`);
  } catch (error) {
    console.error('❌ Error generating preview data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
