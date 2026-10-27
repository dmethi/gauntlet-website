import source from './week-seven-source.json';

const average = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

// Finish every within-Legion comparison before creating cross-Legion tables.
const leagues = source.leagues.map(league => {
  const teams = league.standings.map(team => {
    const expectedWins = team.weeklyScores.reduce((total, score, index) => {
      const others = league.standings.filter(other => other.rosterId !== team.rosterId);
      return (
        total +
        others.reduce(
          (sum, other) =>
            sum +
            (score > other.weeklyScores[index] ? 1 : score === other.weeklyScores[index] ? 0.5 : 0),
          0,
        ) /
          others.length
      );
    }, 0);
    const recentAverage = average(team.weeklyScores.slice(4));
    const earlyAverage = average(team.weeklyScores.slice(0, 4));
    return {
      ...team,
      key: `${league.leagueId}:${team.rosterId}`,
      legion: league.shortName,
      expectedWins,
      winGap: team.wins + team.ties * 0.5 - expectedWins,
      recentAverage,
      earlyAverage,
      formChange: recentAverage - earlyAverage,
    };
  });
  const scores = league.matchups.flatMap(game =>
    game.teams.map(team => ({
      key: `${league.leagueId}:${team.rosterId}`,
      label: team.label,
      legion: league.shortName,
      score: team.score,
    })),
  );
  const starIndependentWins = league.matchups.flatMap(game => {
    const winner = game.teams.find(team => team.rosterId === game.winnerRosterId)!;
    const opponent = game.teams.find(team => team.rosterId !== game.winnerRosterId)!;
    const star = [...winner.starters].sort((a, b) => b.points - a.points)[0];
    const withoutStar = winner.score - star.points;
    return withoutStar > opponent.score
      ? [
          {
            key: `${league.leagueId}:${winner.rosterId}`,
            label: winner.label,
            legion: league.shortName,
            score: winner.score,
            opponentScore: opponent.score,
            star,
            withoutStar,
          },
        ]
      : [];
  });
  const nextWeek = league.nextWeek.map(game => ({
    matchupId: game.matchupId,
    teams: game.rosterIds.map(rosterId => teams.find(team => team.rosterId === rosterId)!),
  }));
  return { ...league, teams, scores, starIndependentWins, nextWeek };
});
const teams = leagues.flatMap(league => league.teams);
const scores = leagues.flatMap(league => league.scores);
const totalPoints = scores.reduce((sum, team) => sum + team.score, 0);

export const WEEK_SEVEN_ANALYSIS = {
  leagues,
  podium: [...scores].sort((a, b) => b.score - a.score).slice(0, 3),
  totalPoints,
  scoringChange: totalPoints - teams.reduce((sum, team) => sum + team.weeklyScores[5], 0),
  favoriteWins: leagues.reduce(
    (sum, league) =>
      sum +
      league.matchups.filter(game => game.winnerRosterId === game.flow.favoriteRosterId).length,
    0,
  ),
  scheduleGaps: [...teams].sort((a, b) => b.winGap - a.winGap),
  rising: [...teams].sort((a, b) => b.formChange - a.formChange).slice(0, 3),
  falling: [...teams].sort((a, b) => a.formChange - b.formChange).slice(0, 3),
  starIndependentWins: leagues
    .flatMap(league => league.starIndependentWins)
    .sort((a, b) => b.withoutStar - b.opponentScore - (a.withoutStar - a.opponentScore)),
};
