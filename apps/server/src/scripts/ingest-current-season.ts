import 'dotenv/config';
import prisma from '../lib/prisma.js';
import { createLogger } from './data-ingestion/logger.js';
import { createAPI } from './data-ingestion/api.js';
import { toPrismaJson } from './data-ingestion/config.js';

const logger = createLogger();
const api = createAPI(logger);

// Current Gauntlet league IDs for 2025
const GAUNTLET_LEAGUES = [
  '1263740549504962561', // Gauntlet NFC
  '1263744209295245312', // Gauntlet AFC
];

const SEASON = '2025';

async function ingestLeague(leagueId: string) {
  logger.info(`Ingesting league data for ${leagueId}`);

  const league = await api.getLeague(leagueId);
  await prisma.league.upsert({
    where: { id: league.league_id },
    update: {
      name: league.name,
      season: league.season,
      seasonType: league.season_type,
      status: league.status,
      sport: league.sport,
      totalRosters: league.total_rosters,
      settings: toPrismaJson(league.settings) || {},
      scoringSettings: toPrismaJson(league.scoring_settings) || {},
      rosterPositions: league.roster_positions,
      metadata: toPrismaJson(league.metadata),
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
      settings: toPrismaJson(league.settings) || {},
      scoringSettings: toPrismaJson(league.scoring_settings) || {},
      rosterPositions: league.roster_positions,
      metadata: toPrismaJson(league.metadata),
      previousLeagueId: league.previous_league_id,
      draftId: league.draft_id,
    },
  });

  return league;
}

async function ingestUsers(leagueId: string) {
  logger.info(`Ingesting users for league ${leagueId}`);

  const users = await api.getUsers(leagueId);
  await Promise.all(
    users.map(user => {
      // Handle missing usernames - use display_name or user_id as fallback
      const username = user.username || user.display_name || user.user_id;

      return prisma.user.upsert({
        where: { id: user.user_id },
        update: {
          username,
          displayName: user.display_name,
          avatar: user.avatar,
          metadata: toPrismaJson(user.metadata),
        },
        create: {
          id: user.user_id,
          username,
          displayName: user.display_name,
          avatar: user.avatar,
          metadata: toPrismaJson(user.metadata),
        },
      });
    })
  );
}

function getRosterIdOffset(leagueId: string): number {
  // NFC league has roster ID offset of +2000 in database to avoid collision with AFC
  return leagueId === '1263740549504962561' ? 2000 : 0;
}

async function ingestRosters(leagueId: string) {
  logger.info(`Ingesting rosters for league ${leagueId}`);

  const rosters = await api.getRosters(leagueId);
  const offset = getRosterIdOffset(leagueId);
  const leagueName = leagueId === '1263740549504962561' ? 'NFC' : 'AFC';
  logger.info(`Found ${rosters.length} rosters for league ${leagueId} (${leagueName}), applying offset: +${offset}`);

  const results = await Promise.allSettled(
    rosters.map(async roster => {
      const dbRosterId = roster.roster_id + offset;
      logger.info(
        `Processing roster ${roster.roster_id} → DB ID ${dbRosterId}: owner=${roster.owner_id}, players=${roster.players?.length || 0}`
      );

      const baseData = {
        leagueId: roster.league_id,
        ownerId: roster.owner_id,
        players: roster.players || [],
        starters: roster.starters || [],
        reserve: roster.reserve || [],
        settings: toPrismaJson(roster.settings) || {},
        metadata: toPrismaJson(roster.metadata),
      };

      const result = await prisma.roster.upsert({
        where: { id: dbRosterId },
        update: baseData,
        create: {
          id: dbRosterId,
          ...baseData,
        },
      });

      logger.info(`✅ Saved roster ${dbRosterId} with ${baseData.players.length} players`);
      return result;
    })
  );

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    logger.error(`Failed to ingest ${failed.length} rosters:`);
    failed.forEach((result, index) => {
      if (result.status === 'rejected') {
        logger.error(`Roster ${index}: ${result.reason}`);
      }
    });
  }

  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  logger.info(
    `✅ Successfully ingested ${succeeded}/${rosters.length} rosters for league ${leagueId}`
  );
}

function safeCreateDate(unixTimestamp: number): Date {
  try {
    // Handle invalid/malformed timestamps
    if (!unixTimestamp || unixTimestamp <= 0 || unixTimestamp > 2147483647) {
      logger.warn(`Invalid timestamp: ${unixTimestamp}, using current date`);
      return new Date();
    }

    const date = new Date(unixTimestamp * 1000);

    // Check if date is reasonable (between 2020 and 2030)
    const year = date.getFullYear();
    if (year < 2020 || year > 2030) {
      logger.warn(`Invalid date year ${year} from timestamp ${unixTimestamp}, using current date`);
      return new Date();
    }

    return date;
  } catch (error) {
    logger.warn(`Error parsing timestamp ${unixTimestamp}: ${error}, using current date`);
    return new Date();
  }
}

