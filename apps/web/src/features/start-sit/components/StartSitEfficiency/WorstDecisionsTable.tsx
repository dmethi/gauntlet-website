import { memo, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DecisionDetail } from '@/features/start-sit/types';
import { getLeagueLabel, getPlayerDisplayName } from './utils';
import { ChevronDown } from 'lucide-react';

interface DecisionTableProps {
  decisions: DecisionDetail[];
  players: Record<string, any>;
}

export const WorstDecisionsTable = memo(({ decisions, players }: DecisionTableProps) => {
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [threshold, setThreshold] = useState<number>(5);

  const weeks = useMemo(() => {
    return Array.from(new Set(decisions.map(decision => decision.week))).sort((a, b) => a - b);
  }, [decisions]);

  const filtered = useMemo(() => {
    let current = decisions;
    if (selectedWeek !== 'all') {
      const week = Number(selectedWeek);
      current = current.filter(decision => decision.week === week);
    }
    return current.filter(decision => (decision.pointsLeft || 0) >= threshold);
  }, [decisions, selectedWeek, threshold]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Worst Decisions • {filtered.length} cases
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Select value={threshold.toString()} onValueChange={value => setThreshold(Number(value))}>
            <SelectTrigger className="h-11 w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All (≥0 pts)</SelectItem>
              <SelectItem value="3">≥3 points</SelectItem>
              <SelectItem value="5">≥5 points</SelectItem>
              <SelectItem value="10">≥10 points</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="h-11 w-full sm:w-32">
              <SelectValue placeholder="All Weeks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Weeks</SelectItem>
              {weeks.map(week => (
                <SelectItem key={week} value={week.toString()}>
                  Week {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="divide-y divide-border/70 border-y border-border/70 sm:space-y-3 sm:divide-y-0 sm:border-y-0">
        {filtered.map(decision => {
          const league = getLeagueLabel(decision.leagueId);
          const selectedName = getPlayerDisplayName(decision.selectedPlayer.playerId, players);
          const optimalName = decision.optimalPlayer?.playerId
            ? getPlayerDisplayName(decision.optimalPlayer.playerId, players)
            : '';

          return (
            <Card
              key={`${decision.managerId}-${decision.week}-${decision.position}-${decision.selectedPlayer.playerId}`}
              className="space-y-4 rounded-none border-0 bg-transparent py-4 shadow-none sm:rounded-xl sm:border sm:bg-card sm:p-4 sm:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-foreground">
                    {decision.managerName} ({league})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Week {decision.week} • {decision.position}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-destructive">
                    +{(decision.pointsLeft || 0).toFixed(1)} pts
                  </div>
                  <div className="text-xs text-muted-foreground">Points Left</div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="border-y border-destructive/30 bg-destructive/10 py-3 sm:rounded-lg sm:border sm:p-3">
                  <div className="font-medium text-foreground">
                    Started: {selectedName} ({decision.selectedPlayer.projectedPoints.toFixed(1)}{' '}
                    proj.)
                  </div>
                  <div className="text-sm">
                    Actual: {decision.selectedPlayer.actualPoints.toFixed(1)} pts
                  </div>
                </div>
                <div className="border-y border-success/30 bg-success/10 py-3 sm:rounded-lg sm:border sm:p-3">
                  <div className="font-medium text-foreground">
                    Optimal: {optimalName}{' '}
                    {decision.optimalPlayer?.source === 'waiver' ? '(waiver*)' : '(bench)'}
                  </div>
                  <div className="text-sm">
                    Actual:{' '}
                    {(
                      decision.optimalPlayer?.adjustedActualPoints ??
                      decision.optimalPlayer?.actualPoints ??
                      0
                    ).toFixed(1)}{' '}
                    pts
                  </div>
                </div>
              </div>

              {decision.alternatives?.length ? (
                <details className="group">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                    <span>Higher projected alternatives</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="divide-y divide-border/70 border-y border-border/70 text-xs text-muted-foreground">
                    {decision.alternatives.slice(0, 5).map(alt => {
                      const altName = getPlayerDisplayName(alt.playerId, players);
                      const projDiff =
                        alt.projectedPoints - decision.selectedPlayer.projectedPoints;
                      const actualDiff =
                        alt.adjustedActualPoints - decision.selectedPlayer.actualPoints;

                      return (
                        <div
                          key={alt.playerId}
                          className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2 sm:flex sm:items-center sm:justify-between sm:rounded sm:bg-card sm:px-2"
                        >
                          <div className="truncate">
                            {altName}{' '}
                            <span className="text-muted-foreground">
                              ({alt.source === 'waiver' ? 'waiver*' : 'bench'})
                            </span>
                          </div>
                          <div className="grid grid-cols-1 text-right sm:flex sm:items-center sm:gap-4">
                            <span className="font-medium text-secondary">
                              {alt.projectedPoints.toFixed(1)} ({projDiff >= 0 ? '+' : ''}
                              {projDiff.toFixed(1)})
                            </span>
                            <span className="font-medium text-foreground">
                              {alt.adjustedActualPoints.toFixed(1)}{' '}
                              {alt.source === 'waiver' && (
                                <span className="text-xs text-muted-foreground">
                                  ({alt.actualPoints.toFixed(1)})
                                </span>
                              )}
                            </span>
                            <span className="font-medium text-foreground">
                              +{actualDiff.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {decision.alternatives.some(alt => alt.source === 'waiver') && (
                    <div className="pt-2 text-xs text-muted-foreground">
                      * Adjusted with 35% waiver pickup penalty
                    </div>
                  )}
                </details>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
});

WorstDecisionsTable.displayName = 'WorstDecisionsTable';
