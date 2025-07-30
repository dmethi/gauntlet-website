import { PrismaClient, type Matchup, type WeeklyMetrics } from '../../../../generated/prisma';
import { TeamPerformanceChart, TeamExpectedPerformanceChart } from '@/components/team-charts';

const prisma = new PrismaClient();

async function getTeamData(teamId: string) {
  // First get the league ID
  const league = await prisma.league.findFirst({
    where: {
      season: '2023', // We want the 2023 season league
    },
  });

  if (!league) {
    return null;
  }

  // Then get the roster with all its data
  const team = await prisma.roster.findUnique({
    where: {
      id: parseInt(teamId),
      leagueId: league.id,
    },
    include: {
      owner: true,
      league: true,
      weeklyMetrics: {
        orderBy: { week: 'asc' },
      },
      matchups: {
        orderBy: { week: 'asc' },
      },
    },
  });

  return team;
}

export default async function TeamStatsPage({ params }: { params: { id: string } }) {
  const team = await getTeamData(params.id);

  if (!team) {
    return <div>Team not found</div>;
  }

  const weeklyData = team.weeklyMetrics.map((metric: WeeklyMetrics) => ({
    week: metric.week,
    points: metric.totalPoints,
    expectedWins: metric.expectedWins,
    luckRating: metric.luckRating,
    opponentPoints: metric.opponentPoints,
  }));

  const totalPoints = team.matchups.reduce(
    (sum: number, matchup: Matchup) => sum + matchup.points,
    0
  );
  const averagePoints = totalPoints / team.matchups.length || 0;
  const totalExpectedWins = team.weeklyMetrics.reduce(
    (sum: number, metric: WeeklyMetrics) => sum + metric.expectedWins,
    0
  );
  const totalLuckRating = team.weeklyMetrics.reduce(
    (sum: number, metric: WeeklyMetrics) => sum + metric.luckRating,
    0
  );

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>
          {(team.owner?.metadata as any)?.team_name ||
            team.owner?.displayName ||
            team.owner?.username ||
            `Team ${team.id}`}
        </h1>
        <p className='text-gray-600'>
          League: {team.league.name} • Owner: {team.owner?.displayName || team.owner?.username}
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg bg-white p-6 shadow'>
          <h3 className='text-lg font-semibold'>Total Points</h3>
          <p className='text-3xl font-bold'>{totalPoints.toFixed(2)}</p>
          <p className='text-sm text-gray-600'>Avg: {averagePoints.toFixed(2)}</p>
        </div>
        <div className='rounded-lg bg-white p-6 shadow'>
          <h3 className='text-lg font-semibold'>Expected Wins</h3>
          <p className='text-3xl font-bold'>{totalExpectedWins.toFixed(1)}</p>
        </div>
        <div className='rounded-lg bg-white p-6 shadow'>
          <h3 className='text-lg font-semibold'>Luck Rating</h3>
          <p className='text-3xl font-bold'>{totalLuckRating.toFixed(2)}</p>
        </div>
      </div>

      <div className='mt-8'>
        <h2 className='mb-4 text-2xl font-bold'>Weekly Performance</h2>
        <TeamPerformanceChart weeklyData={weeklyData} />
      </div>

      <div className='mt-8'>
        <h2 className='mb-4 text-2xl font-bold'>Expected vs Actual Performance</h2>
        <TeamExpectedPerformanceChart weeklyData={weeklyData} />
      </div>

      <div className='mt-8'>
        <h2 className='mb-4 text-2xl font-bold'>Weekly Matchups</h2>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Week
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Points
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Opp. Points
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Result
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {team.matchups.map(matchup => {
                const weekData = weeklyData.find(w => w.week === matchup.week);
                return (
                  <tr key={matchup.week}>
                    <td className='whitespace-nowrap px-6 py-4'>Week {matchup.week}</td>
                    <td className='whitespace-nowrap px-6 py-4'>{matchup.points.toFixed(2)}</td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      {weekData?.opponentPoints.toFixed(2)}
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      {matchup.points > (weekData?.opponentPoints || 0) ? 'Win' : 'Loss'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
