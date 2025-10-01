/**
 * Simple Context Collection
 * Fetches from running API and creates clean JSON for manual narrative writing
 */

import fs from 'fs';
import path from 'path';

const WEEK = parseInt(process.argv.find(arg => arg.startsWith('--week'))?.split('=')[1] || '4');
const API_URL = 'http://localhost:3000/api/stats';

console.log(`\n📊 Collecting Week ${WEEK} Context from API...\n`);

async function fetchAndProcess() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`API returned ${response.status}`);

    const data = await response.json();
    console.log('✅ Fetched stats data');

    // Extract just what we need for narrative writing
    const context = {
      week: WEEK,
      generatedAt: new Date().toISOString(),

      // We'll manually extract interesting patterns from this
      summary: {
        totalTeams: data.teams?.length || 0,
        dataAvailable: true,
      },

      // Store full data for reference
      fullData: data,
    };

    const outputPath = path.join(process.cwd(), `apps/web/data/week${WEEK}-context.json`);
    fs.writeFileSync(outputPath, JSON.stringify(context, null, 2));

    console.log(`\n✅ Context saved to: ${outputPath}`);
    console.log(`📊 ${context.summary.totalTeams} teams`);
    console.log(`\n✨ Now I'll read this and write narratives manually!\n`);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

fetchAndProcess();
