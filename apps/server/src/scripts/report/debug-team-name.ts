#!/usr/bin/env tsx
import prisma from '../../lib/prisma.js';

type SleeperUser = {
  user_id: string;
  username?: string;
  display_name: string;
  metadata?: Record<string, unknown>;
};

type SleeperRoster = {
  roster_id: number;
  owner_id?: string;
  metadata?: Record<string, unknown>;
  settings?: Record<string, unknown>;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Request failed ${res.status}: ${url}`);
  return (await res.json()) as T;
}

function isGenericTeamName(val?: string | null): boolean {
  if (!val) return true;
  const s = String(val).trim();
  return /^team\s+\d+$/i.test(s);
}

function resolveTeamNameLike(
  rosterId: number,
  rosterMetaName?: string,
  ownerMetaName?: string,
  ownerDisplay?: string,
  ownerUser?: string
) {
  if (rosterMetaName && !isGenericTeamName(rosterMetaName)) return rosterMetaName;
  if (ownerMetaName && !isGenericTeamName(ownerMetaName)) return ownerMetaName;
  if (ownerDisplay && !isGenericTeamName(ownerDisplay)) return ownerDisplay;
  if (ownerUser && !isGenericTeamName(ownerUser)) return ownerUser;
  return `Team ${rosterId}`;
}

async function main() {
  const leagueId = process.env.LEAGUE_ID || '1263740549504962561'; // NFC by default
  const username = process.env.USERNAME || 'dmethi';
  const week = Number(process.env.WEEK || 1);

  console.log(`\n=== Debug Team Name — league ${leagueId}, username ${username}, week ${week} ===`);

  // DB layer
  const dbRosters = await prisma.roster.findMany({ where: { leagueId }, include: { owner: true } });
  const targetDb = dbRosters.find(
    r => r.owner?.username === username || r.owner?.displayName === username
  );
  console.log(
    '\n[DB] Owner roster match:',
    targetDb
      ? {
          rosterId: targetDb.id,
          ownerId: targetDb.ownerId,
          ownerUsername: targetDb.owner?.username,
          ownerDisplay: targetDb.owner?.displayName,
          ownerMetaTeamName: (targetDb.owner?.metadata as any)?.team_name,
          rosterMetaTeamName: (targetDb.metadata as any)?.team_name,
          rosterSettingsTeamName: (targetDb.settings as any)?.team_name,
        }
      : 'NOT FOUND'
  );

  // Sleeper layer
  const [slUsers, slRosters] = await Promise.all([
    fetchJson<SleeperUser[]>(`https://api.sleeper.app/v1/league/${leagueId}/users`),
    fetchJson<SleeperRoster[]>(`https://api.sleeper.app/v1/league/${leagueId}/rosters`),
  ]);
  const slUser = slUsers.find(u => u.username === username || u.display_name === username);
  const slRoster = slUser ? slRosters.find(r => r.owner_id === slUser.user_id) : undefined;
  console.log(
    '\n[Sleeper] Owner user match:',
    slUser
      ? {
          userId: slUser.user_id,
          username: slUser.username,
          displayName: slUser.display_name,
          userMetaTeamName: (slUser.metadata as any)?.team_name,
        }
      : 'NOT FOUND'
  );
  console.log(
    '[Sleeper] Owner roster match:',
    slRoster
      ? {
          rosterId: slRoster.roster_id,
          rosterMetaTeamName: (slRoster.metadata as any)?.team_name,
          rosterSettingsTeamName: (slRoster.settings as any)?.team_name,
        }
      : 'NOT FOUND'
  );

  // Resolution preview
  if (targetDb) {
    const resolvedDb = resolveTeamNameLike(
      targetDb.id,
      (targetDb.metadata as any)?.team_name,
      (targetDb.owner?.metadata as any)?.team_name,
      targetDb.owner?.displayName,
      targetDb.owner?.username
    );
    console.log('\n[DB] Resolved team name =>', resolvedDb);
  }
  if (slRoster && slUser) {
    const rosterIdDb =
      leagueId === '1263740549504962561' ? slRoster.roster_id + 2000 : slRoster.roster_id;
    const resolvedSleeper = resolveTeamNameLike(
      rosterIdDb,
      (slRoster.metadata as any)?.team_name,
      (slUser.metadata as any)?.team_name,
      slUser.display_name,
      slUser.username
    );
    console.log('[Sleeper] Resolved team name =>', resolvedSleeper);
  }

  // Sanity: what name does API pipeline see for this roster in standings?
  if (targetDb) {
    const agg = await prisma.rosterWeekAggregate.findMany({
      where: { leagueId, rosterId: targetDb.id, week: { lte: week } },
      orderBy: { week: 'asc' },
    });
    console.log('\n[DB] Aggregates count:', agg.length);
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
