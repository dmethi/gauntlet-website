import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { loadWeekOneTeamLabels } from '@/features/weekly-recap/identity.server';
import { WEEK_ONE_RECAP } from '@/features/weekly-recap/week-one-data';
import { WeekOneRecapView } from '@/features/weekly-recap/week-one-recap-view';

export const metadata: Metadata = {
  title: 'The Scoreboard Was Lying — Week 1 Recap',
  description:
    'The 2026 Gauntlet Week 1 recap: 18 matchup stories organized by game flow, plus statistical outliers and receipts from last season.',
};

export const dynamic = 'force-dynamic';

export default async function WeekOneRecapPage() {
  const { userId } = await auth();
  const labels = await loadWeekOneTeamLabels(Boolean(userId));

  return <WeekOneRecapView report={WEEK_ONE_RECAP} labels={labels} />;
}
