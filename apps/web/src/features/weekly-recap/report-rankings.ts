import { median, standardDeviation } from '@/shared/utils/stats/medians';

export interface RankingLeague {
  leagueId: string;
  shortName: string;
  faabBudget: number;
  teams: { rosterId: number; label: string }[];
  draftPicks: { playerId: string; rosterId: number; price: number }[];
  transactions: {
    id: string;
    type: string;
    completedAt: number;
    adds: Partial<Record<string, number>>;
    drops: Partial<Record<string, number>>;
    bid: number;
    draftPicks: number;
  }[];
  weeks: {
    week: number;
    endsAt: number;
    teams: {
      rosterId: number;
      matchupId: number;
      score: number;
      starters: string[];
      points: Partial<Record<string, number>>;
    }[];
  }[];
}

interface PlayerLookup {
  [playerId: string]: { name: string; position: string };
}

const definedEntries = (values: Partial<Record<string, number>>): [string, number][] =>
  Object.entries(values).filter((entry): entry is [string, number] => typeof entry[1] === 'number');

export interface PlayerReturn {
  key: string;
  teamKey: string;
  label: string;
  legion: string;
  playerId: string;
  player: string;
  position: string;
  kind: string;
  transactionId: string;
  acquiredAt: number;
  releasedAt: number;
  cost: number;
  starts: number;
  points: number;
  vorp: number;
  vorpPerDollar: number | null;
  surplus: number;
  score: number;
}

export const rankReturns = <T>(rows: readonly T[], value: (row: T) => number, count = 5) => ({
  best: [...rows].sort((a, b) => value(b) - value(a)).slice(0, count),
  worst: [...rows].sort((a, b) => value(a) - value(b)).slice(0, count),
});

