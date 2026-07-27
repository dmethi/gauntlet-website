import { NextResponse } from 'next/server';
import { getLeaguesForSeason } from '@/config/leagues';
import { formDb } from '@/lib/form-db';
import { createStatsClient } from '@/lib/sleeper/unified-client';
import type { SleeperRoster, SleeperUser } from '@gauntlet/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ISR_REVALIDATE = { revalidate: 3600 };
const sleeperClient = createStatsClient();
const PROMO_CUTOFF = 6; // top 6 per league -> Division I
const BOTTOM_LEAGUE_PROMO_CUTOFF = 6;

export interface TeamSlot {
  name: string;
  wins: number;
  losses: number;
  pts: number;
  isConfirmed?: boolean;
  isDeclined?: boolean;
  isOpen?: boolean;
  isPromoted?: boolean;
  isRegistration?: boolean;
  registrationPosition?: number;
  slotLabel?: string;
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
    divisionIII: LeagueBox;
    zones: {
      divI: { relegation: number };
      divII: { promotion: number; relegation: number };
      divIII: { promotion: number };
    };
  };
}

const pts = (roster: SleeperRoster) => {
  return (roster.settings.fpts || 0) + (roster.settings.fpts_decimal || 0) / 100;
};

const resolveTeamName = (
  userId: string | null,
  userMap: Map<string, SleeperUser>,
  rosterId: number,
) => {
  if (!userId) return `Team ${rosterId}`;

  const user = userMap.get(userId);
  return user?.metadata?.team_name?.trim() || user?.display_name || `Team ${rosterId}`;
};

const normalizeTeamName = (teamName: string) => {
  return teamName.trim().toLowerCase();
};

const DECLINED_TEAM_NAMES = new Set(
  [
    'achak',
    'achak7',
    'akhil c',
    'arnav',
    'arnav mehta',
    'arnavmehta',
    'dont go chasing saquon',
    'kyle/darshan',
    'darshan/kyle',
    'darshan and kyle',
    'dr patel parikh md mba',
    'dparikh3',
    'arpit/yash',
    'arpit & yash',
    'nielgetscarried',
    'adam',
    'nacua matata',
    'lazy9669',
    'dhruv modi',
  ].map(normalizeTeamName),
);

const isDeclinedTeam = (teamName: string) => {
  return DECLINED_TEAM_NAMES.has(normalizeTeamName(teamName));
};

const FALLBACK_PREREGISTRATION_NAMES = [
  'Zach Hirsh',
  'Sean Chokshi',
  'Arsh Kumar',
  'Dhruv Modi',
  'Rishi',
  'Akhil Madurai',
  'Sunny Patel',
  'Steven Moran',
  'Ashwin Dandapani',
  'Lance Jeffers',
  'Sharaf',
  'Adhitya Vadivel',
  'Pauras Swami',
];

const TEMPORARILY_REMOVED_REGISTRATION_NAMES = new Set(['dhruv modi'].map(normalizeTeamName));

const bySeasonFinish = (a: TeamSlot, b: TeamSlot) => {
  return b.wins - a.wins || b.pts - a.pts;
};

const withRegistrationSlots = (
  registrationNames: string[],
  startIndex: number,
  count: number,
  confirmedTeams: Set<string>,
  slotLabel = 'Preregistered',
): TeamSlot[] => {
  return Array.from({ length: count }, (_, index) => {
    const position = startIndex + index;
    const registrationName = registrationNames[position];

    if (registrationName) {
      return {
        name: registrationName,
        wins: 0,
        losses: 0,
        pts: 0,
        isRegistration: true,
        isConfirmed: confirmedTeams.has(normalizeTeamName(registrationName)),
        registrationPosition: position + 1,
        slotLabel,
      };
    }

    return {
      name: 'Open',
      wins: 0,
      losses: 0,
      pts: 0,
      isOpen: true,
      slotLabel,
    };
  });
};

