import { ArrowDownRight, ArrowUpRight, Clock3, Trophy } from 'lucide-react';
import { MatchupChartPanel } from './matchup-chart-panel';
import type { HistoricalReceipt, ResolvedTeamLabels, WeekOneMatchup, WeekOneRecap } from './types';
import styles from './week-one-recap.module.css';

const score = (value: number) => value.toFixed(2);
const percent = (value: number) => `${Math.round(value * 100)}%`;

const getLabel = (
  labels: ResolvedTeamLabels,
  leagueId: string,
  rosterId: number,
  fallback: string,
) => labels[`${leagueId}:${rosterId}`] ?? fallback;

const matchupLabels = (matchup: WeekOneMatchup, labels: ResolvedTeamLabels) =>
  matchup.teams.map(team => ({
    rosterId: team.rosterId,
    label: getLabel(labels, matchup.leagueId, team.rosterId, team.fallbackLabel),
  })) as [{ rosterId: number; label: string }, { rosterId: number; label: string }];

const ScoringDistribution = ({ report }: { report: WeekOneRecap }) => {
  const scores = report.leagues.flatMap(league =>
    league.matchups.flatMap(matchup => matchup.teams.map(team => team.score)),
  );
  const bins = [
    { label: '<80', min: 0, max: 80 },
    { label: '80s', min: 80, max: 90 },
    { label: '90s', min: 90, max: 100 },
    { label: '100s', min: 100, max: 110 },
    { label: '110s', min: 110, max: 120 },
    { label: '120s', min: 120, max: 130 },
    { label: '130s', min: 130, max: 140 },
    { label: '140s', min: 140, max: 150 },
    { label: '150+', min: 150, max: Infinity },
  ].map(bin => ({
    ...bin,
    count: scores.filter(value => value >= bin.min && value < bin.max).length,
  }));
  const maxCount = Math.max(...bins.map(bin => bin.count));

  return (
    <figure className={styles.distribution} aria-labelledby="score-distribution-title">
      <div className={styles.figureHeading}>
        <div>
          <p className={styles.eyebrow}>The scoring weather</p>
          <h2 id="score-distribution-title">Thirty-six scores, one crowded middle</h2>
        </div>
        <p>
          <strong>117.17</strong> average · <strong>157.80</strong> high · <strong>63.75</strong>{' '}
          low
        </p>
      </div>
      <div className={styles.histogram}>
        {bins.map(bin => (
          <div className={styles.histogramBin} key={bin.label}>
            <span className={styles.histogramCount}>{bin.count}</span>
            <span
              className={styles.histogramBar}
              style={{ height: `${Math.max(8, (bin.count / maxCount) * 100)}%` }}
              aria-hidden="true"
            />
            <span className={styles.histogramLabel}>{bin.label}</span>
          </div>
        ))}
      </div>
      <figcaption>
        Final scores in 10-point bands. Sleeper totals are the final authority.
      </figcaption>
    </figure>
  );
};

