import { PrismaClient } from '../../generated/prisma';
import { createLogger } from './logger';
import { createAPI } from './api';
import { DEFAULT_OPTIONS, TEST_LEAGUE_ID, toPrismaJson } from './config';
import type { IngestionContext, IngestionOptions } from './types';

const prisma = new PrismaClient();
const logger = createLogger();
const api = createAPI(logger);

async function ingestLeague(ctx: IngestionContext) {
  const { leagueId } = ctx.options;
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

async function ingestUsers(ctx: IngestionContext) {
  const { leagueId } = ctx.options;
  logger.info(`Ingesting users for league ${leagueId}`);

  const users = await api.getUsers(leagueId);
  await Promise.all(
    users.map(user =>
      prisma.user.upsert({
        where: { id: user.user_id },
        update: {
          username: user.username || user.display_name.toLowerCase(),
          displayName: user.display_name,
          avatar: user.avatar,
          metadata: toPrismaJson(user.metadata),
          isBot: user.is_bot || false,
        },
        create: {
          id: user.user_id,
          username: user.username || user.display_name.toLowerCase(),
          displayName: user.display_name,
          avatar: user.avatar,
          metadata: toPrismaJson(user.metadata),
          isBot: user.is_bot || false,
        },
      })
    )
  );
}

async function ingestRosters(ctx: IngestionContext) {
  const { leagueId } = ctx.options;
  logger.info(`Ingesting rosters for league ${leagueId}`);

  const rosters = await api.getRosters(leagueId);
  await Promise.all(
    rosters.map(async roster => {
      const baseData = {
        leagueId: roster.league_id,
        ownerId: roster.owner_id,
        players: roster.players || [],
        starters: roster.starters || [],
        reserve: roster.reserve || [],
        settings: toPrismaJson(roster.settings) || {},
        metadata: toPrismaJson(roster.metadata),
      };

      return prisma.roster.upsert({
        where: { id: roster.roster_id },
        update: baseData,
        create: {
          id: roster.roster_id,
          ...baseData,
        },
      });
    })
  );
}

async function ingestMatchups(ctx: IngestionContext, week: number) {
  const { leagueId } = ctx.options;
  logger.info(`Ingesting matchups for league ${leagueId} week ${week}`);

  const matchups = await api.getMatchups(leagueId, week);
  if (!matchups || matchups.length === 0) {
    logger.info(`No matchups found for week ${week}`);
    return;
  }

  await prisma.matchup.createMany({
    data: matchups.map(matchup => ({
      id: `${leagueId}-${week}-${matchup.roster_id}`,
      leagueId,
      week,
      rosterId: matchup.roster_id,
      matchupId: matchup.matchup_id,
      points: matchup.points,
      customPoints: matchup.custom_points,
      starters: matchup.starters || [],
      startersPoints: toPrismaJson(matchup.starters_points) || [],
      players: matchup.players || [],
      playersPoints: toPrismaJson(matchup.players_points) || {},
    })),
    skipDuplicates: true,
  });
}

async function ingestPlayers(ctx: IngestionContext) {
  logger.info('Ingesting all NFL players');

  const players = await api.getAllPlayers();
  await Promise.all(
    Object.entries(players).map(([id, player]) => {
      // Handle team defenses
      if (id.length === 3) {
        // Team abbreviations are 3 characters
        const teamName = {
          ARI: 'Arizona Cardinals',
          ATL: 'Atlanta Falcons',
          BAL: 'Baltimore Ravens',
          BUF: 'Buffalo Bills',
          CAR: 'Carolina Panthers',
          CHI: 'Chicago Bears',
          CIN: 'Cincinnati Bengals',
          CLE: 'Cleveland Browns',
          DAL: 'Dallas Cowboys',
          DEN: 'Denver Broncos',
          DET: 'Detroit Lions',
          GB: 'Green Bay Packers',
          HOU: 'Houston Texans',
          IND: 'Indianapolis Colts',
          JAX: 'Jacksonville Jaguars',
          KC: 'Kansas City Chiefs',
          LV: 'Las Vegas Raiders',
          LAC: 'Los Angeles Chargers',
          LAR: 'Los Angeles Rams',
          MIA: 'Miami Dolphins',
          MIN: 'Minnesota Vikings',
          NE: 'New England Patriots',
          NO: 'New Orleans Saints',
          NYG: 'New York Giants',
          NYJ: 'New York Jets',
          PHI: 'Philadelphia Eagles',
          PIT: 'Pittsburgh Steelers',
          SF: 'San Francisco 49ers',
          SEA: 'Seattle Seahawks',
          TB: 'Tampa Bay Buccaneers',
          TEN: 'Tennessee Titans',
          WAS: 'Washington Commanders',
        }[id];

        if (teamName) {
          const [firstName, ...rest] = teamName.split(' ');
          return prisma.player.upsert({
            where: { id },
            update: {
              firstName,
              lastName: rest.join(' '),
              fullName: teamName,
              team: id,
              position: 'DEF',
              status: 'Active',
              hashtag: `#${teamName.replace(/\s+/g, '')}-NFL-${id}`,
            },
            create: {
              id,
              firstName,
              lastName: rest.join(' '),
              fullName: teamName,
              team: id,
              position: 'DEF',
              status: 'Active',
              hashtag: `#${teamName.replace(/\s+/g, '')}-NFL-${id}`,
            },
          });
        }
        return Promise.resolve();
      }

      // Skip players without required fields
      if (!player.first_name || !player.last_name || !player.position) {
        logger.warn(`Skipping player ${id} due to missing required fields`);
        return Promise.resolve();
      }

      const playerData = {
        hashtag: player.hashtag,
        firstName: player.first_name,
        lastName: player.last_name,
        fullName: player.full_name || `${player.first_name} ${player.last_name}`,
        team: player.team,
        position: player.position,
        depthChartOrder: player.depth_chart_order,
        status: player.status || 'Unknown',
        injuryStatus: player.injury_status,
        weight: player.weight,
        height: player.height,
        number: player.number,
        age: player.age,
        yearsExp: player.years_exp,
      };

      return prisma.player.upsert({
        where: { id },
        update: playerData,
        create: {
          id,
          ...playerData,
        },
      });
    })
  );
}

async function ingestDraft(ctx: IngestionContext, draftId: string) {
  logger.info(`Ingesting draft ${draftId}`);

  const draft = await api.getDraft(draftId);

  // Convert slot_to_roster_id object to array
  // If slot_to_roster_id is { 1: 5, 2: 3, 3: 1 }, it becomes [5, 3, 1]
  const slotToRosterId = draft.slot_to_roster_id
    ? Object.values(draft.slot_to_roster_id).map(id => Number(id))
    : [];

  await prisma.draft.upsert({
    where: { id: draft.draft_id },
    update: {
      leagueId: draft.league_id,
      status: draft.status,
      type: draft.type,
      season: draft.season,
      settings: toPrismaJson(draft.settings) || {},
      metadata: toPrismaJson(draft.metadata),
      slotToRosterId,
    },
    create: {
      id: draft.draft_id,
      leagueId: draft.league_id,
      status: draft.status,
      type: draft.type,
      season: draft.season,
      settings: toPrismaJson(draft.settings) || {},
      metadata: toPrismaJson(draft.metadata),
      slotToRosterId,
    },
  });

  const picks = await api.getDraftPicks(draftId);
  await prisma.draftPick.createMany({
    data: picks.map(pick => ({
      id: `${pick.draft_id}-${pick.pick_no}`,
      draftId: pick.draft_id,
      pickNo: pick.pick_no,
      round: pick.round,
      rosterId: pick.roster_id,
      playerId: pick.player_id,
      pickedBy: pick.picked_by,
      metadata: toPrismaJson(pick.metadata),
      isKeeper: pick.is_keeper || false,
    })),
    skipDuplicates: true,
  });
}

async function ingestTransactions(ctx: IngestionContext, week: number) {
  const { leagueId } = ctx.options;
  logger.info(`Ingesting transactions for league ${leagueId} week ${week}`);

  const transactions = await api.getTransactions(leagueId, week);
  if (!transactions || transactions.length === 0) {
    logger.info(`No transactions found for week ${week}`);
    return;
  }

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
}

async function ingestAll(options: Partial<IngestionOptions> = {}) {
  const ctx: IngestionContext = {
    stats: {
      startTime: new Date(),
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
    },
    options: {
      ...DEFAULT_OPTIONS,
      ...options,
      leagueId: options.leagueId || TEST_LEAGUE_ID,
      season: options.season || '2024',
      weeks: options.weeks || Array.from({ length: 18 }, (_, i) => i + 1),
    },
    logger,
  };

  try {
    logger.info('Starting data ingestion...');
    logger.warn('WARNING: This is test data and should not be used in production!');

    // Ingest league data
    const league = await ingestLeague(ctx);
    ctx.stats.successCount++;

    // Ingest users
    await ingestUsers(ctx);
    ctx.stats.successCount++;

    // Ingest rosters
    await ingestRosters(ctx);
    ctx.stats.successCount++;

    // Ingest players
    await ingestPlayers(ctx);
    ctx.stats.successCount++;

    // Ingest matchups for all weeks
    for (const week of ctx.options.weeks || []) {
      await ingestMatchups(ctx, week);
      ctx.stats.successCount++;
    }

    // Ingest draft data if available
    if (league.draft_id) {
      await ingestDraft(ctx, league.draft_id);
      ctx.stats.successCount++;
    }

    // Ingest transactions for all weeks
    for (const week of ctx.options.weeks || []) {
      await ingestTransactions(ctx, week);
      ctx.stats.successCount++;
    }

    ctx.stats.endTime = new Date();
    logger.info('Data ingestion completed successfully!', {
      duration: ctx.stats.endTime.getTime() - ctx.stats.startTime.getTime(),
      successCount: ctx.stats.successCount,
      errorCount: ctx.stats.errorCount,
    });
  } catch (error) {
    ctx.stats.errorCount++;
    ctx.stats.errors.push(error as Error);
    logger.error('Error during data ingestion', error as Error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  return ctx.stats;
}

// Run the ingestion if called directly
if (require.main === module) {
  ingestAll().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { ingestAll };
