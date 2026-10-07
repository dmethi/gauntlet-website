import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { loadWeeklyRecapTeamLabels } from './identity.server';
import { WeekOneRecapView } from './week-one-recap-view';
import { WEEK_FOUR_RECAP } from './week-four-data';

export const WEEK_FOUR_RECAP_METADATA: Metadata = {
  title: 'The Week the Perfect Records Broke — Week 4 Recap',
  description:
    'The 2026 Gauntlet Week 4 recap: four unbeaten teams fall, six close finishes, and all 18 matchup results.',
};

export const WeekFourRecapPage = async () => {
  const userId = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (await auth()).userId : null;
  const labels = await loadWeeklyRecapTeamLabels(WEEK_FOUR_RECAP, Boolean(userId));

  return <WeekOneRecapView report={WEEK_FOUR_RECAP} labels={labels} />;
};
