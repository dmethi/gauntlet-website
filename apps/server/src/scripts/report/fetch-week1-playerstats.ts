#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Request failed ${res.status}: ${url}`);
  return (await res.json()) as T;
}

async function main() {
  const season = process.env.SEASON || '2025';
  const week = Number(process.env.WEEK || 1);
  const outDir = path.join(process.cwd(), 'apps/web/data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log(`Fetching Sleeper stats and projections for ${season} week ${week}...`);

  const statsUrl = `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`;
  const projUrl = `https://api.sleeper.com/projections/nfl/${season}/${week}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF&order_by=pts_half_ppr`;

  const [stats, projections] = await Promise.all([fetchJson(statsUrl), fetchJson(projUrl)]);

  const statsPath = path.join(outDir, `playerstats-${season}-week${week}-stats.json`);
  const projPath = path.join(outDir, `playerstats-${season}-week${week}-projections.json`);

  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  fs.writeFileSync(projPath, JSON.stringify(projections, null, 2));

  console.log(`Wrote:\n- ${statsPath}\n- ${projPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