const OpeningLineLedger = ({
  report,
  labels,
}: {
  report: WeekOneRecap;
  labels: ResolvedTeamLabels;
}) => {
  const upsets = report.leagues
    .flatMap(league => league.matchups.map(matchup => ({ league, matchup })))
    .filter(({ matchup }) => matchup.winnerRosterId !== matchup.openingFavoriteRosterId)
    .map(({ league, matchup }) => {
      const winner = matchup.teams.find(team => team.rosterId === matchup.winnerRosterId)!;
      const loser = matchup.teams.find(team => team.rosterId !== matchup.winnerRosterId)!;
      return {
        league: league.shortName,
        winner: getLabel(labels, matchup.leagueId, winner.rosterId, winner.fallbackLabel),
        loser: getLabel(labels, matchup.leagueId, loser.rosterId, loser.fallbackLabel),
        chance: 1 - matchup.openingWinProbability,
        final: `${score(winner.score)}–${score(loser.score)}`,
      };
    })
    .sort((a, b) => a.chance - b.chance);

  return (
    <section className={styles.ledger} aria-labelledby="upset-ledger-title">
      <div className={styles.sectionRule}>
        <p className={styles.eyebrow}>Market report</p>
        <h2 id="upset-ledger-title">The underdog ledger</h2>
        <p>Favorites split the board 9–9. These were the opening lines that lost.</p>
      </div>
      <div className={styles.ledgerRows}>
        {upsets.map(item => (
          <div className={styles.ledgerRow} key={`${item.league}:${item.winner}`}>
            <span className={styles.ledgerLeague}>{item.league}</span>
            <div>
              <strong>{item.winner}</strong>
              <span> over {item.loser}</span>
            </div>
            <span className={styles.ledgerChance}>{percent(item.chance)} at open</span>
            <span className={styles.ledgerFinal}>{item.final}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const MatchupStory = ({
  matchup,
  leagueName,
  labels,
}: {
  matchup: WeekOneMatchup;
  leagueName: string;
  labels: ResolvedTeamLabels;
}) => {
  const [teamOne, teamTwo] = matchupLabels(matchup, labels);
  const winner = matchup.teams.find(team => team.rosterId === matchup.winnerRosterId)!;
  const loser = matchup.teams.find(team => team.rosterId !== matchup.winnerRosterId)!;
  const winnerName = getLabel(labels, matchup.leagueId, winner.rosterId, winner.fallbackLabel);
  const loserName = getLabel(labels, matchup.leagueId, loser.rosterId, loser.fallbackLabel);

  return (
    <article className={`${styles.matchupStory} ${matchup.featured ? styles.featuredStory : ''}`}>
      <div className={styles.matchupCopy}>
        <p className={styles.storyKicker}>
          {leagueName} · Matchup {matchup.matchupId}
        </p>
        <h3>{matchup.headline}</h3>
        <p className={styles.storyDeck}>{matchup.deck}</p>
        <div className={styles.scoreline}>
          <div>
            <Trophy aria-hidden="true" />
            <span>{winnerName}</span>
            <strong>{score(winner.score)}</strong>
          </div>
          <div>
            <span aria-hidden="true" />
            <span>{loserName}</span>
            <strong>{score(loser.score)}</strong>
          </div>
        </div>
        <p className={styles.storyBody}>{matchup.recap}</p>
        <p className={styles.decisiveLabel}>{matchup.decisiveLabel}</p>
      </div>
      <MatchupChartPanel
        leagueId={matchup.leagueId}
        matchupId={matchup.matchupId}
        teamOne={teamOne}
        teamTwo={teamTwo}
        quality={matchup.probabilityQuality}
        note={matchup.probabilityNote}
      />
    </article>
  );
};

const ReceiptVisual = ({ receipt }: { receipt: HistoricalReceipt }) => {
  if (receipt.before == null || receipt.after == null) return null;
  const max = Math.max(Math.abs(receipt.before), Math.abs(receipt.after), 1);
  const beforeWidth = Math.max(8, (Math.abs(receipt.before) / max) * 100);
  const afterWidth = Math.max(8, (Math.abs(receipt.after) / max) * 100);

  return (
    <div
      className={styles.receiptVisual}
      aria-label={`${receipt.beforeLabel} compared with ${receipt.afterLabel}`}
    >
      <div>
        <span>{receipt.beforeLabel}</span>
        <i style={{ width: `${beforeWidth}%` }} />
        <strong>{receipt.before.toFixed(2)}</strong>
      </div>
      <div>
        <span>{receipt.afterLabel}</span>
        <i style={{ width: `${afterWidth}%` }} />
        <strong>{receipt.after.toFixed(2)}</strong>
      </div>
    </div>
  );
};

export const WeekOneRecapView = ({
  report,
  labels,
}: {
  report: WeekOneRecap;
  labels: ResolvedTeamLabels;
}) => {
  const matchupByKey = new Map(
    report.leagues.flatMap(league =>
      league.matchups.map(matchup => [matchup.key, { league, matchup }]),
    ),
  );

  return (
    <main className={styles.paper}>
      <header className={styles.masthead}>
        <div className={styles.folio}>
          <span>Vol. II · No. 1</span>
          <span>Tuesday, September 15, 2026</span>
          <span>Price: one waiver claim</span>
        </div>
        <p className={styles.brand}>The Gauntlet Gazette</p>
        <div className={styles.editionLine}>
          <span>Opening-week edition</span>
          <span>Throne · Keep · Forge</span>
        </div>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>Week 1, reconstructed</p>
        <h1>{report.headline}</h1>
        <p className={styles.subheadline}>{report.subheadline}</p>
        <div className={styles.byline}>
          <span>By The Gauntlet Desk</span>
          <span>
            <Clock3 aria-hidden="true" /> 12 min read
          </span>
        </div>
        <div className={styles.lede}>
          {report.lede.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className={styles.ticker} aria-label="Week 1 at a glance">
        <div>
          <strong>4,218.19</strong>
          <span>total points</span>
        </div>
        <div>
          <strong>9–9</strong>
          <span>favorites vs. field</span>
        </div>
        <div>
          <strong>6</strong>
          <span>big underdog wins</span>
        </div>
        <div>
          <strong>18</strong>
          <span>matchups reviewed</span>
        </div>
      </section>

      <div className={styles.visualGrid}>
        <ScoringDistribution report={report} />
        <OpeningLineLedger report={report} labels={labels} />
      </div>

      <section className={styles.flowDesk} aria-labelledby="flow-desk-title">
        <div className={styles.sectionBanner}>
          <p className={styles.eyebrow}>The game-flow desk</p>
          <h2 id="flow-desk-title">Eighteen games, sorted by how they felt</h2>
          <p>
            Final scores flatten time. These five files restore it—using the score curve, the
            win-probability curve, and who was still waiting to play.
          </p>
        </div>

        {report.flowSections.map((section, index) => (
          <section className={styles.flowSection} id={section.id} key={section.id}>
            <header className={styles.flowHeader}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.deck}</p>
              </div>
            </header>
            <div className={styles.storyGrid}>
              {section.matchupKeys.map(key => {
                const entry = matchupByKey.get(key);
                if (!entry) return null;
                return (
                  <MatchupStory
                    key={key}
                    matchup={entry.matchup}
                    leagueName={entry.league.shortName}
                    labels={labels}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </section>

      <section className={styles.recordsSection} aria-labelledby="record-book-title">
        <div className={styles.sectionBannerDark}>
          <p className={styles.eyebrow}>Permanent ink</p>
          <h2 id="record-book-title">Hall of Fame & Shame</h2>
          <p>Week 1’s statistical outliers, entered into the ledger.</p>
        </div>
        <div className={styles.recordGrid}>
          {report.records.map(record => (
            <article key={record.title}>
              <span>{record.classification}</span>
              <h3>{record.title}</h3>
              <div className={styles.rankRail}>
                <i style={{ left: `${Math.min(94, Math.max(6, (record.rank ?? 8) * 7))}%` }} />
              </div>
              <strong>{record.rankLabel}</strong>
              <p>{record.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.autopsySection} aria-labelledby="autopsy-title">
        <div className={styles.sectionRule}>
          <p className={styles.eyebrow}>Lineup autopsy</p>
          <h2 id="autopsy-title">Five losses hiding on the bench</h2>
          <p>One legal swap would have changed each verdict.</p>
        </div>
        <div className={styles.autopsyGrid}>
          {report.autopsies.map(item => {
            const label = labels[item.teamKey] ?? item.label;
            const max = Math.max(item.revisedScore, item.opponentScore);
            return (
              <article key={item.teamKey}>
                <h3>{label}</h3>
                <p>{item.swap}</p>
                <div className={styles.autopsyBars}>
                  <div>
                    <span>Actual</span>
                    <i style={{ width: `${(item.actualScore / max) * 100}%` }} />
                    <strong>{score(item.actualScore)}</strong>
                  </div>
                  <div>
                    <span>Opponent</span>
                    <i style={{ width: `${(item.opponentScore / max) * 100}%` }} />
                    <strong>{score(item.opponentScore)}</strong>
                  </div>
                  <div className={styles.flippedBar}>
                    <span>Revised</span>
                    <i style={{ width: `${(item.revisedScore / max) * 100}%` }} />
                    <strong>{score(item.revisedScore)}</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.receiptsSection} aria-labelledby="receipts-title">
        <div className={styles.sectionRule}>
          <p className={styles.eyebrow}>Yesterday’s paper</p>
          <h2 id="receipts-title">Receipts from 2025</h2>
          <p>The new season arrived. Some old patterns did not survive the trip.</p>
        </div>
        <div className={styles.receiptGrid}>
          {report.receipts.map((receipt, index) => {
            const up =
              receipt.before != null && receipt.after != null && receipt.after > receipt.before;
            return (
              <article key={receipt.title}>
                <span className={styles.receiptNumber}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.receiptArrow}>
                  {up ? <ArrowUpRight aria-hidden="true" /> : <ArrowDownRight aria-hidden="true" />}
                </span>
                <h3>{receipt.title}</h3>
                <p>{receipt.summary}</p>
                <ReceiptVisual receipt={receipt} />
              </article>
            );
          })}
        </div>
      </section>

      <footer className={styles.colophon}>
        <strong>How this edition was made</strong>
        <p>
          Final totals come from Sleeper. Opening odds come from the frozen Week 1 preview.
          Game-flow charts use the recorded score and probability feeds; panels marked directional
          or unreliable carry explicit caveats. Team names are preferred, with authenticated member
          profiles used before Sleeper display names where available.
        </p>
      </footer>
    </main>
  );
};
