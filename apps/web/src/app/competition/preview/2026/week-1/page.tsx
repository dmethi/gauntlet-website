import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { PageHeaderHero } from '@gauntlet/ui';
import {
  WeeklyPreviewPending,
  type WeeklyPreviewReport,
  WeeklyPreviewView,
} from '@/features/opening-reports';

export const metadata: Metadata = {
  title: 'Week 1 Preview — The Gauntlet',
  description:
    'Opening matchup odds, weekly races and draft-day context across all three Gauntlet Legions.',
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
      'week-1-preview.json',
    );
    const parsed = JSON.parse(await readFile(artifactPath, 'utf8')) as WeeklyPreviewReport;
    if (
      parsed.metadata?.season !== 2026 ||
      parsed.metadata?.week !== 1 ||
      parsed.leagues?.length !== 3
    ) {
      throw new Error('Invalid Week 1 preview artifact');
    }
    return parsed;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null;
    throw error;
  }
};

export default async function WeekOnePreviewPage() {
  const report = await loadPreview();
  return (
    <>
      <PageHeaderHero
        title="Week 1 Preview"
        crestSrc="/gauntlet_logo.svg"
        subtitle="Opening lines for all three 2026 Legions"
      />
      {report ? <WeeklyPreviewView report={report} /> : <WeeklyPreviewPending />}
    </>
  );
}
