import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Dedicated API route for Week 3 2025 report
 * This is completely independent from other weeks to ensure stable artifacts
 */
export async function GET(_req: NextRequest) {
  try {
    // Only look for Week 3 static data
    let calculatedDataPath = path.join(process.cwd(), `apps/web/data/report-week3.json`);

    // If running from web app directory, try relative path first
    if (!fs.existsSync(calculatedDataPath)) {
      calculatedDataPath = path.join(process.cwd(), `data/report-week3.json`);
    }

    // If still not found, try going up two levels from web app
    if (!fs.existsSync(calculatedDataPath)) {
      calculatedDataPath = path.join(process.cwd(), `../../apps/web/data/report-week3.json`);
    }

    if (fs.existsSync(calculatedDataPath)) {
      console.log(`✅ Loading Week 3 report data from ${calculatedDataPath}`);
      try {
        const calculatedData = JSON.parse(fs.readFileSync(calculatedDataPath, 'utf8'));

        return NextResponse.json({
          ok: true,
          data: {
            ...calculatedData,
            scribeIntro:
              "Your faithful scribe returns with another week of chaos to unpack. The good news? The win probability charts are back! Bad news? Some of you might not like what they have to say about your teams' trajectories.",
            myIntro:
              'Week 3 delivered some absolute fireworks! We saw statement games, crucial bounce-back performances, and several teams cement their status as championship contenders.',
            callouts: {},
            closingNote:
              "Week 4 looms large with several must-win games on the horizon. The playoff picture is starting to take shape, but there's still plenty of season left for dramatic swings.",
          },
        });
      } catch (error) {
        console.error('❌ Error parsing Week 3 data:', error);
        return NextResponse.json(
          { ok: false, error: 'Failed to parse Week 3 data' },
          { status: 500 },
        );
      }
    } else {
      console.log(`⚠️ Week 3 data file not found`);
      return NextResponse.json({ ok: false, error: 'Week 3 data not available' }, { status: 404 });
    }
  } catch (error) {
    console.error('❌ Error in Week 3 API route:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
