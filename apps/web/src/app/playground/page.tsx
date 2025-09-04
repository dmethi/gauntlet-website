'use client';

import { ChartContainer, ChartSkeleton, Container, PageHeader } from '@gauntlet/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GauntletLogo } from '@/components/gauntlet-logo';
import { colors as brandColors, dataVizColors } from '../../../../../brand/colors';

function Swatch({ label, hex }: { label?: string; hex: string }) {
  return (
    <div className='flex flex-col items-center gap-2'>
      {/* eslint-disable */}
      <div className='w-16 h-16 rounded-md border' style={{ background: hex }} />
      {/* eslint-enable */}
      <span className='text-[10px] text-muted-foreground text-center break-all'>
        {label ?? hex}
      </span>
    </div>
  );
}

export default function Playground() {
  return (
    <Container className='py-8'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <PageHeader title='Playground' subtitle='Preview components and tokens' />
        </div>
        <div className='hidden sm:flex items-center gap-3'>
          <GauntletLogo size='md' />
          <div className='text-right'>
            <div className='font-bold font-geizer tracking-widest'>THE GAUNTLET</div>
            <div className='text-xs text-muted-foreground font-avenir'>High-Stakes Fantasy</div>
          </div>
        </div>
      </div>

      {/* Ultra Large Logo Showcase */}
      <div className='mt-12 mb-12'>
        <Card>
          <CardHeader>
            <CardTitle>Ultra Large Logo</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col items-center justify-center py-24 bg-slate-900 rounded-b-lg'>
            <GauntletLogo size='xl' className='!w-80 !h-80 mb-12' />
            <div className='text-center'>
              <div className='font-bold font-geizer tracking-[0.2em] text-6xl mb-4 text-white'>
                THE GAUNTLET
              </div>
              <div className='text-2xl text-slate-300 font-avenir'>
                High-Stakes Fantasy Football
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

      <div className='mt-8 grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Core Brand Palette</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-3 gap-3'>
            {Object.entries(brandColors.core).map(([name, hex]) => (
              <Swatch key={name} label={`${name}`} hex={hex as string} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='font-geizer text-2xl tracking-wide'>GEIZER – Display</div>
            <div className='font-avenir text-base text-muted-foreground'>Avenir – Body</div>
          </CardContent>
        </Card>
      </div>

      <div className='mt-8 grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Team Categorical Palette</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-6 gap-3'>
            {brandColors.teamCategorical.map(hex => (
              <Swatch key={hex} hex={hex} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sequential – Warm</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-8 gap-3'>
            {brandColors.sequentialWarm.map(hex => (
              <Swatch key={hex} hex={hex} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className='mt-8 grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Diverging – RdYlGn</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-11 gap-2'>
            {brandColors.rdylgn.map(hex => (
              <Swatch key={hex} hex={hex} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diverging – Negative / Neutral / Positive</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-3 gap-3'>
            {Object.entries(brandColors.diverging).map(([name, hex]) => (
              <Swatch key={name} label={name} hex={hex as string} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className='mt-8 grid gap-6 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Sequential – Reds</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-9 gap-2'>
            {brandColors.sequential.reds.map(hex => (
              <Swatch key={hex} hex={hex} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sequential – Golds</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-9 gap-2'>
            {brandColors.sequential.golds.map(hex => (
              <Swatch key={hex} hex={hex} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sequential – Neutrals</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-9 gap-2'>
            {brandColors.sequential.neutrals.map(hex => (
              <Swatch key={hex} hex={hex} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className='mt-8'>
        <Card>
          <CardHeader>
            <CardTitle>Ranking Palette</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-4 gap-3'>
            {dataVizColors.ranking.map(hex => (
              <Swatch key={hex} hex={hex} />
            ))}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
