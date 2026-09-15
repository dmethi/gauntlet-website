import { memo, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RosterContext } from '@/features/start-sit/types';
import { getLeagueLabel, getPlayerDisplayName } from './utils';
import { ChevronDown } from 'lucide-react';

interface RosterContextPanelProps {
  rosterContext: RosterContext[];
  players: Record<string, any>;
}

export const RosterContextPanel = memo(({ rosterContext, players }: RosterContextPanelProps) => {
  const [selectedManager, setSelectedManager] = useState<string>('all');

  const managerOptions = useMemo(
    () => ['all', ...Array.from(new Set(rosterContext.map(context => context.managerName))).sort()],
    [rosterContext],
  );

  const filteredContext = useMemo(() => {
    if (selectedManager === 'all') return rosterContext;
    return rosterContext.filter(context => context.managerName === selectedManager);
  }, [rosterContext, selectedManager]);

  if (rosterContext.length === 0) {
    return <div className="text-sm text-muted-foreground">Roster context is not available.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">Team Context</h3>
        <Select value={selectedManager} onValueChange={setSelectedManager}>
          <SelectTrigger className="h-11 w-full sm:w-52">
            <SelectValue placeholder="All managers" />
          </SelectTrigger>
          <SelectContent>
            {managerOptions.map(option => (
              <SelectItem key={option} value={option}>
                {option === 'all' ? 'All Managers' : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredContext.map(context => {
          const league = getLeagueLabel(context.leagueId);
          const toggleKey = `${context.managerId}-${context.week}`;

          return (
            <Card
              key={toggleKey}
              className="space-y-4 rounded-none border-x-0 p-0 py-4 shadow-none sm:rounded-xl sm:border sm:p-4 sm:shadow-sm"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {context.managerName} ({league})
                  </div>
                  <div className="text-xs text-muted-foreground">Week {context.week}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {context.decisions?.length || 0} tracked decisions
                </div>
              </div>

              <div
                role="region"
                aria-label={`${context.managerName} Week ${context.week} lineup decisions`}
                tabIndex={0}
                className="overflow-x-auto pb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="py-1 text-left">Pos</th>
                      <th className="py-1 text-left">Starter</th>
                      <th className="py-1 text-center">Proj</th>
                      <th className="py-1 text-center">Actual</th>
                      <th className="py-1 text-center">Optimal</th>
                      <th className="py-1 text-center">Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {context.decisions?.map(decision => {
                      const bestAlternative =
                        decision.optimalPlayer || decision.alternatives?.[0] || null;
                      const starterName = getPlayerDisplayName(
                        decision.selectedPlayer.playerId,
                        players,
                      );
                      const optimalName = bestAlternative?.playerId
                        ? getPlayerDisplayName(bestAlternative.playerId, players)
                        : null;
                      const diff =
                        (bestAlternative?.adjustedActualPoints ??
                          decision.selectedPlayer.actualPoints) -
                        decision.selectedPlayer.actualPoints;

                      return (
                        <tr
                          key={`${decision.position}-${decision.selectedPlayer.playerId}`}
                          className="border-b last:border-none"
                        >
                          <td className="py-1 font-medium">{decision.position}</td>
                          <td className="py-1">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{starterName}</span>
                              <span className="text-xs text-muted-foreground">
                                {decision.selectedPlayer.projectedPoints.toFixed(1)} proj.
                              </span>
                            </div>
                          </td>
                          <td className="py-1 text-center">
                            {decision.selectedPlayer.projectedPoints.toFixed(1)}
                          </td>
                          <td className="py-1 text-center">
                            {decision.selectedPlayer.actualPoints.toFixed(1)}
                          </td>
                          <td className="py-1 text-center">
                            {optimalName ? (
                              <div className="flex flex-col">
                                <span>{optimalName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {(bestAlternative?.adjustedActualPoints ?? 0).toFixed(1)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-1 text-center">
                            {diff > 0 ? (
                              <span className="font-semibold text-destructive">
                                +{diff.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <details className="group border-t border-border/70 pt-1">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  <span>Available alternatives</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>

                <div className="grid gap-3 pt-2 text-sm md:grid-cols-2">
                  <div>
                    <div className="font-medium text-primary">
                      Bench ({context.benchPlayers.length})
                    </div>
                    <div className="space-y-1 text-muted-foreground">
                      {context.benchPlayers.map((bench, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="truncate pr-2">
                            {getPlayerDisplayName(bench.player.playerId, players)}
                          </span>
                          <span className="font-medium text-foreground">
                            {bench.pointsScored.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-secondary">
                      Waiver Wire ({context.waiverAlternatives.length})
                    </div>
                    <div className="space-y-1 text-muted-foreground">
                      {context.waiverAlternatives.map((waiver, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="truncate pr-2">
                            {getPlayerDisplayName(waiver.player.playerId, players)}
                          </span>
                          <span className="font-medium text-foreground">
                            {waiver.adjustedPoints.toFixed(1)}*
                          </span>
                        </div>
                      ))}
                    </div>
                    {context.waiverAlternatives.length > 0 && (
                      <div className="pt-1 text-xs text-muted-foreground">
                        * Adjusted with 35% waiver pickup penalty
                      </div>
                    )}
                  </div>
                </div>
              </details>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

RosterContextPanel.displayName = 'RosterContextPanel';
