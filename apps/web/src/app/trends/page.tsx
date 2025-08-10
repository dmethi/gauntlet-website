'use client';

import { Container, PageHeader } from '@gauntlet/ui';

export default function TrendsPage() {
  return (
    <Container className='py-8'>
      <PageHeader title='Trends' subtitle='Time-series and comparisons (coming soon)' />
      <div className='rounded-md border border-border p-6 bg-card text-muted-foreground'>
        Trend charts will render here.
      </div>
    </Container>
  );
}
