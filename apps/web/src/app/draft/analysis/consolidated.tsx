'use client';

/* eslint-disable no-console */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MockDraft } from '@/lib/draft-generator';
import { DraftAnalytics, generateMockAnalytics } from '@/lib/draft-analytics';
import { generateManagerAnalytics, ManagerAnalytics } from '@/lib/manager-analytics';
import {
  getPrecomputedAnalytics,
  getPrecomputedDrafts,
  getPrecomputedManagerAnalytics,
} from '@/lib/precomputed-data-loader';
import { PositionalCurvesChart } from '@/components/charts/positional-curves-chart';
import { ManagerAnalysis } from '@/components/manager-analysis';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import {
  BarChart3,
  Filter,
  Shuffle,
  Trophy,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function DraftAnalysisPage() {
  const [drafts, setDrafts] = useState(() => {
    const precomputed = getPrecomputedDrafts();
    if (precomputed) {
      console.log('⚡ Using precomputed draft data');
      return [precomputed.draft1, precomputed.draft2];
    }
    console.log('🐌 Generating draft data (consider running precompute script)');
    return getPreGeneratedDrafts();
  });

  const [draft1, draft2] = drafts;
  const [analytics, setAnalytics] = useState<DraftAnalytics | null>(null);
  const [managerAnalytics, setManagerAnalytics] = useState<ManagerAnalytics | null>(null);
  const [activeSection, setActiveSection] = useState<string>('league');

  // Navigation sections for sticky header
  const sections = [
    { id: 'league', label: 'League Analysis', icon: BarChart3 },
    { id: 'managers', label: 'Manager Behavior', icon: Users },
    { id: 'teams', label: 'Team Directory', icon: Trophy },
    { id: 'data', label: 'Draft Data', icon: Filter },
  ];

  // Load analytics
  useEffect(() => {
    const precomputedLeagueAnalytics = getPrecomputedAnalytics();
    const precomputedManagerAnalytics = getPrecomputedManagerAnalytics();

    if (precomputedLeagueAnalytics && precomputedManagerAnalytics) {
      console.log('⚡ Using precomputed analytics (instant load)');
      setAnalytics(precomputedLeagueAnalytics);
      setManagerAnalytics(precomputedManagerAnalytics);
    } else {
      console.log('🐌 Generating analytics on demand...');
      const startTime = Date.now();
      const leagueAnalytics = generateMockAnalytics(draft1, draft2);
      const managerAnalytics = generateManagerAnalytics(draft1, draft2);
      const endTime = Date.now();

      console.log(`⏱️ Analytics generated in ${endTime - startTime}ms`);
      setAnalytics(leagueAnalytics);
      setManagerAnalytics(managerAnalytics);
    }
  }, [draft1, draft2]);

  const regenerateDrafts = () => {
    console.log('🔄 Regenerating drafts...');
    const newDrafts = getPreGeneratedDrafts();
    setDrafts(newDrafts);
    setAnalytics(null);
    setManagerAnalytics(null);
    console.log('💡 New drafts generated - analytics will be computed on demand');
  };

  const getPositionColor = (position: string) => {
    const colors = {
      QB: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      RB: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      WR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      TE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      DEF: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };
    return colors[position as keyof typeof colors] || colors.DEF;
  };

  const getValueColor = (value: number) => {
    if (value > 5) return 'text-green-600 dark:text-green-400';
    if (value > 0) return 'text-green-500 dark:text-green-400';
    if (value > -5) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-500 dark:text-red-400';
  };



  return (
    <div className='relative'>
      {/* Fixed Header */}
      <div className='sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40'>
        <div className='flex items-center justify-between p-4'>
          <div>
            <h1 className='text-2xl font-bold font-geizer'>Draft Analysis Report</h1>
            <p className='text-sm text-muted-foreground'>
              Complete analysis of {draft1.name} vs {draft2.name}
            </p>
          </div>
          <Button onClick={regenerateDrafts} className='flex items-center gap-2'>
            <Shuffle className='h-4 w-4' />
            Generate New Drafts
          </Button>
        </div>

        {/* Sticky Navigation */}
        <div className='flex items-center gap-2 px-4 pb-2'>
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'ghost'}
                size='sm'
                className='flex items-center gap-2'
                onClick={() => {
                  setActiveSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Icon className='h-4 w-4' />
                {section.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {(!analytics || !managerAnalytics) && (
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>
              {!analytics ? 'Generating league analytics...' : 'Analyzing manager behavior...'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {analytics && managerAnalytics && (
        <div className='space-y-0'>
          {/* 🏈 League-Level Analysis Section */}
          <section id='league' className='py-12 px-4 bg-background'>
            <div className='max-w-7xl mx-auto space-y-8'>
              <div className='text-center'>
                <h2 className='text-3xl font-bold mb-2'>🏈 League-Level Analysis</h2>
                <p className='text-muted-foreground max-w-2xl mx-auto'>
                  Market dynamics, position valuations, and cross-league price differences
                </p>
              </div>

              {/* Market Overview Cards */}
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      Market Concentration
                      <InfoTooltip
                        title='Market Concentration'
                        description='Gini coefficient measures spending inequality - how much money went to star players vs depth players.'
                        interpretation="Higher values = more 'stars and scrubs' approach."
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>AFC</span>
                        <span className='font-medium'>
                          {analytics.market_shape.league_A.gini_prices}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>NFC</span>
                        <span className='font-medium'>
                          {analytics.market_shape.league_B.gini_prices}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      Nomination Effects
                      <InfoTooltip
                        title='Nomination Effects'
                        description='How draft position affects player prices.'
                        interpretation='Negative values = early picks cost more.'
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>AFC β/10</span>
                        <span className='font-medium'>
                          ${analytics.nomination_effects.league_A.beta_per_10_picks}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>NFC β/10</span>
                        <span className='font-medium'>
                          ${analytics.nomination_effects.league_B.beta_per_10_picks}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      Cross-League Agreement
                      <InfoTooltip
                        title='Rank Correlation'
                        description='How similarly both leagues valued players.'
                        interpretation='1.0 = perfect agreement, 0.0 = no agreement.'
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex items-center justify-center h-16'>
                      <div className='text-center'>
                        <div className='text-2xl font-bold'>
                          {analytics.spearman_rank_correlation.toFixed(2)}
                        </div>
                        <div className='text-xs text-muted-foreground'>Spearman ρ</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Position Spending Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Position Spending Comparison</CardTitle>
                  <CardDescription>
                    Cross-league spending by position showing market disagreements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead className='text-right'>AFC Avg</TableHead>
                        <TableHead className='text-right'>NFC Avg</TableHead>
                        <TableHead className='text-right'>Difference</TableHead>
                        <TableHead className='text-right'>% Difference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.position_inflation.map(pos => {
                        const percentDiff =
                          pos.avg_raw_B > 0
                            ? ((pos.avg_raw_A - pos.avg_raw_B) / pos.avg_raw_B) * 100
                            : 0;
                        return (
                          <TableRow key={pos.pos}>
                            <TableCell>
                              <Badge variant='outline' className={getPositionColor(pos.pos)}>
                                {pos.pos}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-right font-medium'>
                              ${pos.avg_raw_A}
                            </TableCell>
                            <TableCell className='text-right font-medium'>
                              ${pos.avg_raw_B}
                            </TableCell>
                            <TableCell
                              className={`text-right font-medium ${pos.delta_avg_raw >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {pos.delta_avg_raw >= 0 ? '+' : ''}${pos.delta_avg_raw}
                            </TableCell>
                            <TableCell
                              className={`text-right font-medium ${percentDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {percentDiff >= 0 ? '+' : ''}
                              {percentDiff.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Positional Spending Curves */}
              <Card>
                <CardHeader>
                  <CardTitle>Positional Spending Curves</CardTitle>
                  <CardDescription>
                    Elite vs depth player valuation strategies by position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PositionalCurvesChart
                    draft1={draft1}
                    draft2={draft2}
                    analytics={analytics}
                    height={500}
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 👥 Manager-Level Analysis Section */}
          <section id='managers' className='py-12 px-4 bg-muted/20'>
            <div className='max-w-7xl mx-auto space-y-8'>
              <div className='text-center'>
                <h2 className='text-3xl font-bold mb-2'>👥 Manager-Level Analysis</h2>
                <p className='text-muted-foreground max-w-2xl mx-auto'>
                  Individual spending behavior, build types, and strategic patterns
                </p>
              </div>

              {/* Manager Analysis Component */}
              <ManagerAnalysis analytics={managerAnalytics} />
            </div>
          </section>

          {/* 🏆 Team Directory Section */}
          <section id='teams' className='py-12 px-4 bg-background'>
            <div className='max-w-7xl mx-auto space-y-8'>
              <div className='text-center'>
                <h2 className='text-3xl font-bold mb-2'>🏆 Team Directory</h2>
                <p className='text-muted-foreground max-w-2xl mx-auto'>
                  Complete roster breakdown organized by league and division
                </p>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* AFC Teams */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Trophy className='h-5 w-5 text-red-600' />
                      AFC Teams ({draft1.name})
                    </CardTitle>
                    <CardDescription>All teams from the AFC draft</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-1 gap-4'>
                      {draft1.teams.map(team => (
                        <div key={team.teamId} className='border rounded-lg p-4'>
                          <div className='flex justify-between items-center mb-3'>
                            <h4 className='font-semibold text-lg'>{team.teamName}</h4>
                            <div className='text-right'>
                              <div className='font-bold'>${team.totalSpent}</div>
                              <div className='text-xs text-muted-foreground'>
                                {team.picks.length} picks
                              </div>
                            </div>
                          </div>
                          <div className='grid grid-cols-3 gap-1 text-xs'>
                            {team.picks.slice(0, 6).map(pick => (
                              <div
                                key={pick.pickNumber}
                                className='flex items-center justify-between bg-muted/30 rounded p-1'
                              >
                                <div className='flex items-center gap-1'>
                                  <Badge variant='outline' className='text-[10px] px-1'>
                                    {pick.player.position}
                                  </Badge>
                                  <span className='truncate'>{pick.player.name.split(' ')[0]}</span>
                                </div>
                                <span>${pick.actualPrice}</span>
                              </div>
                            ))}
                            {team.picks.length > 6 && (
                              <div className='text-center text-muted-foreground col-span-3 py-1'>
                                +{team.picks.length - 6} more players
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* NFC Teams */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Trophy className='h-5 w-5 text-blue-600' />
                      NFC Teams ({draft2.name})
                    </CardTitle>
                    <CardDescription>All teams from the NFC draft</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-1 gap-4'>
                      {draft2.teams.map(team => (
                        <div key={team.teamId} className='border rounded-lg p-4'>
                          <div className='flex justify-between items-center mb-3'>
                            <h4 className='font-semibold text-lg'>{team.teamName}</h4>
                            <div className='text-right'>
                              <div className='font-bold'>${team.totalSpent}</div>
                              <div className='text-xs text-muted-foreground'>
                                {team.picks.length} picks
                              </div>
                            </div>
                          </div>
                          <div className='grid grid-cols-3 gap-1 text-xs'>
                            {team.picks.slice(0, 6).map(pick => (
                              <div
                                key={pick.pickNumber}
                                className='flex items-center justify-between bg-muted/30 rounded p-1'
                              >
                                <div className='flex items-center gap-1'>
                                  <Badge variant='outline' className='text-[10px] px-1'>
                                    {pick.player.position}
                                  </Badge>
                                  <span className='truncate'>{pick.player.name.split(' ')[0]}</span>
                                </div>
                                <span>${pick.actualPrice}</span>
                              </div>
                            ))}
                            {team.picks.length > 6 && (
                              <div className='text-center text-muted-foreground col-span-3 py-1'>
                                +{team.picks.length - 6} more players
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* 📋 Complete Draft Data Section */}
          <section id='data' className='py-12 px-4 bg-muted/20'>
            <div className='max-w-7xl mx-auto space-y-8'>
              <div className='text-center'>
                <h2 className='text-3xl font-bold mb-2'>📋 Complete Draft Data</h2>
                <p className='text-muted-foreground max-w-2xl mx-auto'>
                  Comprehensive table of all picks with filtering and search capabilities
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Filter className='h-5 w-5' />
                    All Draft Picks
                  </CardTitle>
                  <CardDescription>
                    Complete dataset of{' '}
                    {draft1.teams.reduce((sum, t) => sum + t.picks.length, 0) +
                      draft2.teams.reduce((sum, t) => sum + t.picks.length, 0)}{' '}
                    total picks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {/* Filter Controls */}
                    <div className='flex flex-wrap gap-4 items-center'>
                      <div className='flex items-center gap-2'>
                        <Label>League:</Label>
                        <Select defaultValue='all'>
                          <SelectTrigger className='w-32'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='all'>All</SelectItem>
                            <SelectItem value='afc'>AFC</SelectItem>
                            <SelectItem value='nfc'>NFC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Label>Position:</Label>
                        <Select defaultValue='all'>
                          <SelectTrigger className='w-24'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='all'>All</SelectItem>
                            <SelectItem value='QB'>QB</SelectItem>
                            <SelectItem value='RB'>RB</SelectItem>
                            <SelectItem value='WR'>WR</SelectItem>
                            <SelectItem value='TE'>TE</SelectItem>
                            <SelectItem value='DEF'>DEF</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Checkbox id='starters-only' />
                        <Label htmlFor='starters-only'>Starters Only</Label>
                      </div>
                    </div>

                    {/* Draft Picks Table */}
                    <div className='rounded-md border max-h-96 overflow-auto'>
                      <Table>
                        <TableHeader className='sticky top-0 bg-background'>
                          <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>Pos</TableHead>
                            <TableHead>League</TableHead>
                            <TableHead>Manager</TableHead>
                            <TableHead className='text-right'>Price</TableHead>
                            <TableHead className='text-right'>AAV</TableHead>
                            <TableHead className='text-right'>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...draft1.teams, ...draft2.teams]
                            .flatMap((team, teamIndex) =>
                              team.picks.map(pick => ({
                                ...pick,
                                league: teamIndex < draft1.teams.length ? 'AFC' : 'NFC',
                                teamName: team.teamName,
                              }))
                            )
                            .sort((a, b) => b.player.aav - a.player.aav)
                            .slice(0, 100)
                            .map((pick, _index) => (
                              <TableRow key={`${pick.league}-${pick.pickNumber}`}>
                                <TableCell>
                                  <div className='font-medium'>{pick.player.name}</div>
                                  <div className='text-xs text-muted-foreground'>
                                    {pick.player.team}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant='outline'
                                    className={getPositionColor(pick.player.position)}
                                  >
                                    {pick.player.position}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={pick.league === 'AFC' ? 'default' : 'secondary'}>
                                    {pick.league}
                                  </Badge>
                                </TableCell>
                                <TableCell className='text-sm'>{pick.teamName}</TableCell>
                                <TableCell className='text-right font-mono'>
                                  ${pick.actualPrice}
                                </TableCell>
                                <TableCell className='text-right font-mono text-muted-foreground'>
                                  ${pick.player.aav}
                                </TableCell>
                                <TableCell
                                  className={`text-right font-mono ${getValueColor(pick.valueOverAAV)}`}
                                >
                                  {pick.valueOverAAV > 0 ? '+' : ''}
                                  {pick.valueOverAAV}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className='text-sm text-muted-foreground text-center py-2'>
                      Showing top 100 picks by AAV. Use filters to explore specific subsets.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
