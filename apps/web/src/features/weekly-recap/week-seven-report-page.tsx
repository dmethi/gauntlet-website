import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { loadWeeklyRecapTeamLabels } from './identity.server';
import { WeekOneRecapView } from './week-one-recap-view';
import { WEEK_SEVEN_RECAP } from './week-seven-data';
import { WeekSevenFieldNotes } from './week-seven-field-notes';

export const WEEK_SEVEN_RECAP_METADATA: Metadata = {
  title: `${WEEK_SEVEN_RECAP.headline} — Week 7 Recap`,
  description: WEEK_SEVEN_RECAP.subheadline,
};

export const WeekSevenRecapPage = async () => {
  const userId = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (await auth()).userId : null;
  const labels = await loadWeeklyRecapTeamLabels(WEEK_SEVEN_RECAP, Boolean(userId));
  return (
    <WeekOneRecapView
      report={WEEK_SEVEN_RECAP}
      labels={labels}
      leadSupplement={<WeekSevenFieldNotes labels={labels} />}
    />
  );
};
