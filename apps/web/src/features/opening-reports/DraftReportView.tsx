import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { deltaTextClass, gradeBadgeClass, neutralBadgeClass } from '@/lib/stat-colors';
import type { DraftReport, DraftTeamGrade } from './draft-report';
import { DraftLegacyAnalytics } from './DraftLegacyAnalytics';
import { PlayerPortrait, TeamAvatar } from './OpeningReportMedia';

const formatDuration = (minutes: number | null): string => {
  if (minutes === null) return 'In progress';
  const hours = Math.floor(minutes / 60);
  const remainder = Math.round(minutes % 60);
  return `${hours}h ${remainder}m`;
};

const formatTimestamp = (value: string): string =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(value));

const GradeRow = ({ team, rank }: { team: DraftTeamGrade; rank: number }) => (
  <li className="grid grid-cols-[2rem_auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-border py-3 first:border-t-0">
    <span className="font-geizer text-lg text-muted-foreground">{rank}</span>
    <TeamAvatar src={team.avatarUrl} name={team.teamName} size={34} />
    <div className="min-w-0">
      <p className="truncate font-semibold">{team.teamName}</p>
      <p className="truncate text-xs text-muted-foreground">
        ${team.benchmarkStarterValue} starter / ${team.benchmarkBenchValue} bench value
      </p>
    </div>
    <Badge className={gradeBadgeClass(team.grade)}>{team.grade}</Badge>
  </li>
);

