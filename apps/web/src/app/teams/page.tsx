'use client';

import { Container, PageHeader } from '@gauntlet/ui';

export default function TeamsPage() {
  return (
    <Container className='py-8'>
      <PageHeader title='Teams' subtitle='Select a team to view details' />
      <div className='rounded-md border border-border p-6 bg-card text-muted-foreground'>
        Team list coming soon. Use the sidebar to jump directly to a team.
      </div>
    </Container>
  );
}
