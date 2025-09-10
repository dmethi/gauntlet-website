#!/usr/bin/env tsx
import prisma from '../../lib/prisma.js';

async function fetchSleeperMatchups(leagueId: string, week: number): Promise<any[]> {
  const res = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`, {
    headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Sleeper matchups fetch failed ${res.status}`);
  return (await res.json()) as any[];
}

async function refreshLeague(leagueId: string, week: number) {
  const sleeper = await fetchSleeperMatchups(leagueId, week);
  // Map Sleeper roster_id -> DB rosterId (NFC DB uses 2000 offset)
  const offset = leagueId === '1263740549504962561' ? 2000 : 0;

  for (const m of sleeper) {
    const dbRosterId = Number(m.roster_id) + offset;
    const starters: string[] = (m.starters || []).filter(Boolean);
    const players: string[] = (m.players || []).filter(Boolean);
    const playersPoints: Record<string, number> = m.players_points || {};
    const points = Number(m.points || 0);

    await prisma.matchup
      .update({
        where: { leagueId_week_rosterId: { leagueId, week, rosterId: dbRosterId } },
        data: {
          starters,
          players,
          playersPoints,
          points,
        },
      })
      .catch(() => void 0);
  }
}

async function main() {
  const week = Number(process.env.WEEK || 1);
  const leagues = ['1263744209295245312', '1263740549504962561'];
  for (const lid of leagues) {
    await refreshLeague(lid, week);
    console.log(`✅ Refreshed lineups for league ${lid}, week ${week}`);
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

