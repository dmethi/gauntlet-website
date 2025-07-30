import { PrismaClient, Prisma } from '../generated/prisma';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SLEEPER_API_BASE = 'https://api.sleeper.app/v1';
const TEST_LEAGUE_ID = '1124853133466419200';
const CURRENT_SEASON = '2024'; // Update this each season

// Types for Sleeper API responses
interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  metadata: Prisma.JsonValue | null;
  is_bot: boolean;
}

interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  season_type: string;
  status: string;
  sport: string;
  total_rosters: number;
  settings: Record<string, any>;
  scoring_settings: Record<string, any>;
  roster_positions: string[];
  metadata: Record<string, any> | null;
  previous_league_id: string | null;
  draft_id: string | null;
}

interface SleeperRoster {
  roster_id: number;
  owner_id: string | null;
  league_id: string;
  players: string[];
  starters: string[];
  reserve: string[];
  metadata: Record<string, any> | null;
  settings: {
    wins: number;
    waiver_position: number;
    waiver_budget_used: number;
    total_moves: number;
    ties: number;
    losses: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
  };
}

interface SleeperMatchup {
  matchup_id: number;
  roster_id: number;
  players: string[];
  starters: string[];
  points: number;
  custom_points: number | null;
  players_points: Record<string, number>;
  starters_points: number[];
}

interface SleeperPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  team: string | null;
  position: string;
  depth_chart_order: number | null;
  status: string | null;
  injury_status: string | null;
  weight: string | null;
  height: string | null;
  number: number | null;
  age: number | null;
  years_exp: number | null;
  hashtag: string | null;
}

interface SleeperDraft {
  draft_id: string;
  type: string;
  status: string;
  season: string;
  settings: Record<string, any>;
  league_id: string;
  metadata: Record<string, any> | null;
  slot_to_roster_id: number[];
}

interface SleeperDraftPick {
  pick_no: number;
  round: number;
  roster_id: number;
  player_id: string;
  picked_by: string | null;
  metadata: Record<string, any> | null;
  is_keeper: boolean;
  draft_id: string;
}

interface SleeperTransaction {
  transaction_id: string;
  type: string;
  status: string;
  roster_ids: number[];
  adds: Record<string, string> | null;
  drops: Record<string, string> | null;
  draft_picks: Record<string, any> | null;
  waiver_budget: Record<string, any> | null;
  settings: Record<string, any> | null;
  leg: number;
  creator: string;
  created: number;
  consenter_ids: string[];
}

// Helper Functions
function toJsonValue<T>(value: T | null): Prisma.InputJsonValue | undefined {
  if (value === null) return undefined;
  if (typeof value === 'object') {
    return JSON.parse(JSON.stringify(value));
  }
  return value as Prisma.InputJsonValue;
}

