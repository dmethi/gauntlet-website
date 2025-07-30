import { PrismaClient, type Matchup, type WeeklyMetrics } from '../../../generated/prisma';
import { TeamPerformanceChart, TeamExpectedPerformanceChart } from '@/components/team-charts';

const prisma = new PrismaClient();

async function getTeamData(teamId: string) {
  console.log('Fetching team data for ID:', teamId);

  // First get the league ID
  const league = await prisma.league.findFirst({
    where: {
      season: '2023', // We want the 2023 season league
    },
  });

  if (!league) {
    console.log('No league found');
    return null;
  }

  console.log('Found league:', league.id);

  // Then get the roster with all its data
  const roster = await prisma.roster.findUnique({
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

  console.log('Found roster:', JSON.stringify(roster, null, 2));
  return roster;
}

export default async function TeamPage({ params }: { params: { id: string } }) {
  console.log('Team page params:', params);
  const team = await getTeamData(params.id);

  if (!team) {
    console.log('Team not found');
    return <div>Team not found</div>;
  }

  console.log('Processing team data...');
  const weeklyData = team.weeklyMetrics.map((metric: WeeklyMetrics) => ({
    week: metric.week,
    points: metric.totalPoints,
    expectedWins: metric.expectedWins,
    luckRating: metric.luckRating,
    opponentPoints: metric.opponentPoints,
  }));

  console.log('Weekly data:', JSON.stringify(weeklyData, null, 2));

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
        <h1 className='text-3xl font-bold'>{team.owner?.username}'s Team</h1>
        <p className='text-gray-600'>League: {team.league.name}</p>
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
