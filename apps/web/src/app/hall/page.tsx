'use client';

import { Container, PageHeader } from '@gauntlet/ui';

export default function HallPage() {
  return (
    <Container className='py-8'>
      <PageHeader title='Hall of Fame & Shame' subtitle='Season and weekly superlatives' />
      <div className='rounded-md border border-border p-6 bg-card text-muted-foreground'>
        Superlatives will be listed here.
      </div>
    </Container>
  );
}
