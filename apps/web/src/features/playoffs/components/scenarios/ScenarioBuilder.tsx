'use client';

import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Lock, Unlock, Shuffle } from 'lucide-react';
import type { Week14Matchup } from '../../types';

interface ScenarioBuilderProps {
  readonly matchups: readonly Week14Matchup[];
  readonly leagueName: 'AFC' | 'NFC';
  readonly lockedOutcomes: Record<number, 'team1' | 'team2' | null>;
  readonly onLockOutcome: (matchupId: number, winner: 'team1' | 'team2' | null) => void;
  readonly onResetAll: () => void;
  readonly isLoading?: boolean;
}

/**
 * Individual matchup selector row
 */
const MatchupSelector = memo<{
  readonly matchup: Week14Matchup;
  readonly lockedWinner: 'team1' | 'team2' | null;
  readonly onSelect: (winner: 'team1' | 'team2' | null) => void;
  readonly isLoading?: boolean;
}>(({ matchup, lockedWinner, onSelect, isLoading }) => {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
      {/* Matchup ID */}
      <div className="w-6 text-center text-xs text-muted-foreground font-medium">
        M{matchup.matchupId}
      </div>

      {/* Team 1 button */}
      <Button
        variant={lockedWinner === 'team1' ? 'default' : 'outline'}
        size="sm"
        className={`flex-1 text-xs h-9 ${
          lockedWinner === 'team1'
            ? 'bg-green-600 hover:bg-green-700 border-green-600'
            : ''
        }`}
        onClick={() => onSelect(lockedWinner === 'team1' ? null : 'team1')}
        disabled={isLoading}
      >
        {lockedWinner === 'team1' && <Lock className="h-3 w-3 mr-1" />}
        <span className="truncate">{matchup.team1Name}</span>
      </Button>

      {/* VS / Simulate indicator */}
      <div className="w-16 text-center">
        {lockedWinner === null ? (
          <Badge variant="secondary" className="text-xs">
            <Shuffle className="h-3 w-3 mr-1" />
            Sim
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">vs</span>
        )}
      </div>

      {/* Team 2 button */}
      <Button
        variant={lockedWinner === 'team2' ? 'default' : 'outline'}
        size="sm"
        className={`flex-1 text-xs h-9 ${
          lockedWinner === 'team2'
            ? 'bg-green-600 hover:bg-green-700 border-green-600'
            : ''
        }`}
        onClick={() => onSelect(lockedWinner === 'team2' ? null : 'team2')}
        disabled={isLoading}
      >
        {lockedWinner === 'team2' && <Lock className="h-3 w-3 mr-1" />}
        <span className="truncate">{matchup.team2Name}</span>
      </Button>
    </div>
  );
});

MatchupSelector.displayName = 'MatchupSelector';

/**
 * Scenario builder component for locking matchup outcomes
 */
export const ScenarioBuilder = memo<ScenarioBuilderProps>(({
  matchups,
  leagueName,
  lockedOutcomes,
  onLockOutcome,
  onResetAll,
  isLoading,
}) => {
  const lockedCount = Object.values(lockedOutcomes).filter(
    (outcome) => outcome !== null
  ).length;

  const totalMatchups = matchups.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-geizer tracking-wide flex items-center gap-2">
              {leagueName} Scenario Builder
              {lockedCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {lockedCount}/{totalMatchups} locked
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs font-avenir">
              Lock matchup outcomes to see how it affects playoff seeding
            </CardDescription>
          </div>
          {lockedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetAll}
              disabled={isLoading}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {matchups.map((matchup) => (
            <MatchupSelector
              key={matchup.matchupId}
              matchup={matchup}
              lockedWinner={lockedOutcomes[matchup.matchupId] ?? null}
              onSelect={(winner) => onLockOutcome(matchup.matchupId, winner)}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Helper text */}
        <div className="mt-4 p-3 bg-muted/20 rounded-md">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Unlock className="h-3 w-3" />
            <span>Click a team to lock them as the winner</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Lock className="h-3 w-3" />
            <span>Click again to unlock and simulate</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ScenarioBuilder.displayName = 'ScenarioBuilder';

