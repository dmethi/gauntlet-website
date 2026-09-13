import { type NextRequest, NextResponse } from 'next/server';
import { getMatchupsByWeek, getRostersByLeague, getUsersByLeague } from '@/lib/api-replacements';
import { getCurrentLeagues } from '@/config/leagues';
import { getDriveFFLiveOdds, getTeamScoreDistribution } from '@/lib/driveff-live-odds';
import type { LeagueWideOddsType, MatchupOdds, TeamOdds } from '@/features/matchups/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface LiveTeam {
  rosterId: number;
  matchupId: number;
  teamName: string;
  leagueId: string;
  leagueName: string;
  currentScore: number;
  mean: number;
  p10: number;
  p50: number;
  p90: number;
}

const probToAmerican = (probability: number): string => {
  if (probability <= 0) return '+∞';
  if (probability >= 1) return '-∞';
  if (probability >= 0.5) return `${Math.round(-(probability / (1 - probability)) * 100)}`;
  return `+${Math.round(((1 - probability) / probability) * 100)}`;
};

const probToColor = (probability: number, reverse = false): string => {
  let p = Math.max(0, Math.min(1, probability));
  if (reverse) p = 1 - p;
  if (p < 0.33) return `rgb(255, ${Math.round(255 * (p / 0.33))}, 0)`;
  if (p < 0.66) {
    const ratio = (p - 0.33) / 0.33;
    return `rgb(${Math.round(255 * (1 - ratio))}, 255, 0)`;
  }
  const ratio = (p - 0.66) / 0.34;
  return `rgb(0, 255, ${Math.round(128 * ratio)})`;
};

const sampleScore = (team: LiveTeam): number => {
  const standardDeviation = Math.max(0, (team.p90 - team.p10) / (2 * 1.2815515655446004));
  const u1 = Math.max(Number.EPSILON, Math.random());
  const u2 = Math.random();
  const standardNormal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(team.currentScore, team.mean + standardNormal * standardDeviation);
};

const teamNameFromOwner = (
  owner: { username?: string; displayName?: string; metadata?: unknown } | undefined,
  rosterId: number,
): string => {
  const metadata =
    owner?.metadata && typeof owner.metadata === 'object'
      ? (owner.metadata as Record<string, unknown>)
      : null;
  const metadataName = typeof metadata?.team_name === 'string' ? metadata.team_name : null;
  return metadataName || owner?.displayName || owner?.username || `Team ${rosterId}`;
};

const emptyPayload = (week: number): LeagueWideOddsType => ({
  week,
  highestScorer: [],
  lowestScorer: [],
  closestMatchup: [],
  biggestBlowout: [],
  highestScoringMatchup: [],
  lowestScoringMatchup: [],
  lastUpdated: new Date().toISOString(),
  source: 'driveff',
});

