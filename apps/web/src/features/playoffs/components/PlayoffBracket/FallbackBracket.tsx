'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BracketTeam, LeagueData } from '@/features/playoffs/types';
import { BracketMatchup } from './BracketMatchup';
import { BracketRound } from './BracketRound';
import { getAdvancingTeam, getAdvancingTeamFromBye, getMatchupResult, roundToWeek } from './utils';

interface FallbackBracketProps {
  bracketTeams: BracketTeam[];
  league?: LeagueData;
}

const buildUpperBracket = (bracketTeams: BracketTeam[], league: LeagueData | undefined) => {
  const upper = bracketTeams.slice(0, 6);

  if (upper.length < 6) {
    return {
      week15: {
        bye1: null,
        bye2: null,
        wc1Winner: null,
        wc2Winner: null,
        wc1Loser: null,
        wc2Loser: null,
      },
      week16: {
        sf1Winner: null,
        sf2Winner: null,
        sf1Loser: null,
        sf2Loser: null,
      },
      teams: upper,
    };
  }

  const week15 = {
    bye1: getAdvancingTeamFromBye(league, bracketTeams, upper[0].id, 15),
    bye2: getAdvancingTeamFromBye(league, bracketTeams, upper[1].id, 15),
    wc1Winner: getAdvancingTeam(league, bracketTeams, upper[2].id, upper[5].id, 15, false),
    wc2Winner: getAdvancingTeam(league, bracketTeams, upper[3].id, upper[4].id, 15, false),
    wc1Loser: getAdvancingTeam(league, bracketTeams, upper[2].id, upper[5].id, 15, true),
    wc2Loser: getAdvancingTeam(league, bracketTeams, upper[3].id, upper[4].id, 15, true),
  };

  const week16 = {
    sf1Winner:
      week15.bye1 && week15.wc1Winner
        ? getAdvancingTeam(league, bracketTeams, week15.bye1.id, week15.wc1Winner.id, 16, false)
        : null,
    sf2Winner:
      week15.bye2 && week15.wc2Winner
        ? getAdvancingTeam(league, bracketTeams, week15.bye2.id, week15.wc2Winner.id, 16, false)
        : null,
    sf1Loser:
      week15.bye1 && week15.wc1Winner
        ? getAdvancingTeam(league, bracketTeams, week15.bye1.id, week15.wc1Winner.id, 16, true)
        : null,
    sf2Loser:
      week15.bye2 && week15.wc2Winner
        ? getAdvancingTeam(league, bracketTeams, week15.bye2.id, week15.wc2Winner.id, 16, true)
        : null,
  };

  return { week15, week16, teams: upper };
};

const buildLowerBracket = (bracketTeams: BracketTeam[], league: LeagueData | undefined) => {
  const lower = bracketTeams.slice(6, 12);

  if (lower.length < 6) {
    return {
      week15: {
        bye1: null,
        bye2: null,
        wc1Loser: null,
        wc2Loser: null,
        wc1Winner: null,
        wc2Winner: null,
      },
      week16: {
        sf1Loser: null,
        sf2Loser: null,
      },
      teams: lower,
    };
  }

  const week15 = {
    bye1: getAdvancingTeamFromBye(league, bracketTeams, lower[5].id, 15),
    bye2: getAdvancingTeamFromBye(league, bracketTeams, lower[4].id, 15),
    wc1Loser: getAdvancingTeam(league, bracketTeams, lower[0].id, lower[3].id, 15, true),
    wc2Loser: getAdvancingTeam(league, bracketTeams, lower[1].id, lower[2].id, 15, true),
    wc1Winner: getAdvancingTeam(league, bracketTeams, lower[0].id, lower[3].id, 15, false),
    wc2Winner: getAdvancingTeam(league, bracketTeams, lower[1].id, lower[2].id, 15, false),
  };

  const week16 = {
    sf1Loser:
      week15.bye2 && week15.wc1Loser
        ? getAdvancingTeam(league, bracketTeams, week15.bye2.id, week15.wc1Loser.id, 16, true)
        : null,
    sf2Loser:
      week15.bye1 && week15.wc2Loser
        ? getAdvancingTeam(league, bracketTeams, week15.bye1.id, week15.wc2Loser.id, 16, true)
        : null,
  };

  return { week15, week16, teams: lower };
};

