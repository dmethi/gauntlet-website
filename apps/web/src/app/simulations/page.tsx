'use client';

import { Container, PageHeader } from '@gauntlet/ui';

export default function SimulationsPage() {
  return (
    <Container className='py-8'>
      <PageHeader title='Simulations' subtitle='Matchup/season sims configuration (coming soon)' />
      <div className='rounded-md border border-border p-6 bg-card text-muted-foreground'>
        Form inputs and result summaries will go here.
      </div>
    </Container>
  );
}
