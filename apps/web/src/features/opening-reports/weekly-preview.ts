import type { DraftPickReport, DraftReport, DraftTeamGrade } from './draft-report';
import type { OpeningSlateRaces, RaceCandidate } from './slate-simulation';

export interface PreviewWindow {
  id: string;
  label: string;
  startsAt: string;
  games: Array<{
    away: string;
    awayName: string;
    home: string;
    homeName: string;
  }>;
}

export interface PreviewTeam {
  teamId: string;
  rosterId: number;
  ownerId: string;
  teamName: string;
  managerName: string;
  avatarUrl: string | null;
  projection: number;
  p10: number;
  p50: number;
  p90: number;
  winProbability: number;
  moneyline: string;
  draftGrade: string;
  draftScore: number;
  bestDraftValue: Pick<
    DraftPickReport,
    'playerName' | 'price' | 'benchmarkValue' | 'valueDelta'
  > | null;
  carriers: Array<{
    playerId: string;
    playerName: string;
    nflTeam: string | null;
    projection: number;
    windowId: string | null;
  }>;
  modeledAtZero: {
    openStarterSlots: number;
    unresolvedPlayers: string[];
    zeroProjectionPlayers: string[];
  };
  scoringCurve: Array<{
    windowId: string;
    label: string;
    projectedPoints: number;
  }>;
}

export interface PreviewMatchup {
  matchupId: number;
  matchupKey: string;
  teamA: PreviewTeam;
  teamB: PreviewTeam;
  spread: number;
  total: number;
}

export interface LeaguePreview {
  leagueId: string;
  leagueName: string;
  logo?: string;
  races: OpeningSlateRaces;
  matchups: PreviewMatchup[];
}

export interface WeeklyPreviewReport {
  metadata: {
    season: 2026;
    week: 1;
    generatedAt: string;
    lineupsAsOf: string;
    projectionsAsOf: string;
    firstKickoffAt: string;
    simulation: {
      engine: string;
      iterations: number;
      seed: number;
      projectionSource: string;
      varianceSource: string;
    };
  };
  schedule: PreviewWindow[];
  gauntletWideRaces: OpeningSlateRaces;
  leagues: LeaguePreview[];
}

export const raceLabels: Record<keyof OpeningSlateRaces, string> = {
  highestScore: 'Highest score',
  lowestScore: 'Lowest score',
  closestMatchup: 'Closest matchup',
  biggestBlowout: 'Biggest blowout',
  highestMatchupTotal: 'Highest matchup total',
  lowestMatchupTotal: 'Lowest matchup total',
};

export const buildScoringCurve = ({
  schedule,
  players,
}: {
  schedule: PreviewWindow[];
  players: Array<{ projection: number; windowId: string | null }>;
}): PreviewTeam['scoringCurve'] => {
  let cumulative = 0;
  const curve: PreviewTeam['scoringCurve'] = [
    { windowId: 'kickoff', label: 'Kickoff', projectedPoints: 0 },
  ];
  schedule.forEach(window => {
    cumulative += players
      .filter(player => player.windowId === window.id)
      .reduce((sum, player) => sum + player.projection, 0);
    curve.push({
      windowId: window.id,
      label: window.label,
      projectedPoints: Math.round(cumulative * 10) / 10,
    });
  });
  const tbdProjection = players
    .filter(player => player.windowId === null)
    .reduce((sum, player) => sum + player.projection, 0);
  if (tbdProjection > 0) {
    cumulative += tbdProjection;
    curve.push({
      windowId: 'tbd',
      label: 'TBD',
      projectedPoints: Math.round(cumulative * 10) / 10,
    });
  }
  return curve;
};

export const findDraftTeam = (
  draftReport: DraftReport,
  leagueId: string,
  rosterId: number,
): DraftTeamGrade => {
  const team = draftReport.teamGrades.find(
    candidate => candidate.leagueId === leagueId && candidate.rosterId === rosterId,
  );
  if (!team) throw new Error(`Missing draft context for ${leagueId}:${rosterId}`);
  return team;
};

export const topRaceCandidates = (race: RaceCandidate[], limit = 5): RaceCandidate[] =>
  race.slice(0, limit);
