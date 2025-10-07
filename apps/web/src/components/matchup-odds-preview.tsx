'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Zap } from 'lucide-react';
import type { MatchupOddsData, MatchupOddsPreviewProps } from '@/features/matchups/types';
import { formatOdds } from '@/shared/utils/formatting';

export function MatchupOddsPreview({
  leagueId,
  week,
  matchupId,
  teamAName,
  teamBName,
  className = '',
}: MatchupOddsPreviewProps) {
  const [oddsData, setOddsData] = useState<MatchupOddsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOdds = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/matchups/${leagueId}/${week}/${matchupId}/simulate`);

        if (!response.ok) {
          if (response.status === 404) {
            // No stored simulation yet for this matchup/week; show unavailable without error
            setOddsData(null);
            return;
          }
          throw new Error(`Failed to fetch odds`);
        }

        const data = await response.json();

        if (!data.success) {
          // Gracefully handle absence of simulation data
          setOddsData(null);
          return;
        }

        setOddsData(data.simulation);
      } catch (err) {
        setError('Failed to load odds');
        console.error('Odds preview error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
  }, [leagueId, week, matchupId]);

  const getWinProbColor = (prob: number): string => {
    if (prob > 0.65) return 'text-green-600 dark:text-green-400';
    if (prob > 0.55) return 'text-yellow-600 dark:text-yellow-400';
    if (prob > 0.45) return 'text-yellow-500 dark:text-yellow-500';
    if (prob > 0.35) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-500 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          Loading odds...
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    );
  }

  if (error || !oddsData) {
    return (
      <div className={`text-xs text-muted-foreground ${className}`}>
        <div className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Odds unavailable
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header with simulation indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          Live Odds
        </div>
        <Badge variant="outline" className="text-xs px-1 py-0">
          10k sims
        </Badge>
      </div>

      {/* Win Probabilities */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-center">
          <div className="text-xs text-muted-foreground truncate">{teamAName}</div>
          <div className={`font-bold ${getWinProbColor(oddsData.team1WinPct)}`}>
            {(oddsData.team1WinPct * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {formatOdds(oddsData.impliedOdds.team1MoneyLine)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-muted-foreground truncate">{teamBName}</div>
          <div className={`font-bold ${getWinProbColor(oddsData.team2WinPct)}`}>
            {(oddsData.team2WinPct * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {formatOdds(oddsData.impliedOdds.team2MoneyLine)}
          </div>
        </div>
      </div>

      {/* Spread and Total */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <div>
          <span className="font-medium">Spread:</span>{' '}
          {Math.abs(oddsData.impliedOdds.spread) < 0.5
            ? 'PK'
            : `${oddsData.impliedOdds.spread > 0 ? teamAName : teamBName} ${Math.abs(oddsData.impliedOdds.spread)}`}
        </div>
        <div>
          <span className="font-medium">O/U:</span> {oddsData.impliedOdds.total}
        </div>
      </div>
    </div>
  );
}
