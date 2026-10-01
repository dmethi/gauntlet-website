import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { loadWeeklyRecapTeamLabels } from './identity.server';
import { WeekOneRecapView } from './week-one-recap-view';
import { WEEK_THREE_RECAP } from './week-three-data';

export const WEEK_THREE_RECAP_METADATA: Metadata = {
  title: 'The Average Came Back. The Middle Did Not. — Week 3 Recap',
  description:
    'The 2026 Gauntlet Week 3 recap: four 140-point teams, five unbeaten teams, four winless teams, and the return of the opening favorite.',
};

export const WeekThreeRecapPage = async () => {
  const userId = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (await auth()).userId : null;
  const labels = await loadWeeklyRecapTeamLabels(WEEK_THREE_RECAP, Boolean(userId));

  return <WeekOneRecapView report={WEEK_THREE_RECAP} labels={labels} />;
};
