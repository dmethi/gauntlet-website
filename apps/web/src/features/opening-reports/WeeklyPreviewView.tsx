import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { gradeBadgeClass, neutralBadgeClass } from '@/lib/stat-colors';
import type { OpeningSlateRaces } from './slate-simulation';
import {
  type PreviewTeam,
  raceLabels,
  topRaceCandidates,
  type WeeklyPreviewReport,
} from './weekly-preview';
import { MatchupScoreCurve } from './MatchupScoreCurve';
import { NflTeamMark, PlayerPortrait, TeamAvatar } from './OpeningReportMedia';

const percent = (value: number): string => `${(Math.round(value * 1_000) / 10).toFixed(1)}%`;

const formatTimestamp = (value: string): string =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(value));

const TeamLine = ({ team }: { team: PreviewTeam }) => {
  const modeledAtZero = [
    ...(team.modeledAtZero.openStarterSlots > 0
      ? [
          `${team.modeledAtZero.openStarterSlots} open ${team.modeledAtZero.openStarterSlots === 1 ? 'slot' : 'slots'}`,
        ]
      : []),
    ...team.modeledAtZero.unresolvedPlayers.map(player => `${player} unresolved`),
    ...team.modeledAtZero.zeroProjectionPlayers.map(player => `${player} at 0`),
  ];

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
      <TeamAvatar src={team.avatarUrl} name={team.teamName} size={44} />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate font-semibold">{team.teamName}</p>
          <Badge className={gradeBadgeClass(team.draftGrade)}>{team.draftGrade}</Badge>
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">{team.managerName}</p>
        {modeledAtZero.length > 0 ? (
          <p className="mt-1 text-xs text-primary">Modeled at zero: {modeledAtZero.join(' · ')}</p>
        ) : null}
      </div>
      <div className="hidden text-right sm:block">
        <p className="font-geizer text-2xl">{team.p50.toFixed(1)}</p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Sleeper anchor</p>
        <p className="text-xs text-muted-foreground">
          {team.p10.toFixed(0)}–{team.p90.toFixed(0)}
        </p>
      </div>
      <div className="text-right sm:w-16">
        <p className="font-geizer text-xl sm:hidden">{team.p50.toFixed(1)}</p>
        <p className="font-semibold">{percent(team.winProbability)}</p>
        <p className="text-xs text-muted-foreground">{team.moneyline}</p>
      </div>
    </div>
  );
};

const RaceBoard = ({
  races,
  compact = false,
  teamAvatars,
}: {
  races: OpeningSlateRaces;
  compact?: boolean;
  teamAvatars: Map<string, { avatarUrl: string | null; teamName: string }>;
}) => (
  <div
    className={
      compact
        ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3'
        : 'grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2 xl:grid-cols-3'
    }
  >
    {(Object.keys(raceLabels) as Array<keyof OpeningSlateRaces>).map(key => (
      <article key={key} className={compact ? 'border-t border-border pt-4' : 'bg-background p-5'}>
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {raceLabels[key]}
        </h3>
        <ol className="mt-4 space-y-3">
          {topRaceCandidates(races[key], 3).map((candidate, index) => (
            <li
              key={candidate.id}
              className="grid grid-cols-[1.25rem_auto_minmax(0,1fr)_auto] items-center gap-2 text-sm"
            >
              <span className="font-geizer text-muted-foreground">{index + 1}</span>
              {(key === 'highestScore' || key === 'lowestScore') &&
              teamAvatars.has(candidate.id) ? (
                <TeamAvatar
                  src={teamAvatars.get(candidate.id)?.avatarUrl ?? null}
                  name={teamAvatars.get(candidate.id)?.teamName ?? candidate.label}
                  size={26}
                />
              ) : (
                <span className="size-1.5 rounded-full bg-primary/50" aria-hidden="true" />
              )}
              <span className="truncate font-medium">{candidate.label}</span>
              <span className="font-geizer text-lg">{percent(candidate.probability)}</span>
            </li>
          ))}
        </ol>
      </article>
    ))}
  </div>
);

