'use client';

import { TeamExpectedPerformanceChart, TeamPerformanceChart } from '@/components/team-charts';
import { useTeamData } from '@/lib/hooks';
import ContentLoader from 'react-content-loader';
import { type Matchup, type WeeklyMetrics } from '../../../generated/prisma';

const TeamPageLoader = () => (
  <ContentLoader
    speed={2}
    width={1200}
    height={1000}
    viewBox='0 0 1200 1000'
    backgroundColor='#f3f3f3'
    foregroundColor='#ecebeb'
  >
    {/* Title and Subtitle */}
    <rect x='16' y='32' rx='3' ry='3' width='400' height='36' />
    <rect x='16' y='72' rx='3' ry='3' width='200' height='20' />

    {/* Stat Cards */}
    <rect x='16' y='128' rx='8' ry='8' width='280' height='100' />
    <rect x='312' y='128' rx='8' ry='8' width='280' height='100' />
    <rect x='608' y='128' rx='8' ry='8' width='280' height='100' />
    <rect x='904' y='128' rx='8' ry='8' width='280' height='100' />

    {/* Weekly Performance Chart */}
    <rect x='16' y='260' rx='3' ry='3' width='300' height='28' />
    <rect x='16' y='300' rx='8' ry='8' width='1168' height='200' />

    {/* Expected vs Actual Chart */}
    <rect x='16' y='540' rx='3' ry='3' width='400' height='28' />
    <rect x='16' y='580' rx='8' ry='8' width='1168' height='200' />

    {/* Matchups Table */}
    <rect x='16' y='820' rx='3' ry='3' width='250' height='28' />
    <rect x='16' y='860' rx='8' ry='8' width='1168' height='120' />
  </ContentLoader>
);

export default function TeamPage({ params }: { params: { id: string } }) {
  const { team, loading } = useTeamData(params.id);

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <TeamPageLoader />
      </div>
    );
  }

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
        <h1 className='text-3xl font-bold'>{team.owner?.username}&apos;s Team</h1>
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
