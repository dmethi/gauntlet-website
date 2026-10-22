import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { loadWeeklyRecapTeamLabels } from './identity.server';
import { WeekOneRecapView } from './week-one-recap-view';
import { WEEK_SIX_RECAP } from './week-six-data';
import { WeekSixRankings } from './week-six-rankings';

export const WEEK_SIX_RECAP_METADATA: Metadata = {
  title: `${WEEK_SIX_RECAP.headline} — Week 6 Recap`,
  description: WEEK_SIX_RECAP.subheadline,
};

export const WeekSixRecapPage = async () => {
  const userId = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (await auth()).userId : null;
  const labels = await loadWeeklyRecapTeamLabels(WEEK_SIX_RECAP, Boolean(userId));

  return (
    <WeekOneRecapView
      report={WEEK_SIX_RECAP}
      labels={labels}
      supplement={<WeekSixRankings labels={labels} />}
    />
  );
};
