/**
 * Populate Hall of Fame Fields Script
 * Computes and populates the new Hall of Fame fields in RosterWeekAggregate
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface StarterData {
  playerId: string;
  position: string;
  points: number;
}

class HallOfFameFieldsPopulator {
  async populateAllFields() {
    console.log('🔄 Populating Hall of Fame fields for all RosterWeekAggregate records...');

    // Get all RosterWeekAggregate records that need updating
    const aggregates = await prisma.rosterWeekAggregate.findMany({
      where: {
        OR: [
          { donutCount: null },
          { starConcentrationIndex: null },
          { boomCount: null },
          { bustCount: null },
        ],
      },
      include: {
        roster: {
          include: {
            league: true,
          },
        },
      },
    });

    console.log(`📊 Found ${aggregates.length} records to update`);

    for (const aggregate of aggregates) {
      try {
        console.log(`  🔄 Processing roster ${aggregate.rosterId}, week ${aggregate.week}...`);

        // Get matchup data for this roster/week to find lineup
        const matchup = await prisma.matchup.findFirst({
          where: {
            leagueId: aggregate.leagueId,
            rosterId: aggregate.rosterId,
            week: aggregate.week,
          },
        });

        if (!matchup || !matchup.starters) {
          console.log(`    ⚠️  No matchup/starters data found, skipping`);
          continue;
        }

        // Parse starters data
        const starters = matchup.starters as string[];

        // Get player stats for this week (simplified without position data for now)
        const playerStats = await prisma.playerStats.findMany({
          where: {
            playerId: { in: starters },
            season: aggregate.roster.league.season,
            week: aggregate.week,
          },
        });

        // Create starter data array (without position filtering for now)
        const starterData: StarterData[] = starters.map(playerId => {
          const stat = playerStats.find(s => s.playerId === playerId);
          // Fantasy points are stored in stats.pts_ppr (or pts_std/pts_half_ppr)
          const points = stat?.stats
            ? (stat.stats as any).pts_ppr || (stat.stats as any).pts_std || 0
            : 0;
          return {
            playerId,
            position: 'UNKNOWN', // We'll skip position-based calculations for now
            points,
          };
        });

        // Calculate Hall of Fame fields
        const donutCount = this.calculateDonutCount(starterData);
        const starConcentrationIndex = this.calculateStarConcentrationIndex(starterData);

        // For boom/bust counts, we'd need positional baselines which are complex
        // For now, we'll set them to 0 and implement proper calculation later
        const boomCount = 0; // TODO: Implement with positional baselines
        const bustCount = 0; // TODO: Implement with positional baselines

        // Update the record
        await prisma.rosterWeekAggregate.update({
          where: { id: aggregate.id },
          data: {
            donutCount,
            starConcentrationIndex,
            boomCount,
            bustCount,
          },
        });

        console.log(
          `    ✅ Updated: donuts=${donutCount}, concentration=${starConcentrationIndex?.toFixed(1)}%`
        );
      } catch (error) {
        console.error(`    ❌ Error processing ${aggregate.id}:`, error);
        continue;
      }
    }

    console.log('🎉 Hall of Fame fields population complete!');
  }

  private calculateDonutCount(starters: StarterData[]): number {
    return starters.filter(s => s.points === 0).length;
  }

  private calculateStarConcentrationIndex(starters: StarterData[]): number {
    if (starters.length === 0) return 0;

    // Sort by points descending
    const sorted = [...starters].sort((a, b) => b.points - a.points);

    // Get total points
    const totalPoints = sorted.reduce((sum, s) => sum + s.points, 0);

    if (totalPoints === 0) return 0;

    // Calculate percentage from top 2 players
    const topTwoPoints = sorted.slice(0, 2).reduce((sum, s) => sum + s.points, 0);

    return (topTwoPoints / totalPoints) * 100;
  }

  async generateSummaryReport() {
    const aggregates = await prisma.rosterWeekAggregate.findMany({
      select: {
        donutCount: true,
        starConcentrationIndex: true,
        boomCount: true,
        bustCount: true,
      },
    });

    const validRecords = aggregates.filter(
      a =>
        a.donutCount !== null ||
        a.starConcentrationIndex !== null ||
        a.boomCount !== null ||
        a.bustCount !== null
    );

    console.log('\n📋 Hall of Fame Fields Population Summary');
    console.log('==================================================');
    console.log(`Total records processed: ${validRecords.length}`);

    if (validRecords.length > 0) {
      const avgConcentration =
        validRecords
          .filter(r => r.starConcentrationIndex !== null)
          .reduce((sum, r) => sum + (r.starConcentrationIndex || 0), 0) / validRecords.length;

      const maxDonuts = Math.max(...validRecords.map(r => r.donutCount || 0));

      console.log(`Average star concentration: ${avgConcentration.toFixed(1)}%`);
      console.log(`Maximum donuts in a week: ${maxDonuts}`);
    }
  }
}

async function main() {
  const populator = new HallOfFameFieldsPopulator();

  try {
    await populator.populateAllFields();
    await populator.generateSummaryReport();
  } catch (error) {
    console.error('❌ Error populating Hall of Fame fields:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
