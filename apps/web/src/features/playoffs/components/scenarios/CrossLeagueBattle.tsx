'use client';

import { memo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, DollarSign, Swords, TrendingUp, Users } from 'lucide-react';
import type { CrossLeagueBattleResults, CrossLeagueMatchup, CrossLeaguePlayer } from '../../types';
import { formatExpectedWins, formatWinProbability, getMatchupFavorite } from '../../hooks';

interface CrossLeagueBattleProps {
  readonly results: CrossLeagueBattleResults;
}

/**
 * League probability header showing overall win chances
 */
const LeagueProbabilityHeader = memo<{
  readonly afcWinProb: number;
  readonly nfcWinProb: number;
  readonly expectedAfcWins: number;
  readonly expectedNfcWins: number;
  readonly expectedAfcPoints: number;
  readonly expectedNfcPoints: number;
}>(
  ({
    afcWinProb,
    nfcWinProb,
    expectedAfcWins,
    expectedNfcWins,
    expectedAfcPoints,
    expectedNfcPoints,
  }) => {
    const afcFavored = afcWinProb > 0.5;

    return (
      <Card className="bg-gradient-to-r from-red-500/10 via-transparent to-blue-500/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* AFC Side */}
            <div className="text-center">
              <h3 className="text-lg font-bold font-geizer tracking-wide text-red-500">AFC</h3>
              <div
                className={`text-3xl font-bold ${afcFavored ? 'text-red-500' : 'text-muted-foreground'}`}
              >
                {formatWinProbability(afcWinProb)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {formatExpectedWins(expectedAfcWins)} wins expected
              </div>
              <div className="text-xs text-muted-foreground">
                ~{expectedAfcPoints.toLocaleString()} pts
              </div>
            </div>

            {/* VS Indicator */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="h-5 w-5 text-gauntlet-gold" />
                <span className="text-lg font-bold text-gauntlet-gold">$100</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">per person</p>
              <Swords className="h-8 w-8 mx-auto mt-2 text-muted-foreground" />
            </div>

            {/* NFC Side */}
            <div className="text-center">
              <h3 className="text-lg font-bold font-geizer tracking-wide text-blue-500">NFC</h3>
              <div
                className={`text-3xl font-bold ${!afcFavored ? 'text-blue-500' : 'text-muted-foreground'}`}
              >
                {formatWinProbability(nfcWinProb)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {formatExpectedWins(expectedNfcWins)} wins expected
              </div>
              <div className="text-xs text-muted-foreground">
                ~{expectedNfcPoints.toLocaleString()} pts
              </div>
            </div>
          </div>

          {/* Progress bar showing win probability */}
          <div className="mt-4 h-3 rounded-full overflow-hidden bg-muted flex">
            <div
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${afcWinProb * 100}%` }}
            />
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${nfcWinProb * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    );
  },
);

LeagueProbabilityHeader.displayName = 'LeagueProbabilityHeader';

/**
 * Player row in roster display
 */
const PlayerRow = memo<{
  readonly player: CrossLeaguePlayer;
  readonly isAfc: boolean;
}>(({ player, isAfc }) => {
  const positionColors: Record<string, string> = {
    QB: 'bg-red-500',
    RB: 'bg-green-500',
    WR: 'bg-blue-500',
    TE: 'bg-yellow-500',
    K: 'bg-purple-500',
    DEF: 'bg-orange-500',
  };
  const posColor = positionColors[player.position] || 'bg-gray-500';

  return (
    <div
      className={`flex items-center gap-2 py-1 text-xs ${isAfc ? 'justify-end' : 'justify-start'}`}
    >
      {isAfc && (
        <>
          <span className="text-muted-foreground w-12 text-right">
            {player.currentScore > 0
              ? player.currentScore.toFixed(1)
              : player.projection.toFixed(1)}
          </span>
          <span className="truncate max-w-[100px]">{player.name}</span>
          <Badge variant="secondary" className={`${posColor} text-white text-[10px] px-1 py-0`}>
            {player.position}
          </Badge>
        </>
      )}
      {!isAfc && (
        <>
          <Badge variant="secondary" className={`${posColor} text-white text-[10px] px-1 py-0`}>
            {player.position}
          </Badge>
          <span className="truncate max-w-[100px]">{player.name}</span>
          <span className="text-muted-foreground w-12 text-left">
            {player.currentScore > 0
              ? player.currentScore.toFixed(1)
              : player.projection.toFixed(1)}
          </span>
        </>
      )}
    </div>
  );
});

PlayerRow.displayName = 'PlayerRow';

/**
 * Individual matchup row showing seed vs seed with expandable rosters
 */
const MatchupRow = memo<{
  readonly matchup: CrossLeagueMatchup;
}>(({ matchup }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const favorite = getMatchupFavorite(matchup.afcWinProbability);
  const afcPercent = Math.round(matchup.afcWinProbability * 100);
  const nfcPercent = Math.round(matchup.nfcWinProbability * 100);

  const hasRosterData = matchup.afcTeam.roster && matchup.nfcTeam.roster;

  return (
    <div className="rounded-lg bg-muted/30 overflow-hidden">
      {/* Main matchup row */}
      <div
        className={`flex items-center gap-2 p-3 ${hasRosterData ? 'cursor-pointer hover:bg-muted/50' : ''} transition-colors`}
        onClick={() => hasRosterData && setIsExpanded(!isExpanded)}
      >
        {/* Seed number */}
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
          #{matchup.seed}
        </div>

        {/* AFC Team */}
        <div className="flex-1 text-right">
          <div className="font-medium text-sm truncate">{matchup.afcTeam.teamName}</div>
          <div className="text-xs text-muted-foreground">{matchup.afcTeam.ownerName}</div>
          <div className="text-xs text-muted-foreground">
            ~{matchup.projectedAfcScore.toFixed(1)} proj
          </div>
        </div>

        {/* Win probability indicator */}
        <div className="w-24 text-center">
          <div className="flex items-center justify-center gap-1">
            <span
              className={`text-sm font-bold ${
                favorite === 'afc' ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              {afcPercent}%
            </span>
            <Swords className="h-3 w-3 text-muted-foreground" />
            <span
              className={`text-sm font-bold ${
                favorite === 'nfc' ? 'text-blue-500' : 'text-muted-foreground'
              }`}
            >
              {nfcPercent}%
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="h-1 rounded-full overflow-hidden bg-muted flex mt-1">
            <div className="h-full bg-red-500" style={{ width: `${afcPercent}%` }} />
            <div className="h-full bg-blue-500" style={{ width: `${nfcPercent}%` }} />
          </div>
          {hasRosterData && (
            <div className="flex items-center justify-center mt-1 text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
          )}
        </div>

        {/* NFC Team */}
        <div className="flex-1 text-left">
          <div className="font-medium text-sm truncate">{matchup.nfcTeam.teamName}</div>
          <div className="text-xs text-muted-foreground">{matchup.nfcTeam.ownerName}</div>
          <div className="text-xs text-muted-foreground">
            ~{matchup.projectedNfcScore.toFixed(1)} proj
          </div>
        </div>
      </div>

      {/* Expanded roster view */}
      {isExpanded && hasRosterData && (
        <div className="border-t border-muted px-3 py-2 bg-muted/20">
          <div className="grid grid-cols-2 gap-4">
            {/* AFC Roster */}
            <div className="border-r border-muted pr-4">
              <div className="text-xs font-semibold text-red-500 mb-2 text-right">AFC Roster</div>
              <div className="space-y-0.5">
                {matchup.afcTeam.roster?.map(player => (
                  <PlayerRow key={player.playerId} player={player} isAfc={true} />
                ))}
              </div>
              <div className="text-xs font-semibold text-right mt-2 border-t border-muted pt-1">
                Total:{' '}
                {matchup.afcTeam.roster
                  ?.reduce(
                    (sum, p) => sum + (p.currentScore > 0 ? p.currentScore : p.projection),
                    0,
                  )
                  .toFixed(1)}
              </div>
            </div>

            {/* NFC Roster */}
            <div className="pl-4">
              <div className="text-xs font-semibold text-blue-500 mb-2 text-left">NFC Roster</div>
              <div className="space-y-0.5">
                {matchup.nfcTeam.roster?.map(player => (
                  <PlayerRow key={player.playerId} player={player} isAfc={false} />
                ))}
              </div>
              <div className="text-xs font-semibold text-left mt-2 border-t border-muted pt-1">
                Total:{' '}
                {matchup.nfcTeam.roster
                  ?.reduce(
                    (sum, p) => sum + (p.currentScore > 0 ? p.currentScore : p.projection),
                    0,
                  )
                  .toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MatchupRow.displayName = 'MatchupRow';

/**
 * Main cross-league battle component
 */
export const CrossLeagueBattle = memo<CrossLeagueBattleProps>(({ results }) => {
  // Count matchups favoring each league
  const afcFavoredCount = results.matchups.filter(m => m.afcWinProbability > 0.5).length;
  const nfcFavoredCount = results.matchups.length - afcFavoredCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-geizer tracking-wide flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gauntlet-gold" />
            Week 14 Cross-League Championship
          </h2>
          <p className="text-sm text-muted-foreground font-avenir">
            All 12 teams compete head-to-head by current seed
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {afcFavoredCount} AFC / {nfcFavoredCount} NFC favored
        </Badge>
      </div>

      {/* League probability header */}
      <LeagueProbabilityHeader
        afcWinProb={results.afcWinProbability}
        nfcWinProb={results.nfcWinProbability}
        expectedAfcWins={results.expectedAfcWins}
        expectedNfcWins={results.expectedNfcWins}
        expectedAfcPoints={results.expectedAfcTotalPoints}
        expectedNfcPoints={results.expectedNfcTotalPoints}
      />

      {/* Matchup grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-geizer tracking-wide">All 12 Matchups</CardTitle>
          <CardDescription className="text-xs">
            Based on {results.simulationCount.toLocaleString()} simulations per matchup
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {results.matchups.map(matchup => (
              <MatchupRow key={matchup.seed} matchup={matchup} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tiebreaker note */}
      <p className="text-xs text-muted-foreground text-center">
        League winner determined by most matchup wins (7+). Tiebreaker at 6-6: total points scored.
      </p>
    </div>
  );
});

CrossLeagueBattle.displayName = 'CrossLeagueBattle';
