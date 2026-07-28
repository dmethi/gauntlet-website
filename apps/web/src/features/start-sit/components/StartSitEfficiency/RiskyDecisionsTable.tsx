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

interface RiskyDecisionsTableProps {
  decisions: DecisionDetail[];
  players: Record<string, any>;
}

export const RiskyDecisionsTable = memo(({ decisions, players }: RiskyDecisionsTableProps) => {
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [threshold, setThreshold] = useState<number>(5);

  const weeks = useMemo(
    () => Array.from(new Set(decisions.map(decision => decision.week))).sort((a, b) => a - b),
    [decisions],
  );

  const filtered = useMemo(() => {
    let current = decisions;
    if (selectedWeek !== 'all') {
      const week = Number(selectedWeek);
      current = current.filter(decision => decision.week === week);
    }
    return current.filter(decision => (decision.actualOutcome || 0) >= threshold);
  }, [decisions, selectedWeek, threshold]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Best Risky Decisions • {filtered.length} cases
        </h3>
        <div className="flex gap-2">
          <Select value={threshold.toString()} onValueChange={value => setThreshold(Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All (≥0 pts)</SelectItem>
              <SelectItem value="3">≥3 payoff</SelectItem>
              <SelectItem value="5">≥5 payoff</SelectItem>
              <SelectItem value="10">≥10 payoff</SelectItem>
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
                  <div className="text-xl font-bold text-success">
                    +{(decision.actualOutcome || 0).toFixed(1)} pts
                  </div>
                  <div className="text-xs text-muted-foreground">Risky Payoff</div>
                </div>
              </div>

              <div className="rounded-lg bg-success/10 p-3">
                <div className="font-medium text-success">Risky Pick: {selectedName}</div>
                <div className="text-sm">
                  Projected: {decision.selectedPlayer.projectedPoints.toFixed(1)} | Actual:{' '}
                  {decision.selectedPlayer.actualPoints.toFixed(1)}
                </div>
              </div>

              {decision.alternatives?.length ? (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Alternatives they faded:
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {decision.alternatives.slice(0, 5).map(alt => {
                      const altName = getPlayerDisplayName(alt.playerId, players);
                      const projDiff =
                        alt.projectedPoints - decision.selectedPlayer.projectedPoints;
                      const outcome = decision.selectedPlayer.actualPoints - alt.actualPoints;

                      return (
                        <div
                          key={alt.playerId}
                          className="flex items-center justify-between rounded bg-card p-2"
                        >
                          <div className="truncate">
                            {altName} ({alt.source === 'waiver' ? 'waiver' : 'bench'})
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-secondary">
                              {alt.projectedPoints.toFixed(1)} ({projDiff >= 0 ? '+' : ''}
                              {projDiff.toFixed(1)})
                            </span>
                            <span className="font-medium text-foreground">
                              {alt.actualPoints.toFixed(1)}
                            </span>
                            <span className="font-medium text-success">+{outcome.toFixed(1)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
});

RiskyDecisionsTable.displayName = 'RiskyDecisionsTable';
