export interface DraftManagerInput {
  rosterId: number;
  ownerId: string;
  managerName: string;
  teamName: string;
  avatarUrl?: string | null;
}

export interface DraftPickInput {
  pickNo: number;
  rosterId: number;
  playerId: string;
  playerName: string;
  position: string;
  nflTeam: string | null;
  price: number;
}

export interface DraftLeagueInput {
  leagueId: string;
  leagueName: string;
  draftId: string;
  logo?: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  rosterSize: number;
  managers: DraftManagerInput[];
  picks: DraftPickInput[];
}

export interface AuctionBenchmarkInput {
  name: string;
  url: string;
  publishedAt: string;
  assumptions: string;
  valuesByPlayerId: Record<string, number>;
}

export interface DraftPickReport extends DraftPickInput {
  leagueId: string;
  leagueName: string;
  teamId: string;
  teamName: string;
  managerName: string;
  ownerId: string;
  benchmarkValue: number | null;
  valueDelta: number | null;
}

export interface DraftTeamGrade {
  teamId: string;
  leagueId: string;
  leagueName: string;
  rosterId: number;
  ownerId: string;
  managerName: string;
  teamName: string;
  avatarUrl: string | null;
  grade: string;
  score: number;
  spend: number;
  benchmarkRosterValue: number;
  benchmarkStarterValue: number;
  benchmarkBenchValue: number;
  benchmarkCoverage: number;
  valueDelta: number;
  starterSpend: number;
  benchSpend: number;
  starterValueDelta: number;
  benchValueDelta: number;
  starterPlayerIds: string[];
  topPurchase: DraftPickReport | null;
  bestValue: DraftPickReport | null;
  biggestPremium: DraftPickReport | null;
  picks: DraftPickReport[];
}

interface RankedPick {
  playerId: string;
  playerName: string;
  position: string;
  nflTeam: string | null;
  leagueId: string;
  leagueName: string;
  teamId: string;
  teamName: string;
  managerName: string;
  price: number;
  benchmarkValue: number;
  valueDelta: number;
}

export interface DraftReport {
  metadata: {
    season: 2026;
    generatedAt: string;
    benchmark: Omit<AuctionBenchmarkInput, 'valuesByPlayerId'>;
    grading: {
      starterWeight: 0.7;
      benchWeight: 0.3;
      method: string;
    };
    timingDisclosure: string;
  };
  leagues: Array<{
    leagueId: string;
    leagueName: string;
    draftId: string;
    logo?: string;
    status: string;
    startedAt: string;
    finishedAt: string | null;
    durationMinutes: number | null;
    averageSecondsPerPurchase: number | null;
    purchases: number;
  }>;
  teamGrades: DraftTeamGrade[];
  marketAnalytics: {
    leagues: Array<{
      leagueId: string;
      leagueName: string;
      giniPrices: number;
      nominationPriceSlopePer10: number;
      top10SpendShare: number;
    }>;
    leagueAgreement: Array<{
      leagueAId: string;
      leagueAName: string;
      leagueBId: string;
      leagueBName: string;
      sharedPlayers: number;
      spearman: number;
    }>;
    positionMarkets: Array<{
      position: string;
      leagues: Array<{
        leagueId: string;
        leagueName: string;
        averagePrice: number;
        totalSpend: number;
        count: number;
        quartiles: Array<{ label: string; averagePrice: number; count: number }>;
      }>;
    }>;
  };
  managerAnalytics: Array<{
    teamId: string;
    teamName: string;
    managerName: string;
    leagueId: string;
    leagueName: string;
    avatarUrl: string | null;
    giniSpend: number;
    top1Share: number;
    top3Share: number;
    starterSpend: number;
    benchSpend: number;
    positionSpend: Record<string, number>;
  }>;
  superlatives: {
    bestValue: RankedPick | null;
    biggestPremium: RankedPick | null;
    highestPrice: RankedPick | null;
    fastestDraft: { leagueId: string; leagueName: string; durationMinutes: number } | null;
    longestPurchaseDrought: {
      teamId: string;
      teamName: string;
      managerName: string;
      leagueName: string;
      value: number;
      unit: 'picks';
    } | null;
  };
  priceDivergences: Array<{
    playerId: string;
    playerName: string;
    position: string;
    nflTeam: string | null;
    lowPrice: number;
    highPrice: number;
    spread: number;
    prices: Array<{ leagueId: string; leagueName: string; teamName: string; price: number }>;
  }>;
  rosterSimilarities: Array<{
    teamAId: string;
    teamAName: string;
    teamALeague: string;
    teamBId: string;
    teamBName: string;
    teamBLeague: string;
    similarity: number;
    sharedPlayerIds: string[];
    sharedPlayerNames: string[];
  }>;
  rootingInterests: Array<{
    ownerId: string;
    managerName: string;
    teams: Array<{ teamId: string; teamName: string; leagueName: string }>;
    repeatedPlayers: Array<{ playerId: string; playerName: string; leagues: string[] }>;
  }>;
}

