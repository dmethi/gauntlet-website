import { NextRequest, NextResponse } from 'next/server';
import { getMatchupsByWeek, getRostersByLeague, getUsersByLeague } from '@/lib/api-replacements';
import { sleeperClient } from '@/lib/sleeper/unified-client';
import { simulateMatchupProbabilityFromPlayers } from '@gauntlet/sim-engine';
import {
  calculateLeagueProjections,
  type ScoringSettings,
} from '@/lib/calculate-league-projections';
import type { TeamOdds, MatchupOdds, LeagueWideOdds } from '@/features/matchups/types';

const leagueNames: Record<string, string> = {
  '1263744209295245312': 'Gauntlet AFC',
  '1263740549504962561': 'Gauntlet NFC',
};

function probToAmerican(prob: number): string {
  if (prob <= 0) return '+∞';
  if (prob >= 1) return '-∞';
  if (prob >= 0.5) return `${Math.round(-(prob / (1 - prob)) * 100)}`;
  return `+${Math.round(((1 - prob) / prob) * 100)}`;
}

function probToColor(prob: number, reverse = false): string {
  let p = Math.max(0, Math.min(1, prob));
  if (reverse) p = 1 - p;
  if (p < 0.33) {
    const r = 255;
    const g = Math.round(255 * (p / 0.33));
    return `rgb(${r}, ${g}, 0)`;
  }
  if (p < 0.66) {
    const ratio = (p - 0.33) / 0.33;
    const r = Math.round(255 * (1 - ratio));
    return `rgb(${r}, 255, 0)`;
  }
  const ratio = (p - 0.66) / 0.34;
  return `rgb(0, 255, ${Math.round(128 * ratio)})`;
}

