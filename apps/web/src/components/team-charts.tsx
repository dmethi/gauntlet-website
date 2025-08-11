'use client';

import { colors } from '@/lib/colors';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

interface WeeklyData {
  week: number;
  points: number;
  expectedWins: number;
  luckRating: number;
  opponentPoints: number;
  leagueAverage?: number;
}

interface TeamChartsProps {
  weeklyData: WeeklyData[];
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

export function TeamPerformanceChart({
  weeklyData,
  teamColor = colors.core.regalGold,
}: TeamChartsProps & { teamColor?: string }) {
  useResponsiveContainerMobileFix();
  const { elementRef, size } = useElementSize<HTMLDivElement>();
  const key = useWindowSizeKey();
  if (!weeklyData || weeklyData.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div className='h-64 sm:h-80 md:h-96 w-full min-w-0'>
      <div ref={elementRef} className='h-full w-full'>
        {size.width > 0 && size.height > 0 ? (
          <LineChart key={key} width={size.width} height={size.height} data={weeklyData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='week'
              type='number'
              domain={['dataMin', 'dataMax']}
              tickCount={weeklyData.length}
            />
            <YAxis domain={[0, 'auto']} tickCount={10} />
            <Tooltip />
            <Legend />
            <Line
              type='monotone'
              dataKey='points'
              stroke={teamColor}
              name='Team Points'
              dot={true}
              isAnimationActive={false}
            />
            <Line
              type='monotone'
              dataKey='opponentPoints'
              stroke='#000000'
              name='Opponent Points'
              dot={true}
              isAnimationActive={false}
            />
            <Line
              type='monotone'
              dataKey='leagueAverage'
              stroke='#A1A8B3'
              name='League Average'
              dot={false}
              strokeDasharray='5 5'
              hide={!weeklyData.some(d => typeof d.leagueAverage === 'number')}
              isAnimationActive={false}
            />
          </LineChart>
        ) : null}
      </div>
    </div>
  );
}

export function TeamExpectedPerformanceChart({
  weeklyData,
  teamColor = colors.core.regalGold,
}: TeamChartsProps & { teamColor?: string }) {
  useResponsiveContainerMobileFix();
  const { elementRef, size } = useElementSize<HTMLDivElement>();
  const key = useWindowSizeKey();
  if (!weeklyData || weeklyData.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div className='h-64 sm:h-80 md:h-96 w-full min-w-0'>
      <div ref={elementRef} className='h-full w-full'>
        {size.width > 0 && size.height > 0 ? (
          <LineChart key={key} width={size.width} height={size.height} data={weeklyData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='week'
              type='number'
              domain={['dataMin', 'dataMax']}
              tickCount={weeklyData.length}
            />
            <YAxis domain={[-1, 1]} tickCount={3} />
            <Tooltip />
            <Legend />
            <Line
              type='monotone'
              dataKey='expectedWins'
              stroke={teamColor}
              name='Expected Wins'
              dot={true}
              isAnimationActive={false}
            />
            <Line
              type='monotone'
              dataKey='luckRating'
              stroke='#82ca9d'
              name='Luck Rating'
              dot={true}
              isAnimationActive={false}
            />
          </LineChart>
        ) : null}
      </div>
    </div>
  );
}

// Positional scoring bar chart (Team vs Opponent vs League Avg)
export interface PositionalScoringRow {
  position: string;
  team: number;
  opponent: number;
  leagueAverage: number;
}

export function TeamPositionalBarChart({
  data,
  teamColor = colors.core.regalGold,
}: {
  data: PositionalScoringRow[];
  teamColor?: string;
}) {
  useResponsiveContainerMobileFix();
  const { elementRef, size } = useElementSize<HTMLDivElement>();
  const key = useWindowSizeKey();
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }
  return (
    <div className='h-64 sm:h-80 md:h-96 w-full min-w-0'>
      <div ref={elementRef} className='h-full w-full'>
        {size.width > 0 && size.height > 0 ? (
          <BarChart key={key} width={size.width} height={size.height} data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='position' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey='team' name='Team' fill={teamColor} isAnimationActive={false} />
            <Bar dataKey='opponent' name='Opponent' fill={'#111111'} isAnimationActive={false} />
            <Bar
              dataKey='leagueAverage'
              name='League Average'
              fill={'#A1A8B3'}
              isAnimationActive={false}
            />
          </BarChart>
        ) : null}
      </div>
    </div>
  );
}

// Normalized radar (0..1) per position for the selected team
export interface PositionalNormalizedRow {
  position: string;
  value: number; // 0..1
}

export function TeamPositionalRadarChart({
  data,
  teamName = 'Team',
  teamColor = colors.core.regalGold,
  comparisons,
}: {
  data: PositionalNormalizedRow[];
  teamName?: string;
  teamColor?: string;
  comparisons?: Array<{ name: string; color: string; data: PositionalNormalizedRow[] }>;
}) {
  useResponsiveContainerMobileFix();
  const { elementRef, size } = useElementSize<HTMLDivElement>();
  const key = useWindowSizeKey();
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }
  return (
    <div className='h-64 sm:h-80 md:h-96 w-full min-w-0'>
      <div ref={elementRef} className='h-full w-full'>
        {size.width > 0 && size.height > 0 ? (
          <RadarChart
            key={key}
            data={data}
            outerRadius='70%'
            width={size.width}
            height={size.height}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey='position' />
            <PolarRadiusAxis domain={[0, 1]} tickCount={6} />
            <Tooltip />
            <Radar
              name={teamName}
              dataKey='value'
              stroke={teamColor}
              fill={teamColor}
              fillOpacity={0.3}
              isAnimationActive={false}
            />
            {comparisons?.map(series => {
              const merged = data.map(d => {
                const found = series.data.find(s => s.position === d.position)?.value ?? 0;
                return { ...d, [series.name]: found } as any;
              });
              return (
                <Radar
                  key={series.name}
                  name={series.name}
                  dataKey={series.name as any}
                  stroke={series.color}
                  fill={series.color}
                  fillOpacity={0.15}
                  // @ts-expect-error recharts accepts data prop on Radar when nested in RadarChart
                  data={merged}
                  isAnimationActive={false}
                />
              );
            })}
          </RadarChart>
        ) : null}
      </div>
    </div>
  );
}
