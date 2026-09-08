export interface SlatePlayer {
  id: string;
  position: string;
  projection: number;
}

export interface SlateLineupModeling {
  openStarterSlots: number;
  unresolvedPlayerIds: string[];
  zeroProjectionPlayerIds: string[];
}

export const prepareSlatePlayers = ({
  starterIds,
  expectedStarters,
  lookup,
}: {
  starterIds: string[];
  expectedStarters: number;
  lookup: (playerId: string) => { position: string | null; projection: number | null } | null;
}): { players: SlatePlayer[]; modeling: SlateLineupModeling } => {
  const selectedIds = starterIds.filter(playerId => playerId !== '0');
  const unresolvedPlayerIds: string[] = [];
  const zeroProjectionPlayerIds: string[] = [];
  const players = selectedIds.flatMap(playerId => {
    const source = lookup(playerId);
    if (!source?.position) {
      unresolvedPlayerIds.push(playerId);
      return [];
    }
    const projection = Math.max(0, source.projection ?? 0);
    if (projection === 0) zeroProjectionPlayerIds.push(playerId);
    return [
      {
        id: playerId,
        position: source.position === 'DST' ? 'DEF' : source.position,
        projection,
      },
    ];
  });

  return {
    players,
    modeling: {
      openStarterSlots: Math.max(0, expectedStarters - selectedIds.length),
      unresolvedPlayerIds,
      zeroProjectionPlayerIds,
    },
  };
};

export interface SlateTeam {
  teamId: string;
  leagueId: string;
  matchupId: number;
  teamName: string;
  players: SlatePlayer[];
  lineupModeling?: SlateLineupModeling;
}

export interface RaceCandidate {
  id: string;
  label: string;
  probability: number;
}

interface SimulatedTeam {
  teamId: string;
  teamName: string;
  projection: number;
  p10: number;
  p50: number;
  p90: number;
}

interface SimulatedMatchup {
  matchupId: number;
  matchupKey: string;
  teamA: { teamId: string; teamName: string; winProbability: number; moneyline: string };
  teamB: { teamId: string; teamName: string; winProbability: number; moneyline: string };
  spread: number;
  total: number;
}

export interface OpeningSlateSimulation {
  seed: number;
  iterations: number;
  teams: SimulatedTeam[];
  matchups: SimulatedMatchup[];
  worldScoresByTeam: Record<string, number[]>;
  races: {
    highestScore: RaceCandidate[];
    lowestScore: RaceCandidate[];
    closestMatchup: RaceCandidate[];
    biggestBlowout: RaceCandidate[];
    highestMatchupTotal: RaceCandidate[];
    lowestMatchupTotal: RaceCandidate[];
  };
}

const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const quantile = (sorted: number[], probability: number): number =>
  sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * probability))] ?? 0;

const round = (value: number, digits = 1): number => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};

const toMoneyline = (probability: number): string => {
  if (probability <= 0) return '+∞';
  if (probability >= 1) return '-∞';
  return probability >= 0.5
    ? `${Math.round((-100 * probability) / (1 - probability))}`
    : `+${Math.round((100 * (1 - probability)) / probability)}`;
};

const rankedRace = (
  counts: Map<string, number>,
  labels: Map<string, string>,
  iterations: number,
): RaceCandidate[] =>
  Array.from(counts.entries())
    .map(([id, wins]) => ({ id, label: labels.get(id) ?? id, probability: wins / iterations }))
    .sort((a, b) => b.probability - a.probability || a.label.localeCompare(b.label));

