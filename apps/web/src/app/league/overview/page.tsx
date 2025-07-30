import { PrismaClient } from '../../../generated/prisma';
import { LeagueChart } from '@/components/league-chart';

const prisma = new PrismaClient();

async function getLeagueData() {
  // First get the league ID
  const league = await prisma.league.findFirst({
    where: {
      season: '2023', // We want the 2023 season league
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

export default async function LeagueOverview() {
  const league = await getLeagueData();

  if (!league) {
    return <div>League not found</div>;
  }

  // Calculate team stats
  const teamStats = league.rosters
    .map(roster => {
      const matchupsByWeek = roster.matchups.reduce(
        (acc, matchup) => {
          acc[matchup.week] = matchup;
          return acc;
        },
        {} as Record<number, (typeof roster.matchups)[0]>
      );

      const totalPoints = roster.matchups.reduce((sum, matchup) => sum + matchup.points, 0);
      const totalExpectedWins = roster.weeklyMetrics.reduce(
        (sum, metric) => sum + metric.expectedWins,
        0
      );
      const totalLuckRating = roster.weeklyMetrics.reduce(
        (sum, metric) => sum + metric.luckRating,
        0
      );
      const averagePoints = totalPoints / roster.matchups.length || 0;

      const stats = {
        id: roster.id,
        name:
          (roster.owner?.metadata as any)?.team_name ||
          roster.owner?.displayName ||
          roster.owner?.username ||
          `Team ${roster.id}`,
        owner: roster.owner?.displayName || roster.owner?.username || 'Unknown',
        totalPoints,
        averagePoints,
        expectedWins: totalExpectedWins,
        luckRating: totalLuckRating,
      };
      return stats;
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // Calculate weekly league averages
  const weeklyAverages = Array.from({ length: 18 }, (_, week) => {
    const weekNumber = week + 1;
    const weekMatchups = league.rosters.flatMap(r => r.matchups.filter(m => m.week === weekNumber));

    const totalPoints = weekMatchups.reduce((sum, m) => sum + m.points, 0);
    const averagePoints = weekMatchups.length > 0 ? totalPoints / weekMatchups.length : 0;

    const weekData = {
      week: weekNumber,
      averagePoints,
      matchupCount: weekMatchups.length,
      totalPoints,
    };
    return weekData;
  });

  const filteredWeeklyAverages = weeklyAverages.filter(w => w.averagePoints > 0);

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>{league.name}</h1>
        <p className='text-gray-600'>Season {league.season}</p>
      </div>

      <div className='mb-8'>
        <h2 className='mb-4 text-2xl font-bold'>Team Rankings</h2>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Rank
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Team
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Total Points
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Avg Points
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Expected Wins
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Luck Rating
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {teamStats.map((team, index) => (
                <tr key={team.id}>
                  <td className='whitespace-nowrap px-6 py-4'>{index + 1}</td>
                  <td className='whitespace-nowrap px-6 py-4'>{team.name}</td>
                  <td className='whitespace-nowrap px-6 py-4'>{team.totalPoints.toFixed(2)}</td>
                  <td className='whitespace-nowrap px-6 py-4'>{team.averagePoints.toFixed(2)}</td>
                  <td className='whitespace-nowrap px-6 py-4'>{team.expectedWins.toFixed(1)}</td>
                  <td className='whitespace-nowrap px-6 py-4'>{team.luckRating.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className='mt-8'>
        <h2 className='mb-4 text-2xl font-bold'>League Scoring Trends</h2>
        <LeagueChart data={filteredWeeklyAverages} />
      </div>
    </div>
  );
}
