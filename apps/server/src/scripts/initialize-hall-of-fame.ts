/**
 * Hall of Fame Foundation Script
 * Calculates and populates initial Hall of Fame records from existing seeded data
 * This script will analyze all historical weeks and establish top 5/bottom 5 records
 */

import { PrismaClient } from '@prisma/client';
import {
  getHallOfFameCalculator,
  HallOfFameCalculationResult,
} from '../lib/hall-of-fame-calculator.js';

const prisma = new PrismaClient();
const calculator = getHallOfFameCalculator();

interface HallOfFameRankings {
  categoryName: string;
  categoryId: string;
  leagueId: string;
  season: string;
  topRecords: HallOfFameCalculationResult[];
  bottomRecords: HallOfFameCalculationResult[];
}

export class HallOfFameInitializer {
  /**
   * Initialize Hall of Fame records for all seeded leagues
   */
  async initializeAllLeagues() {
    console.log('🏆 Initializing Hall of Fame records from seeded data...');

    // Get all leagues with data
    const leagues = await prisma.league.findMany({
      where: {
        matchups: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        season: true,
      },
    });

    if (leagues.length === 0) {
      console.log('❌ No leagues with matchup data found');
      return;
    }

    console.log(`📊 Found ${leagues.length} leagues with data`);

    for (const league of leagues) {
      await this.initializeLeague(league.id, league.season);
    }

    console.log('🎉 Hall of Fame initialization complete!');
  }

  /**
   * Initialize Hall of Fame records for a specific league
   */
  async initializeLeague(leagueId: string, season: string) {
    console.log(`\n🔍 Processing league ${leagueId} (${season})`);

    // Clear existing records for this league
    await prisma.hallOfFameRecord.deleteMany({
      where: { leagueId, season },
    });

    // Get all weeks with data
    const weeks = await this.getWeeksWithData(leagueId);
    if (weeks.length === 0) {
      console.log(`⚠️  No weeks with data found for league ${leagueId}`);
      return;
    }

    console.log(`📅 Processing ${weeks.length} weeks: ${weeks.join(', ')}`);

    // Calculate all stats across all weeks
    const allCalculations: HallOfFameCalculationResult[] = [];

    for (const week of weeks) {
      console.log(`  📈 Calculating stats for week ${week}...`);
      const weekCalculations = await calculator.calculateWeeklyStats(leagueId, week, season);
      allCalculations.push(...weekCalculations);
    }

    console.log(`✅ Calculated ${allCalculations.length} total stat instances`);

    // Generate rankings for each category
    const rankings = await this.generateRankings(allCalculations, leagueId, season);

    // Store Hall of Fame records
    await this.storeHallOfFameRecords(rankings);

    console.log(`🏆 Created Hall of Fame records for league ${leagueId}`);
  }

  /**
   * Get all weeks that have matchup data for a league
   */
  private async getWeeksWithData(leagueId: string): Promise<number[]> {
    const result = await prisma.matchup.findMany({
      where: { leagueId },
      select: { week: true },
      distinct: ['week'],
      orderBy: { week: 'asc' },
    });

    return result.map(r => r.week);
  }

  /**
   * Generate top 5/bottom 5 rankings for each category
   */
  private async generateRankings(
    calculations: HallOfFameCalculationResult[],
    leagueId: string,
    season: string
  ): Promise<HallOfFameRankings[]> {
    // Get all categories
    const categories = await prisma.hallOfFameCategory.findMany({
      where: { isActive: true },
      orderBy: [{ groupName: 'asc' }, { sortOrder: 'asc' }],
    });

    const rankings: HallOfFameRankings[] = [];

    for (const category of categories) {
      // Filter calculations for this category
      const categoryCalculations = calculations.filter(calc => calc.categoryName === category.name);

      if (categoryCalculations.length === 0) {
        console.log(`⚠️  No calculations found for category: ${category.name}`);
        continue;
      }

      // Sort calculations based on stat type
      let sortedCalculations = [...categoryCalculations];

      if (category.statType === 'high' || category.statType === 'both') {
        sortedCalculations.sort((a, b) => b.value - a.value);
      } else {
        sortedCalculations.sort((a, b) => a.value - b.value);
      }

      // Get top 5 and bottom 5
      const topRecords =
        category.statType === 'low'
          ? sortedCalculations.slice(0, 5)
          : sortedCalculations.slice(0, 5);

      const bottomRecords =
        category.statType === 'high'
          ? sortedCalculations.slice(-5).reverse()
          : sortedCalculations.slice(-5).reverse();

      rankings.push({
        categoryName: category.name,
        categoryId: category.id,
        leagueId,
        season,
        topRecords: category.statType === 'low' ? bottomRecords : topRecords,
        bottomRecords: category.statType === 'high' ? bottomRecords : topRecords,
      });

      console.log(
        `  📊 ${category.displayName}: ${categoryCalculations.length} instances -> top 5 range: ${topRecords[0]?.value.toFixed(2)} to ${topRecords[4]?.value.toFixed(2)}`
      );
    }

    return rankings;
  }

