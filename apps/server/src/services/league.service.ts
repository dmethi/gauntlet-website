import prisma from '../lib/prisma';

export async function getLeagueOverview() {
  // First get the league ID
  const league = await prisma.league.findFirst({
    where: {
      season: '2023',
    },
  });

  if (!league) {
    return null;
  }

  // Then get all rosters with their related data
  const rosters = await prisma.roster.findMany({
    where: {
      leagueId: league.id,
    },
    include: {
      owner: true,
      weeklyMetrics: {
        orderBy: { week: 'asc' },
      },
      matchups: {
        orderBy: { week: 'asc' },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  return {
    ...league,
    rosters,
  };
}

export async function getTeams() {
  // First get the league ID
  console.log('[getTeams] Searching for league with season: 2023');
  const league = await prisma.league.findFirst({
    where: {
      season: '2023', // Updated to 2024 season
    },
  });
  console.log('[getTeams] League found:', league);

  if (!league) {
    console.log('[getTeams] No league found, returning empty array');
    return [];
  }

  // Then get all rosters with their owners
  console.log(`[getTeams] Fetching rosters for leagueId: ${league.id}`);
  const rosters = await prisma.roster.findMany({
    where: {
      leagueId: league.id,
    },
    include: {
      owner: true,
    },
    orderBy: {
      id: 'asc',
    },
  });
  console.log(`[getTeams] Found ${rosters.length} rosters`);

  const teams = rosters.map(roster => ({
    id: roster.id.toString(),
    name:
      (roster.owner?.metadata as any)?.team_name ||
      roster.owner?.displayName ||
      roster.owner?.username ||
      `Team ${roster.id}`,
    owner: roster.owner?.displayName || roster.owner?.username || 'Unknown',
  }));

  console.log('[getTeams] Transformed teams:', teams);
  return teams;
}
