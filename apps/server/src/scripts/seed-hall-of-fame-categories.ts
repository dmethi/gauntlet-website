/**
 * Seed script for Hall of Fame categories
 * Populates the HallOfFameCategory table with all trackable weekly team-based stats
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
  // A. Score & Margin (6 stats)
  {
    name: 'highest_team_points',
    displayName: 'Highest Team Points',
    description: 'Most points scored by a team in a single week (any result)',
    groupName: 'Score & Margin',
    statType: 'high',
    sortOrder: 1,
  },
  {
    name: 'lowest_team_points',
    displayName: 'Lowest Team Points',
    description: 'Fewest points scored by a team in a single week (any result)',
    groupName: 'Score & Margin',
    statType: 'low',
    sortOrder: 2,
  },
  {
    name: 'most_points_in_loss',
    displayName: 'Most Points in a Loss',
    description: 'Highest score by a team that still lost their matchup',
    groupName: 'Score & Margin',
    statType: 'high',
    sortOrder: 3,
  },
  {
    name: 'fewest_points_in_win',
    displayName: 'Fewest Points in a Win',
    description: 'Lowest score by a team that still won their matchup',
    groupName: 'Score & Margin',
    statType: 'low',
    sortOrder: 4,
  },
  {
    name: 'largest_margin_victory',
    displayName: 'Largest Margin of Victory',
    description: 'Biggest point differential in a winning performance',
    groupName: 'Score & Margin',
    statType: 'high',
    sortOrder: 5,
  },
  {
    name: 'smallest_margin_victory',
    displayName: 'Smallest Margin of Victory',
    description: 'Closest win by point differential (nail-biter victories)',
    groupName: 'Score & Margin',
    statType: 'low',
    sortOrder: 6,
  },

  // B. Lineup Quality (3 stats)
  {
    name: 'bench_blunder',
    displayName: 'Bench Blunder',
    description: 'Largest gap between optimal lineup and actual lineup (points left on bench)',
    groupName: 'Lineup Quality',
    statType: 'high',
    sortOrder: 1,
  },
  {
    name: 'total_donuts',
    displayName: 'Total Donuts',
    description: 'Most starters with 0 points in a single week',
    groupName: 'Lineup Quality',
    statType: 'high',
    sortOrder: 2,
  },
  {
    name: 'most_negative_starters',
    displayName: 'Most Negative Starters',
    description: 'Most starters with negative points in a single week',
    groupName: 'Lineup Quality',
    statType: 'high',
    sortOrder: 3,
  },

  // C. Positional Splits - Highs (5 stats)
  {
    name: 'highest_qb_weekly',
    displayName: 'Highest QB Weekly Total',
    description: 'Best single-week performance by a starting QB',
    groupName: 'Positional Splits',
    statType: 'high',
    sortOrder: 1,
  },
  {
    name: 'highest_rb_weekly',
    displayName: 'Highest RB Weekly Total',
    description: 'Best single-week performance by a starting RB',
    groupName: 'Positional Splits',
    statType: 'high',
    sortOrder: 2,
  },
  {
    name: 'highest_wr_weekly',
    displayName: 'Highest WR Weekly Total',
    description: 'Best single-week performance by a starting WR',
    groupName: 'Positional Splits',
    statType: 'high',
    sortOrder: 3,
  },
  {
    name: 'highest_te_weekly',
    displayName: 'Highest TE Weekly Total',
    description: 'Best single-week performance by a starting TE',
    groupName: 'Positional Splits',
    statType: 'high',
    sortOrder: 4,
  },
  {
    name: 'highest_def_weekly',
    displayName: 'Highest DEF Weekly Total',
    description: 'Best single-week performance by a starting Defense',
    groupName: 'Positional Splits',
    statType: 'high',
    sortOrder: 5,
  },

  // C. Positional Splits - Lows (4 stats)
  {
    name: 'lowest_qb_weekly',
    displayName: 'Lowest QB Weekly Total',
    description: 'Worst single-week performance by a starting QB',
    groupName: 'Positional Splits',
    statType: 'low',
    sortOrder: 6,
  },
  {
    name: 'lowest_rb_weekly',
    displayName: 'Lowest RB Weekly Total',
    description: 'Worst single-week performance by a starting RB',
    groupName: 'Positional Splits',
    statType: 'low',
    sortOrder: 7,
  },
  {
    name: 'lowest_wr_weekly',
    displayName: 'Lowest WR Weekly Total',
    description: 'Worst single-week performance by a starting WR',
    groupName: 'Positional Splits',
    statType: 'low',
    sortOrder: 8,
  },
  {
    name: 'lowest_te_weekly',
    displayName: 'Lowest TE Weekly Total',
    description: 'Worst single-week performance by a starting TE',
    groupName: 'Positional Splits',
    statType: 'low',
    sortOrder: 9,
  },

  // C. Positional Splits - Combinations (2 stats)
  {
    name: 'highest_top3_starters',
    displayName: 'Highest Top-3 Starters Sum',
    description: 'Best combined performance from the top 3 scoring starters',
    groupName: 'Positional Splits',
    statType: 'high',
    sortOrder: 10,
  },
  {
    name: 'lowest_bottom3_starters',
    displayName: 'Lowest Bottom-3 Starters Sum',
    description: 'Worst combined performance from the bottom 3 scoring starters',
    groupName: 'Positional Splits',
    statType: 'low',
    sortOrder: 11,
  },

  // D. Volatility / Consistency (3 stats)
  {
    name: 'star_concentration_index',
    displayName: 'Star Concentration Index',
    description: 'Highest percentage of total points from top 1-2 starters (star dependency)',
    groupName: 'Volatility',
    statType: 'high',
    sortOrder: 1,
  },
  {
    name: 'boom_count',
    displayName: 'Boom Count',
    description: 'Most starters performing above 90th percentile vs positional baselines',
    groupName: 'Volatility',
    statType: 'high',
    sortOrder: 2,
  },
  {
    name: 'bust_count',
    displayName: 'Bust Count',
    description: 'Most starters performing below 10th percentile vs positional baselines',
    groupName: 'Volatility',
    statType: 'high',
    sortOrder: 3,
  },
];

async function seedCategories() {
  console.log('🌱 Seeding Hall of Fame categories...');

  // Check if categories already exist
  const existingCount = await prisma.hallOfFameCategory.count();
  if (existingCount > 0) {
    console.log(`📊 Found ${existingCount} existing categories, skipping seeding`);
    return;
  }

  // Insert new categories
  for (const category of categories) {
    await prisma.hallOfFameCategory.create({
      data: category,
    });
  }

  console.log(`✅ Created ${categories.length} Hall of Fame categories`);

  // Display summary by group
  const groups = categories.reduce(
    (acc, cat) => {
      if (!acc[cat.groupName]) acc[cat.groupName] = 0;
      acc[cat.groupName]++;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('\n📊 Categories by group:');
  Object.entries(groups).forEach(([group, count]) => {
    console.log(`  ${group}: ${count} stats`);
  });

  console.log(`\n🎯 Total: ${categories.length} trackable stats`);
}

async function main() {
  try {
    await seedCategories();
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
main();

export { categories, seedCategories };
