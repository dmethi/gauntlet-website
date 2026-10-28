import { WEEK_SEVEN_ANALYSIS as analysis } from './week-seven-analysis';
import source from './week-seven-source.json';
import type { ResolvedTeamLabels } from './types';
import styles from './week-seven-field-notes.module.css';

const score = (value: number): string => value.toFixed(2);
const signed = (value: number): string => `${value >= 0 ? '+' : '−'}${score(Math.abs(value))}`;
type Team = (typeof analysis.leagues)[number]['teams'][number];

export const WeekSevenFieldNotes = ({ labels }: { labels: ResolvedTeamLabels }) => {
  const label = (team: { key: string; label: string }): string => labels[team.key] ?? team.label;
  const gapExtremes = [
    ...analysis.scheduleGaps.slice(0, 3),
    ...analysis.scheduleGaps.slice(-3).reverse(),
  ];
  const formTable = (teams: Team[], caption: string) => (
    <table className={styles.table}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Team</th>
          <th scope="col">W1–4 avg</th>
          <th scope="col">W5–7 avg</th>
          <th scope="col">Change</th>
        </tr>
      </thead>
      <tbody>
        {teams.map(team => (
          <tr key={team.key}>
            <th scope="row">
              {label(team)}
              <small>{team.legion}</small>
            </th>
            <td>{score(team.earlyAverage)}</td>
            <td>{score(team.recentAverage)}</td>
            <td>{signed(team.formChange)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  const watchlist = [
    {
      legion: 'Throne',
      matchupId: 2,
      title: 'Someone leaves the five-win crowd',
      copy: 'Christian meets Neil at 5–2. Both won below 107 this week; their seven-week scoring totals are 55.75 points apart.',
    },
    {
      legion: 'Keep',
      matchupId: 6,
      title: 'The Keep’s points leader needs a response',
      copy: 'King Henry’s Court faces Jimothy at 4–3. Rithik has scored 90.25 and 92.35 in his last two; Jimothy just rebounded to 134.98.',
    },
    {
      legion: 'Forge',
      matchupId: 3,
      title: 'The scoring leader meets a four-win challenger',
      copy: 'Aditya’s 5–2 meets Ashwin’s 4–3. Aditya leads the Gauntlet with 952.62 points and has averaged 148.49 over the last three weeks.',
    },
  ];

  return (
    <section
      className={styles.notes}
      id="seven-week-reality-check"
      aria-labelledby="reality-check-title"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Special report · Seven-week reality check</p>
        <h2 id="reality-check-title">
          The record.
          <br />
          The receipts.
        </h2>
        <p>What the standings reward, what the scores say, and what changes next.</p>
        <nav className={styles.contents} aria-label="Week 7 analysis">
          <a href="#scoring-podium">Scoring podium</a>
          <a href="#schedule-dividend">Schedule luck</a>
          <a href="#form-guide">Recent form</a>
          <a href="#star-test">The star test</a>
          <a href="#seven-week-table">All 36 teams</a>
          <a href="#week-eight-watch">Week 8</a>
          <a href="#the-wrong-opponent">18 matchups ↓</a>
        </nav>
      </header>

      <section className={styles.desk} id="scoring-podium" aria-labelledby="podium-title">
        <p className={styles.eyebrow}>The weekly scoring podium</p>
        <h3 id="podium-title">Second place came down to 0.57.</h3>
        <p>
          Checkout had 13.98 points of room at the top. The gap between second and third was much
          less forgiving. These are final Week 7 scores across all three Legions.
        </p>
        <ol className={styles.podium}>
          {analysis.podium.map((team, index) => (
            <li key={team.key}>
              <span className={styles.place}>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <small>
                  {team.legion} · {index < 2 ? 'Payout place' : 'Third place'}
                </small>
                <strong>{label(team)}</strong>
              </div>
              <b>{score(team.score)}</b>
            </li>
          ))}
        </ol>
        <p className={styles.method}>
          Payout places show scoring order only. Final totals were captured from Sleeper on October
          27; later stat corrections can change a close finish.
        </p>
      </section>

      <section className={styles.desk} id="schedule-dividend" aria-labelledby="schedule-title">
        <p className={styles.eyebrow}>The schedule dividend</p>
        <h3 id="schedule-title">Same scores. Different win totals.</h3>
        <p>
          Gibuttersnaps has five wins from a scoring profile worth 2.82 against the full Forge
          field. Harry has three wins from one worth 5.00 against the Keep. Their records are two
          games apart; the scoring baseline points in the other direction.
        </p>
        <table className={styles.table}>
          <caption>The three largest positive and negative record gaps</caption>
          <thead>
            <tr>
              <th scope="col">Team</th>
              <th scope="col">Record</th>
              <th scope="col">All-play xW</th>
              <th scope="col">Win gap</th>
            </tr>
          </thead>
          <tbody>
            {gapExtremes.map(team => (
              <tr key={team.key}>
                <th scope="row">
                  {label(team)}
                  <small>{team.legion}</small>
                </th>
                <td>
                  {team.wins}–{team.losses}
                </td>
                <td>{score(team.expectedWins)}</td>
                <td>{signed(team.winGap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.method}>
          For each week, compare a team with its eleven Legion peers: teams beaten plus half of
          ties, divided by eleven. Add all seven weeks for all-play expected wins (xW). Win gap is
          actual wins minus xW. A positive gap means the actual schedule yielded more wins. This
          describes past results; it is not a playoff forecast.
        </p>
      </section>

      <section className={styles.desk} id="form-guide" aria-labelledby="form-title">
        <p className={styles.eyebrow}>The form guide</p>
        <h3 id="form-title">Checkout’s surge is bigger than one week.</h3>
        <p>
          The scoring leader has averaged 140.43 since Week 5, up 33.06 from the opening four weeks.
          Mexican Cartel is close behind in improvement. Marginal Returns still makes the rising
          list despite this week’s 83.97—a reminder that a three-week average can conceal a rough
          latest result.
        </p>
        <div className={styles.columns}>
          {formTable(analysis.rising, 'Largest increases')}
          {formTable(analysis.falling, 'Largest decreases')}
        </div>
        <p className={styles.method}>
          Weeks 5–7 average minus Weeks 1–4 average, in points per week. Scores use each Legion’s
          own rules; no opponent or bye adjustment. This is a retrospective comparison, not a
          projection.
        </p>
      </section>

      <section className={styles.desk} id="star-test" aria-labelledby="star-title">
        <p className={styles.eyebrow}>The star test</p>
        <h3 id="star-title">Five winners could have benched their best score.</h3>
        <p>
          Set each winner’s highest-scoring starter to zero and leave everything else alone. Only
          these five still beat their actual opponent. Luke had the most insulation; Neil had just
          0.83 to spare.
        </p>
        <table className={styles.table}>
          <caption>A subtraction experiment, not a lineup recommendation</caption>
          <thead>
            <tr>
              <th scope="col">Winner / removed starter</th>
              <th scope="col">Removed</th>
              <th scope="col">Remaining</th>
              <th scope="col">Opponent</th>
            </tr>
          </thead>
          <tbody>
            {analysis.starIndependentWins.map(team => (
              <tr key={team.key}>
                <th scope="row">
                  {label(team)}
                  <small>
                    {team.legion} · {team.star.name}
                  </small>
                </th>
                <td>{score(team.star.points)}</td>
                <td>{score(team.withoutStar)}</td>
                <td>{score(team.opponentScore)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.method}>
          The other thirteen winners needed at least some of their top starter’s points. This
          measures margin and score concentration in one matchup; it does not measure roster depth
          or injury resilience.
        </p>
      </section>

      <section className={styles.desk} id="seven-week-table" aria-labelledby="standings-title">
        <p className={styles.eyebrow}>The full table</p>
        <h3 id="standings-title">Nine teams, three Legions, five wins apiece.</h3>
        <p>
          Four share the Throne lead, three share the Keep lead, and two share the Forge lead. Ben
          leads the Throne in points from fifth in this record-first listing. Harry is third in
          Gauntlet scoring from eighth in the Keep.
        </p>
        <div className={styles.standings}>
          {analysis.leagues.map(league => (
            <table className={styles.table} key={league.leagueId}>
              <caption>{league.name}</caption>
              <thead>
                <tr>
                  <th scope="col">Team</th>
                  <th scope="col">W–L</th>
                  <th scope="col">Points</th>
                  <th scope="col">xW</th>
                </tr>
              </thead>
              <tbody>
                {league.teams.map(team => (
                  <tr key={team.key}>
                    <th scope="row">{label(team)}</th>
                    <td>
                      {team.wins}–{team.losses}
                    </td>
                    <td>{score(team.pointsFor)}</td>
                    <td>{score(team.expectedWins)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
        <p className={styles.method}>
          Records recomputed from corrected Weeks 1–7 matchup totals. Ordered by wins, then points
          for within each Legion; division seeding and playoff tiebreakers are not applied. xW uses
          only peers in the same Legion.
        </p>
      </section>

      <section className={styles.desk} id="week-eight-watch" aria-labelledby="watch-title">
        <p className={styles.eyebrow}>Next on the docket · Week 8</p>
        <h3 id="watch-title">The crowded tables get another test.</h3>
        <div className={styles.watchlist}>
          {watchlist.map(item => {
            const league = analysis.leagues.find(league => league.shortName === item.legion)!;
            const game = league.nextWeek.find(game => game.matchupId === item.matchupId)!;
            return (
              <article key={item.legion}>
                <p className={styles.eyebrow}>{item.legion}</p>
                <h4>{item.title}</h4>
                <p>{item.copy}</p>
                <a href={`/matchups/${league.leagueId}/8/${game.matchupId}`}>
                  {game.teams.map(label).join(' vs. ')} ↗
                </a>
              </article>
            );
          })}
        </div>
        <details className={styles.details}>
          <summary>All eighteen Week 8 matchups</summary>
          <div className={styles.watchlist}>
            {analysis.leagues.map(league => (
              <div key={league.leagueId}>
                <h4>{league.shortName}</h4>
                <ul>
                  {league.nextWeek.map(game => (
                    <li key={game.matchupId}>
                      <a href={`/matchups/${league.leagueId}/8/${game.matchupId}`}>
                        {game.teams.map(label).join(' vs. ')}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
        <p className={styles.method}>
          Week 8 pairings are from Sleeper’s schedule. All records and scoring comparisons above
          stop at Week 7; no Week 8 points or live projections enter this edition.
        </p>
      </section>
      <details className={styles.details}>
        <summary>Sources and the publication cutoff</summary>
        <p className={styles.method}>
          This edition freezes public Sleeper scores, starters, bench points, roster identities, and
          Week 8 pairings as captured at {source.capturedAt}. The Week 7 driveFF feed supplies
          opening probabilities and chart qualifications. All standings and seven-week analysis stop
          after Week 7.
        </p>
        <ul>
          {analysis.leagues.map(league => (
            <li key={league.leagueId}>
              <a href={`https://api.sleeper.app/v1/league/${league.leagueId}/matchups/7`}>
                {league.shortName} · Week 7 box scores
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.method}>
          Lineup autopsies use the week’s recorded roster and actual eligible slots, permitting flex
          reassignment. They describe alternatives in hindsight, not what was knowable or available
          before kickoff.
        </p>
      </details>
    </section>
  );
};
