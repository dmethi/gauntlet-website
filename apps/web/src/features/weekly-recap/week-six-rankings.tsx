import type { ResolvedTeamLabels } from './types';
import type { PlayerReturn } from './report-rankings';
import { WEEK_SIX_RANKINGS as rankings } from './week-six-rankings-data';
import styles from './week-six-rankings.module.css';

const number = (value: number) => value.toFixed(2);
const signed = (value: number) => `${value >= 0 ? '+' : '−'}${number(Math.abs(value))}`;
const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
type Draft = (typeof rankings.drafts.best)[number];
type Position = (typeof rankings.positions.best)[number];
type Labels = { labels: ResolvedTeamLabels };
const teamName = (row: { teamKey: string; label: string }, labels: ResolvedTeamLabels) =>
  labels[row.teamKey] ?? row.label;

const DraftTable = ({ title, rows, labels }: { title: string; rows: Draft[] } & Labels) => (
  <table className={styles.rankingTable}>
    <caption>{title}</caption>
    <thead>
      <tr>
        <th scope="col">Team</th>
        <th scope="col">Spent</th>
        <th scope="col">VORP</th>
        <th scope="col">VORP/$</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row, index) => (
        <tr key={row.teamKey}>
          <th scope="row">
            <strong>
              <span className={styles.rank}>{index + 1}.</span> {teamName(row, labels)}
            </strong>
            <small>
              {row.legion} · {row.starts} draft-player starts
            </small>
          </th>
          <td>${row.cost}</td>
          <td>{number(row.vorp)}</td>
          <td className={styles.result}>{number(row.vorpPerDollar)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const PlayerTable = ({
  title,
  rows,
  kind,
  labels,
}: {
  title: string;
  rows: PlayerReturn[];
  kind: 'draft' | 'transaction';
} & Labels) => (
  <table className={styles.rankingTable}>
    <caption>{title}</caption>
    <thead>
      <tr>
        <th scope="col">Player / Team</th>
        <th scope="col">{kind === 'draft' ? 'Price' : 'FAAB'}</th>
        <th scope="col">VORP</th>
        <th scope="col">{kind === 'draft' ? 'Surplus' : 'Return'}</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row, index) => (
        <tr key={row.key}>
          <th scope="row">
            <strong>
              <span className={styles.rank}>{index + 1}.</span> {row.player}
            </strong>
            <small>
              {teamName(row, labels)} · {row.legion} · {row.position}
            </small>
            <small>
              {row.starts} starts
              {kind === 'draft' && row.vorpPerDollar !== null
                ? ` · ${number(row.vorpPerDollar)} VORP/$`
                : ''}
            </small>
          </th>
          <td>${row.cost}</td>
          <td>{signed(row.vorp)}</td>
          <td className={styles.result}>{signed(kind === 'draft' ? row.surplus : row.score)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const PositionTable = ({ title, rows, labels }: { title: string; rows: Position[] } & Labels) => (
  <table className={styles.rankingTable}>
    <caption>{title}</caption>
    <thead>
      <tr>
        <th scope="col">Team / Position</th>
        <th scope="col">Pts/wk</th>
        <th scope="col">Median</th>
        <th scope="col">Edge/wk</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row, index) => (
        <tr key={`${row.teamKey}:${row.position}`}>
          <th scope="row">
            <strong>
              <span className={styles.rank}>{index + 1}.</span> {teamName(row, labels)}
            </strong>
            <small>
              {row.legion} · {row.position}
            </small>
          </th>
          <td>{number(row.average)}</td>
          <td>{number(row.baseline)}</td>
          <td className={styles.result}>{signed(row.edge)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const WeekSixRankings = ({ labels }: Labels) => {
  const volatile = rankings.volatility.best[0];
  const steady = rankings.volatility.worst[0];
  const dependent = rankings.concentration.best[0];
  const balanced = rankings.concentration.worst[0];
  const bomb = rankings.benchBomb;
  const unused = rankings.unstartedClaim;
  const purdy = rankings.picks.best.find(
    row => row.player === 'Brock Purdy' && row.legion === 'Keep',
  );

  return (
    <section id="six-week-rankings" className={styles.supplement} aria-labelledby="rankings-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>The six-week audit · 36 drafts · Three separate markets</p>
        <h2 id="rankings-title">Where the Money Went</h2>
        <p>
          Draft night has six weeks of receipts. These are the players, pickups, and position groups
          that returned value—and the investments still waiting for it.
        </p>
      </header>
      <nav className={styles.contents} aria-label="Six-week ranking sections">
        <a href="#draft-returns">Drafts</a>
        <a href="#auction-picks">Auction picks</a>
        <a href="#transaction-returns">Transactions</a>
        <a href="#position-edges">Positions</a>
        <a href="#outlier-desk">Outliers</a>
      </nav>

      <section id="draft-returns" className={styles.desk} aria-labelledby="draft-returns-title">
        <p className={styles.eyebrow}>I. The auction ledger</p>
        <h3 id="draft-returns-title">Best & Worst Draft Returns</h3>
        <p>
          Rithik’s $200 draft leads at {number(rankings.drafts.best[0].vorpPerDollar)} VORP per
          dollar. Hunter’s returns {number(rankings.drafts.worst[0].vorpPerDollar)}. This ranks
          realized starter value from the original draft, before each player’s first departure.
        </p>
        <div className={styles.columns}>
          <DraftTable
            title="Highest return per auction dollar"
            rows={rankings.drafts.best}
            labels={labels}
          />
          <DraftTable
            title="Lowest return per auction dollar"
            rows={rankings.drafts.worst}
            labels={labels}
          />
        </div>
        <p className={styles.method}>
          VORP = a started player’s points minus that week’s median same-position bench score in the
          same Legion. Benched, injured, and unstarted picks retain their full auction cost and earn
          no starter VORP. A dropped or traded player’s later production belongs to the next
          acquisition. These are results through Week 6, not grades of draft-day intent.
        </p>
      </section>

      <section id="auction-picks" className={styles.desk} aria-labelledby="auction-picks-title">
        <p className={styles.eyebrow}>II. Bargains & shortfalls</p>
        <h3 id="auction-picks-title">Six Dollars Bought the Best Surplus</h3>
        <p>
          Both $6 Chuba Hubbard copies top the surplus ledger.{' '}
          {purdy && (
            <>
              Vinay’s $2 Brock Purdy has returned {number(purdy.vorpPerDollar!)} VORP per
              dollar.{' '}
            </>
          )}
          At the other end, expensive players with missed starts and thin production carry the
          largest shortfalls.
        </p>
        <div className={styles.columns}>
          <PlayerTable
            title="Largest auction surpluses"
            rows={rankings.picks.best}
            kind="draft"
            labels={labels}
          />
          <PlayerTable
            title="Largest auction shortfalls"
            rows={rankings.picks.worst}
            kind="draft"
            labels={labels}
          />
        </div>
        <p className={styles.method}>
          Surplus = pick VORP − price × the Legion’s total draft VORP per dollar. It asks whether a
          purchase beat the realized return on auction money in its own market. Surpluses sum to
          zero within each Legion. Raw VORP and VORP/$ remain visible; neither surplus nor a
          cheap-player ratio is a forecast.
        </p>
      </section>

      <section
        id="transaction-returns"
        className={styles.desk}
        aria-labelledby="transaction-returns-title"
      >
        <p className={styles.eyebrow}>
          III. The wire · {rankings.totalTransactions} completed adds
        </p>
        <h3 id="transaction-returns-title">Some of the Best Work Was Free</h3>
        <p>
          Emanuel Wilson and Braelon Allen dominate the return board. All four leading pickups cost
          nothing. The bottom end shows how a defensive streamer can lose more replacement value in
          one start than a bench stash loses in weeks.
        </p>
        <div className={styles.columns}>
          <PlayerTable
            title="Best waiver & free-agent returns"
            rows={rankings.transactions.best}
            kind="transaction"
            labels={labels}
          />
          <PlayerTable
            title="Worst waiver & free-agent returns"
            rows={rankings.transactions.worst}
            kind="transaction"
            labels={labels}
          />
        </div>
        <p className={styles.method}>
          Return = starter VORP − 25 × (FAAB paid / $200 budget), matching driveFF’s transaction
          scale. Spending the full budget deducts 25 points; a free add deducts zero. This
          conversion is a grading convention, so raw VORP and dollars are shown alongside it. Only
          starts in that acquisition’s ownership stint count. Failed claims, next-Wednesday pickups,
          and later reacquisitions do not get credited to an earlier move. Waiver ranks grade the
          added player; they do not subtract the value of the player dropped.
        </p>
        {rankings.trades.map(trade => (
          <aside className={styles.trade} key={trade.key}>
            <h4>The only completed trade: {trade.legion}</h4>
            {trade.sides.map(side => (
              <p key={side.rosterId}>
                <strong>{side.label}</strong> received {side.received}:{' '}
                <strong>{signed(side.netVorp)} net VORP</strong> through Week 6.
              </p>
            ))}
            <small>
              Received players’ realized starter VORP minus the production delivered to the other
              side. Already-played starts stay with the lineup that recorded them. Future draft
              picks and player points after a later departure are excluded; this is not a final
              trade verdict.
            </small>
          </aside>
        ))}
      </section>

      <section id="position-edges" className={styles.desk} aria-labelledby="position-edges-title">
        <p className={styles.eyebrow}>IV. Positional strengths & holes</p>
        <h3 id="position-edges-title">Daal and Aman Own the Running-Back Edge</h3>
        <p>
          Their running backs produce 59.95 points per week, 22.45 above the Throne median. Vinay’s
          running backs sit 18.13 below the Keep median. The gap is measured against local
          competition, with flex production counted at the player’s actual position.
        </p>
        <div className={styles.columns}>
          <PositionTable
            title="Five strongest positional edges"
            rows={rankings.positions.best}
            labels={labels}
          />
          <PositionTable
            title="Five largest positional deficits"
            rows={rankings.positions.worst}
            labels={labels}
          />
        </div>
        <table className={`${styles.rankingTable} ${styles.positionSummary}`}>
          <caption>Leaders and laggards at every position</caption>
          <thead>
            <tr>
              <th scope="col">Position</th>
              <th scope="col">Largest edge</th>
              <th scope="col">Largest deficit</th>
            </tr>
          </thead>
          <tbody>
            {rankings.byPosition.map(row => (
              <tr key={row.position}>
                <th scope="row">{row.position}</th>
                {[row.best[0], row.worst[0]].map(team => (
                  <td key={team.teamKey}>
                    <strong>{teamName(team, labels)}</strong>
                    <small>
                      {team.legion} · {number(team.average)} pts/wk · <b>{signed(team.edge)}</b> vs
                      median
                    </small>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.method}>
          Weekly averages use six completed weeks and include every started player at the position,
          including flex. The median is the median of the 12 team averages within that Legion. These
          are total position-group contributions: starting two tight ends can create a TE edge while
          using a flex slot that could have produced points elsewhere.
        </p>
      </section>

      <section id="outlier-desk" className={styles.desk} aria-labelledby="outlier-desk-title">
        <p className={styles.eyebrow}>V. The outlier desk</p>
        <h3 id="outlier-desk-title">Four More Receipts Worth Keeping</h3>
        <div className={styles.outliers}>
          <article>
            <p className={styles.stat}>{percent(volatile.volatility)}</p>
            <h4>The weekly roller coaster</h4>
            <p>
              {teamName(volatile, labels)} has the largest coefficient of variation: a{' '}
              {number(volatile.low)} floor and {number(volatile.high)} ceiling.{' '}
              {teamName(steady, labels)} is the steadiest at {percent(steady.volatility)}, with
              every score between {number(steady.low)} and {number(steady.high)}.
            </p>
          </article>
          <article>
            <p className={styles.stat}>{percent(dependent.concentration)}</p>
            <h4>The one-player economy</h4>
            <p>
              {dependent.star} accounts for {number(dependent.starPoints)} of{' '}
              {teamName(dependent, labels)}’s {number(dependent.total)} points—the largest
              single-player share. {teamName(balanced, labels)} is the least concentrated: its top
              scorer supplies {percent(balanced.concentration)}.
            </p>
          </article>
          <article>
            <p className={styles.stat}>{number(bomb.points)}</p>
            <h4>The biggest bench eruption</h4>
            <p>
              {bomb.player} scored {number(bomb.points)} on {bomb.label}’s bench in Week {bomb.week}
              , the largest unused individual score across the six-week sample. This measures unused
              points, not whether benching him was defensible before kickoff.
            </p>
          </article>
          <article>
            <p className={styles.stat}>${unused.cost}</p>
            <h4>The expensive nonappearance</h4>
            <p>
              {unused.player} cost {teamName(unused, labels)} ${unused.cost} in FAAB and produced no
              starts during that ownership stint through Week 6—the largest paid claim with zero
              realized starts. A stash can still have future value; the receipt so far is empty.
            </p>
          </article>
        </div>
        <p className={styles.method}>
          Volatility is population standard deviation divided by mean weekly team score.
          Concentration is the highest individual’s started points divided by team points. Bench
          records cover rostered non-starters. All 36 teams have six observations; these are
          descriptive outliers, not predictive models.
        </p>
      </section>

      <details className={styles.sourceNote}>
        <summary>Sources, ownership rules & the Week 6 cutoff</summary>
        <p>
          Sleeper auction picks, completed transactions, and corrected matchup box scores are frozen
          through October 20, 2026 at 4 a.m. ET. Transaction completion time determines inclusion,
          rather than Sleeper’s transaction leg. Each recorded start belongs to the latest
          overlapping acquisition stint for the roster whose lineup recorded it, preserving
          already-played points across a midweek trade.
        </p>
        <p>
          Replacement levels include zero-scoring bench players and are calculated by position,
          Legion, and week. This matches driveFF’s position-specific bench baseline; it differs from
          the legacy universal starter-median model in the website’s Transactions tab. Copies of the
          same NFL player are separate auction purchases in separate Legions.
        </p>
        <p>
          Public source examples:{' '}
          <a href="https://api.sleeper.app/v1/draft/1387520088348844032/picks">Throne auction</a>,{' '}
          <a href="https://api.sleeper.app/v1/league/1387520086092312576/matchups/6">
            Week 6 box scores
          </a>
          , and{' '}
          <a href="https://api.sleeper.app/v1/league/1387520086092312576/transactions/6">
            transaction feed
          </a>
          .
        </p>
      </details>
    </section>
  );
};
