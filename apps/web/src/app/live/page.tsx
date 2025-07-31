'use client';

import { useQuery } from '@tanstack/react-query';

// const LEAGUE_ID = '1049321550490456064'; // Replace with your actual league ID

interface LiveScores {
  lastUpdated: string;
  matchups: {
    matchup_id: number;
    roster_id: number;
    totalLivePoints: number;
    livePoints: Record<string, number>;
  }[];
}

interface WinProbabilities {
  winProbabilities: {
    roster_id: number;
    projectedTotal: number;
    winProbability: number;
  }[];
}

interface LiveData {
  liveScores: LiveScores | null;
  winProbs: WinProbabilities | null;
  currentWeek: number;
}

function getCurrentWeek(): number {
  const seasonStart = new Date('2024-09-05');
  const now = new Date();
  const diffTime = now.getTime() - seasonStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(Math.ceil(diffDays / 7), 1), 18);
}

const getLiveData = async (): Promise<LiveData> => {
  // This is a placeholder for a real API call
  // In a real app, you would fetch this data from your server
  const currentWeek = getCurrentWeek();
  return { liveScores: null, winProbs: null, currentWeek };
};

export default function LivePage() {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<LiveData, Error>({
    queryKey: ['liveData'],
    queryFn: getLiveData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>Loading live data...</div>
      </div>
    );
  }

  if (error || !data || !data.liveScores?.matchups) {
    const currentWeek = data?.currentWeek || getCurrentWeek();
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold mb-6'>Live Scores - Week {currentWeek}</h1>
        <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded'>
          No live data available. Games may not be active or data has not been updated yet.
        </div>
      </div>
    );
  }

  const { liveScores, winProbs, currentWeek } = data;

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>Live Scores - Week {currentWeek}</h1>

      <div className='mb-4 text-sm text-gray-600'>
        Last updated: {new Date(liveScores.lastUpdated).toLocaleString()}
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {liveScores.matchups.map(matchup => {
          const winProb = winProbs?.winProbabilities?.find(
            wp => wp.roster_id === matchup.roster_id
          );

          return (
            <div key={matchup.roster_id} className='border rounded-lg p-6 bg-white shadow-lg'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold'>Matchup {matchup.matchup_id}</h3>
                <div className='text-sm text-gray-500'>Roster {matchup.roster_id}</div>
              </div>

              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span>Current Score:</span>
                  <span className='font-bold text-2xl'>
                    {matchup.totalLivePoints?.toFixed(1) || '0.0'}
                  </span>
                </div>

                {winProb && (
                  <>
                    <div className='flex justify-between'>
                      <span>Projected Total:</span>
                      <span className='font-semibold'>{winProb.projectedTotal}</span>
                    </div>

                    <div className='flex justify-between'>
                      <span>Win Probability:</span>
                      <span
                        className={`font-bold ${
                          winProb.winProbability > 0.6
                            ? 'text-green-600'
                            : winProb.winProbability > 0.4
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {(winProb.winProbability * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${winProb.winProbability * 100}%` }}
                      ></div>
                    </div>
                  </>
                )}
              </div>

              <div className='mt-4 pt-4 border-t'>
                <h4 className='font-medium mb-2'>Player Scores:</h4>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  {Object.entries(matchup.livePoints || {}).map(([playerId, points]) => (
                    <div key={playerId} className='flex justify-between'>
                      <span className='text-gray-600'>Player {playerId.slice(-4)}</span>
                      <span>{(points as number).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className='mt-8 text-center'>
        <button
          onClick={() => refetch()}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}
