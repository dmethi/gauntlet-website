#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';
import {
  calculateLeagueProjections,
  type ScoringSettings,
} from '../apps/web/src/lib/calculate-league-projections';

// Load environment variables from root .env file
config({ path: path.resolve(process.cwd(), '.env') });

const GAUNTLET_LEAGUES = [
  { id: '1263744209295245312', name: 'Gauntlet AFC' },
  { id: '1263740549504962561', name: 'Gauntlet NFC' },
];

interface TeamOdds {
  team: string;
  leagueId: string;
  probability: number;
  odds: string;
}

interface MatchupOdds {
  teams: string[];
  leagueId: string;
  probability: number;
  odds: string;
}

interface LeagueOdds {
  highestScorer: TeamOdds[];
  lowestScorer: TeamOdds[];
  closestMatchup: MatchupOdds[];
  biggestBlowout: MatchupOdds[];
  highestScoringMatchup: MatchupOdds[];
  lowestScoringMatchup: MatchupOdds[];
}

// Sleeper API functions
async function fetchSleeperData(url: string): Promise<any> {
  const response = await fetch(`https://api.sleeper.app/v1${url}`);
  if (!response.ok) {
    throw new Error(`Sleeper API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function getRawProjections(week: number, season: string = '2025'): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.sleeper.com/projections/nfl/${season}/${week}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF&order_by=pts_half_ppr`,
      {
        headers: { 'User-Agent': 'Gauntlet-League-Odds-Generator/1.0.0' },
      }
    );

    if (!response.ok) {
      throw new Error(`Sleeper projections API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return Array.isArray(data)
      ? data
      : Object.entries(data).map(([playerId, projection]) => ({
          ...(typeof projection === 'object' && projection !== null ? projection : {}),
          player_id: playerId,
        }));
  } catch (error) {
    console.warn('Could not fetch raw projections:', error);
    return [];
  }
}

function probToAmerican(prob: number): string {
  if (prob <= 0) return '+∞';
  if (prob >= 1) return '-∞';
  if (prob >= 0.5) return `-${Math.round((prob / (1 - prob)) * 100)}`;
  return `+${Math.round(((1 - prob) / prob) * 100)}`;
}

function sampleScore(mean: number, p10: number, p90: number): number {
  const std = (p90 - p10) / (2 * 1.28);
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

async function generateLeagueOdds(week: number, season: string = '2025'): Promise<LeagueOdds> {
  console.log(`🎲 Generating league odds for Week ${week}...`);

  // Fetch raw projections
  const rawProjections = await getRawProjections(week, season);
  console.log(`📊 Loaded ${rawProjections.length} raw projections`);

  const allTeams: Array<{
    team: { rosterId: number; matchupId: number; roster?: any };
    leagueId: string;
    leagueName: string;
    mean: number;
    p10: number;
    p50: number;
    p90: number;
  }> = [];

  for (const league of GAUNTLET_LEAGUES) {
    console.log(`🏈 Processing ${league.name} for odds...`);

    const [rosters, users, matchups, leagueInfo] = await Promise.all([
      fetchSleeperData(`/league/${league.id}/rosters`),
      fetchSleeperData(`/league/${league.id}/users`),
      fetchSleeperData(`/league/${league.id}/matchups/${week}`),
      fetchSleeperData(`/league/${league.id}`),
    ]);

    const usersById = new Map(users.map((u: any) => [u.user_id, u]));
    const rostersById = new Map(rosters.map((r: any) => [r.roster_id, r]));

    // Calculate league-specific projections
    const scoringSettings: ScoringSettings = leagueInfo?.scoring_settings || {};
    const leagueProjections = calculateLeagueProjections(rawProjections, scoringSettings);

    // Group matchups by matchup_id
    const grouped = new Map<number, any[]>();
    for (const m of matchups) {
      if (m.matchup_id == null) continue;
      const arr = grouped.get(m.matchup_id) || [];
      arr.push(m);
      grouped.set(m.matchup_id, arr);
    }

    for (const [, pair] of grouped) {
      if (pair.length !== 2) continue;
      const [a, b] = pair as any[];

      const buildTeamScore = (entry: any) => {
        const ids: string[] = (entry.starters || []) as string[];
        let totalProjection = 0;

        ids.forEach(id => {
          const projection = leagueProjections[id];
          totalProjection += projection?.points || 0;
        });

        // Estimate distribution using simple heuristics
        const mean = totalProjection;
        const std = mean * 0.15; // ~15% standard deviation
        const p10 = mean - 1.28 * std;
        const p50 = mean;
        const p90 = mean + 1.28 * std;

        return { mean, p10, p50, p90 };
      };

      const teamAScore = buildTeamScore(a);
      const teamBScore = buildTeamScore(b);

      const rosterA = rostersById.get(a.roster_id);
      const rosterB = rostersById.get(b.roster_id);
      const ownerA = rosterA ? usersById.get(rosterA.owner_id) : null;
      const ownerB = rosterB ? usersById.get(rosterB.owner_id) : null;

      allTeams.push(
        {
          team: { rosterId: a.roster_id, matchupId: a.matchup_id, roster: { owner: ownerA } },
          leagueId: league.id,
          leagueName: league.name,
          ...teamAScore,
        },
        {
          team: { rosterId: b.roster_id, matchupId: b.matchup_id, roster: { owner: ownerB } },
          leagueId: league.id,
          leagueName: league.name,
          ...teamBScore,
        }
      );
    }
  }

  console.log(`🎯 Running 10,000 simulations for ${allTeams.length} teams...`);

  // Monte Carlo simulation (copied from league-odds route)
  const iterations = 10000;
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

    // Find highest and lowest team scorers
    let maxIdx = 0;
    let minIdx = 0;
    for (let i = 1; i < scores.length; i++) {
      if (scores[i] > scores[maxIdx]) maxIdx = i;
      if (scores[i] < scores[minIdx]) minIdx = i;
    }
    winsHigh[maxIdx]++;
    winsLow[minIdx]++;

    // Find matchup extremes
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

  // Build results
  const getTeamName = (team: any) =>
    team.roster?.owner?.metadata?.team_name ||
    team.roster?.owner?.display_name ||
    team.roster?.owner?.username ||
    `Team ${team.roster_id}`;

  const highestScorer: TeamOdds[] = allTeams
    .map((t, i) => ({
      team: getTeamName(t.team),
      leagueId: t.leagueName.includes('AFC') ? 'AFC' : 'NFC',
      probability: winsHigh[i] / iterations,
      odds: probToAmerican(winsHigh[i] / iterations),
    }))
    .sort((a, b) => b.probability - a.probability);

  const lowestScorer: TeamOdds[] = allTeams
    .map((t, i) => ({
      team: getTeamName(t.team),
      leagueId: t.leagueName.includes('AFC') ? 'AFC' : 'NFC',
      probability: winsLow[i] / iterations,
      odds: probToAmerican(winsLow[i] / iterations),
    }))
    .sort((a, b) => b.probability - a.probability);

  const toMatchupOdds = (arr: number[]): MatchupOdds[] =>
    arr
      .map((wins, pi) => {
        const [i, j] = pairs[pi];
        const a = allTeams[i];
        const b = allTeams[j];
        return {
          teams: [getTeamName(a.team), getTeamName(b.team)],
          leagueId: a.leagueName.includes('AFC') ? 'AFC' : 'NFC',
          probability: wins / iterations,
          odds: probToAmerican(wins / iterations),
        };
      })
      .sort((x, y) => y.probability - x.probability);

  return {
    highestScorer,
    lowestScorer,
    closestMatchup: toMatchupOdds(pairWinsClosest),
    biggestBlowout: toMatchupOdds(pairWinsBlowout),
    highestScoringMatchup: toMatchupOdds(pairWinsHighest),
    lowestScoringMatchup: toMatchupOdds(pairWinsLowest),
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: tsx generate-league-odds.ts <week> [season]');
    console.error('Example: tsx generate-league-odds.ts 4 2025');
    process.exit(1);
  }

  const week = parseInt(args[0]);
  const season = args[1] || '2025';

  if (!Number.isInteger(week) || week < 1 || week > 18) {
    console.error('Week must be between 1 and 18');
    process.exit(1);
  }

  try {
    const leagueOdds = await generateLeagueOdds(week, season);

    // Write to file
    const outputPath = path.resolve(process.cwd(), `league-odds-week${week}-${season}.json`);

    fs.writeFileSync(outputPath, JSON.stringify(leagueOdds, null, 2));

    console.log(`✅ League odds generated successfully!`);
    console.log(`📁 Output: ${outputPath}`);
    console.log(
      `📊 Top team for highest scorer: ${leagueOdds.highestScorer[0]?.team} (${(leagueOdds.highestScorer[0]?.probability * 100).toFixed(1)}%)`
    );
  } catch (error) {
    console.error('❌ Error generating league odds:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
