import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { loadWeeklyRecapTeamLabels } from './identity.server';
import { WeekOneRecapView } from './week-one-recap-view';
import { WEEK_TWO_RECAP } from './week-two-data';

export const WEEK_TWO_RECAP_METADATA: Metadata = {
  title: 'The Margin for Error Disappeared — Week 2 Recap',
  description:
    'The 2026 Gauntlet Week 2 recap: six close finishes, a league-wide scoring reversal, lineup heartbreak, and the early auction-value market.',
};

export const WeekTwoRecapPage = async () => {
  const userId = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (await auth()).userId : null;
  const labels = await loadWeeklyRecapTeamLabels(WEEK_TWO_RECAP, Boolean(userId));

  return <WeekOneRecapView report={WEEK_TWO_RECAP} labels={labels} />;
};