/** Attribute actual starts to one acquisition stint, within one Legion. */
export const buildLeagueRankings = (league: RankingLeague, players: PlayerLookup) => {
  const weeks = [...league.weeks].sort((a, b) => a.week - b.week);
  const cutoff = weeks.at(-1)?.endsAt ?? 0;
  const transactions = league.transactions
    .filter(transaction => transaction.completedAt <= cutoff)
    .sort((a, b) => a.completedAt - b.completedAt || a.id.localeCompare(b.id));
  const labels = new Map(league.teams.map(team => [team.rosterId, team.label]));
  const moves: PlayerReturn[] = [];
  const ownership = new Map<string, PlayerReturn>();
  const createMove = (
    playerId: string,
    rosterId: number,
    kind: string,
    transactionId: string,
    acquiredAt: number,
    cost: number,
  ): PlayerReturn => {
    const move: PlayerReturn = {
      key: `${league.leagueId}:${transactionId}:${playerId}:${rosterId}`,
      teamKey: `${league.leagueId}:${rosterId}`,
      label: labels.get(rosterId) ?? `Team ${rosterId}`,
      legion: league.shortName,
      playerId,
      player: players[playerId]?.name ?? playerId,
      position: players[playerId]?.position ?? 'UNKNOWN',
      kind,
      transactionId,
      acquiredAt,
      releasedAt: Infinity,
      cost,
      starts: 0,
      points: 0,
      vorp: 0,
      vorpPerDollar: null,
      surplus: 0,
      score: 0,
    };
    moves.push(move);
    const previous = ownership.get(playerId);
    if (previous) previous.releasedAt = acquiredAt;
    ownership.set(playerId, move);
    return move;
  };
  for (const pick of league.draftPicks) {
    createMove(pick.playerId, pick.rosterId, 'draft', 'draft', 0, pick.price);
  }

  let transactionIndex = 0;
  let unattributedStarts = 0;
  const unattributedPlayers: { week: number; rosterId: number; playerId: string }[] = [];
  const positionTotals = new Map<string, number>();
  const allStartedPoints = new Map<string, Map<string, number>>();
  const benchBombs: {
    key: string;
    label: string;
    legion: string;
    player: string;
    week: number;
    points: number;
  }[] = [];
  const baselines: { week: number; position: string; value: number; benchCount: number }[] = [];

  for (const week of weeks) {
    const weekIndex = weeks.indexOf(week);
    const startsAt = weeks[weekIndex - 1]?.endsAt ?? week.endsAt - 7 * 24 * 60 * 60 * 1000;
    while (
      transactionIndex < transactions.length &&
      transactions[transactionIndex].completedAt <= week.endsAt
    ) {
      const transaction = transactions[transactionIndex++];
      for (const [playerId, rosterId] of definedEntries(transaction.drops)) {
        const previous = ownership.get(playerId);
        if (previous?.teamKey === `${league.leagueId}:${rosterId}`) {
          previous.releasedAt = transaction.completedAt;
          ownership.delete(playerId);
        }
      }
      for (const [playerId, rosterId] of definedEntries(transaction.adds)) {
        createMove(
          playerId,
          rosterId,
          transaction.type,
          transaction.id,
          transaction.completedAt,
          transaction.type === 'waiver' ? transaction.bid : 0,
        );
      }
    }

    const benchByPosition = new Map<string, number[]>();
    for (const team of week.teams) {
      const starters = new Set(team.starters);
      for (const [playerId, points] of definedEntries(team.points)) {
        if (starters.has(playerId)) continue;
        const position = players[playerId]?.position ?? 'UNKNOWN';
        const values = benchByPosition.get(position) ?? [];
        values.push(points);
        benchByPosition.set(position, values);
        benchBombs.push({
          key: `${league.leagueId}:${week.week}:${team.rosterId}:${playerId}`,
          label: labels.get(team.rosterId) ?? '',
          legion: league.shortName,
          player: players[playerId]?.name ?? playerId,
          week: week.week,
          points,
        });
      }
    }
    const replacement = new Map(
      [...benchByPosition].map(([position, values]) => [position, median(values)]),
    );
    for (const [position, values] of benchByPosition) {
      baselines.push({
        week: week.week,
        position,
        value: replacement.get(position)!,
        benchCount: values.length,
      });
    }
    for (const team of week.teams) {
      const teamKey = `${league.leagueId}:${team.rosterId}`;
      const playerTotals = allStartedPoints.get(teamKey) ?? new Map<string, number>();
      for (const playerId of team.starters) {
        if (playerId === '0') continue;
        const points = team.points[playerId] ?? 0;
        const position = players[playerId]?.position ?? 'UNKNOWN';
        const key = `${teamKey}:${position}`;
        positionTotals.set(key, (positionTotals.get(key) ?? 0) + points);
        playerTotals.set(playerId, (playerTotals.get(playerId) ?? 0) + points);
        // Sleeper keeps already-played starts in the old lineup after a midweek trade.
        // Use that recorded roster and its latest overlapping acquisition stint.
        const move = [...moves]
          .reverse()
          .find(
            candidate =>
              candidate.playerId === playerId &&
              candidate.teamKey === teamKey &&
              candidate.acquiredAt <= week.endsAt &&
              candidate.releasedAt > startsAt,
          );
        if (!move || move.teamKey !== teamKey) {
          unattributedStarts++;
          unattributedPlayers.push({ week: week.week, rosterId: team.rosterId, playerId });
          continue;
        }
        move.starts++;
        move.points += points;
        move.vorp += points - (replacement.get(position) ?? 0);
      }
      allStartedPoints.set(teamKey, playerTotals);
    }
  }

  const draftPicks = moves.filter(move => move.kind === 'draft');
  const draftCost = draftPicks.reduce((sum, pick) => sum + pick.cost, 0);
  const draftVorp = draftPicks.reduce((sum, pick) => sum + pick.vorp, 0);
  const marketRate = draftCost > 0 ? draftVorp / draftCost : 0;
  for (const move of moves) {
    move.vorpPerDollar = move.cost > 0 ? move.vorp / move.cost : null;
    move.surplus = move.vorp - move.cost * marketRate;
    // Matches driveFF's disclosed transaction grading scale: 25 points per full FAAB budget.
    move.score = move.vorp - (league.faabBudget > 0 ? (move.cost / league.faabBudget) * 25 : 0);
  }

  const drafts = league.teams.map(team => {
    const teamKey = `${league.leagueId}:${team.rosterId}`;
    const picks = draftPicks.filter(pick => pick.teamKey === teamKey);
    const cost = picks.reduce((sum, pick) => sum + pick.cost, 0);
    const vorp = picks.reduce((sum, pick) => sum + pick.vorp, 0);
    return {
      teamKey,
      label: team.label,
      legion: league.shortName,
      cost,
      vorp,
      starts: picks.reduce((sum, pick) => sum + pick.starts, 0),
      vorpPerDollar: cost > 0 ? vorp / cost : 0,
    };
  });
  const positions = ['QB', 'RB', 'WR', 'TE', 'DEF'].flatMap(position => {
    const rows = league.teams.map(team => ({
      teamKey: `${league.leagueId}:${team.rosterId}`,
      label: team.label,
      legion: league.shortName,
      position,
      average:
        (positionTotals.get(`${league.leagueId}:${team.rosterId}:${position}`) ?? 0) / weeks.length,
    }));
    const baseline = median(rows.map(row => row.average));
    return rows.map(row => ({ ...row, baseline, edge: row.average - baseline }));
  });
  const teamOutliers = league.teams.map(team => {
    const teamKey = `${league.leagueId}:${team.rosterId}`;
    const scores = weeks.map(week => week.teams.find(row => row.rosterId === team.rosterId)!.score);
    const total = scores.reduce((sum, score) => sum + score, 0);
    const mean = total / scores.length;
    const leader = [...(allStartedPoints.get(teamKey) ?? [])].sort((a, b) => b[1] - a[1])[0];
    return {
      teamKey,
      label: team.label,
      legion: league.shortName,
      total,
      volatility: mean > 0 ? standardDeviation(scores) / mean : 0,
      low: Math.min(...scores),
      high: Math.max(...scores),
      star: leader ? (players[leader[0]]?.name ?? '') : '',
      starPoints: leader?.[1] ?? 0,
      concentration: total > 0 ? (leader?.[1] ?? 0) / total : 0,
    };
  });
  const trades = transactions
    .filter(transaction => transaction.type === 'trade')
    .map(transaction => ({
      key: `${league.leagueId}:${transaction.id}`,
      legion: league.shortName,
      draftPicks: transaction.draftPicks,
      sides: [...new Set(definedEntries(transaction.adds).map(([, rosterId]) => rosterId))].map(
        rosterId => {
          const received = moves.filter(
            move =>
              move.transactionId === transaction.id &&
              move.teamKey === `${league.leagueId}:${rosterId}`,
          );
          const sent = moves.filter(
            move =>
              move.transactionId === transaction.id &&
              transaction.drops[move.playerId] === rosterId,
          );
          return {
            rosterId,
            label: labels.get(rosterId) ?? '',
            received: received.map(move => move.player).join(', '),
            netVorp:
              received.reduce((sum, move) => sum + move.vorp, 0) -
              sent.reduce((sum, move) => sum + move.vorp, 0),
          };
        },
      ),
    }));
  return {
    drafts,
    draftPicks,
    transactions: moves.filter(move => ['waiver', 'free_agent'].includes(move.kind)),
    positions,
    teamOutliers,
    benchBombs,
    trades,
    baselines,
    unattributedStarts,
    unattributedPlayers,
  };
};
