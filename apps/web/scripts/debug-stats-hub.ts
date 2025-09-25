/*
  Debug script to exercise buildStatsDataset and serialization
  Usage: pnpm tsx apps/web/scripts/debug-stats-hub.ts
*/

import { buildStatsDataset, serializeStatsDataset } from '@/lib/stats/compose';
import { CURRENT_LEAGUES } from '@/config/leagues';

async function main() {
  const leagueIds = CURRENT_LEAGUES.map(l => l.id);
  const labels = CURRENT_LEAGUES.map(l => l.name);
  const from = 1;
  const to = 18;
  console.log('[debug] fetching dataset...', { leagueIds, labels, from, to });
  const ds = await buildStatsDataset({ leagueIds, labels, weekRange: { from, to } });
  const plain = serializeStatsDataset(ds);
  console.log('[debug] dataset summary:', {
    currentWeek: plain.currentWeek,
    leagues: plain.leagues.map(l => l.name),
    weekRange: plain.weekRange,
    teamsCount: plain.teams.length,
    positionsKeys: plain.positions.map(([p]) => p),
  });
  // Print first 5 team names
  console.log(
    '[debug] first teams:',
    plain.teams
      .slice(0, 5)
      .map(([key, t]) => ({ key, team: t.teamInfo.teamName, league: t.teamInfo.leagueId }))
  );
}

main().catch(err => {
  console.error('[debug] error:', err);
  process.exit(1);
});
