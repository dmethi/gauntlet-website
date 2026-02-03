'use client';

import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Sparkles, Users, TrendingDown, Swords } from 'lucide-react';
import type { TeamSeedingProbabilities, LeagueSeedingResults } from '../../types';
import { formatSeedProbability, getSeedProbabilityColor } from '../../hooks';
import { useLeagueSummary, type LeagueSummary } from '../../hooks/useLeagueSummary';

interface SeedingTableProps {
  readonly results: LeagueSeedingResults;
}

/**
 * League-level summary section at the top
 */
const LeagueSummarySection = memo<{
  readonly summary: LeagueSummary;
  readonly leagueName: string;
}>(({ summary, leagueName }) => {
  return (
    <Card className="mb-6 border-2 border-gauntlet-gold/30 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gauntlet-gold" />
          <CardTitle className="text-lg font-geizer tracking-wide">
            Week 14 Preview: {leagueName}
          </CardTitle>
        </div>
        <CardDescription className="text-sm font-avenir mt-1">
          {summary.overallSummary}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Playoff Race */}
        <div className="p-3 bg-background/80 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-sm">Playoff Race</span>
          </div>
          <p className="text-sm text-muted-foreground">{summary.playoffRace}</p>
        </div>

        {/* Seeding Battles */}
        <div className="p-3 bg-background/80 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Swords className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-sm">Seeding Battles</span>
          </div>
          <p className="text-sm text-muted-foreground">{summary.seedingBattles}</p>
        </div>

        {/* Toilet Bowl */}
        <div className="p-3 bg-background/80 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-amber-600" />
            <span className="font-semibold text-sm">Toilet Bowl</span>
          </div>
          <p className="text-sm text-muted-foreground">{summary.toiletBowl}</p>
        </div>

        {/* Key Matchups */}
        {summary.keyMatchups && summary.keyMatchups.length > 0 && (
          <div className="p-3 bg-background/80 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="font-semibold text-sm">Key Matchups</span>
            </div>
            <ul className="space-y-2">
              {summary.keyMatchups.map((matchup, idx) => (
                <li
                  key={idx}
                  className="text-sm text-muted-foreground pl-4 border-l-2 border-purple-200 dark:border-purple-800"
                >
                  {matchup}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

LeagueSummarySection.displayName = 'LeagueSummarySection';

/**
 * Probability bar component showing chance for each seed
 */
const SeedProbabilityBar = memo<{
  readonly seed: number;
  readonly probability: number;
}>(({ seed, probability }) => {
  if (probability === 0) return null;

  const colorClass = getSeedProbabilityColor(seed);
  const widthPercent = Math.max(probability * 100, 2);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-6 text-muted-foreground">#{seed}</span>
      <div className="flex-1 h-4 bg-muted rounded-sm overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-300`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <span className="w-12 text-right font-medium">{formatSeedProbability(probability)}</span>
    </div>
  );
});

SeedProbabilityBar.displayName = 'SeedProbabilityBar';

/**
 * Simplified team seeding card - just probabilities and ranges
 */
const TeamSeedingCard = memo<{
  readonly team: TeamSeedingProbabilities;
  readonly rank: number;
}>(({ team, rank }) => {
  // Get seeds with probability > 0
  const activeSeedProbabilities = Object.entries(team.seedProbabilities)
    .filter(([_, prob]) => prob > 0)
    .sort(([seedA], [seedB]) => parseInt(seedA) - parseInt(seedB));

  const playoffProb = team.playoffProbability;
  const isPlayoffLikely = playoffProb > 0.5;
  const isEliminated = playoffProb === 0;
  const isLocked = playoffProb === 1;

  return (
    <Card className={`overflow-hidden ${isEliminated ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                isLocked
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : isEliminated
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    : 'bg-muted'
              }`}
            >
              {rank}
            </div>
            <div>
              <CardTitle className="text-base font-geizer tracking-wide">{team.teamName}</CardTitle>
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
                  isLocked
                    ? 'text-green-600'
                    : isEliminated
                      ? 'text-red-600'
                      : isPlayoffLikely
                        ? 'text-green-600'
                        : 'text-muted-foreground'
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
            <SeedProbabilityBar key={seed} seed={parseInt(seed)} probability={prob} />
          ))}
        </div>

        {/* Best/worst case badges */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Best: #{team.bestPossibleSeed}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Worst: #{team.worstPossibleSeed}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});

TeamSeedingCard.displayName = 'TeamSeedingCard';

/**
 * Main seeding table component showing league summary + all teams
 */
export const SeedingTable = memo<SeedingTableProps>(({ results }) => {
  const { data: leagueData, isLoading } = useLeagueSummary(results.leagueName);

  return (
    <div className="space-y-4">
      {/* League Summary Section */}
      {leagueData?.summary && !isLoading && (
        <LeagueSummarySection summary={leagueData.summary} leagueName={results.leagueName} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-geizer tracking-wide">
            {results.leagueName} Standings
          </h2>
          <p className="text-sm text-muted-foreground font-avenir">
            Based on {results.simulationCount.toLocaleString()} simulations
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Week 14 Scenarios
        </Badge>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.teams.map((team, index) => (
          <TeamSeedingCard key={team.rosterId} team={team} rank={index + 1} />
        ))}
      </div>
    </div>
  );
});

SeedingTable.displayName = 'SeedingTable';
