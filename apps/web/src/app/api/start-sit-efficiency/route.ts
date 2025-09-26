import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Run the start/sit efficiency analysis script
async function runAnalysisScript(): Promise<any> {
  try {
    console.log('🚀 Running start/sit efficiency analysis...');

    // Execute the TypeScript analysis script from project root
    const currentDir = process.cwd();
    const projectRoot = currentDir.endsWith('/apps/web') ? currentDir.slice(0, -9) : currentDir;
    const { stdout, stderr } = await execAsync('npx tsx scripts/start-sit-efficiency-analysis.ts', {
      cwd: projectRoot,
      timeout: 60000, // 60 second timeout
    });

    if (stderr) {
      console.warn('Analysis script warnings:', stderr);
    }

    console.log('✅ Analysis script completed');

    // Find the most recent analysis file
    const files = await import('fs').then(fs => fs.promises.readdir(projectRoot));
    const analysisFiles = files
      .filter(file => file.startsWith('start-sit-analysis-') && file.endsWith('.json'))
      .sort((a, b) => {
        const aTime = parseInt(a.match(/start-sit-analysis-(\d+)\.json/)?.[1] || '0');
        const bTime = parseInt(b.match(/start-sit-analysis-(\d+)\.json/)?.[1] || '0');
        return bTime - aTime; // Most recent first
      });

    if (analysisFiles.length === 0) {
      throw new Error('No analysis file generated');
    }

    const latestFile = join(projectRoot, analysisFiles[0]);
    const data = JSON.parse(readFileSync(latestFile, 'utf8'));

    console.log(`📊 Loaded analysis data from ${analysisFiles[0]}`);
    return data;
  } catch (error) {
    console.error('❌ Analysis script failed:', error);
    throw error;
  }
}

export async function GET() {
  try {
    // Get the project root directory
    const currentDir = process.cwd();
    const projectRoot = currentDir.endsWith('/apps/web') ? currentDir.slice(0, -9) : currentDir;

    // Try to read existing recent data first (cache for 5 minutes)
    const files = await import('fs').then(fs => fs.promises.readdir(projectRoot));
    const analysisFiles = files
      .filter(file => file.startsWith('start-sit-analysis-') && file.endsWith('.json'))
      .sort((a, b) => {
        const aTime = parseInt(a.match(/start-sit-analysis-(\d+)\.json/)?.[1] || '0');
        const bTime = parseInt(b.match(/start-sit-analysis-(\d+)\.json/)?.[1] || '0');
        return bTime - aTime;
      });

    const now = Date.now();
    const cacheValidDuration = 5 * 60 * 1000; // 5 minutes

    // Check if we have recent data
    if (analysisFiles.length > 0) {
      const latestFile = analysisFiles[0];
      const fileTime = parseInt(latestFile.match(/start-sit-analysis-(\d+)\.json/)?.[1] || '0');

      if (now - fileTime < cacheValidDuration) {
        console.log(`📋 Using cached analysis data from ${latestFile}`);
        const data = JSON.parse(readFileSync(join(projectRoot, latestFile), 'utf8'));
        return NextResponse.json(data);
      }
    }

    // Run fresh analysis
    const data = await runAnalysisScript();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error running start/sit efficiency analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to run start/sit efficiency analysis',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Force refresh the analysis (ignores cache)
export async function POST() {
  try {
    console.log('🔄 Force refreshing start/sit efficiency analysis...');
    const data = await runAnalysisScript();

    return NextResponse.json({
      message: 'Analysis regeneration completed',
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error) {
    console.error('Error force refreshing analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to refresh analysis',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
