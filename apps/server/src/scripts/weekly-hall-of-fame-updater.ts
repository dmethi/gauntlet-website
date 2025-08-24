/**
 * Weekly Hall of Fame Updater
 * Incrementally updates Hall of Fame records by processing only the current week
 *
 * Strategy:
 * 1. Fetch current week data from Sleeper API (minimal data, not stored)
 * 2. Calculate Hall of Fame stats for current week only
 * 3. Compare against existing Hall of Fame records
 * 4. Update rankings if new records break into top/bottom 5
 */

import { PrismaClient } from '@prisma/client';
import { HallOfFameCalculatorFixed } from '../lib/hall-of-fame-calculator-fixed.js';

const prisma = new PrismaClient();

interface WeeklyUpdateOptions {
  leagueId: string;
  week?: number;
  season?: string;
  dryRun?: boolean;
}

interface HallOfFameRanking {
  categoryId: string;
  categoryName: string;
  statType: 'high' | 'low' | 'both';
  currentRecords: Array<{
    id: string;
    value: number;
    rank: number;
    recordType: 'top' | 'bottom';
  }>;
}

class WeeklyHallOfFameUpdater {
  private calculator: HallOfFameCalculatorFixed;

  constructor() {
    this.calculator = new HallOfFameCalculatorFixed();
  }

  /**
   * Update Hall of Fame records for the current week
   */
  async updateWeeklyRecords(options: WeeklyUpdateOptions) {
    const { leagueId, season = '2024', dryRun = false } = options;

    // Determine current week if not provided
    const currentWeek = options.week || (await this.getCurrentNFLWeek());

    console.log(`🔄 Weekly Hall of Fame Update`);
    console.log(`📅 League: ${leagueId}, Week: ${currentWeek}, Season: ${season}`);
    console.log(`🧪 Dry Run: ${dryRun ? 'YES' : 'NO'}`);

    try {
      // Step 1: Get current Hall of Fame rankings for this league
      const currentRankings = await this.getCurrentRankings(leagueId, season);
      console.log(`📊 Found ${currentRankings.length} categories to check`);

      // Step 2: Calculate Hall of Fame stats for current week only
      const weeklyStats = await this.calculator.calculateWeeklyStats(leagueId, currentWeek, season);
      console.log(`✅ Calculated ${weeklyStats.length} new stat instances for week ${currentWeek}`);

      if (weeklyStats.length === 0) {
        console.log(`⚠️  No new stats calculated - maybe data not available yet?`);
        return;
      }

      // Step 3: Check which stats would qualify for Hall of Fame
      const updates = await this.determineRankingUpdates(currentRankings, weeklyStats);
      console.log(
        `🎯 Found ${updates.newRecords} potential new records, ${updates.rankingChanges} ranking changes`
      );

      if (updates.newRecords === 0 && updates.rankingChanges === 0) {
        console.log(`✨ No updates needed - existing records remain intact`);
        return;
      }

      // Step 4: Apply updates (if not dry run)
      if (!dryRun) {
        await this.applyRankingUpdates(updates, leagueId);
        console.log(`🎉 Successfully applied all Hall of Fame updates!`);
      } else {
        console.log(`🧪 Dry run complete - no changes applied`);
        this.logUpdatePreview(updates);
      }
    } catch (error) {
      console.error(`❌ Error during weekly Hall of Fame update:`, error);
      throw error;
    }
  }

  /**
   * Get current Hall of Fame rankings for all categories
   */
  private async getCurrentRankings(leagueId: string, season: string): Promise<HallOfFameRanking[]> {
    const categories = await prisma.hallOfFameCategory.findMany({
      include: {
        records: {
          where: {
            leagueId,
            season,
          },
          orderBy: [
            { recordType: 'asc' }, // top first, then bottom
            { rank: 'asc' }, // rank 1, 2, 3...
          ],
        },
      },
    });

    return categories.map(category => ({
      categoryId: category.id,
      categoryName: category.name,
      statType: category.statType as 'high' | 'low' | 'both',
      currentRecords: category.records.map(record => ({
        id: record.id,
        value: record.value,
        rank: record.rank,
        recordType: record.recordType as 'top' | 'bottom',
      })),
    }));
  }

