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
        <div className="flex gap-2">
          <Select value={threshold.toString()} onValueChange={value => setThreshold(Number(value))}>
            <SelectTrigger className="w-32">
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
            <SelectTrigger className="w-32">
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

      <div className="space-y-3">
        {filtered.map(decision => {
          const league = getLeagueLabel(decision.leagueId);
          const selectedName = getPlayerDisplayName(decision.selectedPlayer.playerId, players);
          const optimalName = decision.optimalPlayer?.playerId
            ? getPlayerDisplayName(decision.optimalPlayer.playerId, players)
            : '';

          return (
            <Card
              key={`${decision.managerId}-${decision.week}-${decision.position}-${decision.selectedPlayer.playerId}`}
              className="space-y-4 p-4"
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
                <div className="rounded-lg bg-destructive/10 p-3">
                  <div className="font-medium text-destructive">
                    Started: {selectedName} ({decision.selectedPlayer.projectedPoints.toFixed(1)}{' '}
                    proj.)
                  </div>
                  <div className="text-sm">
                    Actual: {decision.selectedPlayer.actualPoints.toFixed(1)} pts
                  </div>
                </div>
                <div className="rounded-lg bg-success/10 p-3">
                  <div className="font-medium text-success">
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
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Higher projected alternatives considered:
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {decision.alternatives.slice(0, 5).map(alt => {
                      const altName = getPlayerDisplayName(alt.playerId, players);
                      const projDiff =
                        alt.projectedPoints - decision.selectedPlayer.projectedPoints;
                      const actualDiff =
                        alt.adjustedActualPoints - decision.selectedPlayer.actualPoints;

                      return (
                        <div
                          key={alt.playerId}
                          className="flex items-center justify-between rounded bg-card p-2"
                        >
                          <div className="truncate">
                            {altName}{' '}
                            <span className="text-muted-foreground">
                              ({alt.source === 'waiver' ? 'waiver*' : 'bench'})
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-secondary">
                              {alt.projectedPoints.toFixed(1)} ({projDiff >= 0 ? '+' : ''}
                              {projDiff.toFixed(1)})
                            </span>
                            <span className="font-medium text-foreground">
                              {alt.adjustedActualPoints.toFixed(1)}{' '}
                              {alt.source === 'waiver' && (
                                <span className="text-[10px] text-muted-foreground">
                                  ({alt.actualPoints.toFixed(1)})
                                </span>
                              )}
                            </span>
                            <span className="font-medium text-success">
                              +{actualDiff.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {decision.alternatives.some(alt => alt.source === 'waiver') && (
                    <div className="text-[11px] text-muted-foreground">
                      * Adjusted with 35% waiver pickup penalty
                    </div>
                  )}
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
});

WorstDecisionsTable.displayName = 'WorstDecisionsTable';