export const GET = async () => {
  try {
    const [confirmedEntries, registrationEntries] = await Promise.all([
      formDb.returnConfirmation
        .findMany({
          select: { name: true, team: true },
        })
        .catch(error => {
          console.warn('[league-structure] return confirmations unavailable', error);
          return [];
        }),
      formDb.waitlistEntry
        .findMany({
          orderBy: { createdAt: 'asc' },
          select: { name: true },
        })
        .catch(error => {
          console.warn('[league-structure] registrations unavailable', error);
          return FALLBACK_PREREGISTRATION_NAMES.map(name => ({ name }));
        }),
    ]);

    const confirmedTeams = new Set(
      confirmedEntries.flatMap(entry => [
        normalizeTeamName(entry.name),
        ...(entry.team ? [normalizeTeamName(entry.team)] : []),
      ]),
    );

    // This computes the real historical Year-1-to-Year-2 promotion/relegation
    // structure from the actual 2 Year-1 (2025) leagues — pin explicitly.
    const leagueData = await Promise.all(
      getLeaguesForSeason('2025').map(async league => {
        const [rosters, users] = await Promise.all([
          sleeperClient.fetchRosters(league.id, ISR_REVALIDATE),
          sleeperClient.fetchUsers(league.id, ISR_REVALIDATE),
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
              isDeclined: isDeclinedTeam(teamName),
            };
          })
          .sort(bySeasonFinish);

        teams.forEach((team, index) => {
          team.divDest = index < PROMO_CUTOFF ? 1 : 2;
        });

        return { leagueId: league.id, leagueName: league.name, teams };
      }),
    );

    const yearOneDivI = [
      ...leagueData[0].teams.slice(0, PROMO_CUTOFF),
      ...leagueData[1].teams.slice(0, PROMO_CUTOFF),
    ];
    const yearOneDivII = [
      ...leagueData[0].teams.slice(PROMO_CUTOFF),
      ...leagueData[1].teams.slice(PROMO_CUTOFF),
    ];

    const returningDivI = yearOneDivI.filter(team => !team.isDeclined);
    const returningDivII = yearOneDivII.filter(team => !team.isDeclined).sort(bySeasonFinish);
    const divIVacancies = Math.max(0, 12 - returningDivI.length);
    const promotedTeams = returningDivII.slice(0, divIVacancies);
    const promotedNames = new Set(promotedTeams.map(team => normalizeTeamName(team.name)));

    const divITeams: TeamSlot[] = [...returningDivI, ...promotedTeams]
      .sort(bySeasonFinish)
      .map(team => ({
        name: team.name,
        wins: team.wins,
        losses: team.losses,
        pts: team.pts,
        isConfirmed: team.isConfirmed,
        isPromoted: promotedNames.has(normalizeTeamName(team.name)),
        slotLabel: team.slotLabel,
      }));

    const divIIReturners = returningDivII.filter(
      team => !promotedNames.has(normalizeTeamName(team.name)),
    );
    const registrationNames = registrationEntries
      .map(entry => entry.name)
      .filter(name => !TEMPORARILY_REMOVED_REGISTRATION_NAMES.has(normalizeTeamName(name)));
    const divisionIIRegistrationSlots = withRegistrationSlots(
      registrationNames,
      0,
      Math.max(0, 12 - divIIReturners.length),
      confirmedTeams,
      'Preregistered',
    );

    const divIIReturnerSlots: TeamSlot[] = divIIReturners.map(team => ({
      name: team.name,
      wins: team.wins,
      losses: team.losses,
      pts: team.pts,
      isConfirmed: team.isConfirmed,
    }));
    const divIITeams: TeamSlot[] = [...divIIReturnerSlots, ...divisionIIRegistrationSlots];

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
          divisionIII: {
            leagueName: 'Division III',
            teams: withRegistrationSlots(
              registrationNames,
              divisionIIRegistrationSlots.length,
              12,
              confirmedTeams,
            ),
          },
          zones: {
            divI: { relegation: 6 },
            divII: { promotion: 6, relegation: 6 },
            divIII: { promotion: BOTTOM_LEAGUE_PROMO_CUTOFF },
          },
        },
      } satisfies StructureData,
    });
  } catch (error) {
    console.error('[league-structure]', error);
    return NextResponse.json({ ok: false, error: 'Failed to load structure' }, { status: 500 });
  }
};
