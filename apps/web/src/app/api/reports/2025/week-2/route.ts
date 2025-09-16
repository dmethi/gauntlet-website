import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Dedicated API route for Week 2 2025 report
 * This is completely independent from other weeks to ensure stable artifacts
 */
export async function GET(_req: NextRequest) {
  try {
    // Only look for Week 2 static data
    let calculatedDataPath = path.join(process.cwd(), `apps/web/data/report-week2.json`);

    // If running from web app directory, try relative path first
    if (!fs.existsSync(calculatedDataPath)) {
      calculatedDataPath = path.join(process.cwd(), `data/report-week2.json`);
    }

    // If still not found, try going up two levels from web app
    if (!fs.existsSync(calculatedDataPath)) {
      calculatedDataPath = path.join(process.cwd(), `../../apps/web/data/report-week2.json`);
    }

    if (fs.existsSync(calculatedDataPath)) {
      console.log(`✅ Loading Week 2 report data from ${calculatedDataPath}`);
      try {
        const calculatedData = JSON.parse(fs.readFileSync(calculatedDataPath, 'utf8'));

        return NextResponse.json({
          ok: true,
          data: {
            ...calculatedData,
            scribeIntro:
              'I am the Gauntlet Scribe — Dhruv brings the raw takes, I weaponize them. Expect receipts, rivalry, and the occasional fine.',
            myIntro: '',
            callouts: {},
            closingNote: '',
          },
        });
      } catch (error) {
        console.error('❌ Error parsing Week 2 data:', error);
        return NextResponse.json(
          { ok: false, error: 'Failed to parse Week 2 data' },
          { status: 500 }
        );
      }
    } else {
      console.log(`⚠️ Week 2 data file not found`);
      return NextResponse.json({ ok: false, error: 'Week 2 data not available' }, { status: 404 });
    }
  } catch (error) {
    console.error('❌ Error in Week 2 API route:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
