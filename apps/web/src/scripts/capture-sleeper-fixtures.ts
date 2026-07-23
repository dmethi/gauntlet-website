/**
 * Captures real Sleeper API responses to disk for SLEEPER_FIXTURES=1 replay
 * in local dev and tests. Run with: npx tsx src/scripts/capture-sleeper-fixtures.ts
 *
 * Source of truth for which leagues to capture is the league registry
 * (apps/web/src/config/leagues.ts) — no separate allowlist file needed.
 *
 * NOTE: this hits the real Sleeper API and requires network access. Fixtures
 * are captured JSON, never hand-authored — see
 * apps/web/src/lib/sleeper/fixtures/ and docs/AGENTS.md.
 */

import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { getAllLeagues } from '../config/leagues';
import { createServiceClient } from '../lib/sleeper/unified-client';

const FIXTURES_DIR = join(__dirname, '../lib/sleeper/fixtures');
const REGULAR_SEASON_WEEKS = 17;

async function saveFixture(endpoint: string, data: unknown): Promise<void> {
  const filePath = join(FIXTURES_DIR, `${endpoint.replace(/^\//, '')}.json`);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2));
  console.log(`Captured ${endpoint} -> ${filePath}`);
}

async function captureLeague(leagueId: string): Promise<void> {
  const client = createServiceClient();

  const league = await client.fetchLeague(leagueId);
  await saveFixture(`/league/${leagueId}`, league);

  const users = await client.fetchUsers(leagueId);
  await saveFixture(`/league/${leagueId}/users`, users);

  const rosters = await client.fetchRosters(leagueId);
  await saveFixture(`/league/${leagueId}/rosters`, rosters);

  for (let week = 1; week <= REGULAR_SEASON_WEEKS; week++) {
    const matchups = await client.fetchMatchups(leagueId, week);
    await saveFixture(`/league/${leagueId}/matchups/${week}`, matchups);
  }
}

async function main() {
  const leagues = getAllLeagues();
  console.log(`Capturing fixtures for ${leagues.length} registered league(s)...`);

  for (const league of leagues) {
    console.log(`\n--- ${league.name} (${league.id}) ---`);
    await captureLeague(league.id);
  }

  console.log('\nDone.');
}

main().catch(error => {
  console.error('Fixture capture failed:', error);
  process.exit(1);
});
