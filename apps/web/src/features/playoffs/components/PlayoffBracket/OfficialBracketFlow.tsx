'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BracketTeam, LeagueData, PlayoffMatchup } from '@/features/playoffs/types';
import { getMatchupResult, roundToWeek } from './utils';
import { BracketMatchup } from './BracketMatchup';
import { BracketRound } from './BracketRound';

interface OfficialBracketFlowProps {
  structure: {
    winners: Array<{ round: number; matchups: PlayoffMatchup[] }>;
    losers: Array<{ round: number; matchups: PlayoffMatchup[] }>;
    placements: PlayoffMatchup[];
  };
  bracketTeams: BracketTeam[];
  league?: LeagueData;
}

const findTeam = (teams: BracketTeam[], rosterId: number | undefined | null) =>
  rosterId ? teams.find(team => Number(team.id) === Number(rosterId)) : undefined;

const getMatchupLabel = (matchup: PlayoffMatchup, bracket: 'winners' | 'losers') => {
  const base = `Round ${matchup.r} • Week ${roundToWeek(matchup.r)} • Matchup ${matchup.m}`;
  return bracket === 'losers' ? `${base} (Loser Advances)` : base;
};

const resolveMatchupResult = (league: LeagueData | undefined, matchup: PlayoffMatchup) => {
  if (!matchup.t1 || !matchup.t2 || matchup.t1 === 0 || matchup.t2 === 0) {
    return undefined;
  }
  return getMatchupResult(league, matchup.t1, matchup.t2, roundToWeek(matchup.r));
};

const OfficialRound = ({
  title,
  subtitle,
  matchups,
  bracket,
  bracketTeams,
  league,
}: {
  title: string;
  subtitle: string;
  matchups: PlayoffMatchup[];
  bracket: 'winners' | 'losers';
  bracketTeams: BracketTeam[];
  league?: LeagueData;
}) => {
  return (
    <BracketRound title={title} subtitle={subtitle}>
      {matchups.map(matchup => (
        <BracketMatchup
          key={`${bracket}-round-${matchup.r}-m-${matchup.m}`}
          matchupLabel={getMatchupLabel(matchup, bracket)}
          team1={findTeam(bracketTeams, matchup.t1)}
          team2={findTeam(bracketTeams, matchup.t2)}
          isBye={!matchup.t1 || !matchup.t2 || matchup.t1 === 0 || matchup.t2 === 0}
          result={resolveMatchupResult(league, matchup)}
          isToiletBowl={bracket === 'losers'}
          highlightPending
        />
      ))}
    </BracketRound>
  );
};

export const OfficialBracketFlow = memo<OfficialBracketFlowProps>(
  ({ structure, bracketTeams, league }) => {
    const maxLoserRound =
      structure.losers.length > 0 ? Math.max(...structure.losers.map(round => round.round)) : 0;

    const placementGames = structure.placements;

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Winners Bracket</span>
              <Badge variant="secondary" className="text-xs">
                Championship Path ({bracketTeams.slice(0, 6).length} Teams)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="flex justify-start space-x-12 min-w-max p-6">
                {structure.winners.map(roundData => (
                  <OfficialRound
                    key={`official-winners-round-${roundData.round}`}
                    title={`Round ${roundData.round}`}
                    subtitle={`Week ${roundToWeek(roundData.round)}`}
                    matchups={roundData.matchups}
                    bracket="winners"
                    bracketTeams={bracketTeams}
                    league={league}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Losers Bracket</span>
              <Badge variant="destructive" className="text-xs">
                Toilet Bowl ({bracketTeams.slice(6, 12).length} Teams • Losers Advance)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="flex justify-center space-x-12 min-w-max p-6">
                {structure.losers.map(roundData => (
                  <OfficialRound
                    key={`official-losers-round-${roundData.round}`}
                    title={`Round ${roundData.round}`}
                    subtitle={`Week ${roundToWeek(roundData.round)}`}
                    matchups={roundData.matchups}
                    bracket="losers"
                    bracketTeams={bracketTeams}
                    league={league}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Placement Games</span>
              <Badge variant="outline" className="text-xs">
                {placementGames.length} Games
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {placementGames.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {placementGames.map(matchup => (
                  <div
                    key={`placement-${matchup.m}`}
                    className="flex flex-col items-center space-y-4"
                  >
                    <div className="text-xs text-muted-foreground text-center">
                      <p className="font-medium">Placement Game</p>
                      <p>
                        Round {matchup.r} • Week {roundToWeek(matchup.r)}
                      </p>
                    </div>
                    <BracketMatchup
                      matchupLabel={getMatchupLabel(matchup, 'winners')}
                      team1={findTeam(bracketTeams, matchup.t1)}
                      team2={findTeam(bracketTeams, matchup.t2)}
                      result={resolveMatchupResult(league, matchup)}
                      highlightPending
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-8 text-sm">
                No placement games detected from bracket flow.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            Winners advance in the championship bracket. In the toilet bracket, the losing team
            advances – earning the Sacko matchup in Week {roundToWeek(maxLoserRound)}.
          </p>
          <p>
            If a matchup displays <strong>Game Data Missing</strong>, Sleeper has not yet posted
            scores for the week. Once scores are available, the brackets update automatically.
          </p>
        </div>
      </div>
    );
  },
);

OfficialBracketFlow.displayName = 'OfficialBracketFlow';