export const FallbackBracket = memo<FallbackBracketProps>(({ bracketTeams, league }) => {
  const upper = buildUpperBracket(bracketTeams, league);
  const lower = buildLowerBracket(bracketTeams, league);

  if (upper.teams.length < 6 || lower.teams.length < 6) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Bracket Preview</span>
            <Badge variant="outline" className="text-xs">
              Insufficient Data
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Not enough teams to render the full playoff bracket.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Upper Bracket</span>
            <Badge variant="secondary" className="text-xs">
              Winners Championship
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex justify-center space-x-8 min-w-max p-6">
              <BracketRound title="Week 15 Quarterfinals" subtitle="Wildcard Weekend">
                <BracketMatchup
                  matchupLabel="Wildcard 1"
                  team1={upper.teams[2]}
                  team2={upper.teams[5]}
                  result={getMatchupResult(league, upper.teams[2].id, upper.teams[5].id, 15)}
                />
                <BracketMatchup
                  matchupLabel="Wildcard 2"
                  team1={upper.teams[3]}
                  team2={upper.teams[4]}
                  result={getMatchupResult(league, upper.teams[3].id, upper.teams[4].id, 15)}
                />
              </BracketRound>

              <BracketRound title="Week 16 Semifinals" subtitle="Top Seeds Enter">
                <BracketMatchup
                  matchupLabel="Semifinal 1"
                  team1={upper.week15.bye1 || undefined}
                  team2={upper.week15.wc1Winner || undefined}
                  result={
                    upper.week15.bye1 && upper.week15.wc1Winner
                      ? getMatchupResult(
                          league,
                          upper.week15.bye1.id,
                          upper.week15.wc1Winner.id,
                          16,
                        )
                      : undefined
                  }
                />
                <BracketMatchup
                  matchupLabel="Semifinal 2"
                  team1={upper.week15.bye2 || undefined}
                  team2={upper.week15.wc2Winner || undefined}
                  result={
                    upper.week15.bye2 && upper.week15.wc2Winner
                      ? getMatchupResult(
                          league,
                          upper.week15.bye2.id,
                          upper.week15.wc2Winner.id,
                          16,
                        )
                      : undefined
                  }
                />
              </BracketRound>

              <BracketRound title="Week 17 Championship" subtitle="League Title Game">
                <BracketMatchup
                  matchupLabel="Championship"
                  team1={upper.week16.sf1Winner || undefined}
                  team2={upper.week16.sf2Winner || undefined}
                  result={
                    upper.week16.sf1Winner && upper.week16.sf2Winner
                      ? getMatchupResult(
                          league,
                          upper.week16.sf1Winner.id,
                          upper.week16.sf2Winner.id,
                          17,
                        )
                      : undefined
                  }
                />
              </BracketRound>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Lower Bracket</span>
            <Badge variant="destructive" className="text-xs">
              Toilet Bowl – Losers Advance
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex justify-center space-x-8 min-w-max p-6">
              <BracketRound title="Week 15 Toilet Quarterfinals" subtitle="Losers Move On">
                <BracketMatchup
                  matchupLabel="Toilet Wildcard 1"
                  team1={lower.teams[0]}
                  team2={lower.teams[3]}
                  result={getMatchupResult(league, lower.teams[0].id, lower.teams[3].id, 15)}
                  isToiletBowl
                />
                <BracketMatchup
                  matchupLabel="Toilet Wildcard 2"
                  team1={lower.teams[1]}
                  team2={lower.teams[2]}
                  result={getMatchupResult(league, lower.teams[1].id, lower.teams[2].id, 15)}
                  isToiletBowl
                />
              </BracketRound>

              <BracketRound title="Week 15 Byes" subtitle="Forced Sacko Spots">
                <BracketMatchup
                  matchupLabel="Forced Bye #11"
                  team1={lower.teams[4]}
                  isBye
                  isToiletBowl
                />
                <BracketMatchup
                  matchupLabel="Forced Bye #12"
                  team1={lower.teams[5]}
                  isBye
                  isToiletBowl
                />
              </BracketRound>

              <BracketRound title="Week 16 Toilet Semifinals" subtitle="Losers Keep Advancing">
                <BracketMatchup
                  matchupLabel="Toilet Semifinal 1"
                  team1={lower.week15.bye2 || undefined}
                  team2={lower.week15.wc1Loser || undefined}
                  result={
                    lower.week15.bye2 && lower.week15.wc1Loser
                      ? getMatchupResult(league, lower.week15.bye2.id, lower.week15.wc1Loser.id, 16)
                      : undefined
                  }
                  isToiletBowl
                />
                <BracketMatchup
                  matchupLabel="Toilet Semifinal 2"
                  team1={lower.week15.bye1 || undefined}
                  team2={lower.week15.wc2Loser || undefined}
                  result={
                    lower.week15.bye1 && lower.week15.wc2Loser
                      ? getMatchupResult(league, lower.week15.bye1.id, lower.week15.wc2Loser.id, 16)
                      : undefined
                  }
                  isToiletBowl
                />
              </BracketRound>

              <BracketRound title="Week 17 Sacko Championship" subtitle="Last Place Game">
                <BracketMatchup
                  matchupLabel="Sacko Showdown"
                  team1={lower.week16.sf1Loser || undefined}
                  team2={lower.week16.sf2Loser || undefined}
                  result={
                    lower.week16.sf1Loser && lower.week16.sf2Loser
                      ? getMatchupResult(
                          league,
                          lower.week16.sf1Loser.id,
                          lower.week16.sf2Loser.id,
                          17,
                        )
                      : undefined
                  }
                  isToiletBowl
                />
              </BracketRound>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Placement Games</span>
            <Badge variant="outline" className="text-xs">
              Final Rankings
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex justify-center space-x-8 min-w-max p-6">
              <BracketRound title="3rd / 4th Place" subtitle="Bronze Medal">
                <BracketMatchup
                  matchupLabel="Bronze Medal Game"
                  team1={upper.week16.sf1Loser || undefined}
                  team2={upper.week16.sf2Loser || undefined}
                  result={
                    upper.week16.sf1Loser && upper.week16.sf2Loser
                      ? getMatchupResult(
                          league,
                          upper.week16.sf1Loser.id,
                          upper.week16.sf2Loser.id,
                          17,
                        )
                      : undefined
                  }
                />
              </BracketRound>

              <BracketRound title="5th / 6th Place" subtitle="Middle Tier Final">
                <BracketMatchup
                  matchupLabel="5th Place Game"
                  team1={upper.week15.wc1Loser || undefined}
                  team2={upper.week15.wc2Loser || undefined}
                  result={
                    upper.week15.wc1Loser && upper.week15.wc2Loser
                      ? getMatchupResult(
                          league,
                          upper.week15.wc1Loser.id,
                          upper.week15.wc2Loser.id,
                          17,
                        )
                      : undefined
                  }
                />
              </BracketRound>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
});

FallbackBracket.displayName = 'FallbackBracket';
