'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentWeek, getCurrentWeekSync } from '@gauntlet/lib';
import { PageHeaderHero, WarRoomLoader } from '@gauntlet/ui';
import { Card, CardContent } from '@/components/ui/card';
import { GauntletLogo } from '@/components/gauntlet-logo';

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

// use shared getCurrentWeek from @gauntlet/lib

const getLiveData = async (): Promise<LiveData> => {
  // This is a placeholder for a real API call
  // In a real app, you would fetch this data from your server
  const currentWeek = await getCurrentWeek();
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
    return <WarRoomLoader show logo={<GauntletLogo size="lg" />} />;
  }

  if (error || !data || !data.liveScores?.matchups) {
    const currentWeek = data?.currentWeek || getCurrentWeekSync();
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeaderHero
          title="Live Scores"
          subtitle={`Week ${currentWeek}`}
          crestSrc="/gauntlet_logo.svg"
        />
        <div className="px-6 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No live data available. Games may not be active or data has not been updated yet.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { liveScores, winProbs, currentWeek } = data;

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeaderHero
        title="Live Scores"
        subtitle={`Week ${currentWeek}`}
        crestSrc="/gauntlet_logo.svg"
      />

      <div className="px-6 py-8 space-y-6">
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(liveScores.lastUpdated).toLocaleString()}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {liveScores.matchups.map(matchup => {
            const winProb = winProbs?.winProbabilities?.find(
              wp => wp.roster_id === matchup.roster_id,
            );

            return (
              <Card key={matchup.roster_id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Matchup {matchup.matchup_id}</h3>
                    <div className="text-sm text-muted-foreground">Roster {matchup.roster_id}</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Current Score:</span>
                      <span className="font-geizer text-2xl tabular-nums">
                        {matchup.totalLivePoints?.toFixed(1) || '0.0'}
                      </span>
                    </div>

                    {winProb && (
                      <>
                        <div className="flex justify-between">
                          <span>Projected Total:</span>
                          <span className="font-semibold">{winProb.projectedTotal}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Win Probability:</span>
                          <span
                            className={`font-bold ${
                              winProb.winProbability > 0.6
                                ? 'text-success'
                                : winProb.winProbability > 0.4
                                  ? 'text-secondary'
                                  : 'text-destructive'
                            }`}
                          >
                            {(winProb.winProbability * 100).toFixed(1)}%
                          </span>
                        </div>

                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${winProb.winProbability * 100}%` }}
                          ></div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-medium mb-2">Player Scores:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(matchup.livePoints || {}).map(([playerId, points]) => (
                        <div key={playerId} className="flex justify-between">
                          <span className="text-muted-foreground">Player {playerId.slice(-4)}</span>
                          <span>{(points as number).toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={() => refetch()}
            className="bg-primary text-primary-foreground hover:opacity-90 font-bold py-2 px-4 rounded transition-opacity"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
