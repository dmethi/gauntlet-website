'use client';

import { LeagueChart } from '@/components/league-chart';
import { useLeagueData } from '@/lib/hooks';
import ContentLoader from 'react-content-loader';

const LeagueOverviewLoader = () => (
  <ContentLoader
    speed={2}
    width={1200}
    height={800}
    viewBox='0 0 1200 800'
    backgroundColor='#f3f3f3'
    foregroundColor='#ecebeb'
  >
    {/* Title and Subtitle */}
    <rect x='16' y='32' rx='3' ry='3' width='300' height='36' />
    <rect x='16' y='72' rx='3' ry='3' width='150' height='20' />

    {/* Team Rankings Table */}
    <rect x='16' y='128' rx='3' ry='3' width='200' height='28' />
    <rect x='16' y='168' rx='8' ry='8' width='1168' height='400' />

    {/* League Scoring Trends Chart */}
    <rect x='16' y='600' rx='3' ry='3' width='250' height='28' />
    <rect x='16' y='640' rx='8' ry='8' width='1168' height='150' />
  </ContentLoader>
);

export default function LeagueOverview() {
  const { league, loading, teamStats, weeklyAverages } = useLeagueData();

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <LeagueOverviewLoader />
      </div>
    );
  }

  if (!league) {
    return (
      <div className='flex items-center justify-center h-[80vh]'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-card-foreground mb-2'>League Not Found</h2>
          <p className='text-muted-foreground'>No league data available for the 2023 season.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>{league.name}</h1>
        <p className='text-gray-600'>Season {league.season}</p>
      </div>

      <div className='mb-8'>
        <h2 className='mb-4 text-2xl font-bold'>Team Rankings</h2>
        <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
          <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
            <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
              <table className='min-w-full divide-y divide-gray-300'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                    >
                      Rank
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                    >
                      Team
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                    >
                      Record
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                    >
                      Points For
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                    >
                      Expected Wins
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                    >
                      Luck
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {teamStats.map((team, index) => (
                    <tr key={team.id}>
                      <td className='whitespace-nowrap px-6 py-4'>{index + 1}</td>
                      <td className='whitespace-nowrap px-6 py-4'>{team.name}</td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        {team.wins}-{team.losses}
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>{team.totalPoints.toFixed(2)}</td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        {team.expectedWins.toFixed(2)}
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>{team.luckRating.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-8'>
        <h2 className='mb-4 text-2xl font-bold'>League Scoring Trends</h2>
        <LeagueChart data={weeklyAverages} />
      </div>
    </div>
  );
}
