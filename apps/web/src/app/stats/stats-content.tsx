'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PlainStatsDataset } from '@/lib/stats/compose';
import type { TrackedPosition } from '@/lib/stats/positions';
import { PlayerBreakdownRow } from '@/components/stats/PlayerBreakdown';
import { mean, median } from '@/lib/stats/medians';
import { rank } from '@/lib/stats/ranks';
import {
  getPositionSummaries,
  getTeamPositionalSummary,
  getTopPositionalAdvantages,
} from '@/lib/stats/positional-advantages';
import { colors } from '../../../../../brand/colors';
import * as d3 from 'd3';
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Transaction Analysis imports
import {
  Facts,
  buildFacts,
  firstOwnedWeek,
  lastOwnedWeek,
  playoffWeight,
} from '@/lib/transactions-facts';
import { CURRENT_LEAGUES } from '@/config/leagues';
import { TrendingUp, ArrowUpDown, Filter, Search, Eye, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StartSitEfficiencyTab from '@/components/stats/StartSitEfficiencyTab';

// Color helper functions from original transactions page
const RDYLGN = [
  '#a50026',
  '#d73027',
  '#f46d43',
  '#fdae61',
  '#fee08b',
  '#ffffbf',
  '#d9ef8b',
  '#a6d96a',
  '#66bd63',
  '#1a9850',
  '#006837',
];

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const mixHex = (hex1: string, hex2: string, t: number) => {
  const { r: r1, g: g1, b: b1 } = hexToRgb(hex1);
  const { r: r2, g: g2, b: b2 } = hexToRgb(hex2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const getDivergingBg = (normalized: number) => {
  const t = Math.max(-1, Math.min(1, normalized));
  const u = (t + 1) / 2;
  const n = RDYLGN.length - 1;
  const idx = Math.max(0, Math.min(n - 1, Math.floor(u * n)));
  const frac = u * n - idx;
  const from = RDYLGN[idx];
  const to = RDYLGN[idx + 1] ?? RDYLGN[idx];
  return mixHex(from, to, frac);
};

const getTextColorForBg = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return L > 0.5 ? '#111827' : '#ffffff';
};

interface StatsContentProps {
  dataset: PlainStatsDataset;
  searchParams: {
    team?: string;
    view?: 'team' | 'league' | 'schedule' | 'trends' | 'scatter' | 'transactions' | 'start-sit';
    week?: string;
  };
  leagues: Array<{ id: string; name: string; season: number }>;
}

// Helper functions for RdYlGn color mapping

function getPerformanceColor(value: number, isPositive: boolean): string {
  if (value === 0) return colors.rdylgn[5]; // neutral
  return isPositive ? colors.rdylgn[8] : colors.rdylgn[2]; // green or red
}

function getRankColor(rank: number, total: number): string {
  const percentile = (total - rank + 1) / total;
  if (percentile >= 0.9) return colors.rdylgn[9]; // top 10% - dark green
  if (percentile >= 0.75) return colors.rdylgn[8]; // top 25% - green
  if (percentile >= 0.5) return colors.rdylgn[7]; // top 50% - light green
  if (percentile >= 0.25) return colors.rdylgn[5]; // middle 50% - yellow
  if (percentile >= 0.1) return colors.rdylgn[3]; // bottom 25% - orange
  return colors.rdylgn[1]; // bottom 10% - red
}

function getTextColor(backgroundColor: string): string {
  // Determine if text should be white or black based on background brightness
  // For yellow/orange colors, use black text. For green/red, use white text.
  const lightColors = [colors.rdylgn[3], colors.rdylgn[4], colors.rdylgn[5], colors.rdylgn[6]]; // orange and yellow range
  return lightColors.includes(backgroundColor) ? '#000000' : '#ffffff';
}

// D3-based Ridge Plot Component
interface RidgePlotProps {
  data: any[];
  domain: [number, number];
  height: number;
  title?: string;
}

function D3RidgePlot({ data, domain, height, title }: RidgePlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTeam, setHoveredTeam] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(800);

  // Monitor container width for responsiveness
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Chart dimensions - responsive width
    const margin = { top: 20, right: 30, bottom: 60, left: 150 };
    const width = containerWidth - margin.left - margin.right;

    // Calculate height based on number of ridges to prevent bleeding
    const ridgeHeight = 25;
    const ridgeGap = 28;

    // For positional charts, use smaller dimensions and tighter spacing
    const isPositional =
      title?.includes('QB') ||
      title?.includes('RB') ||
      title?.includes('WR') ||
      title?.includes('TE') ||
      title?.includes('DEF');
    const adjustedRidgeGap = isPositional ? 24 : ridgeGap;

    // Calculate exact chart height needed
    const contentHeight = 45 + data.length * adjustedRidgeGap + 20; // start + ridges + bottom padding
    const chartHeight = contentHeight;

    // Create scales
    const xScale = d3.scaleLinear().domain(domain).range([0, width]);

    // Create container group
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add X-axis at the bottom of content area
    const axisY = contentHeight;
    const xAxis = d3.axisBottom(xScale).tickFormat(d => d.toString());

    g.append('g')
      .attr('transform', `translate(0, ${axisY})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Add axis label
    g.append('text')
      .attr('x', width / 2)
      .attr('y', axisY + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(title || 'Weekly Scores');

    // Render ridges
    data.forEach((team, idx) => {
      // Adjust baseY to prevent bleeding below axis for positional charts
      const isPositional =
        title?.includes('QB') ||
        title?.includes('RB') ||
        title?.includes('WR') ||
        title?.includes('TE') ||
        title?.includes('DEF');
      const adjustedRidgeHeight = isPositional ? 20 : ridgeHeight;
      const adjustedRidgeGap = isPositional ? 24 : ridgeGap;

      const baseY = 45 + idx * adjustedRidgeGap;
      const pairs = team.densityPairs as [number, number][];

      if (!pairs?.length) return;

      // Create ridge path
      const points = pairs.map(([x, y]: [number, number]) => [
        xScale(x),
        baseY - (y / team.maxDensity) * adjustedRidgeHeight,
      ]);

      // Build path string
      let pathData = `M ${points[0][0]} ${baseY}`;
      pathData += ` L ${points[0][0]} ${points[0][1]}`;

      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i][0]} ${points[i][1]}`;
      }

      pathData += ` L ${points[points.length - 1][0]} ${baseY} Z`;

      // Add ridge path
      const ridgeGroup = g.append('g');

      ridgeGroup
        .append('path')
        .attr('d', pathData)
        .attr('fill', colors.core.regalGold)
        .attr('fill-opacity', 0.35)
        .attr('stroke', colors.core.regalGold)
        .attr('stroke-width', 1);

      // Add median line
      const medianX = xScale(team.median);
      ridgeGroup
        .append('line')
        .attr('x1', medianX)
        .attr('y1', baseY)
        .attr('x2', medianX)
        .attr('y2', baseY - adjustedRidgeHeight)
        .attr('stroke', colors.core.charcoalSteel)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3 2');

      // Add team name
      g.append('text')
        .attr('x', -10)
        .attr('y', baseY - adjustedRidgeHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', colors.core.regalGold)
        .text(team.teamName);

      // Add invisible hover area
      ridgeGroup
        .append('rect')
        .attr('x', xScale(team.min) - 5)
        .attr('y', baseY - adjustedRidgeHeight - 5)
        .attr('width', xScale(team.max) - xScale(team.min) + 10)
        .attr('height', adjustedRidgeHeight + 10)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseenter', event => {
          setHoveredTeam(team);
          setMousePos({ x: event.pageX, y: event.pageY });
        })
        .on('mousemove', event => {
          setMousePos({ x: event.pageX, y: event.pageY });
        })
        .on('mouseleave', () => {
          setHoveredTeam(null);
        });
    });
  }, [data, domain, height, title, containerWidth]);

  // Calculate total SVG height based on content - more precise
  const isPositional =
    title?.includes('QB') ||
    title?.includes('RB') ||
    title?.includes('WR') ||
    title?.includes('TE') ||
    title?.includes('DEF');
  const gapSize = isPositional ? 24 : 28;

  // Precise height: margins + content + axis space
  const contentHeight = 45 + data.length * gapSize + 20; // ridge content
  const totalSvgHeight = 20 + contentHeight + 55; // top margin + content + axis space

  return (
    <div ref={containerRef} className='relative w-full'>
      <svg ref={svgRef} width='100%' height={totalSvgHeight}></svg>

      {/* Custom Tooltip */}
      {hoveredTeam && (
        <div
          className='absolute pointer-events-none z-10 rounded-lg border bg-background p-3 shadow-lg'
          style={{
            left: mousePos.x + 10,
            top: mousePos.y - 10,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className='mb-2'>
            <div className='font-semibold text-sm'>{hoveredTeam.teamName}</div>
            <div className='text-xs text-muted-foreground'>{hoveredTeam.leagueName}</div>
          </div>
          <div className='grid grid-cols-2 gap-4 text-xs'>
            <div>
              <div className='font-semibold'>Median Score</div>
              <div className='text-lg font-bold'>{hoveredTeam.median.toFixed(1)}</div>
              <div className='text-xs text-gray-400'>50th percentile</div>
            </div>
            <div>
              <div className='font-semibold'>Score Range</div>
              <div className='text-sm'>
                {hoveredTeam.min.toFixed(1)} - {hoveredTeam.max.toFixed(1)}
              </div>
              <div className='text-xs text-gray-400'>Range: {hoveredTeam.range.toFixed(1)}</div>
            </div>
            <div>
              <div className='font-semibold'>Games Played</div>
              <div className='text-lg font-bold'>{hoveredTeam.gamesPlayed}</div>
            </div>
            <div>
              <div className='font-semibold'>Consistency</div>
              <div className='text-sm'>
                <span className='font-semibold'>
                  {hoveredTeam.range < 20
                    ? '🎯 Narrow'
                    : hoveredTeam.range < 40
                      ? '📊 Medium'
                      : '🌊 Wide'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Transaction Analysis Types
type GradeTxn = {
  id: string;
  type: string;
  createdAt: string;
  rosterIds: number[];
  leagueId: string;
  leagueName: string;
  teamName?: string;
  faabCost: number; // FAAB spent on this transaction (0 for free agents/trades)
  rawScore: number; // Original VORP score before cost adjustment
  costPenalty: number; // FAAB cost penalty applied
  players: Array<{
    playerId: string;
    name: string;
    position: string;
    role: 'add' | 'drop';
    pre: { ppg: number; pps: number; total: number };
    post: { poPts: number };
    forYou?: {
      starts: number;
      points: number;
      weightedPoints: number;
    };
    afterDrop?: {
      selfHarm: number;
      oppHarm: number;
      selfHarmWeighted: number;
      oppHarmWeighted: number;
    };
    weeklyPoints: Array<{
      week: number;
      points: number;
      started: boolean;
      weight: number;
    }>;
  }>;
  score: number; // Final cost-adjusted score
  grade: string;
};

type RawTxn = {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  rosterIds: number[];
  adds?: Array<{
    rosterId: number;
    players?: Array<{ id: string; fullName: string; position: string }>;
  }>;
  drops?: Array<{
    rosterId: number;
    players?: Array<{ id: string; fullName: string; position: string }>;
  }>;
  settings?: {
    waiver_bid?: number; // FAAB cost for waiver transactions
  };
};

type TeamInfo = {
  rosterId: number;
  teamName: string;
  ownerName: string;
  leagueId: string;
  leagueName: string;
};

// Manager Rankings Component
function ManagerRankings({
  transactions,
  allTeams,
}: {
  transactions: GradeTxn[];
  allTeams: Map<string, TeamInfo>;
}) {
  const [selectedManager, setSelectedManager] = useState<string | null>(null);

  // Don't render if no team data is loaded yet
  if (allTeams.size === 0) {
    return (
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Manager Rankings by Net VORP
          </CardTitle>
          <CardDescription>Loading team data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-32'>
            <div className='text-muted-foreground'>Loading manager data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const managerStats = useMemo(() => {
    const stats = new Map<
      string,
      {
        teamName: string;
        netVORP: number;
        positiveTransactions: number;
        negativeTransactions: number;
        totalTransactions: number;
        transactions: GradeTxn[];
      }
    >();

    // Initialize ALL 24 managers with zero stats
    console.log(`[Manager Rankings] Initializing rankings for ${allTeams.size} total teams`);
    allTeams.forEach(team => {
      stats.set(team.teamName, {
        teamName: team.teamName,
        netVORP: 0,
        positiveTransactions: 0,
        negativeTransactions: 0,
        totalTransactions: 0,
        transactions: [],
      });
    });

    console.log(`[Manager Rankings] Initialized ${stats.size} manager entries`);
    console.log(`[Manager Rankings] Manager names:`, Array.from(stats.keys()).sort());

    // Now populate with actual transaction data
    transactions.forEach(txn => {
      if (!txn.teamName) return;

      const existing = stats.get(txn.teamName);
      if (!existing) return; // Skip if team not found (shouldn't happen)

      existing.netVORP += txn.score;
      existing.totalTransactions += 1;
      existing.transactions.push(txn);

      if (txn.score > 0) {
        existing.positiveTransactions += 1;
      } else if (txn.score < 0) {
        existing.negativeTransactions += 1;
      }
      // Zero scores are neutral - don't count as positive or negative
    });

    console.log(`[Manager Rankings] Final manager count: ${stats.size}`);
    console.log(
      `[Manager Rankings] Managers with transactions:`,
      Array.from(stats.values()).filter(m => m.totalTransactions > 0).length
    );
    console.log(
      `[Manager Rankings] Managers without transactions:`,
      Array.from(stats.values()).filter(m => m.totalTransactions === 0).length
    );

    return Array.from(stats.values()).sort((a, b) => b.netVORP - a.netVORP);
  }, [transactions, allTeams]);

  const selectedManagerData = selectedManager
    ? managerStats.find(m => m.teamName === selectedManager)
    : null;

  return (
    <>
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Manager Rankings by Net Cost-Adjusted VORP
          </CardTitle>
          <CardDescription>
            Transaction efficiency ranking based on Cost-Adjusted VORP (FAAB penalties applied) with
            playoff weighting. Click a manager to see their transaction history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left p-2 font-semibold'>Rank</th>
                  <th className='text-left p-2 font-semibold'>Manager</th>
                  <th className='text-right p-2 font-semibold'>Net Adj. VORP</th>
                  <th className='text-right p-2 font-semibold'>Positive</th>
                  <th className='text-right p-2 font-semibold'>Negative</th>
                  <th className='text-right p-2 font-semibold'>Total</th>
                  <th className='text-right p-2 font-semibold'>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {managerStats.map((manager, index) => (
                  <tr
                    key={manager.teamName}
                    className='border-b hover:bg-muted/50 cursor-pointer'
                    onClick={() => setSelectedManager(manager.teamName)}
                  >
                    <td className='p-2 font-medium'>#{index + 1}</td>
                    <td className='p-2 font-medium text-blue-600 hover:text-blue-800'>
                      {manager.teamName}
                    </td>
                    <td
                      className={`p-2 text-right font-mono font-bold ${manager.netVORP >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {manager.netVORP >= 0 ? '+' : ''}
                      {manager.netVORP.toFixed(1)}
                    </td>
                    <td className='p-2 text-right text-green-600 font-medium'>
                      {manager.positiveTransactions}
                    </td>
                    <td className='p-2 text-right text-red-600 font-medium'>
                      {manager.negativeTransactions}
                    </td>
                    <td className='p-2 text-right'>{manager.totalTransactions}</td>
                    <td className='p-2 text-right'>
                      {manager.totalTransactions > 0
                        ? `${((manager.positiveTransactions / manager.totalTransactions) * 100).toFixed(0)}%`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Manager Detail Modal */}
      {selectedManager && selectedManagerData && (
        <ManagerDetailModal
          manager={selectedManagerData}
          isOpen={!!selectedManager}
          onClose={() => setSelectedManager(null)}
        />
      )}
    </>
  );
}

// Manager Detail Modal Component
interface ManagerDetailModalProps {
  manager: {
    teamName: string;
    netVORP: number;
    positiveTransactions: number;
    negativeTransactions: number;
    totalTransactions: number;
    transactions: GradeTxn[];
  };
  isOpen: boolean;
  onClose: () => void;
}

function ManagerDetailModal({ manager, isOpen, onClose }: ManagerDetailModalProps) {
  if (!isOpen) return null;

  const positiveTransactions = manager.transactions
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score);
  const negativeTransactions = manager.transactions
    .filter(t => t.score < 0)
    .sort((a, b) => a.score - b.score);
  const neutralTransactions = manager.transactions
    .filter(t => t.score === 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div
      className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
      onClick={onClose}
    >
      <div
        className='bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden'
        onClick={e => e.stopPropagation()}
      >
        <div className='sticky top-0 bg-white dark:bg-gray-800 border-b p-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h2 className='text-2xl font-bold'>{manager.teamName}</h2>
            <div className='flex items-center gap-4'>
              <div
                className={`text-lg font-mono font-bold ${manager.netVORP >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                Net Adj. VORP: {manager.netVORP >= 0 ? '+' : ''}
                {manager.netVORP.toFixed(1)}
              </div>
              <div className='text-sm text-gray-500'>
                {manager.positiveTransactions}W - {manager.negativeTransactions}L
                {manager.totalTransactions > 0 && (
                  <span>
                    {' '}
                    ({((manager.positiveTransactions / manager.totalTransactions) * 100).toFixed(0)}
                    %)
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
          {manager.totalTransactions === 0 ? (
            <div className='text-center py-12'>
              <div className='text-2xl font-bold text-gray-400 mb-2'>No Transactions Yet</div>
              <div className='text-gray-500'>This manager hasn't made any moves this season.</div>
              <div className='text-sm text-gray-400 mt-2'>
                Net Adj. VORP: 0.0 • Activity Level: Inactive
              </div>
            </div>
          ) : (
            <div className='grid md:grid-cols-3 gap-6'>
              {/* Positive Transactions */}
              <div>
                <h3 className='text-lg font-semibold text-green-700 mb-4 flex items-center gap-2'>
                  <span className='bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium'>
                    +{manager.positiveTransactions}
                  </span>
                  Wins (Positive VORP)
                </h3>
                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {positiveTransactions.map(txn => (
                    <div
                      key={txn.id}
                      className='border border-green-200 rounded-lg p-3 bg-green-50/50'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <span className='bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium'>
                            {txn.grade}
                          </span>
                          <span className='text-xs text-gray-500 capitalize'>{txn.type}</span>
                        </div>
                        <div className='text-right'>
                          <div className='font-mono font-bold text-green-600'>
                            +{txn.score.toFixed(1)}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-4 text-sm'>
                        <div>
                          <span className='text-green-700'>
                            +
                            {txn.players
                              .filter(p => p.role === 'add')
                              .map(p => p.name)
                              .join(', ')}
                          </span>
                        </div>
                        {txn.players.some(p => p.role === 'drop') && (
                          <>
                            <span className='text-gray-500'>for</span>
                            <div>
                              <span className='text-red-600'>
                                -
                                {txn.players
                                  .filter(p => p.role === 'drop')
                                  .map(p => p.name)
                                  .join(', ')}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {positiveTransactions.length === 0 && (
                    <div className='text-center py-8 text-gray-500'>
                      No positive transactions yet
                    </div>
                  )}
                </div>
              </div>

              {/* Negative Transactions */}
              <div>
                <h3 className='text-lg font-semibold text-red-700 mb-4 flex items-center gap-2'>
                  <span className='bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium'>
                    -{manager.negativeTransactions}
                  </span>
                  Losses (Negative VORP)
                </h3>
                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {negativeTransactions.map(txn => (
                    <div key={txn.id} className='border border-red-200 rounded-lg p-3 bg-red-50/50'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <span className='bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium'>
                            {txn.grade}
                          </span>
                          <span className='text-xs text-gray-500 capitalize'>{txn.type}</span>
                        </div>
                        <div className='text-right'>
                          <div className='font-mono font-bold text-red-600'>
                            {txn.score.toFixed(1)}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-4 text-sm'>
                        <div>
                          <span className='text-green-700'>
                            +
                            {txn.players
                              .filter(p => p.role === 'add')
                              .map(p => p.name)
                              .join(', ')}
                          </span>
                        </div>
                        {txn.players.some(p => p.role === 'drop') && (
                          <>
                            <span className='text-gray-500'>for</span>
                            <div>
                              <span className='text-red-600'>
                                -
                                {txn.players
                                  .filter(p => p.role === 'drop')
                                  .map(p => p.name)
                                  .join(', ')}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {negativeTransactions.length === 0 && (
                    <div className='text-center py-8 text-gray-500'>
                      No negative transactions yet
                    </div>
                  )}
                </div>
              </div>

              {/* Neutral Transactions */}
              <div>
                <h3 className='text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                  <span className='bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium'>
                    ={neutralTransactions.length}
                  </span>
                  Neutral (Zero VORP)
                </h3>
                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {neutralTransactions.map(txn => (
                    <div
                      key={txn.id}
                      className='border border-gray-200 rounded-lg p-3 bg-gray-50/50'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <span className='bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium'>
                            {txn.grade}
                          </span>
                          <span className='text-xs text-gray-500 capitalize'>{txn.type}</span>
                        </div>
                        <div className='text-right'>
                          <div className='font-mono font-bold text-gray-600'>0.0</div>
                          <div className='text-xs text-gray-500'>
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-4 text-sm'>
                        <div>
                          <span className='text-green-700'>
                            +
                            {txn.players
                              .filter(p => p.role === 'add')
                              .map(p => p.name)
                              .join(', ')}
                          </span>
                        </div>
                        {txn.players.some(p => p.role === 'drop') && (
                          <>
                            <span className='text-gray-500'>for</span>
                            <div>
                              <span className='text-red-600'>
                                -
                                {txn.players
                                  .filter(p => p.role === 'drop')
                                  .map(p => p.name)
                                  .join(', ')}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {neutralTransactions.length === 0 && (
                    <div className='text-center py-8 text-gray-500'>
                      No neutral transactions yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Import the full working transaction analysis component logic
function TransactionAnalysis() {
  const [allData, setAllData] = useState<GradeTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Initializing...');
  const [selectedTxn, setSelectedTxn] = useState<GradeTxn | null>(null);
  const [teamsMap, setTeamsMap] = useState<Map<string, TeamInfo>>(new Map());
  const [currentNflWeek, setCurrentNflWeek] = useState(3);

  // Additional loading states for better UX
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  const [transactionsProcessed, setTransactionsProcessed] = useState(false);

  // Filter and sort states (like original)
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score' | 'grade' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort data like the original sidebar page (MOVED TO TOP TO AVOID HOOK ORDER ISSUES)
  const filteredData = useMemo(() => {
    let filtered = allData.filter(txn => {
      // Team filter
      if (teamFilter !== 'all' && txn.teamName !== teamFilter) return false;

      // League filter
      if (leagueFilter !== 'all' && txn.leagueName !== leagueFilter) return false;

      // Grade filter
      if (gradeFilter !== 'all' && txn.grade !== gradeFilter) return false;

      // Search filter
      if (
        searchTerm &&
        !txn.players.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
        return false;

      return true;
    });

    // Sort data
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'score') {
        comparison = a.score - b.score;
      } else if (sortBy === 'grade') {
        const gradeOrder = { 'A+': 6, A: 5, B: 4, C: 3, D: 2, F: 1 };
        comparison =
          (gradeOrder[a.grade as keyof typeof gradeOrder] || 0) -
          (gradeOrder[b.grade as keyof typeof gradeOrder] || 0);
      } else if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [allData, teamFilter, leagueFilter, gradeFilter, searchTerm, sortBy, sortOrder]);

  // Get unique teams and leagues for filters (MOVED TO TOP TO AVOID HOOK ORDER ISSUES)
  const uniqueTeams = useMemo(
    () => Array.from(new Set(allData.map(txn => txn.teamName).filter(Boolean))).sort(),
    [allData]
  );

  const uniqueLeagues = useMemo(
    () => Array.from(new Set(allData.map(txn => txn.leagueName).filter(Boolean))).sort(),
    [allData]
  );

  // Load transaction data using the full working implementation
  useEffect(() => {
    let cancelled = false;

    const loadTransactionData = async () => {
      try {
        setLoading(true);
        setLoadingStep('Getting current NFL week...');

        // Load current NFL week
        try {
          const nflRes = await fetch('/api/nfl-state');
          if (nflRes.ok) {
            const nflState = await nflRes.json();
            const currentWeek = nflState.week || 3;
            setCurrentNflWeek(currentWeek);
          }
        } catch (error) {
          console.log('NFL state error, using default week 3');
        }

        // Load team information
        setLoadingStep('Loading team information from both leagues...');
        const teamsData = new Map<string, TeamInfo>();
        try {
          const teamsRes = await fetch('/api/league/teams');
          if (teamsRes.ok) {
            const teamsResponse = await teamsRes.json();
            const teams = teamsResponse.teams || [];

            teams.forEach((team: any) => {
              const teamKey = `${team.leagueId}-${team.id}`;
              teamsData.set(teamKey, {
                rosterId: team.id,
                teamName: team.name,
                ownerName: team.owner,
                leagueId: team.leagueId,
                leagueName: team.leagueName,
              });
            });

            console.log(`[Team Loading] Loaded ${teams.length} teams total`);
            console.log(
              `[Team Loading] Teams by league:`,
              teams.reduce((acc: any, team: any) => {
                acc[team.leagueName] = (acc[team.leagueName] || 0) + 1;
                return acc;
              }, {})
            );
          }
        } catch (error) {
          console.error('Failed to load team data:', error);
        }

        setTeamsMap(teamsData);
        setTeamsLoaded(true);
        const allTransactions: GradeTxn[] = [];

        // Process each league using the full working implementation
        for (const league of CURRENT_LEAGUES) {
          if (cancelled) return;

          setLoadingStep(`Processing ${league.name} transactions and calculating VORP...`);

          try {
            // Fetch transactions
            const txnRes = await fetch(`/api/league/${league.id}/transactions`);
            if (!txnRes.ok) continue;
            const txnData = await txnRes.json();
            const transactions = txnData.data || [];

            // Build facts
            const facts = await buildFacts(
              league.id,
              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
            );

            // Grade transactions using the full working implementation
            const gradedTransactions = await computeTransactionGradesForStatsHub(
              transactions,
              facts,
              league.id,
              league.name,
              teamsData,
              currentNflWeek
            );

            allTransactions.push(...gradedTransactions);
          } catch (error) {
            console.error(`Failed to process ${league.name}:`, error);
          }
        }

        if (cancelled) return;

        // Assign letter grades using the working logic
        setLoadingStep('Calculating final transaction grades...');
        if (allTransactions.length > 0) {
          const vals = allTransactions.map(g => g.score);
          const n = vals.length || 1;
          const mean = vals.reduce((a, b) => a + b, 0) / n;
          const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1);
          const std = Math.sqrt(variance);

          allTransactions.forEach(g => {
            const z = std > 0 ? (g.score - mean) / std : 0;
            const pct = 50 + 40 * Math.tanh(z);
            g.grade =
              pct >= 88
                ? 'A+'
                : pct >= 82
                  ? 'A'
                  : pct >= 70
                    ? 'B'
                    : pct >= 55
                      ? 'C'
                      : pct >= 40
                        ? 'D'
                        : 'F';
          });
        }

        // Sort by score descending
        setLoadingStep('Finalizing transaction rankings...');
        allTransactions.sort((a, b) => b.score - a.score);
        setAllData(allTransactions);
        setTransactionsProcessed(true);
      } catch (error) {
        console.error('Failed to load transaction data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactionData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className='space-y-6'>
        {/* Loading placeholder for manager rankings */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Manager Rankings by Net VORP
            </CardTitle>
            <CardDescription>Loading transaction efficiency rankings...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center h-32'>
              <div className='flex items-center space-x-2'>
                <div className='w-4 h-4 bg-blue-600 rounded-full animate-pulse'></div>
                <div
                  className='w-4 h-4 bg-blue-600 rounded-full animate-pulse'
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className='w-4 h-4 bg-blue-600 rounded-full animate-pulse'
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading placeholder for transactions */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Transaction Analysis
            </CardTitle>
            <CardDescription>Loading transaction data with VORP calculations...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-center justify-center h-64 space-y-4'>
              <div className='flex items-center space-x-2'>
                <div className='w-6 h-6 bg-blue-600 rounded-full animate-pulse'></div>
                <div
                  className='w-6 h-6 bg-blue-600 rounded-full animate-pulse'
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className='w-6 h-6 bg-blue-600 rounded-full animate-pulse'
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
              <div className='text-center'>
                <div className='text-lg font-medium text-muted-foreground mb-1'>
                  Loading Transaction Analysis
                </div>
                <div className='text-sm text-muted-foreground'>{loadingStep}</div>
              </div>

              {/* Progress indicator */}
              <div className='w-full max-w-md bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse'
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render anything until ALL data is fully loaded
  if (loading || !teamsLoaded || !transactionsProcessed || allData.length === 0) {
    return (
      <div className='space-y-6'>
        {/* Loading placeholder for manager rankings */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Manager Rankings by Net VORP
            </CardTitle>
            <CardDescription>Loading transaction efficiency rankings...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center h-32'>
              <div className='flex items-center space-x-2'>
                <div className='w-4 h-4 bg-blue-600 rounded-full animate-pulse'></div>
                <div
                  className='w-4 h-4 bg-blue-600 rounded-full animate-pulse'
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className='w-4 h-4 bg-blue-600 rounded-full animate-pulse'
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading placeholder for transactions */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Transaction Analysis
            </CardTitle>
            <CardDescription>Loading transaction data with VORP calculations...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-center justify-center h-64 space-y-4'>
              <div className='flex items-center space-x-2'>
                <div className='w-6 h-6 bg-blue-600 rounded-full animate-pulse'></div>
                <div
                  className='w-6 h-6 bg-blue-600 rounded-full animate-pulse'
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className='w-6 h-6 bg-blue-600 rounded-full animate-pulse'
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
              <div className='text-center'>
                <div className='text-lg font-medium text-muted-foreground mb-1'>
                  Loading Transaction Analysis
                </div>
                <div className='text-sm text-muted-foreground'>{loadingStep}</div>
              </div>

              {/* Progress indicator */}
              <div className='w-full max-w-md bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse'
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <ManagerRankings transactions={allData} allTeams={teamsMap} />

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Transaction Analysis
              </CardTitle>
              <CardDescription>
                All transactions ranked by Cost-Adjusted VORP (Raw VORP - FAAB Penalty)
              </CardDescription>
            </div>

            {/* Stats Overview */}
            <div className='grid grid-cols-4 gap-4 text-center'>
              <div className='bg-green-50 p-3 rounded-lg'>
                <div className='text-2xl font-bold text-green-600'>
                  {filteredData.filter(t => t.score > 0).length}
                </div>
                <div className='text-xs text-green-700'>Positive</div>
              </div>
              <div className='bg-red-50 p-3 rounded-lg'>
                <div className='text-2xl font-bold text-red-600'>
                  {filteredData.filter(t => t.score < 0).length}
                </div>
                <div className='text-xs text-red-700'>Negative</div>
              </div>
              <div className='bg-gray-50 p-3 rounded-lg'>
                <div className='text-2xl font-bold text-gray-600'>
                  {filteredData.filter(t => t.score === 0).length}
                </div>
                <div className='text-xs text-gray-700'>Neutral</div>
              </div>
              <div className='bg-blue-50 p-3 rounded-lg'>
                <div className='text-2xl font-bold text-blue-600'>{filteredData.length}</div>
                <div className='text-xs text-blue-700'>Total</div>
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
            {/* Team Filter */}
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger>
                <SelectValue placeholder='All Teams' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Teams</SelectItem>
                {uniqueTeams.map(team => (
                  <SelectItem key={team} value={team || ''}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* League Filter */}
            <Select value={leagueFilter} onValueChange={setLeagueFilter}>
              <SelectTrigger>
                <SelectValue placeholder='All Leagues' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Leagues</SelectItem>
                {uniqueLeagues.map(league => (
                  <SelectItem key={league} value={league || ''}>
                    {league}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Grade Filter */}
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue placeholder='All Grades' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Grades</SelectItem>
                <SelectItem value='A+'>A+</SelectItem>
                <SelectItem value='A'>A</SelectItem>
                <SelectItem value='B'>B</SelectItem>
                <SelectItem value='C'>C</SelectItem>
                <SelectItem value='D'>D</SelectItem>
                <SelectItem value='F'>F</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <input
                type='text'
                placeholder='Search players...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Sort Controls */}
          <div className='flex items-center gap-4 mt-4'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-600'>Sort by:</span>
              <Select value={sortBy} onValueChange={value => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='score'>Score</SelectItem>
                  <SelectItem value='grade'>Grade</SelectItem>
                  <SelectItem value='date'>Date</SelectItem>
                </SelectContent>
              </Select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className='p-2 hover:bg-gray-100 rounded-md'
              >
                <ArrowUpDown className='h-4 w-4' />
              </button>
            </div>

            <div className='text-sm text-gray-500'>
              Showing {filteredData.length} of {allData.length} transactions
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredData.length === 0 ? (
            <div className='text-center py-12'>
              <div className='text-muted-foreground'>No transactions match your filters</div>
              <button
                onClick={() => {
                  setTeamFilter('all');
                  setLeagueFilter('all');
                  setGradeFilter('all');
                  setSearchTerm('');
                }}
                className='mt-2 text-blue-600 hover:text-blue-800 text-sm'
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className='overflow-x-auto rounded-md border border-border bg-card'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead className='text-right'>FAAB</TableHead>
                    <TableHead className='text-right'>Raw VORP</TableHead>
                    <TableHead className='text-right'>Adjusted VORP</TableHead>
                    <TableHead className='text-right'>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map(txn => {
                    const scoreRange = Math.max(...allData.map(t => Math.abs(t.score))) || 1;
                    return (
                      <TableRow
                        key={txn.id}
                        className='cursor-pointer hover:bg-muted/50'
                        onClick={() => setSelectedTxn(txn)}
                      >
                        <TableCell>{new Date(txn.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <div className='font-medium'>{txn.teamName}</div>
                            <div className='text-xs text-muted-foreground'>{txn.leagueName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='capitalize'>{txn.type.replace('_', ' ')}</div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col gap-1'>
                            {txn.players.map(p => (
                              <div key={p.playerId} className='text-sm text-muted-foreground'>
                                {p.name} ({p.position}) • {p.role === 'add' ? 'Added' : 'Dropped'}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          {txn.faabCost > 0 ? (
                            <div className='flex flex-col items-end'>
                              <div className='font-mono font-medium'>${txn.faabCost}</div>
                              <div className='text-xs text-muted-foreground'>
                                {((txn.faabCost / 200) * 100).toFixed(0)}%
                              </div>
                            </div>
                          ) : (
                            <div className='text-xs text-green-600 font-medium'>FREE</div>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          {txn.rawScore !== undefined ? (
                            <div className='flex flex-col items-end'>
                              <div
                                className={`font-mono font-medium ${
                                  txn.rawScore >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {txn.rawScore >= 0 ? '+' : ''}
                                {txn.rawScore.toFixed(1)}
                              </div>
                              {txn.faabCost === 0 && (
                                <div className='text-xs text-muted-foreground'>No Cost</div>
                              )}
                            </div>
                          ) : (
                            <span className='text-muted-foreground text-sm'>N/A</span>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          {(() => {
                            const bg = getDivergingBg(txn.score / scoreRange);
                            const fg = getTextColorForBg(bg);
                            return (
                              <div className='flex flex-col items-end'>
                                <span
                                  className='px-2 py-0.5 rounded font-mono font-medium'
                                  style={{ backgroundColor: bg, color: fg }}
                                >
                                  {txn.score.toFixed(1)}
                                </span>
                                {txn.faabCost > 0 && (
                                  <div className='text-xs text-red-400 font-mono'>
                                    -{txn.costPenalty?.toFixed(1) || '0.0'}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 px-2'
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedTxn(txn);
                            }}
                          >
                            <Badge>{txn.grade}</Badge>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Original Dialog Modal */}
      <Dialog open={!!selectedTxn} onOpenChange={open => !open && setSelectedTxn(null)}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTxn && (
            <div className='text-sm space-y-4'>
              <div className='flex items-center gap-2'>
                <Badge>{selectedTxn.grade}</Badge>
                {(() => {
                  const scoreRange = Math.max(...allData.map(t => Math.abs(t.score))) || 1;
                  const bg = getDivergingBg(selectedTxn.score / scoreRange);
                  const fg = getTextColorForBg(bg);
                  return (
                    <span className='px-1.5 rounded' style={{ backgroundColor: bg, color: fg }}>
                      Score: {selectedTxn.score.toFixed(2)}
                    </span>
                  );
                })()}
              </div>

              <div className='text-muted-foreground'>
                <div className='flex flex-col gap-1'>
                  <div>
                    {new Date(selectedTxn.createdAt).toLocaleString()} •{' '}
                    {selectedTxn.type.replace('_', ' ')}
                  </div>
                  <div className='text-xs'>
                    Team: {selectedTxn.teamName} • League: {selectedTxn.leagueName}
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className='bg-muted/30 rounded-lg p-3 space-y-2'>
                <h3 className='font-semibold text-base'>Score Breakdown</h3>
                {(() => {
                  const contribution = selectedTxn.players
                    .filter(p => p.role === 'add' && p.forYou)
                    .reduce((s, p) => s + (p.forYou?.weightedPoints || 0), 0);
                  const selfHarm = selectedTxn.players
                    .filter(p => p.role === 'drop' && p.afterDrop)
                    .reduce((s, p) => s + (p.afterDrop?.selfHarmWeighted || 0), 0);
                  const oppHarm = selectedTxn.players
                    .filter(p => p.role === 'drop' && p.afterDrop)
                    .reduce((s, p) => s + (p.afterDrop?.oppHarmWeighted || 0), 0);
                  const totalPenalties = selfHarm + oppHarm;

                  return (
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-3 text-xs'>
                      <div className='text-center'>
                        <div className='font-medium text-green-600'>Contribution</div>
                        <div className='text-lg font-bold'>+{contribution.toFixed(1)}</div>
                        <div className='text-muted-foreground'>
                          Playoff-weighted VORP when started
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='font-medium text-red-600'>Self-Harm</div>
                        <div className='text-lg font-bold'>-{selfHarm.toFixed(1)}</div>
                        <div className='text-muted-foreground'>
                          Points lost vs your best starter
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='font-medium text-orange-600'>Opponent-Harm</div>
                        <div className='text-lg font-bold'>-{oppHarm.toFixed(1)}</div>
                        <div className='text-muted-foreground'>
                          Points above replacement by any opponent
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='font-medium text-blue-600'>Net Score</div>
                        <div
                          className={`text-lg font-bold ${selectedTxn.score >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {selectedTxn.score >= 0 ? '+' : ''}
                          {selectedTxn.score.toFixed(1)}
                        </div>
                        <div className='text-muted-foreground'>
                          {contribution.toFixed(1)} - {totalPenalties.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Players Section */}
              <div className='space-y-4'>
                {selectedTxn.players.map(player => (
                  <div
                    key={player.playerId}
                    className={`rounded-lg p-3 border ${
                      player.role === 'add'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <div>
                        <h4 className='font-semibold'>{player.name}</h4>
                        <div className='text-sm text-muted-foreground'>
                          {player.position} • {player.role === 'add' ? 'Added' : 'Dropped'}
                        </div>
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          player.role === 'add' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {player.role === 'add'
                          ? `+${player.forYou?.weightedPoints.toFixed(1) || '0.0'}`
                          : `-${player.afterDrop?.oppHarmWeighted.toFixed(1) || '0.0'}`}
                      </div>
                    </div>

                    {player.role === 'add' && player.forYou && (
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <div className='font-medium'>Times Started</div>
                          <div className='text-lg'>{player.forYou.starts}</div>
                        </div>
                        <div>
                          <div className='font-medium'>Total Points</div>
                          <div className='text-lg'>{player.forYou.points.toFixed(1)}</div>
                        </div>
                      </div>
                    )}

                    {player.role === 'drop' && player.afterDrop && (
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <div className='font-medium'>Self-Harm</div>
                          <div className='text-lg'>{player.afterDrop.selfHarm.toFixed(1)}</div>
                        </div>
                        <div>
                          <div className='font-medium'>Opponent-Harm</div>
                          <div className='text-lg'>{player.afterDrop.oppHarm.toFixed(1)}</div>
                        </div>
                      </div>
                    )}

                    {/* Weekly Performance */}
                    <div className='mt-3'>
                      <h5 className='font-medium mb-2'>Weekly Performance</h5>
                      <div className='flex gap-2 overflow-x-auto'>
                        {player.weeklyPoints
                          .filter(w => w.week <= currentNflWeek)
                          .map(week => (
                            <div
                              key={week.week}
                              className={`min-w-16 text-center p-2 rounded text-sm ${
                                week.started
                                  ? player.role === 'add'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              <div className='font-semibold'>W{week.week}</div>
                              <div className='font-bold'>{week.points.toFixed(1)}</div>
                              {week.started && <div className='text-xs'>✓</div>}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Full working transaction grading implementation from sidebar page
async function computeTransactionGradesForStatsHub(
  transactions: RawTxn[],
  facts: Facts,
  leagueId: string,
  leagueName: string,
  teamsMap: Map<string, TeamInfo>,
  currentNflWeek: number = 3
): Promise<GradeTxn[]> {
  if (transactions.length === 0) {
    return [];
  }

  const f = facts;
  const graded: GradeTxn[] = [];

  // Build player info lookup
  const idToPlayer = new Map<string, { name: string; position: string }>();
  transactions.forEach(t => {
    [t.adds, t.drops].forEach(group => {
      if (group && Array.isArray(group)) {
        group.forEach(item => {
          item.players?.forEach(p => {
            idToPlayer.set(p.id, { name: p.fullName || p.id, position: p.position || 'UNK' });
          });
        });
      }
    });
  });

  // Week-specific replacement levels (calculated earlier)
  const REPLACEMENT_LEVELS = {
    1: { QB: 20.1, RB: 7.4, WR: 9.1, TE: 9.1, DEF: 9.8 },
    2: { QB: 19.9, RB: 8.6, WR: 11.4, TE: 7.3, DEF: 10.6 },
    3: { QB: 14.6, RB: 7.5, WR: 10.7, TE: 8.1, DEF: 13.3 },
  } as const;

  // FAAB Cost Configuration (Based on sensitivity analysis)
  const FAAB_COST_COEFFICIENT = 0.25; // Optimal: 4% of budget = 1 VORP penalty (Moderate weighting)
  const LEAGUE_FAAB_BUDGET = 200; // Standard FAAB budget for this league

  const replacementLevels = new Map<string, number>();
  [1, 2, 3].forEach(week => {
    const levels = REPLACEMENT_LEVELS[week as keyof typeof REPLACEMENT_LEVELS];
    Object.entries(levels).forEach(([position, level]) => {
      replacementLevels.set(`${week}:${position}`, level);
      if (position === 'DEF') {
        replacementLevels.set(`${week}:DST`, level); // Handle DST alias
      }
    });
    // Add FLEX as average of RB+WR
    const flexLevel = (levels.RB + levels.WR) / 2;
    replacementLevels.set(`${week}:FLEX`, flexLevel);
  });

  // Date to NFL week mapping (2025 season)
  const getTransactionWeek = (iso: string): number => {
    const date = new Date(iso);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // For 2025 season (current season)
    // Precise NFL week boundaries for accurate transaction timing
    if (year === 2025) {
      if (month <= 8) return 0; // Preseason (Jan-Aug 2025)

      if (month === 9) {
        // September 2025 - be precise about week boundaries
        if (date.getDate() <= 5) return 0; // Before Week 1 (preseason)
        if (date.getDate() <= 9) return 1; // Week 1 (Sept 5-9)
        if (date.getDate() <= 16) return 2; // Week 2 (Sept 12-16)
        if (date.getDate() <= 23) return 3; // Week 3 (Sept 19-23)
        return 4; // Week 4 (Sept 26-30)
      }

      if (month === 10) return 6; // October 2025 = Week 5-8
      if (month === 11) return 10; // November 2025 = Week 9-13
      if (month === 12) return 15; // December 2025 = Week 14-18
      return 1; // Default to early season
    }

    // For 2024 (preseason transactions)
    if (year === 2024) {
      return 0; // All 2024 dates are preseason for 2025 season
    }

    // Default fallback
    return 0;
  };

  // Helper to calculate VORP for a player in a specific week
  const calculateVORP = (playerId: string, week: number): number => {
    const playerInfo = idToPlayer.get(playerId);
    const position = playerInfo?.position?.toUpperCase() || 'FLEX';
    const points = f.playerWeekPoints.get(`${week}:${playerId}`) || 0;
    const replacementLevel = replacementLevels.get(`${week}:${position}`) || 0;
    return points - replacementLevel;
  };

  // Only count completed weeks (1-3 currently)
  const completedWeeks = [1, 2, 3].filter(w => w <= currentNflWeek);

  // Helper function to process each roster's perspective in a trade
  async function processTransactionForRoster(
    t: RawTxn,
    rosterId: number,
    createdAt: string,
    startWeek: number,
    leagueId: string,
    leagueName: string,
    teamsMap: Map<string, TeamInfo>,
    faabCost: number = 0
  ): Promise<GradeTxn> {
    const playersOut: GradeTxn['players'] = [];
    let totalAddedVORP = 0;
    let totalDroppedVORP = 0;

    // For THIS roster, get their specific adds (what they received in the trade)
    const addPairs: Array<{ rosterId: number; playerId: string }> = [];
    if (t.adds && Array.isArray(t.adds)) {
      t.adds
        .filter(a => a.rosterId === rosterId) // Only adds for this specific roster
        .forEach(a => a.players?.forEach(p => addPairs.push({ rosterId, playerId: p.id })));
    }

    // For THIS roster, get their specific drops (what they gave up in the trade)
    const dropPairs: Array<{ rosterId: number; playerId: string }> = [];
    if (t.drops && Array.isArray(t.drops)) {
      t.drops
        .filter(d => d.rosterId === rosterId) // Only drops for this specific roster
        .forEach(d => d.players?.forEach(p => dropPairs.push({ rosterId, playerId: p.id })));
    }

    console.log(
      `[Trade Split] Roster ${rosterId}: +${addPairs.length} adds, -${dropPairs.length} drops`
    );

    // Process added players (same logic as before)
    for (const { rosterId: rId, playerId } of addPairs) {
      const playerInfo = idToPlayer.get(playerId);
      let playerVORP = 0;
      let starts = 0;
      let totalPoints = 0;

      const weeklyPoints: Array<{
        week: number;
        points: number;
        started: boolean;
        weight: number;
      }> = [];

      for (const week of completedWeeks) {
        if (week < startWeek) continue;

        const starters = f.weekRosterStarters.get(`${week}:${rId}`);
        const points = f.playerWeekPoints.get(`${week}:${playerId}`) || 0;
        const started = starters?.has(playerId) || false;

        console.log(
          `[Add Debug] ${playerInfo?.name} W${week}: ${points}pts, started=${started} by roster ${rId}`
        );

        if (started) {
          const vorp = calculateVORP(playerId, week);
          playerVORP += playoffWeight(week) * vorp;
          starts++;
          totalPoints += points;
        }

        weeklyPoints.push({
          week,
          points,
          started,
          weight: playoffWeight(week),
        });
      }

      totalAddedVORP += playerVORP;

      playersOut.push({
        playerId,
        name: playerInfo?.name || playerId,
        position: playerInfo?.position || 'UNK',
        role: 'add' as const,
        pre: { ppg: 0, pps: 0, total: 0 },
        post: { poPts: 0 },
        forYou: {
          starts,
          points: totalPoints,
          weightedPoints: playerVORP,
        },
        weeklyPoints,
      });
    }

    // Process dropped players (same logic as before)
    for (const { rosterId: rId, playerId } of dropPairs) {
      const playerInfo = idToPlayer.get(playerId);
      let playerVORP = 0;

      const weeklyPoints: Array<{
        week: number;
        points: number;
        started: boolean;
        weight: number;
      }> = [];

      for (const week of completedWeeks) {
        if (week < startWeek) {
          console.log(
            `[Drop Debug] ${playerInfo?.name} W${week}: SKIPPED (before transaction week ${startWeek})`
          );
          continue;
        }

        const points = f.playerWeekPoints.get(`${week}:${playerId}`) || 0;
        let started = false;
        let starterRosterId = null;

        for (const [rosterKey, starters] of f.weekRosterStarters.entries()) {
          const [weekStr, rosterIdStr] = rosterKey.split(':');
          if (Number(weekStr) === week && starters.has(playerId)) {
            started = true;
            starterRosterId = Number(rosterIdStr);
            break;
          }
        }

        if (started) {
          const vorp = calculateVORP(playerId, week);
          console.log(
            `[Drop Debug] ${playerInfo?.name} W${week}: ${points}pts, VORP=${vorp.toFixed(1)}, started by roster ${starterRosterId}, transaction week was ${startWeek}`
          );
          playerVORP += playoffWeight(week) * vorp;
        } else {
          console.log(
            `[Drop Debug] ${playerInfo?.name} W${week}: ${points}pts, NOT STARTED (transaction week was ${startWeek})`
          );
        }

        weeklyPoints.push({
          week,
          points,
          started,
          weight: playoffWeight(week),
        });
      }

      totalDroppedVORP += playerVORP;

      playersOut.push({
        playerId,
        name: playerInfo?.name || playerId,
        position: playerInfo?.position || 'UNK',
        role: 'drop' as const,
        pre: { ppg: 0, pps: 0, total: 0 },
        post: { poPts: 0 },
        afterDrop: {
          selfHarm: 0,
          oppHarm: playerVORP,
          selfHarmWeighted: 0,
          oppHarmWeighted: playerVORP,
        },
        weeklyPoints,
      });
    }

    // Calculate raw VORP score (before cost adjustment)
    const rawScore = totalAddedVORP - totalDroppedVORP;

    // Calculate FAAB cost penalty using optimal weighting from sensitivity analysis
    const faabPercentage = (faabCost / LEAGUE_FAAB_BUDGET) * 100;
    const costPenalty = faabPercentage * FAAB_COST_COEFFICIENT;

    // Final cost-adjusted score
    const score = rawScore - costPenalty;

    console.log(
      `[FAAB Cost Debug] Transaction ${t.id}-${rosterId}: $${faabCost} (${faabPercentage.toFixed(1)}%) | Raw: ${rawScore.toFixed(1)} → Adj: ${score.toFixed(1)} | Penalty: ${costPenalty.toFixed(1)}`
    );

    const teamKey = `${leagueId}-${rosterId}`;
    const teamInfo = teamsMap.get(teamKey);

    return {
      id: `${t.id}-${rosterId}`, // Make unique ID for each roster's perspective
      type: t.type,
      createdAt,
      rosterIds: [rosterId], // Only this roster
      leagueId,
      leagueName,
      teamName: teamInfo?.teamName,
      faabCost, // FAAB spent on this transaction
      rawScore, // Original VORP before cost adjustment
      costPenalty, // FAAB penalty applied
      players: playersOut,
      score, // Final cost-adjusted score
      grade: 'N/A', // Will be calculated later
    };
  }

  // Process each completed transaction
  const validTransactions = transactions.filter(t => t.status === 'complete');

  for (const t of validTransactions) {
    // Parse transaction date - API now returns proper Sleeper dates
    const createdAt =
      typeof t.createdAt === 'string' ? t.createdAt : new Date(t.createdAt).toISOString();
    const transactionWeek = getTransactionWeek(createdAt);

    // Extract FAAB cost from transaction settings
    const faabCost = t.settings?.waiver_bid || 0; // Default to 0 for free agents/trades

    console.log(`[Date Debug] Transaction ${t.id}: ${createdAt} (Week ${transactionWeek})`);
    console.log(`[FAAB Debug] Transaction ${t.id}: FAAB cost = $${faabCost}, Type = ${t.type}`);

    // Start counting from Week 1 for preseason transactions, otherwise from transaction week
    const startWeek = Math.max(transactionWeek, 1);

    console.log(
      `[Transaction Debug] ID ${t.id}: Date ${createdAt}, Week ${transactionWeek}, Start Week ${startWeek}`
    );

    // 🔄 TRADE PROCESSING: Create separate transactions for each owner in a trade
    if (t.type === 'trade') {
      // Identify all unique roster IDs involved in this trade
      const uniqueRosterIds = new Set([
        ...(t.adds?.map(a => a.rosterId) || []),
        ...(t.drops?.map(d => d.rosterId) || []),
      ]);

      console.log(`[Trade Split] Transaction ${t.id}: ${uniqueRosterIds.size} owners involved`);
      console.log(`[Trade Split] Unique roster IDs:`, Array.from(uniqueRosterIds));

      // Create separate transaction for each owner
      for (const rosterId of uniqueRosterIds) {
        const gradedTransaction = await processTransactionForRoster(
          t,
          rosterId,
          createdAt,
          startWeek,
          leagueId,
          leagueName,
          teamsMap,
          faabCost // Pass FAAB cost (0 for trades)
        );
        graded.push(gradedTransaction);
      }

      // Skip the regular processing for trades - we've handled it above
      continue;
    }

    // Regular (non-trade) transaction processing - use the same helper for consistency
    const rosterId = t.rosterIds?.[0];
    if (rosterId) {
      const gradedTransaction = await processTransactionForRoster(
        t,
        rosterId,
        createdAt,
        startWeek,
        leagueId,
        leagueName,
        teamsMap,
        faabCost // Pass FAAB cost for waiver/free agent transactions
      );
      graded.push(gradedTransaction);
    }
  }

  return graded;
}

// Transaction Detail Modal Component
interface TransactionDetailModalProps {
  transaction: GradeTxn;
  isOpen: boolean;
  onClose: () => void;
  currentNflWeek: number;
}

function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  currentNflWeek,
}: TransactionDetailModalProps) {
  if (!isOpen) return null;

  const addedPlayers = transaction.players.filter(p => p.role === 'add');
  const droppedPlayers = transaction.players.filter(p => p.role === 'drop');

  return (
    <div
      className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'
      onClick={onClose}
    >
      <div
        className='bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='sticky top-0 bg-white dark:bg-gray-800 border-b p-6 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                transaction.grade === 'A+'
                  ? 'bg-green-500 text-white'
                  : transaction.grade === 'A'
                    ? 'bg-green-400 text-white'
                    : transaction.grade === 'B'
                      ? 'bg-blue-400 text-white'
                      : transaction.grade === 'C'
                        ? 'bg-yellow-400 text-white'
                        : transaction.grade === 'D'
                          ? 'bg-orange-400 text-white'
                          : 'bg-red-500 text-white'
              }`}
            >
              {transaction.grade}
            </span>

            <div>
              <h2 className='text-2xl font-bold'>{transaction.teamName}</h2>
              <div className='flex items-center gap-2 text-sm text-gray-500'>
                <span className='capitalize'>{transaction.type}</span>
                <span>•</span>
                <span>{transaction.leagueName}</span>
                <span>•</span>
                <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className='ml-auto text-right'>
              <div
                className={`text-3xl font-bold font-mono ${
                  transaction.score >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.score >= 0 ? '+' : ''}
                {transaction.score.toFixed(1)}
              </div>
              <div className='text-sm text-gray-500'>Cost-Adjusted VORP</div>

              {/* Show FAAB cost and penalty if applicable */}
              {transaction.faabCost > 0 && (
                <div className='mt-2 text-xs text-gray-400'>
                  <div>
                    Raw VORP: {transaction.rawScore >= 0 ? '+' : ''}
                    {transaction.rawScore.toFixed(1)}
                  </div>
                  <div>
                    FAAB Cost: ${transaction.faabCost} (
                    {((transaction.faabCost / 200) * 100).toFixed(1)}%)
                  </div>
                  <div className='text-red-400'>
                    Cost Penalty: -{transaction.costPenalty.toFixed(1)}
                  </div>
                </div>
              )}

              {transaction.faabCost === 0 && (
                <div className='mt-1 text-xs text-green-400'>Free Agent / Trade</div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
          <div className='space-y-8'>
            {/* Added Players Section */}
            {addedPlayers.length > 0 && (
              <div>
                <h3 className='text-xl font-bold text-green-700 mb-4 flex items-center gap-2'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  Added Players ({addedPlayers.length})
                </h3>
                <div className='grid gap-4'>
                  {addedPlayers.map(player => (
                    <div
                      key={player.playerId}
                      className='border border-green-200 rounded-lg p-4 bg-green-50/50'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h4 className='font-bold text-lg'>{player.name}</h4>
                          <div className='text-green-700 font-medium'>{player.position}</div>
                        </div>
                        <div className='text-right'>
                          <div className='text-2xl font-bold text-green-600 font-mono'>
                            +{player.forYou?.weightedPoints.toFixed(1) || '0.0'}
                          </div>
                          <div className='text-xs text-green-700'>VORP Contribution</div>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
                        <div className='bg-white/50 p-3 rounded'>
                          <div className='font-semibold text-gray-700'>Times Started</div>
                          <div className='text-xl font-bold text-green-600'>
                            {player.forYou?.starts || 0}
                          </div>
                        </div>
                        <div className='bg-white/50 p-3 rounded'>
                          <div className='font-semibold text-gray-700'>Total Points</div>
                          <div className='text-xl font-bold text-green-600'>
                            {player.forYou?.points.toFixed(1) || '0.0'}
                          </div>
                        </div>
                      </div>

                      {/* Weekly Breakdown */}
                      <div>
                        <h5 className='font-semibold mb-2'>Weekly Performance</h5>
                        <div className='flex gap-2 overflow-x-auto'>
                          {player.weeklyPoints
                            .filter(w => w.week <= currentNflWeek)
                            .map(week => (
                              <div
                                key={week.week}
                                className={`min-w-16 text-center p-2 rounded text-sm ${
                                  week.started
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                <div className='font-semibold'>W{week.week}</div>
                                <div className='font-bold'>{week.points.toFixed(1)}</div>
                                {week.started && <div className='text-xs'>✓</div>}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dropped Players Section */}
            {droppedPlayers.length > 0 && (
              <div>
                <h3 className='text-xl font-bold text-red-700 mb-4 flex items-center gap-2'>
                  <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                  Dropped Players ({droppedPlayers.length})
                </h3>
                <div className='grid gap-4'>
                  {droppedPlayers.map(player => (
                    <div
                      key={player.playerId}
                      className='border border-red-200 rounded-lg p-4 bg-red-50/50'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h4 className='font-bold text-lg'>{player.name}</h4>
                          <div className='text-red-700 font-medium'>{player.position}</div>
                        </div>
                        <div className='text-right'>
                          <div className='text-2xl font-bold text-red-600 font-mono'>
                            -{player.afterDrop?.oppHarmWeighted.toFixed(1) || '0.0'}
                          </div>
                          <div className='text-xs text-red-700'>Drop Penalty</div>
                        </div>
                      </div>

                      {/* Penalty Breakdown */}
                      <div className='bg-red-100 dark:bg-red-900/30 p-3 rounded mb-4'>
                        <h5 className='font-semibold text-red-800 mb-2'>Penalty Analysis</h5>
                        <div className='grid grid-cols-2 gap-4 text-sm'>
                          <div>
                            <div className='text-red-700'>Self-Harm</div>
                            <div className='font-bold'>
                              {player.afterDrop?.selfHarm.toFixed(1) || '0.0'}
                            </div>
                            <div className='text-xs text-red-600'>Lost starter value</div>
                          </div>
                          <div>
                            <div className='text-red-700'>Opponent-Harm</div>
                            <div className='font-bold'>
                              {player.afterDrop?.oppHarm.toFixed(1) || '0.0'}
                            </div>
                            <div className='text-xs text-red-600'>VORP to opponents</div>
                          </div>
                        </div>
                      </div>

                      {/* Weekly Breakdown */}
                      <div>
                        <h5 className='font-semibold mb-2'>Weekly Performance (After Drop)</h5>
                        <div className='flex gap-2 overflow-x-auto'>
                          {player.weeklyPoints
                            .filter(w => w.week <= currentNflWeek)
                            .map(week => (
                              <div
                                key={week.week}
                                className={`min-w-16 text-center p-2 rounded text-sm ${
                                  week.started
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                <div className='font-semibold'>W{week.week}</div>
                                <div className='font-bold'>{week.points.toFixed(1)}</div>
                                {week.started && <div className='text-xs'>✓ started</div>}
                              </div>
                            ))}
                        </div>
                        <div className='text-xs text-gray-500 mt-2'>
                          ✓ = Started by any team after drop
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className='border-t pt-4'>
              <div className='bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg'>
                <h4 className='font-semibold mb-2'>Transaction Summary</h4>
                <div className='grid grid-cols-3 gap-4 text-center text-sm'>
                  <div>
                    <div className='text-2xl font-bold text-green-600'>
                      +
                      {addedPlayers
                        .reduce((sum, p) => sum + (p.forYou?.weightedPoints || 0), 0)
                        .toFixed(1)}
                    </div>
                    <div className='text-gray-600'>Added VORP</div>
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-red-600'>
                      -
                      {droppedPlayers
                        .reduce((sum, p) => sum + (p.afterDrop?.oppHarmWeighted || 0), 0)
                        .toFixed(1)}
                    </div>
                    <div className='text-gray-600'>Drop Penalty</div>
                  </div>
                  <div>
                    <div
                      className={`text-2xl font-bold ${transaction.score >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {transaction.score >= 0 ? '+' : ''}
                      {transaction.score.toFixed(1)}
                    </div>
                    <div className='text-gray-600'>Cost-Adjusted VORP</div>

                    {/* FAAB Cost Breakdown */}
                    {transaction.faabCost > 0 && (
                      <div className='mt-2 text-sm text-gray-500'>
                        <div>
                          Raw: {transaction.rawScore >= 0 ? '+' : ''}
                          {transaction.rawScore.toFixed(1)}
                        </div>
                        <div>FAAB: ${transaction.faabCost}</div>
                        <div className='text-red-500'>
                          Penalty: -{transaction.costPenalty.toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatsContent({ dataset, searchParams }: StatsContentProps) {
  console.log('[DEBUG] StatsContent: received dataset', {
    currentWeek: dataset.currentWeek,
    leagues: dataset.leagues?.length,
    teamsCount: dataset.teams?.length,
    weekRange: dataset.weekRange,
  });

  const teamsMap = useMemo(() => new Map(dataset.teams), [dataset.teams]);
  const allTeamEntries = useMemo(() => Array.from(teamsMap.entries()), [teamsMap]);

  console.log('[DEBUG] StatsContent: processed teams', {
    teamsMapSize: teamsMap.size,
    allTeamEntriesLength: allTeamEntries.length,
    firstTeam: allTeamEntries[0]?.[1]?.teamInfo?.teamName,
  });

  // Build team options for selector
  const teamOptions = useMemo(
    () =>
      allTeamEntries.map(([key, t]) => ({
        key,
        label: `${t.teamInfo.teamName} (${t.teamInfo.leagueName})`,
        team: t,
      })),
    [allTeamEntries]
  );

  console.log('[DEBUG] StatsContent: team options built', {
    optionsCount: teamOptions.length,
    firstOption: teamOptions[0]?.label,
    firstOptionKey: teamOptions[0]?.key,
  });

  const [selectedTeamKey, setSelectedTeamKey] = useState<string>(
    searchParams.team || teamOptions[0]?.key || ''
  );

  const [currentView, setCurrentView] = useState<
    'team' | 'league' | 'schedule' | 'trends' | 'scatter' | 'transactions' | 'start-sit'
  >(
    (searchParams.view as
      | 'team'
      | 'league'
      | 'schedule'
      | 'trends'
      | 'scatter'
      | 'transactions'
      | 'start-sit') || 'team'
  );

  const [selectedWeek, setSelectedWeek] = useState<string>(searchParams.week || 'season');

  // Track expanded player breakdown rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Available weeks for dropdown
  const availableWeeks = Array.from({ length: dataset.currentWeek }, (_, i) => i + 1).filter(
    week => {
      // Only include weeks that have some non-zero scores
      return allTeamEntries.some(([, t]) => t.teamScores.find(d => d.week === week && d.value > 0));
    }
  );

  console.log('[DEBUG] StatsContent: team selection', {
    selectedTeamKey,
    searchParamsTeam: searchParams.team,
    firstOptionKey: teamOptions[0]?.key,
  });

  const selectedTeam = teamOptions.find(opt => opt.key === selectedTeamKey);
  console.log('[DEBUG] StatsContent: selected team', {
    found: !!selectedTeam,
    teamName: selectedTeam?.team?.teamInfo?.teamName,
  });

  if (!selectedTeam) {
    return (
      <div className='space-y-6'>
        <Card>
          <CardContent className='py-8'>
            <div className='text-center text-muted-foreground'>
              No teams available or selected team not found.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const t = selectedTeam.team;

  // Use weeks with actual data (non-zero scores)
  const validWeeks = t.teamScores.filter(d => d.value > 0).map(d => d.week);
  const fromWeek = Math.min(...validWeeks, dataset.weekRange.from);
  const toWeek = Math.max(...validWeeks, Math.min(dataset.weekRange.to, dataset.currentWeek - 1)); // Exclude current week if it's incomplete
  const weeks = Array.from({ length: toWeek - fromWeek + 1 }, (_, i) => fromWeek + i);
  const gamesPlayed = validWeeks.length;

  // Get positional data for this team
  const positionsMap = useMemo(() => new Map(dataset.positions), [dataset.positions]);
  const positions: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];

  // Season window totals
  const teamTotal = t.teamScores
    .filter(d => d.week >= fromWeek && d.week <= toWeek)
    .reduce((a, d) => a + d.value, 0);
  const oppTotal = t.opponentScores
    .filter(d => d.week >= fromWeek && d.week <= toWeek)
    .reduce((a, d) => a + d.value, 0);

  // Calculate league averages and ranks
  const leagueTotals = allTeamEntries.map(([, tt]) =>
    tt.teamScores
      .filter(d => d.week >= fromWeek && d.week <= toWeek)
      .reduce((a, d) => a + d.value, 0)
  );
  const seasonRanks24 = rank(leagueTotals);
  const teamIndex24 = allTeamEntries.findIndex(([k]) => k === selectedTeamKey);
  const seasonRank24 = seasonRanks24[teamIndex24] || 0;

  const leagueId = t.teamInfo.leagueId;
  const leagueTeamEntries = allTeamEntries.filter(([, tt]) => tt.teamInfo.leagueId === leagueId);
  const leagueSubset = leagueTeamEntries.map(([, tt]) =>
    tt.teamScores
      .filter(d => d.week >= fromWeek && d.week <= toWeek)
      .reduce((a, d) => a + d.value, 0)
  );
  const seasonRanksLeague = rank(leagueSubset);
  const teamIndexLeague = leagueTeamEntries.findIndex(([k]) => k === selectedTeamKey);
  const seasonRankLeague = seasonRanksLeague[teamIndexLeague] || 0;

  console.log('[DEBUG] Rankings for', t.teamInfo.teamName, {
    teamTotal,
    leagueTotalsLength: leagueTotals.length,
    leagueSubsetLength: leagueSubset.length,
    teamIndex24,
    teamIndexLeague,
    seasonRank24,
    seasonRankLeague,
    leagueTotalsSample: leagueTotals.slice(0, 5),
    leagueSubsetSample: leagueSubset.slice(0, 5),
  });

  const leagueAvgByWeek = weeks.map(week => {
    const vals = allTeamEntries.map(
      ([, tt]) => tt.teamScores.find(d => d.week === week)?.value || 0
    );
    return mean(vals);
  });
  const leagueMedByWeek = weeks.map(week => {
    const vals = allTeamEntries.map(
      ([, tt]) => tt.teamScores.find(d => d.week === week)?.value || 0
    );
    return median(vals);
  });

  // Calculate average opponent rank (strength of schedule)
  const oppRanks24ByWeek = weeks.map(week => {
    const oppVals = allTeamEntries.map(
      ([, tt]) => tt.opponentScores.find(d => d.week === week)?.value || 0
    );
    const oppRanks = rank(oppVals);
    const teamIdx = allTeamEntries.findIndex(([k]) => k === selectedTeamKey);
    return oppRanks[teamIdx] || 0;
  });
  const avgOppRank = mean(oppRanks24ByWeek.filter(r => r > 0));

  // League View Component
  function LeagueView() {
    const isSeasonView = selectedWeek === 'season';
    const weekNum = isSeasonView ? null : parseInt(selectedWeek, 10);

    // Track expanded player breakdown rows in League View
    const [expandedLeagueRows, setExpandedLeagueRows] = useState<Set<string>>(new Set());

    // Build league rankings data
    const leagueData = useMemo(() => {
      const teams = allTeamEntries
        .map(([key, t]) => {
          const teamTotal = isSeasonView
            ? t.teamScores.filter(d => d.value > 0).reduce((a, d) => a + d.value, 0)
            : t.teamScores.find(d => d.week === weekNum)?.value || 0;

          // Get positional data
          const posScores: Record<TrackedPosition, number> = {
            QB: 0,
            RB: 0,
            WR: 0,
            TE: 0,
            DEF: 0,
          };

          for (const position of ['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]) {
            const posData = positionsMap.get(position);
            const posTeamsMap = new Map(posData?.teams || []);
            const teamPosData = posTeamsMap.get(key);

            if (teamPosData) {
              posScores[position] = isSeasonView
                ? teamPosData.scores.filter(d => d.value > 0).reduce((a, d) => a + d.value, 0)
                : teamPosData.scores.find(d => d.week === weekNum)?.value || 0;
            }
          }

          return {
            key,
            teamInfo: t.teamInfo,
            teamTotal,
            positions: posScores,
          };
        })
        .filter(team => team.teamTotal > 0); // Only include teams with data

      // Calculate ranks
      const teamTotals = teams.map(t => t.teamTotal);
      const teamRanks = rank(teamTotals);

      const positionRanks: Record<TrackedPosition, number[]> = {
        QB: rank(teams.map(t => t.positions.QB)),
        RB: rank(teams.map(t => t.positions.RB)),
        WR: rank(teams.map(t => t.positions.WR)),
        TE: rank(teams.map(t => t.positions.TE)),
        DEF: rank(teams.map(t => t.positions.DEF)),
      };

      return teams
        .map((team, index) => ({
          ...team,
          rank: teamRanks[index],
          positionRanks: {
            QB: positionRanks.QB[index],
            RB: positionRanks.RB[index],
            WR: positionRanks.WR[index],
            TE: positionRanks.TE[index],
            DEF: positionRanks.DEF[index],
          },
        }))
        .sort((a, b) => a.rank - b.rank); // Sort by overall rank
    }, [allTeamEntries, positionsMap, selectedWeek, weekNum, isSeasonView]);

    return (
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>League Rankings</CardTitle>
            <CardDescription>
              {isSeasonView
                ? 'Season totals - All 24 teams ranked by performance. Color-coded positions show strengths (green) and weaknesses (red).'
                : `Week ${weekNum} - All 24 teams ranked by performance. Color-coded positions show strengths (green) and weaknesses (red). Click position tables to see players.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='mb-4 flex items-center gap-3'>
              <label className='text-sm font-medium'>View</label>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className='w-48'>
                  <SelectValue placeholder='Select week' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='season'>Season Overview</SelectItem>
                  {availableWeeks.map(week => (
                    <SelectItem key={week} value={String(week)}>
                      Week {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='rounded-md border'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-3 py-2 text-center'>Rank</th>
                    <th className='px-3 py-2 text-left'>Team</th>
                    <th className='px-3 py-2 text-right'>Total</th>
                    {isSeasonView && (
                      <th className='px-3 py-2 text-center min-w-[120px]'>Weekly Trend</th>
                    )}
                    <th className='px-3 py-2 text-center'>QB</th>
                    <th className='px-3 py-2 text-center'>RB</th>
                    <th className='px-3 py-2 text-center'>WR</th>
                    <th className='px-3 py-2 text-center'>TE</th>
                    <th className='px-3 py-2 text-center'>DEF</th>
                  </tr>
                </thead>
                <tbody>
                  {leagueData.map((team, index) => (
                    <tr key={team.key} className='border-t hover:bg-muted/20'>
                      <td className='px-3 py-2 text-center'>
                        <span
                          className='rounded-full px-2 py-1 text-xs font-medium'
                          style={{
                            backgroundColor: getRankColor(team.rank, 24),
                            color: getTextColor(getRankColor(team.rank, 24)),
                          }}
                        >
                          {team.rank}
                        </span>
                      </td>
                      <td className='px-3 py-2'>
                        <div className='font-medium'>{team.teamInfo.teamName}</div>
                        <div className='text-xs text-muted-foreground'>
                          {team.teamInfo.leagueName}
                        </div>
                      </td>
                      <td
                        className='px-3 py-2 text-right font-mono font-bold'
                        style={{ color: colors.core.regalGold }}
                      >
                        {team.teamTotal.toFixed(1)}
                      </td>
                      {isSeasonView && (
                        <td className='px-2 py-2'>
                          <div className='w-28 h-8'>
                            <ResponsiveContainer width='100%' height='100%'>
                              <LineChart
                                data={(() => {
                                  // Get weekly scores for sparkline
                                  const teamData = allTeamEntries.find(([k]) => k === team.key);
                                  if (!teamData) return [];

                                  return teamData[1].teamScores
                                    .filter(d => d.value > 0)
                                    .map(d => ({
                                      week: d.week,
                                      score: d.value,
                                    }));
                                })()}
                              >
                                <Line
                                  type='monotone'
                                  dataKey='score'
                                  stroke={colors.core.regalGold}
                                  strokeWidth={2}
                                  dot={false}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    fontSize: '11px',
                                    padding: '4px 8px',
                                  }}
                                  formatter={(value, name) => [
                                    `${Number(value).toFixed(1)} pts`,
                                    `Week`,
                                  ]}
                                  labelFormatter={week => `Week ${week}`}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </td>
                      )}
                      {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => (
                        <td key={position} className='px-2 py-2 text-center'>
                          <div className='space-y-2'>
                            {/* Position heatmap cell */}
                            <div
                              className='rounded-lg p-2 transition-colors min-w-[70px]'
                              style={{
                                backgroundColor: getRankColor(team.positionRanks[position], 24),
                              }}
                            >
                              <div
                                className='font-mono font-bold text-xs'
                                style={{
                                  color: getTextColor(
                                    getRankColor(team.positionRanks[position], 24)
                                  ),
                                }}
                              >
                                #{team.positionRanks[position]}
                              </div>
                              <div
                                className='font-mono text-xs'
                                style={{
                                  color: getTextColor(
                                    getRankColor(team.positionRanks[position], 24)
                                  ),
                                }}
                              >
                                {team.positions[position].toFixed(1)}
                              </div>
                            </div>

                            {/* Position sparkline (season view only) */}
                            {isSeasonView && (
                              <div className='w-16 h-6'>
                                <ResponsiveContainer width='100%' height='100%'>
                                  <LineChart
                                    data={(() => {
                                      // Get weekly positional scores
                                      const posData = positionsMap.get(position);
                                      const posTeamsMap = new Map(posData?.teams || []);
                                      const teamPosData = posTeamsMap.get(team.key);

                                      if (!teamPosData) return [];

                                      return teamPosData.scores
                                        .filter(d => d.value !== 0)
                                        .map(d => ({
                                          week: d.week,
                                          score: d.value,
                                        }));
                                    })()}
                                  >
                                    <Line
                                      type='monotone'
                                      dataKey='score'
                                      stroke={
                                        team.positionRanks[position] <= 6
                                          ? colors.rdylgn[8] // Elite = green
                                          : team.positionRanks[position] <= 12
                                            ? colors.rdylgn[5] // Average = yellow
                                            : colors.rdylgn[2] // Below average = red
                                      }
                                      strokeWidth={1.5}
                                      dot={false}
                                    />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: 'white',
                                        fontSize: '10px',
                                        padding: '3px 6px',
                                      }}
                                      formatter={(value, name) => [
                                        `${Number(value).toFixed(1)} pts`,
                                        position,
                                      ]}
                                      labelFormatter={week => `Week ${week}`}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Color Legend */}
            <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
              <h4 className='font-semibold mb-2'>Position Color Guide</h4>
              <div className='grid grid-cols-2 md:grid-cols-5 gap-3 text-muted-foreground'>
                <div className='flex items-center'>
                  <span
                    className='inline-block w-4 h-4 rounded mr-2'
                    style={{ backgroundColor: colors.rdylgn[9] }}
                  ></span>
                  <strong>Top 10%</strong>
                </div>
                <div className='flex items-center'>
                  <span
                    className='inline-block w-4 h-4 rounded mr-2'
                    style={{ backgroundColor: colors.rdylgn[8] }}
                  ></span>
                  <strong>Top 25%</strong>
                </div>
                <div className='flex items-center'>
                  <span
                    className='inline-block w-4 h-4 rounded mr-2'
                    style={{ backgroundColor: colors.rdylgn[7] }}
                  ></span>
                  <strong>Top 50%</strong>
                </div>
                <div className='flex items-center'>
                  <span
                    className='inline-block w-4 h-4 rounded mr-2'
                    style={{ backgroundColor: colors.rdylgn[5] }}
                  ></span>
                  <strong>Middle</strong>
                </div>
                <div className='flex items-center'>
                  <span
                    className='inline-block w-4 h-4 rounded mr-2'
                    style={{ backgroundColor: colors.rdylgn[3] }}
                  ></span>
                  <strong>Bottom 25%</strong>
                </div>
                <div className='flex items-center'>
                  <span
                    className='inline-block w-4 h-4 rounded mr-2'
                    style={{ backgroundColor: colors.rdylgn[1] }}
                  ></span>
                  <strong>Bottom 10%</strong>
                </div>
              </div>
            </div>

            {/* Position Tables */}
            <div className='mt-8 space-y-6'>
              <h3 className='text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
                Position Rankings
              </h3>

              {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => {
                // Build position-specific data
                const positionData = useMemo(() => {
                  const teams = allTeamEntries
                    .map(([key, t]) => {
                      const posData = positionsMap.get(position);
                      const posTeamsMap = new Map(posData?.teams || []);
                      const teamPosData = posTeamsMap.get(key);

                      if (!teamPosData) return null;

                      const posScore = isSeasonView
                        ? teamPosData.scores
                            .filter(d => d.value > 0)
                            .reduce((a, d) => a + d.value, 0)
                        : teamPosData.scores.find(d => d.week === weekNum)?.value || 0;

                      return {
                        key,
                        teamInfo: t.teamInfo,
                        posScore,
                      };
                    })
                    .filter(Boolean)
                    .filter(team => team!.posScore > 0) as Array<{
                    key: string;
                    teamInfo: any;
                    posScore: number;
                  }>;

                  // Calculate ranks
                  const posScores = teams.map(t => t.posScore);
                  const posRanks = rank(posScores);

                  return teams
                    .map((team, index) => ({
                      ...team,
                      rank: posRanks[index],
                    }))
                    .sort((a, b) => a.rank - b.rank);
                }, [allTeamEntries, positionsMap, position, selectedWeek, weekNum, isSeasonView]);

                return (
                  <div key={position} className='rounded-md border'>
                    <div
                      className='px-4 py-2'
                      style={{ backgroundColor: colors.core.charcoalSteel }}
                    >
                      <h4 className='font-semibold text-white'>
                        {position} Rankings
                        {!isSeasonView && (
                          <span className='ml-2 text-xs text-gray-300'>
                            (Click rows to see players)
                          </span>
                        )}
                      </h4>
                    </div>

                    <div className='p-4'>
                      <div className='rounded-md border'>
                        <table className='w-full text-sm'>
                          <thead className='bg-muted/20'>
                            <tr>
                              <th className='px-3 py-2 text-center'>Rank</th>
                              <th className='px-3 py-2 text-left'>Team</th>
                              <th className='px-3 py-2 text-right'>Points</th>
                              {!isSeasonView && <th className='px-3 py-2 text-center'>Players</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {positionData.flatMap(team => {
                              const rowKey = `league-${position}-${team.key}`;
                              const isExpanded = expandedLeagueRows.has(rowKey);
                              const rows = [];

                              // Main team row
                              rows.push(
                                <tr
                                  key={team.key}
                                  className={`border-t hover:bg-muted/20 ${!isSeasonView ? 'cursor-pointer' : ''}`}
                                  onClick={
                                    !isSeasonView
                                      ? () => {
                                          const newExpanded = new Set(expandedLeagueRows);
                                          if (isExpanded) {
                                            newExpanded.delete(rowKey);
                                          } else {
                                            newExpanded.add(rowKey);
                                          }
                                          setExpandedLeagueRows(newExpanded);
                                        }
                                      : undefined
                                  }
                                >
                                  <td className='px-3 py-2 text-center'>
                                    <span
                                      className='rounded-full px-2 py-1 text-xs font-medium'
                                      style={{
                                        backgroundColor: getRankColor(
                                          team.rank,
                                          positionData.length
                                        ),
                                        color: getTextColor(
                                          getRankColor(team.rank, positionData.length)
                                        ),
                                      }}
                                    >
                                      {team.rank}
                                    </span>
                                  </td>
                                  <td className='px-3 py-2'>
                                    <div className='flex items-center gap-1'>
                                      <div>
                                        <div className='font-medium'>{team.teamInfo.teamName}</div>
                                        <div className='text-xs text-muted-foreground'>
                                          {team.teamInfo.leagueName}
                                        </div>
                                      </div>
                                      {!isSeasonView && (
                                        <span className='text-xs text-muted-foreground ml-auto'>
                                          {isExpanded ? '▼' : '▶'}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td
                                    className='px-3 py-2 text-right font-mono font-bold'
                                    style={{ color: colors.core.regalGold }}
                                  >
                                    {team.posScore.toFixed(1)}
                                  </td>
                                  {!isSeasonView && (
                                    <td className='px-3 py-2 text-center text-xs text-muted-foreground'>
                                      Click to expand
                                    </td>
                                  )}
                                </tr>
                              );

                              // Player breakdown row (if expanded and weekly view)
                              if (isExpanded && !isSeasonView && weekNum) {
                                const weekPlayerData =
                                  dataset.weeklyPlayerData[weekNum]?.[team.key];
                                const playersForPosition =
                                  weekPlayerData?.positions[position] || [];

                                rows.push(
                                  <tr key={`${team.key}-breakdown`} className='bg-muted/5'>
                                    <td colSpan={4} className='p-0'>
                                      <PlayerBreakdownRow
                                        players={playersForPosition}
                                        position={position}
                                      />
                                    </td>
                                  </tr>
                                );
                              }

                              return rows;
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Positional Advantages Overview - Only show for season view */}
        {isSeasonView && (
          <Card>
            <CardHeader>
              <CardTitle>Positional Advantages Overview</CardTitle>
              <CardDescription>
                League-wide analysis of positional strengths and weaknesses based on weekly averages
                vs. median
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const { topAdvantages, topDisadvantages } = getTopPositionalAdvantages(
                  dataset,
                  { from: fromWeek, to: toWeek },
                  8
                );

                return (
                  <div className='space-y-6'>
                    {/* Top Advantages and Disadvantages */}
                    <div className='grid md:grid-cols-2 gap-6'>
                      {/* Top Advantages */}
                      <div className='rounded-md border'>
                        <div className='px-4 py-2' style={{ backgroundColor: colors.rdylgn[2] }}>
                          <h4 className='font-semibold text-white'>
                            Biggest Positional Advantages
                          </h4>
                        </div>
                        <div className='p-4'>
                          <table className='w-full text-sm'>
                            <thead className='bg-muted/20'>
                              <tr>
                                <th className='px-3 py-2 text-left'>Team</th>
                                <th className='px-3 py-2 text-center'>Position</th>
                                <th className='px-3 py-2 text-right'>Advantage</th>
                                <th className='px-3 py-2 text-right'>%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {topAdvantages.map(adv => (
                                <tr key={`${adv.teamKey}-${adv.position}`} className='border-t'>
                                  <td className='px-3 py-2'>
                                    <div>
                                      <div className='font-medium'>{adv.teamName}</div>
                                      <div className='text-xs text-muted-foreground'>
                                        {adv.leagueName}
                                      </div>
                                    </div>
                                  </td>
                                  <td className='px-3 py-2 text-center font-mono font-bold'>
                                    {adv.position}
                                  </td>
                                  <td
                                    className='px-3 py-2 text-right font-mono font-bold'
                                    style={{ color: colors.rdylgn[8] }}
                                  >
                                    +{adv.advantage.toFixed(1)}
                                  </td>
                                  <td
                                    className='px-3 py-2 text-right font-mono'
                                    style={{ color: colors.rdylgn[8] }}
                                  >
                                    +{adv.percentageAdvantage.toFixed(1)}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Top Disadvantages */}
                      <div className='rounded-md border'>
                        <div className='px-4 py-2' style={{ backgroundColor: colors.rdylgn[8] }}>
                          <h4 className='font-semibold text-white'>
                            Biggest Positional Disadvantages
                          </h4>
                        </div>
                        <div className='p-4'>
                          <table className='w-full text-sm'>
                            <thead className='bg-muted/20'>
                              <tr>
                                <th className='px-3 py-2 text-left'>Team</th>
                                <th className='px-3 py-2 text-center'>Position</th>
                                <th className='px-3 py-2 text-right'>Disadvantage</th>
                                <th className='px-3 py-2 text-right'>%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {topDisadvantages.map(adv => (
                                <tr key={`${adv.teamKey}-${adv.position}`} className='border-t'>
                                  <td className='px-3 py-2'>
                                    <div>
                                      <div className='font-medium'>{adv.teamName}</div>
                                      <div className='text-xs text-muted-foreground'>
                                        {adv.leagueName}
                                      </div>
                                    </div>
                                  </td>
                                  <td className='px-3 py-2 text-center font-mono font-bold'>
                                    {adv.position}
                                  </td>
                                  <td
                                    className='px-3 py-2 text-right font-mono font-bold'
                                    style={{ color: colors.rdylgn[2] }}
                                  >
                                    {adv.advantage.toFixed(1)}
                                  </td>
                                  <td
                                    className='px-3 py-2 text-right font-mono'
                                    style={{ color: colors.rdylgn[2] }}
                                  >
                                    {adv.percentageAdvantage.toFixed(1)}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Position-by-Position Tables */}
                    <div>
                      <h4
                        className='mb-4 text-md font-semibold'
                        style={{ color: colors.core.charcoalSteel }}
                      >
                        Position-by-Position Rankings
                      </h4>
                      <div className='grid md:grid-cols-2 gap-6'>
                        {(() => {
                          const positionSummaries = getPositionSummaries(dataset, {
                            from: fromWeek,
                            to: toWeek,
                          });

                          return positionSummaries.map(posSummary => (
                            <div key={posSummary.position} className='rounded-md border'>
                              <div
                                className='px-3 py-2'
                                style={{ backgroundColor: colors.core.charcoalSteel }}
                              >
                                <h5 className='font-semibold text-white text-center'>
                                  {posSummary.position} (Median:{' '}
                                  {posSummary.leagueMedian.toFixed(1)})
                                </h5>
                              </div>
                              <div className='p-3'>
                                <table className='w-full text-xs'>
                                  <thead className='bg-muted/20'>
                                    <tr>
                                      <th className='px-2 py-1 text-left text-xs'>Team</th>
                                      <th className='px-2 py-1 text-right text-xs'>Weekly Avg</th>
                                      <th className='px-2 py-1 text-right text-xs'>vs Median</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {posSummary.teams.map(team => {
                                      const advantageColor =
                                        team.advantage === 0
                                          ? colors.rdylgn[5]
                                          : team.advantage > 0
                                            ? colors.rdylgn[8]
                                            : colors.rdylgn[2];

                                      return (
                                        <tr key={team.teamKey} className='border-t'>
                                          <td className='px-2 py-1'>
                                            <div className='font-medium text-xs'>
                                              {team.teamName}
                                            </div>
                                            <div className='text-xs text-muted-foreground'>
                                              #{team.rank}
                                            </div>
                                          </td>
                                          <td
                                            className='px-2 py-1 text-right font-mono text-xs'
                                            style={{ color: colors.core.regalGold }}
                                          >
                                            {team.weeklyAverage.toFixed(1)}
                                          </td>
                                          <td
                                            className='px-2 py-1 text-right font-mono text-xs font-bold'
                                            style={{ color: advantageColor }}
                                          >
                                            {team.advantage > 0 ? '+' : ''}
                                            {team.advantage.toFixed(1)}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Schedule Analysis Component
  function ScheduleAnalysis() {
    // Build head-to-head record matrix
    const scheduleMatrix = useMemo(() => {
      const matrix = new Map<
        string,
        Map<string, { wins: number; losses: number; totalGames: number }>
      >();

      // Initialize matrix for all teams
      for (const [teamKey] of allTeamEntries) {
        matrix.set(teamKey, new Map());
        for (const [opponentKey] of allTeamEntries) {
          if (teamKey !== opponentKey) {
            matrix.get(teamKey)!.set(opponentKey, { wins: 0, losses: 0, totalGames: 0 });
          }
        }
      }

      // For each team pair, calculate hypothetical record
      for (const [teamAKey, teamA] of allTeamEntries) {
        for (const [teamBKey, teamB] of allTeamEntries) {
          if (teamAKey === teamBKey) continue;

          const record = matrix.get(teamAKey)?.get(teamBKey);
          if (!record) continue;

          // Compare Team A's scores against Team B's opponent scores
          for (let week = 1; week <= dataset.currentWeek - 1; week++) {
            const teamAScore = teamA.teamScores.find(d => d.week === week)?.value || 0;
            const teamBOppScore = teamB.opponentScores.find(d => d.week === week)?.value || 0;

            // Only count weeks where both teams have data
            if (teamAScore > 0 && teamBOppScore > 0) {
              if (teamAScore > teamBOppScore) {
                record.wins++;
              } else if (teamAScore < teamBOppScore) {
                record.losses++;
              }
              // Note: Ties are not counted as wins or losses, but still count as games
              record.totalGames++;
            }
          }

          // Debug output for first few comparisons
          if (teamAKey.includes('-1') && teamBKey.includes('-2')) {
            console.log(
              `[DEBUG] Schedule matrix ${teamA.teamInfo.teamName} vs ${teamB.teamInfo.teamName} schedule:`,
              {
                totalGames: record.totalGames,
                wins: record.wins,
                losses: record.losses,
                teamAScores: teamA.teamScores
                  .filter(d => d.value > 0)
                  .map(d => ({ week: d.week, value: d.value })),
                teamBOppScores: teamB.opponentScores
                  .filter(d => d.value > 0)
                  .map(d => ({ week: d.week, value: d.value })),
                weeklyComparisons: Array.from(
                  { length: dataset.currentWeek - 1 },
                  (_, i) => i + 1
                ).map(week => {
                  const aScore = teamA.teamScores.find(d => d.week === week)?.value || 0;
                  const bOppScore = teamB.opponentScores.find(d => d.week === week)?.value || 0;
                  return { week, aScore, bOppScore, counted: aScore > 0 && bOppScore > 0 };
                }),
              }
            );
          }
        }
      }

      return matrix;
    }, [allTeamEntries, dataset.currentWeek]);

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
      const stats = allTeamEntries
        .map(([teamKey, team]) => {
          let totalWins = 0;
          let totalLosses = 0;
          let totalGames = 0;

          const teamRecord = scheduleMatrix.get(teamKey);
          if (teamRecord) {
            for (const record of teamRecord.values()) {
              totalWins += record.wins;
              totalLosses += record.losses;
              totalGames += record.totalGames;
            }
          }

          return {
            teamKey,
            teamInfo: team.teamInfo,
            totalWins,
            totalLosses,
            totalGames,
            winPct: totalGames > 0 ? totalWins / totalGames : 0,
          };
        })
        .sort((a, b) => b.winPct - a.winPct);

      return stats;
    }, [allTeamEntries, scheduleMatrix]);

    // Calculate schedule difficulty (which schedules are hardest)
    const scheduleDifficulty = useMemo(() => {
      const scheduleStats = allTeamEntries
        .map(([scheduleOwnerKey, scheduleOwner]) => {
          let totalWins = 0;
          let totalGames = 0;

          // For each other team, see how they would do with this schedule
          for (const [teamKey] of allTeamEntries) {
            if (teamKey === scheduleOwnerKey) continue;

            const record = scheduleMatrix.get(teamKey)?.get(scheduleOwnerKey);
            if (record) {
              totalWins += record.wins;
              totalGames += record.totalGames;
            }
          }

          return {
            scheduleOwnerKey,
            scheduleOwnerInfo: scheduleOwner.teamInfo,
            avgWinPct: totalGames > 0 ? totalWins / totalGames : 0,
            totalGames,
          };
        })
        .sort((a, b) => a.avgWinPct - b.avgWinPct); // Lowest win% = hardest schedule

      return scheduleStats;
    }, [allTeamEntries, scheduleMatrix]);

    // Build league-specific matrices and teams
    const afcTeams = allTeamEntries.filter(([, t]) => t.teamInfo.leagueName.includes('AFC'));
    const nfcTeams = allTeamEntries.filter(([, t]) => t.teamInfo.leagueName.includes('NFC'));
    const afcSummary = summaryStats.filter(s => s.teamInfo.leagueName.includes('AFC'));
    const nfcSummary = summaryStats.filter(s => s.teamInfo.leagueName.includes('NFC'));

    // Build AFC-only matrix
    const afcMatrix = useMemo(() => {
      const matrix = new Map<
        string,
        Map<string, { wins: number; losses: number; totalGames: number }>
      >();

      for (const [teamKey] of afcTeams) {
        matrix.set(teamKey, new Map());
        for (const [opponentKey] of afcTeams) {
          if (teamKey !== opponentKey) {
            matrix.get(teamKey)!.set(opponentKey, { wins: 0, losses: 0, totalGames: 0 });
          }
        }
      }

      // Calculate hypothetical records within AFC only
      for (const [teamAKey, teamA] of afcTeams) {
        for (const [teamBKey, teamB] of afcTeams) {
          if (teamAKey === teamBKey) continue;

          const record = matrix.get(teamAKey)?.get(teamBKey);
          if (!record) continue;

          for (let week = 1; week <= dataset.currentWeek - 1; week++) {
            const teamAScore = teamA.teamScores.find(d => d.week === week)?.value || 0;
            const teamBOppScore = teamB.opponentScores.find(d => d.week === week)?.value || 0;

            if (teamAScore > 0 && teamBOppScore > 0) {
              if (teamAScore > teamBOppScore) {
                record.wins++;
              } else if (teamAScore < teamBOppScore) {
                record.losses++;
              }
              record.totalGames++;
            }
          }
        }
      }

      return matrix;
    }, [afcTeams, dataset.currentWeek]);

    // Build NFC-only matrix
    const nfcMatrix = useMemo(() => {
      const matrix = new Map<
        string,
        Map<string, { wins: number; losses: number; totalGames: number }>
      >();

      for (const [teamKey] of nfcTeams) {
        matrix.set(teamKey, new Map());
        for (const [opponentKey] of nfcTeams) {
          if (teamKey !== opponentKey) {
            matrix.get(teamKey)!.set(opponentKey, { wins: 0, losses: 0, totalGames: 0 });
          }
        }
      }

      // Calculate hypothetical records within NFC only
      for (const [teamAKey, teamA] of nfcTeams) {
        for (const [teamBKey, teamB] of nfcTeams) {
          if (teamAKey === teamBKey) continue;

          const record = matrix.get(teamAKey)?.get(teamBKey);
          if (!record) continue;

          for (let week = 1; week <= dataset.currentWeek - 1; week++) {
            const teamAScore = teamA.teamScores.find(d => d.week === week)?.value || 0;
            const teamBOppScore = teamB.opponentScores.find(d => d.week === week)?.value || 0;

            if (teamAScore > 0 && teamBOppScore > 0) {
              if (teamAScore > teamBOppScore) {
                record.wins++;
              } else if (teamAScore < teamBOppScore) {
                record.losses++;
              }
              record.totalGames++;
            }
          }
        }
      }

      return matrix;
    }, [nfcTeams, dataset.currentWeek]);

    // Advanced luck analysis for selected team
    const selectedTeamLuckAnalysis = useMemo(() => {
      const selectedTeamData = allTeamEntries.find(([k]) => k === selectedTeamKey);
      if (!selectedTeamData) return null;

      const [, team] = selectedTeamData;
      const teamRecord = scheduleMatrix.get(selectedTeamKey);

      // Calculate actual record
      const actualWins = team.teamScores.filter((score, idx) => {
        const oppScore = team.opponentScores[idx];
        return score.value > 0 && oppScore && score.value > oppScore.value;
      }).length;

      const actualGames = team.teamScores.filter(d => d.value > 0).length;
      const actualWinPct = actualGames > 0 ? actualWins / actualGames : 0;

      // Find team in summary stats
      const teamSummary = summaryStats.find(s => s.teamKey === selectedTeamKey);
      const overallWinPct = teamSummary?.winPct || 0;

      // Win % of other teams with this team's schedule
      const othersWithMyScheduleWinPcts: number[] = [];
      for (const [otherKey] of allTeamEntries) {
        if (otherKey === selectedTeamKey) continue;
        const otherRecord = scheduleMatrix.get(otherKey)?.get(selectedTeamKey);
        if (otherRecord && otherRecord.totalGames > 0) {
          othersWithMyScheduleWinPcts.push(otherRecord.wins / otherRecord.totalGames);
        }
      }
      const othersWithMyScheduleAvg =
        othersWithMyScheduleWinPcts.length > 0 ? mean(othersWithMyScheduleWinPcts) : 0;

      // This team's win % with other schedules
      const myWithOthersWinPcts: number[] = [];
      if (teamRecord) {
        for (const record of teamRecord.values()) {
          if (record.totalGames > 0) {
            myWithOthersWinPcts.push(record.wins / record.totalGames);
          }
        }
      }
      const myWithOthersAvg = myWithOthersWinPcts.length > 0 ? mean(myWithOthersWinPcts) : 0;

      // Simple, meaningful luck calculation: Actual vs Expected based on point differential
      const teamPoints = team.teamScores
        .filter(d => d.value > 0)
        .reduce((sum, d) => sum + d.value, 0);
      const oppPoints = team.opponentScores
        .filter(d => d.value > 0)
        .reduce((sum, d) => sum + d.value, 0);
      const pointDiff = teamPoints - oppPoints;

      // Expected win% based on point differential (Pythagorean expectation)
      const expectedWinPct =
        actualGames > 0
          ? Math.max(0, Math.min(1, 0.5 + (pointDiff / (teamPoints + oppPoints)) * 1.5))
          : 0;

      const luckRating = actualWinPct - expectedWinPct; // Positive = luckier than point diff suggests
      const scheduleLuck = actualWinPct - othersWithMyScheduleAvg; // How much easier/harder was actual schedule
      const performanceLuck = actualWinPct - myWithOthersAvg; // How much better/worse than expected with schedules

      // Build distributions
      const myDistribution = new Map<number, number>();
      const othersDistribution = new Map<number, number>();

      for (let wins = 0; wins <= actualGames; wins++) {
        myDistribution.set(wins, 0);
        othersDistribution.set(wins, 0);
      }

      // Team with different schedules
      if (teamRecord) {
        for (const record of teamRecord.values()) {
          if (record.totalGames > 0) {
            const wins = Math.round((record.wins / record.totalGames) * actualGames);
            myDistribution.set(wins, (myDistribution.get(wins) || 0) + 1);
          }
        }
      }

      // Other teams with this schedule
      for (const [otherKey] of allTeamEntries) {
        if (otherKey === selectedTeamKey) continue;
        const otherRecord = scheduleMatrix.get(otherKey)?.get(selectedTeamKey);
        if (otherRecord && otherRecord.totalGames > 0) {
          const wins = Math.round((otherRecord.wins / otherRecord.totalGames) * actualGames);
          othersDistribution.set(wins, (othersDistribution.get(wins) || 0) + 1);
        }
      }

      const myDistChart = Array.from(myDistribution.entries()).map(([wins, count]) => ({
        wins,
        count,
        isActual: wins === actualWins,
      }));

      const othersDistChart = Array.from(othersDistribution.entries()).map(([wins, count]) => ({
        wins,
        count,
        isActual: wins === actualWins,
      }));

      return {
        team,
        actualWins,
        actualGames,
        actualWinPct,
        overallWinPct,
        expectedWinPct,
        pointDiff,
        othersWithMyScheduleAvg,
        myWithOthersAvg,
        scheduleLuck,
        performanceLuck,
        luckRating,
        myDistChart,
        othersDistChart,
      };
    }, [selectedTeamKey, allTeamEntries, scheduleMatrix, summaryStats]);

    // Comprehensive luck analysis for all teams
    const allTeamsLuckAnalysis = useMemo(() => {
      return allTeamEntries
        .map(([teamKey, team]) => {
          // Calculate actual record
          const actualWins = team.teamScores.filter((score, idx) => {
            const oppScore = team.opponentScores[idx];
            return score.value > 0 && oppScore && score.value > oppScore.value;
          }).length;

          const actualGames = team.teamScores.filter(d => d.value > 0).length;
          const actualWinPct = actualGames > 0 ? actualWins / actualGames : 0;

          // Find team in summary stats
          const teamSummary = summaryStats.find(s => s.teamKey === teamKey);
          const overallWinPct = teamSummary?.winPct || 0;

          // Schedule difficulty (how others do with this schedule)
          const othersWithMyScheduleWinPcts: number[] = [];
          for (const [otherKey] of allTeamEntries) {
            if (otherKey === teamKey) continue;
            const otherRecord = scheduleMatrix.get(otherKey)?.get(teamKey);
            if (otherRecord && otherRecord.totalGames > 0) {
              othersWithMyScheduleWinPcts.push(otherRecord.wins / otherRecord.totalGames);
            }
          }
          const scheduleEase =
            othersWithMyScheduleWinPcts.length > 0 ? mean(othersWithMyScheduleWinPcts) : 0;

          // Simple, meaningful luck calculation: Actual vs Expected based on point differential
          const teamPoints = team.teamScores
            .filter(d => d.value > 0)
            .reduce((sum, d) => sum + d.value, 0);
          const oppPoints = team.opponentScores
            .filter(d => d.value > 0)
            .reduce((sum, d) => sum + d.value, 0);
          const pointDiff = teamPoints - oppPoints;

          // Expected win% based on point differential (Pythagorean expectation)
          const expectedWinPct =
            actualGames > 0
              ? Math.max(0, Math.min(1, 0.5 + (pointDiff / (teamPoints + oppPoints)) * 1.5))
              : 0;

          const luckRating = actualWinPct - expectedWinPct; // Positive = luckier than point diff suggests

          return {
            teamKey,
            teamInfo: team.teamInfo,
            actualWins,
            actualGames,
            actualWinPct,
            overallWinPct,
            scheduleEase,
            expectedWinPct,
            luckRating,
            pointDiff,
          };
        })
        .sort((a, b) => b.luckRating - a.luckRating); // Sort by luck (most lucky first)
    }, [allTeamEntries, scheduleMatrix, summaryStats]);

    const teamsList = allTeamEntries.map(([key, t]) => ({ key, info: t.teamInfo }));

    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule Analysis</CardTitle>
          <CardDescription>
            Hypothetical records - &quot;What would each team&apos;s record be with everyone
            else&apos;s schedule?&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-auto'>
            <table className='w-full text-xs border-collapse'>
              <thead>
                <tr>
                  <th className='sticky left-0 z-10 bg-muted px-2 py-1 text-left border-r'>
                    vs Opponent →
                  </th>
                  {teamsList.map(team => (
                    <th
                      key={team.key}
                      className='px-1 py-1 text-center border-r min-w-[60px]'
                      title={team.info.teamName}
                    >
                      <div className='transform -rotate-45 origin-center whitespace-nowrap text-xs'>
                        {team.info.teamName.slice(0, 12)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teamsList.map(team => {
                  const teamRecord = scheduleMatrix.get(team.key);

                  return (
                    <tr key={team.key} className='border-b'>
                      <td className='sticky left-0 z-10 bg-muted px-2 py-1 font-medium border-r'>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{team.info.teamName}</span>
                          <span className='text-xs text-muted-foreground'>
                            {team.info.leagueName}
                          </span>
                        </div>
                      </td>
                      {teamsList.map(opponent => {
                        if (team.key === opponent.key) {
                          return (
                            <td
                              key={opponent.key}
                              className='px-1 py-1 text-center border-r bg-muted/50'
                            >
                              —
                            </td>
                          );
                        }

                        const record = teamRecord?.get(opponent.key);
                        const wins = record?.wins || 0;
                        const losses = record?.losses || 0;
                        const total = record?.totalGames || 0;

                        if (total === 0) {
                          return (
                            <td
                              key={opponent.key}
                              className='px-1 py-1 text-center border-r bg-gray-50'
                            >
                              <span className='text-muted-foreground'>—</span>
                            </td>
                          );
                        }

                        const winPct = total > 0 ? wins / total : 0;
                        const recordColor =
                          winPct > 0.5 ? '#16a34a' : winPct === 0.5 ? '#ca8a04' : '#dc2626';

                        return (
                          <td
                            key={opponent.key}
                            className='px-1 py-1 text-center border-r'
                            style={{ backgroundColor: `${recordColor}20` }}
                          >
                            <div
                              className='font-mono text-xs font-medium'
                              style={{ color: recordColor }}
                            >
                              {wins}-{losses}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
            <div className='rounded-md border p-3'>
              <h4 className='font-semibold mb-2'>Legend</h4>
              <div className='space-y-1 text-xs'>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded' style={{ backgroundColor: '#16a34a20' }}></div>
                  <span>Winning record</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded' style={{ backgroundColor: '#ca8a0420' }}></div>
                  <span>Even record</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded' style={{ backgroundColor: '#dc262620' }}></div>
                  <span>Losing record</span>
                </div>
              </div>
            </div>

            <div className='rounded-md border p-3'>
              <h4 className='font-semibold mb-2'>Analysis</h4>
              <p className='text-xs text-muted-foreground'>
                Reveals schedule strength by showing how each team would perform with different
                opponents.
              </p>
            </div>

            <div className='rounded-md border p-3'>
              <h4 className='font-semibold mb-2'>Usage</h4>
              <p className='text-xs text-muted-foreground'>
                Row team vs Column team schedule. &quot;5-2&quot; means Row team would be 5-2 if
                they faced Column team&apos;s opponents.
              </p>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className='mt-8'>
            <h3 className='mb-4 text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
              Hypothetical Records Summary
            </h3>

            <div className='rounded-md border'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-4 py-3 text-center'>Rank</th>
                    <th className='px-4 py-3 text-left'>Team</th>
                    <th className='px-4 py-3 text-center'>Record</th>
                    <th className='px-4 py-3 text-center'>Win %</th>
                    <th className='px-4 py-3 text-center'>Total Games</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryStats.map((stat, index) => (
                    <tr key={stat.teamKey} className='border-t hover:bg-muted/20'>
                      <td className='px-4 py-3 text-center'>
                        <span
                          className='rounded-full px-2 py-1 text-xs font-medium'
                          style={{
                            backgroundColor: getRankColor(index + 1, 24),
                            color: getTextColor(getRankColor(index + 1, 24)),
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='font-medium'>{stat.teamInfo.teamName}</div>
                        <div className='text-xs text-muted-foreground'>
                          {stat.teamInfo.leagueName}
                        </div>
                      </td>
                      <td className='px-4 py-3 text-center font-mono font-bold'>
                        {stat.totalWins}-{stat.totalLosses}
                      </td>
                      <td className='px-4 py-3 text-center font-mono'>
                        {(stat.winPct * 100).toFixed(1)}%
                      </td>
                      <td className='px-4 py-3 text-center font-mono text-muted-foreground'>
                        {stat.totalGames}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* League-by-League Breakdown */}
          <div className='mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* AFC League */}
            <div>
              <h4
                className='mb-3 text-base font-semibold'
                style={{ color: colors.core.crimsonRed }}
              >
                AFC League Analysis
              </h4>
              <div className='rounded-md border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/30'>
                    <tr>
                      <th className='px-3 py-2 text-center'>Rank</th>
                      <th className='px-3 py-2 text-left'>Team</th>
                      <th className='px-3 py-2 text-center'>Record</th>
                      <th className='px-3 py-2 text-center'>Win %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {afcSummary.map((stat, index) => (
                      <tr key={stat.teamKey} className='border-t hover:bg-muted/20'>
                        <td className='px-3 py-2 text-center'>
                          <span
                            className='rounded-full px-2 py-1 text-xs font-medium'
                            style={{
                              backgroundColor: getRankColor(index + 1, afcSummary.length),
                              color: getTextColor(getRankColor(index + 1, afcSummary.length)),
                            }}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className='px-3 py-2 font-medium'>{stat.teamInfo.teamName}</td>
                        <td className='px-3 py-2 text-center font-mono font-bold'>
                          {stat.totalWins}-{stat.totalLosses}
                        </td>
                        <td className='px-3 py-2 text-center font-mono'>
                          {(stat.winPct * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* NFC League */}
            <div>
              <h4
                className='mb-3 text-base font-semibold'
                style={{ color: colors.core.crimsonRed }}
              >
                NFC League Analysis
              </h4>
              <div className='rounded-md border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/30'>
                    <tr>
                      <th className='px-3 py-2 text-center'>Rank</th>
                      <th className='px-3 py-2 text-left'>Team</th>
                      <th className='px-3 py-2 text-center'>Record</th>
                      <th className='px-3 py-2 text-center'>Win %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nfcSummary.map((stat, index) => (
                      <tr key={stat.teamKey} className='border-t hover:bg-muted/20'>
                        <td className='px-3 py-2 text-center'>
                          <span
                            className='rounded-full px-2 py-1 text-xs font-medium'
                            style={{
                              backgroundColor: getRankColor(index + 1, nfcSummary.length),
                              color: getTextColor(getRankColor(index + 1, nfcSummary.length)),
                            }}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className='px-3 py-2 font-medium'>{stat.teamInfo.teamName}</td>
                        <td className='px-3 py-2 text-center font-mono font-bold'>
                          {stat.totalWins}-{stat.totalLosses}
                        </td>
                        <td className='px-3 py-2 text-center font-mono'>
                          {(stat.winPct * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Schedule Difficulty Analysis */}
          <div className='mt-8'>
            <h3 className='mb-4 text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
              Schedule Difficulty Rankings
            </h3>
            <p className='text-sm text-muted-foreground mb-4'>
              Which schedules are hardest? Teams with lowest average win% had the toughest
              opponents.
            </p>

            <div className='rounded-md border'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-4 py-3 text-center'>Difficulty Rank</th>
                    <th className='px-4 py-3 text-left'>Schedule Owner</th>
                    <th className='px-4 py-3 text-center'>Avg Win % vs This Schedule</th>
                    <th className='px-4 py-3 text-center'>Games</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleDifficulty.map((sched, index) => (
                    <tr key={sched.scheduleOwnerKey} className='border-t hover:bg-muted/20'>
                      <td className='px-4 py-3 text-center'>
                        <span
                          className='rounded-full px-2 py-1 text-xs font-medium'
                          style={{
                            backgroundColor: getRankColor(index + 1, 24),
                            color: getTextColor(getRankColor(index + 1, 24)),
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='font-medium'>{sched.scheduleOwnerInfo.teamName}</div>
                        <div className='text-xs text-muted-foreground'>
                          {sched.scheduleOwnerInfo.leagueName}
                        </div>
                      </td>
                      <td className='px-4 py-3 text-center font-mono'>
                        <span
                          style={{
                            color:
                              sched.avgWinPct < 0.4
                                ? colors.rdylgn[1]
                                : sched.avgWinPct < 0.6
                                  ? colors.rdylgn[5]
                                  : colors.rdylgn[9],
                          }}
                        >
                          {(sched.avgWinPct * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className='px-4 py-3 text-center font-mono text-muted-foreground'>
                        {sched.totalGames}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* League-by-League Matrices */}
          <div className='mt-8 space-y-8'>
            <h3 className='text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
              League-by-League Schedule Analysis
            </h3>

            {/* AFC Matrix */}
            <div>
              <h4 className='mb-3 text-base font-semibold'>AFC League (12×12 Matrix)</h4>
              <div className='overflow-auto rounded-md border'>
                <table className='w-full text-xs border-collapse'>
                  <thead>
                    <tr>
                      <th className='sticky left-0 z-10 bg-muted px-2 py-1 text-left border-r'>
                        AFC Team →
                      </th>
                      {afcTeams.map(([key, t]) => (
                        <th
                          key={key}
                          className='px-1 py-1 text-center border-r min-w-[50px]'
                          title={t.teamInfo.teamName}
                        >
                          <div className='transform -rotate-45 origin-center whitespace-nowrap text-xs'>
                            {t.teamInfo.teamName.slice(0, 10)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {afcTeams.map(([teamKey, team]) => {
                      const teamRecord = afcMatrix.get(teamKey);

                      return (
                        <tr key={teamKey} className='border-b'>
                          <td className='sticky left-0 z-10 bg-muted px-2 py-1 font-medium border-r text-xs'>
                            {team.teamInfo.teamName}
                          </td>
                          {afcTeams.map(([opponentKey, _opponent]) => {
                            if (teamKey === opponentKey) {
                              return (
                                <td
                                  key={opponentKey}
                                  className='px-1 py-1 text-center border-r bg-muted/50'
                                >
                                  —
                                </td>
                              );
                            }

                            const record = teamRecord?.get(opponentKey);
                            const wins = record?.wins || 0;
                            const losses = record?.losses || 0;
                            const total = record?.totalGames || 0;

                            if (total === 0) {
                              return (
                                <td
                                  key={opponentKey}
                                  className='px-1 py-1 text-center border-r bg-gray-50'
                                >
                                  <span className='text-muted-foreground'>—</span>
                                </td>
                              );
                            }

                            const winPct = total > 0 ? wins / total : 0;
                            const recordColor =
                              winPct > 0.5 ? '#16a34a' : winPct === 0.5 ? '#ca8a04' : '#dc2626';

                            return (
                              <td
                                key={opponentKey}
                                className='px-1 py-1 text-center border-r'
                                style={{ backgroundColor: `${recordColor}20` }}
                              >
                                <div
                                  className='font-mono text-xs font-medium'
                                  style={{ color: recordColor }}
                                >
                                  {wins}-{losses}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* NFC Matrix */}
            <div>
              <h4 className='mb-3 text-base font-semibold'>NFC League (12×12 Matrix)</h4>
              <div className='overflow-auto rounded-md border'>
                <table className='w-full text-xs border-collapse'>
                  <thead>
                    <tr>
                      <th className='sticky left-0 z-10 bg-muted px-2 py-1 text-left border-r'>
                        NFC Team →
                      </th>
                      {nfcTeams.map(([key, t]) => (
                        <th
                          key={key}
                          className='px-1 py-1 text-center border-r min-w-[50px]'
                          title={t.teamInfo.teamName}
                        >
                          <div className='transform -rotate-45 origin-center whitespace-nowrap text-xs'>
                            {t.teamInfo.teamName.slice(0, 10)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nfcTeams.map(([teamKey, team]) => {
                      const teamRecord = nfcMatrix.get(teamKey);

                      return (
                        <tr key={teamKey} className='border-b'>
                          <td className='sticky left-0 z-10 bg-muted px-2 py-1 font-medium border-r text-xs'>
                            {team.teamInfo.teamName}
                          </td>
                          {nfcTeams.map(([opponentKey, _opponent]) => {
                            if (teamKey === opponentKey) {
                              return (
                                <td
                                  key={opponentKey}
                                  className='px-1 py-1 text-center border-r bg-muted/50'
                                >
                                  —
                                </td>
                              );
                            }

                            const record = teamRecord?.get(opponentKey);
                            const wins = record?.wins || 0;
                            const losses = record?.losses || 0;
                            const total = record?.totalGames || 0;

                            if (total === 0) {
                              return (
                                <td
                                  key={opponentKey}
                                  className='px-1 py-1 text-center border-r bg-gray-50'
                                >
                                  <span className='text-muted-foreground'>—</span>
                                </td>
                              );
                            }

                            const winPct = total > 0 ? wins / total : 0;
                            const recordColor =
                              winPct > 0.5 ? '#16a34a' : winPct === 0.5 ? '#ca8a04' : '#dc2626';

                            return (
                              <td
                                key={opponentKey}
                                className='px-1 py-1 text-center border-r'
                                style={{ backgroundColor: `${recordColor}20` }}
                              >
                                <div
                                  className='font-mono text-xs font-medium'
                                  style={{ color: recordColor }}
                                >
                                  {wins}-{losses}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Comprehensive Luck Rankings */}
          <div className='mt-8'>
            <h3 className='mb-4 text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
              League-Wide Luck Rankings
            </h3>

            <div className='rounded-md border'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-4 py-3 text-center'>Luck Rank</th>
                    <th className='px-4 py-3 text-left'>Team</th>
                    <th className='px-4 py-3 text-center'>Actual Record</th>
                    <th className='px-4 py-3 text-center'>Expected Win%</th>
                    <th className='px-4 py-3 text-center'>Point Diff</th>
                    <th className='px-4 py-3 text-center'>Luck Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {allTeamsLuckAnalysis.map((analysis, index) => (
                    <tr key={analysis.teamKey} className='border-t hover:bg-muted/20'>
                      <td className='px-4 py-3 text-center'>
                        <span
                          className='rounded-full px-2 py-1 text-xs font-medium'
                          style={{
                            backgroundColor: getRankColor(index + 1, 24),
                            color: getTextColor(getRankColor(index + 1, 24)),
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='font-medium'>{analysis.teamInfo.teamName}</div>
                        <div className='text-xs text-muted-foreground'>
                          {analysis.teamInfo.leagueName}
                        </div>
                      </td>
                      <td className='px-4 py-3 text-center font-mono font-bold'>
                        {analysis.actualWins}-{analysis.actualGames - analysis.actualWins}
                      </td>
                      <td className='px-4 py-3 text-center font-mono'>
                        {(analysis.expectedWinPct * 100).toFixed(1)}%
                      </td>
                      <td className='px-4 py-3 text-center font-mono'>
                        <span
                          style={{
                            color:
                              analysis.pointDiff > 0
                                ? colors.rdylgn[8]
                                : analysis.pointDiff < 0
                                  ? colors.rdylgn[2]
                                  : colors.rdylgn[5],
                          }}
                        >
                          {analysis.pointDiff > 0 ? '+' : ''}
                          {analysis.pointDiff.toFixed(1)}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-center'>
                        <span
                          className='font-mono font-bold'
                          style={{
                            color:
                              analysis.luckRating > 0.05
                                ? colors.rdylgn[8]
                                : analysis.luckRating < -0.05
                                  ? colors.rdylgn[2]
                                  : colors.rdylgn[5],
                          }}
                        >
                          {analysis.luckRating > 0 ? '+' : ''}
                          {(analysis.luckRating * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team-Specific Distribution Analysis */}
          <div className='mt-8'>
            <h3 className='mb-4 text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
              Team Distribution Analysis
            </h3>

            <div className='mb-6'>
              <label className='text-sm font-medium mb-2 block'>
                Select Team for Distribution Analysis
              </label>
              <Select value={selectedTeamKey} onValueChange={setSelectedTeamKey}>
                <SelectTrigger className='w-80'>
                  <SelectValue placeholder='Select team' />
                </SelectTrigger>
                <SelectContent>
                  {teamOptions.map(opt => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTeamLuckAnalysis && (
              <div className='space-y-6'>
                {/* Four-Metric Summary */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <div className='rounded-md border p-4'>
                    <h4 className='font-semibold text-sm mb-2'>Overall Strength</h4>
                    <div className='text-2xl font-bold' style={{ color: colors.core.regalGold }}>
                      {(selectedTeamLuckAnalysis.overallWinPct * 100).toFixed(1)}%
                    </div>
                    <div className='text-xs text-muted-foreground'>vs all teams</div>
                  </div>

                  <div className='rounded-md border p-4'>
                    <h4 className='font-semibold text-sm mb-2'>Current Performance</h4>
                    <div className='text-2xl font-bold' style={{ color: colors.core.regalGold }}>
                      {(selectedTeamLuckAnalysis.actualWinPct * 100).toFixed(1)}%
                    </div>
                    <div className='text-xs text-muted-foreground'>with actual schedule</div>
                  </div>

                  <div className='rounded-md border p-4'>
                    <h4 className='font-semibold text-sm mb-2'>Schedule Difficulty</h4>
                    <div className='text-2xl font-bold' style={{ color: colors.core.regalGold }}>
                      {(selectedTeamLuckAnalysis.othersWithMyScheduleAvg * 100).toFixed(1)}%
                    </div>
                    <div className='text-xs text-muted-foreground'>others with this schedule</div>
                  </div>

                  <div className='rounded-md border p-4'>
                    <h4 className='font-semibold text-sm mb-2'>Luck Rating</h4>
                    <div
                      className='text-2xl font-bold'
                      style={{
                        color:
                          selectedTeamLuckAnalysis.luckRating > 0.05
                            ? colors.rdylgn[8]
                            : selectedTeamLuckAnalysis.luckRating < -0.05
                              ? colors.rdylgn[2]
                              : colors.rdylgn[5],
                      }}
                    >
                      {selectedTeamLuckAnalysis.luckRating > 0 ? '+' : ''}
                      {(selectedTeamLuckAnalysis.luckRating * 100).toFixed(1)}%
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {selectedTeamLuckAnalysis.luckRating > 0.05
                        ? 'Lucky'
                        : selectedTeamLuckAnalysis.luckRating < -0.05
                          ? 'Unlucky'
                          : 'Neutral'}
                    </div>
                  </div>
                </div>

                {/* Distribution Charts */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {/* Team with different schedules */}
                  <div className='rounded-md border p-4'>
                    <h4 className='font-semibold mb-3'>
                      {selectedTeamLuckAnalysis.team.teamInfo.teamName} with Different Schedules
                    </h4>
                    <div className='h-64'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={selectedTeamLuckAnalysis.myDistChart}>
                          <XAxis
                            dataKey='wins'
                            label={{ value: 'Wins', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis
                            label={{ value: '# of Schedules', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip
                            formatter={value => [value, '# of Schedules']}
                            labelFormatter={wins => `${wins} Wins`}
                          />
                          <ReferenceLine
                            x={selectedTeamLuckAnalysis.actualWins}
                            stroke={colors.core.crimsonRed}
                            strokeWidth={2}
                            label={{ value: 'Actual', position: 'top' }}
                          />
                          <Bar dataKey='count'>
                            {selectedTeamLuckAnalysis.myDistChart.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.isActual ? colors.core.crimsonRed : colors.core.regalGold
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className='text-xs text-muted-foreground mt-2'>
                      Shows how many schedules would result in each win count for this team
                    </p>
                  </div>

                  {/* Other teams with this schedule */}
                  <div className='rounded-md border p-4'>
                    <h4 className='font-semibold mb-3'>
                      Other Teams with {selectedTeamLuckAnalysis.team.teamInfo.teamName}&apos;s
                      Schedule
                    </h4>
                    <div className='h-64'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={selectedTeamLuckAnalysis.othersDistChart}>
                          <XAxis
                            dataKey='wins'
                            label={{ value: 'Wins', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis
                            label={{ value: '# of Teams', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip
                            formatter={value => [value, '# of Teams']}
                            labelFormatter={wins => `${wins} Wins`}
                          />
                          <ReferenceLine
                            x={selectedTeamLuckAnalysis.actualWins}
                            stroke={colors.core.crimsonRed}
                            strokeWidth={2}
                            label={{ value: 'Actual', position: 'top' }}
                          />
                          <Bar dataKey='count'>
                            {selectedTeamLuckAnalysis.othersDistChart.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.isActual ? colors.core.crimsonRed : colors.rdylgn[6]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className='text-xs text-muted-foreground mt-2'>
                      Shows how many teams would achieve each win count with this team&apos;s
                      schedule
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className='mt-6 text-sm bg-muted/20 rounded-md p-4'>
            <h4 className='font-semibold mb-2'>How to Read This Analysis</h4>
            <div className='space-y-2 text-muted-foreground'>
              <p>
                <strong>Hypothetical Records:</strong> Shows what each team's record would be by
                comparing their weekly scores against every other team's actual opponents.
              </p>
              <p>
                <strong>Luck Rating:</strong> Actual Win% - Expected Win% (based on point
                differential). Positive = team won more games than their scoring suggests they
                should have (lucky). Negative = team lost games despite outscoring expectations
                (unlucky).
              </p>
              <p>
                <strong>Distribution Charts:</strong> Show the range of possible outcomes with
                different schedules, with the red line indicating actual performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Scatter Analysis Component
  function ScatterAnalysis() {
    return (
      <div className='space-y-8'>
        {/* Overall Team Efficiency */}
        <Card>
          <CardHeader>
            <CardTitle>Team Efficiency Analysis</CardTitle>
            <CardDescription>
              Points For vs Points Against. Teams in upper-left are dominant (high offense, low
              opponent scoring).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-96'>
              <ResponsiveContainer width='100%' height='100%'>
                <ScatterChart
                  data={(() => {
                    const data = allTeamEntries
                      .map(([teamKey, team]) => {
                        const pointsFor = team.teamScores
                          .filter(d => d.value > 0)
                          .reduce((sum, d) => sum + d.value, 0);
                        const pointsAgainst = team.opponentScores
                          .filter(d => d.value > 0)
                          .reduce((sum, d) => sum + d.value, 0);
                        const gamesPlayed = team.teamScores.filter(d => d.value > 0).length;

                        return {
                          teamKey,
                          teamName: team.teamInfo.teamName,
                          leagueName: team.teamInfo.leagueName,
                          pointsFor: gamesPlayed > 0 ? pointsFor / gamesPlayed : 0,
                          pointsAgainst: gamesPlayed > 0 ? pointsAgainst / gamesPlayed : 0,
                          totalFor: pointsFor,
                          totalAgainst: pointsAgainst,
                          gamesPlayed,
                        };
                      })
                      .filter(t => t.gamesPlayed > 0);

                    return data;
                  })()}
                  margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                >
                  <XAxis
                    type='number'
                    dataKey='pointsFor'
                    domain={['dataMin - 10', 'dataMax + 10']}
                    label={{
                      value: 'Skill',
                      position: 'insideBottom',
                      offset: -10,
                      style: { textAnchor: 'middle', fontSize: '12px' },
                    }}
                    tick={{ fontSize: 11 }}
                    tickFormatter={value => Number(value).toFixed(0)}
                  />
                  <YAxis
                    type='number'
                    dataKey='pointsAgainst'
                    domain={['dataMin - 10', 'dataMax + 10']}
                    reversed={true}
                    label={{
                      value: 'Luck',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: '12px' },
                    }}
                    tick={{ fontSize: 11 }}
                    tickFormatter={value => Number(value).toFixed(0)}
                  />
                  {/* Median reference lines */}
                  <ReferenceLine
                    x={median(
                      allTeamEntries
                        .map(([, team]) => {
                          const pointsFor = team.teamScores
                            .filter(d => d.value > 0)
                            .reduce((sum, d) => sum + d.value, 0);
                          const gamesPlayed = team.teamScores.filter(d => d.value > 0).length;
                          return gamesPlayed > 0 ? pointsFor / gamesPlayed : 0;
                        })
                        .filter(x => x > 0)
                    )}
                    stroke='rgba(156, 163, 175, 0.8)'
                    strokeDasharray='5 5'
                    strokeWidth={2}
                  />
                  <ReferenceLine
                    y={median(
                      allTeamEntries
                        .map(([, team]) => {
                          const pointsAgainst = team.opponentScores
                            .filter(d => d.value > 0)
                            .reduce((sum, d) => sum + d.value, 0);
                          const gamesPlayed = team.teamScores.filter(d => d.value > 0).length;
                          return gamesPlayed > 0 ? pointsAgainst / gamesPlayed : 0;
                        })
                        .filter(x => x > 0)
                    )}
                    stroke='rgba(156, 163, 175, 0.8)'
                    strokeDasharray='5 5'
                    strokeWidth={2}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div
                            className='p-4 rounded-lg shadow-xl border min-w-[240px]'
                            style={{
                              backgroundColor: colors.core.charcoalSteel,
                              borderColor: colors.core.regalGold,
                              color: 'white',
                            }}
                          >
                            <div
                              className='font-bold text-lg mb-1'
                              style={{ color: colors.core.regalGold }}
                            >
                              {data.teamName}
                            </div>
                            <div className='text-xs text-gray-300 mb-3'>{data.leagueName}</div>

                            <div className='space-y-3'>
                              <div>
                                <div className='flex items-center gap-2 mb-1'>
                                  <div
                                    className='w-3 h-3 rounded-full'
                                    style={{ backgroundColor: colors.rdylgn[8] }}
                                  ></div>
                                  <span className='font-medium'>Points Scored</span>
                                </div>
                                <div className='ml-5'>
                                  <div className='font-bold text-lg'>
                                    {data.pointsFor.toFixed(1)}/game
                                  </div>
                                  <div className='text-xs text-gray-400'>
                                    {data.totalFor.toFixed(1)} season total
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className='flex items-center gap-2 mb-1'>
                                  <div
                                    className='w-3 h-3 rounded-full'
                                    style={{ backgroundColor: colors.rdylgn[2] }}
                                  ></div>
                                  <span className='font-medium'>Points Allowed</span>
                                </div>
                                <div className='ml-5'>
                                  <div className='font-bold text-lg'>
                                    {data.pointsAgainst.toFixed(1)}/game
                                  </div>
                                  <div className='text-xs text-gray-400'>
                                    {data.totalAgainst.toFixed(1)} season total
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter
                    dataKey='pointsFor'
                    shape={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (!payload || !cx || !cy) return <g></g>;

                      // Find team data to get avatar
                      const teamData = allTeamEntries.find(([k]) => k === payload.teamKey)?.[1];
                      const avatarUrl = teamData?.teamInfo.avatar;

                      if (avatarUrl) {
                        return (
                          <g>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={14}
                              fill='white'
                              stroke={colors.core.regalGold}
                              strokeWidth={3}
                            />
                            <image
                              x={cx - 12}
                              y={cy - 12}
                              width={24}
                              height={24}
                              href={avatarUrl}
                              clipPath='circle(12px at 12px 12px)'
                            />
                          </g>
                        );
                      } else {
                        // Fallback to initials
                        const initials = payload.teamName
                          .split(' ')
                          .map((word: string) => word[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase();

                        return (
                          <g>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={12}
                              fill={colors.core.regalGold}
                              stroke='rgba(0,0,0,0.3)'
                              strokeWidth={2}
                            />
                            <text
                              x={cx}
                              y={cy + 1}
                              textAnchor='middle'
                              fontSize='9'
                              fontWeight='bold'
                              fill='white'
                            >
                              {initials}
                            </text>
                          </g>
                        );
                      }
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Positional Efficiency Analysis */}
        {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => (
          <Card key={position}>
            <CardHeader>
              <CardTitle>{position} Efficiency Analysis</CardTitle>
              <CardDescription>
                {position} Points For vs Points Against. Shows which teams excel at {position}{' '}
                offense vs defense.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <ScatterChart
                    data={(() => {
                      const posData = positionsMap.get(position);
                      const posTeamsMap = new Map(posData?.teams || []);

                      return allTeamEntries
                        .map(([teamKey, team]) => {
                          const teamPosData = posTeamsMap.get(teamKey);

                          // Points for (our position scoring)
                          const posPointsFor =
                            teamPosData?.scores
                              .filter(d => d.value !== 0)
                              .reduce((sum, d) => sum + d.value, 0) || 0;

                          // Points against (opponent position scoring vs us) - CALCULATE MANUALLY
                          let posPointsAgainst = 0;
                          if (teamPosData) {
                            // For each week this team played, get opponent's position score
                            for (const scoreData of teamPosData.scores) {
                              if (scoreData.value === 0) continue;

                              // Find who this team played against that week
                              const teamData = allTeamEntries.find(([k]) => k === teamKey)?.[1];
                              const opponentScore = teamData?.opponentScores.find(
                                d => d.week === scoreData.week
                              );

                              if (opponentScore && opponentScore.value > 0) {
                                // Find the opponent team by looking for matching opponent score
                                for (const [oppKey, oppTeam] of allTeamEntries) {
                                  if (oppKey === teamKey) continue;
                                  const oppTeamScore = oppTeam.teamScores.find(
                                    d => d.week === scoreData.week
                                  );
                                  if (
                                    oppTeamScore &&
                                    Math.abs(oppTeamScore.value - opponentScore.value) < 0.01
                                  ) {
                                    // Found the opponent - get their position score that week
                                    const oppPosData = posTeamsMap.get(oppKey);
                                    const oppPosScore =
                                      oppPosData?.scores.find(d => d.week === scoreData.week)
                                        ?.value || 0;
                                    posPointsAgainst += oppPosScore;
                                    break;
                                  }
                                }
                              }
                            }
                          }

                          const gamesPlayed =
                            teamPosData?.scores.filter(d => d.value !== 0).length || 0;

                          return {
                            teamKey,
                            teamName: team.teamInfo.teamName,
                            leagueName: team.teamInfo.leagueName,
                            pointsFor: gamesPlayed > 0 ? posPointsFor / gamesPlayed : 0,
                            pointsAgainst: gamesPlayed > 0 ? posPointsAgainst / gamesPlayed : 0,
                            gamesPlayed,
                            totalFor: posPointsFor,
                            totalAgainst: posPointsAgainst,
                          };
                        })
                        .filter(t => t.gamesPlayed > 0);
                    })()}
                    margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                  >
                    <XAxis
                      type='number'
                      dataKey='pointsFor'
                      domain={['dataMin - 2', 'dataMax + 2']}
                      label={{
                        value: 'Skill',
                        position: 'insideBottom',
                        offset: -10,
                        style: { textAnchor: 'middle', fontSize: '12px' },
                      }}
                      tick={{ fontSize: 11 }}
                      tickFormatter={value => Number(value).toFixed(0)}
                    />
                    <YAxis
                      type='number'
                      dataKey='pointsAgainst'
                      domain={['dataMin - 2', 'dataMax + 2']}
                      reversed={true}
                      label={{
                        value: 'Luck',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: '12px' },
                      }}
                      tick={{ fontSize: 11 }}
                      tickFormatter={value => Number(value).toFixed(0)}
                    />
                    {/* Median reference lines */}
                    <ReferenceLine
                      x={(() => {
                        const posData = positionsMap.get(position);
                        const posTeamsMap = new Map(posData?.teams || []);
                        const values = allTeamEntries
                          .map(([teamKey]) => {
                            const teamPosData = posTeamsMap.get(teamKey);
                            const pointsFor =
                              teamPosData?.scores
                                .filter(d => d.value !== 0)
                                .reduce((sum, d) => sum + d.value, 0) || 0;
                            const gamesPlayed =
                              teamPosData?.scores.filter(d => d.value !== 0).length || 0;
                            return gamesPlayed > 0 ? pointsFor / gamesPlayed : 0;
                          })
                          .filter(x => x !== 0);
                        return median(values);
                      })()}
                      stroke='#6b7280'
                      strokeDasharray='8 4'
                      strokeWidth={2}
                    />
                    <ReferenceLine
                      y={(() => {
                        const posData = positionsMap.get(position);
                        const posTeamsMap = new Map(posData?.teams || []);

                        // Use same calculation as chart data
                        const chartData = allTeamEntries
                          .map(([teamKey, team]) => {
                            const teamPosData = posTeamsMap.get(teamKey);

                            let posPointsAgainst = 0;
                            if (teamPosData) {
                              for (const scoreData of teamPosData.scores) {
                                if (scoreData.value === 0) continue;

                                const teamData = allTeamEntries.find(([k]) => k === teamKey)?.[1];
                                const opponentScore = teamData?.opponentScores.find(
                                  d => d.week === scoreData.week
                                );

                                if (opponentScore && opponentScore.value > 0) {
                                  for (const [oppKey, oppTeam] of allTeamEntries) {
                                    if (oppKey === teamKey) continue;
                                    const oppTeamScore = oppTeam.teamScores.find(
                                      d => d.week === scoreData.week
                                    );
                                    if (
                                      oppTeamScore &&
                                      Math.abs(oppTeamScore.value - opponentScore.value) < 0.01
                                    ) {
                                      const oppPosData = posTeamsMap.get(oppKey);
                                      const oppPosScore =
                                        oppPosData?.scores.find(d => d.week === scoreData.week)
                                          ?.value || 0;
                                      posPointsAgainst += oppPosScore;
                                      break;
                                    }
                                  }
                                }
                              }
                            }

                            const gamesPlayed =
                              teamPosData?.scores.filter(d => d.value !== 0).length || 0;
                            return gamesPlayed > 0 ? posPointsAgainst / gamesPlayed : 0;
                          })
                          .filter(x => x > 0);

                        return median(chartData);
                      })()}
                      stroke='#6b7280'
                      strokeDasharray='8 4'
                      strokeWidth={2}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return (
                            <div
                              className='p-4 rounded-lg shadow-xl border min-w-[280px]'
                              style={{
                                backgroundColor: colors.core.charcoalSteel,
                                borderColor: colors.core.regalGold,
                                color: 'white',
                              }}
                            >
                              <div
                                className='font-bold text-lg mb-1'
                                style={{ color: colors.core.regalGold }}
                              >
                                {data.teamName}
                              </div>
                              <div className='text-xs text-gray-300 mb-3'>{data.leagueName}</div>

                              <div className='space-y-3'>
                                <div>
                                  <div className='flex items-center gap-2 mb-1'>
                                    <div
                                      className='w-3 h-3 rounded-full'
                                      style={{ backgroundColor: colors.rdylgn[8] }}
                                    ></div>
                                    <span className='font-medium'>{position} Scored</span>
                                  </div>
                                  <div className='ml-5'>
                                    <div className='font-bold text-lg'>
                                      {data.pointsFor.toFixed(1)}/game
                                    </div>
                                    <div className='text-xs text-gray-400'>
                                      {data.totalFor.toFixed(1)} season total
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <div className='flex items-center gap-2 mb-1'>
                                    <div
                                      className='w-3 h-3 rounded-full'
                                      style={{ backgroundColor: colors.rdylgn[2] }}
                                    ></div>
                                    <span className='font-medium'>{position} Allowed</span>
                                  </div>
                                  <div className='ml-5'>
                                    <div className='font-bold text-lg'>
                                      {data.pointsAgainst.toFixed(1)}/game
                                    </div>
                                    <div className='text-xs text-gray-400'>
                                      {data.totalAgainst.toFixed(1)} season total
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter
                      dataKey='pointsFor'
                      shape={(props: any) => {
                        const { cx, cy, payload } = props;
                        if (!payload || !cx || !cy) return <g></g>;

                        // Find team data to get avatar
                        const teamData = allTeamEntries.find(([k]) => k === payload.teamKey)?.[1];
                        const avatarUrl = teamData?.teamInfo.avatar;

                        if (avatarUrl) {
                          return (
                            <g>
                              <circle
                                cx={cx}
                                cy={cy}
                                r={12}
                                fill='white'
                                stroke={colors.core.regalGold}
                                strokeWidth={2}
                              />
                              <image
                                x={cx - 10}
                                y={cy - 10}
                                width={20}
                                height={20}
                                href={avatarUrl}
                                clipPath='circle(10px at 10px 10px)'
                              />
                            </g>
                          );
                        } else {
                          // Fallback to initials
                          const initials = payload.teamName
                            .split(' ')
                            .map((word: string) => word[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase();

                          return (
                            <g>
                              <circle
                                cx={cx}
                                cy={cy}
                                r={10}
                                fill={colors.core.regalGold}
                                stroke='rgba(0,0,0,0.3)'
                                strokeWidth={2}
                              />
                              <text
                                x={cx}
                                y={cy + 1}
                                textAnchor='middle'
                                fontSize='8'
                                fontWeight='bold'
                                fill='white'
                              >
                                {initials}
                              </text>
                            </g>
                          );
                        }
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Performance Trends Component
  function TrendsView() {
    // Calculate league data for sorting (season view for consistency)
    const leagueData = useMemo(() => {
      const teams = allTeamEntries
        .map(([key, t]) => {
          const teamTotal = t.teamScores.filter(d => d.value > 0).reduce((a, d) => a + d.value, 0);
          return {
            key,
            teamInfo: t.teamInfo,
            teamTotal,
          };
        })
        .filter(team => team.teamTotal > 0);

      // Calculate ranks
      const teamTotals = teams.map(t => t.teamTotal);
      const teamRanks = rank(teamTotals);

      return teams
        .map((team, index) => ({
          ...team,
          rank: teamRanks[index],
        }))
        .sort((a, b) => a.rank - b.rank);
    }, [allTeamEntries]);

    return (
      <div className='space-y-8'>
        {/* Power Rankings Evolution */}
        <Card>
          <CardHeader>
            <CardTitle>Power Rankings Evolution</CardTitle>
            <CardDescription>
              Advanced power rankings using 50% avg points, 30% expected wins, 20% rolling average.
              Higher scores = stronger teams.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-auto rounded-md border'>
              <table className='w-full text-xs'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='sticky left-0 z-10 bg-muted px-3 py-3 text-left font-semibold min-w-[140px]'>
                      Team
                    </th>
                    {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i + 1).map(week => (
                      <th
                        key={week}
                        className='px-3 py-3 text-center font-semibold min-w-[50px]'
                        style={{ backgroundColor: colors.core.charcoalSteel, color: 'white' }}
                      >
                        W{week}
                      </th>
                    ))}
                    <th
                      className='px-3 py-3 text-center font-semibold min-w-[80px]'
                      style={{ backgroundColor: colors.core.crimsonRed, color: 'white' }}
                    >
                      Weekly Trend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Calculate power rankings for each week
                    const weeklyPowerRankings = new Map<
                      string,
                      {
                        teamInfo: any;
                        weeklyScores: number[];
                        weeklyRanks: number[];
                        trend: string;
                      }
                    >();

                    // Helper function to calculate z-scores
                    const calculateZScore = (values: number[]): number[] => {
                      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
                      const stdDev = Math.sqrt(
                        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
                          values.length
                      );
                      return stdDev === 0
                        ? values.map(() => 0)
                        : values.map(val => (val - mean) / stdDev);
                    };

                    // For each completed week, calculate power rankings
                    for (let week = 1; week <= dataset.currentWeek - 1; week++) {
                      const weekTeams = allTeamEntries
                        .map(([key, t]) => {
                          // Get team data up to this week
                          const weeklyScores = t.teamScores
                            .filter(d => d.week <= week && d.value > 0)
                            .map(d => d.value);

                          if (weeklyScores.length === 0) return null;

                          // Calculate metrics for power ranking
                          const avgPoints =
                            weeklyScores.reduce((sum, score) => sum + score, 0) /
                            weeklyScores.length;

                          // Expected wins - how many wins this avg score would get vs all opponents
                          let expectedWins = 0;
                          for (let checkWeek = 1; checkWeek <= week; checkWeek++) {
                            const myScore =
                              t.teamScores.find(d => d.week === checkWeek)?.value || 0;
                            if (myScore > 0) {
                              // Count how many teams this score would beat that week
                              let winsThisWeek = 0;
                              let gamesThisWeek = 0;
                              for (const [, otherTeam] of allTeamEntries) {
                                const otherScore =
                                  otherTeam.teamScores.find(d => d.week === checkWeek)?.value || 0;
                                if (otherScore > 0) {
                                  gamesThisWeek++;
                                  if (myScore > otherScore) winsThisWeek++;
                                }
                              }
                              expectedWins += gamesThisWeek > 0 ? winsThisWeek / gamesThisWeek : 0;
                            }
                          }

                          // Rolling 3-week average (or all weeks if < 3)
                          const recentScores = weeklyScores.slice(-3);
                          const rolling3Avg =
                            recentScores.reduce((sum, score) => sum + score, 0) /
                            recentScores.length;

                          return {
                            key,
                            teamInfo: t.teamInfo,
                            avgPoints,
                            expectedWins,
                            rolling3Avg,
                            weeklyScores: weeklyScores.length,
                          };
                        })
                        .filter(Boolean) as any[];

                      if (weekTeams.length === 0) continue;

                      // Calculate z-scores for normalization
                      const avgPointsValues = weekTeams.map(t => t.avgPoints);
                      const expectedWinsValues = weekTeams.map(t => t.expectedWins);
                      const rolling3Values = weekTeams.map(t => t.rolling3Avg);

                      const zAvgPoints = calculateZScore(avgPointsValues);
                      const zExpectedWins = calculateZScore(expectedWinsValues);
                      const zRolling3 = calculateZScore(rolling3Values);

                      // Calculate power scores using the official formula
                      const powerData = weekTeams.map((team, index) => {
                        const powerScore =
                          0.5 * zAvgPoints[index] +
                          0.3 * zExpectedWins[index] +
                          0.2 * zRolling3[index];
                        const normalized = Math.round((100 + powerScore * 15) * 100) / 100;
                        return {
                          ...team,
                          powerScore: normalized,
                        };
                      });

                      // Sort by power score and assign ranks
                      powerData.sort((a, b) => b.powerScore - a.powerScore);
                      powerData.forEach((team, index) => {
                        if (!weeklyPowerRankings.has(team.key)) {
                          weeklyPowerRankings.set(team.key, {
                            teamInfo: team.teamInfo,
                            weeklyScores: [],
                            weeklyRanks: [],
                            trend: '',
                          });
                        }
                        weeklyPowerRankings.get(team.key)!.weeklyScores.push(team.powerScore);
                        weeklyPowerRankings.get(team.key)!.weeklyRanks.push(index + 1);
                      });
                    }

                    // Calculate trends
                    weeklyPowerRankings.forEach(data => {
                      const ranks = data.weeklyRanks;
                      if (ranks.length >= 2) {
                        const recent = ranks.slice(-2);
                        const change = recent[0] - recent[1]; // negative = improved rank (better)
                        if (change < -2)
                          data.trend = '🚀'; // power rising
                        else if (change > 2)
                          data.trend = '📉'; // power falling
                        else data.trend = '➡️'; // stable power
                      } else {
                        data.trend = '➡️';
                      }
                    });

                    // Sort teams by most recent power ranking (not season ranking)
                    const sortedPowerTeams = Array.from(weeklyPowerRankings.entries()).sort(
                      (a, b) => {
                        const aRecentRank = a[1].weeklyRanks[a[1].weeklyRanks.length - 1] || 999;
                        const bRecentRank = b[1].weeklyRanks[b[1].weeklyRanks.length - 1] || 999;
                        return aRecentRank - bRecentRank;
                      }
                    );

                    return sortedPowerTeams.map(([teamKey, data]) => (
                      <tr key={teamKey} className='border-t hover:bg-muted/10'>
                        <td className='sticky left-0 z-10 bg-background border-r px-3 py-2'>
                          <div className='font-medium'>{data.teamInfo.teamName}</div>
                          <div className='text-xs text-muted-foreground'>
                            {data.teamInfo.leagueName}
                          </div>
                        </td>
                        {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i).map(
                          weekIndex => {
                            const weekRank = data.weeklyRanks[weekIndex];
                            const weekScore = data.weeklyScores[weekIndex];
                            return (
                              <td key={weekIndex} className='px-1 py-2 text-center border-r'>
                                {weekRank ? (
                                  <div
                                    className='rounded-md p-2 transition-colors'
                                    style={{
                                      backgroundColor: getRankColor(weekRank, 24),
                                    }}
                                  >
                                    <div
                                      className='font-mono font-bold text-xs'
                                      style={{
                                        color: getTextColor(getRankColor(weekRank, 24)),
                                      }}
                                    >
                                      #{weekRank}
                                    </div>
                                    <div
                                      className='font-mono text-xs mt-1'
                                      style={{
                                        color: getTextColor(getRankColor(weekRank, 24)),
                                      }}
                                    >
                                      {weekScore?.toFixed(2)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className='text-xs text-muted-foreground'>—</div>
                                )}
                              </td>
                            );
                          }
                        )}
                        <td className='px-3 py-2 text-center'>
                          <div className='w-16 h-8'>
                            <ResponsiveContainer width='100%' height='100%'>
                              <LineChart
                                data={(() => {
                                  // Get actual weekly data with correct week numbers using teamKey
                                  const teamData = allTeamEntries.find(([k]) => k === teamKey)?.[1];
                                  if (!teamData) return [];

                                  return teamData.teamScores
                                    .filter(d => d.value > 0)
                                    .map(d => ({
                                      week: d.week,
                                      score: d.value,
                                    }));
                                })()}
                              >
                                <Line
                                  type='monotone'
                                  dataKey='score'
                                  stroke={colors.core.regalGold}
                                  strokeWidth={2}
                                  dot={false}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    fontSize: '11px',
                                    padding: '4px 8px',
                                  }}
                                  formatter={(value, name) => [
                                    `${Number(value).toFixed(1)} pts`,
                                    'Score',
                                  ]}
                                  labelFormatter={week => `Week ${week}`}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
              <h4 className='font-semibold mb-2'>Power Rankings Formula</h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground'>
                <div>
                  <p>
                    <strong>Components:</strong> 50% Avg Points + 30% Expected Wins + 20% Rolling
                    3-Week Avg
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Trends:</strong> 🚀 Rising Power (rank up 3+), ➡️ Stable, 📉 Declining
                    Power (rank down 3+)
                  </p>
                </div>
              </div>
              <div className='mt-2'>
                <p>
                  <strong>Score Range:</strong> ~70-130, where higher = stronger team. Accounts for
                  consistency, recent form, and opponent strength.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance Trends</CardTitle>
            <CardDescription>
              Track each team&apos;s ranking progression week by week. Green = top performance, Red
              = bottom performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-auto rounded-md border'>
              <table className='w-full text-xs'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='sticky left-0 z-10 bg-muted px-3 py-3 text-left font-semibold min-w-[140px]'>
                      Team
                    </th>
                    {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i + 1).map(week => (
                      <th
                        key={week}
                        className='px-3 py-3 text-center font-semibold min-w-[50px]'
                        style={{ backgroundColor: colors.core.charcoalSteel, color: 'white' }}
                      >
                        W{week}
                      </th>
                    ))}
                    <th
                      className='px-3 py-3 text-center font-semibold min-w-[80px]'
                      style={{ backgroundColor: colors.core.crimsonRed, color: 'white' }}
                    >
                      Weekly Trend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Build weekly ranking data for all teams (simple scoring)
                    const weeklyRankings = new Map<
                      string,
                      {
                        teamInfo: any;
                        weeklyRanks: number[];
                        weeklyScores: number[];
                        trend: string;
                      }
                    >();

                    // For each completed week, calculate all team ranks
                    for (let week = 1; week <= dataset.currentWeek - 1; week++) {
                      const weekTeams = allTeamEntries
                        .map(([key, t]) => {
                          const weekScore = t.teamScores.find(d => d.week === week)?.value || 0;
                          return { key, teamInfo: t.teamInfo, weekScore };
                        })
                        .filter(t => t.weekScore !== 0) // Include negative scores (defense can be negative)
                        .sort((a, b) => b.weekScore - a.weekScore);

                      // Calculate ranks for all teams this week
                      const weekScores = weekTeams.map(t => t.weekScore);
                      const weekRanks = rank(weekScores);

                      // Assign ranks and scores to each team
                      weekTeams.forEach((team, index) => {
                        if (!weeklyRankings.has(team.key)) {
                          weeklyRankings.set(team.key, {
                            teamInfo: team.teamInfo,
                            weeklyRanks: [],
                            weeklyScores: [],
                            trend: '',
                          });
                        }
                        weeklyRankings.get(team.key)!.weeklyRanks.push(weekRanks[index]);
                        weeklyRankings.get(team.key)!.weeklyScores.push(team.weekScore);
                      });
                    }

                    // Calculate trends for each team
                    weeklyRankings.forEach((data, teamKey) => {
                      const ranks = data.weeklyRanks;
                      if (ranks.length >= 2) {
                        const recent = ranks.slice(-2);
                        const change = recent[0] - recent[1]; // negative = improved rank (better)
                        if (change < -2)
                          data.trend = '📈'; // improving
                        else if (change > 2)
                          data.trend = '📉'; // declining
                        else data.trend = '➡️'; // stable
                      } else {
                        data.trend = '➡️';
                      }
                    });

                    // Sort teams by current season ranking
                    const sortedTeams = Array.from(weeklyRankings.entries()).sort((a, b) => {
                      const aCurrentRank = leagueData.find(t => t.key === a[0])?.rank || 999;
                      const bCurrentRank = leagueData.find(t => t.key === b[0])?.rank || 999;
                      return aCurrentRank - bCurrentRank;
                    });

                    return sortedTeams.map(([teamKey, data]) => (
                      <tr key={teamKey} className='border-t hover:bg-muted/10'>
                        <td className='sticky left-0 z-10 bg-background border-r px-3 py-2'>
                          <div className='font-medium'>{data.teamInfo.teamName}</div>
                          <div className='text-xs text-muted-foreground'>
                            {data.teamInfo.leagueName}
                          </div>
                        </td>
                        {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i).map(
                          weekIndex => {
                            const weekRank = data.weeklyRanks[weekIndex];
                            const weekScore = data.weeklyScores[weekIndex];
                            return (
                              <td key={weekIndex} className='px-1 py-2 text-center border-r'>
                                {weekRank ? (
                                  <div
                                    className='rounded-md p-2 transition-colors'
                                    style={{
                                      backgroundColor: getRankColor(weekRank, 24),
                                    }}
                                  >
                                    <div
                                      className='font-mono font-bold text-xs'
                                      style={{
                                        color: getTextColor(getRankColor(weekRank, 24)),
                                      }}
                                    >
                                      #{weekRank}
                                    </div>
                                    <div
                                      className='font-mono text-xs mt-1'
                                      style={{
                                        color: getTextColor(getRankColor(weekRank, 24)),
                                      }}
                                    >
                                      {weekScore?.toFixed(1)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className='text-xs text-muted-foreground'>—</div>
                                )}
                              </td>
                            );
                          }
                        )}
                        <td className='px-3 py-2 text-center'>
                          <div className='w-16 h-8'>
                            <ResponsiveContainer width='100%' height='100%'>
                              <LineChart
                                data={(() => {
                                  // Get actual weekly data with correct week numbers using teamKey
                                  const teamData = allTeamEntries.find(([k]) => k === teamKey)?.[1];
                                  if (!teamData) return [];

                                  return teamData.teamScores
                                    .filter(d => d.value > 0)
                                    .map(d => ({
                                      week: d.week,
                                      score: d.value,
                                    }));
                                })()}
                              >
                                <Line
                                  type='monotone'
                                  dataKey='score'
                                  stroke={colors.core.regalGold}
                                  strokeWidth={2}
                                  dot={false}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    fontSize: '11px',
                                    padding: '4px 8px',
                                  }}
                                  formatter={(value, name) => [
                                    `${Number(value).toFixed(1)} pts`,
                                    'Score',
                                  ]}
                                  labelFormatter={week => `Week ${week}`}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
              <h4 className='font-semibold mb-2'>How to Read the Trends</h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground'>
                <div>
                  <p>
                    <strong>Colors:</strong> Green = top performance, Red = bottom performance
                    (percentile-based)
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Trends:</strong> 📈 Improving (rank up 3+), ➡️ Stable (±2), 📉 Declining
                    (rank down 3+)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Positional Trend Heatmaps */}
        {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => (
          <Card key={position}>
            <CardHeader>
              <CardTitle>{position} Weekly Performance Trends</CardTitle>
              <CardDescription>
                Track each team&apos;s {position} performance week by week. Green = top {position}{' '}
                groups, Red = bottom {position} groups.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='overflow-auto rounded-md border'>
                <table className='w-full text-xs'>
                  <thead className='bg-muted/50'>
                    <tr>
                      <th className='sticky left-0 z-10 bg-muted px-3 py-3 text-left font-semibold min-w-[140px]'>
                        Team
                      </th>
                      {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i + 1).map(
                        week => (
                          <th
                            key={week}
                            className='px-3 py-3 text-center font-semibold min-w-[50px]'
                            style={{ backgroundColor: colors.core.charcoalSteel, color: 'white' }}
                          >
                            W{week}
                          </th>
                        )
                      )}
                      <th
                        className='px-3 py-3 text-center font-semibold min-w-[60px]'
                        style={{ backgroundColor: colors.core.crimsonRed, color: 'white' }}
                      >
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Build weekly positional ranking data
                      const positionRankings = new Map<
                        string,
                        {
                          teamInfo: any;
                          weeklyRanks: number[];
                          weeklyScores: number[];
                          trend: string;
                        }
                      >();

                      // For each completed week, calculate positional ranks
                      for (let week = 1; week <= dataset.currentWeek - 1; week++) {
                        const posData = positionsMap.get(position);
                        const posTeamsMap = new Map(posData?.teams || []);

                        const weekTeams = allTeamEntries
                          .map(([key, t]) => {
                            const teamPosData = posTeamsMap.get(key);
                            const weekScore =
                              teamPosData?.scores.find(d => d.week === week)?.value || 0;
                            return { key, teamInfo: t.teamInfo, weekScore };
                          })
                          .filter(t => t.weekScore !== 0) // Include negative defense scores
                          .sort((a, b) => b.weekScore - a.weekScore);

                        // Debug missing defense scores
                        if (position === 'DEF' && week === 1) {
                          console.log(`[DEBUG] ${position} Week ${week}:`, {
                            posDataExists: !!posData,
                            teamsCount: posTeamsMap.size,
                            totalTeamsInLeague: allTeamEntries.length,
                            weekTeamsWithScores: weekTeams.length,
                            teamsWithoutScores: allTeamEntries.length - weekTeams.length,
                            sampleScores: weekTeams
                              .slice(0, 3)
                              .map(t => ({ team: t.teamInfo.teamName, score: t.weekScore })),
                            missingTeams: allTeamEntries
                              .filter(([key]) => !weekTeams.find(wt => wt.key === key))
                              .slice(0, 5)
                              .map(([key, t]) => ({
                                team: t.teamInfo.teamName,
                                hasPositionData: posTeamsMap.has(key),
                                weekScore:
                                  posTeamsMap.get(key)?.scores.find(d => d.week === week)?.value ||
                                  'NO_DATA',
                              })),
                          });
                        }

                        // Calculate ranks for all teams this week
                        const weekScores = weekTeams.map(t => t.weekScore);
                        const weekRanks = rank(weekScores);

                        // Assign ranks and scores to each team
                        weekTeams.forEach((team, index) => {
                          if (!positionRankings.has(team.key)) {
                            positionRankings.set(team.key, {
                              teamInfo: team.teamInfo,
                              weeklyRanks: [],
                              weeklyScores: [],
                              trend: '',
                            });
                          }
                          positionRankings.get(team.key)!.weeklyRanks.push(weekRanks[index]);
                          positionRankings.get(team.key)!.weeklyScores.push(team.weekScore);
                        });
                      }

                      // Calculate trends for each team
                      positionRankings.forEach((data, teamKey) => {
                        const ranks = data.weeklyRanks;
                        if (ranks.length >= 2) {
                          const recent = ranks.slice(-2);
                          const change = recent[0] - recent[1]; // negative = improved rank (better)
                          if (change < -2)
                            data.trend = '📈'; // improving
                          else if (change > 2)
                            data.trend = '📉'; // declining
                          else data.trend = '➡️'; // stable
                        } else {
                          data.trend = '➡️';
                        }
                      });

                      // Add teams with no positional data (show them at bottom)
                      for (const [teamKey, team] of allTeamEntries) {
                        if (!positionRankings.has(teamKey)) {
                          positionRankings.set(teamKey, {
                            teamInfo: team.teamInfo,
                            weeklyRanks: [],
                            weeklyScores: [],
                            trend: '➡️',
                          });
                        }
                      }

                      // Sort teams by season total for this position (highest first)
                      const sortedPosTeams = Array.from(positionRankings.entries()).sort((a, b) => {
                        const aSeasonTotal = a[1].weeklyScores.reduce(
                          (sum, score) => sum + score,
                          0
                        );
                        const bSeasonTotal = b[1].weeklyScores.reduce(
                          (sum, score) => sum + score,
                          0
                        );
                        return bSeasonTotal - aSeasonTotal; // Highest first
                      });

                      return sortedPosTeams.map(([teamKey, data]) => (
                        <tr key={teamKey} className='border-t hover:bg-muted/10'>
                          <td className='sticky left-0 z-10 bg-background border-r px-3 py-2'>
                            <div className='font-medium'>{data.teamInfo.teamName}</div>
                            <div className='text-xs text-muted-foreground'>
                              {data.teamInfo.leagueName}
                            </div>
                          </td>
                          {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i).map(
                            weekIndex => {
                              const weekRank = data.weeklyRanks[weekIndex];
                              const weekScore = data.weeklyScores[weekIndex];
                              return (
                                <td key={weekIndex} className='px-1 py-2 text-center border-r'>
                                  {weekRank ? (
                                    <div
                                      className='rounded-md p-2 transition-colors'
                                      style={{
                                        backgroundColor: getRankColor(weekRank, 24),
                                      }}
                                    >
                                      <div
                                        className='font-mono font-bold text-xs'
                                        style={{
                                          color: getTextColor(getRankColor(weekRank, 24)),
                                        }}
                                      >
                                        #{weekRank}
                                      </div>
                                      <div
                                        className='font-mono text-xs mt-1'
                                        style={{
                                          color: getTextColor(getRankColor(weekRank, 24)),
                                        }}
                                      >
                                        {weekScore?.toFixed(1)}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className='text-xs text-muted-foreground'>—</div>
                                  )}
                                </td>
                              );
                            }
                          )}
                          <td className='px-3 py-2 text-center'>
                            <div className='w-16 h-8'>
                              <ResponsiveContainer width='100%' height='100%'>
                                <LineChart
                                  data={data.weeklyScores.map((score, index) => ({
                                    week: index + 1,
                                    score: score,
                                  }))}
                                >
                                  <Line
                                    type='monotone'
                                    dataKey='score'
                                    stroke={colors.core.regalGold}
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: 'rgba(0,0,0,0.8)',
                                      border: 'none',
                                      borderRadius: '4px',
                                      color: 'white',
                                      fontSize: '11px',
                                      padding: '4px 8px',
                                    }}
                                    formatter={(value, name) => [
                                      `${Number(value).toFixed(1)}`,
                                      'Score',
                                    ]}
                                    labelFormatter={week => `Week ${week}`}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

              <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
                <h4 className='font-semibold mb-2'>How to Read {position} Trends</h4>
                <div className='text-muted-foreground'>
                  <p>
                    <strong>Colors:</strong> Green = top {position} performance, Red = bottom{' '}
                    {position} performance
                  </p>
                  <p>
                    <strong>Trends:</strong> 📈 Improving, ➡️ Stable, 📉 Declining
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Team Consistency Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Team Consistency Analysis</CardTitle>
            <CardDescription>
              Consistency scores showing scoring reliability vs volatility. Higher bars = more
              predictable teams.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-96'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={(() => {
                    // Calculate consistency metrics for each team
                    const consistencyData = allTeamEntries
                      .map(([teamKey, team]) => {
                        const weeklyScores = team.teamScores
                          .filter(d => d.value > 0)
                          .map(d => d.value)
                          .sort((a, b) => a - b);

                        if (weeklyScores.length === 0) return null;

                        // Calculate statistics
                        const medianValue = median(weeklyScores);
                        const meanValue = mean(weeklyScores);
                        const min = weeklyScores[0];
                        const max = weeklyScores[weeklyScores.length - 1];
                        const range = max - min;
                        const stdDev = Math.sqrt(
                          weeklyScores.reduce(
                            (sum, score) => sum + Math.pow(score - meanValue, 2),
                            0
                          ) / weeklyScores.length
                        );

                        return {
                          teamKey,
                          teamName: team.teamInfo.teamName,
                          leagueName: team.teamInfo.leagueName,
                          median: medianValue,
                          mean: meanValue,
                          min,
                          max,
                          range,
                          stdDev,
                          gamesPlayed: weeklyScores.length,
                          scores: weeklyScores,
                          // Consistency metrics for bar height
                          consistency: 100 - Math.min(stdDev * 3, 100), // Higher = more consistent
                        };
                      })
                      .filter(Boolean)
                      .sort((a, b) => (b?.consistency || 0) - (a?.consistency || 0)); // Sort by consistency

                    return consistencyData;
                  })()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <XAxis
                    dataKey='teamName'
                    angle={-45}
                    textAnchor='end'
                    height={80}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    label={{ value: 'Consistency Score', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 11 }}
                    domain={[0, 100]}
                    tickFormatter={value => Number(value).toFixed(0)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div
                            className='p-4 rounded-lg shadow-xl border min-w-[320px]'
                            style={{
                              backgroundColor: colors.core.charcoalSteel,
                              borderColor: colors.core.regalGold,
                              color: 'white',
                            }}
                          >
                            <div
                              className='font-bold text-lg mb-1'
                              style={{ color: colors.core.regalGold }}
                            >
                              {data.teamName}
                            </div>
                            <div className='text-xs text-gray-300 mb-3'>{data.leagueName}</div>

                            <div className='space-y-3 text-sm'>
                              <div className='grid grid-cols-2 gap-4'>
                                <div>
                                  <div className='font-semibold'>Consistency Score</div>
                                  <div className='text-lg font-bold'>
                                    {data.consistency.toFixed(1)}/100
                                  </div>
                                  <div className='text-xs text-gray-400'>
                                    {data.stdDev < 15
                                      ? '🎯 Very Steady'
                                      : data.stdDev < 25
                                        ? '📊 Somewhat Predictable'
                                        : '🎲 Highly Volatile'}
                                  </div>
                                </div>
                                <div>
                                  <div className='font-semibold'>Score Range</div>
                                  <div className='text-lg font-bold'>{data.range.toFixed(1)}</div>
                                  <div className='text-xs text-gray-400'>
                                    {data.min.toFixed(1)} - {data.max.toFixed(1)}
                                  </div>
                                </div>
                              </div>

                              <div className='border-t border-gray-600 pt-2'>
                                <div className='grid grid-cols-2 gap-3 text-xs'>
                                  <div>
                                    Median:{' '}
                                    <span className='font-semibold'>{data.median.toFixed(1)}</span>
                                  </div>
                                  <div>
                                    Mean:{' '}
                                    <span className='font-semibold'>{data.mean.toFixed(1)}</span>
                                  </div>
                                  <div>
                                    Std Dev:{' '}
                                    <span className='font-semibold'>{data.stdDev.toFixed(1)}</span>
                                  </div>
                                  <div>
                                    Games: <span className='font-semibold'>{data.gamesPlayed}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Bar dataKey='consistency'>
                    {(() => {
                      const data = allTeamEntries
                        .map(([teamKey, team]) => {
                          const weeklyScores = team.teamScores
                            .filter(d => d.value > 0)
                            .map(d => d.value);
                          if (weeklyScores.length === 0) return null;
                          const meanValue = mean(weeklyScores);
                          const stdDev = Math.sqrt(
                            weeklyScores.reduce(
                              (sum, score) => sum + Math.pow(score - meanValue, 2),
                              0
                            ) / weeklyScores.length
                          );
                          return { teamKey, consistency: 100 - Math.min(stdDev * 3, 100) };
                        })
                        .filter(Boolean);

                      return data.map((team, index) => {
                        if (!team) return null;

                        return <Cell key={`cell-${index}`} fill={colors.core.regalGold} />;
                      });
                    })()}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
              <h4 className='font-semibold mb-2'>How to Read Consistency</h4>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground'>
                <div>
                  <span className='font-semibold'>🎯 Steady Teams:</span> Low standard deviation
                  (&lt;15), narrow score ranges. Reliable for playoffs.
                </div>
                <div>
                  <span className='font-semibold'>📊 Average Teams:</span> Medium volatility (15-25
                  std dev). Some variance but predictable.
                </div>
                <div>
                  <span className='font-semibold'>🎲 Volatile Teams:</span> High volatility (&gt;25
                  std dev). Boom-or-bust potential.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Positional Consistency Analysis */}
        {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => (
          <Card key={position}>
            <CardHeader>
              <CardTitle>{position} Consistency Analysis</CardTitle>
              <CardDescription>
                {position} scoring consistency across all teams. Green = reliable {position}{' '}
                production, Red = volatile {position} performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={(() => {
                      const posData = positionsMap.get(position);
                      const posTeamsMap = new Map(posData?.teams || []);

                      // Calculate positional consistency for each team
                      const posConsistencyData = allTeamEntries
                        .map(([teamKey, team]) => {
                          const teamPosData = posTeamsMap.get(teamKey);
                          const weeklyPosScores =
                            teamPosData?.scores.filter(d => d.value !== 0).map(d => d.value) || [];

                          if (weeklyPosScores.length === 0) return null;

                          // Calculate statistics
                          const meanValue = mean(weeklyPosScores);
                          const medianValue = median(weeklyPosScores);
                          const min = Math.min(...weeklyPosScores);
                          const max = Math.max(...weeklyPosScores);
                          const range = max - min;
                          const stdDev = Math.sqrt(
                            weeklyPosScores.reduce(
                              (sum, score) => sum + Math.pow(score - meanValue, 2),
                              0
                            ) / weeklyPosScores.length
                          );

                          return {
                            teamKey,
                            teamName: team.teamInfo.teamName,
                            leagueName: team.teamInfo.leagueName,
                            median: medianValue,
                            mean: meanValue,
                            min,
                            max,
                            range,
                            stdDev,
                            gamesPlayed: weeklyPosScores.length,
                            scores: weeklyPosScores,
                            // Consistency score for this position
                            consistency: 100 - Math.min(stdDev * 4, 100), // Position scores are smaller, so adjust multiplier
                          };
                        })
                        .filter((item): item is NonNullable<typeof item> => Boolean(item))
                        .sort((a, b) => b.consistency - a.consistency); // Sort by consistency

                      return posConsistencyData;
                    })()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <XAxis
                      dataKey='teamName'
                      angle={-45}
                      textAnchor='end'
                      height={80}
                      interval={0}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      label={{
                        value: `${position} Consistency`,
                        angle: -90,
                        position: 'insideLeft',
                      }}
                      tick={{ fontSize: 11 }}
                      domain={[0, 100]}
                      tickFormatter={value => Number(value).toFixed(0)}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return (
                            <div
                              className='p-4 rounded-lg shadow-xl border min-w-[320px]'
                              style={{
                                backgroundColor: colors.core.charcoalSteel,
                                borderColor: colors.core.regalGold,
                                color: 'white',
                              }}
                            >
                              <div
                                className='font-bold text-lg mb-1'
                                style={{ color: colors.core.regalGold }}
                              >
                                {data.teamName}
                              </div>
                              <div className='text-xs text-gray-300 mb-3'>{data.leagueName}</div>

                              <div className='space-y-3 text-sm'>
                                <div className='grid grid-cols-2 gap-4'>
                                  <div>
                                    <div className='font-semibold'>{position} Consistency</div>
                                    <div className='text-lg font-bold'>
                                      {data.consistency.toFixed(1)}/100
                                    </div>
                                    <div className='text-xs text-gray-400'>
                                      {data.stdDev < 8
                                        ? '🎯 Very Steady'
                                        : data.stdDev < 15
                                          ? '📊 Somewhat Predictable'
                                          : '🎲 Highly Volatile'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className='font-semibold'>{position} Range</div>
                                    <div className='text-lg font-bold'>{data.range.toFixed(1)}</div>
                                    <div className='text-xs text-gray-400'>
                                      {data.min.toFixed(1)} - {data.max.toFixed(1)}
                                    </div>
                                  </div>
                                </div>

                                <div className='border-t border-gray-600 pt-2'>
                                  <div className='grid grid-cols-2 gap-3 text-xs'>
                                    <div>
                                      Median:{' '}
                                      <span className='font-semibold'>
                                        {data.median.toFixed(1)}
                                      </span>
                                    </div>
                                    <div>
                                      Mean:{' '}
                                      <span className='font-semibold'>{data.mean.toFixed(1)}</span>
                                    </div>
                                    <div>
                                      Std Dev:{' '}
                                      <span className='font-semibold'>
                                        {data.stdDev.toFixed(1)}
                                      </span>
                                    </div>
                                    <div>
                                      Games:{' '}
                                      <span className='font-semibold'>{data.gamesPlayed}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    <Bar dataKey='consistency'>
                      {(() => {
                        const posData = positionsMap.get(position);
                        const posTeamsMap = new Map(posData?.teams || []);

                        const data = allTeamEntries
                          .map(([teamKey, team]) => {
                            const teamPosData = posTeamsMap.get(teamKey);
                            const weeklyPosScores =
                              teamPosData?.scores.filter(d => d.value !== 0).map(d => d.value) ||
                              [];
                            if (weeklyPosScores.length === 0) return null;
                            const meanValue = mean(weeklyPosScores);
                            const stdDev = Math.sqrt(
                              weeklyPosScores.reduce(
                                (sum, score) => sum + Math.pow(score - meanValue, 2),
                                0
                              ) / weeklyPosScores.length
                            );
                            return { teamKey, consistency: 100 - Math.min(stdDev * 4, 100) };
                          })
                          .filter((item): item is NonNullable<typeof item> => Boolean(item));

                        const consistencyValues = data.map(d => d.consistency);
                        const minConsistency = Math.min(...consistencyValues);
                        const maxConsistency = Math.max(...consistencyValues);

                        return data.map((team, index) => {
                          // Normalize consistency score to 0-1 for color mapping
                          const normalized =
                            maxConsistency === minConsistency
                              ? 0.5
                              : (team.consistency - minConsistency) /
                                (maxConsistency - minConsistency);

                          return <Cell key={`cell-${index}`} fill={colors.core.regalGold} />;
                        });
                      })().filter(Boolean)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
                <h4 className='font-semibold mb-2'>{position} Consistency Guide</h4>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground'>
                  <div>
                    <span className='font-semibold'>🎯 Steady {position}:</span> Low week-to-week
                    variance. Reliable production.
                  </div>
                  <div>
                    <span className='font-semibold'>📊 Average {position}:</span> Some volatility
                    but generally predictable.
                  </div>
                  <div>
                    <span className='font-semibold'>🎲 Volatile {position}:</span> High variance.
                    Boom-or-bust potential.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Team Scoring Distribution (Ridge Plots) */}
        <Card>
          <CardHeader>
            <CardTitle>Team Scoring Distribution Analysis</CardTitle>
            <CardDescription>
              Ridge plots showing each team&apos;s scoring distribution shape. Narrow ridges =
              consistent, Wide ridges = volatile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[800px]'>
              {(() => {
                // 1) Build chartData BEFORE the JSX:
                const helpers = {
                  median(arr: number[]) {
                    if (!arr.length) return NaN;
                    const m = Math.floor(arr.length / 2);
                    return arr.length % 2 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
                  },
                  linspace(a: number, b: number, n: number) {
                    return Array.from({ length: n }, (_, i) => a + (i * (b - a)) / (n - 1));
                  },
                  kde(samples: number[], xs: number[]) {
                    if (!samples.length) return xs.map(x => [x, 0] as [number, number]);
                    const n = samples.length;
                    const mean = samples.reduce((s, v) => s + v, 0) / n;
                    const std =
                      Math.sqrt(
                        samples.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, n - 1)
                      ) || 1e-6;
                    const h = Math.max(1e-6, 1.06 * std * Math.pow(n, -1 / 5));
                    const inv = 1 / (Math.sqrt(2 * Math.PI) * h);
                    const twoH2 = 2 * h * h;
                    return xs.map(x => {
                      const s = samples.reduce(
                        (acc, v) => acc + Math.exp(-((x - v) ** 2) / twoH2),
                        0
                      );
                      return [x, (inv * s) / n] as [number, number];
                    });
                  },
                };

                // Build ridgeData + chartData once
                const ridgeData = allTeamEntries
                  .map(([teamKey, team]) => {
                    const weekly = team.teamScores
                      .filter(d => d.value > 0)
                      .map(d => d.value)
                      .sort((a, b) => a - b);
                    if (!weekly.length) return null;

                    const min = weekly[0];
                    const max = weekly[weekly.length - 1];
                    const med = helpers.median(weekly);
                    const pad = Math.max(2, (max - min) * 0.05); // Small padding for domain calculation

                    const xs = helpers.linspace(min, max, Math.min(80, 20 + 3 * weekly.length));
                    const densityPairs = helpers.kde(weekly, xs);
                    const maxDensity = Math.max(...densityPairs.map(([, y]) => y)) || 1;

                    return {
                      teamName: team.teamInfo.teamName,
                      leagueName: team.teamInfo.leagueName,
                      teamKey,
                      min,
                      max,
                      pad, // Add pad back for domain calculation
                      median: med,
                      range: max - min,
                      scores: weekly,
                      gamesPlayed: weekly.length,
                      xs,
                      densityPairs,
                      maxDensity,
                    };
                  })
                  .filter(Boolean)
                  .sort((a, b) => b!.median - a!.median) as any[];

                const chartData = ridgeData.map((t, i) => ({
                  x: t.median,
                  y: (ridgeData.length - i) * 3, // for tooltip/Y domain only
                  type: 'ridge',
                  ...t,
                }));

                // 👉 domain must use min/max across ALL ridges (with pad), not medians
                let xDomain: [number, number] = [80, 180]; // Default fallback for fantasy scores

                if (ridgeData && ridgeData.length > 0) {
                  const validData = ridgeData.filter(
                    t =>
                      typeof t.min === 'number' &&
                      !isNaN(t.min) &&
                      typeof t.max === 'number' &&
                      !isNaN(t.max) &&
                      typeof t.pad === 'number' &&
                      !isNaN(t.pad)
                  );

                  if (validData.length > 0) {
                    // Calculate domain from all teams' ranges
                    const allMins = validData.map(t => t.min - t.pad);
                    const allMaxs = validData.map(t => t.max + t.pad);

                    const calculatedMin = Math.min(...allMins);
                    const calculatedMax = Math.max(...allMaxs);

                    xDomain = [calculatedMin, calculatedMax];

                    // Check for valid domain
                    if (!isFinite(xDomain[0]) || !isFinite(xDomain[1])) {
                      console.warn('Invalid xDomain calculated, using fallback', xDomain);
                      xDomain = [80, 180]; // More reasonable fallback for fantasy scores
                    } else {
                      // Add 5% buffer to prevent bleeding over axis range
                      const domainRange = xDomain[1] - xDomain[0];
                      const buffer = domainRange * 0.05;
                      xDomain[0] -= buffer;
                      xDomain[1] += buffer;
                    }
                  } else {
                    console.warn('No valid ridge data for team chart');
                  }
                } else {
                  console.warn('Empty ridge data for team chart');
                }

                return (
                  <D3RidgePlot
                    data={chartData}
                    domain={xDomain}
                    height={800}
                    title='Weekly Scores'
                  />
                );
              })()}
            </div>

            <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
              <h4 className='font-semibold mb-2'>Ridge Plot Guide</h4>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground'>
                <div>
                  <span className='font-semibold'>🎯 Narrow Ridge:</span> Tall, thin curve =
                  consistent scoring week-to-week.
                </div>
                <div>
                  <span className='font-semibold'>🌊 Wide Ridge:</span> Flat, spread curve =
                  volatile performance with high variance.
                </div>
                <div>
                  <span className='font-semibold'>📍 Median Line:</span> Dashed line shows typical
                  weekly performance.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Positional Scoring Distribution (Ridge Plots) */}
        {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => (
          <Card key={position}>
            <CardHeader>
              <CardTitle>{position} Scoring Distribution Analysis</CardTitle>
              <CardDescription>
                {position} scoring distribution by team. Ridge plots show {position} consistency vs.
                volatility patterns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[700px]'>
                {(() => {
                  const posData = positionsMap.get(position);
                  const posTeamsMap = new Map(posData?.teams || []);

                  // Reuse the same KDE helpers
                  const helpers = {
                    median(arr: number[]) {
                      if (!arr.length) return NaN;
                      const m = Math.floor(arr.length / 2);
                      return arr.length % 2 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
                    },
                    linspace(a: number, b: number, n: number) {
                      return Array.from({ length: n }, (_, i) => a + (i * (b - a)) / (n - 1));
                    },
                    kde(samples: number[], xs: number[]) {
                      if (!samples.length) return xs.map(x => [x, 0] as [number, number]);
                      const n = samples.length;
                      const mean = samples.reduce((s, v) => s + v, 0) / n;
                      const std =
                        Math.sqrt(
                          samples.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, n - 1)
                        ) || 1e-6;
                      const h = Math.max(1e-6, 1.06 * std * Math.pow(n, -1 / 5));
                      const inv = 1 / (Math.sqrt(2 * Math.PI) * h);
                      const twoH2 = 2 * h * h;
                      return xs.map(x => {
                        const s = samples.reduce(
                          (acc, v) => acc + Math.exp(-((x - v) ** 2) / twoH2),
                          0
                        );
                        return [x, (inv * s) / n] as [number, number];
                      });
                    },
                  };

                  // Build positional ridgeData + chartData
                  const posRidgeData = allTeamEntries
                    .map(([teamKey, team]) => {
                      const teamPosData = posTeamsMap.get(teamKey);
                      const weekly =
                        teamPosData?.scores
                          .filter(d => d.value !== 0)
                          .map(d => d.value)
                          .sort((a, b) => a - b) || [];
                      if (!weekly.length) return null;

                      const min = weekly[0];
                      const max = weekly[weekly.length - 1];
                      const med = helpers.median(weekly);
                      const pad = Math.max(1, (max - min) * 0.05); // Small padding for domain calculation
                      const xs = helpers.linspace(min, max, Math.min(60, 15 + 2 * weekly.length));
                      const densityPairs = helpers.kde(weekly, xs);
                      const maxDensity = Math.max(...densityPairs.map(([, y]) => y)) || 1;

                      return {
                        teamName: team.teamInfo.teamName,
                        leagueName: team.teamInfo.leagueName,
                        teamKey,
                        min,
                        max,
                        pad, // Add pad back for domain calculation
                        median: med,
                        range: max - min,
                        scores: weekly,
                        gamesPlayed: weekly.length,
                        xs,
                        densityPairs,
                        maxDensity,
                      };
                    })
                    .filter(Boolean)
                    .sort((a, b) => b!.median - a!.median) as any[];

                  const posChartData = posRidgeData.map((t, i) => ({
                    x: t.median,
                    y: (posRidgeData.length - i) * 2.5, // for tooltip/Y domain only
                    type: 'ridge',
                    ...t,
                  }));

                  // Domain must use min/max across ALL ridges (with pad), not medians
                  let posXDomain: [number, number] = [0, 50]; // Default fallback for positional scores

                  if (posRidgeData && posRidgeData.length > 0) {
                    const validPosData = posRidgeData.filter(
                      t =>
                        typeof t.min === 'number' &&
                        !isNaN(t.min) &&
                        typeof t.max === 'number' &&
                        !isNaN(t.max) &&
                        typeof t.pad === 'number' &&
                        !isNaN(t.pad)
                    );

                    if (validPosData.length > 0) {
                      // Calculate domain from all teams' ranges
                      const allPosMins = validPosData.map(t => t.min - t.pad);
                      const allPosMaxs = validPosData.map(t => t.max + t.pad);

                      const posCalculatedMin = Math.min(...allPosMins);
                      const posCalculatedMax = Math.max(...allPosMaxs);

                      posXDomain = [posCalculatedMin, posCalculatedMax];

                      // Check for valid domain
                      if (!isFinite(posXDomain[0]) || !isFinite(posXDomain[1])) {
                        console.warn('Invalid posXDomain calculated, using fallback');
                        posXDomain = [0, 50];
                      } else {
                        // Add 5% buffer to prevent bleeding over axis range
                        const posDomainRange = posXDomain[1] - posXDomain[0];
                        const posBuffer = posDomainRange * 0.05;
                        posXDomain[0] -= posBuffer;
                        posXDomain[1] += posBuffer;
                      }
                    } else {
                      console.warn('No valid ridge data for positional chart:', position);
                    }
                  } else {
                    console.warn('Empty ridge data for positional chart:', position);
                  }

                  return (
                    <D3RidgePlot
                      data={posChartData}
                      domain={posXDomain}
                      height={600}
                      title={`${position} Weekly Scores`}
                    />
                  );
                })()}
              </div>

              <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
                <h4 className='font-semibold mb-2'>{position} Ridge Plot Guide</h4>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground'>
                  <div>
                    <span className='font-semibold'>🎯 Narrow Ridge:</span> Tall, thin curve =
                    consistent {position} scoring.
                  </div>
                  <div>
                    <span className='font-semibold'>🌊 Wide Ridge:</span> Flat, spread curve =
                    volatile {position} performance.
                  </div>
                  <div>
                    <span className='font-semibold'>📍 Median Line:</span> Dashed line shows typical{' '}
                    {position} performance.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Tabs
        value={currentView}
        onValueChange={v =>
          setCurrentView(
            v as
              | 'team'
              | 'league'
              | 'schedule'
              | 'trends'
              | 'scatter'
              | 'transactions'
              | 'start-sit'
          )
        }
      >
        <TabsList>
          <TabsTrigger value='team'>Team Analysis</TabsTrigger>
          <TabsTrigger value='league'>League View</TabsTrigger>
          <TabsTrigger value='schedule'>Schedule Analysis</TabsTrigger>
          <TabsTrigger value='trends'>Performance Trends</TabsTrigger>
          <TabsTrigger value='scatter'>Scatter Analysis</TabsTrigger>
          <TabsTrigger value='transactions'>Transaction Analysis</TabsTrigger>
          <TabsTrigger value='start-sit'>Start/Sit Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value='team'>
          <Card>
            <CardHeader>
              <CardTitle>Team Analysis</CardTitle>
              <CardDescription>
                Season totals and weekly breakdown for individual teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='mb-6 flex items-center gap-3'>
                <label className='text-sm font-medium'>Select Team</label>
                <Select value={selectedTeamKey} onValueChange={setSelectedTeamKey}>
                  <SelectTrigger className='w-80'>
                    <SelectValue placeholder='Select team' />
                  </SelectTrigger>
                  <SelectContent>
                    {teamOptions.map(opt => (
                      <SelectItem key={opt.key} value={opt.key}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-6'>
                {/* Season Summary */}
                <div>
                  <h3
                    className='mb-3 text-lg font-semibold'
                    style={{ color: colors.core.crimsonRed }}
                  >
                    Season Summary (Weeks {fromWeek}-{toWeek})
                  </h3>
                  <div className='rounded-md border'>
                    <table className='w-full text-sm'>
                      <thead className='bg-muted/50'>
                        <tr>
                          <th className='px-4 py-3 text-left'>Metric</th>
                          <th className='px-4 py-3 text-right'>Team</th>
                          <th className='px-4 py-3 text-right'>Opponent</th>
                          <th className='px-4 py-3 text-right'>League Avg</th>
                          <th className='px-4 py-3 text-right'>League Median</th>
                          <th className='px-4 py-3 text-center'>Rank (24)</th>
                          <th className='px-4 py-3 text-center'>Rank (League)</th>
                          <th className='px-4 py-3 text-center'>Avg Opp Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className='px-4 py-3 font-medium'>Total Points</td>
                          <td
                            className='px-4 py-3 text-right font-mono font-bold'
                            style={{ color: colors.core.regalGold }}
                          >
                            {teamTotal.toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-right font-mono'>{oppTotal.toFixed(1)}</td>
                          <td className='px-4 py-3 text-right font-mono'>
                            {mean(leagueTotals).toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-right font-mono'>
                            {median(leagueTotals).toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <span
                              className='rounded-full px-2 py-1 text-xs font-medium'
                              style={{
                                backgroundColor: getRankColor(seasonRank24, 24),
                                color: getTextColor(getRankColor(seasonRank24, 24)),
                              }}
                            >
                              {seasonRank24}
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <span
                              className='rounded-full px-2 py-1 text-xs font-medium'
                              style={{
                                backgroundColor: getRankColor(seasonRankLeague, 12),
                                color: getTextColor(getRankColor(seasonRankLeague, 12)),
                              }}
                            >
                              {seasonRankLeague}
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <span
                              className='rounded-full px-2 py-1 text-xs font-medium'
                              style={{
                                backgroundColor: getRankColor(Math.round(avgOppRank), 24),
                                color: getTextColor(getRankColor(Math.round(avgOppRank), 24)),
                              }}
                              title={`Average opponent rank: ${avgOppRank.toFixed(1)} (lower = tougher schedule)`}
                            >
                              {avgOppRank.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                        <tr className='border-t'>
                          <td className='px-4 py-3 font-medium'>Point Differential</td>
                          <td
                            className='px-4 py-3 text-right font-mono font-bold'
                            style={{
                              color: getPerformanceColor(
                                teamTotal - oppTotal,
                                teamTotal - oppTotal > 0
                              ),
                            }}
                          >
                            {teamTotal - oppTotal > 0 ? '+' : ''}
                            {(teamTotal - oppTotal).toFixed(1)}
                          </td>
                          <td className='px-4 py-3'></td>
                          <td className='px-4 py-3'></td>
                          <td className='px-4 py-3'></td>
                          <td className='px-4 py-3'></td>
                          <td className='px-4 py-3'></td>
                          <td className='px-4 py-3'></td>
                        </tr>
                        <tr className='border-t bg-muted/20'>
                          <td className='px-4 py-3 font-medium'>Weekly Average</td>
                          <td
                            className='px-4 py-3 text-right font-mono font-bold'
                            style={{ color: colors.core.regalGold }}
                          >
                            {gamesPlayed > 0 ? (teamTotal / gamesPlayed).toFixed(1) : '0.0'}
                          </td>
                          <td className='px-4 py-3 text-right font-mono'>
                            {gamesPlayed > 0 ? (oppTotal / gamesPlayed).toFixed(1) : '0.0'}
                          </td>
                          <td className='px-4 py-3 text-right font-mono'>
                            {mean(leagueAvgByWeek).toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-right font-mono'>
                            {mean(leagueMedByWeek).toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <span
                              className='rounded-full px-2 py-1 text-xs font-medium'
                              style={{
                                backgroundColor: getRankColor(seasonRank24, 24),
                                color: getTextColor(getRankColor(seasonRank24, 24)),
                              }}
                            >
                              {seasonRank24}
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <span
                              className='rounded-full px-2 py-1 text-xs font-medium'
                              style={{
                                backgroundColor: getRankColor(seasonRankLeague, 12),
                                color: getTextColor(getRankColor(seasonRankLeague, 12)),
                              }}
                            >
                              {seasonRankLeague}
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <span
                              className='rounded-full px-2 py-1 text-xs font-medium'
                              style={{
                                backgroundColor: getRankColor(Math.round(avgOppRank), 24),
                                color: getTextColor(getRankColor(Math.round(avgOppRank), 24)),
                              }}
                              title={`Average opponent rank: ${avgOppRank.toFixed(1)} (lower = tougher schedule)`}
                            >
                              {avgOppRank.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Weekly Breakdown */}
                <div>
                  <h3
                    className='mb-3 text-lg font-semibold'
                    style={{ color: colors.core.crimsonRed }}
                  >
                    Weekly Breakdown
                  </h3>
                  <div className='rounded-md border'>
                    <table className='w-full text-sm'>
                      <thead className='bg-muted/50'>
                        <tr>
                          <th className='px-4 py-3 text-left'>Week</th>
                          <th className='px-4 py-3 text-right'>Team</th>
                          <th className='px-4 py-3 text-center'>Rank (24)</th>
                          <th className='px-4 py-3 text-center'>Rank (League)</th>
                          <th className='px-4 py-3 text-right'>Opponent</th>
                          <th className='px-4 py-3 text-center'>Opp Rank (24)</th>
                          <th className='px-4 py-3 text-center'>Opp Rank (League)</th>
                          <th className='px-4 py-3 text-right'>vs League Avg</th>
                          <th className='px-4 py-3 text-right'>vs League Median</th>
                          <th className='px-4 py-3 text-center'>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeks.map(week => {
                          const myTeam = t.teamScores.find(d => d.week === week)?.value || 0;
                          const myOpp = t.opponentScores.find(d => d.week === week)?.value || 0;
                          const vals = allTeamEntries.map(
                            ([, tt]) => tt.teamScores.find(d => d.week === week)?.value || 0
                          );
                          const ranks24 = rank(vals);
                          const teamIndex24Weekly = allTeamEntries.findIndex(
                            ([k]) => k === selectedTeamKey
                          );
                          const rank24 = ranks24[teamIndex24Weekly] || 0;

                          const leagueEntriesWeek = allTeamEntries.filter(
                            ([, tt]) => tt.teamInfo.leagueId === leagueId
                          );
                          const valsLeague = leagueEntriesWeek.map(
                            ([, tt]) => tt.teamScores.find(d => d.week === week)?.value || 0
                          );
                          const ranksLeague = rank(valsLeague);
                          const teamIndexLeagueWeekly = leagueEntriesWeek.findIndex(
                            ([k]) => k === selectedTeamKey
                          );
                          const rankLeague = ranksLeague[teamIndexLeagueWeekly] || 0;

                          // Calculate opponent ranks
                          const oppVals = allTeamEntries.map(
                            ([, tt]) => tt.opponentScores.find(d => d.week === week)?.value || 0
                          );
                          const oppRanks24 = rank(oppVals);
                          const oppRank24 = oppRanks24[teamIndex24Weekly] || 0;

                          const oppValsLeague = leagueEntriesWeek.map(
                            ([, tt]) => tt.opponentScores.find(d => d.week === week)?.value || 0
                          );
                          const oppRanksLeague = rank(oppValsLeague);
                          const oppRankLeague = oppRanksLeague[teamIndexLeagueWeekly] || 0;

                          // Debug weekly ranking for first week only
                          if (week === fromWeek) {
                            console.log(
                              `[DEBUG] Week ${week} rankings for ${t.teamInfo.teamName}`,
                              {
                                myTeam,
                                myOpp,
                                valsLength: vals.length,
                                valsLeagueLength: valsLeague.length,
                                teamIndex24Weekly,
                                teamIndexLeagueWeekly,
                                rank24,
                                rankLeague,
                                oppRank24,
                                oppRankLeague,
                                valsSample: vals.slice(0, 5),
                                valsLeagueSample: valsLeague.slice(0, 5),
                              }
                            );
                          }
                          const won = myTeam > myOpp;
                          const weekIdx = week - fromWeek;
                          const vsAvg = myTeam - (leagueAvgByWeek[weekIdx] || 0);
                          const vsMedian = myTeam - (leagueMedByWeek[weekIdx] || 0);

                          if (myTeam === 0) return null; // Skip weeks with no data

                          return (
                            <tr key={week} className='border-t hover:bg-muted/20'>
                              <td className='px-4 py-3 font-medium'>Week {week}</td>
                              <td
                                className='px-4 py-3 text-right font-mono font-bold'
                                style={{ color: colors.core.regalGold }}
                              >
                                {myTeam.toFixed(1)}
                              </td>
                              <td className='px-4 py-3 text-center'>
                                <span
                                  className='rounded-full px-2 py-1 text-xs font-medium'
                                  style={{
                                    backgroundColor: getRankColor(rank24, 24),
                                    color: getTextColor(getRankColor(rank24, 24)),
                                  }}
                                >
                                  {rank24}
                                </span>
                              </td>
                              <td className='px-4 py-3 text-center'>
                                <span
                                  className='rounded-full px-2 py-1 text-xs font-medium'
                                  style={{
                                    backgroundColor: getRankColor(rankLeague, 12),
                                    color: getTextColor(getRankColor(rankLeague, 12)),
                                  }}
                                >
                                  {rankLeague}
                                </span>
                              </td>
                              <td className='px-4 py-3 text-right font-mono'>{myOpp.toFixed(1)}</td>
                              <td className='px-4 py-3 text-center'>
                                <span
                                  className='rounded-full px-2 py-1 text-xs font-medium'
                                  style={{
                                    backgroundColor: getRankColor(oppRank24, 24),
                                    color: getTextColor(getRankColor(oppRank24, 24)),
                                  }}
                                  title={`Opponent ranked ${oppRank24} of 24 teams`}
                                >
                                  {oppRank24}
                                </span>
                              </td>
                              <td className='px-4 py-3 text-center'>
                                <span
                                  className='rounded-full px-2 py-1 text-xs font-medium'
                                  style={{
                                    backgroundColor: getRankColor(oppRankLeague, 12),
                                    color: getTextColor(getRankColor(oppRankLeague, 12)),
                                  }}
                                  title={`Opponent ranked ${oppRankLeague} of 12 in league`}
                                >
                                  {oppRankLeague}
                                </span>
                              </td>
                              <td
                                className='px-4 py-3 text-right font-mono text-xs'
                                style={{ color: getPerformanceColor(vsAvg, vsAvg > 0) }}
                              >
                                {vsAvg > 0 ? '+' : ''}
                                {vsAvg.toFixed(1)}
                              </td>
                              <td
                                className='px-4 py-3 text-right font-mono text-xs'
                                style={{ color: getPerformanceColor(vsMedian, vsMedian > 0) }}
                              >
                                {vsMedian > 0 ? '+' : ''}
                                {vsMedian.toFixed(1)}
                              </td>
                              <td className='px-4 py-3 text-center'>
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-bold text-white ${
                                    won ? 'bg-green-600' : 'bg-red-600'
                                  }`}
                                >
                                  {won ? 'W' : 'L'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Position Breakdowns */}
                <div>
                  <h3
                    className='mb-3 text-lg font-semibold'
                    style={{ color: colors.core.crimsonRed }}
                  >
                    Position Breakdowns
                  </h3>
                  <div className='space-y-4'>
                    {positions.map(position => {
                      const posData = positionsMap.get(position);
                      const posTeamsMap = new Map(posData?.teams || []);
                      const teamPosData = posTeamsMap.get(selectedTeamKey);

                      if (!teamPosData) {
                        return (
                          <div key={position} className='rounded-md border p-4'>
                            <h4 className='mb-2 font-semibold'>{position}</h4>
                            <div className='text-sm text-muted-foreground'>No data available</div>
                          </div>
                        );
                      }

                      // Calculate season totals for this position
                      const posSeasonTotal = teamPosData.scores
                        .filter(d => d.week >= fromWeek && d.week <= toWeek)
                        .reduce((a, d) => a + d.value, 0);
                      const posValidWeeks = teamPosData.scores.filter(
                        d => d.week >= fromWeek && d.week <= toWeek && d.value > 0
                      );
                      const posGamesPlayed = posValidWeeks.length;

                      // Calculate league averages and ranks for this position
                      const allPosTeams = Array.from(posTeamsMap.values());
                      const allPosTotals = allPosTeams.map(pt =>
                        pt.scores
                          .filter(d => d.week >= fromWeek && d.week <= toWeek)
                          .reduce((a, d) => a + d.value, 0)
                      );
                      const posRanks24 = rank(allPosTotals);
                      const posRank24 =
                        posRanks24[
                          allPosTeams.findIndex(
                            pt =>
                              pt.teamInfo.leagueId === t.teamInfo.leagueId &&
                              pt.teamInfo.rosterId === t.teamInfo.rosterId
                          )
                        ] || 0;

                      const leaguePosTeams = allPosTeams.filter(
                        pt => pt.teamInfo.leagueId === leagueId
                      );
                      const leagePosTotals = leaguePosTeams.map(pt =>
                        pt.scores
                          .filter(d => d.week >= fromWeek && d.week <= toWeek)
                          .reduce((a, d) => a + d.value, 0)
                      );
                      const posRanksLeague = rank(leagePosTotals);
                      const posRankLeague =
                        posRanksLeague[
                          leaguePosTeams.findIndex(
                            pt =>
                              pt.teamInfo.leagueId === t.teamInfo.leagueId &&
                              pt.teamInfo.rosterId === t.teamInfo.rosterId
                          )
                        ] || 0;

                      const posLeagueAvg = mean(allPosTotals);
                      const posLeagueMedian = median(allPosTotals);

                      // Calculate opponent positional data by finding opponents from team weekly data
                      const myWeeklyOpponentData = weeks.map(week => {
                        const weeklyTeamEntry = allTeamEntries.find(([k]) => k === selectedTeamKey);
                        const myOppData = weeklyTeamEntry?.[1].opponentScores.find(
                          d => d.week === week
                        );

                        // Find opponent by matching scores in reverse (my opponent = who scored my opponent points)
                        const opponentEntry = allTeamEntries.find(([k, tt]) => {
                          const theirScore = tt.teamScores.find(d => d.week === week)?.value;
                          return (
                            k !== selectedTeamKey &&
                            Math.abs((theirScore || 0) - (myOppData?.value || 0)) < 0.01
                          );
                        });

                        const opponentPosData = opponentEntry
                          ? posTeamsMap.get(opponentEntry[0])
                          : null;
                        const oppPosScore =
                          opponentPosData?.scores.find(d => d.week === week)?.value || 0;

                        return { week, oppPosScore, opponentKey: opponentEntry?.[0] };
                      });

                      const oppPosSeasonTotal = myWeeklyOpponentData.reduce(
                        (a, d) => a + d.oppPosScore,
                        0
                      );

                      // Calculate opponent positional ranks
                      const oppPosRank24 = myWeeklyOpponentData[0]?.opponentKey
                        ? posRanks24[
                            allPosTeams.findIndex(pt => {
                              const oppKey = myWeeklyOpponentData[0].opponentKey;
                              return (
                                oppKey &&
                                pt.teamInfo.leagueId === oppKey.split('-')[0] &&
                                pt.teamInfo.rosterId === parseInt(oppKey.split('-')[1])
                              );
                            })
                          ] || 0
                        : 0;

                      const oppPosRankLeague = myWeeklyOpponentData[0]?.opponentKey
                        ? posRanksLeague[
                            leaguePosTeams.findIndex(pt => {
                              const oppKey = myWeeklyOpponentData[0].opponentKey;
                              return (
                                oppKey &&
                                pt.teamInfo.leagueId === oppKey.split('-')[0] &&
                                pt.teamInfo.rosterId === parseInt(oppKey.split('-')[1])
                              );
                            })
                          ] || 0
                        : 0;

                      return (
                        <div key={position} className='rounded-md border'>
                          <div
                            className='px-4 py-2'
                            style={{ backgroundColor: colors.core.charcoalSteel }}
                          >
                            <h4 className='font-semibold text-white'>{position}</h4>
                          </div>

                          {/* Position Season Summary */}
                          <div className='p-4'>
                            <div className='mb-4 rounded-md border'>
                              <table className='w-full text-sm'>
                                <thead className='bg-muted/20'>
                                  <tr>
                                    <th className='px-3 py-2 text-left'>Season Total</th>
                                    <th className='px-3 py-2 text-right'>Team</th>
                                    <th className='px-3 py-2 text-center'>Rank (24)</th>
                                    <th className='px-3 py-2 text-center'>Rank (League)</th>
                                    <th className='px-3 py-2 text-right'>Opponent</th>
                                    <th className='px-3 py-2 text-center'>Opp Rank (24)</th>
                                    <th className='px-3 py-2 text-center'>Opp Rank (League)</th>
                                    <th className='px-3 py-2 text-right'>League Avg</th>
                                    <th className='px-3 py-2 text-right'>League Median</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className='px-3 py-2 font-medium'>
                                      Weeks {fromWeek}-{toWeek}
                                    </td>
                                    <td
                                      className='px-3 py-2 text-right font-mono font-bold'
                                      style={{ color: colors.core.regalGold }}
                                    >
                                      {posSeasonTotal.toFixed(1)}
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(posRank24, 24),
                                          color: getTextColor(getRankColor(posRank24, 24)),
                                        }}
                                      >
                                        {posRank24}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(posRankLeague, 12),
                                          color: getTextColor(getRankColor(posRankLeague, 12)),
                                        }}
                                      >
                                        {posRankLeague}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-right font-mono'>
                                      {oppPosSeasonTotal.toFixed(1)}
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(oppPosRank24, 24),
                                          color: getTextColor(getRankColor(oppPosRank24, 24)),
                                        }}
                                      >
                                        {oppPosRank24}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(oppPosRankLeague, 12),
                                          color: getTextColor(getRankColor(oppPosRankLeague, 12)),
                                        }}
                                      >
                                        {oppPosRankLeague}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-right font-mono'>
                                      {posLeagueAvg.toFixed(1)}
                                    </td>
                                    <td className='px-3 py-2 text-right font-mono'>
                                      {posLeagueMedian.toFixed(1)}
                                    </td>
                                  </tr>
                                  <tr className='border-t bg-muted/20'>
                                    <td className='px-3 py-2 font-medium'>Weekly Average</td>
                                    <td
                                      className='px-3 py-2 text-right font-mono font-bold'
                                      style={{ color: colors.core.regalGold }}
                                    >
                                      {posGamesPlayed > 0
                                        ? (posSeasonTotal / posGamesPlayed).toFixed(1)
                                        : '0.0'}
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(posRank24, 24),
                                          color: getTextColor(getRankColor(posRank24, 24)),
                                        }}
                                      >
                                        {posRank24}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(posRankLeague, 12),
                                          color: getTextColor(getRankColor(posRankLeague, 12)),
                                        }}
                                      >
                                        {posRankLeague}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-right font-mono'>
                                      {posGamesPlayed > 0
                                        ? (oppPosSeasonTotal / posGamesPlayed).toFixed(1)
                                        : '0.0'}
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(oppPosRank24, 24),
                                          color: getTextColor(getRankColor(oppPosRank24, 24)),
                                        }}
                                      >
                                        {oppPosRank24}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(oppPosRankLeague, 12),
                                          color: getTextColor(getRankColor(oppPosRankLeague, 12)),
                                        }}
                                      >
                                        {oppPosRankLeague}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-right font-mono'>
                                      {(posLeagueAvg / weeks.length).toFixed(1)}
                                    </td>
                                    <td className='px-3 py-2 text-right font-mono'>
                                      {(posLeagueMedian / weeks.length).toFixed(1)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Position Weekly Breakdown */}
                            <div className='max-h-48 overflow-auto rounded-md border'>
                              <table className='w-full text-sm'>
                                <thead className='bg-muted/20 sticky top-0'>
                                  <tr>
                                    <th className='px-3 py-2 text-left'>Week</th>
                                    <th className='px-3 py-2 text-right'>Team</th>
                                    <th className='px-3 py-2 text-center'>Rank (24)</th>
                                    <th className='px-3 py-2 text-center'>Rank (Lg)</th>
                                    <th className='px-3 py-2 text-right'>Opponent</th>
                                    <th className='px-3 py-2 text-center'>Opp Rank (24)</th>
                                    <th className='px-3 py-2 text-center'>Opp Rank (Lg)</th>
                                    <th className='px-3 py-2 text-right'>vs Avg</th>
                                    <th className='px-3 py-2 text-right'>vs Median</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {weeks.flatMap(week => {
                                    const myPosPoints =
                                      teamPosData.scores.find(d => d.week === week)?.value || 0;

                                    if (myPosPoints === 0) return [];

                                    const rowKey = `${position}-${week}`;
                                    const isExpanded = expandedRows.has(rowKey);

                                    // Get opponent positional data for this week
                                    const oppWeekData = myWeeklyOpponentData.find(
                                      d => d.week === week
                                    );
                                    const oppPosPoints = oppWeekData?.oppPosScore || 0;

                                    // Calculate weekly ranks for this position
                                    const allWeeklyPosVals = allPosTeams.map(
                                      pt => pt.scores.find(d => d.week === week)?.value || 0
                                    );
                                    const weeklyPosRanks24 = rank(allWeeklyPosVals);
                                    const weeklyPosRank24 =
                                      weeklyPosRanks24[
                                        allPosTeams.findIndex(
                                          pt =>
                                            pt.teamInfo.leagueId === t.teamInfo.leagueId &&
                                            pt.teamInfo.rosterId === t.teamInfo.rosterId
                                        )
                                      ] || 0;

                                    const leagueWeeklyPosVals = leaguePosTeams.map(
                                      pt => pt.scores.find(d => d.week === week)?.value || 0
                                    );
                                    const weeklyPosRanksLeague = rank(leagueWeeklyPosVals);
                                    const weeklyPosRankLeague =
                                      weeklyPosRanksLeague[
                                        leaguePosTeams.findIndex(
                                          pt =>
                                            pt.teamInfo.leagueId === t.teamInfo.leagueId &&
                                            pt.teamInfo.rosterId === t.teamInfo.rosterId
                                        )
                                      ] || 0;

                                    // Calculate opponent weekly ranks
                                    const oppWeeklyPosRank24 = oppWeekData?.opponentKey
                                      ? weeklyPosRanks24[
                                          allPosTeams.findIndex(pt => {
                                            const oppKey = oppWeekData.opponentKey;
                                            return (
                                              oppKey &&
                                              pt.teamInfo.leagueId === oppKey.split('-')[0] &&
                                              pt.teamInfo.rosterId ===
                                                parseInt(oppKey.split('-')[1])
                                            );
                                          })
                                        ] || 0
                                      : 0;

                                    const oppWeeklyPosRankLeague = oppWeekData?.opponentKey
                                      ? weeklyPosRanksLeague[
                                          leaguePosTeams.findIndex(pt => {
                                            const oppKey = oppWeekData.opponentKey;
                                            return (
                                              oppKey &&
                                              pt.teamInfo.leagueId === oppKey.split('-')[0] &&
                                              pt.teamInfo.rosterId ===
                                                parseInt(oppKey.split('-')[1])
                                            );
                                          })
                                        ] || 0
                                      : 0;

                                    const weeklyPosAvg = mean(allWeeklyPosVals);
                                    const weeklyPosMedian = median(allWeeklyPosVals);
                                    const vsAvg = myPosPoints - weeklyPosAvg;
                                    const vsMedian = myPosPoints - weeklyPosMedian;

                                    const rows = [];

                                    // Main data row
                                    rows.push(
                                      <tr
                                        key={week}
                                        className='border-t hover:bg-muted/10 cursor-pointer'
                                        onClick={() => {
                                          const newExpanded = new Set(expandedRows);
                                          if (isExpanded) {
                                            newExpanded.delete(rowKey);
                                          } else {
                                            newExpanded.add(rowKey);
                                          }
                                          setExpandedRows(newExpanded);
                                        }}
                                      >
                                        <td className='px-3 py-2 font-medium'>
                                          <div className='flex items-center gap-1'>
                                            Week {week}
                                            <span className='text-xs text-muted-foreground'>
                                              {isExpanded ? '▼' : '▶'}
                                            </span>
                                          </div>
                                        </td>
                                        <td
                                          className='px-3 py-2 text-right font-mono font-bold'
                                          style={{ color: colors.core.regalGold }}
                                        >
                                          {myPosPoints.toFixed(1)}
                                        </td>
                                        <td className='px-3 py-2 text-center'>
                                          <span
                                            className='rounded-full px-2 py-1 text-xs font-medium'
                                            style={{
                                              backgroundColor: getRankColor(weeklyPosRank24, 24),
                                              color: getTextColor(
                                                getRankColor(weeklyPosRank24, 24)
                                              ),
                                            }}
                                          >
                                            {weeklyPosRank24}
                                          </span>
                                        </td>
                                        <td className='px-3 py-2 text-center'>
                                          <span
                                            className='rounded-full px-2 py-1 text-xs font-medium'
                                            style={{
                                              backgroundColor: getRankColor(
                                                weeklyPosRankLeague,
                                                12
                                              ),
                                              color: getTextColor(
                                                getRankColor(weeklyPosRankLeague, 12)
                                              ),
                                            }}
                                          >
                                            {weeklyPosRankLeague}
                                          </span>
                                        </td>
                                        <td className='px-3 py-2 text-right font-mono'>
                                          {oppPosPoints.toFixed(1)}
                                        </td>
                                        <td className='px-3 py-2 text-center'>
                                          <span
                                            className='rounded-full px-2 py-1 text-xs font-medium'
                                            style={{
                                              backgroundColor: getRankColor(oppWeeklyPosRank24, 24),
                                              color: getTextColor(
                                                getRankColor(oppWeeklyPosRank24, 24)
                                              ),
                                            }}
                                            title={`Opponent ${position} ranked ${oppWeeklyPosRank24} of 24 teams`}
                                          >
                                            {oppWeeklyPosRank24}
                                          </span>
                                        </td>
                                        <td className='px-3 py-2 text-center'>
                                          <span
                                            className='rounded-full px-2 py-1 text-xs font-medium'
                                            style={{
                                              backgroundColor: getRankColor(
                                                oppWeeklyPosRankLeague,
                                                12
                                              ),
                                              color: getTextColor(
                                                getRankColor(oppWeeklyPosRankLeague, 12)
                                              ),
                                            }}
                                            title={`Opponent ${position} ranked ${oppWeeklyPosRankLeague} of 12 in league`}
                                          >
                                            {oppWeeklyPosRankLeague}
                                          </span>
                                        </td>
                                        <td
                                          className='px-3 py-2 text-right font-mono text-xs'
                                          style={{ color: getPerformanceColor(vsAvg, vsAvg > 0) }}
                                        >
                                          {vsAvg > 0 ? '+' : ''}
                                          {vsAvg.toFixed(1)}
                                        </td>
                                        <td
                                          className='px-3 py-2 text-right font-mono text-xs'
                                          style={{
                                            color: getPerformanceColor(vsMedian, vsMedian > 0),
                                          }}
                                        >
                                          {vsMedian > 0 ? '+' : ''}
                                          {vsMedian.toFixed(1)}
                                        </td>
                                      </tr>
                                    );

                                    // Player breakdown row (if expanded)
                                    if (isExpanded) {
                                      const weekPlayerData =
                                        dataset.weeklyPlayerData[week]?.[selectedTeamKey];
                                      const playersForPosition =
                                        weekPlayerData?.positions[position] || [];

                                      rows.push(
                                        <tr key={`${week}-breakdown`} className='bg-muted/5'>
                                          <td colSpan={9} className='p-0'>
                                            <PlayerBreakdownRow
                                              players={playersForPosition}
                                              position={position}
                                            />
                                          </td>
                                        </tr>
                                      );
                                    }

                                    return rows;
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Team Positional Advantages */}
                <div>
                  <h3
                    className='mb-3 text-lg font-semibold'
                    style={{ color: colors.core.crimsonRed }}
                  >
                    Positional Advantages vs League Median
                  </h3>
                  {(() => {
                    const teamSummary = getTeamPositionalSummary(dataset, selectedTeamKey, {
                      from: fromWeek,
                      to: toWeek,
                    });

                    if (!teamSummary) {
                      return (
                        <div className='rounded-md border p-4'>
                          <div className='text-sm text-muted-foreground'>
                            No positional data available
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className='rounded-md border'>
                        <table className='w-full text-sm'>
                          <thead className='bg-muted/50'>
                            <tr>
                              <th className='px-4 py-3 text-left'>Position</th>
                              <th className='px-4 py-3 text-right'>Weekly Avg</th>
                              <th className='px-4 py-3 text-right'>League Median</th>
                              <th className='px-4 py-3 text-right'>Advantage/Disadvantage</th>
                              <th className='px-4 py-3 text-right'>% Difference</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(
                              Object.entries(teamSummary.positions) as Array<[TrackedPosition, any]>
                            ).map(([position, posData]) => {
                              const isAdvantage = posData.advantage > 0;
                              const advantageColor =
                                posData.advantage === 0
                                  ? colors.rdylgn[5]
                                  : isAdvantage
                                    ? colors.rdylgn[8]
                                    : colors.rdylgn[2];

                              return (
                                <tr key={position} className='border-t'>
                                  <td className='px-4 py-3 font-medium'>{position}</td>
                                  <td
                                    className='px-4 py-3 text-right font-mono font-bold'
                                    style={{ color: colors.core.regalGold }}
                                  >
                                    {posData.weeklyAverage.toFixed(1)}
                                  </td>
                                  <td className='px-4 py-3 text-right font-mono'>
                                    {posData.leagueMedian.toFixed(1)}
                                  </td>
                                  <td
                                    className='px-4 py-3 text-right font-mono font-bold'
                                    style={{ color: advantageColor }}
                                  >
                                    {posData.advantage > 0 ? '+' : ''}
                                    {posData.advantage.toFixed(1)}
                                  </td>
                                  <td
                                    className='px-4 py-3 text-right font-mono font-bold'
                                    style={{ color: advantageColor }}
                                  >
                                    {posData.percentageAdvantage > 0 ? '+' : ''}
                                    {posData.percentageAdvantage.toFixed(1)}%
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className='border-t-2 bg-muted/20'>
                              <td className='px-4 py-3 font-bold'>Total Advantage</td>
                              <td className='px-4 py-3'></td>
                              <td className='px-4 py-3'></td>
                              <td
                                className='px-4 py-3 text-right font-mono font-bold'
                                style={{
                                  color:
                                    teamSummary.totalAdvantage > 0
                                      ? colors.rdylgn[8]
                                      : teamSummary.totalAdvantage < 0
                                        ? colors.rdylgn[2]
                                        : colors.rdylgn[5],
                                }}
                              >
                                {teamSummary.totalAdvantage > 0 ? '+' : ''}
                                {teamSummary.totalAdvantage.toFixed(1)}
                              </td>
                              <td
                                className='px-4 py-3 text-right font-mono font-bold'
                                style={{
                                  color:
                                    teamSummary.averageAdvantage > 0
                                      ? colors.rdylgn[8]
                                      : teamSummary.averageAdvantage < 0
                                        ? colors.rdylgn[2]
                                        : colors.rdylgn[5],
                                }}
                              >
                                Avg: {teamSummary.averageAdvantage > 0 ? '+' : ''}
                                {teamSummary.averageAdvantage.toFixed(1)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='league'>
          <LeagueView />
        </TabsContent>

        <TabsContent value='schedule'>
          <ScheduleAnalysis />
        </TabsContent>

        <TabsContent value='trends'>
          <TrendsView />
        </TabsContent>

        <TabsContent value='scatter'>
          <ScatterAnalysis />
        </TabsContent>

        <TabsContent value='transactions'>
          <TransactionAnalysis key='transaction-analysis' />
        </TabsContent>

        <TabsContent value='start-sit'>
          <StartSitEfficiencyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
