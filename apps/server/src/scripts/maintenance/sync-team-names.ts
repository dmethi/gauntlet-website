#!/usr/bin/env tsx
import prisma from '../../lib/prisma.js';

type SleeperUser = { user_id: string; display_name: string; username?: string; metadata?: any };
type SleeperRoster = { roster_id: number; owner_id?: string; metadata?: any };

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return (await res.json()) as T;
}

function isGenericTeamName(val?: string | null): boolean {
  if (!val) return true;
  const s = String(val).trim();
  return /^team\s+\d+$/i.test(s);
}

async function syncLeague(leagueId: string) {
  const [users, rosters] = await Promise.all([
    fetchJson<SleeperUser[]>(`https://api.sleeper.app/v1/league/${leagueId}/users`),
    fetchJson<SleeperRoster[]>(`https://api.sleeper.app/v1/league/${leagueId}/rosters`),
  ]);
  const userById = new Map(users.map(u => [u.user_id, u]));
  const offset = leagueId === '1263740549504962561' ? 2000 : 0; // NFC offset

  let updates = 0;
  for (const r of rosters) {
    const dbRosterId = r.roster_id + offset;
    const user = r.owner_id ? userById.get(r.owner_id) : undefined;
    const sleeperTeam = user?.metadata?.team_name as string | undefined;
    if (!sleeperTeam || isGenericTeamName(sleeperTeam)) continue;

    // Fetch current DB roster
    const dbRoster = await prisma.roster.findUnique({ where: { id: dbRosterId } });
    if (!dbRoster) continue;
    const currentName = (dbRoster.metadata as any)?.team_name as string | undefined;
    if (currentName && !isGenericTeamName(currentName)) continue; // keep existing custom name

    const newMeta = { ...(dbRoster.metadata as any), team_name: sleeperTeam };
    await prisma.roster.update({ where: { id: dbRosterId }, data: { metadata: newMeta as any } });
    updates++;
  }
  console.log(`✅ Synced ${updates} team names for league ${leagueId}`);
}

async function main() {
  const leagues = [
    process.env.LEAGUE_ID || '1263744209295245312', // default AFC
    '1263740549504962561', // NFC
  ];
  for (const lid of new Set(leagues)) {
    await syncLeague(lid);
  }
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
