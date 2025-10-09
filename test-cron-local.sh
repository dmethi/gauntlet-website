#!/bin/bash

# Quick test script for live odds cron endpoint
# Usage: ./test-cron-local.sh

set -e

echo "🧪 Testing Live Odds Cron Endpoint Locally"
echo "=========================================="
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ Dev server not running on http://localhost:3000"
    echo ""
    echo "Start it in another terminal:"
    echo "  cd apps/web && pnpm dev"
    echo ""
    exit 1
fi

echo "✅ Dev server is running"
echo ""

# Check database connection
echo "🔌 Testing database connection..."
cd apps/server
if npx tsx -e "import {PrismaClient} from './generated/prisma-historical/index.js'; const p = new PrismaClient(); p.\$connect().then(() => console.log('Connected')).finally(() => p.\$disconnect());" 2>&1 | grep -q "Connected"; then
    echo "✅ Database connection works"
else
    echo "❌ Database connection failed"
    echo "Check your DATABASE_URL environment variable"
    exit 1
fi
cd ../..
echo ""

# Check current data state
echo "📊 Current database state (before test):"
cd apps/server
BEFORE_COUNT=$(npx tsx -e "import {PrismaClient} from './generated/prisma-historical/index.js'; const p = new PrismaClient(); p.liveWinProbSample.count({where: {week: 6}}).then(c => console.log(c)).finally(() => p.\$disconnect());" 2>&1 | tail -1)
echo "   Week 6 samples: $BEFORE_COUNT"
cd ../..
echo ""

# Hit the endpoint
echo "🎯 Triggering cron endpoint..."
echo "   POST http://localhost:3000/api/cron/live-odds"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/api/cron/live-odds)

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Endpoint returned success"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""
    
    # Extract metrics
    SAVED=$(echo "$RESPONSE" | jq -r '.savedCount // 0' 2>/dev/null || echo "?")
    SKIPPED=$(echo "$RESPONSE" | jq -r '.skippedCount // 0' 2>/dev/null || echo "?")
    FAILED=$(echo "$RESPONSE" | jq -r '.failedCount // 0' 2>/dev/null || echo "?")
    
    echo "📈 Results:"
    echo "   Saved:   $SAVED"
    echo "   Skipped: $SKIPPED"
    echo "   Failed:  $FAILED"
    echo ""
    
    # Verify database
    echo "🔍 Verifying database (after test):"
    cd apps/server
    AFTER_COUNT=$(npx tsx -e "import {PrismaClient} from './generated/prisma-historical/index.js'; const p = new PrismaClient(); p.liveWinProbSample.count({where: {week: 6}}).then(c => console.log(c)).finally(() => p.\$disconnect());" 2>&1 | tail -1)
    echo "   Week 6 samples: $AFTER_COUNT (was $BEFORE_COUNT)"
    
    if [ "$AFTER_COUNT" -gt "$BEFORE_COUNT" ]; then
        echo "   ✅ +$((AFTER_COUNT - BEFORE_COUNT)) new samples added!"
    elif [ "$AFTER_COUNT" -eq "$BEFORE_COUNT" ] && [ "$SKIPPED" -gt "0" ]; then
        echo "   ✅ Data unchanged (deduplication working)"
    else
        echo "   ⚠️  No new samples (check logs)"
    fi
    
    echo ""
    echo "📊 Run full verification:"
    echo "   cd apps/server && npx tsx src/scripts/verify-cron-data.ts"
    echo ""
    echo "✅ TEST PASSED - Fix is working locally!"
    
else
    echo "❌ Endpoint returned error"
    echo ""
    echo "Response:"
    echo "$RESPONSE"
    echo ""
    echo "Check dev server logs for errors"
    exit 1
fi

