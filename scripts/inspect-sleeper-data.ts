#!/usr/bin/env tsx
/**
 * Inspect Sleeper Data
 * Prints rosters, starters, projections, and stats for each player per roster for a given league/week.
 * Usage: pnpm tsx scripts/inspect-sleeper-data.ts --league <LEAGUE_ID> --week <WEEK>
 */

import SleeperAPIService from '../apps/server/src/services/sleeper/sleeper-api.service';

type Argv = { league?: string; week?: string; team?: string };

function parseArgs(): Argv {
  const args = process.argv.slice(2);
  const out: Argv = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--league' || a === '-l') out.league = args[++i];
    else if (a === '--week' || a === '-w') out.week = args[++i];
    else if (a === '--team' || a === '-t') out.team = args[++i];
  }
  return out;
}

function toMap<T, K extends string | number>(items: T[], key: (t: T) => K) {
  return new Map<K, T>(items.map(it => [key(it), it] as const));
}

async function main() {
  const { league, week, team } = parseArgs();
  const sleeper = SleeperAPIService.getInstance();

  const targetLeague = league || process.env.LEAGUE_ID || SleeperAPIService.LEAGUE_IDS.AFC;
  const nflState = await sleeper.getNFLState();
  const targetWeek = Number(week || process.env.WEEK || nflState.week || 1);

  console.log(`\nInspecting Sleeper data for league=${targetLeague} week=${targetWeek}`);

  // Fetch all data in parallel
  const [leagueInfo, rosters, users, matchups, players, projections, stats] = await Promise.all([
    sleeper.getLeague(targetLeague),
    sleeper.getRosters(targetLeague),
    sleeper.getUsers(targetLeague),
    sleeper.getMatchups(targetLeague, targetWeek),
    sleeper.getPlayers(),
    sleeper.getProjections(targetWeek, nflState.season),
    sleeper.getStats(targetWeek, nflState.season),
  ]);

  console.log(`\nLeague: ${leagueInfo?.name} (season ${nflState.season})`);
  console.log(`Rosters: ${rosters.length}, Users: ${users.length}, Matchups: ${matchups.length}`);

  const usersById = toMap(users, (u: any) => u.user_id);
  const rostersById = toMap(rosters, (r: any) => r.roster_id);

  // Build pairs by matchup_id
  const pairs = new Map<number, any[]>();
  for (const m of matchups) {
    const mid = m.matchup_id;
    if (mid == null) continue;
    const arr = pairs.get(mid) || [];
    arr.push(m);
    pairs.set(mid, arr);
  }

  // Normalize projections/stats maps (Sleeper projections/stats can be array or object keyed by player_id)
  const projectionsMap: Record<string, any> = Array.isArray(projections)
    ? Object.fromEntries((projections as any[]).map((p: any) => [p.player_id, p]))
    : (projections as Record<string, any>);
  const statsMap: Record<string, any> = Array.isArray(stats)
    ? Object.fromEntries((stats as any[]).map((s: any) => [s.player_id, s]))
    : (stats as Record<string, any>);

  const playerOf = (id: string) => (players as any)[id] || {};
  const projPts = (id: string) => Number((projectionsMap?.[id]?.pts_half_ppr as number) || 0);
  const actualPts = (id: string) => Number((statsMap?.[id]?.pts_half_ppr as number) || 0);

  // Iterate rosters and print starters with projections + stats
  for (const roster of rosters) {
    const owner = usersById.get(roster.owner_id);
    const starters: string[] = Array.isArray(roster.starters) ? roster.starters : [];
    const startersText = starters.length ? starters.join(', ') : '(none)';

    const ownerName = owner?.display_name || owner?.username || '';
    const teamName = (owner?.metadata as any)?.team_name || ownerName;
    if (team && !String(teamName).toLowerCase().includes(String(team).toLowerCase())) {
      continue;
    }

    console.log(`\nRoster ${roster.roster_id} — ${teamName || ownerName || 'Unknown'}`);
    console.log(`Starters (${starters.length}): ${startersText}`);

    // Print per-starter details
    let sumProj = 0;
    let sumActual = 0;
    for (const pid of starters) {
      const p = playerOf(pid);
      const proj = projPts(pid);
      const act = actualPts(pid);
      sumProj += proj;
      sumActual += act;
      const liveEst = act > 0 ? act + Math.max(0, proj * 0.5) : proj;
      console.log(
        `  - ${p.full_name || pid} [${p.position || 'UNK'} ${p.team || ''}] proj=${proj.toFixed(2)} actual=${act.toFixed(2)} live_est=${liveEst.toFixed(2)}`
      );
    }
    console.log(`  Totals: projected=${sumProj.toFixed(2)} actual=${sumActual.toFixed(2)}`);
  }

  // Also show a quick sample matchup with starters from the matchup payload
  const firstPair = Array.from(pairs.values()).find(v => v.length === 2);
  if (firstPair) {
    const [a, b] = firstPair;
    const ra = rostersById.get(a.roster_id);
    const rb = rostersById.get(b.roster_id);
    const oa = ra ? usersById.get(ra.owner_id) : null;
    const ob = rb ? usersById.get(rb.owner_id) : null;
    const startersA: string[] = Array.isArray(a.starters) ? a.starters : [];
    const startersB: string[] = Array.isArray(b.starters) ? b.starters : [];
    const sumA = startersA.reduce((s, id) => s + projPts(id), 0);
    const sumB = startersB.reduce((s, id) => s + projPts(id), 0);
    console.log(`\nSample Matchup ${a.matchup_id}:`);
    console.log(
      ` A: roster ${a.roster_id} — ${oa?.display_name || oa?.username || 'Unknown'} starters=${startersA.length} proj=${sumA.toFixed(2)}`
    );
    console.log(
      ` B: roster ${b.roster_id} — ${ob?.display_name || ob?.username || 'Unknown'} starters=${startersB.length} proj=${sumB.toFixed(2)}`
    );
  }
}

main().catch(err => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
