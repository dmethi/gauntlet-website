import { memo, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ManagerEfficiency } from '@/features/start-sit/types';
import { calculatePositionalEfficiency, getLeagueLabel } from './utils';
import { ManagerSelector } from './ManagerSelector';

interface PositionBreakdownProps {
  managers: ManagerEfficiency[];
  selectedManagerId: string;
  onSelectManager: (managerId: string) => void;
  managerOptions: Array<{ value: string; label: string; leagueLabel: string }>;
}

const PositionBadge = ({ position, weight }: { position: string; weight: number }) => {
  const variant =
    weight >= 0.9
      ? 'bg-blue-600 text-white'
      : weight >= 0.7
        ? 'bg-slate-200 text-slate-900'
        : 'bg-slate-100 text-slate-600';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${variant}`}>
      {position} ({weight.toFixed(1)}x)
    </span>
  );
};

export const PositionBreakdown = memo(
  ({ managers, selectedManagerId, onSelectManager, managerOptions }: PositionBreakdownProps) => {
    const [viewMode, setViewMode] = useState<'rankings' | 'manager'>('rankings');

    const positions = useMemo(() => {
      const set = new Set<string>();
      managers.forEach(manager => {
        Object.keys(manager.positionBreakdown || {}).forEach(position => set.add(position));
      });
      return Array.from(set).sort();
    }, [managers]);

    const positionRankings = useMemo(() => {
      const rankings = new Map<
        string,
        Array<{
          manager: ManagerEfficiency;
          metrics: ManagerEfficiency['positionBreakdown'][string];
        }>
      >();

      positions.forEach(position => {
        const ordered = managers
          .filter(manager => manager.positionBreakdown[position])
          .map(manager => ({
            manager,
            metrics: manager.positionBreakdown[position],
          }))
          .sort((a, b) => {
            if (Math.abs(a.metrics.decisionRate - b.metrics.decisionRate) > 0.01) {
              return b.metrics.decisionRate - a.metrics.decisionRate;
            }
            return b.metrics.pointsLostVsMedian - a.metrics.pointsLostVsMedian;
          });
        rankings.set(position, ordered);
      });

      return rankings;
    }, [managers, positions]);

    const selectedManager = managers.find(manager => manager.managerId === selectedManagerId);

    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">Position-by-Position Analysis</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode('rankings')}
                className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                  viewMode === 'rankings'
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                League Rankings
              </button>
              <button
                type="button"
                onClick={() => setViewMode('manager')}
                className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                  viewMode === 'manager'
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Individual Manager
              </button>
            </div>
          </div>

          {viewMode === 'manager' && (
            <ManagerSelector
              options={managerOptions}
              value={selectedManagerId}
              onChange={onSelectManager}
              placeholder="Select manager"
            />
          )}
        </div>

        {viewMode === 'rankings' && (
          <div className="space-y-6">
            {positions.map(position => {
              const rankings = positionRankings.get(position) ?? [];
              const totalDecisions = rankings.reduce(
                (sum, entry) => sum + entry.metrics.decisionsCount,
                0,
              );

              if (rankings.length === 0) {
                return null;
              }

              return (
                <Card key={position} className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PositionBadge position={position} weight={rankings[0].metrics.weight} />
                      <span className="text-xs text-muted-foreground">
                        {rankings.length} managers • {totalDecisions} decisions
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {rankings.map((entry, index) => {
                      const isPositive = entry.metrics.pointsLostVsMedian >= 0;
                      const league = getLeagueLabel(entry.manager.leagueId);
                      return (
                        <div
                          key={entry.manager.managerId}
                          className="flex items-center justify-between rounded-lg bg-muted p-2 hover:bg-muted/80"
                        >
                          <div className="flex flex-1 items-center gap-3">
                            <span className="w-6 text-sm font-medium text-muted-foreground">
                              #{index + 1}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-foreground">
                                {entry.manager.managerName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {league} • {entry.metrics.decisionsCount} decisions
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-semibold text-blue-600">
                                {(entry.metrics.decisionRate * 100).toFixed(1)}%
                              </div>
                              <div className="text-xs text-muted-foreground">Correct</div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {isPositive ? '+' : ''}
                                {entry.metrics.pointsLostVsMedian.toFixed(1)}
                              </div>
                              <div className="text-xs text-muted-foreground">vs Median</div>
                            </div>
                            <Progress
                              value={entry.metrics.decisionRate * 100}
                              className="h-2 w-16"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {viewMode === 'manager' && selectedManager && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-muted-foreground">
              {selectedManager.managerName} • {getLeagueLabel(selectedManager.leagueId)}
            </h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {calculatePositionalEfficiency(selectedManager).map(({ position, metrics }) => {
                const isPositive = metrics.pointsLostVsMedian >= 0;
                return (
                  <Card key={position} className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <PositionBadge position={position} weight={metrics.weight} />
                      <span className="text-xs text-muted-foreground">
                        {metrics.decisionsCount} decisions
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Decision Rate</span>
                        <span className="font-semibold">
                          {(metrics.decisionRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={metrics.decisionRate * 100} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>vs Median</span>
                        <span
                          className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {isPositive ? '+' : ''}
                          {metrics.pointsLostVsMedian.toFixed(1)} pts
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  },
);

PositionBreakdown.displayName = 'PositionBreakdown';
