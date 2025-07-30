import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function inspectData() {
  try {
    // Check league data
    const league = await prisma.league.findFirst();
    console.log('\nLeague Data Sample:', {
      id: league?.id,
      name: league?.name,
      season: league?.season,
      totalRosters: league?.totalRosters,
      hasSettings: !!league?.settings,
      hasScoringSettings: !!league?.scoringSettings,
      rosterPositionsCount: league?.rosterPositions?.length,
    });

    // Check user data
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({ take: 1 });
    console.log('\nUser Stats:', {
      totalUsers: userCount,
      sampleUser: users[0]
        ? {
            id: users[0].id,
            username: users[0].username,
            hasMetadata: !!users[0].metadata,
          }
        : null,
    });

    // Check roster data
    const rosterCount = await prisma.roster.count();
    const rosters = await prisma.roster.findMany({ take: 1 });
    console.log('\nRoster Stats:', {
      totalRosters: rosterCount,
      sampleRoster: rosters[0]
        ? {
            id: rosters[0].id,
            leagueId: rosters[0].leagueId,
            ownerId: rosters[0].ownerId,
            playersCount: rosters[0].players?.length,
            startersCount: rosters[0].starters?.length,
            hasSettings: !!rosters[0].settings,
          }
        : null,
    });

    // Check matchup data
    const matchupCount = await prisma.matchup.count();
    const matchups = await prisma.matchup.findMany({ take: 1 });
    console.log('\nMatchup Stats:', {
      totalMatchups: matchupCount,
      sampleMatchup: matchups[0]
        ? {
            id: matchups[0].id,
            week: matchups[0].week,
            points: matchups[0].points,
            startersCount: matchups[0].starters?.length,
            playersCount: matchups[0].players?.length,
            hasStartersPoints: !!matchups[0].startersPoints,
            hasPlayersPoints: !!matchups[0].playersPoints,
            playersPoints: matchups[0].playersPoints,
          }
        : null,
    });

    // Check player data
    const playerCount = await prisma.player.count();
    const players = await prisma.player.findMany({ take: 1 });
    console.log('\nPlayer Stats:', {
      totalPlayers: playerCount,
      samplePlayer: players[0]
        ? {
            id: players[0].id,
            fullName: players[0].fullName,
            position: players[0].position,
            team: players[0].team,
          }
        : null,
    });

    // Check draft data
    const draftCount = await prisma.draft.count();
    const drafts = await prisma.draft.findMany({ take: 1 });
    console.log('\nDraft Stats:', {
      totalDrafts: draftCount,
      sampleDraft: drafts[0]
        ? {
            id: drafts[0].id,
            status: drafts[0].status,
            type: drafts[0].type,
            hasSettings: !!drafts[0].settings,
            slotToRosterIdCount: drafts[0].slotToRosterId?.length,
          }
        : null,
    });

    // Check transaction data
    const transactionCount = await prisma.transaction.count();
    const transactions = await prisma.transaction.findMany({ take: 1 });
    console.log('\nTransaction Stats:', {
      totalTransactions: transactionCount,
      sampleTransaction: transactions[0]
        ? {
            id: transactions[0].id,
            type: transactions[0].type,
            status: transactions[0].status,
            hasAdds: !!transactions[0].adds,
            hasDrops: !!transactions[0].drops,
          }
        : null,
    });
  } catch (error) {
    console.error('Error inspecting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectData().catch(console.error);