  /**
   * Store Hall of Fame records in the database
   */
  private async storeHallOfFameRecords(rankings: HallOfFameRankings[]) {
    console.log('\n💾 Storing Hall of Fame records...');

    for (const ranking of rankings) {
      // Store top records
      for (let i = 0; i < ranking.topRecords.length; i++) {
        const record = ranking.topRecords[i];
        await prisma.hallOfFameRecord.create({
          data: {
            categoryId: ranking.categoryId,
            leagueId: ranking.leagueId,
            rosterId: record.rosterId,
            week: record.week,
            season: ranking.season,
            value: record.value,
            recordType: 'top',
            rank: i + 1,
            contextData: record.contextData,
            isAllTime: false,
            achievedAt: record.achievedAt,
          },
        });
      }

      // Store bottom records
      for (let i = 0; i < ranking.bottomRecords.length; i++) {
        const record = ranking.bottomRecords[i];
        await prisma.hallOfFameRecord.create({
          data: {
            categoryId: ranking.categoryId,
            leagueId: ranking.leagueId,
            rosterId: record.rosterId,
            week: record.week,
            season: ranking.season,
            value: record.value,
            recordType: 'bottom',
            rank: i + 1,
            contextData: record.contextData,
            isAllTime: false,
            achievedAt: record.achievedAt,
          },
        });
      }
    }

    console.log(`✅ Stored records for ${rankings.length} categories`);
  }

  /**
   * Generate summary report of Hall of Fame records
   */
  async generateSummaryReport(leagueId?: string) {
    console.log('\n📋 Hall of Fame Summary Report');
    console.log('='.repeat(50));

    const whereClause = leagueId ? { leagueId } : {};

    // Get record counts by category
    const categoryStats = await prisma.hallOfFameRecord.groupBy({
      by: ['categoryId'],
      where: whereClause,
      _count: { id: true },
    });

    // Get category names
    const categories = await prisma.hallOfFameCategory.findMany({
      where: { id: { in: categoryStats.map(stat => stat.categoryId) } },
      select: { id: true, displayName: true, groupName: true },
    });

    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

    // Group by category group
    const groupStats: Record<string, { categories: number; records: number }> = {};

    categoryStats.forEach(stat => {
      const category = categoryMap.get(stat.categoryId);
      if (category) {
        const group = category.groupName;
        if (!groupStats[group]) groupStats[group] = { categories: 0, records: 0 };
        groupStats[group].categories++;
        groupStats[group].records += stat._count.id;
      }
    });

    Object.entries(groupStats).forEach(([group, stats]) => {
      console.log(`${group}: ${stats.categories} categories, ${stats.records} records`);
    });

    const totalRecords = categoryStats.reduce((sum, stat) => sum + stat._count.id, 0);
    console.log(`\n🎯 Total: ${categoryStats.length} categories, ${totalRecords} records`);

    // Show top performers
    const topPerformers = await prisma.hallOfFameRecord.groupBy({
      by: ['rosterId'],
      where: { ...whereClause, recordType: 'top' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    if (topPerformers.length > 0) {
      console.log('\n🏆 Top Hall of Fame Performers:');
      for (const performer of topPerformers) {
        const roster = await prisma.roster.findUnique({
          where: { id: performer.rosterId },
          include: { owner: { select: { displayName: true } } },
        });
        console.log(
          `  ${roster?.owner?.displayName || `Team ${performer.rosterId}`}: ${performer._count.id} records`
        );
      }
    }
  }
}

async function main() {
  try {
    const initializer = new HallOfFameInitializer();

    // Initialize all leagues
    await initializer.initializeAllLeagues();

    // Generate summary report
    await initializer.generateSummaryReport();
  } catch (error) {
    console.error('❌ Error initializing Hall of Fame:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
main();