// API Fetching Functions
async function fetchFromSleeper<T>(endpoint: string): Promise<T> {
  try {
    const response = await axios.get<T>(`${SLEEPER_API_BASE}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
}

// Data Ingestion Functions
async function ingestLeague(leagueId: string) {
  console.log('Fetching league data...');
  const league = await fetchFromSleeper<SleeperLeague>(`/league/${leagueId}`);

  return await prisma.league.upsert({
    where: { id: league.league_id },
    update: {
      name: league.name,
      season: league.season,
      seasonType: league.season_type,
      status: league.status,
      sport: league.sport,
      totalRosters: league.total_rosters,
      settings: league.settings,
      scoringSettings: league.scoring_settings,
      rosterPositions: league.roster_positions,
      metadata: nullToUndefined(league.metadata),
      previousLeagueId: league.previous_league_id,
      draftId: league.draft_id,
    },
    create: {
      id: league.league_id,
      name: league.name,
      season: league.season,
      seasonType: league.season_type,
      status: league.status,
      sport: league.sport,
      totalRosters: league.total_rosters,
      settings: league.settings,
      scoringSettings: league.scoring_settings,
      rosterPositions: league.roster_positions,
      metadata: nullToUndefined(league.metadata),
      previousLeagueId: league.previous_league_id,
      draftId: league.draft_id,
    },
  });
}

async function ingestUsers(leagueId: string) {
  console.log('Fetching users...');
  const users = await fetchFromSleeper<SleeperUser[]>(`/league/${leagueId}/users`);

  return await Promise.all(
    users.map(user =>
      prisma.user.upsert({
        where: { id: user.user_id },
        update: {
          username: user.username,
          displayName: user.display_name,
          avatar: user.avatar,
          metadata: user.metadata,
          isBot: user.is_bot || false,
        },
        create: {
          id: user.user_id,
          username: user.username,
          displayName: user.display_name,
          avatar: user.avatar,
          metadata: user.metadata,
          isBot: user.is_bot || false,
        },
      })
    )
  );
}

async function ingestRosters(leagueId: string) {
  console.log('Fetching rosters...');
  const rosters = await fetchFromSleeper<SleeperRoster[]>(`/league/${leagueId}/rosters`);

  return await Promise.all(
    rosters.map(roster =>
      prisma.roster.upsert({
        where: { id: roster.roster_id },
        update: {
          leagueId: roster.league_id,
          ownerId: roster.owner_id,
          players: roster.players,
          starters: roster.starters,
          reserve: roster.reserve || [],
          settings: roster.settings,
          metadata: roster.metadata,
        },
        create: {
          id: roster.roster_id,
          leagueId: roster.league_id,
          ownerId: roster.owner_id,
          players: roster.players,
          starters: roster.starters,
          reserve: roster.reserve || [],
          settings: roster.settings,
          metadata: roster.metadata,
        },
      })
    )
  );
}

async function ingestMatchups(leagueId: string, week: number) {
  console.log(`Fetching matchups for week ${week}...`);
  const matchups = await fetchFromSleeper<SleeperMatchup[]>(`/league/${leagueId}/matchups/${week}`);

  return await Promise.all(
    matchups.map(matchup =>
      prisma.matchup.upsert({
        where: {
          leagueId_week_rosterId: {
            leagueId,
            week,
            rosterId: matchup.roster_id,
          },
        },
        update: {
          matchupId: matchup.matchup_id,
          points: matchup.points,
          customPoints: matchup.custom_points,
          starters: matchup.starters,
          startersPoints: matchup.starters_points,
          players: matchup.players,
          playersPoints: matchup.players_points,
        },
        create: {
          id: `${leagueId}-${week}-${matchup.roster_id}`,
          leagueId,
          week,
          rosterId: matchup.roster_id,
          matchupId: matchup.matchup_id,
          points: matchup.points,
          customPoints: matchup.custom_points,
          starters: matchup.starters,
          startersPoints: matchup.starters_points,
          players: matchup.players,
          playersPoints: matchup.players_points,
        },
      })
    )
  );
}

async function ingestPlayers() {
  console.log('Fetching all players...');
  const players = await fetchFromSleeper<Record<string, SleeperPlayer>>('/players/nfl');

  return await Promise.all(
    Object.entries(players).map(([id, player]) =>
      prisma.player.upsert({
        where: { id },
        update: {
          hashtag: player.hashtag,
          firstName: player.first_name,
          lastName: player.last_name,
          fullName: player.full_name,
          team: player.team,
          position: player.position,
          depthChartOrder: player.depth_chart_order,
          status: player.status,
          injuryStatus: player.injury_status,
          weight: player.weight,
          height: player.height,
          number: player.number,
          age: player.age,
          yearsExp: player.years_exp,
        },
        create: {
          id,
          hashtag: player.hashtag,
          firstName: player.first_name,
          lastName: player.last_name,
          fullName: player.full_name,
          team: player.team,
          position: player.position,
          depthChartOrder: player.depth_chart_order,
          status: player.status,
          injuryStatus: player.injury_status,
          weight: player.weight,
          height: player.height,
          number: player.number,
          age: player.age,
          yearsExp: player.years_exp,
        },
      })
    )
  );
}

async function ingestDraft(draftId: string) {
  console.log(`Fetching draft ${draftId}...`);
  const draft = await fetchFromSleeper<SleeperDraft>(`/draft/${draftId}`);

  return await prisma.draft.upsert({
    where: { id: draft.draft_id },
    update: {
      leagueId: draft.league_id,
      status: draft.status,
      type: draft.type,
      season: draft.season,
      settings: draft.settings,
      metadata: draft.metadata,
      slotToRosterId: draft.slot_to_roster_id,
    },
    create: {
      id: draft.draft_id,
      leagueId: draft.league_id,
      status: draft.status,
      type: draft.type,
      season: draft.season,
      settings: draft.settings,
      metadata: draft.metadata,
      slotToRosterId: draft.slot_to_roster_id,
    },
  });
}

async function ingestDraftPicks(draftId: string) {
  console.log(`Fetching draft picks for ${draftId}...`);
  const picks = await fetchFromSleeper<SleeperDraftPick[]>(`/draft/${draftId}/picks`);

  return await Promise.all(
    picks.map(pick =>
      prisma.draftPick.upsert({
        where: {
          draftId_pickNo: {
            draftId: pick.draft_id,
            pickNo: pick.pick_no,
          },
        },
        update: {
          round: pick.round,
          rosterId: pick.roster_id,
          playerId: pick.player_id,
          pickedBy: pick.picked_by,
          metadata: pick.metadata,
          isKeeper: pick.is_keeper,
        },
        create: {
          id: `${pick.draft_id}-${pick.pick_no}`,
          draftId: pick.draft_id,
          pickNo: pick.pick_no,
          round: pick.round,
          rosterId: pick.roster_id,
          playerId: pick.player_id,
          pickedBy: pick.picked_by,
          metadata: pick.metadata,
          isKeeper: pick.is_keeper,
        },
      })
    )
  );
}

async function ingestTransactions(leagueId: string, week: number) {
  console.log(`Fetching transactions for week ${week}...`);
  const transactions = await fetchFromSleeper<SleeperTransaction[]>(
    `/league/${leagueId}/transactions/${week}`
  );

  return await Promise.all(
    transactions.map(tx =>
      prisma.transaction.upsert({
        where: { id: tx.transaction_id },
        update: {
          leagueId,
          type: tx.type,
          status: tx.status,
          creatorId: tx.creator,
          rosterIds: tx.roster_ids,
          adds: tx.adds,
          drops: tx.drops,
          draftPicks: tx.draft_picks,
          waiver: tx.waiver_budget,
          settings: tx.settings,
          leg: tx.leg,
          consenterIds: tx.consenter_ids,
        },
        create: {
          id: tx.transaction_id,
          leagueId,
          type: tx.type,
          status: tx.status,
          creatorId: tx.creator,
          rosterIds: tx.roster_ids,
          adds: tx.adds,
          drops: tx.drops,
          draftPicks: tx.draft_picks,
          waiver: tx.waiver_budget,
          settings: tx.settings,
          leg: tx.leg,
          consenterIds: tx.consenter_ids,
        },
      })
    )
  );
}

async function main() {
  try {
    console.log('Starting Sleeper data ingestion...');
    console.log('WARNING: This is test data and should not be used in production!');

    // Ingest league data
    const league = await ingestLeague(TEST_LEAGUE_ID);
    console.log('League data ingested.');

    // Ingest users
    await ingestUsers(TEST_LEAGUE_ID);
    console.log('Users ingested.');

    // Ingest rosters
    await ingestRosters(TEST_LEAGUE_ID);
    console.log('Rosters ingested.');

    // Ingest players (this is a large dataset)
    await ingestPlayers();
    console.log('Players ingested.');

    // Ingest matchups for weeks 1-18
    for (let week = 1; week <= 18; week++) {
      await ingestMatchups(TEST_LEAGUE_ID, week);
      console.log(`Week ${week} matchups ingested.`);
    }

    // Ingest draft data if available
    if (league.draftId) {
      await ingestDraft(league.draftId);
      await ingestDraftPicks(league.draftId);
      console.log('Draft data ingested.');
    }

    // Ingest transactions for weeks 1-18
    for (let week = 1; week <= 18; week++) {
      await ingestTransactions(TEST_LEAGUE_ID, week);
      console.log(`Week ${week} transactions ingested.`);
    }

    console.log('Data ingestion completed successfully!');
  } catch (error) {
    console.error('Error during data ingestion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the ingestion
main().catch(console.error);
