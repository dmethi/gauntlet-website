/**
 * Manager-history aggregation
 *
 * Given a Sleeper owner_id, walks every registered season/league (see
 * apps/web/src/config/leagues.ts) and returns that manager's full
 * roster/matchup history. Consumed by app/managers/[ownerId]/page.tsx.
 *
 * Per docs/ETHOS.md's "process leagues separately" rule: each league's
 * rosters/matchups are fully fetched and reduced to this manager's row
 * before moving to the next league — raw per-league arrays are never merged.
 */

import type { NFLState, SleeperLeague } from '@gauntlet/types';
import type { RosterWithOwner } from '@/lib/sleeper/unified-client';
import { createServiceClient } from '@/lib/sleeper/unified-client';
import { getAllSeasons, getLeaguesForSeason, type SeasonId } from '@/config/leagues';
import { resolveCompletedWeeks } from '@/shared/utils/season-weeks';

export interface SleeperHistoryClient {
  fetchRostersWithOwners(leagueId: string): Promise<RosterWithOwner[]>;
  fetchMatchups(
    leagueId: string,
    week: number,
  ): Promise<{ roster_id: number; matchup_id: number; points: number | null }[]>;
  fetchLeague(leagueId: string): Promise<SleeperLeague>;
  fetchNFLState(): Promise<NFLState>;
}

export interface ManagerLeagueSeasonHistory {
  season: SeasonId;
  leagueId: string;
  leagueLabel: string;
  rosterId: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  teamName: string | null;
}

export interface ManagerHistory {
  ownerId: string;
  displayName: string | null;
  seasons: ManagerLeagueSeasonHistory[];
  career: {
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number;
    pointsAgainst: number;
    winPct: number;
  };
}

/**
 * Computes one manager's record within a single league, from that league's
 * own rosters + matchups. Never combined with another league's data.
 */
const computeSeasonRecord = async (
  client: SleeperHistoryClient,
  leagueId: string,
  rosterId: number,
  weeks: number,
): Promise<{
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
}> => {
  let wins = 0;
  let losses = 0;
  let ties = 0;
  let pointsFor = 0;
  let pointsAgainst = 0;

  for (let week = 1; week <= weeks; week++) {
    const matchups = await client.fetchMatchups(leagueId, week);
    const team = matchups.find(m => m.roster_id === rosterId);
    if (!team) continue;

    const opponent = matchups.find(
      m => m.matchup_id === team.matchup_id && m.roster_id !== rosterId,
    );
    if (!opponent) continue;

    const teamScore = team.points ?? 0;
    const oppScore = opponent.points ?? 0;

    pointsFor += teamScore;
    pointsAgainst += oppScore;

    if (teamScore > oppScore) wins++;
    else if (oppScore > teamScore) losses++;
    else ties++;
  }

  return { wins, losses, ties, pointsFor, pointsAgainst };
};

/**
 * Walks every registered season/league looking for `ownerId`, returning
 * their full cross-league history, or `null` if they never appear in any
 * registered league.
 */
export const getManagerHistory = async (
  ownerId: string,
  client: SleeperHistoryClient = createServiceClient(),
  /**
   * Overrides the per-league completed-weeks calculation (used by tests to
   * avoid mocking `fetchLeague`/`fetchNFLState`). When omitted, each league's
   * week count is resolved via `resolveCompletedWeeks`, matching Hall of
   * Fame's cutoff so playoff-week matchups never get counted as regular-season
   * games.
   */
  weeksPerLeagueOverride?: number,
): Promise<ManagerHistory | null> => {
  const seasons = [...getAllSeasons()].sort().reverse(); // newest first
  const seasonHistories: ManagerLeagueSeasonHistory[] = [];
  let displayName: string | null = null;
  let nflState: NFLState | null = null;

  for (const season of seasons) {
    for (const league of getLeaguesForSeason(season)) {
      const rosters = await client.fetchRostersWithOwners(league.id);
      const roster = rosters.find(r => r.owner_id === ownerId);
      if (!roster) continue;

      if (!displayName) {
        displayName = roster.owner?.metadata?.team_name ?? roster.owner?.display_name ?? null;
      }

      let weeks = weeksPerLeagueOverride;
      if (weeks === undefined) {
        const sleeperLeague = await client.fetchLeague(league.id);
        if (!nflState) nflState = await client.fetchNFLState();
        weeks = resolveCompletedWeeks(sleeperLeague, nflState);
      }

      const record = await computeSeasonRecord(client, league.id, roster.roster_id, weeks);

      seasonHistories.push({
        season,
        leagueId: league.id,
        leagueLabel: league.name,
        rosterId: roster.roster_id,
        teamName: roster.metadata?.team_name != null ? String(roster.metadata.team_name) : null,
        ...record,
      });
    }
  }

  if (seasonHistories.length === 0) return null;

  const career = seasonHistories.reduce(
    (acc, s) => ({
      wins: acc.wins + s.wins,
      losses: acc.losses + s.losses,
      ties: acc.ties + s.ties,
      pointsFor: acc.pointsFor + s.pointsFor,
      pointsAgainst: acc.pointsAgainst + s.pointsAgainst,
    }),
    { wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0 },
  );
  const games = career.wins + career.losses + career.ties;

  return {
    ownerId,
    displayName,
    seasons: seasonHistories,
    career: {
      ...career,
      winPct: games > 0 ? (career.wins + career.ties * 0.5) / games : 0,
    },
  };
};