export const simulateOpeningSlate = ({
  teams,
  iterations,
  seed,
  positionOutcomes,
}: {
  teams: SlateTeam[];
  iterations: number;
  seed: number;
  positionOutcomes: Map<string, number[]>;
}): OpeningSlateSimulation => {
  if (teams.length === 0) throw new Error('Slate must include at least one team');
  if (!Number.isInteger(iterations) || iterations < 100) {
    throw new Error('Slate simulation requires at least 100 iterations');
  }
  const leagueIds = new Set(teams.map(team => team.leagueId));
  if (leagueIds.size !== 1) throw new Error('Simulate one league at a time');
  if (new Set(teams.map(team => team.teamId)).size !== teams.length) {
    throw new Error('Team IDs must be unique composite identifiers');
  }

  const matchupGroups = new Map<number, SlateTeam[]>();
  teams.forEach(team => {
    const group = matchupGroups.get(team.matchupId) ?? [];
    group.push(team);
    matchupGroups.set(team.matchupId, group);
  });
  const matchupPairs = Array.from(matchupGroups.entries()).sort(([a], [b]) => a - b);
  if (matchupPairs.some(([, pair]) => pair.length !== 2)) {
    throw new Error('Every matchup must contain exactly two teams');
  }

  const random = createRandom(seed);
  const teamScores = new Map(teams.map(team => [team.teamId, [] as number[]]));
  const teamWins = new Map(teams.map(team => [team.teamId, 0]));
  const highCounts = new Map(teams.map(team => [team.teamId, 0]));
  const lowCounts = new Map(teams.map(team => [team.teamId, 0]));
  const matchupLabels = new Map<string, string>();
  const closestCounts = new Map<string, number>();
  const blowoutCounts = new Map<string, number>();
  const highTotalCounts = new Map<string, number>();
  const lowTotalCounts = new Map<string, number>();

  matchupPairs.forEach(([matchupId, pair]) => {
    const key = `${pair[0].leagueId}:${matchupId}`;
    matchupLabels.set(key, `${pair[0].teamName} vs. ${pair[1].teamName}`);
    closestCounts.set(key, 0);
    blowoutCounts.set(key, 0);
    highTotalCounts.set(key, 0);
    lowTotalCounts.set(key, 0);
  });

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    teams.forEach(team => {
      const score = team.players.reduce((sum, player) => {
        const outcomes = positionOutcomes.get(player.position);
        const multiplier = outcomes?.length ? outcomes[Math.floor(random() * outcomes.length)] : 1;
        return sum + player.projection * multiplier;
      }, 0);
      teamScores.get(team.teamId)?.push(score);
    });
  }

  teams.forEach(team => {
    const scores = teamScores.get(team.teamId) ?? [];
    const projectionAnchor = team.players.reduce((sum, player) => sum + player.projection, 0);
    const rawMedian = quantile(
      [...scores].sort((a, b) => a - b),
      0.5,
    );
    const anchoredScores =
      projectionAnchor === 0
        ? scores.map(() => 0)
        : rawMedian > 0
          ? scores.map(score => score * (projectionAnchor / rawMedian))
          : scores.map(() => projectionAnchor);
    teamScores.set(team.teamId, anchoredScores);
  });

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const world = new Map(
      teams.map(team => [team.teamId, teamScores.get(team.teamId)?.[iteration] ?? 0]),
    );

    const rankedTeams = [...teams].sort(
      (a, b) => (world.get(b.teamId) ?? 0) - (world.get(a.teamId) ?? 0),
    );
    const highId = rankedTeams[0].teamId;
    const lowId = rankedTeams[rankedTeams.length - 1].teamId;
    highCounts.set(highId, (highCounts.get(highId) ?? 0) + 1);
    lowCounts.set(lowId, (lowCounts.get(lowId) ?? 0) + 1);

    const matchupWorlds = matchupPairs.map(([matchupId, pair]) => {
      const scoreA = world.get(pair[0].teamId) ?? 0;
      const scoreB = world.get(pair[1].teamId) ?? 0;
      const winner = scoreA >= scoreB ? pair[0] : pair[1];
      teamWins.set(winner.teamId, (teamWins.get(winner.teamId) ?? 0) + 1);
      return {
        key: `${pair[0].leagueId}:${matchupId}`,
        margin: Math.abs(scoreA - scoreB),
        total: scoreA + scoreB,
      };
    });
    const closest = [...matchupWorlds].sort((a, b) => a.margin - b.margin)[0];
    const blowout = [...matchupWorlds].sort((a, b) => b.margin - a.margin)[0];
    const highTotal = [...matchupWorlds].sort((a, b) => b.total - a.total)[0];
    const lowTotal = [...matchupWorlds].sort((a, b) => a.total - b.total)[0];
    closestCounts.set(closest.key, (closestCounts.get(closest.key) ?? 0) + 1);
    blowoutCounts.set(blowout.key, (blowoutCounts.get(blowout.key) ?? 0) + 1);
    highTotalCounts.set(highTotal.key, (highTotalCounts.get(highTotal.key) ?? 0) + 1);
    lowTotalCounts.set(lowTotal.key, (lowTotalCounts.get(lowTotal.key) ?? 0) + 1);
  }

  const teamLabels = new Map(teams.map(team => [team.teamId, team.teamName]));
  const simulatedTeams = teams.map(team => {
    const scores = [...(teamScores.get(team.teamId) ?? [])].sort((a, b) => a - b);
    const projectionAnchor = team.players.reduce((sum, player) => sum + player.projection, 0);
    return {
      teamId: team.teamId,
      teamName: team.teamName,
      projection: round(projectionAnchor),
      p10: round(quantile(scores, 0.1)),
      p50: round(quantile(scores, 0.5)),
      p90: round(quantile(scores, 0.9)),
    };
  });

  const matchups = matchupPairs.map(([matchupId, pair]) => {
    const teamAResult = simulatedTeams.find(team => team.teamId === pair[0].teamId);
    const teamBResult = simulatedTeams.find(team => team.teamId === pair[1].teamId);
    if (!teamAResult || !teamBResult)
      throw new Error(`Missing simulation result for matchup ${matchupId}`);
    const teamAProbability = (teamWins.get(pair[0].teamId) ?? 0) / iterations;
    const teamBProbability = 1 - teamAProbability;
    return {
      matchupId,
      matchupKey: `${pair[0].leagueId}:${matchupId}`,
      teamA: {
        teamId: pair[0].teamId,
        teamName: pair[0].teamName,
        winProbability: teamAProbability,
        moneyline: toMoneyline(teamAProbability),
      },
      teamB: {
        teamId: pair[1].teamId,
        teamName: pair[1].teamName,
        winProbability: teamBProbability,
        moneyline: toMoneyline(teamBProbability),
      },
      spread: round(teamAResult.p50 - teamBResult.p50, 1),
      total: round(teamAResult.p50 + teamBResult.p50, 1),
    };
  });

  return {
    seed,
    iterations,
    teams: simulatedTeams,
    matchups,
    worldScoresByTeam: Object.fromEntries(teamScores),
    races: {
      highestScore: rankedRace(highCounts, teamLabels, iterations),
      lowestScore: rankedRace(lowCounts, teamLabels, iterations),
      closestMatchup: rankedRace(closestCounts, matchupLabels, iterations),
      biggestBlowout: rankedRace(blowoutCounts, matchupLabels, iterations),
      highestMatchupTotal: rankedRace(highTotalCounts, matchupLabels, iterations),
      lowestMatchupTotal: rankedRace(lowTotalCounts, matchupLabels, iterations),
    },
  };
};

