import { memo } from 'react';
import { Progress } from '@/components/ui/progress';
import type { ManagerEfficiency } from '@/features/start-sit/types';
import { getLeagueLabel } from './utils';

interface ManagerLeaderboardProps {
  managers: ManagerEfficiency[];
}

export const ManagerLeaderboard = memo(({ managers }: ManagerLeaderboardProps) => {
  return (
    <div className="space-y-3">
      {managers.map((manager, index) => {
        const league = getLeagueLabel(manager.leagueId);
        const isPositive = manager.pointsImpactScore >= 0;

        return (
          <div
            key={manager.managerId}
            className="flex items-center justify-between rounded-lg border bg-card p-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 text-sm font-medium text-muted-foreground">#{index + 1}</span>
              <div>
                <div className="font-medium text-foreground">{manager.managerName}</div>
                <div className="text-xs text-muted-foreground">
                  {league} • {manager.decisions.length} decisions
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-semibold text-blue-600">
                  {(manager.weightedDecisionScore * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Weighted Score</div>
              </div>

              <div className="text-right">
                <div className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}
                  {manager.pointsImpactScore.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Points vs Median</div>
              </div>

              <Progress value={manager.weightedDecisionScore * 100} className="h-2 w-24" />
            </div>
          </div>
        );
      })}
    </div>
  );
});

ManagerLeaderboard.displayName = 'ManagerLeaderboard';
