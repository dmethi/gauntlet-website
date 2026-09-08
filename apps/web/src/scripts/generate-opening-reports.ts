import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getLeaguesForSeason } from '../config/leagues';
import {
  type AuctionBenchmarkInput,
  buildDraftReport,
  buildScoringCurve,
  combineLeagueSlateSimulations,
  type DraftLeagueInput,
  type DraftReport,
  findDraftTeam,
  type LeaguePreview,
  type MarketAuctionSnapshot,
  normalizeDraftPosition,
  parseYafsbAuctionSnapshot,
  prepareSlatePlayers,
  type PreviewTeam,
  type PreviewWindow,
  simulateOpeningSlate,
  type SlateTeam,
  type WeeklyPreviewReport,
} from '../features/opening-reports';
import {
  calculateLeagueProjections,
  type ScoringSettings,
} from '../lib/calculate-league-projections';

const SLEEPER_API = 'https://api.sleeper.app/v1';
const YAFSB_AUCTION_URL = 'https://yafsb.com/fantasy-football/auction-draft-values/half-ppr/';
const ESPN_WEEK_ONE_URL =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2026&seasontype=2&week=1';
const OUTPUT_DIRECTORY = path.join(process.cwd(), 'src', 'data', 'reports', 'opening-2026');
const ITERATIONS = 20_000;
const BASE_SEED = 20_260_909;

interface SleeperLeague {
  draft_id: string;
  scoring_settings: ScoringSettings;
}

interface SleeperDraft {
  draft_id: string;
  status: string;
  start_time: number;
  last_picked: number;
  settings: { rounds: number; teams: number };
}

interface SleeperPick {
  pick_no: number;
  roster_id: number;
  player_id: string;
  metadata: {
    amount?: string;
    first_name?: string;
    last_name?: string;
    position?: string;
    team?: string;
  };
}

interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  starters: string[];
}

interface SleeperUser {
  user_id: string;
  display_name: string;
  avatar?: string;
  metadata?: { avatar?: string; team_name?: string };
}

interface SleeperMatchup {
  matchup_id: number | null;
  roster_id: number;
  starters: string[];
}

interface SleeperPlayer {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  team?: string;
}

type SleeperPlayers = Record<string, SleeperPlayer>;
type RawProjection = Record<string, number | string | null>;

const sleeperAvatarUrl = (user: SleeperUser | undefined): string | null => {
  const avatar = user?.metadata?.avatar || user?.avatar;
  if (!avatar) return null;
  return avatar.startsWith('http') ? avatar : `https://sleepercdn.com/avatars/${avatar}`;
};

interface EspnScoreboard {
  events: Array<{
    date: string;
    competitions: Array<{
      competitors: Array<{
        homeAway: 'home' | 'away';
        team: { abbreviation: string; shortDisplayName: string };
      }>;
    }>;
  }>;
}

interface LeagueSnapshot {
  config: ReturnType<typeof getLeaguesForSeason>[number];
  league: SleeperLeague;
  draft: SleeperDraft;
  picks: SleeperPick[];
  rosters: SleeperRoster[];
  users: SleeperUser[];
  matchups: SleeperMatchup[];
}

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { headers: { 'user-agent': 'Gauntlet-Opening-Reports/1.0' } });
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`);
  return (await response.json()) as T;
};

const fetchText = async (url: string): Promise<string> => {
  const response = await fetch(url, { headers: { 'user-agent': 'Gauntlet-Opening-Reports/1.0' } });
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`);
  return response.text();
};

const getLeagueSnapshot = async (
  config: ReturnType<typeof getLeaguesForSeason>[number],
): Promise<LeagueSnapshot> => {
  const league = await fetchJson<SleeperLeague>(`${SLEEPER_API}/league/${config.id}`);
  const [draft, picks, rosters, users, matchups] = await Promise.all([
    fetchJson<SleeperDraft>(`${SLEEPER_API}/draft/${league.draft_id}`),
    fetchJson<SleeperPick[]>(`${SLEEPER_API}/draft/${league.draft_id}/picks`),
    fetchJson<SleeperRoster[]>(`${SLEEPER_API}/league/${config.id}/rosters`),
    fetchJson<SleeperUser[]>(`${SLEEPER_API}/league/${config.id}/users`),
    fetchJson<SleeperMatchup[]>(`${SLEEPER_API}/league/${config.id}/matchups/1`),
  ]);
  return { config, league, draft, picks, rosters, users, matchups };
};

