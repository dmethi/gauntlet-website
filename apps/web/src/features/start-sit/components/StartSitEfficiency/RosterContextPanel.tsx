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

interface RosterContextPanelProps {
  rosterContext: RosterContext[];
  players: Record<string, any>;
}

export const RosterContextPanel = memo(({ rosterContext, players }: RosterContextPanelProps) => {
  const [selectedManager, setSelectedManager] = useState<string>('all');
  const [expandedAlternatives, setExpandedAlternatives] = useState<Set<string>>(new Set());

  const managerOptions = useMemo(
    () => ['all', ...Array.from(new Set(rosterContext.map(context => context.managerName))).sort()],
    [rosterContext],
  );

  const filteredContext = useMemo(() => {
    if (selectedManager === 'all') return rosterContext;
    return rosterContext.filter(context => context.managerName === selectedManager);
  }, [rosterContext, selectedManager]);

  const toggleExpanded = (key: string) => {
    setExpandedAlternatives(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (rosterContext.length === 0) {
    return <div className="text-sm text-muted-foreground">Roster context is not available.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Team Context</h3>
        <Select value={selectedManager} onValueChange={setSelectedManager}>
          <SelectTrigger className="w-52">
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
          const isExpanded = expandedAlternatives.has(toggleKey);

          return (
            <Card key={toggleKey} className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-4">
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

              <div className="overflow-x-auto">
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
                              <span className="font-semibold text-red-600">+{diff.toFixed(1)}</span>
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

              <div className="flex items-center justify-between border-t pt-3 text-xs">
                <span className="font-medium text-muted-foreground">
                  Other Available Alternatives
                </span>
                <button
                  type="button"
                  onClick={() => toggleExpanded(toggleKey)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {isExpanded ? '▼ Collapse' : '▶ Show All'}
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 text-sm">
                <div>
                  <div className="font-medium text-blue-600">
                    Bench ({context.benchPlayers.length})
                  </div>
                  <div className="space-y-1 text-muted-foreground">
                    {(isExpanded ? context.benchPlayers : context.benchPlayers.slice(0, 6)).map(
                      (bench, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="truncate pr-2">
                            {getPlayerDisplayName(bench.player.playerId, players)}
                          </span>
                          <span className="font-medium text-foreground">
                            {bench.pointsScored.toFixed(1)}
                          </span>
                        </div>
                      ),
                    )}
                    {!isExpanded && context.benchPlayers.length > 6 && (
                      <div className="text-xs italic text-muted-foreground">
                        +{context.benchPlayers.length - 6} more
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="font-medium text-orange-600">
                    Waiver Wire ({context.waiverAlternatives.length})
                  </div>
                  <div className="space-y-1 text-muted-foreground">
                    {(isExpanded
                      ? context.waiverAlternatives
                      : context.waiverAlternatives.slice(0, 6)
                    ).map((waiver, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="truncate pr-2">
                          {getPlayerDisplayName(waiver.player.playerId, players)}
                        </span>
                        <span className="font-medium text-foreground">
                          {waiver.adjustedPoints.toFixed(1)}*
                        </span>
                      </div>
                    ))}
                    {!isExpanded && context.waiverAlternatives.length > 6 && (
                      <div className="text-xs italic text-muted-foreground">
                        +{context.waiverAlternatives.length - 6} more
                      </div>
                    )}
                  </div>
                  {context.waiverAlternatives.length > 0 && (
                    <div className="pt-1 text-[11px] text-muted-foreground">
                      * Adjusted with 35% waiver pickup penalty
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

RosterContextPanel.displayName = 'RosterContextPanel';
