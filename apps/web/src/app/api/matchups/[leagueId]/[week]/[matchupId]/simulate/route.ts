import { type NextRequest, NextResponse } from 'next/server';
import { resolveMatchupTeamIdentity } from '@/features/matchups/team-identity';
import {
  getDriveFFLiveOdds,
  getTeamScoreDistribution,
  toAmericanMoneyline,
} from '@/lib/driveff-live-odds';
import { sleeperClient } from '@/lib/sleeper/unified-client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = async (
  _req: NextRequest,
  props: { params: Promise<{ leagueId: string; week: string; matchupId: string }> },
) => {
  const params = await props.params;
  const leagueId = params.leagueId;
  const week = Number.parseInt(params.week, 10);
  const matchupId = Number.parseInt(params.matchupId, 10);

  if (!leagueId || !Number.isFinite(week) || !Number.isFinite(matchupId)) {
    return NextResponse.json({ success: false, error: 'Invalid params' }, { status: 400 });
  }

  try {
    const [feed, matchups, players, rosters, users] = await Promise.all([
      getDriveFFLiveOdds(leagueId, week, matchupId),
      sleeperClient.fetchMatchups(leagueId, week),
      sleeperClient.fetchAllPlayers(),
      sleeperClient.fetchRosters(leagueId),
      sleeperClient.fetchUsers(leagueId),
    ]);

    if (!feed.latest) {
      return NextResponse.json(
        { success: false, error: 'driveFF has not collected this matchup yet' },
        { status: 404 },
      );
    }

    const pair = (matchups || []).filter(matchup => matchup.matchup_id === matchupId);
    if (pair.length !== 2) {
      return NextResponse.json({ success: false, error: 'Matchup not found' }, { status: 404 });
    }

    const [sleeperTeam1, sleeperTeam2] = pair;
    const latest = feed.latest.matchup;
    const team1IsRosterA = String(sleeperTeam1.roster_id) === latest.rosterAId;
    const team1RosterId = String(sleeperTeam1.roster_id);
    const team2RosterId = String(sleeperTeam2.roster_id);
    const team1Distributions = feed.latest.playerDistributions.filter(
      player => player.rosterId === team1RosterId,
    );
    const team2Distributions = feed.latest.playerDistributions.filter(
      player => player.rosterId === team2RosterId,
    );
    const team1Identity = resolveMatchupTeamIdentity(sleeperTeam1.roster_id, rosters, users);
    const team2Identity = resolveMatchupTeamIdentity(sleeperTeam2.roster_id, rosters, users);
    const team1WinPct = team1IsRosterA ? latest.winProbA : latest.winProbB;
    const team2WinPct = team1IsRosterA ? latest.winProbB : latest.winProbA;
    const team1ProjectedFinal = team1IsRosterA ? latest.projectedFinalA : latest.projectedFinalB;
    const team2ProjectedFinal = team1IsRosterA ? latest.projectedFinalB : latest.projectedFinalA;
    const playerMap = players || {};

    const toTeamPlayers = (distributions: typeof team1Distributions) =>
      distributions.map(player => ({
        id: player.playerId,
        name: playerMap[player.playerId]?.full_name || player.playerId,
        position: player.position,
        projection: player.mean,
        currentScore: player.currentScore,
        fullProjection: player.providerProjection,
        gameState: {
          gameProgress: player.gameProgress,
          minutesRemaining: (1 - player.gameProgress) * 60,
        },
      }));

    const allDistributions = feed.latest.playerDistributions.map(player => ({
      playerId: player.playerId,
      playerName: playerMap[player.playerId]?.full_name || player.playerId,
      position: player.position,
      mean: player.mean,
      p10: player.p10,
      p25: player.p25,
      median: player.p50,
      p75: player.p75,
      p90: player.p90,
      stdDev: player.standardDeviation,
      projection: player.mean,
      currentScore: player.currentScore,
      fullProjection: player.providerProjection,
      gameState: {
        gameProgress: player.gameProgress,
        minutesRemaining: (1 - player.gameProgress) * 60,
      },
      dataSource: 'driveff',
    }));

    return NextResponse.json({
      success: true,
      source: 'driveff-live-odds',
      simulation: {
        team1Scores: getTeamScoreDistribution(team1ProjectedFinal, team1Distributions),
        team2Scores: getTeamScoreDistribution(team2ProjectedFinal, team2Distributions),
        team1WinPct,
        team2WinPct,
        medianMargin: Math.abs(team1ProjectedFinal - team2ProjectedFinal),
        impliedOdds: {
          team1MoneyLine: toAmericanMoneyline(team1WinPct),
          team2MoneyLine: toAmericanMoneyline(team2WinPct),
          spread: team1IsRosterA ? latest.spread : -latest.spread,
          total: latest.total,
        },
        teams: [
          {
            rosterId: sleeperTeam1.roster_id,
            ...team1Identity,
            players: toTeamPlayers(team1Distributions),
          },
          {
            rosterId: sleeperTeam2.roster_id,
            ...team2Identity,
            players: toTeamPlayers(team2Distributions),
          },
        ],
        iterations: feed.latest.iterations,
        computeTimeMs: 0,
        generatedAt: feed.latest.timestamp,
        modelSource: 'driveFF',
        modelVersion: feed.latest.engineVersion,
      },
      playersDistributions: allDistributions,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load driveFF odds';
    console.error('[SIMULATE] driveFF adapter error:', {
      message: errorMessage,
      leagueId,
      week,
      matchupId,
    });
    return NextResponse.json({ success: false, error: errorMessage }, { status: 502 });
  }
};
