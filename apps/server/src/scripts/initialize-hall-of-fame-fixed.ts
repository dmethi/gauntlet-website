/**
 * Fixed Hall of Fame Initialization Script
 * Uses the updated calculator with consolidated categories
 */

import { PrismaClient } from '@prisma/client';
import { HallOfFameCalculatorFixed, HallOfFameCalculationResult } from '../lib/hall-of-fame-calculator-fixed.ts';

const prisma = new PrismaClient();

interface LeagueInfo {
  id: string;
  season: string;
}

interface CategoryRanking {
  categoryName: string;
  top: HallOfFameCalculationResult[];
  bottom: HallOfFameCalculationResult[];
}

class HallOfFameInitializerFixed {
  private hofCalculator: HallOfFameCalculatorFixed;

  constructor() {
    this.hofCalculator = new HallOfFameCalculatorFixed();
  }

  async initializeAllLeagues() {
    console.log('🏆 Initializing Hall of Fame records with fixed categories...');
    
    const leagues = await this.getLeaguesWithMatchupData();
    if (leagues.length === 0) {
      console.log('❌ No leagues with matchup data found');
      return;
    }
    console.log(`📊 Found ${leagues.length} leagues with data`);

    for (const league of leagues) {
      console.log(`\n🔍 Processing league ${league.id} (${league.season})`);
      const weeks = await this.getWeeksWithMatchupData(league.id);
      console.log(`📅 Processing ${weeks.length} weeks: ${weeks.join(', ')}`);

      // Clear existing records for this league
      await prisma.hallOfFameRecord.deleteMany({
        where: { leagueId: league.id, season: league.season },
      });

      // Calculate all stats across all weeks
      const allCalculations: HallOfFameCalculationResult[] = [];

      for (const week of weeks) {
        console.log(`  📈 Calculating stats for week ${week}...`);
        const weeklyResults = await this.hofCalculator.calculateWeeklyStats(
          league.id,
          week,
          league.season
        );
        allCalculations.push(...weeklyResults);
      }
      console.log(`✅ Calculated ${allCalculations.length} total stat instances`);

      // Generate rankings for each category
      const rankings = await this.generateRankings(allCalculations, league.id, league.season);

      // Store Hall of Fame records
      await this.storeHallOfFameRecords(rankings, league.id);
      console.log(`🏆 Created Hall of Fame records for league ${league.id}`);
    }
    console.log('🎉 Hall of Fame initialization complete!');
  }

  private async getLeaguesWithMatchupData(): Promise<LeagueInfo[]> {
    const leagues = await prisma.league.findMany({
      where: {
        matchups: {
          some: {},
        },
      },
      select: {
        id: true,
        season: true,
      },
    });
    return leagues;
  }

  private async getWeeksWithMatchupData(leagueId: string): Promise<number[]> {
    const matchups = await prisma.matchup.findMany({
      where: { leagueId },
      select: { week: true },
      distinct: ['week'],
      orderBy: { week: 'asc' },
    });
    return matchups.map((m) => m.week);
  }

  private async generateRankings(
    calculations: HallOfFameCalculationResult[],
    leagueId: string,
    season: string
  ): Promise<CategoryRanking[]> {
    // Get category definitions to understand stat types
    const categories = await prisma.hallOfFameCategory.findMany({
      select: { name: true, statType: true },
    });

    const categoryMap = categories.reduce(
      (acc, cat) => {
        acc[cat.name] = cat.statType;
        return acc;
      },
      {} as Record<string, string>
    );

    // Group calculations by category
    const grouped = calculations.reduce(
      (acc, calc) => {
        if (!acc[calc.categoryName]) acc[calc.categoryName] = [];
        acc[calc.categoryName].push(calc);
        return acc;
      },
      {} as Record<string, HallOfFameCalculationResult[]>
    );

    const rankings: CategoryRanking[] = [];

    Object.entries(grouped).forEach(([categoryName, calcs]) => {
      const statType = categoryMap[categoryName];
      if (!statType) {
        console.log(`⚠️  No category definition found for: ${categoryName}`);
        return;
      }

      // Sort calculations by value
      const sorted = [...calcs].sort((a, b) => b.value - a.value); // Descending order

      let top: HallOfFameCalculationResult[] = [];
      let bottom: HallOfFameCalculationResult[] = [];

      if (statType === 'high' || statType === 'both') {
        top = sorted.slice(0, 5);
      }

      if (statType === 'low' || statType === 'both') {
        bottom = sorted.slice(-5).reverse(); // Get lowest 5, but keep them in ascending order
      }

      // Log the ranges for debugging
      if (top.length > 0 || bottom.length > 0) {
        const topRange = top.length > 0 ? `${top[0].value.toFixed(2)} to ${top[top.length - 1].value.toFixed(2)}` : 'none';
        const bottomRange = bottom.length > 0 ? `${bottom[0].value.toFixed(2)} to ${bottom[bottom.length - 1].value.toFixed(2)}` : 'none';
        console.log(`  📊 ${categoryName}: ${calcs.length} instances -> top 5 range: ${topRange}, bottom 5 range: ${bottomRange}`);
      }

      rankings.push({
        categoryName,
        top,
        bottom,
      });
    });

    return rankings;
  }

