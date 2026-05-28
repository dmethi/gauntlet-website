import { CURRENT_LEAGUES } from '@/config/leagues';

const SLEEPER = 'https://api.sleeper.app/v1';

async function sleeper<T>(path: string): Promise<T> {
  const res = await fetch(`${SLEEPER}/${path}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Sleeper ${path}: ${res.status}`);
  return res.json();
}

interface SleeperRoster {
  roster_id: number;
  owner_id: string | null;
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
  };
}

interface SleeperUser {
  user_id: string;
  display_name: string;
  username: string;
  metadata?: { team_name?: string };
}

interface SleeperMatchup {
  roster_id: number;
  points: number;
  matchup_id: number;
}

interface BracketMatch {
  r: number;
  m: number;
  t1: number | null;
  t2: number | null;
  w: number | null;
  l: number | null;
}

export interface SeasonStats {
  totals: {
    managers: number;
    leagues: number;
    prizePool: number;
    buyIn: number;
    totalPointsScored: number;
    totalGames: number;
  };
  champions: Array<{
    leagueId: string;
    leagueName: string;
    champion: { name: string | null; rosterId: number | null; seasonPoints: number };
    runnerUp: { name: string | null; rosterId: number | null };
    thirdPlace: { name: string | null; rosterId: number | null };
  }>;
  bestRecords: Array<{
    leagueId: string;
    leagueName: string;
    managerName: string | null;
    wins: number;
    losses: number;
    points: number;
  }>;
  awards: {
    topPointsScorer: { managerName: string; leagueName: string; points: number } | null;
    allTimeHighScore: {
      managerName: string;
      leagueName: string;
      points: number;
      week: number;
    } | null;
    weeklyWarrior: { managerName: string; wins: number } | null;
    narrowestVictory: {
      managerName: string;
      opponentName: string;
      leagueName: string;
      margin: number;
      week: number;
    } | null;
    biggestBlowout: {
      managerName: string;
      opponentName: string;
      leagueName: string;
      margin: number;
      week: number;
    } | null;
  };
}

function totalPoints(r: SleeperRoster): number {
  return (r.settings.fpts || 0) + (r.settings.fpts_decimal || 0) / 100;
}

function getTeamName(rosterId: number, rosters: SleeperRoster[], users: SleeperUser[]): string {
  const roster = rosters.find(r => r.roster_id === rosterId);
  if (!roster?.owner_id) return `Team ${rosterId}`;
  const user = users.find(u => u.user_id === roster.owner_id);
  return user?.metadata?.team_name || user?.display_name || user?.username || `Team ${rosterId}`;
}

function findChampion(bracket: BracketMatch[]): number | null {
  if (!bracket.length) return null;
  const maxRound = Math.max(...bracket.map(m => m.r));
  return bracket.filter(m => m.r === maxRound)[0]?.w ?? null;
}

function findRunnerUp(bracket: BracketMatch[]): number | null {
  if (!bracket.length) return null;
  const maxRound = Math.max(...bracket.map(m => m.r));
  return bracket.filter(m => m.r === maxRound)[0]?.l ?? null;
}

function findThirdPlace(bracket: BracketMatch[]): number | null {
  if (!bracket.length) return null;
  const maxRound = Math.max(...bracket.map(m => m.r));
  const finalRound = bracket.filter(m => m.r === maxRound);
  if (finalRound.length > 1) return finalRound[1]?.w ?? null;
  const penultimate = bracket.filter(m => m.r === maxRound - 1);
  if (penultimate.length > 1) return penultimate[1]?.w ?? null;
  return null;
}

