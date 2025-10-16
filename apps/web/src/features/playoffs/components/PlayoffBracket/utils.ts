import type {
  BracketTeam,
  LeagueData,
  MatchupResult,
  PlayoffBracket,
  PlayoffMatchup,
} from '@/features/playoffs/types';
import type { TeamStats } from '@/lib/hooks';

const PLAYOFF_START_WEEK = 15;

export const buildBracketTeams = (teams: TeamStats[]): BracketTeam[] =>
  [...teams]
    .sort((a, b) => a.canonicalRank - b.canonicalRank)
    .map((team, index) => ({
      id: team.id,
      name: team.name,
      seed: index + 1,
      record: `${team.wins}-${team.losses}`,
      points: team.totalPoints,
    }));

export const roundToWeek = (round: number): number => PLAYOFF_START_WEEK - 1 + round;

export const getMatchupResult = (
  league: LeagueData | undefined,
  rosterId1: string | number,
  rosterId2: string | number,
  week: number,
): MatchupResult | undefined => {
  if (!league?.rosters) return undefined;

  const findRoster = (id: string | number) =>
    league.rosters.find(r => r.id === String(id) || Number(r.id) === Number(id));

  const roster1 = findRoster(rosterId1);
  const roster2 = findRoster(rosterId2);

  if (!roster1 || !roster2) return undefined;

  const matchup1 = roster1.matchups.find(m => m.week === week);
  const matchup2 = roster2.matchups.find(m => m.week === week);

  if (!matchup1 || !matchup2) return undefined;

  const winnerId =
    matchup1.result === 'W'
      ? String(rosterId1)
      : matchup2.result === 'W'
        ? String(rosterId2)
        : matchup1.points > matchup2.points
          ? String(rosterId1)
          : String(rosterId2);

  return {
    team1Score: matchup1.points,
    team2Score: matchup2.points,
    winnerId,
    isComplete: matchup1.points > 0 || matchup2.points > 0,
  };
};

export const hasMatchupData = (
  league: LeagueData | undefined,
  rosterId: string | number,
  week: number,
): boolean => {
  if (!league?.rosters) return false;
  const roster =
    league.rosters.find(r => r.id === String(rosterId)) ||
    league.rosters.find(r => Number(r.id) === Number(rosterId));
  return roster ? roster.matchups.some(m => m.week === week) : false;
};

export const getAdvancingTeam = (
  league: LeagueData | undefined,
  bracketTeams: BracketTeam[],
  rosterId1: string | number,
  rosterId2: string | number,
  week: number,
  isToiletBowl = false,
): BracketTeam | null => {
  const result = getMatchupResult(league, rosterId1, rosterId2, week);
  if (!result?.winnerId) return null;

  const winnerRosterId = result.winnerId;
  const loserRosterId =
    winnerRosterId === String(rosterId1) ? String(rosterId2) : String(rosterId1);
  const advancingRosterId = isToiletBowl ? loserRosterId : winnerRosterId;

  return bracketTeams.find(team => team.id === advancingRosterId) || null;
};

export const getAdvancingTeamFromBye = (
  league: LeagueData | undefined,
  bracketTeams: BracketTeam[],
  rosterId: string | number,
  week: number,
): BracketTeam | null => {
  return hasMatchupData(league, rosterId, week)
    ? bracketTeams.find(team => team.id === String(rosterId)) || null
    : null;
};

export interface ParsedBracketStructure {
  winners: Array<{ round: number; matchups: PlayoffMatchup[] }>;
  losers: Array<{ round: number; matchups: PlayoffMatchup[] }>;
  placements: PlayoffMatchup[];
}

export const parseBracketStructure = (playoffBracket?: PlayoffBracket): ParsedBracketStructure => {
  if (!playoffBracket) {
    return { winners: [], losers: [], placements: [] };
  }

  const winners = playoffBracket.winners_bracket ?? [];
  const losers = playoffBracket.losers_bracket ?? [];

  const rounds = (matchups: PlayoffMatchup[]) =>
    Array.from(new Set(matchups.map(m => m.r))).sort((a, b) => a - b);

  const buildRound = (matchups: PlayoffMatchup[], round: number) =>
    matchups.filter(m => m.r === round).sort((a, b) => a.m - b.m);

  const placementGames: PlayoffMatchup[] = [];
  [...winners, ...losers].forEach(matchup => {
    const fromLoss = (slot?: { l: number }) => !!slot && 'l' in slot;
    const fromWin = (slot?: { w: number }) => !!slot && 'w' in slot;
    const candidate =
      (fromLoss(matchup.t1_from as { l: number }) && fromLoss(matchup.t2_from as { l: number })) ||
      (fromWin(matchup.t1_from as { w: number }) && fromWin(matchup.t2_from as { w: number })) ||
      (fromLoss(matchup.t1_from as { l: number }) && !matchup.t2_from) ||
      (fromLoss(matchup.t2_from as { l: number }) && !matchup.t1_from);
    if (candidate) {
      placementGames.push(matchup);
    }
  });

  return {
    winners: rounds(winners).map(round => ({
      round,
      matchups: buildRound(winners, round),
    })),
    losers: rounds(losers).map(round => ({
      round,
      matchups: buildRound(losers, round),
    })),
    placements: placementGames,
  };
};
