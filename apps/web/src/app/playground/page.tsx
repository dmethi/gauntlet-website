'use client';

import { ChartContainer, ChartSkeleton, Container, PageHeader } from '@gauntlet/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Playground() {
  return (
    <Container className='py-8'>
      <PageHeader title='Playground' subtitle='Preview components and tokens' />

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className='flex gap-3'>
            <Button>Primary</Button>
            <Button variant='secondary'>Secondary</Button>
            <Button variant='outline'>Outline</Button>
          </CardContent>
        </Card>

        <ChartContainer title='Chart Skeleton' description='Loading state example'>
          <ChartSkeleton height={240} />
        </ChartContainer>
      </div>
    </Container>
  );
}
