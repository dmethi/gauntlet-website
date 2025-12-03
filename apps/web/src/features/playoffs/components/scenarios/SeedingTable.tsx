'use client';

import { memo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Trophy, Target } from 'lucide-react';
import type { TeamSeedingProbabilities, LeagueSeedingResults } from '../../types';
import {
  formatSeedProbability,
  getSeedProbabilityColor,
  formatScenarioConditions,
} from '../../hooks';

interface SeedingTableProps {
  readonly results: LeagueSeedingResults;
}

/**
 * Probability bar component showing chance for each seed
 */
const SeedProbabilityBar = memo<{
  readonly seed: number;
  readonly probability: number;
}>(({ seed, probability }) => {
  if (probability === 0) return null;

  const colorClass = getSeedProbabilityColor(seed);
  const widthPercent = Math.max(probability * 100, 2); // Min 2% width for visibility

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-6 text-muted-foreground">#{seed}</span>
      <div className="flex-1 h-4 bg-muted rounded-sm overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-300`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <span className="w-12 text-right font-medium">
        {formatSeedProbability(probability)}
      </span>
    </div>
  );
});

SeedProbabilityBar.displayName = 'SeedProbabilityBar';

/**
 * Individual team seeding card with expandable scenarios
 */
const TeamSeedingCard = memo<{
  readonly team: TeamSeedingProbabilities;
  readonly rank: number;
}>(({ team, rank }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get seeds with probability > 0
  const activeSeedProbabilities = Object.entries(team.seedProbabilities)
    .filter(([_, prob]) => prob > 0)
    .sort(([seedA], [seedB]) => parseInt(seedA) - parseInt(seedB));

  const playoffProb = team.playoffProbability;
  const isPlayoffLikely = playoffProb > 0.5;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
              {rank}
            </div>
            <div>
              <CardTitle className="text-base font-geizer tracking-wide">
                {team.teamName}
              </CardTitle>
              <CardDescription className="text-xs font-avenir">
                {team.ownerName} • {team.currentRecord} • {team.currentPoints.toFixed(1)} pts
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              {isPlayoffLikely ? (
                <Trophy className="h-4 w-4 text-gauntlet-gold" />
              ) : (
                <Target className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={`text-lg font-bold ${
                  isPlayoffLikely ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                {formatSeedProbability(playoffProb)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Playoff Odds</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Seed probability bars */}
        <div className="space-y-1 mb-3">
          {activeSeedProbabilities.slice(0, 6).map(([seed, prob]) => (
            <SeedProbabilityBar
              key={seed}
              seed={parseInt(seed)}
              probability={prob}
            />
          ))}
        </div>

        {/* Best/worst case badges */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            Best: #{team.bestPossibleSeed}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Worst: #{team.worstPossibleSeed}
          </Badge>
        </div>

        {/* Expandable scenarios */}
        {team.scenarios.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  Hide Scenarios <ChevronUp className="ml-1 h-3 w-3" />
                </>
              ) : (
                <>
                  Show What Needs to Happen <ChevronDown className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>

            {isExpanded && (
              <div className="mt-3 space-y-2 text-xs">
                {team.scenarios
                  .filter((s) => s.probability > 0.01) // Only show scenarios with >1% chance
                  .map((scenario) => (
                    <div
                      key={scenario.seed}
                      className="p-2 bg-muted/50 rounded-md"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">
                          #{scenario.seed} Seed ({formatSeedProbability(scenario.probability)})
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        {formatScenarioConditions(scenario.conditions)}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TeamSeedingCard.displayName = 'TeamSeedingCard';

/**
 * Main seeding table component showing all teams in a league
 */
export const SeedingTable = memo<SeedingTableProps>(({ results }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-geizer tracking-wide">
            {results.leagueName} Playoff Seeding
          </h2>
          <p className="text-sm text-muted-foreground font-avenir">
            Based on {results.simulationCount.toLocaleString()} simulations
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Week 14 Scenarios
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.teams.map((team, index) => (
          <TeamSeedingCard
            key={team.rosterId}
            team={team}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
});

SeedingTable.displayName = 'SeedingTable';