  /**
   * Determine which rankings need updates based on new weekly stats
   */
  private async determineRankingUpdates(currentRankings: HallOfFameRanking[], weeklyStats: any[]) {
    let newRecords = 0;
    let rankingChanges = 0;
    const updates: any[] = [];

    // Group weekly stats by category
    const statsByCategory = weeklyStats.reduce(
      (groups, stat) => {
        if (!groups[stat.categoryName]) {
          groups[stat.categoryName] = [];
        }
        groups[stat.categoryName].push(stat);
        return groups;
      },
      {} as Record<string, any[]>
    );

    // Check each category for potential updates
    for (const ranking of currentRankings) {
      const categoryStats = statsByCategory[ranking.categoryName] || [];
      if (categoryStats.length === 0) continue;

      const categoryUpdates = this.checkCategoryForUpdates(ranking, categoryStats);
      if (categoryUpdates.hasChanges) {
        updates.push({
          categoryId: ranking.categoryId,
          categoryName: ranking.categoryName,
          ...categoryUpdates,
        });

        newRecords += categoryUpdates.newRecordsCount || 0;
        rankingChanges += categoryUpdates.rankingChangesCount || 0;
      }
    }

    return {
      newRecords,
      rankingChanges,
      updates,
    };
  }

  /**
   * Check if a category needs ranking updates
   */
  private checkCategoryForUpdates(ranking: HallOfFameRanking, newStats: any[]) {
    const updates: any = {
      hasChanges: false,
      newRecordsCount: 0,
      rankingChangesCount: 0,
      actions: [],
    };

    // Check top records (highest values)
    if (ranking.statType === 'high' || ranking.statType === 'both') {
      const topRecords = ranking.currentRecords.filter(r => r.recordType === 'top');
      const worstTopValue =
        topRecords.length > 0 ? Math.min(...topRecords.map(r => r.value)) : -Infinity;

      for (const stat of newStats) {
        if (stat.value > worstTopValue || topRecords.length < 5) {
          updates.hasChanges = true;
          updates.newRecordsCount++;
          updates.actions.push({
            type: 'add_top_record',
            stat,
            displaces: topRecords.length >= 5 ? worstTopValue : null,
          });
        }
      }
    }

    // Check bottom records (lowest values)
    if (ranking.statType === 'low' || ranking.statType === 'both') {
      const bottomRecords = ranking.currentRecords.filter(r => r.recordType === 'bottom');
      const worstBottomValue =
        bottomRecords.length > 0 ? Math.max(...bottomRecords.map(r => r.value)) : Infinity;

      for (const stat of newStats) {
        if (stat.value < worstBottomValue || bottomRecords.length < 5) {
          updates.hasChanges = true;
          updates.newRecordsCount++;
          updates.actions.push({
            type: 'add_bottom_record',
            stat,
            displaces: bottomRecords.length >= 5 ? worstBottomValue : null,
          });
        }
      }
    }

    return updates;
  }

  /**
   * Apply the determined ranking updates
   */
  private async applyRankingUpdates(updates: any, leagueId: string) {
    console.log(`💾 Applying ${updates.updates.length} category updates...`);

    for (const categoryUpdate of updates.updates) {
      console.log(`  📊 Updating category: ${categoryUpdate.categoryName}`);

      for (const action of categoryUpdate.actions) {
        if (action.type === 'add_top_record') {
          // Remove worst record FIRST if we're displacing
          if (action.displaces !== null) {
            await this.removeWorstRecord(categoryUpdate.categoryId, 'top');
          }
          await this.addHallOfFameRecord(categoryUpdate.categoryId, action.stat, 'top', leagueId);
        } else if (action.type === 'add_bottom_record') {
          // Remove worst record FIRST if we're displacing
          if (action.displaces !== null) {
            await this.removeWorstRecord(categoryUpdate.categoryId, 'bottom');
          }
          await this.addHallOfFameRecord(
            categoryUpdate.categoryId,
            action.stat,
            'bottom',
            leagueId
          );
        }
      }

      // Re-rank all records for this category
      await this.reRankCategoryRecords(categoryUpdate.categoryId);
    }
  }

