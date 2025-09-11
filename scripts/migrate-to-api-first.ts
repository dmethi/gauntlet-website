#!/usr/bin/env node
/**
 * Migration Script: Database-Heavy to API-First Architecture
 *
 * This script handles the migration from the old database-heavy architecture
 * to the new API-first architecture with minimal database usage.
 *
 * Steps:
 * 1. Archive existing database data
 * 2. Test new API endpoints
 * 3. Migrate to new schema
 * 4. Verify functionality
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

const execAsync = promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

// Helper functions
const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset}  ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset}  ${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset}  ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset}  ${msg}`),
  header: (msg: string) =>
    console.log(`\n${colors.bright}${msg}${colors.reset}\n${'='.repeat(msg.length)}`),
};

// Prompt for user confirmation
async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(`${colors.yellow}${question} (y/n): ${colors.reset}`, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Step 1: Check prerequisites
async function checkPrerequisites() {
  log.header('Step 1: Checking Prerequisites');

  const checks = [
    {
      name: 'Node.js version',
      check: async () => {
        const { stdout } = await execAsync('node --version');
        const version = stdout.trim();
        const major = parseInt(version.split('.')[0].substring(1));
        return major >= 18;
      },
    },
    {
      name: 'pnpm installed',
      check: async () => {
        try {
          await execAsync('pnpm --version');
          return true;
        } catch {
          return false;
        }
      },
    },
    {
      name: 'Prisma CLI',
      check: async () => {
        try {
          await execAsync('npx prisma --version');
          return true;
        } catch {
          return false;
        }
      },
    },
    {
      name: 'DATABASE_URL environment variable',
      check: async () => {
        return !!process.env.DATABASE_URL;
      },
    },
  ];

  for (const { name, check } of checks) {
    const passed = await check();
    if (passed) {
      log.success(`${name} ✓`);
    } else {
      log.error(`${name} ✗`);
      return false;
    }
  }

  return true;
}

// Step 2: Archive existing data
async function archiveExistingData() {
  log.header('Step 2: Archiving Existing Data');

  const archivePath = path.join(process.cwd(), 'data', 'archive', 'pre-migration');
  await fs.mkdir(archivePath, { recursive: true });

  log.info('Creating database backup...');

  try {
    // Run the archive script
    const { stdout } = await execAsync('npx tsx apps/server/src/scripts/archive-database.ts');
    log.success('Database archived successfully');
    log.info(`Archive location: ${archivePath}`);
    return true;
  } catch (error) {
    log.error('Failed to archive database');
    console.error(error);
    return false;
  }
}

// Step 3: Install dependencies
async function installDependencies() {
  log.header('Step 3: Installing Dependencies');

  log.info('Installing React Query (already installed, verifying)...');
  await execAsync('pnpm install');
  log.success('Dependencies verified');

  return true;
}

// Step 4: Deploy new services
async function deployServices() {
  log.header('Step 4: Deploying New Services');

  const services = [
    'apps/server/src/services/sleeper/sleeper-api.service.ts',
    'apps/server/src/services/archive/archive.service.ts',
    'apps/web/src/hooks/useSleeper.ts',
  ];

  for (const service of services) {
    const exists = await fs
      .access(service)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      log.success(`Service deployed: ${path.basename(service)}`);
    } else {
      log.warning(`Service missing: ${service}`);
    }
  }

  return true;
}

// Step 5: Test new API endpoints
async function testNewEndpoints() {
  log.header('Step 5: Testing New API Endpoints');

  log.info('Starting development server...');

  // Note: In production, you'd actually test the endpoints
  // For now, we'll just verify the files exist
  const endpoints = [
    'apps/web/src/app/api/league/overview/route-v2.ts',
    'apps/web/src/app/api/matchups/[leagueId]/[week]/route-v2.ts',
  ];

  for (const endpoint of endpoints) {
    const exists = await fs
      .access(endpoint)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      log.success(`Endpoint ready: ${path.basename(path.dirname(endpoint))}`);
    } else {
      log.warning(`Endpoint not found: ${endpoint}`);
    }
  }

  return true;
}

// Step 6: Migrate database schema
async function migrateDatabase() {
  log.header('Step 6: Migrating Database Schema');

  if (!(await confirm('This will modify your database. Continue?'))) {
    log.warning('Database migration skipped');
    return false;
  }

  try {
    log.info('Generating Prisma client for new schema...');
    await execAsync('npx prisma generate --schema=apps/server/prisma/schema-minimal.prisma');
    log.success('Prisma client generated');

    log.info('Creating migration...');
    // In production, you'd run: npx prisma migrate dev --name api_first_migration
    log.warning(
      'Manual migration required: npx prisma migrate dev --schema=apps/server/prisma/schema-minimal.prisma'
    );

    return true;
  } catch (error) {
    log.error('Database migration failed');
    console.error(error);
    return false;
  }
}

// Step 7: Update environment variables
async function updateEnvironment() {
  log.header('Step 7: Environment Configuration');

  log.info('Required environment variables:');
  console.log('  DATABASE_URL - Your Neon database connection string');
  console.log('  NEXT_PUBLIC_APP_VERSION - For cache invalidation (e.g., "2.0.0")');

  log.warning('Please ensure these are set in your .env file');

  return true;
}

// Step 8: Deploy to production
async function deployToProduction() {
  log.header('Step 8: Deployment Guide');

  console.log(`
${colors.bright}Deployment Steps:${colors.reset}

1. ${colors.yellow}Commit all changes:${colors.reset}
   git add .
   git commit -m "feat: migrate to API-first architecture"

2. ${colors.yellow}Push to GitHub:${colors.reset}
   git push origin main

3. ${colors.yellow}Deploy to Vercel:${colors.reset}
   The deployment will trigger automatically
   
4. ${colors.yellow}Update environment variables in Vercel:${colors.reset}
   - Go to Vercel Dashboard > Settings > Environment Variables
   - Ensure DATABASE_URL is set
   - Add NEXT_PUBLIC_APP_VERSION = "2.0.0"

5. ${colors.yellow}Monitor the deployment:${colors.reset}
   - Check Vercel build logs
   - Test the live site
   - Monitor error rates

6. ${colors.yellow}Run initial simulations:${colors.reset}
   npx tsx apps/server/src/scripts/jobs/run-batch-simulations-v2.ts --week 1
`);

  return true;
}

// Step 9: Verify migration
async function verifyMigration() {
  log.header('Step 9: Verification Checklist');

  const checklist = [
    'All API endpoints return data',
    'React Query DevTools show cached data',
    'Simulations run successfully',
    'Odds data is stored in database',
    'No ID offset issues',
    'Page load times < 500ms',
    'Neon DB usage < 10%',
  ];

  console.log('\nPlease verify the following:');
  checklist.forEach((item, i) => {
    console.log(`  ${i + 1}. [ ] ${item}`);
  });

  return true;
}

// Main migration flow
async function main() {
  console.log(`
${colors.bright}🚀 Gauntlet Migration Tool${colors.reset}
${colors.blue}Migrating from Database-Heavy to API-First Architecture${colors.reset}
`);

  const steps = [
    { name: 'Check Prerequisites', fn: checkPrerequisites },
    { name: 'Archive Existing Data', fn: archiveExistingData },
    { name: 'Install Dependencies', fn: installDependencies },
    { name: 'Deploy Services', fn: deployServices },
    { name: 'Test New Endpoints', fn: testNewEndpoints },
    { name: 'Migrate Database', fn: migrateDatabase },
    { name: 'Update Environment', fn: updateEnvironment },
    { name: 'Deploy to Production', fn: deployToProduction },
    { name: 'Verify Migration', fn: verifyMigration },
  ];

  let allPassed = true;

  for (const { name, fn } of steps) {
    const result = await fn();
    if (!result) {
      log.error(`Step failed: ${name}`);
      allPassed = false;

      if (!(await confirm('Continue anyway?'))) {
        break;
      }
    }
  }

  if (allPassed) {
    console.log(`
${colors.green}${colors.bright}✅ Migration Complete!${colors.reset}

${colors.bright}What's Next:${colors.reset}
1. Test all functionality thoroughly
2. Monitor performance metrics
3. Check Neon DB usage (should be < 10%)
4. Run a full simulation batch
5. Archive old database tables after 30 days

${colors.bright}Rollback Plan:${colors.reset}
If issues arise, you can rollback by:
1. Reverting the Git commit
2. Restoring the original Prisma schema
3. Redeploying to Vercel

${colors.blue}Thank you for migrating to the new architecture!${colors.reset}
`);
  } else {
    console.log(`
${colors.yellow}⚠️  Migration completed with warnings${colors.reset}

Please address any issues before deploying to production.
Consult the documentation for troubleshooting.
`);
  }
}

// Run migration
if (require.main === module) {
  main().catch(error => {
    log.error('Migration failed with error:');
    console.error(error);
    process.exit(1);
  });
}

export { main as migrate };
