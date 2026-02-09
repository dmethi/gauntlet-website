/**
 * Swing Points Display Component
 *
 * Shows momentum shifts in a matchup with details about what drove each swing
 */

'use client';

import { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';
import type { TimeSeriesPoint } from '../hooks/useMatchupTimeSeries';
import {
  detectAllSwings,
  getSwingBeneficiary,
  getSwingDriver,
  type SwingPoint,
} from '../utils/swing-analysis';
import { formatDelta } from '@/shared/utils/formatting';

interface SwingPointsDisplayProps {
  readonly series: TimeSeriesPoint[];
  readonly teamAName: string;
  readonly teamBName: string;
  readonly teamARosterId?: number;
  readonly teamBRosterId?: number;
  readonly rosterAIdFromDB?: number | null;
  readonly rosterBIdFromDB?: number | null;
}

const SwingRow = memo<{
  readonly swing: SwingPoint;
  readonly teamAName: string;
  readonly teamBName: string;
}>(props => {
  const { swing, teamAName, teamBName } = props;

  const beneficiary = getSwingBeneficiary(swing);
  const driver = getSwingDriver(swing);
  const beneficiaryName = beneficiary === 'teamA' ? teamAName : teamBName;

  const winProbChangePercent = swing.winProbChange * 100;
  const isPositive = swing.winProbChange > 0; // True if Team A gained

  // Beneficiary always gains, so determine styling based on which team is beneficiary
  const isBeneficiaryTeamA = beneficiary === 'teamA';
  const borderColorClass = isBeneficiaryTeamA ? 'border-red-700' : 'border-yellow-600';
  const iconColorClass = isBeneficiaryTeamA ? 'text-red-700' : 'text-yellow-600';

  return (
    <div className={`border-l-4 pl-4 py-3 hover:bg-muted/30 transition-colors ${borderColorClass}`}>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-4 h-4 ${iconColorClass}`} />
          <div>
            <p className="font-semibold text-sm">
              {beneficiaryName} gains {Math.abs(winProbChangePercent).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {swing.timestamp.toLocaleString()} • {swing.timeElapsed.toFixed(1)} min elapsed
            </p>
          </div>
        </div>
        <Badge variant={swing.type === 'consecutive' ? 'default' : 'secondary'} className="text-xs">
          {swing.type === 'consecutive' ? 'Next Sample' : '15min Window'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
        {/* Win Probability */}
        <div className="bg-muted/50 p-2 rounded">
          <p className="text-muted-foreground mb-1">Win Probability</p>
          <p className="font-mono">
            {(swing.before.winProbA * 100).toFixed(1)}% → {(swing.after.winProbA * 100).toFixed(1)}%
            <span className={isPositive ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
              ({formatDelta(winProbChangePercent, 1)}%)
            </span>
          </p>
        </div>

        {/* Score Changes */}
        <div className="bg-muted/50 p-2 rounded">
          <p className="text-muted-foreground mb-1">Score Changes</p>
          <div className="space-y-0.5 font-mono">
            <div className={driver === 'scoreA' ? 'font-bold' : ''}>
              {teamAName}: {formatDelta(swing.scoreChangeA, 1)} pts
            </div>
            <div className={driver === 'scoreB' ? 'font-bold' : ''}>
              {teamBName}: {formatDelta(swing.scoreChangeB, 1)} pts
            </div>
          </div>
        </div>

        {/* Projection Changes */}
        <div className="bg-muted/50 p-2 rounded col-span-2">
          <p className="text-muted-foreground mb-1">Projection Changes</p>
          <div className="grid grid-cols-2 gap-2 font-mono">
            <div className={driver === 'projectionA' ? 'font-bold' : ''}>
              {teamAName}: {formatDelta(swing.projectionChangeA, 1)} pts
            </div>
            <div className={driver === 'projectionB' ? 'font-bold' : ''}>
              {teamBName}: {formatDelta(swing.projectionChangeB, 1)} pts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SwingRow.displayName = 'SwingRow';

export const SwingPointsDisplay = memo<SwingPointsDisplayProps>(props => {
  const {
    series,
    teamAName,
    teamBName,
    teamARosterId,
    teamBRosterId,
    rosterAIdFromDB,
    rosterBIdFromDB,
  } = props;

  // Determine if we need to swap team names based on roster ID mapping
  const needsSwap = useMemo(() => {
    if (!teamARosterId || !rosterAIdFromDB) return false;
    // If the UI's teamA doesn't match the DB's teamA, we need to swap
    return teamARosterId !== rosterAIdFromDB;
  }, [teamARosterId, rosterAIdFromDB]);

  const swings = useMemo(() => {
    return detectAllSwings(series, 0.05, 0.2, 15);
  }, [series]);

  // Get the correct team names, swapping if necessary
  const correctTeamAName = needsSwap ? teamBName : teamAName;
  const correctTeamBName = needsSwap ? teamAName : teamBName;

  if (!series || series.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Momentum Swings
          </CardTitle>
          <CardDescription>Key win probability shifts during the matchup</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No time series data available for this matchup
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasConsecutive = swings.consecutive.length > 0;
  const hasWindow = swings.window.length > 0;

  if (!hasConsecutive && !hasWindow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Momentum Swings
          </CardTitle>
          <CardDescription>Key win probability shifts during the matchup</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No significant momentum swings detected in this matchup
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Momentum Swings
        </CardTitle>
        <CardDescription>Key win probability shifts and what drove them</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="consecutive" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="consecutive">
              Sample-to-Sample ({swings.consecutive.length})
            </TabsTrigger>
            <TabsTrigger value="window">15-Min Windows ({swings.window.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="consecutive" className="space-y-3 mt-4">
            {hasConsecutive ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Win probability changes &gt;5% between consecutive data samples
                </p>
                {swings.consecutive.map(swing => (
                  <SwingRow
                    key={swing.id}
                    swing={swing}
                    teamAName={correctTeamAName}
                    teamBName={correctTeamBName}
                  />
                ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No consecutive swings &gt;5% detected
              </p>
            )}
          </TabsContent>

          <TabsContent value="window" className="space-y-3 mt-4">
            {hasWindow ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Win probability changes &gt;20% within any 15-minute window
                </p>
                {swings.window.map(swing => (
                  <SwingRow
                    key={swing.id}
                    swing={swing}
                    teamAName={correctTeamAName}
                    teamBName={correctTeamBName}
                  />
                ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No 15-minute swings &gt;20% detected
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

SwingPointsDisplay.displayName = 'SwingPointsDisplay';
