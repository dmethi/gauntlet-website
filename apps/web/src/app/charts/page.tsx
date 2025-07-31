'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const LEAGUE_ID = '1049321550490456064'; // Replace with your actual league ID

interface Score {
  timestamp: string;
  score: number;
}

interface WinProbability {
  timestamp: string;
  winProbability: number;
}

interface ChartDataPoint {
  matchup_id: number;
  roster_id: number;
  excitementScore: number;
  maxSwing: number;
  volatility: number;
  scores: Score[];
  winProbabilities: WinProbability[];
}

interface ApiResponse {
  success: boolean;
  chartData: ChartDataPoint[];
  lastUpdated: string;
  dataPoints: number;
  error?: string;
}

function getCurrentWeek(): number {
  const seasonStart = new Date('2024-09-05');
  const now = new Date();
  const diffTime = now.getTime() - seasonStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(Math.ceil(diffDays / 7), 1), 18);
}

const fetchChartData = async (leagueId: string, week: number): Promise<ApiResponse> => {
  const response = await fetch(`/api/charts/${leagueId}/${week}`);
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to load chart data');
  }
  return data;
};

export default function ChartsPage() {
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());

  const {
    data: chartData,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<ApiResponse, Error>({
    queryKey: ['chartData', LEAGUE_ID, selectedWeek],
    queryFn: () => fetchChartData(LEAGUE_ID, selectedWeek),
  });

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>Loading chart data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error.message}
        </div>
        <button
          onClick={() => refetch()}
          className='mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Retry
        </button>
      </div>
    );
  }

  if (!chartData?.chartData?.length) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold mb-6'>Fantasy Charts - Week {selectedWeek}</h1>
        <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded'>
          No chart data available for this week yet.
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Fantasy Charts - Week {selectedWeek}</h1>

        <div className='flex items-center gap-4'>
          <select
            value={selectedWeek}
            onChange={e => setSelectedWeek(parseInt(e.target.value))}
            className='border rounded px-3 py-2'
          >
            {Array.from({ length: 18 }, (_, i) => i + 1).map(week => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>

          <button
            onClick={() => refetch()}
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            Refresh
          </button>
        </div>
      </div>

      <div className='mb-6 text-sm text-gray-600'>
        Last updated:{' '}
        {chartData.lastUpdated ? new Date(chartData.lastUpdated).toLocaleString() : 'N/A'}
        <span className='ml-4'>Data points: {chartData.dataPoints}</span>
      </div>

      {/* Excitement Rankings */}
      <div className='mb-8'>
        <h2 className='text-2xl font-bold mb-4'>🔥 Most Exciting Matchups</h2>
        <div className='grid gap-4 md:grid-cols-3'>
          {chartData.chartData.slice(0, 3).map((matchup, index) => (
            <div
              key={`${matchup.matchup_id}-${matchup.roster_id}`}
              className={`border rounded-lg p-4 ${
                index === 0
                  ? 'bg-yellow-50 border-yellow-300'
                  : index === 1
                    ? 'bg-gray-50 border-gray-300'
                    : 'bg-orange-50 border-orange-300'
              }`}
            >
              <div className='flex justify-between items-center mb-2'>
                <h3 className='font-bold'>
                  {index === 0 && '🥇'} {index === 1 && '🥈'} {index === 2 && '🥉'}
                  Matchup {matchup.matchup_id}
                </h3>
                <div className='text-lg font-bold text-red-600'>{matchup.excitementScore}</div>
              </div>
              <div className='text-sm space-y-1'>
                <div>Max Swing: ±{(matchup.maxSwing * 100).toFixed(1)}%</div>
                <div>Volatility: {(matchup.volatility * 100).toFixed(1)}%</div>
                <div>
                  Current Score:{' '}
                  {matchup.scores[matchup.scores.length - 1]?.score.toFixed(1) || 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Matchup Charts */}
      <div className='space-y-8'>
        {chartData.chartData.map(matchup => (
          <div
            key={`${matchup.matchup_id}-${matchup.roster_id}`}
            className='border rounded-lg p-6 bg-white shadow-lg'
          >
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-xl font-bold'>
                Matchup {matchup.matchup_id} - Roster {matchup.roster_id}
              </h3>
              <div className='text-sm text-gray-600'>Excitement: {matchup.excitementScore}</div>
            </div>

            {/* Score Chart */}
            <div className='mb-6'>
              <h4 className='font-semibold mb-2'>Score Over Time</h4>
              <div className='h-32 bg-gray-50 rounded border relative overflow-hidden'>
                <ScoreChart scores={matchup.scores} />
              </div>
            </div>

            {/* Win Probability Chart */}
            {matchup.winProbabilities.length > 0 && (
              <div>
                <h4 className='font-semibold mb-2'>Win Probability Over Time</h4>
                <div className='h-32 bg-gray-50 rounded border relative overflow-hidden'>
                  <WinProbChart winProbs={matchup.winProbabilities} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreChart({ scores }: { scores: Score[] }) {
  if (!scores.length) return <div className='p-4 text-gray-500'>No score data</div>;

  const maxScore = Math.max(...scores.map(s => s.score));
  const minScore = Math.min(...scores.map(s => s.score));
  const range = maxScore - minScore || 1;

  return (
    <div className='flex items-end h-full p-2 gap-1'>
      {scores.map((score, index) => {
        const height = ((score.score - minScore) / range) * 100;
        const time = new Date(score.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={index} className='flex-1 flex flex-col items-center'>
            <div
              className='bg-blue-500 w-full min-h-[2px] rounded-t'
              style={{ height: `${Math.max(height, 5)}%` }}
              title={`${time}: ${score.score.toFixed(1)}`}
            />
            {index % 3 === 0 && (
              <div className='text-xs text-gray-600 mt-1 transform -rotate-45 origin-left'>
                {time}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function WinProbChart({ winProbs }: { winProbs: WinProbability[] }) {
  if (!winProbs.length) return <div className='p-4 text-gray-500'>No win probability data</div>;

  return (
    <div className='flex items-end h-full p-2 gap-1'>
      {winProbs.map((wp, index) => {
        const height = wp.winProbability * 100;
        const time = new Date(wp.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const color = height > 60 ? 'bg-green-500' : height > 40 ? 'bg-yellow-500' : 'bg-red-500';

        return (
          <div key={index} className='flex-1 flex flex-col items-center'>
            <div
              className={`${color} w-full min-h-[2px] rounded-t`}
              style={{ height: `${Math.max(height, 5)}%` }}
              title={`${time}: ${height.toFixed(1)}%`}
            />
            {index % 3 === 0 && (
              <div className='text-xs text-gray-600 mt-1 transform -rotate-45 origin-left'>
                {time}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
