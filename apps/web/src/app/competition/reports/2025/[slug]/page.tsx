/**
 * Dynamic Weekly Recap Report Page - 2025 Season (slug-based)
 *
 * Handles URLs like /competition/reports/2025/week-5 by parsing the slug.
 */

// eslint-disable-next-line no-console
console.log('[2025/[slug]/page.tsx] MODULE LOADED - This file is being imported!');

import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { RecapReportView } from '@/components/reports/RecapReportView';
import { loadRecapReport } from '@/lib/reports/recap/utils/report-loader';

interface PageProps {
  params:
    | Promise<{
        slug: string;
      }>
    | {
        slug: string;
      };
}

const parseWeekFromSlug = (slug: string): string | null => {
  const match = slug.match(/^week-(\d+)$/);
  return match ? match[1] : null;
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;
  const week = parseWeekFromSlug(slug);

  if (!week) {
    return {
      title: 'Report Not Found - Gauntlet Fantasy Football',
      description: 'This report could not be found.',
    };
  }

  // Avoid calling loader in metadata to prevent module initialization quirks in dev
  // Title/description are safe without report content

  return {
    title: `Week ${week} Report — 2025 | Gauntlet Fantasy Football`,
    description: `Weekly recap report for Week ${week} of the 2025 Gauntlet Fantasy Football season. Matchup analysis, power rankings, and league standings.`,
    openGraph: {
      title: `Week ${week} Report — 2025`,
      description: `Weekly recap for Week ${week} of the 2025 Gauntlet season.`,
      type: 'article',
    },
  };
};

const RecapReportPage = async ({ params }: PageProps): Promise<React.JSX.Element> => {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;
  const week = parseWeekFromSlug(slug);

  if (!week) {
    notFound();
  }

  const report = await loadRecapReport(2025, week as string);
  if (!report) {
    notFound();
  }

  return <RecapReportView report={report} />;
};

export default RecapReportPage;
