import { describe, expect, it } from 'vitest';
import {
  type ComprehensiveHallOfFameData,
  findManagerHallOfFameBadges,
  type ManagerRosterKey,
} from './useHallOfFameEnhanced';
import { formatRecord, type HallOfFameRecord } from '@/features/hall-of-fame/utils';

const MANAGER: ManagerRosterKey[] = [
  { leagueId: 'league_afc', rosterId: 5 },
  { leagueId: 'league_legion_i', rosterId: 2 },
];

const weeklyRecord = (overrides: Partial<HallOfFameRecord>): HallOfFameRecord => ({
  category: 'highest_team_points',
  categoryDisplay: 'Highest Team Points',
  description: 'Highest team points in any week',
  value: 174.06,
  teamName: 'Drake Maye Lover',
  teamId: 5,
  leagueId: 'league_afc',
  leagueName: 'Gauntlet AFC',
  season: '2025',
  ...overrides,
});

const EMPTY_DATA: ComprehensiveHallOfFameData = {
  weeklyRecords: new Map(),
  rollingWindows: {
    threeWeek: { highest: [], lowest: [] },
    fiveWeek: { highest: [], lowest: [] },
  },
  streaks: { winStreaks: [], lossStreaks: [], hotStreaks: [], coldStreaks: [] },
  seasonal: {
    mostWins: [],
    mostPoints: [],
    luckiest: [],
    unluckiest: [],
    mostDonuts: [],
    longestWinStreak: [],
    longestLosingStreak: [],
    mostBlowouts: [],
    strongestSchedule: [],
  },
  positionalDifferences: { QB: [], RB: [], WR: [], TE: [], K: [], DEF: [] },
  totalMatchups: 0,
  totalSeasons: 0,
  totalLeagues: 0,
  lastUpdated: new Date().toISOString(),
};

