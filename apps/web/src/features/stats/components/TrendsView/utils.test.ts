import { describe, expect, it } from 'vitest';
import type { PositionData, TeamData, TeamInfo } from '@/features/stats/types';
import type { TrackedPosition } from '@/shared/utils/stats/types';
import { buildPositionRidgePlot, buildTeamRidgePlot } from './utils';

const createTeamInfo = (teamName: string, leagueName = 'Premier League'): TeamInfo => ({
  teamName,
  leagueName,
});

describe('TrendsView ridge plot utilities', () => {
  it('buildTeamRidgePlot transforms scores into ridge chart data', () => {
    const entries: [string, TeamData][] = [
      [
        'team-1',
        {
          teamInfo: createTeamInfo('Alpha', 'League A'),
          teamScores: [
            { week: 1, value: 120 },
            { week: 2, value: 135 },
            { week: 3, value: 128 },
          ],
          opponentScores: [
            { week: 1, value: 110 },
            { week: 2, value: 140 },
            { week: 3, value: 118 },
          ],
        },
      ],
      [
        'team-2',
        {
          teamInfo: createTeamInfo('Bravo', 'League B'),
          teamScores: [
            { week: 1, value: 102 },
            { week: 2, value: 111 },
            { week: 3, value: 118 },
          ],
          opponentScores: [
            { week: 1, value: 95 },
            { week: 2, value: 120 },
            { week: 3, value: 110 },
          ],
        },
      ],
    ];

    const { chartData, domain } = buildTeamRidgePlot(entries);

    expect(chartData).toHaveLength(2);
    expect(chartData[0]).toHaveProperty('densityPairs');
    expect(chartData[0].densityPairs.length).toBeGreaterThan(0);
    expect(domain[0]).toBeLessThan(domain[1]);
  });

  it('buildPositionRidgePlot builds positional ridge data', () => {
    const positionsMap = new Map<TrackedPosition, PositionData>([
      [
        'QB',
        {
          teams: [
            [
              'team-1',
              {
                teamInfo: createTeamInfo('Alpha', 'League A'),
                scores: [
                  { week: 1, value: 24 },
                  { week: 2, value: 28 },
                  { week: 3, value: 26 },
                ],
              },
            ],
            [
              'team-2',
              {
                teamInfo: createTeamInfo('Bravo', 'League B'),
                scores: [
                  { week: 1, value: 19 },
                  { week: 2, value: 22 },
                  { week: 3, value: 25 },
                ],
              },
            ],
          ],
        },
      ],
    ]);

    const entries: [string, TeamData][] = [
      [
        'team-1',
        {
          teamInfo: createTeamInfo('Alpha', 'League A'),
          teamScores: [
            { week: 1, value: 120 },
            { week: 2, value: 135 },
          ],
          opponentScores: [
            { week: 1, value: 110 },
            { week: 2, value: 132 },
          ],
        },
      ],
      [
        'team-2',
        {
          teamInfo: createTeamInfo('Bravo', 'League B'),
          teamScores: [
            { week: 1, value: 118 },
            { week: 2, value: 106 },
          ],
          opponentScores: [
            { week: 1, value: 101 },
            { week: 2, value: 112 },
          ],
        },
      ],
    ];

    const { chartData, domain } = buildPositionRidgePlot('QB', entries, positionsMap);

    expect(chartData).toHaveLength(2);
    expect(chartData[0].densityPairs.length).toBeGreaterThan(0);
    expect(domain[0]).toBeLessThan(domain[1]);
  });
});