  /**
   * Add a new Hall of Fame record
   */
  private async addHallOfFameRecord(
    categoryId: string,
    stat: any,
    recordType: 'top' | 'bottom',
    leagueId: string
  ) {
    // Generate unique temporary rank within 32-bit integer range to avoid conflicts
    const uniqueRank = 1000000 + Math.floor(Math.random() * 1000);

    await prisma.hallOfFameRecord.create({
      data: {
        categoryId,
        leagueId,
        rosterId: stat.rosterId,
        week: stat.week,
        season: stat.season,
        value: stat.value,
        recordType,
        rank: uniqueRank, // Unique temporary rank - will be re-ranked later
        contextData: stat.contextData,
        isAllTime: false,
        achievedAt: stat.achievedAt || new Date(),
      },
    });
  }

  /**
   * Remove the worst record of a given type when we exceed 5 records
   */
  private async removeWorstRecord(categoryId: string, recordType: 'top' | 'bottom') {
    const sortOrder = recordType === 'top' ? 'asc' : 'desc'; // worst top = lowest value, worst bottom = highest value

    const worstRecord = await prisma.hallOfFameRecord.findFirst({
      where: {
        categoryId,
        recordType,
      },
      orderBy: {
        value: sortOrder,
      },
    });

    if (worstRecord) {
      await prisma.hallOfFameRecord.delete({
        where: { id: worstRecord.id },
      });
    }
  }

  /**
   * Re-rank all records for a category after updates
   */
  private async reRankCategoryRecords(categoryId: string) {
    // Use transaction to avoid constraint violations during re-ranking
    await prisma.$transaction(async tx => {
      // Step 1: Get all records and assign unique temporary ranks
      const allRecords = await tx.hallOfFameRecord.findMany({
        where: { categoryId },
      });

      // Assign unique temporary ranks to avoid conflicts (within 32-bit range)
      const baseRank = 2000000;
      for (let i = 0; i < allRecords.length; i++) {
        await tx.hallOfFameRecord.update({
          where: { id: allRecords[i].id },
          data: { rank: baseRank + i },
        });
      }

      // Step 2: Rank top records (highest to lowest)
      const topRecords = await tx.hallOfFameRecord.findMany({
        where: {
          categoryId,
          recordType: 'top',
        },
        orderBy: {
          value: 'desc',
        },
      });

      for (let i = 0; i < topRecords.length; i++) {
        await tx.hallOfFameRecord.update({
          where: { id: topRecords[i].id },
          data: { rank: i + 1 },
        });
      }

      // Step 3: Rank bottom records (lowest to highest)
      const bottomRecords = await tx.hallOfFameRecord.findMany({
        where: {
          categoryId,
          recordType: 'bottom',
        },
        orderBy: {
          value: 'asc',
        },
      });

      for (let i = 0; i < bottomRecords.length; i++) {
        await tx.hallOfFameRecord.update({
          where: { id: bottomRecords[i].id },
          data: { rank: i + 1 },
        });
      }
    });
  }

  /**
   * Get current NFL week (placeholder - would need real NFL schedule logic)
   */
  private async getCurrentNFLWeek(): Promise<number> {
    // Placeholder: In production, this would calculate the current NFL week based on:
    // - Current date
    // - NFL schedule
    // - Season start date
    // For now, return a reasonable default
    return 1;
  }

  /**
   * Log preview of what would be updated in dry run mode
   */
  private logUpdatePreview(updates: any) {
    console.log(`\n📋 Update Preview:`);
    console.log(`====================`);

    for (const categoryUpdate of updates.updates) {
      console.log(`\n📊 ${categoryUpdate.categoryName}:`);

      for (const action of categoryUpdate.actions) {
        const stat = action.stat;
        const recordType = action.type === 'add_top_record' ? 'Hall of Fame' : 'Hall of Shame';
        console.log(
          `  ➕ NEW ${recordType}: ${stat.value} (Week ${stat.week}, Roster ${stat.rosterId})`
        );

        if (action.displaces !== null) {
          console.log(`     └─ Would displace: ${action.displaces}`);
        }
      }
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const updater = new WeeklyHallOfFameUpdater();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const leagueId = args[0] || '997670420490801152';
  const week = args[1] ? parseInt(args[1]) : undefined;
  const season = args[2] || '2023';
  const dryRun = args.includes('--dry-run');

  try {
    await updater.updateWeeklyRecords({
      leagueId,
      week,
      season,
      dryRun,
    });

    console.log(`\n🎉 Weekly Hall of Fame update complete!`);
  } catch (error) {
    console.error(`❌ Weekly update failed:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { WeeklyHallOfFameUpdater };