export const WeeklyPreviewView = ({ report }: { report: WeeklyPreviewReport }) => {
  const windowLabels = new Map(report.schedule.map(window => [window.id, window.label]));
  const teams = report.leagues.flatMap(league =>
    league.matchups.flatMap(matchup => [matchup.teamA, matchup.teamB]),
  );
  const teamAvatars = new Map(
    teams.map(team => [team.teamId, { avatarUrl: team.avatarUrl, teamName: team.teamName }]),
  );
  const topScorerFavorite = report.gauntletWideRaces.highestScore[0];

  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 sm:py-10 lg:px-8">
      <section className="grid gap-8 border-b border-border pb-12 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
        <div>
          <Badge className="bg-primary/10 text-primary border border-primary/20">
            Week 1 · Opening lines
          </Badge>
          <h2 className="mt-5 max-w-4xl font-geizer text-4xl uppercase tracking-wider sm:text-6xl">
            The draft room follows everyone onto the field.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            Eighteen matchups, six scoring windows and one frozen set of model odds. Every preview
            starts with how the roster was built.
          </p>
        </div>
        <dl className="border-t border-border pt-5 text-sm lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <dt className="text-muted-foreground">Lineups and projections frozen</dt>
          <dd className="mt-1 font-medium">{formatTimestamp(report.metadata.generatedAt)}</dd>
          <dt className="mt-5 text-muted-foreground">Simulation</dt>
          <dd className="mt-1 font-medium">
            {report.metadata.simulation.iterations.toLocaleString()} worlds per Legion
          </dd>
        </dl>
      </section>

      <section className="py-12" aria-labelledby="opening-board">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              All 36 teams
            </p>
            <h2 id="opening-board" className="mt-2 font-geizer text-3xl uppercase tracking-wider">
              The opening board
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Every simulated score distribution is recentered so its median exactly matches the
            current Sleeper lineup projection. The model supplies the uncertainty—not a competing
            projection.
          </p>
        </div>
        <div className="mt-8">
          <RaceBoard races={report.gauntletWideRaces} teamAvatars={teamAvatars} />
        </div>
        {topScorerFavorite ? (
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            <strong className="text-foreground">Top-score audit:</strong> an even 36-team field
            starts at 2.8% per team. {topScorerFavorite.label} leads this anchored run at{' '}
            {percent(topScorerFavorite.probability)}; the remaining probability is distributed
            across all 35 other teams, not normalized within a short list.
          </p>
        ) : null}
      </section>

      <section className="bg-muted/35 px-5 py-9 sm:px-7" aria-label="NFL Week 1 scoring windows">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              NFL schedule
            </p>
            <h2 className="mt-1 font-geizer text-2xl uppercase tracking-wide">
              When the points arrive
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">Times shown in Eastern Time</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3">
          {report.schedule.map((window, index) => (
            <article key={window.id} className="min-w-72 bg-background p-4 shadow-sm">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold">{window.label}</h3>
                <span className="font-geizer text-lg text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <ul className="mt-4 space-y-3">
                {window.games.map(game => (
                  <li key={`${game.away}:${game.home}`} className="flex items-center text-xs">
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <NflTeamMark team={game.away} size={22} />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{game.awayName}</span>
                        <span className="text-[10px] text-muted-foreground">{game.away}</span>
                      </span>
                    </span>
                    <span className="px-2 text-muted-foreground">at</span>
                    <span className="flex min-w-0 flex-1 items-center justify-end gap-2">
                      <span className="min-w-0 text-right">
                        <span className="block truncate font-semibold">{game.homeName}</span>
                        <span className="text-[10px] text-muted-foreground">{game.home}</span>
                      </span>
                      <NflTeamMark team={game.home} size={22} />
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {report.leagues.map(league => (
        <section
          key={league.leagueId}
          className="border-t-4 border-double border-border py-16"
          aria-labelledby={`league-${league.leagueId}`}
        >
          <div className="grid gap-10 xl:grid-cols-[0.68fr_1.32fr]">
            <div>
              <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0">
                  {league.logo ? (
                    <Image src={league.logo} alt="" fill className="object-contain" sizes="64px" />
                  ) : null}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Legion board
                  </p>
                  <h2
                    id={`league-${league.leagueId}`}
                    className="mt-1 font-geizer text-3xl uppercase tracking-wider"
                  >
                    {league.leagueName}
                  </h2>
                </div>
              </div>
              <div className="mt-8">
                <RaceBoard races={league.races} compact teamAvatars={teamAvatars} />
              </div>
            </div>

            <div className="space-y-8">
              {league.matchups.map(matchup => (
                <article
                  key={matchup.matchupKey}
                  className="overflow-hidden border border-border bg-background shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4 bg-muted/45 px-5 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Matchup {matchup.matchupId}
                    </p>
                    <div className="flex gap-2">
                      <Badge className={neutralBadgeClass}>Total {matchup.total}</Badge>
                      <Badge className={neutralBadgeClass}>
                        Spread {Math.abs(matchup.spread).toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid px-5 md:grid-cols-2 md:divide-x md:divide-border">
                    <div className="md:pr-5">
                      <TeamLine team={matchup.teamA} />
                    </div>
                    <div className="border-t border-border md:border-t-0 md:pl-5">
                      <TeamLine team={matchup.teamB} />
                    </div>
                  </div>

                  <div className="border-t border-border px-5 py-5">
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Projected scoring curve
                      </h3>
                      <span className="text-[10px] text-muted-foreground">
                        Cumulative Sleeper projection by kickoff window
                      </span>
                    </div>
                    <MatchupScoreCurve teamA={matchup.teamA} teamB={matchup.teamB} />
                  </div>

                  <div className="grid gap-5 border-t border-border px-5 py-5 sm:grid-cols-2">
                    {[matchup.teamA, matchup.teamB].map(team => (
                      <div key={team.teamId}>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {team.teamName} carriers
                        </p>
                        <div className="mt-3 space-y-2">
                          {team.carriers.map(player => (
                            <div key={player.playerId} className="flex items-center gap-3 text-xs">
                              <PlayerPortrait
                                playerId={player.playerId}
                                playerName={player.playerName}
                                nflTeam={player.nflTeam}
                                size={34}
                              />
                              <span className="min-w-0 flex-1 truncate font-medium">
                                {player.playerName}
                              </span>
                              <span className="text-right text-muted-foreground">
                                <span className="block font-semibold text-foreground">
                                  {player.projection} pts
                                </span>
                                {player.windowId ? windowLabels.get(player.windowId) : 'TBD'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <aside className="py-10 text-sm leading-6 text-muted-foreground">
        <p>
          <strong className="text-foreground">Model note.</strong> Each Legion is simulated
          independently from Sleeper Week 1 projections scored with that league&apos;s settings. The
          same retained worlds determine head-to-head odds and every race market; only completed
          Legion results are combined for the all-Gauntlet board. Open lineup slots, unresolved
          player IDs and legitimate zero projections are retained as zero-point contributions and
          disclosed beside the affected team.
        </p>
        <p className="mt-3">
          Draft grades and price context come from the frozen{' '}
          <Link
            href="/draft/analysis"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            2026 draft report
          </Link>
          . Seed {report.metadata.simulation.seed}; variance data from the Gauntlet simulation
          engine.
        </p>
      </aside>
    </div>
  );
};
