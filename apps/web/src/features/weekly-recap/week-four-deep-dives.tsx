import Link from 'next/link';
import snapshot from './week-four-deep-dive-data.json';
import styles from './week-four-deep-dives.module.css';

type Team = (typeof snapshot.teams)[number];
type Game = (typeof snapshot.games)[number];

const format = (value: number) => value.toFixed(2);

const matchupHref = (game: Game) => {
  const leagueIds = {
    Throne: '1387520086092312576',
    Keep: '1387520168866885632',
    Forge: '1387520236663615488',
  } as const;

  return `/matchups/${leagueIds[game.league as keyof typeof leagueIds]}/${game.week}/${game.matchupId}`;
};

export const rankScheduleLuck = (teams: Team[]) => ({
  luckiest: [...teams].sort((a, b) => b.scheduleLuck - a.scheduleLuck).slice(0, 5),
  unluckiest: [...teams].sort((a, b) => a.scheduleLuck - b.scheduleLuck).slice(0, 5),
});

export const thrillerIndex = (game: Game, allGames: Game[]) => {
  const scorePercentile =
    allGames.filter(other => other.combined <= game.combined).length / allGames.length;
  const closeness = 1 - Math.min(game.margin / 20, 1);
  return Math.round(50 * scorePercentile + 50 * closeness);
};

export const finishIndex = (game: Game) => {
  if (!game.finalFeedAligned || !game.lateRescue) return null;

  const swing = game.lateRescue.to - game.lateRescue.from;
  const lateness = Math.min(1, Math.max(0, (game.lateRescue.progress - 0.95) / 0.05));
  const closeness = 1 - Math.min(game.margin / 10, 1);
  return Math.round(50 * swing + 25 * lateness + 25 * closeness);
};

export const rankGames = (games: Game[]) => ({
  thrillers: games
    .filter(game => game.margin <= 10)
    .map(game => ({ game, index: thrillerIndex(game, games) }))
    .sort((a, b) => b.index - a.index)
    .slice(0, 5),
  finishes: games
    .filter(
      game =>
        game.finalFeedAligned &&
        game.lateRescue &&
        game.lateRescue.from <= 0.25 &&
        game.lateRescue.to >= 0.65,
    )
    .map(game => ({ game, index: finishIndex(game) ?? 0 }))
    .sort((a, b) => b.index - a.index)
    .slice(0, 3),
});

const LuckRow = ({ team, rank }: { team: Team; rank: number }) => (
  <li className={styles.luckRow}>
    <span className={styles.rank}>{String(rank).padStart(2, '0')}</span>
    <div className={styles.luckIdentity}>
      <strong>{team.label}</strong>
      <span>
        {team.league} · {team.wins}–{team.losses} · {format(team.points)} PF
      </span>
    </div>
    <div className={styles.luckNumbers}>
      <strong>
        {team.scheduleLuck > 0 ? '+' : ''}
        {format(team.scheduleLuck)}
      </strong>
      <span>{format(team.scheduleExpected)} expected wins</span>
    </div>
  </li>
);

const GameLine = ({
  game,
  index,
  rank,
  finish = false,
}: {
  game: Game;
  index: number;
  rank: number;
  finish?: boolean;
}) => (
  <li className={styles.gameLine}>
    <span className={styles.rank}>{String(rank).padStart(2, '0')}</span>
    <div className={styles.gameIdentity}>
      <span className={styles.gameKicker}>
        {game.league} · Week {game.week}
      </span>
      <Link href={matchupHref(game)}>
        {game.teamA} <span>vs.</span> {game.teamB}
      </Link>
      <span className={styles.gameDetail}>
        {format(game.scoreA)}–{format(game.scoreB)} ·{' '}
        {finish
          ? `${Math.round((game.lateRescue?.from ?? 0) * 100)}% → ${Math.round((game.lateRescue?.to ?? 0) * 100)}% in ${Math.round((game.lateRescue?.seconds ?? 0) / 60)} min`
          : `${format(game.combined)} combined · ${format(game.margin)} margin`}
      </span>
    </div>
    <div className={styles.index}>
      <strong>{index}</strong>
      <span>{finish ? 'finish' : 'thriller'} index</span>
    </div>
  </li>
);

