'use client';

import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartLegend } from '@gauntlet/ui';
import { useChartColors } from '@/lib/chart-colors';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

interface WeeklyAverage {
  week: number;
  averagePoints: number;
  matchupCount?: number;
  totalPoints?: number;
}

interface LeagueChartProps {
  data: WeeklyAverage[];
}

function useResponsiveContainerMobileFix() {
  useEffect(() => {
    // Recharts ResponsiveContainer sometimes measures width as 0 on initial mount
    // on mobile devices. Trigger a resize after mount and on orientation change.
    const trigger = () => window.dispatchEvent(new Event('resize'));
    const timeout = setTimeout(trigger, 0);
    window.addEventListener('orientationchange', trigger);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('orientationchange', trigger);
    };
  }, []);
}

function useWindowSizeKey(): number {
  // Fast, zero-deps window size subscription to trigger remount on size changes
  const subscribe = (cb: () => void) => {
    window.addEventListener('resize', cb);
    window.addEventListener('orientationchange', cb);
    return () => {
      window.removeEventListener('resize', cb);
      window.removeEventListener('orientationchange', cb);
    };
  };
  const getSnapshot = () => (typeof window === 'undefined' ? 0 : window.innerWidth);
  const getServerSnapshot = () => 0;
  const width = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => width, [width]);
}

function useElementSize<T extends HTMLElement>() {
  const elementRef = useRef<T | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('orientationchange', update);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return { elementRef, size } as const;
}

export function LeagueChart({ data }: LeagueChartProps) {
  useResponsiveContainerMobileFix();
  const { elementRef, size } = useElementSize<HTMLDivElement>();
  const chartColors = useChartColors();
  const key = useWindowSizeKey();
  const seriesColor = chartColors.primary;

  if (!data || data.length === 0) {
    return (
      <ChartContainer
        title='League Scoring Trends'
        description='Average points by week'
        actions={<ChartLegend items={[{ label: 'League Average', color: seriesColor }]} />}
      >
        <div className='h-64 sm:h-80 md:h-96 w-full min-w-0 flex items-center justify-center'>
          <p className='text-muted-foreground'>No data available</p>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title='League Scoring Trends'
      description='Average points by week'
      actions={<ChartLegend items={[{ label: 'League Average', color: seriesColor }]} />}
    >
      <div className='h-64 sm:h-80 md:h-96 w-full min-w-0'>
        <div ref={elementRef} className='h-full w-full'>
          {size.width > 0 && size.height > 0 ? (
            <LineChart key={key} width={size.width} height={size.height} data={data}>
              <CartesianGrid strokeDasharray='3 3' stroke={chartColors.grid} />
              <XAxis
                dataKey='week'
                type='number'
                domain={['dataMin', 'dataMax']}
                tickCount={data.length}
                stroke={chartColors.axis}
              />
              <YAxis domain={[0, 'auto']} tickCount={10} stroke={chartColors.axis} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Legend />
              <Line
                type='monotone'
                dataKey='averagePoints'
                stroke={seriesColor}
                name='League Average'
                dot={true}
                isAnimationActive={false}
              />
            </LineChart>
          ) : null}
        </div>
      </div>
    </ChartContainer>
  );
}
