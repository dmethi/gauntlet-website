import { PrismaClient } from '../generated/prisma';
import type { Matchup as PrismaMatchup } from '../generated/prisma';

const prisma = new PrismaClient();

type Matchup = PrismaMatchup & {
  roster: {
    id: number;
  };
};

interface WeeklyStats {
  totalPoints: number;
  opponentPoints: number;
  expectedWins: number;
  luckRating: number;
}

async function calculateWeeklyMetrics(leagueId: string, week: number): Promise<void> {
  // Get all matchups for the week
  const matchups = await prisma.matchup.findMany({
    where: { leagueId, week },
    include: {
      roster: true,
    },
  });

  // Group matchups by matchupId to pair opponents
  const matchupPairs = matchups.reduce((acc: Record<number, Matchup[]>, matchup: Matchup) => {
    if (!matchup.matchupId) return acc;
    if (!acc[matchup.matchupId]) {
      acc[matchup.matchupId] = [];
    }
    acc[matchup.matchupId].push(matchup);
    return acc;
  }, {});

  // Calculate median points for the week
  const weekPoints = matchups.map((m: Matchup) => m.points);
  const medianPoints = calculateMedian(weekPoints);

  // Calculate metrics for each roster
  for (const matchup of matchups) {
    const opponents =
      matchupPairs[matchup.matchupId || 0]?.filter(
        (m: Matchup) => m.rosterId !== matchup.rosterId
      ) || [];
    const opponentPoints = opponents.length > 0 ? opponents[0].points : 0;

    // Calculate expected wins (probability of beating median score)
    const expectedWins = matchup.points > medianPoints ? 1 : 0;

    // Calculate luck rating (difference between actual and expected outcome)
    const actualWin = matchup.points > opponentPoints ? 1 : 0;
    const luckRating = actualWin - expectedWins;

    // Store metrics
    await prisma.weeklyMetrics.upsert({
      where: {
        leagueId_rosterId_week: {
          leagueId,
          rosterId: matchup.rosterId,
          week,
        },
      },
      update: {
        totalPoints: matchup.points,
        opponentPoints,
        expectedWins,
        luckRating,
      },
      create: {
        leagueId,
        rosterId: matchup.rosterId,
        week,
        totalPoints: matchup.points,
        opponentPoints,
        expectedWins,
        luckRating,
      },
    });
  }
}

function calculateMedian(numbers: number[]): number {
  const sorted = numbers.sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

async function calculateAllMetrics(leagueId: string) {
  // Get all weeks with matchups
  const weeks = await prisma.matchup.findMany({
    where: { leagueId },
    select: { week: true },
    distinct: ['week'],
    orderBy: { week: 'asc' },
  });

  // Calculate metrics for each week
  for (const { week } of weeks) {
    console.log(`Calculating metrics for week ${week}`);
    await calculateWeeklyMetrics(leagueId, week);
  }
}

// Run the script
async function main() {
  try {
    const leagues = await prisma.league.findMany();
    for (const league of leagues) {
      console.log(`Processing league ${league.name} (${league.id})`);
      await calculateAllMetrics(league.id);
    }
  } catch (error) {
    console.error('Error calculating metrics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