async function ingestTransactions(leagueId: string, week: number) {
  logger.info(`Ingesting transactions for league ${leagueId} week ${week}`);

  try {
    const transactions = await api.getTransactions(leagueId, week);
    if (!transactions || transactions.length === 0) {
      logger.info(`No transactions found for week ${week}`);
      return;
    }

    logger.info(`Found ${transactions.length} transactions for week ${week}`);

    await Promise.all(
      transactions.map(tx => {
        const baseData = {
          type: tx.type,
          status: tx.status,
          creatorId: tx.creator,
          rosterIds: tx.roster_ids || [],
          adds: toPrismaJson(tx.adds),
          drops: toPrismaJson(tx.drops),
          draftPicks: toPrismaJson(tx.draft_picks),
          waiver: toPrismaJson(tx.waiver_budget),
          settings: toPrismaJson(tx.settings),
          leg: tx.leg,
          consenterIds: (tx.consenter_ids || []).map(String),
          transactionAt: safeCreateDate(tx.created),
        };

        return prisma.transaction.upsert({
          where: { id: tx.transaction_id },
          update: {
            leagueId,
            ...baseData,
          },
          create: {
            id: tx.transaction_id,
            leagueId,
            ...baseData,
          },
        });
      })
    );

    logger.info(`✅ Successfully ingested ${transactions.length} transactions for week ${week}`);
  } catch (error) {
    logger.error(`Error ingesting transactions for week ${week}:`, error);
  }
}

async function ingestDraft(leagueId: string, draftId: string) {
  logger.info(`Ingesting draft data for ${draftId}`);

  try {
    const draft = await api.getDraft(draftId);
    await prisma.draft.upsert({
      where: { id: draft.draft_id },
      update: {
        leagueId,
        status: draft.status,
        type: draft.type,
        season: draft.season,
        seasonType: draft.season_type,
        sport: draft.sport,
        settings: toPrismaJson(draft.settings) || {},
        metadata: toPrismaJson(draft.metadata),
        startTime: draft.start_time ? safeCreateDate(draft.start_time) : null,
      },
      create: {
        id: draft.draft_id,
        leagueId,
        status: draft.status,
        type: draft.type,
        season: draft.season,
        seasonType: draft.season_type,
        sport: draft.sport,
        settings: toPrismaJson(draft.settings) || {},
        metadata: toPrismaJson(draft.metadata),
        startTime: draft.start_time ? safeCreateDate(draft.start_time) : null,
      },
    });

    // Ingest draft picks
    const picks = await api.getDraftPicks(draftId);
    if (picks && picks.length > 0) {
      logger.info(`Found ${picks.length} draft picks`);

      await Promise.all(
        picks.map(pick =>
          prisma.draftPick.upsert({
            where: { id: `${pick.draft_id}_${pick.round}_${pick.draft_slot}` },
            update: {
              draftId: pick.draft_id,
              playerId: pick.player_id,
              pickNumber: pick.pick_no,
              round: pick.round,
              draftSlot: pick.draft_slot,
              rosterId: pick.roster_id,
              metadata: toPrismaJson(pick.metadata),
            },
            create: {
              id: `${pick.draft_id}_${pick.round}_${pick.draft_slot}`,
              draftId: pick.draft_id,
              playerId: pick.player_id,
              pickNumber: pick.pick_no,
              round: pick.round,
              draftSlot: pick.draft_slot,
              rosterId: pick.roster_id,
              metadata: toPrismaJson(pick.metadata),
            },
          })
        )
      );
    }
  } catch (error) {
    logger.warn(`Draft data not available: ${error}`);
  }
}

async function main() {
  try {
    logger.info('Starting current season data ingestion...');
    logger.info(`Leagues: ${GAUNTLET_LEAGUES.join(', ')}`);
    logger.info(`Season: ${SEASON}`);

    for (const leagueId of GAUNTLET_LEAGUES) {
      logger.info(`\n=== Processing League ${leagueId} ===`);

      // Ingest league data
      const league = await ingestLeague(leagueId);

      // Ingest users
      await ingestUsers(leagueId);

      // Ingest rosters (this should populate the players arrays)
      await ingestRosters(leagueId);

      // Ingest draft data if available
      if (league.draft_id) {
        await ingestDraft(leagueId, league.draft_id);
      }

      // Try to ingest transactions for the past few weeks (in case season started)
      // Week 0 often contains draft/preseason transactions
      for (let week = 0; week <= 3; week++) {
        await ingestTransactions(leagueId, week);
      }

      logger.info(`✅ Completed league ${leagueId}`);
    }

    logger.info('\n🎉 Current season data ingestion completed successfully!');
  } catch (error) {
    logger.error('Error during data ingestion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the ingestion
main().catch(console.error);