const round = (value: number, digits = 1): number => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};

export const normalizeDraftPosition = (playerName: string, position: string): string =>
  playerName.trim().toLowerCase() === 'travis hunter' ? 'WR' : position.toUpperCase();

export const giniCoefficient = (values: number[]): number => {
  const sorted = values.filter(value => value >= 0).sort((a, b) => a - b);
  const total = sorted.reduce((sum, value) => sum + value, 0);
  if (sorted.length <= 1 || total === 0) return 0;
  const weighted = sorted.reduce((sum, value, index) => sum + (index + 1) * value, 0);
  return (2 * weighted) / (sorted.length * total) - (sorted.length + 1) / sorted.length;
};

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

const regressionSlopePer10 = (points: Array<{ x: number; y: number }>): number => {
  if (points.length <= 1) return 0;
  const meanX = average(points.map(point => point.x));
  const meanY = average(points.map(point => point.y));
  const denominator = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  if (denominator === 0) return 0;
  const numerator = points.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0);
  return (numerator / denominator) * 10;
};

const ranks = (values: number[]): number[] => {
  const ordered = values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value);
  const result = Array<number>(values.length);
  for (let index = 0; index < ordered.length; ) {
    let end = index + 1;
    while (end < ordered.length && ordered[end].value === ordered[index].value) end += 1;
    const rank = (index + 1 + end) / 2;
    for (let tied = index; tied < end; tied += 1) result[ordered[tied].index] = rank;
    index = end;
  }
  return result;
};

const correlation = (left: number[], right: number[]): number => {
  if (left.length <= 1 || left.length !== right.length) return 0;
  const meanLeft = average(left);
  const meanRight = average(right);
  const numerator = left.reduce(
    (sum, value, index) => sum + (value - meanLeft) * (right[index] - meanRight),
    0,
  );
  const denominator = Math.sqrt(
    left.reduce((sum, value) => sum + (value - meanLeft) ** 2, 0) *
      right.reduce((sum, value) => sum + (value - meanRight) ** 2, 0),
  );
  return denominator === 0 ? 0 : numerator / denominator;
};

const percentile = (values: number[], value: number): number => {
  if (values.length <= 1) return 1;
  const below = values.filter(candidate => candidate < value).length;
  const tied = values.filter(candidate => candidate === value).length;
  return (below + Math.max(0, tied - 1) / 2) / (values.length - 1);
};

const gradeForScore = (score: number): string => {
  if (score >= 93) return 'A+';
  if (score >= 88) return 'A';
  if (score >= 82) return 'A-';
  if (score >= 76) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 64) return 'B-';
  if (score >= 56) return 'C+';
  if (score >= 48) return 'C';
  if (score >= 40) return 'C-';
  if (score >= 30) return 'D';
  return 'F';
};

const selectBenchmarkStarters = (picks: DraftPickReport[]): DraftPickReport[] => {
  const ordered = [...picks].sort(
    (a, b) => (b.benchmarkValue ?? 0) - (a.benchmarkValue ?? 0) || a.pickNo - b.pickNo,
  );
  const selected = new Set<string>();
  const take = (position: string, count: number) => {
    ordered
      .filter(pick => pick.position === position && !selected.has(pick.playerId))
      .slice(0, count)
      .forEach(pick => selected.add(pick.playerId));
  };

  take('QB', 1);
  take('RB', 2);
  take('WR', 2);
  take('TE', 1);
  take('DEF', 1);
  take('DST', 1);

  ordered
    .filter(pick => ['RB', 'WR', 'TE'].includes(pick.position) && !selected.has(pick.playerId))
    .slice(0, 2)
    .forEach(pick => selected.add(pick.playerId));

  return ordered.filter(pick => selected.has(pick.playerId));
};

