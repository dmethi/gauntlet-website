'use client';

import { TeamStats } from '@/lib/hooks';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  BracketTeam,
  LeagueData,
  MatchupProps,
  MatchupResult,
  PlayoffBracketProps,
  PlayoffMatchup,
  Roster,
} from '@/features/playoffs/types';

const Matchup = ({
  team1,
  team2,
  matchupLabel,
  isBye = false,
  result,
  isToiletBowl = false,
}: MatchupProps) => {
  if (isBye && team1) {
    const isDangerBye = matchupLabel.includes('Forced');

    return (
      <div
        className={`flex flex-col items-center space-y-3 p-4 border-2 border-dashed rounded-lg min-w-[220px] ${
          isDangerBye
            ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            : 'bg-muted/20'
        }`}
      >
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {matchupLabel}
        </div>
        <div className="flex items-center justify-between w-full p-3 bg-background rounded-md border border-muted">
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="text-xs font-medium">
              #{team1.seed}
            </Badge>
            <span className="font-medium text-sm">{team1.name}</span>
          </div>
          <Badge variant={isDangerBye ? 'destructive' : 'outline'} className="text-xs">
            {isDangerBye ? 'FORCED IN' : 'BYE WEEK'}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-3 p-4 border rounded-lg bg-card min-w-[220px] shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {matchupLabel}
      </div>
      <div className="space-y-2 w-full">
        {team1 && (
          <div
            className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
              result?.isComplete
                ? isToiletBowl
                  ? result.winnerId !== team1.id
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' // LOSER advances in toilet
                    : 'bg-muted/50 border-muted' // WINNER is eliminated
                  : result.winnerId === team1.id
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' // WINNER advances normally
                    : 'bg-muted/50 border-muted' // LOSER is eliminated
                : 'bg-background border-muted hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs font-medium">
                #{team1.seed}
              </Badge>
              <span className="font-medium text-sm">{team1.name}</span>
              {result?.isComplete &&
                (isToiletBowl
                  ? result.winnerId !== team1.id && (
                      <Badge variant="destructive" className="text-xs">
                        ADVANCES
                      </Badge>
                    )
                  : result.winnerId === team1.id && (
                      <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                        W
                      </Badge>
                    ))}
            </div>
            <div className="flex items-center space-x-2">
              {result?.team1Score !== undefined ? (
                <span className="font-mono text-sm font-medium">
                  {result.team1Score.toFixed(1)}
                </span>
              ) : null}
              <span className="text-xs text-muted-foreground font-mono">{team1.record}</span>
            </div>
          </div>
        )}
        {team2 && (
          <div
            className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
              result?.isComplete
                ? isToiletBowl
                  ? result.winnerId !== team2.id
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' // LOSER advances in toilet
                    : 'bg-muted/50 border-muted' // WINNER is eliminated
                  : result.winnerId === team2.id
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' // WINNER advances normally
                    : 'bg-muted/50 border-muted' // LOSER is eliminated
                : 'bg-background border-muted hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs font-medium">
                #{team2.seed}
              </Badge>
              <span className="font-medium text-sm">{team2.name}</span>
              {result?.isComplete &&
                (isToiletBowl
                  ? result.winnerId !== team2.id && (
                      <Badge variant="destructive" className="text-xs">
                        ADVANCES
                      </Badge>
                    )
                  : result.winnerId === team2.id && (
                      <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                        W
                      </Badge>
                    ))}
            </div>
            <div className="flex items-center space-x-2">
              {result?.team2Score !== undefined ? (
                <span className="font-mono text-sm font-medium">
                  {result.team2Score.toFixed(1)}
                </span>
              ) : null}
              <span className="text-xs text-muted-foreground font-mono">{team2.record}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BracketColumn = ({ title, matchups }: { title: string; matchups: JSX.Element[] }) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center">
        <h4 className="font-bold text-sm text-foreground bg-muted px-3 py-2 rounded-full">
          {title}
        </h4>
      </div>
      <div className="flex flex-col space-y-4">{matchups}</div>
    </div>
  );
};

export const PlayoffBracket = ({ teams, league, playoffBracket }: PlayoffBracketProps) => {
  // Sort teams by canonical rank for seeding
  const sortedTeams = [...teams].sort((a, b) => a.canonicalRank - b.canonicalRank);

  // Create bracket teams with seeding
  const bracketTeams: BracketTeam[] = sortedTeams.map((team, index) => ({
    id: team.id,
    name: team.name,
    seed: index + 1,
    record: `${team.wins}-${team.losses}`,
  }));

  // Check if we have official playoff bracket data from Sleeper API
  const hasOfficialBracket =
    playoffBracket &&
    (playoffBracket.winners_bracket?.length || playoffBracket.losers_bracket?.length);

  // Split into upper (1-6) and lower (7-12) brackets
  const upperBracket = bracketTeams.slice(0, 6);
  const lowerBracket = bracketTeams.slice(6, 12);

  // Create playoff results lookup using league matchup data
  const getPlayoffResult = (
    rosterId1: string | number,
    rosterId2: string | number,
    week: number,
  ) => {
    if (!league?.rosters) return undefined;

    // Find the rosters for both teams
    const roster1 = league.rosters.find(r => r.id === String(rosterId1));
    const roster2 = league.rosters.find(r => r.id === String(rosterId2));

    if (!roster1 || !roster2) return undefined;

    // Find their matchups for the specified week
    const matchup1 = roster1.matchups.find(m => m.week === week);
    const matchup2 = roster2.matchups.find(m => m.week === week);

    if (!matchup1 || !matchup2) return undefined;

    // Determine winner based on points and result
    let winnerId: string;
    if (matchup1.result === 'W') {
      winnerId = String(rosterId1);
    } else if (matchup2.result === 'W') {
      winnerId = String(rosterId2);
    } else {
      // Fallback to points comparison if result is unclear
      winnerId = matchup1.points > matchup2.points ? String(rosterId1) : String(rosterId2);
    }

    return {
      team1Score: matchup1.points,
      team2Score: matchup2.points,
      winnerId,
      isComplete: true,
    };
  };

  const getByeResult = (rosterId: string | number, week: number) => {
    if (!league?.rosters) return undefined;

    const roster = league.rosters.find(r => r.id === String(rosterId));
    if (!roster) return undefined;

    const matchup = roster.matchups.find(m => m.week === week);
    return matchup
      ? {
          isComplete: true,
          isBye: true,
        }
      : undefined;
  };

  // Helper to find advancing teams
  const getAdvancingTeam = (
    rosterId1: string | number,
    rosterId2: string | number,
    week: number,
    isToiletBowl = false,
  ) => {
    const result = getPlayoffResult(rosterId1, rosterId2, week);
    if (!result) return null;

    const winnerRosterId = result.winnerId;
    const loserRosterId =
      winnerRosterId === String(rosterId1) ? String(rosterId2) : String(rosterId1);

    // In toilet bowl, loser advances
    const advancingRosterId = isToiletBowl ? loserRosterId : winnerRosterId;

    return bracketTeams.find(t => t.id === advancingRosterId) || null;
  };

  const getAdvancingTeamFromBye = (rosterId: string | number, week: number) => {
    const result = getByeResult(rosterId, week);
    return result ? bracketTeams.find(t => t.id === String(rosterId)) : null;
  };

  // Calculate all advancing teams for better organization
  const upperAdvancingTeams = {
    week15: {
      bye1: getAdvancingTeamFromBye(upperBracket[0].id, 15), // #1 bye
      bye2: getAdvancingTeamFromBye(upperBracket[1].id, 15), // #2 bye
      wc1Winner: getAdvancingTeam(upperBracket[2].id, upperBracket[5].id, 15, false), // #3 vs #6 winner
      wc2Winner: getAdvancingTeam(upperBracket[3].id, upperBracket[4].id, 15, false), // #4 vs #5 winner
      wc1Loser: getAdvancingTeam(upperBracket[2].id, upperBracket[5].id, 15, true), // #3 vs #6 loser
      wc2Loser: getAdvancingTeam(upperBracket[3].id, upperBracket[4].id, 15, true), // #4 vs #5 loser
    },
  };

  const upperAdvancingTeamsWeek16 = {
    sf1Winner:
      upperAdvancingTeams.week15.bye1 && upperAdvancingTeams.week15.wc1Winner
        ? getAdvancingTeam(
            upperAdvancingTeams.week15.bye1.id,
            upperAdvancingTeams.week15.wc1Winner.id,
            16,
            false,
          )
        : null,
    sf2Winner:
      upperAdvancingTeams.week15.bye2 && upperAdvancingTeams.week15.wc2Winner
        ? getAdvancingTeam(
            upperAdvancingTeams.week15.bye2.id,
            upperAdvancingTeams.week15.wc2Winner.id,
            16,
            false,
          )
        : null,
    sf1Loser:
      upperAdvancingTeams.week15.bye1 && upperAdvancingTeams.week15.wc1Winner
        ? getAdvancingTeam(
            upperAdvancingTeams.week15.bye1.id,
            upperAdvancingTeams.week15.wc1Winner.id,
            16,
            true,
          )
        : null,
    sf2Loser:
      upperAdvancingTeams.week15.bye2 && upperAdvancingTeams.week15.wc2Winner
        ? getAdvancingTeam(
            upperAdvancingTeams.week15.bye2.id,
            upperAdvancingTeams.week15.wc2Winner.id,
            16,
            true,
          )
        : null,
  };

  const lowerAdvancingTeams = {
    week15: {
      bye1: getAdvancingTeamFromBye(lowerBracket[5].id, 15), // #12 forced bye
      bye2: getAdvancingTeamFromBye(lowerBracket[4].id, 15), // #11 forced bye
      wc1Loser: getAdvancingTeam(lowerBracket[0].id, lowerBracket[3].id, 15, true), // #7 vs #10 loser advances
      wc2Loser: getAdvancingTeam(lowerBracket[1].id, lowerBracket[2].id, 15, true), // #8 vs #9 loser advances
      wc1Winner: getAdvancingTeam(lowerBracket[0].id, lowerBracket[3].id, 15, false), // #7 vs #10 winner (eliminated from toilet)
      wc2Winner: getAdvancingTeam(lowerBracket[1].id, lowerBracket[2].id, 15, false), // #8 vs #9 winner (eliminated from toilet)
    },
  };

  const lowerAdvancingTeamsWeek16 = {
    sf1Loser:
      lowerAdvancingTeams.week15.bye2 && lowerAdvancingTeams.week15.wc1Loser
        ? getAdvancingTeam(
            lowerAdvancingTeams.week15.bye2.id,
            lowerAdvancingTeams.week15.wc1Loser.id,
            16,
            true,
          ) // loser advances
        : null,
    sf2Loser:
      lowerAdvancingTeams.week15.bye1 && lowerAdvancingTeams.week15.wc2Loser
        ? getAdvancingTeam(
            lowerAdvancingTeams.week15.bye1.id,
            lowerAdvancingTeams.week15.wc2Loser.id,
            16,
            true,
          ) // loser advances
        : null,
  };

  // Helper to get matchup result for a specific roster and week
  const getMatchupForRoster = (rosterId: number, week: number) => {
    if (!league?.rosters) {
      return undefined;
    }

    // Try multiple ID comparison approaches for robustness
    const roster =
      league.rosters.find(r => Number(r.id) === rosterId) ||
      league.rosters.find(r => String(r.id) === String(rosterId));

    if (!roster) {
      return undefined;
    }

    return roster.matchups.find(m => m.week === week);
  };

  // Helper to find team info by roster ID
  const getTeamByRosterId = (rosterId: number) => {
    return bracketTeams.find(t => Number(t.id) === rosterId);
  };

  // Convert round number to week (this might need adjustment based on league settings)
  const roundToWeek = (round: number): number => {
    // Assuming round 1 = week 15, round 2 = week 16, round 3 = week 17
    return 14 + round;
  };

  // Helper to analyze what playoff matchup data is available in the league
  const analyzePlayoffMatchups = () => {
    if (!league?.rosters) return null;

    const playoffWeeks = [15, 16, 17]; // Typical playoff weeks
    const analysis: Record<
      number,
      { week: number; rostersWithData: number; totalRosters: number; rosterIds: number[] }
    > = {};

    playoffWeeks.forEach(week => {
      const rostersWithData = league.rosters.filter(roster =>
        roster.matchups.some(m => m.week === week),
      );

      analysis[week] = {
        week,
        rostersWithData: rostersWithData.length,
        totalRosters: league.rosters.length,
        rosterIds: rostersWithData.map(r => Number(r.id)),
      };
    });

    // Analysis completed
    return analysis;
  };

  // Enhanced Matchup component for official brackets
  const OfficialMatchup = ({
    matchup,
    bracket,
  }: {
    matchup: PlayoffMatchup;
    bracket: 'winners' | 'losers';
  }) => {
    const week = roundToWeek(matchup.r);
    const team1 = matchup.t1 && matchup.t1 > 0 ? getTeamByRosterId(matchup.t1) : null;
    const team2 = matchup.t2 && matchup.t2 > 0 ? getTeamByRosterId(matchup.t2) : null;

    // Check if this is a bye (only one team, or one team is 0)
    const isBye = !team1 || !team2 || matchup.t1 === 0 || matchup.t2 === 0;

    // Only try to get matchup data if both teams exist
    let team1Matchup = null;
    let team2Matchup = null;
    let actualGameExists = false;

    if (team1 && team2 && matchup.t1 > 0 && matchup.t2 > 0) {
      team1Matchup = getMatchupForRoster(matchup.t1, week);
      team2Matchup = getMatchupForRoster(matchup.t2, week);

      // Check if both teams have matchup data for this week
      if (team1Matchup && team2Matchup) {
        // Additional verification: check if the scores seem reasonable (not 0-0)
        // Some playoff matchups might not have been played yet
        const hasValidScores = team1Matchup.points > 0 || team2Matchup.points > 0;
        actualGameExists = hasValidScores;
      }
    }

    const hasScores = actualGameExists && team1Matchup && team2Matchup;
    const isComplete = hasScores;

    // Determine winner only if there's an actual game
    let winnerId: number | undefined;
    if (hasScores && team1Matchup && team2Matchup) {
      if (team1Matchup.result === 'W') {
        winnerId = matchup.t1;
      } else if (team2Matchup.result === 'W') {
        winnerId = matchup.t2;
      } else {
        // Fallback to points
        winnerId = team1Matchup.points > team2Matchup.points ? matchup.t1 : matchup.t2;
      }
    }

    // Handle bye weeks
    if (isBye) {
      const byeTeam = team1 || team2;
      if (!byeTeam) return null; // Invalid data

      return (
        <div className="flex flex-col items-center space-y-3 p-4 border-2 border-dashed rounded-lg bg-muted/20 min-w-[240px]">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">
            Round {matchup.r} • Week {week} • Matchup {matchup.m}
            <br />
            BYE WEEK
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between p-3 bg-background rounded-md border border-muted">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs font-medium">
                  #{byeTeam.seed}
                </Badge>
                <span className="font-medium text-sm">{byeTeam.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                BYE WEEK
              </Badge>
            </div>
          </div>
        </div>
      );
    }

    // Regular head-to-head matchup
    return (
      <div className="flex flex-col items-center space-y-3 p-4 border rounded-lg bg-card min-w-[240px] shadow-sm">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">
          Round {matchup.r} • Week {week} • Matchup {matchup.m}
          {bracket === 'losers' && ' (Loser Advances)'}
          {!hasScores && <br />}
          {!hasScores && (
            <span className="text-yellow-600 dark:text-yellow-400">
              {actualGameExists ? 'Scores Pending' : 'Game Data Missing'}
            </span>
          )}
        </div>
        <div className="space-y-2 w-full">
          {team1 && (
            <div
              className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                isComplete
                  ? bracket === 'losers'
                    ? winnerId !== matchup.t1
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' // LOSER advances in toilet
                      : 'bg-muted/50 border-muted' // WINNER eliminated
                    : winnerId === matchup.t1
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' // WINNER advances normally
                      : 'bg-muted/50 border-muted' // LOSER eliminated
                  : 'bg-background border-muted'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs font-medium">
                  #{team1.seed}
                </Badge>
                <span className="font-medium text-sm">{team1.name}</span>
                {isComplete &&
                  (bracket === 'losers'
                    ? winnerId !== matchup.t1 && (
                        <Badge variant="destructive" className="text-xs">
                          ADVANCES
                        </Badge>
                      )
                    : winnerId === matchup.t1 && (
                        <Badge
                          variant="default"
                          className="text-xs bg-green-600 hover:bg-green-700"
                        >
                          W
                        </Badge>
                      ))}
              </div>
              <div className="flex items-center space-x-2">
                {hasScores && team1Matchup ? (
                  <span className="font-mono text-sm font-medium">
                    {team1Matchup.points.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {actualGameExists ? 'TBD' : '--'}
                  </span>
                )}
                <span className="text-xs text-muted-foreground font-mono">{team1.record}</span>
              </div>
            </div>
          )}
          {team2 && (
            <div
              className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                isComplete
                  ? bracket === 'losers'
                    ? winnerId !== matchup.t2
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' // LOSER advances in toilet
                      : 'bg-muted/50 border-muted' // WINNER eliminated
                    : winnerId === matchup.t2
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' // WINNER advances normally
                      : 'bg-muted/50 border-muted' // LOSER eliminated
                  : 'bg-background border-muted'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs font-medium">
                  #{team2.seed}
                </Badge>
                <span className="font-medium text-sm">{team2.name}</span>
                {isComplete &&
                  (bracket === 'losers'
                    ? winnerId !== matchup.t2 && (
                        <Badge variant="destructive" className="text-xs">
                          ADVANCES
                        </Badge>
                      )
                    : winnerId === matchup.t2 && (
                        <Badge
                          variant="default"
                          className="text-xs bg-green-600 hover:bg-green-700"
                        >
                          W
                        </Badge>
                      ))}
              </div>
              <div className="flex items-center space-x-2">
                {hasScores && team2Matchup ? (
                  <span className="font-mono text-sm font-medium">
                    {team2Matchup.points.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {actualGameExists ? 'TBD' : '--'}
                  </span>
                )}
                <span className="text-xs text-muted-foreground font-mono">{team2.record}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Parse bracket structure to understand flow
  const parseBracketStructure = () => {
    if (!playoffBracket) return { winners: [], losers: [], placements: [] };

    const winners = playoffBracket.winners_bracket || [];
    const losers = playoffBracket.losers_bracket || [];

    // Parse bracket structure flow

    // Group by rounds for layout
    const winnersRounds = Array.from(new Set(winners.map(m => m.r))).sort();
    const losersRounds = Array.from(new Set(losers.map(m => m.r))).sort();

    // Rounds identified

    // Identify placement games by analyzing flow patterns
    const placementGames: PlayoffMatchup[] = [];

    // Look for games where teams come from specific loss patterns (3rd, 5th place games)
    [...winners, ...losers].forEach(matchup => {
      const t1FromLoss = matchup.t1_from && 'l' in matchup.t1_from;
      const t2FromLoss = matchup.t2_from && 'l' in matchup.t2_from;
      const t1FromWin = matchup.t1_from && 'w' in matchup.t1_from;
      const t2FromWin = matchup.t2_from && 'w' in matchup.t2_from;

      // Potential placement game patterns:
      // - Both teams from losses (could be 3rd place: losers of semifinals)
      // - Mixed win/loss patterns for other placement games
      const isPlacementCandidate =
        (t1FromLoss && t2FromLoss) || // Both losers
        (t1FromWin && t2FromWin) || // Both winners (unusual, could be 5th place)
        (t1FromLoss && !matchup.t2_from) || // One loser vs bye/direct seed
        (t2FromLoss && !matchup.t1_from); // One loser vs bye/direct seed

      if (isPlacementCandidate) {
        placementGames.push(matchup);
      }
    });

    return {
      winners: winnersRounds.map(round => ({
        round,
        matchups: winners.filter(m => m.r === round).sort((a, b) => a.m - b.m),
      })),
      losers: losersRounds.map(round => ({
        round,
        matchups: losers.filter(m => m.r === round).sort((a, b) => a.m - b.m),
      })),
      placements: placementGames,
    };
  };

  // If we have official bracket data, render it with scores
  if (hasOfficialBracket) {
    // Render official bracket with data

    // Analyze available playoff data
    analyzePlayoffMatchups();

    // Parse the bracket structure
    const bracketStructure = parseBracketStructure();

    // Enhanced bracket flow component
    const BracketFlow = ({
      structure,
    }: {
      structure: {
        winners: Array<{ round: number; matchups: PlayoffMatchup[] }>;
        losers: Array<{ round: number; matchups: PlayoffMatchup[] }>;
        placements: PlayoffMatchup[];
      };
    }) => {
      return (
        <div className="space-y-8">
          {/* Winners Bracket - Championship Path (Left to Right) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Winners Bracket</span>
                <Badge variant="secondary" className="text-xs">
                  Championship Path (6 Teams)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="flex justify-start space-x-12 min-w-max p-6">
                  {structure.winners.map(roundData => (
                    <div key={`winners-r${roundData.round}`} className="flex flex-col space-y-6">
                      <div className="text-center">
                        <h3 className="font-medium text-sm mb-2">Round {roundData.round}</h3>
                        <p className="text-xs text-muted-foreground">
                          Week {roundToWeek(roundData.round)}
                        </p>
                      </div>
                      <div className="space-y-8">
                        {roundData.matchups.map(matchup => (
                          <div key={matchup.m} className="relative">
                            <OfficialMatchup matchup={matchup} bracket="winners" />
                            {/* Flow arrows for winners */}
                            {roundData.round < Math.max(...structure.winners.map(r => r.round)) && (
                              <div className="absolute top-1/2 -right-6 transform -translate-y-1/2">
                                <div className="w-4 h-0.5 bg-green-400"></div>
                                <div className="w-0 h-0 border-l-4 border-l-green-400 border-t-2 border-t-transparent border-b-2 border-b-transparent absolute -right-1 -top-1"></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Losers Bracket - Toilet Bowl (Center to Right, Losers Advance) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Losers Bracket</span>
                <Badge variant="destructive" className="text-xs">
                  Toilet Bowl (8 Teams - Losers Advance)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="flex justify-center space-x-12 min-w-max p-6">
                  {structure.losers.map(roundData => (
                    <div key={`losers-r${roundData.round}`} className="flex flex-col space-y-6">
                      <div className="text-center">
                        <h3 className="font-medium text-sm mb-2">Round {roundData.round}</h3>
                        <p className="text-xs text-muted-foreground">
                          Week {roundToWeek(roundData.round)}
                        </p>
                      </div>
                      <div className="space-y-8">
                        {roundData.matchups.map(matchup => (
                          <div key={matchup.m} className="relative">
                            <OfficialMatchup matchup={matchup} bracket="losers" />
                            {/* Flow arrows for losers (losers advance right) */}
                            {roundData.round < Math.max(...structure.losers.map(r => r.round)) && (
                              <div className="absolute top-1/2 -right-6 transform -translate-y-1/2">
                                <div className="w-4 h-0.5 bg-red-400"></div>
                                <div className="w-0 h-0 border-l-4 border-l-red-400 border-t-2 border-t-transparent border-b-2 border-b-transparent absolute -right-1 -top-1"></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placement Games Islands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Placement Games</span>
                <Badge variant="outline" className="text-xs">
                  3rd, 5th Place Islands
                </Badge>
                <Badge variant="secondary" className="text-xs ml-2">
                  {structure.placements.length} Games
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {structure.placements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {structure.placements.map(matchup => (
                    <div key={`placement-${matchup.m}`} className="flex flex-col items-center">
                      <div className="text-xs text-muted-foreground mb-2 text-center">
                        <p className="font-medium">Placement Game</p>
                        <p>
                          Round {matchup.r} • Week {roundToWeek(matchup.r)}
                        </p>
                      </div>
                      <OfficialMatchup
                        matchup={matchup}
                        bracket={
                          playoffBracket?.winners_bracket?.includes(matchup) ? 'winners' : 'losers'
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <p>No placement games detected from bracket flow</p>
                  <p className="text-sm mt-2">
                    All matchups appear to be part of main championship/toilet bowl paths
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flow Analysis Debug */}
          <details className="text-sm">
            <summary className="cursor-pointer hover:text-foreground mb-2">
              🔍 Bracket Flow Analysis
            </summary>
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-medium mb-2">Winners Flow:</h4>
                    {structure.winners.map(roundData => (
                      <div key={roundData.round} className="mb-4">
                        <p className="font-medium">Round {roundData.round}:</p>
                        {roundData.matchups.map(matchup => (
                          <div key={matchup.m} className="ml-2 mb-2">
                            <p>
                              M{matchup.m}: t1={matchup.t1} (from {JSON.stringify(matchup.t1_from)})
                              vs t2={matchup.t2} (from {JSON.stringify(matchup.t2_from)})
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Losers Flow:</h4>
                    {structure.losers.map(roundData => (
                      <div key={roundData.round} className="mb-4">
                        <p className="font-medium">Round {roundData.round}:</p>
                        {roundData.matchups.map(matchup => (
                          <div key={matchup.m} className="ml-2 mb-2">
                            <p>
                              M{matchup.m}: t1={matchup.t1} (from {JSON.stringify(matchup.t1_from)})
                              vs t2={matchup.t2} (from {JSON.stringify(matchup.t2_from)})
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                {structure.placements.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Placement Games:</h4>
                    {structure.placements.map(matchup => (
                      <div key={matchup.m} className="mb-2">
                        <p>
                          M{matchup.m} R{matchup.r}: t1={matchup.t1} (from{' '}
                          {JSON.stringify(matchup.t1_from)}) vs t2={matchup.t2} (from{' '}
                          {JSON.stringify(matchup.t2_from)})
                        </p>
                        <p className="text-xs text-muted-foreground ml-2">
                          Analysis:{' '}
                          {matchup.t1_from &&
                          'l' in matchup.t1_from &&
                          matchup.t2_from &&
                          'l' in matchup.t2_from
                            ? 'Both from losses (likely 3rd place)'
                            : 'Mixed or special placement game'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </details>
        </div>
      );
    };

    return (
      <div className="space-y-8">
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                Official Bracket Data
              </Badge>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Loaded from Sleeper API - showing official playoff bracket structure with live
                scores & flow
              </span>
            </div>
          </CardContent>
        </Card>

        <BracketFlow structure={bracketStructure} />
      </div>
    );
  }

  // Fallback to reconstructed bracket system
  return (
    <div className="space-y-8">
      <Card className="bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            >
              Reconstructed Bracket
            </Badge>
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              No official bracket data available - showing estimated structure based on seeding
            </span>
          </div>
        </CardContent>
      </Card>
      {/* Upper Bracket */}
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
            <div className="flex justify-center space-x-12 min-w-max p-6">
              {/* Week 15 - Wild Card */}
              <BracketColumn
                title="Week 15 Wild Card"
                matchups={[
                  <Matchup
                    key="upper-bye-1"
                    team1={upperBracket[0]}
                    matchupLabel="Bye Week"
                    isBye
                    result={getByeResult(upperBracket[0].id, 15)}
                  />,
                  <Matchup
                    key="upper-bye-2"
                    team1={upperBracket[1]}
                    matchupLabel="Bye Week"
                    isBye
                    result={getByeResult(Number(upperBracket[1].id), 15)}
                  />,
                  <Matchup
                    key="upper-wc-1"
                    team1={upperBracket[2]}
                    team2={upperBracket[5]}
                    matchupLabel="#3 vs #6"
                    result={getPlayoffResult(
                      Number(upperBracket[2].id),
                      Number(upperBracket[5].id),
                      15,
                    )}
                  />,
                  <Matchup
                    key="upper-wc-2"
                    team1={upperBracket[3]}
                    team2={upperBracket[4]}
                    matchupLabel="#4 vs #5"
                    result={getPlayoffResult(
                      Number(upperBracket[3].id),
                      Number(upperBracket[4].id),
                      15,
                    )}
                  />,
                ]}
              />

              {/* Week 16 - Semifinals */}
              <BracketColumn
                title="Week 16 Semifinals"
                matchups={[
                  <Matchup
                    key="upper-sf-1"
                    team1={upperAdvancingTeams.week15.bye1 || undefined}
                    team2={upperAdvancingTeams.week15.wc1Winner || undefined}
                    matchupLabel="Semifinal 1"
                    result={
                      upperAdvancingTeams.week15.bye1 && upperAdvancingTeams.week15.wc1Winner
                        ? getPlayoffResult(
                            Number(upperAdvancingTeams.week15.bye1.id),
                            Number(upperAdvancingTeams.week15.wc1Winner.id),
                            16,
                          )
                        : undefined
                    }
                  />,
                  <Matchup
                    key="upper-sf-2"
                    team1={upperAdvancingTeams.week15.bye2 || undefined}
                    team2={upperAdvancingTeams.week15.wc2Winner || undefined}
                    matchupLabel="Semifinal 2"
                    result={
                      upperAdvancingTeams.week15.bye2 && upperAdvancingTeams.week15.wc2Winner
                        ? getPlayoffResult(
                            Number(upperAdvancingTeams.week15.bye2.id),
                            Number(upperAdvancingTeams.week15.wc2Winner.id),
                            16,
                          )
                        : undefined
                    }
                  />,
                ]}
              />

              {/* Week 17 - Championship */}
              <BracketColumn
                title="Week 17 Championship"
                matchups={[
                  <Matchup
                    key="upper-final"
                    team1={upperAdvancingTeamsWeek16.sf1Winner || undefined}
                    team2={upperAdvancingTeamsWeek16.sf2Winner || undefined}
                    matchupLabel="Championship Final"
                    result={
                      upperAdvancingTeamsWeek16.sf1Winner && upperAdvancingTeamsWeek16.sf2Winner
                        ? getPlayoffResult(
                            Number(upperAdvancingTeamsWeek16.sf1Winner.id),
                            Number(upperAdvancingTeamsWeek16.sf2Winner.id),
                            17,
                          )
                        : undefined
                    }
                  />,
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lower Bracket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Lower Bracket</span>
            <Badge variant="destructive" className="text-xs">
              Toilet Bowl (Losers Advance)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex justify-center space-x-12 min-w-max p-6">
              {/* Week 15 - Wild Card */}
              <BracketColumn
                title="Week 15 Toilet Wild Card"
                matchups={[
                  <Matchup
                    key="lower-bye-1"
                    team1={lowerBracket[5]}
                    matchupLabel="Forced Bye (Auto-Advance)"
                    isBye
                    result={getByeResult(Number(lowerBracket[5].id), 15)}
                  />,
                  <Matchup
                    key="lower-bye-2"
                    team1={lowerBracket[4]}
                    matchupLabel="Forced Bye (Auto-Advance)"
                    isBye
                    result={getByeResult(Number(lowerBracket[4].id), 15)}
                  />,
                  <Matchup
                    key="lower-wc-1"
                    team1={lowerBracket[0]}
                    team2={lowerBracket[3]}
                    matchupLabel="#7 vs #10 (Loser Advances)"
                    result={getPlayoffResult(
                      Number(lowerBracket[0].id),
                      Number(lowerBracket[3].id),
                      15,
                    )}
                    isToiletBowl={true}
                  />,
                  <Matchup
                    key="lower-wc-2"
                    team1={lowerBracket[1]}
                    team2={lowerBracket[2]}
                    matchupLabel="#8 vs #9 (Loser Advances)"
                    result={getPlayoffResult(
                      Number(lowerBracket[1].id),
                      Number(lowerBracket[2].id),
                      15,
                    )}
                    isToiletBowl={true}
                  />,
                ]}
              />

              {/* Week 16 - Semifinals */}
              <BracketColumn
                title="Week 16 Toilet Semifinals"
                matchups={[
                  <Matchup
                    key="lower-sf-1"
                    team1={lowerAdvancingTeams.week15.bye2 || undefined} // #11 forced bye
                    team2={lowerAdvancingTeams.week15.wc1Loser || undefined} // LOSER from #7 vs #10
                    matchupLabel="Toilet Semifinal 1 (Loser Advances)"
                    result={
                      lowerAdvancingTeams.week15.bye2 && lowerAdvancingTeams.week15.wc1Loser
                        ? getPlayoffResult(
                            Number(lowerAdvancingTeams.week15.bye2.id),
                            Number(lowerAdvancingTeams.week15.wc1Loser.id),
                            16,
                          )
                        : undefined
                    }
                    isToiletBowl={true}
                  />,
                  <Matchup
                    key="lower-sf-2"
                    team1={lowerAdvancingTeams.week15.bye1 || undefined} // #12 forced bye
                    team2={lowerAdvancingTeams.week15.wc2Loser || undefined} // LOSER from #8 vs #9
                    matchupLabel="Toilet Semifinal 2 (Loser Advances)"
                    result={
                      lowerAdvancingTeams.week15.bye1 && lowerAdvancingTeams.week15.wc2Loser
                        ? getPlayoffResult(
                            Number(lowerAdvancingTeams.week15.bye1.id),
                            Number(lowerAdvancingTeams.week15.wc2Loser.id),
                            16,
                          )
                        : undefined
                    }
                    isToiletBowl={true}
                  />,
                ]}
              />

              {/* Week 17 - Championship */}
              <BracketColumn
                title="Week 17 Toilet Bowl"
                matchups={[
                  <Matchup
                    key="lower-final"
                    team1={lowerAdvancingTeamsWeek16.sf1Loser || undefined}
                    team2={lowerAdvancingTeamsWeek16.sf2Loser || undefined}
                    matchupLabel="Sacko Championship (Last Place Game)"
                    result={
                      lowerAdvancingTeamsWeek16.sf1Loser && lowerAdvancingTeamsWeek16.sf2Loser
                        ? getPlayoffResult(
                            Number(lowerAdvancingTeamsWeek16.sf1Loser.id),
                            Number(lowerAdvancingTeamsWeek16.sf2Loser.id),
                            17,
                          )
                        : undefined
                    }
                    isToiletBowl={true}
                  />,
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placement Games */}
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
              {/* 3rd/4th Place Game */}
              <BracketColumn
                title="3rd/4th Place"
                matchups={[
                  <Matchup
                    key="3rd-4th-place"
                    team1={upperAdvancingTeamsWeek16.sf1Loser || undefined}
                    team2={upperAdvancingTeamsWeek16.sf2Loser || undefined}
                    matchupLabel="Bronze Medal Game"
                    result={
                      upperAdvancingTeamsWeek16.sf1Loser && upperAdvancingTeamsWeek16.sf2Loser
                        ? getPlayoffResult(
                            Number(upperAdvancingTeamsWeek16.sf1Loser.id),
                            Number(upperAdvancingTeamsWeek16.sf2Loser.id),
                            17,
                          )
                        : undefined
                    }
                  />,
                ]}
              />

              {/* 5th/6th Place Game */}
              <BracketColumn
                title="5th/6th Place"
                matchups={[
                  <Matchup
                    key="5th-6th-place"
                    team1={upperAdvancingTeams.week15.wc1Loser || undefined}
                    team2={upperAdvancingTeams.week15.wc2Loser || undefined}
                    matchupLabel="Middle Tier Final"
                    result={
                      upperAdvancingTeams.week15.wc1Loser && upperAdvancingTeams.week15.wc2Loser
                        ? getPlayoffResult(
                            Number(upperAdvancingTeams.week15.wc1Loser.id),
                            Number(upperAdvancingTeams.week15.wc2Loser.id),
                            17,
                          )
                        : undefined
                    }
                  />,
                ]}
              />

              {/* 9th/10th Place Game */}
              <BracketColumn
                title="9th/10th Place"
                matchups={[
                  <Matchup
                    key="9th-10th-place"
                    team1={lowerAdvancingTeams.week15.wc1Winner || undefined} // Winner of #7 vs #10 (eliminated from toilet)
                    team2={lowerAdvancingTeams.week15.wc2Winner || undefined} // Winner of #8 vs #9 (eliminated from toilet)
                    matchupLabel="Avoided Sacko Game"
                    result={
                      lowerAdvancingTeams.week15.wc1Winner && lowerAdvancingTeams.week15.wc2Winner
                        ? getPlayoffResult(
                            Number(lowerAdvancingTeams.week15.wc1Winner.id),
                            Number(lowerAdvancingTeams.week15.wc2Winner.id),
                            17,
                          )
                        : undefined
                    }
                  />,
                ]}
              />

              {/* 7th/8th Place Game */}
              <BracketColumn
                title="7th/8th Place"
                matchups={[
                  <Matchup
                    key="7th-8th-place"
                    team1={
                      (() => {
                        // Winners of toilet semifinals (eliminated from advancing to Sacko)
                        if (
                          lowerAdvancingTeams.week15.bye2 &&
                          lowerAdvancingTeams.week15.wc1Loser
                        ) {
                          const sf1Result = getPlayoffResult(
                            Number(lowerAdvancingTeams.week15.bye2.id),
                            Number(lowerAdvancingTeams.week15.wc1Loser.id),
                            16,
                          );
                          if (sf1Result) {
                            const winnerId = Number(sf1Result.winnerId);
                            return bracketTeams.find(t => Number(t.id) === winnerId);
                          }
                        }
                        return null;
                      })() || undefined
                    }
                    team2={
                      (() => {
                        // Winners of toilet semifinals (eliminated from advancing to Sacko)
                        if (
                          lowerAdvancingTeams.week15.bye1 &&
                          lowerAdvancingTeams.week15.wc2Loser
                        ) {
                          const sf2Result = getPlayoffResult(
                            Number(lowerAdvancingTeams.week15.bye1.id),
                            Number(lowerAdvancingTeams.week15.wc2Loser.id),
                            16,
                          );
                          if (sf2Result) {
                            const winnerId = Number(sf2Result.winnerId);
                            return bracketTeams.find(t => Number(t.id) === winnerId);
                          }
                        }
                        return null;
                      })() || undefined
                    }
                    matchupLabel="Toilet Escape Game"
                    result={(() => {
                      const team1Data =
                        lowerAdvancingTeams.week15.bye2 && lowerAdvancingTeams.week15.wc1Loser
                          ? getPlayoffResult(
                              Number(lowerAdvancingTeams.week15.bye2.id),
                              Number(lowerAdvancingTeams.week15.wc1Loser.id),
                              16,
                            )
                          : null;
                      const team2Data =
                        lowerAdvancingTeams.week15.bye1 && lowerAdvancingTeams.week15.wc2Loser
                          ? getPlayoffResult(
                              Number(lowerAdvancingTeams.week15.bye1.id),
                              Number(lowerAdvancingTeams.week15.wc2Loser.id),
                              16,
                            )
                          : null;

                      if (team1Data && team2Data) {
                        const team1Winner = Number(team1Data.winnerId);
                        const team2Winner = Number(team2Data.winnerId);
                        return getPlayoffResult(team1Winner, team2Winner, 17);
                      }
                      return undefined;
                    })()}
                  />,
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playoffs Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-card-foreground mb-2">Bracket Format:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• All 12 teams make playoffs</li>
                  <li>• Top 6 teams → Upper Bracket (Winners Championship)</li>
                  <li>• Bottom 6 teams → Lower Bracket (Toilet Bowl)</li>
                  <li>• Multiple placement games determine final 1-12 rankings</li>
                  <li>• Weeks 15-17 determine all positions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-card-foreground mb-2">Special Rules:</h4>
                <ul className="space-y-1 text-xs">
                  <li>
                    • <strong>Upper Bracket:</strong> Winners advance (normal)
                  </li>
                  <li>
                    • <strong>Lower Bracket:</strong> LOSERS advance (toilet bowl)
                  </li>
                  <li>• Lower bracket determines last place (Sacko winner)</li>
                  <li>• Placement games for 3rd/4th, 5th/6th, 7th/8th, 9th/10th</li>
                  <li>• All 12 positions determined by playoff results</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