const toDraftLeagueInput = (snapshot: LeagueSnapshot): DraftLeagueInput => {
  const users = new Map(snapshot.users.map(user => [user.user_id, user]));
  return {
    leagueId: snapshot.config.id,
    leagueName: snapshot.config.name,
    draftId: snapshot.draft.draft_id,
    logo: snapshot.config.logo,
    status: snapshot.draft.status,
    startedAt: new Date(snapshot.draft.start_time).toISOString(),
    finishedAt:
      snapshot.draft.status === 'complete'
        ? new Date(snapshot.draft.last_picked).toISOString()
        : null,
    rosterSize: snapshot.draft.settings.rounds,
    managers: snapshot.rosters.map(roster => {
      const user = users.get(roster.owner_id);
      return {
        rosterId: roster.roster_id,
        ownerId: roster.owner_id,
        managerName: user?.display_name ?? `Manager ${roster.roster_id}`,
        teamName: user?.metadata?.team_name || user?.display_name || `Team ${roster.roster_id}`,
        avatarUrl: sleeperAvatarUrl(user),
      };
    }),
    picks: snapshot.picks.map(pick => ({
      pickNo: pick.pick_no,
      rosterId: pick.roster_id,
      playerId: pick.player_id,
      playerName:
        `${pick.metadata.first_name ?? ''} ${pick.metadata.last_name ?? ''}`.trim() ||
        pick.player_id,
      position: normalizeDraftPosition(
        `${pick.metadata.first_name ?? ''} ${pick.metadata.last_name ?? ''}`.trim(),
        pick.metadata.position ?? 'UNKNOWN',
      ),
      nflTeam: pick.metadata.team?.toUpperCase() ?? null,
      price: Number(pick.metadata.amount ?? 0),
    })),
  };
};

const buildBenchmark = (market: MarketAuctionSnapshot): AuctionBenchmarkInput => ({
  name: 'YAFSB 2026 Real Sleeper Auction Market',
  url: YAFSB_AUCTION_URL,
  publishedAt: market.updatedAt,
  assumptions: `${market.sampleSize} most recent qualifying real Sleeper auctions; 12 teams, half-PPR and 1-QB. Average budget shares are converted to a $200 cap.`,
  valuesByPlayerId: Object.fromEntries(market.values.map(value => [value.playerId, value.value])),
});

const normalizeNflTeam = (team: string): string => (team === 'WSH' ? 'WAS' : team);

const buildSchedule = (scoreboard: EspnScoreboard): PreviewWindow[] => {
  const byKickoff = new Map<string, PreviewWindow['games']>();
  scoreboard.events.forEach(event => {
    const competitors = event.competitions[0]?.competitors ?? [];
    const home = competitors.find(team => team.homeAway === 'home')?.team;
    const away = competitors.find(team => team.homeAway === 'away')?.team;
    if (!home || !away) return;
    const games = byKickoff.get(event.date) ?? [];
    games.push({
      home: normalizeNflTeam(home.abbreviation),
      homeName: home.shortDisplayName,
      away: normalizeNflTeam(away.abbreviation),
      awayName: away.shortDisplayName,
    });
    byKickoff.set(event.date, games);
  });
  return Array.from(byKickoff.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([startsAt, games], index) => ({
      id: `window-${index + 1}`,
      label: new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(startsAt)),
      startsAt,
      games,
    }));
};

const windowForTeam = (schedule: PreviewWindow[], nflTeam: string | undefined): string | null => {
  if (!nflTeam) return null;
  return (
    schedule.find(window =>
      window.games.some(game => game.home === nflTeam || game.away === nflTeam),
    )?.id ?? null
  );
};

const toProjectionArray = (raw: Record<string, RawProjection>): RawProjection[] =>
  Object.entries(raw).map(([playerId, projection]) => ({ ...projection, player_id: playerId }));

