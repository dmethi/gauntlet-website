/**
 * Dynamic Weekly Recap Report Page (slug-based)
 *
 * Handles URLs like /competition/reports/2025/week-5
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { RecapReportView } from '@/components/reports/RecapReportView';
import { getStaticReportParams, loadRecapReport } from '@/lib/reports/recap/utils/report-loader';

interface PageProps {
  params: Promise<
    | Promise<{
        season: string;
        slug: string;
      }>
    | {
        season: string;
        slug: string;
      }
  >;
}

const parseWeekFromSlug = (slug: string): string | null => {
  const match = slug.match(/^week-(\d+)$/);
  return match ? match[1] : null;
};

export const generateMetadata = async (props: PageProps): Promise<Metadata> => {
  const params = await props.params;
  const resolvedParams = params instanceof Promise ? await params : params;
  const { season, slug } = resolvedParams;
  const week = parseWeekFromSlug(slug);

  if (!week) {
    return {
      title: 'Report Not Found - Gauntlet Fantasy Football',
      description: 'This report could not be found.',
    };
  }

  const report = await loadRecapReport(season, week);
  if (!report) {
    return {
      title: 'Report Not Found - Gauntlet Fantasy Football',
      description: 'This report could not be found.',
    };
  }

  return {
    title: `Week ${week} Report — ${season} | Gauntlet Fantasy Football`,
    description: `Weekly recap report for Week ${week} of the ${season} Gauntlet Fantasy Football season. Matchup analysis, power rankings, and league standings.`,
    openGraph: {
      title: `Week ${week} Report — ${season}`,
      description: `Weekly recap for Week ${week} of the ${season} Gauntlet season.`,
      type: 'article',
      publishedTime: report.metadata.generatedAt,
    },
  };
};

export const generateStaticParams = async (): Promise<{ season: string; slug: string }[]> => {
  try {
    const params = await getStaticReportParams();
    return params.map(p => ({ season: p.season, slug: `week-${p.week}` }));
  } catch (error) {
    console.error('[Static Params] Error generating params:', error);
    return [];
  }
};

const RecapReportPage = async (props: PageProps) => {
  const params = await props.params;
  const resolvedParams = params instanceof Promise ? await params : params;
  const { season, slug } = resolvedParams;
  const week = parseWeekFromSlug(slug);

  if (!week) {
    notFound();
  }

  const report = await loadRecapReport(season, week as string);
  if (!report) {
    notFound();
  }

  return <RecapReportView report={report} />;
};

export default RecapReportPage;
