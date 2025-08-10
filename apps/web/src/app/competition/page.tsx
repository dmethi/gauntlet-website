'use client';

import { Container, PageHeader } from '@gauntlet/ui';

export default function CompetitionPage() {
  return (
    <Container className='py-8'>
      <PageHeader title='Competition Dashboard' subtitle='Cross-league overview (coming soon)' />
      <div className='rounded-md border border-border p-6 bg-card text-muted-foreground'>
        This page will show cross-league rankings, previews, and weekly recaps.
      </div>
    </Container>
  );
}
