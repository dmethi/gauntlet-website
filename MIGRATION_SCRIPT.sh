#!/bin/bash

# Migration Script: Remove all database dependencies from web app

echo "🚀 Starting database elimination migration..."

# Step 1: Backup current API routes
echo "📦 Step 1: Creating backup of current API routes..."
cp -r apps/web/src/app/api apps/web/src/app/api.backup

# Step 2: Update package.json to remove Prisma from web app
echo "📦 Step 2: Removing Prisma dependencies from web app..."
cd apps/web
npm uninstall @prisma/client prisma
cd ../..

# Step 3: List all files that need migration
echo "📋 Step 3: Files that need migration:"
echo ""
echo "API Routes to migrate:"
find apps/web/src/app/api -name "*.ts" -exec grep -l "prisma\." {} \;

echo ""
echo "Components that might use database:"
find apps/web/src/components -name "*.tsx" -exec grep -l "prisma\." {} \;

echo ""
echo "Hooks that might use database:"
find apps/web/src/hooks -name "*.ts" -exec grep -l "prisma\." {} \;

# Step 4: Generate migration report
echo ""
echo "📊 Step 4: Migration Report"
echo "=========================="
echo ""
echo "Replace these patterns:"
echo "  prisma.league.findMany() → getAllLeagues()"
echo "  prisma.league.findUnique() → getLeagueById()"
echo "  prisma.roster.findMany() → getRostersByLeague()"
echo "  prisma.matchup.findMany() → getMatchupsByWeek()"
echo "  prisma.user.findMany() → getUsersByLeague()"
echo "  prisma.transaction.findMany() → getTransactionsByWeek()"
echo ""
echo "Import from:"
echo "  import { ... } from '@/lib/api-replacements'"
echo ""
echo "Remove:"
echo "  import { prisma } from '@/lib/prisma'"
echo ""

# Step 5: Test endpoints
echo "🧪 Step 5: Test new database-free endpoints:"
echo ""
echo "Test these URLs after deployment:"
echo "  /api/leagues-static (replaces /api/leagues)"
echo "  /api/league-direct/[leagueId] (replaces /api/league/[id])"
echo "  /api/migrate-example (example of migrated endpoint)"
echo ""

echo "✅ Migration preparation complete!"
echo ""
echo "Next steps:"
echo "1. Manually update each API route using the patterns above"
echo "2. Test each endpoint locally"
echo "3. Delete apps/web/src/lib/prisma.ts"
echo "4. Delete apps/web/src/generated/prisma/"
echo "5. Deploy and monitor Neon dashboard (should drop to 0)"