export async function fetchSeasonStats(): Promise<SeasonStats> {
  const leagueData = await Promise.all(
    CURRENT_LEAGUES.map(async league => {
      const [rosters, users, bracket] = await Promise.all([
        sleeper<SleeperRoster[]>(`league/${league.id}/rosters`),
        sleeper<SleeperUser[]>(`league/${league.id}/users`),
        sleeper<BracketMatch[]>(`league/${league.id}/winners_bracket`).catch(() => []),
      ]);

      const weeklyMatchups = await Promise.all(
        Array.from({ length: 14 }, (_, i) => i + 1).map(week =>
          sleeper<SleeperMatchup[]>(`league/${league.id}/matchups/${week}`)
            .then(matchups => ({ week, matchups, leagueId: league.id, leagueName: league.name }))
            .catch(() => ({ week, matchups: [], leagueId: league.id, leagueName: league.name })),
        ),
      );

      return { league, rosters, users, bracket, weeklyMatchups };
    }),
  );

  const champions = leagueData.map(({ league, rosters, users, bracket }) => {
    const champRosterId = findChampion(bracket);
    const runnerUpId = findRunnerUp(bracket);
    const thirdId = findThirdPlace(bracket);
    const champRoster = rosters.find(r => r.roster_id === champRosterId);

    return {
      leagueId: league.id,
      leagueName: league.name,
      champion: {
        name: champRosterId ? getTeamName(champRosterId, rosters, users) : null,
        rosterId: champRosterId,
        seasonPoints: champRoster ? totalPoints(champRoster) : 0,
      },
      runnerUp: {
        name: runnerUpId ? getTeamName(runnerUpId, rosters, users) : null,
        rosterId: runnerUpId,
      },
      thirdPlace: {
        name: thirdId ? getTeamName(thirdId, rosters, users) : null,
        rosterId: thirdId,
      },
    };
  });

  const allRosters = leagueData.flatMap(({ rosters }) => rosters);
  const totalPointsScored = allRosters.reduce((sum, r) => sum + totalPoints(r), 0);
  const totalGames =
    allRosters.reduce((sum, r) => sum + r.settings.wins + r.settings.losses, 0) / 2;

  const bestRecords = leagueData.map(({ league, rosters, users }) => {
    const sorted = [...rosters].sort((a, b) => {
      const diff = b.settings.wins - a.settings.wins;
      return diff !== 0 ? diff : totalPoints(b) - totalPoints(a);
    });
    const best = sorted[0];
    return {
      leagueId: league.id,
      leagueName: league.name,
      managerName: best ? getTeamName(best.roster_id, rosters, users) : null,
      wins: best?.settings.wins ?? 0,
      losses: best?.settings.losses ?? 0,
      points: best ? totalPoints(best) : 0,
    };
  });

  const allRosterPoints = leagueData.flatMap(({ league, rosters, users }) =>
    rosters.map(r => ({
      managerName: getTeamName(r.roster_id, rosters, users),
      leagueName: league.name,
      points: totalPoints(r),
      wins: r.settings.wins,
      losses: r.settings.losses,
    })),
  );
  const topPointsScorer = allRosterPoints.sort((a, b) => b.points - a.points)[0] ?? null;

  const highScoresByWeek: Array<{
    week: number;
    managerName: string;
    leagueName: string;
    points: number;
  }> = [];

  let allTimeHighScore = { managerName: '', leagueName: '', points: 0, week: 0 };
  let narrowestVictory = {
    managerName: '',
    opponentName: '',
    leagueName: '',
    margin: Infinity,
    week: 0,
  };
  let biggestBlowout = {
    managerName: '',
    opponentName: '',
    leagueName: '',
    margin: 0,
    week: 0,
  };

  for (const { league, rosters, users, weeklyMatchups } of leagueData) {
    for (const { week, matchups } of weeklyMatchups) {
      if (!matchups.length) continue;

      const topInLeague = matchups.reduce(
        (best, m) => (m.points > best.points ? m : best),
        matchups[0],
      );

      if (topInLeague) {
        const managerName = getTeamName(topInLeague.roster_id, rosters, users);
        highScoresByWeek.push({
          week,
          managerName,
          leagueName: league.name,
          points: topInLeague.points,
        });

        if (topInLeague.points > allTimeHighScore.points) {
          allTimeHighScore = {
            managerName,
            leagueName: league.name,
            points: topInLeague.points,
            week,
          };
        }
      }

      const matchupGroups = new Map<number, SleeperMatchup[]>();
      matchups.forEach(m => {
        if (!matchupGroups.has(m.matchup_id)) matchupGroups.set(m.matchup_id, []);
        matchupGroups.get(m.matchup_id)!.push(m);
      });

      matchupGroups.forEach(pair => {
        if (pair.length !== 2) return;
        const [a, b] = pair;
        const margin = Math.abs(a.points - b.points);
        const winner = a.points > b.points ? a : b;
        const loser = a.points > b.points ? b : a;

        if (margin < narrowestVictory.margin && margin > 0) {
          narrowestVictory = {
            managerName: getTeamName(winner.roster_id, rosters, users),
            opponentName: getTeamName(loser.roster_id, rosters, users),
            leagueName: league.name,
            margin,
            week,
          };
        }
        if (margin > biggestBlowout.margin) {
          biggestBlowout = {
            managerName: getTeamName(winner.roster_id, rosters, users),
            opponentName: getTeamName(loser.roster_id, rosters, users),
            leagueName: league.name,
            margin,
            week,
          };
        }
      });
    }
  }

  const crossLeagueWeeklyWins: Record<string, number> = {};
  for (let week = 1; week <= 14; week++) {
    const weekScores = highScoresByWeek.filter(h => h.week === week);
    if (!weekScores.length) continue;
    const weekWinner = weekScores.reduce(
      (best, h) => (h.points > best.points ? h : best),
      weekScores[0],
    );
    crossLeagueWeeklyWins[weekWinner.managerName] =
      (crossLeagueWeeklyWins[weekWinner.managerName] || 0) + 1;
  }

  const weeklyWarrior =
    Object.entries(crossLeagueWeeklyWins)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ managerName: name, wins: count }))[0] ?? null;

  return {
    totals: {
      managers: 24,
      leagues: 2,
      prizePool: 12000,
      buyIn: 500,
      totalPointsScored: Math.round(totalPointsScored),
      totalGames: Math.round(totalGames),
    },
    champions,
    bestRecords,
    awards: {
      topPointsScorer,
      allTimeHighScore: allTimeHighScore.points > 0 ? allTimeHighScore : null,
      weeklyWarrior,
      narrowestVictory: isFinite(narrowestVictory.margin) ? narrowestVictory : null,
      biggestBlowout: biggestBlowout.margin > 0 ? biggestBlowout : null,
    },
  };
}