  private async storeHallOfFameRecords(rankings: CategoryRanking[], leagueId: string) {
    console.log('💾 Storing Hall of Fame records...');

    for (const ranking of rankings) {
      const category = await prisma.hallOfFameCategory.findUnique({
        where: { name: ranking.categoryName },
      });

      if (!category) {
        console.log(`⚠️  Category not found: ${ranking.categoryName}`);
        continue;
      }

      // Store top 5 records
      for (let i = 0; i < ranking.top.length; i++) {
        const record = ranking.top[i];
        await prisma.hallOfFameRecord.create({
          data: {
            categoryId: category.id,
            leagueId: leagueId, // Use the correct league ID
            rosterId: record.rosterId,
            week: record.week,
            season: record.season,
            value: record.value,
            recordType: 'top',
            rank: i + 1,
            contextData: record.contextData,
            achievedAt: record.achievedAt,
          },
        });
      }

      // Store bottom 5 records
      for (let i = 0; i < ranking.bottom.length; i++) {
        const record = ranking.bottom[i];
        await prisma.hallOfFameRecord.create({
          data: {
            categoryId: category.id,
            leagueId: leagueId, // Use the correct league ID
            rosterId: record.rosterId,
            week: record.week,
            season: record.season,
            value: record.value,
            recordType: 'bottom',
            rank: i + 1,
            contextData: record.contextData,
            achievedAt: record.achievedAt,
          },
        });
      }
    }

    console.log(`✅ Stored records for ${rankings.length} categories`);
  }

  async generateSummaryReport() {
    const records = await prisma.hallOfFameRecord.findMany({
      include: {
        category: { select: { displayName: true, groupName: true } },
        roster: {
          include: { owner: { select: { displayName: true } } },
        },
      },
    });

    console.log('\n📋 Hall of Fame Summary Report');
    console.log('==================================================');

    // Group by category group
    const groups = records.reduce(
      (acc, record) => {
        const groupName = record.category.groupName;
        if (!acc[groupName]) acc[groupName] = new Set();
        acc[groupName].add(record.category.displayName);
        return acc;
      },
      {} as Record<string, Set<string>>
    );

    Object.entries(groups).forEach(([groupName, categorySet]) => {
      console.log(`${groupName}: ${categorySet.size} categories, ${records.filter(r => r.category.groupName === groupName).length} records`);
    });

    console.log(`\n🎯 Total: ${Object.values(groups).reduce((sum, set) => sum + set.size, 0)} categories, ${records.length} records`);

    // Top performers
    const performers = records.reduce(
      (acc, record) => {
        const name = record.roster.owner?.displayName || `Team ${record.rosterId}`;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sortedPerformers = Object.entries(performers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    console.log('\n🏆 Top Hall of Fame Performers:');
    sortedPerformers.forEach(([name, count]) => {
      console.log(`  ${name}: ${count} records`);
    });
  }
}

async function main() {
  const initializer = new HallOfFameInitializerFixed();
  try {
    await initializer.initializeAllLeagues();
    await initializer.generateSummaryReport();
  } catch (error) {
    console.error('❌ Error initializing Hall of Fame:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