export const DraftReportView = ({ report }: { report: DraftReport }) => {
  const { superlatives } = report;
  const gradesByLeague = report.leagues.map(league => ({
    ...league,
    teams: report.teamGrades.filter(team => team.leagueId === league.leagueId),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 border-b border-border pb-12 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
        <div>
          <Badge className="bg-primary/10 text-primary border border-primary/20">
            Opening dossier
          </Badge>
          <h2 className="mt-5 max-w-4xl font-geizer text-4xl uppercase tracking-wider sm:text-6xl">
            Three rooms. One market with nowhere to hide.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            Every winning bid across all 540 purchases, graded against the latest real 12-team
            half-PPR Sleeper auction market and then compared against the two other Gauntlet rooms.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-l border-border pl-6 text-sm">
          <div>
            <dt className="text-muted-foreground">Players purchased</dt>
            <dd className="mt-1 font-geizer text-3xl">540</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Managers graded</dt>
            <dd className="mt-1 font-geizer text-3xl">{report.teamGrades.length}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Snapshot</dt>
            <dd className="mt-1 font-medium">{formatTimestamp(report.metadata.generatedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="py-12" aria-labelledby="headline-board">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              The board
            </p>
            <h2 id="headline-board" className="mt-2 font-geizer text-3xl uppercase tracking-wider">
              Draft-night superlatives
            </h2>
          </div>
          <p className="max-w-lg text-sm text-muted-foreground">
            {report.metadata.timingDisclosure}
          </p>
        </div>

        <div className="mt-8 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
          <article className="bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Best market value
            </p>
            <div className="mt-7 flex items-center gap-3">
              {superlatives.bestValue ? (
                <PlayerPortrait
                  playerId={superlatives.bestValue.playerId}
                  playerName={superlatives.bestValue.playerName}
                  nflTeam={superlatives.bestValue.nflTeam}
                  size={54}
                />
              ) : null}
              <p className="font-geizer text-3xl uppercase tracking-wide">
                {superlatives.bestValue?.playerName ?? '—'}
              </p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {superlatives.bestValue
                ? `${superlatives.bestValue.teamName} paid $${superlatives.bestValue.price} against a $${superlatives.bestValue.benchmarkValue} benchmark.`
                : 'No benchmark match.'}
            </p>
          </article>
          <article className="bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Biggest premium
            </p>
            <div className="mt-7 flex items-center gap-3">
              {superlatives.biggestPremium ? (
                <PlayerPortrait
                  playerId={superlatives.biggestPremium.playerId}
                  playerName={superlatives.biggestPremium.playerName}
                  nflTeam={superlatives.biggestPremium.nflTeam}
                  size={54}
                />
              ) : null}
              <p className="font-geizer text-3xl uppercase tracking-wide">
                {superlatives.biggestPremium?.playerName ?? '—'}
              </p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {superlatives.biggestPremium
                ? `${superlatives.biggestPremium.teamName} paid $${superlatives.biggestPremium.price}, $${Math.abs(superlatives.biggestPremium.valueDelta)} above the board.`
                : 'No benchmark match.'}
            </p>
          </article>
          <article className="bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Longest purchase drought
            </p>
            <p className="mt-8 font-geizer text-3xl uppercase tracking-wide">
              {superlatives.longestPurchaseDrought?.value ?? '—'} picks
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {superlatives.longestPurchaseDrought
                ? `${superlatives.longestPurchaseDrought.teamName} went the longest between winning bids.`
                : 'No qualifying purchases.'}
            </p>
          </article>
          <article className="bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Fastest room
            </p>
            <p className="mt-8 font-geizer text-3xl uppercase tracking-wide">
              {formatDuration(superlatives.fastestDraft?.durationMinutes ?? null)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {superlatives.fastestDraft?.leagueName ?? '—'}
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-12 border-t border-border py-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Room tempo</p>
          <h2 className="mt-2 font-geizer text-3xl uppercase tracking-wider">The three auctions</h2>
          <div className="mt-7 space-y-6">
            {report.leagues.map(league => (
              <article
                key={league.leagueId}
                className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-4"
              >
                <div className="relative size-14">
                  {league.logo ? (
                    <Image src={league.logo} alt="" fill className="object-contain" sizes="56px" />
                  ) : null}
                </div>
                <div>
                  <h3 className="font-semibold">{league.leagueName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {league.averageSecondsPerPurchase}s per completed auction
                  </p>
                </div>
                <span className="font-geizer text-2xl">
                  {formatDuration(league.durationMinutes)}
                </span>
              </article>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
            Price fault lines
          </p>
          <h2 className="mt-2 font-geizer text-3xl uppercase tracking-wider">
            Where rooms disagreed
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-y border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 pr-4">Player</th>
                  <th className="px-4 py-3">Low</th>
                  <th className="px-4 py-3">Middle</th>
                  <th className="px-4 py-3">High</th>
                  <th className="py-3 pl-4 text-right">Spread</th>
                </tr>
              </thead>
              <tbody>
                {report.priceDivergences.slice(0, 10).map(player => (
                  <tr key={player.playerId} className="border-b border-border">
                    <td className="py-4 pr-4">
                      <span className="flex items-center gap-3">
                        <PlayerPortrait
                          playerId={player.playerId}
                          playerName={player.playerName}
                          nflTeam={player.nflTeam}
                          size={40}
                        />
                        <span>
                          <span className="block font-semibold">{player.playerName}</span>
                          <span className="text-xs text-muted-foreground">{player.position}</span>
                        </span>
                      </span>
                    </td>
                    {player.prices.map(price => (
                      <td key={price.leagueId} className="px-4 py-4">
                        <span className="font-geizer text-lg">${price.price}</span>
                        <span className="mt-0.5 block max-w-32 truncate text-xs text-muted-foreground">
                          {price.teamName}
                        </span>
                      </td>
                    ))}
                    <td className="py-4 pl-4 text-right font-geizer text-xl text-primary">
                      ${player.spread}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {report.priceDivergences[0] ? (
            <p className="mt-5 border-l-2 border-primary pl-4 text-sm leading-6 text-muted-foreground">
              <strong className="text-foreground">Takeaway:</strong>{' '}
              {report.priceDivergences[0].playerName} generated the widest room-to-room gap at $
              {report.priceDivergences[0].spread}. The rows beneath show whether each disagreement
              was a one-manager reach or part of a broader positional market split.
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-t border-border py-12" aria-labelledby="shared-sundays">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          Shared Sundays
        </p>
        <h2 id="shared-sundays" className="mt-2 font-geizer text-3xl uppercase tracking-wider">
          Closest roster cousins
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Cross-Legion pairs ranked by Jaccard similarity—the share of their combined player pool
          that appears on both rosters.
        </p>
        <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {report.rosterSimilarities.slice(0, 6).map(pair => (
            <article
              key={`${pair.teamAId}:${pair.teamBId}`}
              className="border-t-2 border-primary pt-5"
            >
              <p className="font-geizer text-xl uppercase tracking-wide">
                {pair.teamAName} × {pair.teamBName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {pair.teamALeague} / {pair.teamBLeague}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {pair.sharedPlayerNames.map(player => (
                  <Badge key={player} className={neutralBadgeClass}>
                    {player}
                  </Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-12" aria-labelledby="draft-grades">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              External board
            </p>
            <h2 id="draft-grades" className="mt-2 font-geizer text-3xl uppercase tracking-wider">
              Draft grades
            </h2>
          </div>
          <Link
            href={report.metadata.benchmark.url}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {report.metadata.benchmark.name} ↗
          </Link>
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          {gradesByLeague.map(league => (
            <article key={league.leagueId}>
              <div className="flex items-center gap-3 border-b-2 border-foreground pb-4">
                <div className="relative size-10">
                  {league.logo ? (
                    <Image src={league.logo} alt="" fill className="object-contain" sizes="40px" />
                  ) : null}
                </div>
                <h3 className="font-geizer text-xl uppercase tracking-wide">{league.leagueName}</h3>
              </div>
              <ol>
                {league.teams.map((team, index) => (
                  <GradeRow key={team.teamId} team={team} rank={index + 1} />
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <DraftLegacyAnalytics report={report} />

      <aside className="border-y border-border py-8 text-sm leading-6 text-muted-foreground">
        <p>
          <strong className="text-foreground">How grades work.</strong> The score is 70% external
          benchmark value allocated to a legal starting lineup and 30% benchmark value on the bench,
          each ranked across all 36 teams. Starter and bench spend and surplus are kept separate in
          the tables above. The external board covers{' '}
          {Math.round(
            (report.teamGrades.reduce((sum, team) => sum + team.benchmarkCoverage, 0) /
              report.teamGrades.length) *
              100,
          )}
          % of drafted players. Unmatched players receive no invented value.
        </p>
        <p className="mt-3">
          {report.metadata.benchmark.assumptions} These are comparative opening grades—not season
          predictions. Week 1 model odds live in the{' '}
          <Link
            href="/competition/preview/2026/week-1"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            opening preview
          </Link>
          .
        </p>
      </aside>
    </div>
  );
};