function sampleScore(mean: number, p10: number, p90: number): number {
  const std = (p90 - p10) / (2 * 1.28);
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

export async function GET(_req: NextRequest, { params }: { params: { week: string } }) {
  const week = parseInt(params.week, 10);
  if (!Number.isFinite(week) || week < 1 || week > 18) {
    return NextResponse.json({ error: 'Invalid week' }, { status: 400 });
  }

  try {
    const leagueIds = ['1263744209295245312', '1263740549504962561'];
    const nflState = await sleeperClient.fetchNFLState();
    const season = nflState?.season || '2025';

    // Load projections, players, and league info for each league
    const [rawProjections, players] = await Promise.all([
      sleeperClient.fetchWeeklyProjections(week, season),
      sleeperClient.fetchAllPlayers(),
    ]);

    // Convert projections to array while preserving player_id
    const rawProjectionsArray: any[] = Array.isArray(rawProjections)
      ? rawProjections
      : rawProjections
        ? Object.entries(rawProjections).map(([playerId, projection]) => ({
            ...(typeof projection === 'object' && projection !== null ? projection : {}),
            player_id: playerId,
          }))
        : [];
    const playersMap: Record<string, any> = players || {};

    // We'll calculate league-specific projections per league below

    const allTeams: Array<{
      team: { rosterId: number; matchupId: number; roster?: any };
      leagueId: string;
      leagueName: string;
      mean: number;
      p10: number;
      p50: number;
      p90: number;
    }> = [];

    for (const leagueId of leagueIds) {
      const [rosters, users, matchups, league] = await Promise.all([
        getRostersByLeague(leagueId),
        getUsersByLeague(leagueId),
        getMatchupsByWeek(leagueId, week),
        sleeperClient.fetchLeague(leagueId),
      ]);
      const usersById = new Map(users.map((u: any) => [u.id, u]));
      const rostersById = new Map(rosters.map((r: any) => [r.rosterId, r]));

      // Calculate league-specific projections
      const scoringSettings: ScoringSettings = (league?.scoring_settings as ScoringSettings) || {};
      const leagueProjections = calculateLeagueProjections(rawProjectionsArray, scoringSettings);
      const projOf = (id: string) => leagueProjections[id]?.points || 0;

      // Only include complete matchup pairs to avoid duplicates
      const grouped = new Map<number, any[]>();
      for (const m of matchups) {
        if (m.matchupId == null) continue;
        const arr = grouped.get(m.matchupId) || [];
        arr.push(m);
        grouped.set(m.matchupId, arr);
      }

      for (const [, pair] of grouped) {
        if (pair.length !== 2) continue;
        const [a, b] = pair as any[];
        const buildPlayers = (entry: any) => {
          const ids: string[] = (entry.starters || []) as string[];
          const pts: Record<string, number> = (entry.startersPoints ||
            entry.starterPoints ||
            {}) as any;
          return ids.map((id, index) => {
            const p = playersMap[id] || {};
            // starters_points uses array indices as keys, not player IDs
            const currentScore = Number(pts?.[index.toString()] || 0);
            return {
              id,
              name: p.full_name || id,
              position: p.position || 'FLEX',
              projection: projOf(id),
              currentScore,
              nflTeam: p.team || undefined,
            };
          });
        };
        const team1Players = buildPlayers(a);
        const team2Players = buildPlayers(b);

        // Run sim-engine once per matchup pair to get distributions. We don't have per-player NFL team live set here,
        // so pass undefined; sim-engine will treat players without currentScore as pre-game and with currentScore as finished.
        // This matches league-wide, pre-snapshot use where we don't adjust by minutes.
        const sim = await simulateMatchupProbabilityFromPlayers(
          team1Players as any,
          team2Players as any,
          10000,
          0,
          undefined,
        );

        // Sim-engine now properly receives current scores from completed games

        const rosterA = rostersById.get(a.rosterId);
        const rosterB = rostersById.get(b.rosterId);
        const ownerA = rosterA ? usersById.get(rosterA.ownerId) : null;
        const ownerB = rosterB ? usersById.get(rosterB.ownerId) : null;

        // Store team summaries for later ranking
        allTeams.push({
          team: { rosterId: a.rosterId, matchupId: a.matchupId, roster: { owner: ownerA } },
          leagueId,
          leagueName: leagueNames[leagueId],
          mean: sim.team1Scores.mean,
          p10: sim.team1Scores.p10,
          p50: sim.team1Scores.median,
          p90: sim.team1Scores.p90,
        });
        allTeams.push({
          team: { rosterId: b.rosterId, matchupId: b.matchupId, roster: { owner: ownerB } },
          leagueId,
          leagueName: leagueNames[leagueId],
          mean: sim.team2Scores.mean,
          p10: sim.team2Scores.p10,
          p50: sim.team2Scores.median,
          p90: sim.team2Scores.p90,
        });
      }
    }

    if (!allTeams.length) {
      return NextResponse.json({
        week,
        highestScorer: [],
        lowestScorer: [],
        closestMatchup: [],
        biggestBlowout: [],
        highestScoringMatchup: [],
        lowestScoringMatchup: [],
        lastUpdated: new Date().toISOString(),
      } as LeagueWideOdds);
    }

    // Monte Carlo over team distributions derived from sim-engine means/ranges
    const iterations = 10000; // Doubled from 5k to 10k iterations
    const winsHigh = new Array(allTeams.length).fill(0);
    const winsLow = new Array(allTeams.length).fill(0);

    // Build matchup pairs
    const mapPairs = new Map<string, number[]>();
    allTeams.forEach((t, idx) => {
      const key = `${t.leagueId}-${t.team.matchupId}`;
      const arr = mapPairs.get(key) || [];
      arr.push(idx);
      mapPairs.set(key, arr);
    });
    const pairs = Array.from(mapPairs.values()).filter(p => p.length === 2);

    const pairWinsClosest = new Array(pairs.length).fill(0);
    const pairWinsBlowout = new Array(pairs.length).fill(0);
    const pairWinsHighest = new Array(pairs.length).fill(0);
    const pairWinsLowest = new Array(pairs.length).fill(0);

    for (let it = 0; it < iterations; it++) {
      const scores = allTeams.map(t => sampleScore(t.mean, t.p10, t.p90));
      // team highs/lows
      let maxIdx = 0;
      let minIdx = 0;
      for (let i = 1; i < scores.length; i++) {
        if (scores[i] > scores[maxIdx]) maxIdx = i;
        if (scores[i] < scores[minIdx]) minIdx = i;
      }
      winsHigh[maxIdx]++;
      winsLow[minIdx]++;

      // matchup derived metrics
      let bestClosest = { idx: 0, margin: Infinity };
      let bestBlow = { idx: 0, margin: -Infinity };
      let bestHighTotal = { idx: 0, total: -Infinity };
      let bestLowTotal = { idx: 0, total: Infinity };
      pairs.forEach((p, pi) => {
        const a = scores[p[0]];
        const b = scores[p[1]];
        const margin = Math.abs(a - b);
        const total = a + b;
        if (margin < bestClosest.margin) bestClosest = { idx: pi, margin };
        if (margin > bestBlow.margin) bestBlow = { idx: pi, margin };
        if (total > bestHighTotal.total) bestHighTotal = { idx: pi, total };
        if (total < bestLowTotal.total) bestLowTotal = { idx: pi, total };
      });
      pairWinsClosest[bestClosest.idx]++;
      pairWinsBlowout[bestBlow.idx]++;
      pairWinsHighest[bestHighTotal.idx]++;
      pairWinsLowest[bestLowTotal.idx]++;
    }

    const highestScorer: TeamOdds[] = allTeams
      .map((t, i) => ({
        teamId: `${t.leagueId}-${t.team.rosterId}`, // Make teamId unique across leagues
        teamName:
          t.team.roster?.owner?.metadata?.team_name ||
          t.team.roster?.owner?.displayName ||
          t.team.roster?.owner?.username ||
          `Team ${t.team.rosterId}`,
        leagueId: t.leagueId,
        leagueName: t.leagueName,
        probability: winsHigh[i] / iterations,
        odds: probToAmerican(winsHigh[i] / iterations),
        projectedRange: { p10: t.p10, p50: t.p50, p90: t.p90 },
        totalProjection: t.mean,
        color: probToColor(winsHigh[i] / iterations),
      }))
      .sort((a, b) => b.probability - a.probability);

    const lowestScorer: TeamOdds[] = allTeams
      .map((t, i) => ({
        teamId: `${t.leagueId}-${t.team.rosterId}`, // Make teamId unique across leagues
        teamName:
          t.team.roster?.owner?.metadata?.team_name ||
          t.team.roster?.owner?.displayName ||
          t.team.roster?.owner?.username ||
          `Team ${t.team.rosterId}`,
        leagueId: t.leagueId,
        leagueName: t.leagueName,
        probability: winsLow[i] / iterations,
        odds: probToAmerican(winsLow[i] / iterations),
        projectedRange: { p10: t.p10, p50: t.p50, p90: t.p90 },
        totalProjection: t.mean,
        color: probToColor(winsLow[i] / iterations, true),
      }))
      .sort((a, b) => b.probability - a.probability);

    const toMatchupOdds = (arr: number[]): MatchupOdds[] =>
      arr
        .map((wins, pi) => {
          const [i, j] = pairs[pi];
          const a = allTeams[i];
          const b = allTeams[j];
          return {
            matchupId: a.team.matchupId,
            team1: {
              name:
                a.team.roster?.owner?.metadata?.team_name ||
                a.team.roster?.owner?.displayName ||
                a.team.roster?.owner?.username ||
                `Team ${a.team.rosterId}`,
              leagueId: a.leagueId,
              projection: Math.round(a.mean * 100) / 100,
            },
            team2: {
              name:
                b.team.roster?.owner?.metadata?.team_name ||
                b.team.roster?.owner?.displayName ||
                b.team.roster?.owner?.username ||
                `Team ${b.team.rosterId}`,
              leagueId: b.leagueId,
              projection: Math.round(b.mean * 100) / 100,
            },
            projectedMargin: Math.round(Math.abs(a.mean - b.mean) * 100) / 100,
            probability: wins / iterations,
            odds: probToAmerican(wins / iterations),
            color: probToColor(wins / iterations),
          };
        })
        .sort((x, y) => y.probability - x.probability);

    const closestMatchup = toMatchupOdds(pairWinsClosest);
    const biggestBlowout = toMatchupOdds(pairWinsBlowout);
    const highestScoringMatchup = toMatchupOdds(pairWinsHighest);
    const lowestScoringMatchup = toMatchupOdds(pairWinsLowest);

    const payload: LeagueWideOdds = {
      week,
      highestScorer,
      lowestScorer,
      closestMatchup,
      biggestBlowout,
      highestScoringMatchup,
      lowestScoringMatchup,
      lastUpdated: new Date().toISOString(),
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error('[LEAGUE ODDS] Error:', err);
    return NextResponse.json({ error: 'Failed to calculate odds' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
