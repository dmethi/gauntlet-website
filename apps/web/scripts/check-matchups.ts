/*
  Inspect Sleeper matchups for configured leagues and weeks
  Usage: npx tsx apps/web/scripts/check-matchups.ts
*/

import { CURRENT_LEAGUES } from '@/config/leagues';
import { fetchMatchups } from '@/lib/sleeper/client';

async function main() {
  const weeks = [1, 2, 3, 4, 5];
  for (const l of CURRENT_LEAGUES) {
    console.log(`\nLeague ${l.name} (${l.id})`);
    for (const w of weeks) {
      const m = await fetchMatchups(l.id, w);
      const points = m.map(x => x.points).filter(v => typeof v === 'number');
      console.log(`  Week ${w}: matchups=${m.length}, samplePoints=${points.slice(0, 4)}`);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
