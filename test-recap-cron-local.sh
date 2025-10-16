#!/bin/bash

# Quick test script for weekly recap cron endpoint
# Usage: ./test-recap-cron-local.sh

set -e

echo "📰 Testing Weekly Recap Cron Endpoint Locally"
echo "=============================================="
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

# Check environment variables
echo "🔍 Checking environment variables..."
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ GEMINI_API_KEY not set"
    echo ""
    echo "Set it with:"
    echo "  export GEMINI_API_KEY=your-api-key"
    echo ""
    exit 1
fi
echo "✅ GEMINI_API_KEY is set"
echo ""

# Show current week
echo "📅 Detecting current NFL week..."
CURRENT_WEEK=$(curl -s https://api.sleeper.app/v1/state/nfl | jq -r '.week')
echo "   Current Week: $CURRENT_WEEK"
echo ""

# Check if report already exists
REPORT_FILE="apps/web/data/reports/recap/2025/week-${CURRENT_WEEK}.json"
if [ -f "$REPORT_FILE" ]; then
    echo "⚠️  Report already exists: $REPORT_FILE"
    echo ""
    echo "Options:"
    echo "  1. Delete it to regenerate: rm $REPORT_FILE"
    echo "  2. Or continue to test (will likely fail with 'already exists' error)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Hit the endpoint
echo "🎯 Triggering cron endpoint..."
echo "   POST http://localhost:3000/api/cron/recap-report"
echo ""
echo "   ⏱️  This will take 60-90 seconds..."
echo ""

START_TIME=$(date +%s)

RESPONSE=$(curl -s -X POST http://localhost:3000/api/cron/recap-report \
    -H "Authorization: Bearer test-secret" \
    --max-time 300)

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Endpoint returned success in ${DURATION}s"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""
    
    # Extract metrics
    WEEK=$(echo "$RESPONSE" | jq -r '.week // "?"' 2>/dev/null || echo "?")
    SEASON=$(echo "$RESPONSE" | jq -r '.season // "?"' 2>/dev/null || echo "?")
    STATUS=$(echo "$RESPONSE" | jq -r '.status // "?"' 2>/dev/null || echo "?")
    FILEPATH=$(echo "$RESPONSE" | jq -r '.filePath // "?"' 2>/dev/null || echo "?")
    SAVED=$(echo "$RESPONSE" | jq -r '.saved // false' 2>/dev/null || echo "false")
    
    echo "📊 Results:"
    echo "   Week:     $WEEK"
    echo "   Season:   $SEASON"
    echo "   Status:   $STATUS"
    echo "   Saved:    $SAVED"
    echo "   File:     $FILEPATH"
    echo "   Duration: ${DURATION}s"
    echo ""
    
    # Verify file exists
    if [ -f "$REPORT_FILE" ]; then
        FILE_SIZE=$(wc -c < "$REPORT_FILE" | xargs)
        echo "🔍 Verifying report file:"
        echo "   ✅ File exists: $REPORT_FILE"
        echo "   📦 Size: $FILE_SIZE bytes"
        echo ""
        
        # Show report structure
        echo "📄 Report structure:"
        jq '{week, season, generatedAt, sections: {leagueOverview: (.leagueOverview | length), hallOfFame: (.hallOfFame | length), hallOfShame: (.hallOfShame | length), powerRankings: (.powerRankings | length), matchupNarratives: (.matchupNarratives | length), standings: (.standings | length), closing: (.closing | length)}}' "$REPORT_FILE" 2>/dev/null || echo "   (Unable to parse JSON)"
        echo ""
    else
        echo "⚠️  Report file not found: $REPORT_FILE"
        echo ""
    fi
    
    echo "✅ TEST PASSED - Cron job working locally!"
    echo ""
    echo "📍 View report at:"
    echo "   http://localhost:3000/competition/reports/2025/week-${CURRENT_WEEK}"
    echo ""
    
else
    echo "❌ Endpoint returned error in ${DURATION}s"
    echo ""
    echo "Response:"
    echo "$RESPONSE"
    echo ""
    
    # Try to extract error
    ERROR=$(echo "$RESPONSE" | jq -r '.error // "Unknown error"' 2>/dev/null || echo "Unknown error")
    echo "Error: $ERROR"
    echo ""
    echo "Check dev server logs for details"
    exit 1
fi