const createPreviewTeam = ({
  slateTeam,
  rosterId,
  ownerId,
  managerName,
  avatarUrl,
  projection,
  p10,
  p50,
  p90,
  winProbability,
  moneyline,
  draftReport,
  players,
  schedule,
}: {
  slateTeam: SlateTeam;
  rosterId: number;
  ownerId: string;
  managerName: string;
  avatarUrl: string | null;
  projection: number;
  p10: number;
  p50: number;
  p90: number;
  winProbability: number;
  moneyline: string;
  draftReport: DraftReport;
  players: SleeperPlayers;
  schedule: PreviewWindow[];
}): PreviewTeam => {
  const draftTeam = findDraftTeam(draftReport, slateTeam.leagueId, rosterId);
  const projectedPlayers = slateTeam.players.map(player => ({
    playerId: player.id,
    playerName:
      players[player.id]?.full_name ||
      `${players[player.id]?.first_name ?? ''} ${players[player.id]?.last_name ?? ''}`.trim() ||
      player.id,
    nflTeam: players[player.id]?.team ?? null,
    projection: Math.round(player.projection * 10) / 10,
    windowId: windowForTeam(schedule, players[player.id]?.team),
  }));
  return {
    teamId: slateTeam.teamId,
    rosterId,
    ownerId,
    teamName: slateTeam.teamName,
    managerName,
    avatarUrl,
    projection,
    p10,
    p50,
    p90,
    winProbability,
    moneyline,
    draftGrade: draftTeam.grade,
    draftScore: draftTeam.score,
    bestDraftValue: draftTeam.bestValue
      ? {
          playerName: draftTeam.bestValue.playerName,
          price: draftTeam.bestValue.price,
          benchmarkValue: draftTeam.bestValue.benchmarkValue,
          valueDelta: draftTeam.bestValue.valueDelta,
        }
      : null,
    carriers: [...projectedPlayers].sort((a, b) => b.projection - a.projection).slice(0, 3),
    modeledAtZero: {
      openStarterSlots: slateTeam.lineupModeling?.openStarterSlots ?? 0,
      unresolvedPlayers: (slateTeam.lineupModeling?.unresolvedPlayerIds ?? []).map(
        playerId =>
          players[playerId]?.full_name ||
          `${players[playerId]?.first_name ?? ''} ${players[playerId]?.last_name ?? ''}`.trim() ||
          playerId,
      ),
      zeroProjectionPlayers: (slateTeam.lineupModeling?.zeroProjectionPlayerIds ?? []).map(
        playerId =>
          players[playerId]?.full_name ||
          `${players[playerId]?.first_name ?? ''} ${players[playerId]?.last_name ?? ''}`.trim() ||
          playerId,
      ),
    },
    scoringCurve: buildScoringCurve({ schedule, players: projectedPlayers }),
  };
};

const generateWeeklyPreview = async ({
  snapshots,
  draftReport,
  players,
  rawProjections,
  schedule,
  generatedAt,
}: {
  snapshots: LeagueSnapshot[];
  draftReport: DraftReport;
  players: SleeperPlayers;
  rawProjections: Record<string, RawProjection>;
  schedule: PreviewWindow[];
  generatedAt: string;
}): Promise<WeeklyPreviewReport> => {
  const firstKickoffAt = schedule[0]?.startsAt;
  if (!firstKickoffAt) throw new Error('Week 1 schedule has no kickoff windows');

  const projectionArray = toProjectionArray(rawProjections);
  const preparedLeagues = snapshots.map(snapshot => {
    if (snapshot.matchups.length !== 12) {
      throw new Error(
        `${snapshot.config.name} has ${snapshot.matchups.length}/12 Week 1 roster rows`,
      );
    }
    const users = new Map(snapshot.users.map(user => [user.user_id, user]));
    const rosters = new Map(snapshot.rosters.map(roster => [roster.roster_id, roster]));
    const projections = calculateLeagueProjections(
      projectionArray,
      snapshot.league.scoring_settings,
    );
    const slateTeams: SlateTeam[] = snapshot.matchups.map(matchup => {
      if (matchup.matchup_id === null) {
        throw new Error(`${snapshot.config.name} has a roster without a Week 1 matchup`);
      }
      const roster = rosters.get(matchup.roster_id);
      if (!roster) throw new Error(`Missing roster ${snapshot.config.id}:${matchup.roster_id}`);
      const user = users.get(roster.owner_id);
      const teamName =
        user?.metadata?.team_name || user?.display_name || `Team ${matchup.roster_id}`;
      const preparedLineup = prepareSlatePlayers({
        starterIds: matchup.starters,
        expectedStarters: 9,
        lookup: playerId => {
          const player = players[playerId];
          if (!player) return null;
          return {
            position: player.position ?? null,
            projection: projections[playerId]?.points ?? 0,
          };
        },
      });
      return {
        teamId: `${snapshot.config.id}:${matchup.roster_id}`,
        leagueId: snapshot.config.id,
        matchupId: matchup.matchup_id,
        teamName,
        players: preparedLineup.players,
        lineupModeling: preparedLineup.modeling,
      };
    });

    return { snapshot, users, rosters, slateTeams };
  });

  const { getPositionDistribution } = await import('@gauntlet/sim-engine');
  const positions = ['QB', 'RB', 'WR', 'TE', 'DEF'];
  const positionOutcomes = new Map(
    await Promise.all(
      positions.map(async position => {
        const distribution = await getPositionDistribution(position);
        return [position, distribution.outcomes] as const;
      }),
    ),
  );
  const simulations = [];
  const leaguePreviews: LeaguePreview[] = [];

  for (const [leagueIndex, prepared] of preparedLeagues.entries()) {
    const { snapshot, users, rosters, slateTeams } = prepared;

    const simulation = simulateOpeningSlate({
      teams: slateTeams,
      iterations: ITERATIONS,
      seed: BASE_SEED + leagueIndex,
      positionOutcomes,
    });
    simulations.push(simulation);

    const matchups = simulation.matchups.map(matchup => {
      const buildTeam = (side: typeof matchup.teamA): PreviewTeam => {
        const slateTeam = slateTeams.find(team => team.teamId === side.teamId);
        const result = simulation.teams.find(team => team.teamId === side.teamId);
        if (!slateTeam || !result) throw new Error(`Missing team result for ${side.teamId}`);
        const rosterId = Number(side.teamId.split(':').at(-1));
        const roster = rosters.get(rosterId);
        if (!roster) throw new Error(`Missing roster for ${side.teamId}`);
        const user = users.get(roster.owner_id);
        const managerName = user?.display_name ?? `Manager ${rosterId}`;
        return createPreviewTeam({
          slateTeam,
          rosterId,
          ownerId: roster.owner_id,
          managerName,
          avatarUrl: sleeperAvatarUrl(user),
          projection: result.projection,
          p10: result.p10,
          p50: result.p50,
          p90: result.p90,
          winProbability: side.winProbability,
          moneyline: side.moneyline,
          draftReport,
          players,
          schedule,
        });
      };
      const teamA = buildTeam(matchup.teamA);
      const teamB = buildTeam(matchup.teamB);
      return {
        matchupId: matchup.matchupId,
        matchupKey: matchup.matchupKey,
        teamA,
        teamB,
        spread: matchup.spread,
        total: matchup.total,
      };
    });

    leaguePreviews.push({
      leagueId: snapshot.config.id,
      leagueName: snapshot.config.name,
      logo: snapshot.config.logo,
      races: simulation.races,
      matchups,
    });
  }

  return {
    metadata: {
      season: 2026,
      week: 1,
      generatedAt,
      lineupsAsOf: generatedAt,
      projectionsAsOf: generatedAt,
      firstKickoffAt,
      simulation: {
        engine: '@gauntlet/sim-engine position outcome distributions + seeded slate sampler',
        iterations: ITERATIONS,
        seed: BASE_SEED,
        projectionSource:
          'Sleeper Week 1 projections scored with each league settings; every team P50 is anchored to its lineup projection',
        varianceSource:
          '@gauntlet/sim-engine static position distributions, recentered to the Sleeper median anchor',
      },
    },
    schedule,
    gauntletWideRaces: combineLeagueSlateSimulations(simulations),
    leagues: leaguePreviews,
  };
};

