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

function getOffset(leagueId: string): number {
  // NFC league has rosterId offset of +2000 in DB
  return leagueId === '1263740549504962561' ? 2000 : 0;
}

async function auditLeague(leagueId: string, week: number) {
  const offset = getOffset(leagueId);
  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  console.log(`\n=== Audit: ${league?.name} (week ${week}) ===`);

  // DB rosters, names
  const rosters = await prisma.roster.findMany({
    where: { leagueId },
    include: { owner: true },
    orderBy: { id: 'asc' },
  });
  const nameByRoster: Record<number, string> = {};
  for (const r of rosters) {
    const rosterMetaName = ((r.metadata as any) || {})?.team_name;
    const ownerMetaName = ((r.owner?.metadata as any) || {})?.team_name;
    const name =
      rosterMetaName ||
      ownerMetaName ||
      r.owner?.displayName ||
      r.owner?.username ||
      `Team ${r.id}`;
    nameByRoster[r.id] = name;
  }
  console.table(
    rosters.map(r => ({
      rosterId: r.id,
      name: nameByRoster[r.id],
      players: r.players?.length || 0,
    }))
  );

  // DB matchups
  const matchups = await prisma.matchup.findMany({
    where: { leagueId, week },
    orderBy: { rosterId: 'asc' },
  });
  console.table(
    matchups.map(m => ({
      rosterId: m.rosterId,
      starters: (m.starters || []).length,
      points: m.points || 0,
    }))
  );

  // Sleeper matchups
  const sleeper = await fetchSleeperMatchups(leagueId, week);
  const issues: Array<Record<string, unknown>> = [];
  for (const sm of sleeper) {
    const dbRosterId = Number(sm.roster_id) + offset;
    const dbRow = matchups.find(m => m.rosterId === dbRosterId);
    const startersCountDb = (dbRow?.starters || []).length;
    const startersCountApi = (sm.starters || []).length;
    const pointsDb = dbRow?.points || 0;
    const pointsApi = Number(sm.points || 0);
    const playersPointsDb = Object.keys((dbRow?.playersPoints as any) || {}).length;
    const playersPointsApi = Object.keys(sm.players_points || {}).length;

    if (!dbRow) {
      issues.push({
        type: 'missing_db_matchup',
        rosterId: dbRosterId,
        sleeper_roster_id: sm.roster_id,
      });
      continue;
    }
    if (startersCountDb === 0 && startersCountApi > 0) {
      issues.push({
        type: 'starters_empty_in_db',
        rosterId: dbRosterId,
        apiStarters: startersCountApi,
      });
    }
    if (playersPointsDb === 0 && playersPointsApi > 0) {
      issues.push({
        type: 'players_points_empty_in_db',
        rosterId: dbRosterId,
        apiPlayersPoints: playersPointsApi,
      });
    }
    if (Math.abs(pointsDb - pointsApi) > 0.01) {
      issues.push({ type: 'points_mismatch', rosterId: dbRosterId, pointsDb, pointsApi });
    }
  }

  if (issues.length === 0) {
    console.log('✅ No issues detected. ID resolution and hydration look correct.');
  } else {
    console.log('⚠️ Issues detected:');
    console.table(issues.slice(0, 20));
    if (issues.length > 20) console.log(`...and ${issues.length - 20} more`);
  }
}

async function main() {
  const week = Number(process.env.WEEK || 1);
  const leagues = ['1263744209295245312', '1263740549504962561'];
  for (const lid of leagues) {
    await auditLeague(lid, week);
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

