'use client';

import { Container, PageHeader } from '@gauntlet/ui';

export default function AnalyticsPage() {
  return (
    <Container className='py-8'>
      <PageHeader title='Analytics' subtitle='Distributions, correlations, filters (coming soon)' />
      <div className='rounded-md border border-border p-6 bg-card text-muted-foreground'>
        Analytics charts and filters will appear here.
      </div>
    </Container>
  );
}