const toRankedPick = (pick: DraftPickReport): RankedPick | null => {
  if (pick.benchmarkValue === null || pick.valueDelta === null) return null;
  return {
    playerId: pick.playerId,
    playerName: pick.playerName,
    position: pick.position,
    nflTeam: pick.nflTeam,
    leagueId: pick.leagueId,
    leagueName: pick.leagueName,
    teamId: pick.teamId,
    teamName: pick.teamName,
    managerName: pick.managerName,
    price: pick.price,
    benchmarkValue: pick.benchmarkValue,
    valueDelta: pick.valueDelta,
  };
};

export const buildDraftReport = ({
  leagues,
  generatedAt,
  benchmark,
}: {
  leagues: DraftLeagueInput[];
  generatedAt: string;
  benchmark: AuctionBenchmarkInput;
}): DraftReport => {
  const allPicks: DraftPickReport[] = leagues.flatMap(league => {
    const managersByRoster = new Map(league.managers.map(manager => [manager.rosterId, manager]));
    return league.picks.map(pick => {
      const manager = managersByRoster.get(pick.rosterId);
      if (!manager) {
        throw new Error(`Missing manager for ${league.leagueId}:${pick.rosterId}`);
      }
      const rawBenchmarkValue = benchmark.valuesByPlayerId[pick.playerId] ?? null;
      const benchmarkValue = rawBenchmarkValue === null ? null : round(rawBenchmarkValue);
      return {
        ...pick,
        leagueId: league.leagueId,
        leagueName: league.leagueName,
        teamId: `${league.leagueId}:${pick.rosterId}`,
        teamName: manager.teamName,
        managerName: manager.managerName,
        ownerId: manager.ownerId,
        benchmarkValue,
        valueDelta: benchmarkValue === null ? null : round(benchmarkValue - pick.price),
      };
    });
  });

  const draftTeams = leagues.flatMap(league =>
    league.managers.map(manager => {
      const picks = allPicks.filter(
        pick => pick.leagueId === league.leagueId && pick.rosterId === manager.rosterId,
      );
      const covered = picks.filter(pick => pick.benchmarkValue !== null);
      const starters = selectBenchmarkStarters(picks);
      const starterPlayerIds = starters.map(pick => pick.playerId);
      const starterIdSet = new Set(starterPlayerIds);
      const bench = picks.filter(pick => !starterIdSet.has(pick.playerId));
      return {
        teamId: `${league.leagueId}:${manager.rosterId}`,
        leagueId: league.leagueId,
        leagueName: league.leagueName,
        rosterId: manager.rosterId,
        ownerId: manager.ownerId,
        managerName: manager.managerName,
        teamName: manager.teamName,
        avatarUrl: manager.avatarUrl ?? null,
        spend: picks.reduce((sum, pick) => sum + pick.price, 0),
        benchmarkRosterValue: covered.reduce((sum, pick) => sum + (pick.benchmarkValue ?? 0), 0),
        benchmarkStarterValue: starters.reduce((sum, pick) => sum + (pick.benchmarkValue ?? 0), 0),
        benchmarkBenchValue: bench.reduce((sum, pick) => sum + (pick.benchmarkValue ?? 0), 0),
        benchmarkCoverage: picks.length === 0 ? 0 : covered.length / picks.length,
        valueDelta: covered.reduce((sum, pick) => sum + (pick.valueDelta ?? 0), 0),
        starterSpend: starters.reduce((sum, pick) => sum + pick.price, 0),
        benchSpend: bench.reduce((sum, pick) => sum + pick.price, 0),
        starterValueDelta: starters.reduce((sum, pick) => sum + (pick.valueDelta ?? 0), 0),
        benchValueDelta: bench.reduce((sum, pick) => sum + (pick.valueDelta ?? 0), 0),
        starterPlayerIds,
        picks,
      };
    }),
  );

  const starterValues = draftTeams.map(team => team.benchmarkStarterValue);
  const benchValues = draftTeams.map(team => team.benchmarkBenchValue);
  const teamGrades: DraftTeamGrade[] = draftTeams
    .map(team => {
      const score = Math.round(
        100 *
          (0.7 * percentile(starterValues, team.benchmarkStarterValue) +
            0.3 * percentile(benchValues, team.benchmarkBenchValue)),
      );
      const pricedPicks = team.picks.filter(pick => pick.valueDelta !== null);
      return {
        ...team,
        benchmarkRosterValue: round(team.benchmarkRosterValue),
        benchmarkStarterValue: round(team.benchmarkStarterValue),
        benchmarkBenchValue: round(team.benchmarkBenchValue),
        benchmarkCoverage: round(team.benchmarkCoverage, 3),
        valueDelta: round(team.valueDelta),
        starterSpend: round(team.starterSpend),
        benchSpend: round(team.benchSpend),
        starterValueDelta: round(team.starterValueDelta),
        benchValueDelta: round(team.benchValueDelta),
        score,
        grade: gradeForScore(score),
        topPurchase: [...team.picks].sort((a, b) => b.price - a.price)[0] ?? null,
        bestValue:
          [...pricedPicks].sort((a, b) => (b.valueDelta ?? 0) - (a.valueDelta ?? 0))[0] ?? null,
        biggestPremium:
          [...pricedPicks].sort((a, b) => (a.valueDelta ?? 0) - (b.valueDelta ?? 0))[0] ?? null,
      };
    })
    .sort((a, b) => b.score - a.score || a.teamName.localeCompare(b.teamName));

  const pricedPicks = allPicks.filter(
    (pick): pick is DraftPickReport & { benchmarkValue: number; valueDelta: number } =>
      pick.benchmarkValue !== null && pick.valueDelta !== null,
  );
  const bestValue = [...pricedPicks].sort(
    (a, b) => b.valueDelta - a.valueDelta || a.price - b.price,
  )[0];
  const biggestPremium = [...pricedPicks].sort(
    (a, b) => a.valueDelta - b.valueDelta || b.price - a.price,
  )[0];
  const highestPrice = [...pricedPicks].sort((a, b) => b.price - a.price)[0];

  const marketLeagues = leagues.map(league => {
    const leaguePicks = allPicks.filter(pick => pick.leagueId === league.leagueId);
    const prices = leaguePicks.map(pick => pick.price);
    const totalSpend = prices.reduce((sum, price) => sum + price, 0);
    return {
      leagueId: league.leagueId,
      leagueName: league.leagueName,
      giniPrices: round(giniCoefficient(prices), 3),
      nominationPriceSlopePer10: round(
        regressionSlopePer10(leaguePicks.map(pick => ({ x: pick.pickNo, y: pick.price }))),
        2,
      ),
      top10SpendShare:
        totalSpend === 0
          ? 0
          : round(
              [...prices]
                .sort((a, b) => b - a)
                .slice(0, 10)
                .reduce((sum, price) => sum + price, 0) / totalSpend,
              3,
            ),
    };
  });

  const leagueAgreement = leagues.flatMap((leagueA, index) =>
    leagues.slice(index + 1).map(leagueB => {
      const pricesA = new Map(
        allPicks
          .filter(pick => pick.leagueId === leagueA.leagueId)
          .map(pick => [pick.playerId, pick.price]),
      );
      const pricesB = new Map(
        allPicks
          .filter(pick => pick.leagueId === leagueB.leagueId)
          .map(pick => [pick.playerId, pick.price]),
      );
      const sharedIds = [...pricesA.keys()].filter(playerId => pricesB.has(playerId));
      return {
        leagueAId: leagueA.leagueId,
        leagueAName: leagueA.leagueName,
        leagueBId: leagueB.leagueId,
        leagueBName: leagueB.leagueName,
        sharedPlayers: sharedIds.length,
        spearman: round(
          correlation(
            ranks(sharedIds.map(playerId => pricesA.get(playerId) ?? 0)),
            ranks(sharedIds.map(playerId => pricesB.get(playerId) ?? 0)),
          ),
          3,
        ),
      };
    }),
  );

  const positionOrder = ['QB', 'RB', 'WR', 'TE', 'DEF', 'DST', 'K'];
  const positionRank = (position: string): number => {
    const rank = positionOrder.indexOf(position);
    return rank === -1 ? positionOrder.length : rank;
  };
  const positions = [...new Set(allPicks.map(pick => pick.position))].sort(
    (a, b) => positionRank(a) - positionRank(b) || a.localeCompare(b),
  );
  const quartileLabels = ['Top tier', 'Upper middle', 'Lower middle', 'Depth'];
  const positionMarkets = positions.map(position => ({
    position,
    leagues: leagues.map(league => {
      const prices = allPicks
        .filter(pick => pick.leagueId === league.leagueId && pick.position === position)
        .map(pick => pick.price)
        .sort((a, b) => b - a);
      return {
        leagueId: league.leagueId,
        leagueName: league.leagueName,
        averagePrice: round(average(prices)),
        totalSpend: prices.reduce((sum, price) => sum + price, 0),
        count: prices.length,
        quartiles: quartileLabels.map((label, quartile) => {
          const start = Math.floor((quartile * prices.length) / 4);
          const end = Math.floor(((quartile + 1) * prices.length) / 4);
          const values = prices.slice(start, quartile === 3 ? prices.length : end);
          return { label, averagePrice: round(average(values)), count: values.length };
        }),
      };
    }),
  }));

  const managerAnalytics = draftTeams.map(team => {
    const ordered = [...team.picks].sort((a, b) => b.price - a.price);
    const spend = ordered.reduce((sum, pick) => sum + pick.price, 0);
    const positionSpend = Object.fromEntries(
      positions.map(position => [
        position,
        team.picks
          .filter(pick => pick.position === position)
          .reduce((sum, pick) => sum + pick.price, 0),
      ]),
    );
    return {
      teamId: team.teamId,
      teamName: team.teamName,
      managerName: team.managerName,
      leagueId: team.leagueId,
      leagueName: team.leagueName,
      avatarUrl: team.avatarUrl,
      giniSpend: round(giniCoefficient(ordered.map(pick => pick.price)), 3),
      top1Share: spend === 0 ? 0 : round((ordered[0]?.price ?? 0) / spend, 3),
      top3Share:
        spend === 0
          ? 0
          : round(ordered.slice(0, 3).reduce((sum, pick) => sum + pick.price, 0) / spend, 3),
      starterSpend: team.starterSpend,
      benchSpend: team.benchSpend,
      positionSpend,
    };
  });

  const completeDurations = leagues
    .filter(league => league.finishedAt)
    .map(league => ({
      leagueId: league.leagueId,
      leagueName: league.leagueName,
      durationMinutes:
        (new Date(league.finishedAt as string).getTime() - new Date(league.startedAt).getTime()) /
        60_000,
    }));
  const fastestDraft = [...completeDurations].sort(
    (a, b) => a.durationMinutes - b.durationMinutes,
  )[0];

  const droughts = draftTeams.flatMap(team => {
    const pickNos = team.picks.map(pick => pick.pickNo).sort((a, b) => a - b);
    return pickNos.slice(1).map((pickNo, index) => ({
      teamId: team.teamId,
      teamName: team.teamName,
      managerName: team.managerName,
      leagueName: team.leagueName,
      value: Math.max(0, pickNo - pickNos[index] - 1),
      unit: 'picks' as const,
    }));
  });

  const picksByPlayer = new Map<string, DraftPickReport[]>();
  allPicks.forEach(pick => {
    const existing = picksByPlayer.get(pick.playerId) ?? [];
    existing.push(pick);
    picksByPlayer.set(pick.playerId, existing);
  });
  const priceDivergences = Array.from(picksByPlayer.entries())
    .filter(([, picks]) => new Set(picks.map(pick => pick.leagueId)).size >= 2)
    .map(([playerId, picks]) => {
      const prices = picks.map(pick => pick.price);
      return {
        playerId,
        playerName: picks[0].playerName,
        position: picks[0].position,
        nflTeam: picks[0].nflTeam,
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        spread: Math.max(...prices) - Math.min(...prices),
        prices: picks
          .map(pick => ({
            leagueId: pick.leagueId,
            leagueName: pick.leagueName,
            teamName: pick.teamName,
            price: pick.price,
          }))
          .sort((a, b) => a.price - b.price),
      };
    })
    .sort(
      (a, b) =>
        b.spread - a.spread ||
        b.highPrice - a.highPrice ||
        a.playerName.localeCompare(b.playerName),
    );

  const rosterSimilarities = draftTeams
    .flatMap((teamA, index) =>
      draftTeams.slice(index + 1).flatMap(teamB => {
        if (teamA.leagueId === teamB.leagueId) return [];
        const playerIdsA = new Set(teamA.picks.map(pick => pick.playerId));
        const playerIdsB = new Set(teamB.picks.map(pick => pick.playerId));
        const sharedPlayerIds = [...playerIdsA].filter(playerId => playerIdsB.has(playerId));
        if (sharedPlayerIds.length === 0) return [];
        const unionSize = new Set([...playerIdsA, ...playerIdsB]).size;
        return [
          {
            teamAId: teamA.teamId,
            teamAName: teamA.teamName,
            teamALeague: teamA.leagueName,
            teamBId: teamB.teamId,
            teamBName: teamB.teamName,
            teamBLeague: teamB.leagueName,
            similarity: round(sharedPlayerIds.length / unionSize, 3),
            sharedPlayerIds: sharedPlayerIds.sort(),
            sharedPlayerNames: sharedPlayerIds
              .map(playerId => picksByPlayer.get(playerId)?.[0]?.playerName ?? playerId)
              .sort(),
          },
        ];
      }),
    )
    .sort(
      (a, b) => b.similarity - a.similarity || b.sharedPlayerIds.length - a.sharedPlayerIds.length,
    );

  const teamsByOwner = new Map<string, typeof draftTeams>();
  draftTeams.forEach(team => {
    const existing = teamsByOwner.get(team.ownerId) ?? [];
    existing.push(team);
    teamsByOwner.set(team.ownerId, existing);
  });
  const rootingInterests = Array.from(teamsByOwner.entries())
    .filter(([, teams]) => teams.length >= 2)
    .map(([ownerId, teams]) => {
      const appearances = new Map<string, { playerName: string; leagues: string[] }>();
      teams.forEach(team =>
        team.picks.forEach(pick => {
          const existing = appearances.get(pick.playerId) ?? {
            playerName: pick.playerName,
            leagues: [],
          };
          existing.leagues.push(team.leagueName);
          appearances.set(pick.playerId, existing);
        }),
      );
      return {
        ownerId,
        managerName: teams[0].managerName,
        teams: teams.map(team => ({
          teamId: team.teamId,
          teamName: team.teamName,
          leagueName: team.leagueName,
        })),
        repeatedPlayers: Array.from(appearances.entries())
          .filter(([, appearance]) => new Set(appearance.leagues).size >= 2)
          .map(([playerId, appearance]) => ({
            playerId,
            playerName: appearance.playerName,
            leagues: [...new Set(appearance.leagues)],
          }))
          .sort(
            (a, b) =>
              b.leagues.length - a.leagues.length || a.playerName.localeCompare(b.playerName),
          ),
      };
    })
    .filter(item => item.repeatedPlayers.length > 0)
    .sort((a, b) => b.repeatedPlayers.length - a.repeatedPlayers.length);

  return {
    metadata: {
      season: 2026,
      generatedAt,
      benchmark: {
        name: benchmark.name,
        url: benchmark.url,
        publishedAt: benchmark.publishedAt,
        assumptions: benchmark.assumptions,
      },
      grading: {
        starterWeight: 0.7,
        benchWeight: 0.3,
        method:
          'Percentile-ranked external benchmark value, weighted 70% to lineup-constrained starters and 30% to bench players.',
      },
      timingDisclosure:
        'Sleeper exposes winning-purchase order but not historical per-pick timestamps. Pick-based timing awards count completed purchases, not elapsed minutes.',
    },
    leagues: leagues.map(league => {
      const finishedAt = league.finishedAt ? new Date(league.finishedAt).getTime() : null;
      const durationMinutes =
        finishedAt === null ? null : (finishedAt - new Date(league.startedAt).getTime()) / 60_000;
      return {
        leagueId: league.leagueId,
        leagueName: league.leagueName,
        draftId: league.draftId,
        logo: league.logo,
        status: league.status,
        startedAt: league.startedAt,
        finishedAt: league.finishedAt,
        durationMinutes: durationMinutes === null ? null : round(durationMinutes),
        averageSecondsPerPurchase:
          durationMinutes === null || league.picks.length === 0
            ? null
            : round((durationMinutes * 60) / league.picks.length),
        purchases: league.picks.length,
      };
    }),
    teamGrades,
    marketAnalytics: {
      leagues: marketLeagues,
      leagueAgreement,
      positionMarkets,
    },
    managerAnalytics,
    superlatives: {
      bestValue: bestValue ? toRankedPick(bestValue) : null,
      biggestPremium: biggestPremium ? toRankedPick(biggestPremium) : null,
      highestPrice: highestPrice ? toRankedPick(highestPrice) : null,
      fastestDraft: fastestDraft
        ? { ...fastestDraft, durationMinutes: round(fastestDraft.durationMinutes) }
        : null,
      longestPurchaseDrought:
        [...droughts].sort(
          (a, b) => b.value - a.value || a.teamName.localeCompare(b.teamName),
        )[0] ?? null,
    },
    priceDivergences,
    rosterSimilarities,
    rootingInterests,
  };
};
