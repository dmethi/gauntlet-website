import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { PageHeaderHero } from '@gauntlet/ui';
import {
  WeeklyPreviewPending,
  type WeeklyPreviewReport,
  WeeklyPreviewView,
} from '@/features/opening-reports';

const WEEK = 2;

export const metadata: Metadata = {
  title: `Week ${WEEK} Preview — The Gauntlet`,
  description: 'Matchup odds, weekly races, and lineup context across all three Gauntlet Legions.',
};

export const dynamic = 'force-static';

const loadPreview = async (): Promise<WeeklyPreviewReport | null> => {
  try {
    const artifactPath = path.join(
      process.cwd(),
      'src',
      'data',
      'reports',
      'opening-2026',
      `week-${WEEK}-preview.json`,
    );
    const parsed = JSON.parse(await readFile(artifactPath, 'utf8')) as WeeklyPreviewReport;
    if (
      parsed.metadata?.season !== 2026 ||
      parsed.metadata?.week !== WEEK ||
      parsed.leagues?.length !== 3
    ) {
      throw new Error(`Invalid Week ${WEEK} preview artifact`);
    }
    return parsed;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null;
    throw error;
  }
};

export default async function WeekTwoPreviewPage() {
  const report = await loadPreview();
  return (
    <>
      <PageHeaderHero
        title={`Week ${WEEK} Preview`}
        crestSrc="/gauntlet_logo.svg"
        subtitle="Opening lines for all three 2026 Legions"
      />
      {report ? <WeeklyPreviewView report={report} /> : <WeeklyPreviewPending week={WEEK} />}
    </>
  );
}