export const WeekFourDeepDives = () => {
  const { luckiest, unluckiest } = rankScheduleLuck(snapshot.teams);
  const { thrillers, finishes } = rankGames(snapshot.games);
  const sid = snapshot.teams.find(team => team.league === 'Forge' && team.rosterId === 5)!;
  const harry = snapshot.teams.find(team => team.league === 'Keep' && team.rosterId === 5)!;

  return (
    <div className={styles.supplement}>
      <section className={styles.desk} aria-labelledby="luck-desk-title">
        <header className={styles.deskHeader}>
          <span className={styles.eyebrow}>Supplement I · Schedule desk</span>
          <h2 id="luck-desk-title">Fortune chose its favorites</h2>
          <p>
            Sid is 4–0. Put his same four scores on the other 35 schedules and he averages only{' '}
            {format(sid.scheduleExpected)} wins. Harry has {format(harry.allPlayExpected)} all-play
            expected wins and a 2–2 record.
          </p>
        </header>
        <div className={styles.luckColumns}>
          <div>
            <h3>The favorable draw</h3>
            <ol>
              {luckiest.map((team, index) => (
                <LuckRow key={`${team.league}:${team.rosterId}`} team={team} rank={index + 1} />
              ))}
            </ol>
          </div>
          <div>
            <h3>The hard-luck file</h3>
            <ol>
              {unluckiest.map((team, index) => (
                <LuckRow key={`${team.league}:${team.rosterId}`} team={team} rank={index + 1} />
              ))}
            </ol>
          </div>
        </div>
        <p className={styles.method}>
          Expected wins here are the average of each team’s four-week record against the other 35
          teams’ actual opponent schedules. Luck is actual minus expected wins. Ties count as half
          wins. The all-play figure compares each weekly score with the other 11 teams in its
          Legion. All values use Sleeper’s completed Weeks 1–4.{' '}
          <Link href="/stats?view=schedule">Explore the schedule analysis →</Link>
        </p>
      </section>

      <section className={styles.desk} aria-labelledby="games-desk-title">
        <header className={styles.deskHeader}>
          <span className={styles.eyebrow}>Supplement II · Game ledger</span>
          <h2 id="games-desk-title">The games worth replaying</h2>
          <p>
            Ashwin owns the two highest-scoring nail-biters through Week 4: 261.50 combined points
            with a 0.66 margin, then 260.44 with a 0.78 margin. The second one flipped from 5% to
            94% in a two-minute sample near the end of the matchup.
          </p>
        </header>
        <div className={styles.gamesColumns}>
          <div>
            <h3>High-score thrillers</h3>
            <ol>
              {thrillers.map(({ game, index }, rank) => (
                <GameLine
                  key={`${game.league}:${game.week}:${game.matchupId}`}
                  game={game}
                  index={index}
                  rank={rank + 1}
                />
              ))}
            </ol>
          </div>
          <div>
            <h3>Late rescues</h3>
            <ol>
              {finishes.map(({ game, index }, rank) => (
                <GameLine
                  key={`${game.league}:${game.week}:${game.matchupId}`}
                  game={game}
                  index={index}
                  rank={rank + 1}
                  finish
                />
              ))}
            </ol>
          </div>
        </div>
        <p className={styles.method}>
          Thriller index: 50 points for combined-score percentile among all 72 games, plus 50 for
          closeness (full credit for a tie, zero at a 20-point margin). The list requires a margin
          of ten or fewer. Finish index: 50 points for the eventual winner’s largest upward
          probability swing in a sample of five minutes or less after 95% matchup progress, 25 for
          how late it happened, and 25 for a margin under ten. Finish candidates must climb from 25%
          or lower to at least 65%; their last recorded scores must match Sleeper’s final. Progress
          measures the fantasy matchup, not time left on the NFL game clock.
        </p>
      </section>
    </div>
  );
};