const writeArtifact = async (filename: string, value: unknown): Promise<void> => {
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  await writeFile(path.join(OUTPUT_DIRECTORY, filename), `${JSON.stringify(value, null, 2)}\n`);
};

const main = async (): Promise<void> => {
  const configs = getLeaguesForSeason('2026');
  if (configs.length !== 3)
    throw new Error(`Expected 3 registered 2026 leagues, found ${configs.length}`);
  const [snapshots, marketHtml, players, rawProjections, scoreboard] = await Promise.all([
    Promise.all(configs.map(getLeagueSnapshot)),
    fetchText(YAFSB_AUCTION_URL),
    fetchJson<SleeperPlayers>(`${SLEEPER_API}/players/nfl`),
    fetchJson<Record<string, RawProjection>>(`${SLEEPER_API}/projections/nfl/regular/2026/1`),
    fetchJson<EspnScoreboard>(ESPN_WEEK_ONE_URL),
  ]);

  snapshots.forEach(snapshot => {
    const expectedPicks = snapshot.draft.settings.rounds * snapshot.draft.settings.teams;
    if (snapshot.draft.status !== 'complete' || snapshot.picks.length !== expectedPicks) {
      throw new Error(
        `${snapshot.config.name} draft is not complete (${snapshot.picks.length}/${expectedPicks})`,
      );
    }
  });

  const generatedAt = new Date().toISOString();
  const market = parseYafsbAuctionSnapshot(marketHtml);
  if (market.values.length < 150) {
    throw new Error(`YAFSB parser found only ${market.values.length} auction values`);
  }
  const draftReport = buildDraftReport({
    leagues: snapshots.map(toDraftLeagueInput),
    generatedAt,
    benchmark: buildBenchmark(market),
  });
  await writeArtifact('draft-report.json', draftReport);

  const weeklyPreview = await generateWeeklyPreview({
    snapshots,
    draftReport,
    players,
    rawProjections,
    schedule: buildSchedule(scoreboard),
    generatedAt,
  });

  await writeArtifact('week-1-preview.json', weeklyPreview);
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });
