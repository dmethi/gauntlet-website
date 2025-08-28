import 'dotenv/config';
import prisma from '../lib/prisma.js';

// The two real league IDs for The Gauntlet
const TARGET_LEAGUE_IDS = [
  '1263744209295245312', // Gauntlet AFC (already in DB)
  '1263740549504962561', // Gauntlet NFC (needs to be added)
];

// Old test league to clean up
const OLD_TEST_LEAGUE_ID = '997670420490801152';

async function fetchLeagueFromSleeper(leagueId: string) {
  const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch league ${leagueId}: ${response.statusText}`);
  }
  return await response.json();
}

async function fetchUsersFromSleeper(leagueId: string) {
  const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`);
  if (!response.ok) {
    throw new Error(`Failed to fetch users for league ${leagueId}: ${response.statusText}`);
  }
  return await response.json();
}

async function fetchRostersFromSleeper(leagueId: string) {
  const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
  if (!response.ok) {
    throw new Error(`Failed to fetch rosters for league ${leagueId}: ${response.statusText}`);
  }
  return await response.json();
}

async function cleanupOldTestData() {
  console.log('🧹 Cleaning up old test data...');

  const oldLeague = await prisma.league.findUnique({
    where: { id: OLD_TEST_LEAGUE_ID },
  });

  if (!oldLeague) {
    console.log('Old test league not found, skipping cleanup');
    return;
  }

  console.log(`Found old test league: ${oldLeague.name} (${oldLeague.season})`);

  // Delete in order to respect foreign key constraints
  await prisma.hallOfFameRecord.deleteMany({
    where: { leagueId: OLD_TEST_LEAGUE_ID },
  });

  await prisma.seasonSuperlatives.deleteMany({
    where: { leagueId: OLD_TEST_LEAGUE_ID },
  });

  await prisma.draftPick.deleteMany({
    where: {
      draft: {
        leagueId: OLD_TEST_LEAGUE_ID,
      },
    },
  });

  await prisma.draft.deleteMany({
    where: { leagueId: OLD_TEST_LEAGUE_ID },
  });

  await prisma.transaction.deleteMany({
    where: { leagueId: OLD_TEST_LEAGUE_ID },
  });

  await prisma.tradedPick.deleteMany({
    where: { leagueId: OLD_TEST_LEAGUE_ID },
  });

  await prisma.matchupSummary.deleteMany({
    where: { leagueId: OLD_TEST_LEAGUE_ID },
  });

  await prisma.rosterWeekAggregate.deleteMany({
    where: { leagueId: OLD_TEST_LEAGUE_ID },
  });

  await prisma.leagueWeekSummary.deleteMany({
    where: { leagueId: OLD_TEST_LEAGUE_ID },
  });

  await prisma.weeklyMetrics.deleteMany({
    where: { leagueId: OLD_TEST_LEAGUE_ID },
  });

  await prisma.matchup.deleteMany({
    where: { leagueId: OLD_TEST_LEAGUE_ID },
  });

  await prisma.roster.deleteMany({
    where: { leagueId: OLD_TEST_LEAGUE_ID },
  });

  // Remove league from the join table
  await prisma.$executeRaw`DELETE FROM "_LeagueOwners" WHERE "A" = ${OLD_TEST_LEAGUE_ID}`;

  await prisma.league.delete({
    where: { id: OLD_TEST_LEAGUE_ID },
  });

  console.log('✅ Old test data cleaned up');
}

async function addMissingLeague(leagueId: string) {
  console.log(`🔍 Checking if league ${leagueId} exists...`);

  const existingLeague = await prisma.league.findUnique({
    where: { id: leagueId },
  });

  if (existingLeague) {
    console.log(`League ${existingLeague.name} already exists, skipping`);
    return;
  }

  console.log(`📥 Fetching league ${leagueId} from Sleeper...`);

  // Fetch league data
  const leagueData = await fetchLeagueFromSleeper(leagueId);

  // Fetch users and rosters
  const users = await fetchUsersFromSleeper(leagueId);
  const rosters = await fetchRostersFromSleeper(leagueId);

  // Create league
  await prisma.league.create({
    data: {
      id: leagueData.league_id,
      name: leagueData.name,
      season: leagueData.season,
      seasonType: leagueData.season_type,
      status: leagueData.status,
      sport: leagueData.sport,
      totalRosters: leagueData.total_rosters,
      settings: leagueData.settings || {},
      scoringSettings: leagueData.scoring_settings || {},
      rosterPositions: leagueData.roster_positions,
      metadata: leagueData.metadata,
      previousLeagueId: leagueData.previous_league_id,
      draftId: leagueData.draft_id,
    },
  });

  // Create users
  for (const user of users) {
    const username = user.username || user.display_name || `user_${user.user_id.slice(-6)}`;
    await prisma.user.upsert({
      where: { id: user.user_id },
      update: {
        username,
        displayName: user.display_name,
        avatar: user.avatar,
        metadata: user.metadata,
        isBot: user.is_bot || false,
      },
      create: {
        id: user.user_id,
        username,
        displayName: user.display_name,
        avatar: user.avatar,
        metadata: user.metadata,
        isBot: user.is_bot || false,
      },
    });
  }

  // Create rosters
  for (const roster of rosters) {
    await prisma.roster.create({
      data: {
        id: roster.roster_id,
        leagueId: leagueId,
        ownerId: roster.owner_id,
        coOwners: roster.co_owners || [],
        players: roster.players || [],
        starters: roster.starters || [],
        reserve: roster.reserve || [],
        settings: roster.settings,
        metadata: roster.metadata,
        waiverBudget: roster.settings?.waiver_budget_used
          ? 100 - roster.settings.waiver_budget_used
          : 100,
        waiverPosition: roster.settings?.waiver_position,
      },
    });
  }

  // Connect users to league
  await prisma.league.update({
    where: { id: leagueId },
    data: {
      users: {
        connect: users.map((user: any) => ({ id: user.user_id })),
      },
    },
  });

  console.log(
    `✅ Added league: ${leagueData.name} with ${users.length} users and ${rosters.length} rosters`
  );
}

async function main() {
  try {
    console.log('🚀 Starting data migration to real Gauntlet leagues...');
    console.log('Target leagues:', TARGET_LEAGUE_IDS);

    // Step 1: Clean up old test data
    await cleanupOldTestData();

    // Step 2: Add missing leagues
    for (const leagueId of TARGET_LEAGUE_IDS) {
      await addMissingLeague(leagueId);
    }

    // Step 3: Verify final state
    const leagues = await prisma.league.findMany({
      select: { id: true, name: true, season: true, totalRosters: true },
      orderBy: { name: 'asc' },
    });

    console.log('\n🎉 Migration complete! Current leagues:');
    console.table(leagues);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
