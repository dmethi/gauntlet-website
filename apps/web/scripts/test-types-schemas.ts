import { validateReport, validateSection } from '../src/lib/reports/recap/schemas';
import type { WeeklyRecapReport, LeagueOverviewSection } from '../src/lib/reports/recap/types';

/**
 * Tests type definitions and validation schemas.
 * Usage: tsx apps/web/scripts/test-types-schemas.ts
 */
const testTypesAndSchemas = async () => {
  console.log('🚀 Testing Types & Schemas\n');

  try {
    // Test 1: Valid league overview section
    console.log('Test 1: Validating valid league overview...');
    const validOverview: LeagueOverviewSection = {
      narrative:
        'Week 5 brought exciting matchups and surprising upsets. The league saw 12 competitive games with an average score of 153.5 points.',
      stats: {
        totalGames: 12,
        totalPoints: 1842.0,
        averageScore: 153.5,
        highestScore: 187.3,
        lowestScore: 98.2,
        blowouts: 2,
        closeGames: 5,
      },
      generatedAt: new Date().toISOString(),
    };

    const overviewResult = validateSection('leagueOverview', validOverview);
    if (!overviewResult.success) {
      throw new Error(`Validation failed: ${JSON.stringify(overviewResult.errors)}`);
    }
    console.log('✅ Valid league overview passed\n');

    // Test 2: Invalid league overview (missing required field)
    console.log('Test 2: Testing invalid data rejection...');
    const invalidOverview = {
      narrative: 'Too short',
      // Missing stats
      generatedAt: new Date().toISOString(),
    };

    const invalidResult = validateSection('leagueOverview', invalidOverview);
    if (invalidResult.success) {
      throw new Error('Should have failed validation');
    }
    console.log('✅ Invalid data rejected correctly\n');
    console.log('Errors:', invalidResult.errors?.slice(0, 2), '\n');

    // Test 3: Mock complete report validation
    console.log('Test 3: Validating report structure...');
    const mockReport: WeeklyRecapReport = {
      metadata: {
        week: 5,
        season: 2025,
        generatedAt: new Date().toISOString(),
        generationTime: 45000,
        tokensUsed: 50000,
        version: '1.0.0',
        status: 'success',
      },
      sections: {
        leagueOverview: validOverview,
        matchupNarratives: Array(12).fill({
          matchupId: 'afc-5-1',
          narrative:
            'This was an exciting matchup between two evenly matched teams. Team A edged out Team B with a final score of 156.7 to 143.2. The game remained close throughout, with multiple lead changes in the fourth quarter.',
          boxScore: {
            team1: {
              teamName: 'Team A',
              rosterId: 1,
              leagueId: 'afc',
              score: 156.7,
              record: '4-1',
              topPerformers: [{ playerName: 'Patrick Mahomes', position: 'QB', points: 28.5 }],
            },
            team2: {
              teamName: 'Team B',
              rosterId: 2,
              leagueId: 'afc',
              score: 143.2,
              record: '3-2',
              topPerformers: [{ playerName: 'Josh Allen', position: 'QB', points: 26.3 }],
            },
            finalScore: { team1: 156.7, team2: 143.2 },
            winner: 'team1' as const,
            margin: 13.5,
          },
          generatedAt: new Date().toISOString(),
        }),
        hallOfFame: {
          narrative:
            'This week saw some incredible performances that will be remembered for years to come. The top scorers showed up when it mattered most, delivering fantasy owners the wins they desperately needed. From dominant quarterback play to explosive running backs, this week had it all. Several players exceeded expectations and proved why they were drafted as early as they were.',
          highlights: {
            topTeamScore: { teamName: 'Team X', score: 187.3, leagueId: 'afc', rosterId: 5 },
            biggestBlowout: {
              winner: 'Team Y',
              loser: 'Team Z',
              margin: 45.2,
              matchupId: 'afc-5-3',
            },
            topPerformers: {
              QB: [
                {
                  playerName: 'Patrick Mahomes',
                  playerId: '4046',
                  position: 'QB',
                  team: 'KC',
                  points: 32.5,
                },
              ],
              RB: [],
              WR: [],
              TE: [],
              K: [],
              DEF: [],
            },
          },
          generatedAt: new Date().toISOString(),
        },
        hallOfShame: {
          narrative:
            'Some disappointing performances this week left fantasy owners frustrated and scrambling for answers. Key players underperformed their projections significantly, leading to unexpected losses and crushed playoff hopes. High draft picks failed to deliver, and several teams saw their championship aspirations take a serious hit. The struggle was real across multiple positions this week.',
          lowlights: {
            lowestTeamScore: { teamName: 'Team W', score: 98.2, leagueId: 'nfc', rosterId: 8 },
            biggestBusts: [],
            badBeatLosses: [],
          },
          generatedAt: new Date().toISOString(),
        },
        powerRankings: {
          narrative:
            'Power rankings saw some significant movement this week as teams jockey for playoff position. The top teams maintained their dominance while middle-tier teams fought for separation.',
          rankings: [
            { rank: 1, teamName: 'Team A', record: '5-0', points: 800, movement: 'same' as const },
          ],
          generatedAt: new Date().toISOString(),
        },
        standings: {
          narrative: 'Current standings show a competitive race in both conferences...',
          standings: {
            afc: [
              {
                rank: 1,
                teamName: 'Team A',
                record: '5-0',
                pointsFor: 800,
                pointsAgainst: 650,
                streak: 'W5',
              },
            ],
            nfc: [
              {
                rank: 1,
                teamName: 'Team B',
                record: '4-1',
                pointsFor: 750,
                pointsAgainst: 680,
                streak: 'W2',
              },
            ],
          },
          playoffPicture: { clinched: [], inHunt: ['Team A', 'Team B'], eliminated: [] },
          generatedAt: new Date().toISOString(),
        },
        upcoming: {
          narrative:
            'Next week features several marquee matchups that could shake up the standings...',
          matchups: [{ team1: 'Team A', team2: 'Team B', storyline: 'Battle for first place' }],
          generatedAt: new Date().toISOString(),
        },
        closing: {
          narrative:
            'Looking ahead to next week, the playoff picture is starting to take shape. Teams at the top need to maintain their momentum while those on the bubble face must-win situations.',
          generatedAt: new Date().toISOString(),
        },
      },
    };

    const reportResult = validateReport(mockReport);
    if (!reportResult.success) {
      console.log('Validation errors:', reportResult.errors);
      throw new Error('Report validation failed');
    }
    console.log('✅ Complete report structure validated\n');

    console.log('🎉 All type and schema tests passed!');
  } catch (error) {
    console.error('❌ Type/schema test failed:', error);
    process.exit(1);
  }
};

testTypesAndSchemas();
