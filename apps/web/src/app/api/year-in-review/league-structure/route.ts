import { NextResponse } from 'next/server';
import { CURRENT_LEAGUES } from '@/config/leagues';
import { formDb } from '@/lib/form-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SLEEPER = 'https://api.sleeper.app/v1';
const PROMO_CUTOFF = 6; // top 6 per league -> Division I

async function s<T>(path: string): Promise<T> {
  const res = await fetch(`${SLEEPER}/${path}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Sleeper ${path}: ${res.status}`);
  return res.json();
}

interface SleeperRoster {
  roster_id: number;
  owner_id: string | null;
  settings: { wins: number; losses: number; fpts: number; fpts_decimal: number };
}

interface SleeperUser {
  user_id: string;
  display_name: string;
  metadata?: { team_name?: string };
}

export interface TeamSlot {
  name: string;
  wins: number;
  losses: number;
  pts: number;
  isConfirmed?: boolean;
  isOpen?: boolean;
  isWaitlist?: boolean;
  waitlistPosition?: number;
  /** Year 1 only — destination division */
  divDest?: 1 | 2;
}

export interface LeagueBox {
  leagueName: string;
  teams: TeamSlot[];
}

export interface StructureData {
  year1: LeagueBox[];
  year2: {
    divisionI: LeagueBox;
    divisionII: LeagueBox;
    divisionIIIA: LeagueBox;
    divisionIIIB: LeagueBox;
    zones: {
      divI: { relegation: number };
      divII: { promotion: number; relegation: number };
      divIII: { promotion: number };
    };
  };
}

function pts(roster: SleeperRoster) {
  return (roster.settings.fpts || 0) + (roster.settings.fpts_decimal || 0) / 100;
}

function resolveTeamName(
  userId: string | null,
  userMap: Map<string, SleeperUser>,
  rosterId: number,
) {
  if (!userId) return `Team ${rosterId}`;

  const user = userMap.get(userId);
  return user?.metadata?.team_name?.trim() || user?.display_name || `Team ${rosterId}`;
}

function normalizeTeamName(teamName: string) {
  return teamName.trim().toLowerCase();
}

function withWaitlistSlots(waitlistNames: string[], startIndex: number, count: number): TeamSlot[] {
  return Array.from({ length: count }, (_, index) => {
    const position = startIndex + index;
    const waitlistName = waitlistNames[position];

    if (waitlistName) {
      return {
        name: waitlistName,
        wins: 0,
        losses: 0,
        pts: 0,
        isWaitlist: true,
        waitlistPosition: position + 1,
      };
    }

    return {
      name: `Open Slot ${position + 1}`,
      wins: 0,
      losses: 0,
      pts: 0,
      isOpen: true,
    };
  });
}

export async function GET() {
  try {
    const [confirmedEntries, waitlistEntries] = await Promise.all([
      formDb.returnConfirmation.findMany({
        select: { team: true },
      }),
      formDb.waitlistEntry.findMany({
        orderBy: { createdAt: 'asc' },
        select: { name: true },
      }),
    ]);

    const confirmedTeams = new Set(
      confirmedEntries.flatMap(entry => (entry.team ? [normalizeTeamName(entry.team)] : [])),
    );

    const leagueData = await Promise.all(
      CURRENT_LEAGUES.map(async league => {
        const [rosters, users] = await Promise.all([
          s<SleeperRoster[]>(`league/${league.id}/rosters`),
          s<SleeperUser[]>(`league/${league.id}/users`),
        ]);

        const userMap = new Map(users.map(user => [user.user_id, user]));
        const teams: TeamSlot[] = rosters
          .map(roster => {
            const teamName = resolveTeamName(roster.owner_id, userMap, roster.roster_id);

            return {
              name: teamName,
              wins: roster.settings.wins,
              losses: roster.settings.losses,
              pts: pts(roster),
              isConfirmed: confirmedTeams.has(normalizeTeamName(teamName)),
            };
          })
          .sort((a, b) => b.wins - a.wins || b.pts - a.pts);

        teams.forEach((team, index) => {
          team.divDest = index < PROMO_CUTOFF ? 1 : 2;
        });

        return { leagueId: league.id, leagueName: league.name, teams };
      }),
    );

    const divITeams: TeamSlot[] = [
      ...leagueData[0].teams.slice(0, PROMO_CUTOFF),
      ...leagueData[1].teams.slice(0, PROMO_CUTOFF),
    ]
      .sort((a, b) => b.wins - a.wins || b.pts - a.pts)
      .map(team => ({
        name: team.name,
        wins: team.wins,
        losses: team.losses,
        pts: team.pts,
        isConfirmed: team.isConfirmed,
      }));

    const divIITeams: TeamSlot[] = [
      ...leagueData[0].teams.slice(PROMO_CUTOFF),
      ...leagueData[1].teams.slice(PROMO_CUTOFF),
    ]
      .sort((a, b) => b.wins - a.wins || b.pts - a.pts)
      .map(team => ({
        name: team.name,
        wins: team.wins,
        losses: team.losses,
        pts: team.pts,
        isConfirmed: team.isConfirmed,
      }));

    const waitlistNames = waitlistEntries.map(entry => entry.name);

    return NextResponse.json({
      ok: true,
      data: {
        year1: leagueData.map(league => ({
          leagueName: league.leagueName,
          teams: league.teams,
        })),
        year2: {
          divisionI: { leagueName: 'Division I', teams: divITeams },
          divisionII: { leagueName: 'Division II', teams: divIITeams },
          divisionIIIA: {
            leagueName: 'Division III A',
            teams: withWaitlistSlots(waitlistNames, 0, 12),
          },
          divisionIIIB: {
            leagueName: 'Division III B',
            teams: withWaitlistSlots(waitlistNames, 12, 12),
          },
          zones: {
            divI: { relegation: 6 },
            divII: { promotion: 6, relegation: 6 },
            divIII: { promotion: 3 },
          },
        },
      } satisfies StructureData,
    });
  } catch (error) {
    console.error('[league-structure]', error);
    return NextResponse.json({ ok: false, error: 'Failed to load structure' }, { status: 500 });
  }
}
