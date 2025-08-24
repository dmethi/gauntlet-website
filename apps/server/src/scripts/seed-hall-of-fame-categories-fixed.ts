/**
 * Fixed Seed script for Hall of Fame categories
 * Addresses user feedback on category consolidation and logic
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CategoryDefinition {
  name: string;
  displayName: string;
  description: string;
  groupName: string;
  statType: 'high' | 'low' | 'both';
  sortOrder: number;
}

const categories: CategoryDefinition[] = [
  // A. Score & Margin (4 stats)
  {
    name: 'team_points',
    displayName: 'Team Points',
    description: 'Most and fewest points scored by a team in a single week',
    groupName: 'Score & Margin',
    statType: 'both',
    sortOrder: 1,
  },
  {
    name: 'most_points_in_loss',
    displayName: 'Most Points in a Loss',
    description: 'Highest score by a team that still lost their matchup',
    groupName: 'Score & Margin',
    statType: 'high', // Only top 5, no hall of shame
    sortOrder: 2,
  },
  {
    name: 'fewest_points_in_win',
    displayName: 'Fewest Points in a Win',
    description: 'Lowest score by a team that still won their matchup',
    groupName: 'Score & Margin',
    statType: 'low', // Only bottom 5, no hall of fame
    sortOrder: 3,
  },
  {
    name: 'margin_of_victory',
    displayName: 'Margin of Victory',
    description: 'Largest and smallest winning margins',
    groupName: 'Score & Margin',
    statType: 'both',
    sortOrder: 4,
  },

  // B. Lineup Quality (2 stats)
  {
    name: 'bench_blunder',
    displayName: 'Bench Blunder',
    description: 'Gap between optimal lineup and actual lineup (points left on bench)',
    groupName: 'Lineup Quality',
    statType: 'high', // Only show worst blunders (hall of shame)
    sortOrder: 1,
  },
  {
    name: 'total_donuts',
    displayName: 'Total Donuts',
    description: 'Number of starting players who scored 0 points',
    groupName: 'Lineup Quality',
    statType: 'high', // Only show maximum donuts (hall of shame)
    sortOrder: 2,
  },

  // C. Positional Splits (11 stats)
  {
    name: 'highest_qb',
    displayName: 'Highest QB Weekly Total',
    description: 'Best single-week QB performance',
    groupName: 'Positional Splits',
    statType: 'high',
    sortOrder: 1,
  },
  {
    name: 'lowest_qb',
    displayName: 'Lowest QB Weekly Total',
    description: 'Worst single-week QB performance',
    groupName: 'Positional Splits',
    statType: 'low',
    sortOrder: 2,
  },
  {
    name: 'highest_rb',
    displayName: 'Highest RB Weekly Total',
    description: 'Best single-week RB performance',
    groupName: 'Positional Splits',
    statType: 'high',
    sortOrder: 3,
  },
  {
    name: 'lowest_rb',
    displayName: 'Lowest RB Weekly Total',
    description: 'Worst single-week RB performance',
    groupName: 'Positional Splits',
    statType: 'low',
    sortOrder: 4,
  },
  {
    name: 'highest_wr',
    displayName: 'Highest WR Weekly Total',
    description: 'Best single-week WR performance',
    groupName: 'Positional Splits',
    statType: 'high',
    sortOrder: 5,
  },
  {
    name: 'lowest_wr',
    displayName: 'Lowest WR Weekly Total',
    description: 'Worst single-week WR performance',
    groupName: 'Positional Splits',
    statType: 'low',
    sortOrder: 6,
  },
  {
    name: 'highest_te',
    displayName: 'Highest TE Weekly Total',
    description: 'Best single-week TE performance',
    groupName: 'Positional Splits',
    statType: 'high',
    sortOrder: 7,
  },
  {
    name: 'lowest_te',
    displayName: 'Lowest TE Weekly Total',
    description: 'Worst single-week TE performance',
    groupName: 'Positional Splits',
    statType: 'low',
    sortOrder: 8,
  },
  {
    name: 'highest_def',
    displayName: 'Highest DEF Weekly Total',
    description: 'Best single-week Defense performance',
    groupName: 'Positional Splits',
    statType: 'high',
    sortOrder: 9,
  },
  {
    name: 'lowest_def',
    displayName: 'Lowest DEF Weekly Total',
    description: 'Worst single-week Defense performance',
    groupName: 'Positional Splits',
    statType: 'low',
    sortOrder: 10,
  },
  {
    name: 'highest_top3',
    displayName: 'Highest Top-3 Starters Sum',
    description: 'Best combined performance from top 3 weekly starters',
    groupName: 'Positional Splits',
    statType: 'high',
    sortOrder: 11,
  },
  {
    name: 'lowest_bottom3',
    displayName: 'Lowest Bottom-3 Starters Sum',
    description: 'Worst combined performance from bottom 3 weekly starters',
    groupName: 'Positional Splits',
    statType: 'low',
    sortOrder: 12,
  },

  // D. Volatility (3 stats)
  {
    name: 'star_concentration_index',
    displayName: 'Star Concentration Index',
    description: 'Percentage of team points from top 1-2 players',
    groupName: 'Volatility',
    statType: 'both', // Simple top 5 vs bottom 5, not hall of fame/shame
    sortOrder: 1,
  },
  {
    name: 'boom_count',
    displayName: 'Boom Count',
    description: 'Number of starters exceeding 90th percentile vs position baseline',
    groupName: 'Volatility',
    statType: 'high',
    sortOrder: 2,
  },
  {
    name: 'bust_count',
    displayName: 'Bust Count',
    description: 'Number of starters below 10th percentile vs position baseline',
    groupName: 'Volatility',
    statType: 'high',
    sortOrder: 3,
  },
];

async function seedCategories() {
  console.log('🌱 Seeding fixed Hall of Fame categories...');

  // Check if categories already exist
  const existingCount = await prisma.hallOfFameCategory.count();
  if (existingCount > 0) {
    console.log(`🧹 Clearing ${existingCount} existing categories first...`);
    // Clear records first, then categories
    await prisma.hallOfFameRecord.deleteMany({});
    await prisma.hallOfFameCategory.deleteMany({});
  }

  // Insert new categories
  for (const category of categories) {
    await prisma.hallOfFameCategory.create({
      data: category,
    });
  }

  console.log(`✅ Created ${categories.length} fixed Hall of Fame categories`);

  // Display summary by group
  const groups = categories.reduce(
    (acc, cat) => {
      if (!acc[cat.groupName]) acc[cat.groupName] = 0;
      acc[cat.groupName]++;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('📊 Categories by group:');
  Object.entries(groups).forEach(([group, count]) => {
    console.log(`  ${group}: ${count} categories`);
  });
}

async function generateSummaryReport() {
  const categories = await prisma.hallOfFameCategory.findMany({
    orderBy: [{ groupName: 'asc' }, { sortOrder: 'asc' }],
  });

  console.log('\n📋 Fixed Hall of Fame Categories Summary');
  console.log('=' * 50);

  const groups = categories.reduce(
    (acc, cat) => {
      if (!acc[cat.groupName]) acc[cat.groupName] = [];
      acc[cat.groupName].push(cat);
      return acc;
    },
    {} as Record<string, typeof categories>
  );

  Object.entries(groups).forEach(([groupName, cats]) => {
    console.log(`\n${groupName}:`);
    cats.forEach(cat => {
      const typeLabel =
        cat.statType === 'high'
          ? 'Top 5'
          : cat.statType === 'low'
            ? 'Bottom 5'
            : 'Top 5 + Bottom 5';
      console.log(`  ${cat.displayName} (${typeLabel})`);
    });
  });

  console.log(`\n🎯 Total: ${categories.length} categories`);
}

async function main() {
  try {
    console.log('🌱 Seeding fixed Hall of Fame categories...');
    await seedCategories();
    console.log('🎉 Fixed Hall of Fame categories seeded successfully!');
    await generateSummaryReport();
  } catch (error) {
    console.error('❌ Error seeding fixed Hall of Fame categories:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
