'use client';

import { Container, PageHeader } from '@gauntlet/ui';

export default function DataFeedPage() {
  return (
    <Container className='py-8'>
      <PageHeader title='Data Feed' subtitle='API viewer and downloads (coming soon)' />
      <div className='rounded-md border border-border p-6 bg-card text-muted-foreground'>
        Explore available API endpoints and data downloads here.
      </div>
    </Container>
  );
}