export type OpeningSlateRaces = OpeningSlateSimulation['races'];

export const combineLeagueSlateSimulations = (
  simulations: OpeningSlateSimulation[],
): OpeningSlateRaces => {
  if (simulations.length === 0) throw new Error('At least one league simulation is required');
  const iterations = simulations[0].iterations;
  if (simulations.some(simulation => simulation.iterations !== iterations)) {
    throw new Error('League simulations must use the same iteration count');
  }

  const teams = simulations.flatMap(simulation => simulation.teams);
  const matchups = simulations.flatMap(simulation => simulation.matchups);
  const teamLabels = new Map(teams.map(team => [team.teamId, team.teamName]));
  const matchupLabels = new Map(
    matchups.map(matchup => [
      matchup.matchupKey,
      `${matchup.teamA.teamName} vs. ${matchup.teamB.teamName}`,
    ]),
  );
  const createCounts = (ids: string[]) => new Map(ids.map(id => [id, 0]));
  const highCounts = createCounts(teams.map(team => team.teamId));
  const lowCounts = createCounts(teams.map(team => team.teamId));
  const closestCounts = createCounts(matchups.map(matchup => matchup.matchupKey));
  const blowoutCounts = createCounts(matchups.map(matchup => matchup.matchupKey));
  const highTotalCounts = createCounts(matchups.map(matchup => matchup.matchupKey));
  const lowTotalCounts = createCounts(matchups.map(matchup => matchup.matchupKey));

  const scoreAt = (teamId: string, iteration: number): number => {
    for (const simulation of simulations) {
      const scores = simulation.worldScoresByTeam[teamId];
      if (scores) return scores[iteration] ?? 0;
    }
    throw new Error(`Missing world scores for ${teamId}`);
  };

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const rankedTeams = [...teams].sort(
      (a, b) => scoreAt(b.teamId, iteration) - scoreAt(a.teamId, iteration),
    );
    highCounts.set(rankedTeams[0].teamId, (highCounts.get(rankedTeams[0].teamId) ?? 0) + 1);
    const lowest = rankedTeams[rankedTeams.length - 1];
    lowCounts.set(lowest.teamId, (lowCounts.get(lowest.teamId) ?? 0) + 1);

    const matchupWorlds = matchups.map(matchup => {
      const scoreA = scoreAt(matchup.teamA.teamId, iteration);
      const scoreB = scoreAt(matchup.teamB.teamId, iteration);
      return {
        key: matchup.matchupKey,
        margin: Math.abs(scoreA - scoreB),
        total: scoreA + scoreB,
      };
    });
    const closest = [...matchupWorlds].sort((a, b) => a.margin - b.margin)[0];
    const blowout = [...matchupWorlds].sort((a, b) => b.margin - a.margin)[0];
    const highTotal = [...matchupWorlds].sort((a, b) => b.total - a.total)[0];
    const lowTotal = [...matchupWorlds].sort((a, b) => a.total - b.total)[0];
    closestCounts.set(closest.key, (closestCounts.get(closest.key) ?? 0) + 1);
    blowoutCounts.set(blowout.key, (blowoutCounts.get(blowout.key) ?? 0) + 1);
    highTotalCounts.set(highTotal.key, (highTotalCounts.get(highTotal.key) ?? 0) + 1);
    lowTotalCounts.set(lowTotal.key, (lowTotalCounts.get(lowTotal.key) ?? 0) + 1);
  }

  return {
    highestScore: rankedRace(highCounts, teamLabels, iterations),
    lowestScore: rankedRace(lowCounts, teamLabels, iterations),
    closestMatchup: rankedRace(closestCounts, matchupLabels, iterations),
    biggestBlowout: rankedRace(blowoutCounts, matchupLabels, iterations),
    highestMatchupTotal: rankedRace(highTotalCounts, matchupLabels, iterations),
    lowestMatchupTotal: rankedRace(lowTotalCounts, matchupLabels, iterations),
  };
};