describe('findManagerHallOfFameBadges', () => {
  it('returns no badges when the manager holds no #1 record', () => {
    const data: ComprehensiveHallOfFameData = {
      ...EMPTY_DATA,
      weeklyRecords: new Map([
        ['highest_team_points', [weeklyRecord({ teamId: 99, leagueId: 'league_other' })]],
      ]),
    };

    expect(findManagerHallOfFameBadges(data, MANAGER)).toEqual([]);
  });

  it('returns no badges for a manager with no roster keys', () => {
    const data: ComprehensiveHallOfFameData = {
      ...EMPTY_DATA,
      weeklyRecords: new Map([['highest_team_points', [weeklyRecord({})]]]),
    };

    expect(findManagerHallOfFameBadges(data, [])).toEqual([]);
  });

  it('badges a weekly category when the manager holds the #1 spot', () => {
    const record = weeklyRecord({});
    const data: ComprehensiveHallOfFameData = {
      ...EMPTY_DATA,
      weeklyRecords: new Map([['highest_team_points', [record]]]),
    };

    const badges = findManagerHallOfFameBadges(data, MANAGER);

    expect(badges).toContainEqual({
      categoryId: 'highest_team_points',
      label: 'Highest Team Points',
      value: formatRecord(record),
      season: '2025',
      leagueId: 'league_afc',
      rank: 1,
    });
  });

  it('badges a category at #2 with the correct rank, not just #1', () => {
    const secondRecord = weeklyRecord({ teamId: 5, leagueId: 'league_afc' });
    const data: ComprehensiveHallOfFameData = {
      ...EMPTY_DATA,
      weeklyRecords: new Map([
        [
          'highest_team_points',
          [
            weeklyRecord({ teamId: 99, leagueId: 'league_other' }), // #1: not our manager
            secondRecord, // #2: our manager
          ],
        ],
      ]),
    };

    const badges = findManagerHallOfFameBadges(data, MANAGER);

    expect(badges).toContainEqual({
      categoryId: 'highest_team_points',
      label: 'Highest Team Points',
      value: formatRecord(secondRecord),
      season: '2025',
      leagueId: 'league_afc',
      rank: 2,
    });
  });

  it('does not badge a category where the manager appears nowhere in the top 5', () => {
    const data: ComprehensiveHallOfFameData = {
      ...EMPTY_DATA,
      weeklyRecords: new Map([
        [
          'highest_team_points',
          [
            weeklyRecord({ teamId: 99, leagueId: 'league_other' }),
            weeklyRecord({ teamId: 98, leagueId: 'league_other' }),
          ],
        ],
      ]),
    };

    expect(findManagerHallOfFameBadges(data, MANAGER)).toEqual([]);
  });

  it('badges a streak the manager holds, using the correct roster/league pair', () => {
    const data: ComprehensiveHallOfFameData = {
      ...EMPTY_DATA,
      streaks: {
        winStreaks: [
          {
            rosterId: 2,
            teamName: 'Legion Champs',
            type: 'win',
            length: 8,
            startWeek: 1,
            endWeek: 8,
            season: '2026',
            leagueId: 'league_legion_i',
          },
        ],
        lossStreaks: [],
        hotStreaks: [],
        coldStreaks: [],
      },
    };

    const badges = findManagerHallOfFameBadges(data, MANAGER);

    expect(badges).toContainEqual({
      categoryId: 'streak-Longest Win Streak',
      label: 'Longest Win Streak',
      value: '8 weeks',
      season: '2026',
      leagueId: 'league_legion_i',
      rank: 1,
    });
  });

  it('badges a seasonal record the manager holds', () => {
    const data: ComprehensiveHallOfFameData = {
      ...EMPTY_DATA,
      seasonal: {
        ...EMPTY_DATA.seasonal,
        mostWins: [
          {
            rosterId: 5,
            teamName: 'Drake Maye Lover',
            leagueId: 'league_afc',
            leagueName: 'Gauntlet AFC',
            season: '2025',
            wins: 12,
            losses: 2,
            ties: 0,
            totalPoints: 1700,
            totalPointsAgainst: 1400,
            averagePoints: 121.4,
            expectedWins: 10,
            luckDelta: 2,
            totalDonuts: 0,
            totalBenchBlunders: 0,
            longestWinStreak: 6,
            longestLosingStreak: 1,
            currentStreak: 3,
            blowoutWins: 4,
            blowoutLosses: 0,
            closeGames: 2,
            scheduleStrength: 0.5,
            playoffAppearance: true,
            championshipWin: true,
            qbPoints: 300,
            rbPoints: 300,
            wrPoints: 400,
            tePoints: 200,
            defPoints: 100,
          },
        ],
      },
    };

    const badges = findManagerHallOfFameBadges(data, MANAGER);

    expect(badges).toContainEqual({
      categoryId: 'seasonal-Most Wins (Season)',
      label: 'Most Wins (Season)',
      value: '12 wins',
      season: '2025',
      leagueId: 'league_afc',
      rank: 1,
    });
  });

  it('sorts badges best-rank-first', () => {
    const data: ComprehensiveHallOfFameData = {
      ...EMPTY_DATA,
      weeklyRecords: new Map([
        [
          'highest_team_points',
          [
            weeklyRecord({ teamId: 99, leagueId: 'league_other' }), // #1: not our manager
            weeklyRecord({ teamId: 5, leagueId: 'league_afc' }), // #2: our manager
          ],
        ],
      ]),
      streaks: {
        winStreaks: [
          {
            rosterId: 2,
            teamName: 'Legion Champs',
            type: 'win',
            length: 8,
            startWeek: 1,
            endWeek: 8,
            season: '2026',
            leagueId: 'league_legion_i',
          },
        ],
        lossStreaks: [],
        hotStreaks: [],
        coldStreaks: [],
      },
    };

    const badges = findManagerHallOfFameBadges(data, MANAGER);

    expect(badges.map(b => b.rank)).toEqual([1, 2]);
  });
});