export const GET = async (_req: NextRequest, props: { params: Promise<{ week: string }> }) => {
  const { week: weekParam } = await props.params;
  const week = Number.parseInt(weekParam, 10);
  if (!Number.isFinite(week) || week < 1 || week > 18) {
    return NextResponse.json({ error: 'Invalid week' }, { status: 400 });
  }

  try {
    const leagueResults = await Promise.all(
      getCurrentLeagues().map(async leagueConfig => {
        const [rosters, users, matchups] = await Promise.all([
          getRostersByLeague(leagueConfig.id),
          getUsersByLeague(leagueConfig.id),
          getMatchupsByWeek(leagueConfig.id, week),
        ]);
        const usersById = new Map(users.map(user => [user.id, user]));
        const ownersByRosterId = new Map(
          rosters.map(roster => [roster.rosterId, usersById.get(roster.ownerId)]),
        );
        const matchupIds = [
          ...new Set(
            matchups
              .map(matchup => matchup.matchupId)
              .filter((matchupId): matchupId is number => matchupId !== null),
          ),
        ];
        const feeds = await Promise.all(
          matchupIds.map(matchupId => getDriveFFLiveOdds(leagueConfig.id, week, matchupId)),
        );

        const liveTeams: LiveTeam[] = [];
        const latestTimestamp = feeds
          .flatMap(feed => (feed.latest ? [feed.latest.timestamp] : []))
          .sort()
          .at(-1);
        for (const feed of feeds) {
          if (!feed.latest) continue;
          const { matchup, playerDistributions } = feed.latest;

          const addTeam = (
            rosterId: string,
            projectedFinal: number,
            currentScore: number,
          ): void => {
            const numericRosterId = Number.parseInt(rosterId, 10);
            const distributions = playerDistributions.filter(
              player => player.rosterId === rosterId,
            );
            const range = getTeamScoreDistribution(projectedFinal, distributions, currentScore);
            liveTeams.push({
              rosterId: numericRosterId,
              matchupId: Number.parseInt(feed.matchupId, 10),
              teamName: teamNameFromOwner(ownersByRosterId.get(numericRosterId), numericRosterId),
              leagueId: leagueConfig.id,
              leagueName: leagueConfig.name,
              currentScore,
              mean: projectedFinal,
              p10: range.p10,
              p50: range.median,
              p90: range.p90,
            });
          };

          addTeam(matchup.rosterAId, matchup.projectedFinalA, matchup.currentScoreA);
          addTeam(matchup.rosterBId, matchup.projectedFinalB, matchup.currentScoreB);
        }

        if (liveTeams.length > 0 && liveTeams.length !== feeds.length * 2) {
          throw new Error(
            `driveFF returned incomplete Week ${week} coverage for ${leagueConfig.id}`,
          );
        }

        return { liveTeams, latestTimestamp: latestTimestamp ?? null };
      }),
    );

    const allTeams = leagueResults.flatMap(result => result.liveTeams);
    if (allTeams.length === 0) return NextResponse.json(emptyPayload(week));

    const iterations = 10_000;
    const winsHigh = new Array<number>(allTeams.length).fill(0);
    const winsLow = new Array<number>(allTeams.length).fill(0);
    const pairIndexes = new Map<string, number[]>();
    allTeams.forEach((team, index) => {
      const key = `${team.leagueId}-${team.matchupId}`;
      pairIndexes.set(key, [...(pairIndexes.get(key) || []), index]);
    });
    const pairs = [...pairIndexes.values()].filter(pair => pair.length === 2);
    const pairWinsClosest = new Array<number>(pairs.length).fill(0);
    const pairWinsBlowout = new Array<number>(pairs.length).fill(0);
    const pairWinsHighest = new Array<number>(pairs.length).fill(0);
    const pairWinsLowest = new Array<number>(pairs.length).fill(0);

    for (let iteration = 0; iteration < iterations; iteration += 1) {
      const scores = allTeams.map(sampleScore);
      let highestTeamIndex = 0;
      let lowestTeamIndex = 0;
      for (let index = 1; index < scores.length; index += 1) {
        if (scores[index] > scores[highestTeamIndex]) highestTeamIndex = index;
        if (scores[index] < scores[lowestTeamIndex]) lowestTeamIndex = index;
      }
      winsHigh[highestTeamIndex] += 1;
      winsLow[lowestTeamIndex] += 1;

      let closest = { index: 0, value: Number.POSITIVE_INFINITY };
      let blowout = { index: 0, value: Number.NEGATIVE_INFINITY };
      let highest = { index: 0, value: Number.NEGATIVE_INFINITY };
      let lowest = { index: 0, value: Number.POSITIVE_INFINITY };
      pairs.forEach(([first, second], index) => {
        const margin = Math.abs(scores[first] - scores[second]);
        const total = scores[first] + scores[second];
        if (margin < closest.value) closest = { index, value: margin };
        if (margin > blowout.value) blowout = { index, value: margin };
        if (total > highest.value) highest = { index, value: total };
        if (total < lowest.value) lowest = { index, value: total };
      });
      pairWinsClosest[closest.index] += 1;
      pairWinsBlowout[blowout.index] += 1;
      pairWinsHighest[highest.index] += 1;
      pairWinsLowest[lowest.index] += 1;
    }

    const toTeamOdds = (wins: number[], reverseColor = false): TeamOdds[] =>
      allTeams
        .map((team, index) => {
          const probability = wins[index] / iterations;
          return {
            teamId: `${team.leagueId}-${team.rosterId}`,
            matchupId: team.matchupId,
            teamName: team.teamName,
            leagueId: team.leagueId,
            leagueName: team.leagueName,
            probability,
            odds: probToAmerican(probability),
            projectedRange: { p10: team.p10, p50: team.p50, p90: team.p90 },
            totalProjection: team.mean,
            color: probToColor(probability, reverseColor),
          };
        })
        .sort((first, second) => second.probability - first.probability);

    const toMatchupOdds = (wins: number[]): MatchupOdds[] =>
      wins
        .map((winCount, pairIndex) => {
          const [firstIndex, secondIndex] = pairs[pairIndex];
          const first = allTeams[firstIndex];
          const second = allTeams[secondIndex];
          const probability = winCount / iterations;
          return {
            matchupId: first.matchupId,
            team1: { name: first.teamName, leagueId: first.leagueId, projection: first.mean },
            team2: { name: second.teamName, leagueId: second.leagueId, projection: second.mean },
            projectedMargin: Math.abs(first.mean - second.mean),
            probability,
            odds: probToAmerican(probability),
            color: probToColor(probability),
          };
        })
        .sort((first, second) => second.probability - first.probability);

    const lastUpdated = leagueResults.reduce<string | null>(
      (latest, result) =>
        result.latestTimestamp && (!latest || result.latestTimestamp > latest)
          ? result.latestTimestamp
          : latest,
      null,
    );
    const payload: LeagueWideOddsType = {
      week,
      highestScorer: toTeamOdds(winsHigh),
      lowestScorer: toTeamOdds(winsLow, true),
      closestMatchup: toMatchupOdds(pairWinsClosest),
      biggestBlowout: toMatchupOdds(pairWinsBlowout),
      highestScoringMatchup: toMatchupOdds(pairWinsHighest),
      lowestScoringMatchup: toMatchupOdds(pairWinsLowest),
      lastUpdated: lastUpdated || new Date().toISOString(),
      source: 'driveff',
    };
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[LEAGUE ODDS] driveFF adapter error:', error);
    return NextResponse.json({ error: 'Failed to load driveFF league odds' }, { status: 502 });
  }
};
