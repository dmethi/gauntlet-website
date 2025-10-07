'use client';

/* eslint-disable no-console */

import React, { useEffect, useState } from 'react';
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
import { MockDraft, getPreGeneratedDrafts } from '@/lib/draft-generator';
import { getRealDrafts } from '@/lib/draft-data-fetcher';
import { DraftAnalytics, generateMockAnalytics } from '@/features/draft-analysis/utils';
import { ManagerAnalytics, generateManagerAnalytics, inferStarters } from '@/lib/manager-analytics';
import {
  getPrecomputedAnalytics,
  getPrecomputedDrafts,
  getPrecomputedManagerAnalytics,
} from '@/lib/precomputed-data-loader';
import { PositionalCurvesChart } from '@/components/charts/positional-curves-chart';
import { ManagerAnalysis } from '@/features/draft-analysis';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { BarChart3, Filter, Trophy, Users } from 'lucide-react';

export default function DraftAnalysisPage() {
  // All useState hooks must be at the top, before any conditional logic
  const [drafts, setDrafts] = useState<[MockDraft, MockDraft] | null>(null);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<DraftAnalytics | null>(null);
  const [managerAnalytics, setManagerAnalytics] = useState<ManagerAnalytics | null>(null);
  const [activeSection, setActiveSection] = useState<string>('league');
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(
    new Set(['QB', 'RB', 'WR', 'TE', 'DEF']),
  );

  // Filter states for draft data table
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [startersOnly, setStartersOnly] = useState<boolean>(false);

  // Function to toggle position expansion
  const togglePosition = (position: string) => {
    const newExpanded = new Set(expandedPositions);
    if (newExpanded.has(position)) {
      newExpanded.delete(position);
    } else {
      newExpanded.add(position);
    }
    setExpandedPositions(newExpanded);
  };

  // Helper function for RdYlGn heatmap colors
  const getRdYlGnColorForDiff = (value: number, min: number, max: number) => {
    if (max === min) return 'transparent';

    const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));

    // RdYlGn color scale (reversed so red is negative, green is positive)
    const colors = [
      'rgb(215, 48, 39)', // Dark red
      'rgb(244, 109, 67)', // Red
      'rgb(253, 174, 97)', // Light red
      'rgb(254, 224, 139)', // Yellow-red
      'rgb(255, 255, 191)', // Light yellow
      'rgb(217, 239, 139)', // Yellow-green
      'rgb(166, 217, 106)', // Light green
      'rgb(102, 189, 99)', // Green
      'rgb(26, 152, 80)', // Dark green
    ];

    const colorIndex = Math.floor(normalizedValue * (colors.length - 1));
    return colors[colorIndex];
  };

  // Helper function to get contrasting text color using proper WCAG contrast calculation
  const getContrastingTextColor = (backgroundColor: string) => {
    // If there's no background color, use default text
    if (!backgroundColor || backgroundColor === 'transparent') {
      return '';
    }

    // Parse RGB values from any CSS color format
    const parseRgb = (color: string) => {
      // Handle rgba() format
      const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
      if (rgbaMatch) {
        return {
          r: parseInt(rgbaMatch[1]),
          g: parseInt(rgbaMatch[2]),
          b: parseInt(rgbaMatch[3]),
        };
      }

      // Handle rgb() format
      const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        return {
          r: parseInt(rgbMatch[1]),
          g: parseInt(rgbMatch[2]),
          b: parseInt(rgbMatch[3]),
        };
      }

      // Handle hex format
      const hex = color.replace('#', '');
      if (hex.length === 6) {
        return {
          r: parseInt(hex.substr(0, 2), 16),
          g: parseInt(hex.substr(2, 2), 16),
          b: parseInt(hex.substr(4, 2), 16),
        };
      } else if (hex.length === 3) {
        return {
          r: parseInt(hex[0] + hex[0], 16),
          g: parseInt(hex[1] + hex[1], 16),
          b: parseInt(hex[2] + hex[2], 16),
        };
      }

      // Default to medium gray if parsing fails
      return { r: 128, g: 128, b: 128 };
    };

    // Calculate relative luminance using WCAG formula with proper gamma correction
    const calculateLuminance = (r: number, g: number, b: number) => {
      // Convert to 0-1 range
      const rsRGB = r / 255;
      const gsRGB = g / 255;
      const bsRGB = b / 255;

      // Apply gamma correction for sRGB
      const toLinear = (c: number) =>
        c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

      const rLinear = toLinear(rsRGB);
      const gLinear = toLinear(gsRGB);
      const bLinear = toLinear(bsRGB);

      // Calculate relative luminance using WCAG coefficients
      return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    };

    // Calculate contrast ratio between two luminance values
    const contrastRatio = (L1: number, L2: number) => {
      const lighter = Math.max(L1, L2);
      const darker = Math.min(L1, L2);
      return (lighter + 0.05) / (darker + 0.05);
    };

    const rgb = parseRgb(backgroundColor);
    const bgLuminance = calculateLuminance(rgb.r, rgb.g, rgb.b);

    // Luminance values for pure black and white
    const whiteLuminance = 1.0;
    const blackLuminance = 0.0;

    // Calculate contrast ratios
    const whiteContrast = contrastRatio(bgLuminance, whiteLuminance);
    const blackContrast = contrastRatio(bgLuminance, blackLuminance);

    // Choose the color with better contrast (higher ratio)
    // In dark mode, be more aggressive about using white text for better readability
    const lightModeUseWhite = whiteContrast > blackContrast;
    const darkModeUseWhite = whiteContrast > blackContrast * 0.7; // Lower threshold for dark mode

    // Return theme-specific classes for optimal readability
    return lightModeUseWhite
      ? darkModeUseWhite
        ? 'text-white'
        : 'text-black dark:text-white'
      : darkModeUseWhite
        ? 'text-white dark:text-white'
        : 'text-black';
  };

  // Helper function for red heatmap colors (for price values)
  const getRedHeatmapColor = (value: number, min: number, max: number) => {
    if (max === min) return 'transparent';

    const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));

    // Red color scale from light to dark
    const colors = [
      'rgba(255, 245, 240, 0.3)', // Very light red
      'rgba(254, 224, 210, 0.4)', // Light red
      'rgba(252, 187, 161, 0.5)', // Light red
      'rgba(252, 146, 114, 0.6)', // Medium light red
      'rgba(251, 106, 74, 0.7)', // Medium red
      'rgba(239, 59, 44, 0.8)', // Medium dark red
      'rgba(203, 24, 29, 0.85)', // Dark red
      'rgba(165, 15, 21, 0.9)', // Darker red
      'rgba(103, 0, 13, 0.95)', // Very dark red
    ];

    const colorIndex = Math.floor(normalizedValue * (colors.length - 1));
    return colors[colorIndex];
  };

  // Helper function to handle checkbox state
  const handleStartersOnlyChange = (checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
      setStartersOnly(checked);
    }
  };

  // Load draft data and analytics on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingDrafts(true);
        setError(null);

        // First, check if we have precomputed data (much faster!)
        console.log('🔍 Checking for precomputed data...');
        const precomputedDrafts = await getPrecomputedDrafts();
        const precomputedLeagueAnalytics = await getPrecomputedAnalytics();
        const precomputedManagerAnalytics = await getPrecomputedManagerAnalytics();

        console.log('📊 Precomputed drafts:', !!precomputedDrafts);
        console.log('📊 Precomputed league analytics:', !!precomputedLeagueAnalytics);
        console.log('📊 Precomputed manager analytics:', !!precomputedManagerAnalytics);

        if (precomputedDrafts && precomputedLeagueAnalytics && precomputedManagerAnalytics) {
          // Validate precomputed data sanity before using
          const totalsOk = [
            ...precomputedDrafts.draft1.teams,
            ...precomputedDrafts.draft2.teams,
          ].every(t => t.totalSpent <= 250 && t.totalSpent >= 0);
          const namesOk = precomputedManagerAnalytics.profiles.every(p => !!p.manager);
          if (totalsOk && namesOk) {
            console.log('⚡ Using precomputed data (instant load!)');
            setDrafts([precomputedDrafts.draft1, precomputedDrafts.draft2]);
            setAnalytics(precomputedLeagueAnalytics);
            setManagerAnalytics(precomputedManagerAnalytics);
            console.log('✅ All precomputed data loaded successfully');
            setIsLoadingDrafts(false);
            return;
          } else {
            console.warn(
              '⚠️ Precomputed data failed sanity checks. totalsOk=',
              totalsOk,
              'namesOk=',
              namesOk,
            );
          }
        }

        // If no precomputed data, fetch real draft data from Sleeper API (slower)
        console.log('🔍 No precomputed data found, fetching from Sleeper API...');
        console.log('💡 This will be slower. Run: npm run precompute:real');
        const { draft1, draft2 } = await getRealDrafts();
        setDrafts([draft1, draft2]);

        // Generate analytics on-demand
        console.log('📈 Generating analytics on-demand...');
        const analytics = generateMockAnalytics(draft1, draft2);
        const managerAnalytics = generateManagerAnalytics(draft1, draft2);
        setAnalytics(analytics);
        setManagerAnalytics(managerAnalytics);

        console.log('✅ Successfully loaded real draft data and computed analytics');
      } catch (err) {
        console.error('❌ Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');

        // Fallback to mock data
        console.log('🎲 Falling back to mock draft data...');
        try {
          const mockDrafts = getPreGeneratedDrafts();
          setDrafts(mockDrafts);

          const analytics = generateMockAnalytics(mockDrafts[0], mockDrafts[1]);
          const managerAnalytics = generateManagerAnalytics(mockDrafts[0], mockDrafts[1]);
          setAnalytics(analytics);
          setManagerAnalytics(managerAnalytics);
        } catch (mockError) {
          console.error('❌ Even mock data failed:', mockError);
        }
      } finally {
        setIsLoadingDrafts(false);
      }
    }

    loadData();
  }, []);

  // Auto-update active section based on scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0.1,
      },
    );

    const ids = ['league', 'managers', 'teams', 'data'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Show loading state early return (after all hooks)
  if (isLoadingDrafts || !drafts || !analytics || !managerAnalytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <div className="text-lg font-medium">
            {error
              ? 'Loading fallback data...'
              : isLoadingDrafts
                ? 'Loading draft data...'
                : 'Loading analytics...'}
          </div>
          <div className="text-sm text-muted-foreground">
            Drafts: {drafts ? '✅' : '⏳'} | Analytics: {analytics ? '✅' : '⏳'} | Manager Data:{' '}
            {managerAnalytics ? '✅' : '⏳'}
          </div>
          {error && (
            <div className="text-red-600 text-sm max-w-md mx-auto">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Safe to destructure drafts here since we've checked it's not null above
  const [draft1, draft2] = drafts;

  // Navigation sections for sticky header
  const sections = [
    { id: 'league', label: 'League Analysis', icon: BarChart3 },
    { id: 'managers', label: 'Manager Behavior', icon: Users },
    { id: 'teams', label: 'Team Directory', icon: Trophy },
    { id: 'data', label: 'Draft Data', icon: Filter },
  ];

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

  return (
    <div className="relative">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold font-geizer">Draft Analysis Report</h1>
            <p className="text-sm text-muted-foreground">
              Complete analysis of {draft1.name} vs {draft2.name}
            </p>
          </div>
        </div>

        {/* Sticky Navigation */}
        <div className="flex items-center gap-2 px-4 pb-2">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  setActiveSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {(!analytics || !managerAnalytics) && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {!analytics ? 'Generating league analytics...' : 'Analyzing manager behavior...'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {analytics && managerAnalytics && (
        <div className="space-y-0">
          {/* 🏈 League-Level Analysis Section */}
          <section id="league" className="py-12 px-4 bg-background">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">🏈 League-Level Analysis</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Market dynamics, position valuations, and cross-league price differences
                </p>
              </div>

              {/* Market Overview Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Market Concentration
                      <InfoTooltip
                        title="Market Concentration"
                        description="Gini coefficient measures spending inequality - how much money went to star players vs depth players."
                        interpretation="Higher values = more 'stars and scrubs' approach."
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">AFC</span>
                        <span className="font-medium">
                          {analytics.market_shape.league_A.gini_prices}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">NFC</span>
                        <span className="font-medium">
                          {analytics.market_shape.league_B.gini_prices}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Nomination Effects
                      <InfoTooltip
                        title="Nomination Effects"
                        description="How draft position affects player prices."
                        interpretation="Negative values = early picks cost more."
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">AFC β/10</span>
                        <span className="font-medium">
                          ${analytics.nomination_effects.league_A.beta_per_10_picks}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">NFC β/10</span>
                        <span className="font-medium">
                          ${analytics.nomination_effects.league_B.beta_per_10_picks}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Cross-League Agreement
                      <InfoTooltip
                        title="Rank Correlation"
                        description="How similarly both leagues valued players."
                        interpretation="1.0 = perfect agreement, 0.0 = no agreement."
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-16">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {analytics.spearman_rank_correlation.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Spearman ρ</div>
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
                    Cross-league spending by position using quartile averages to show market
                    disagreements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Calculate min/max values for heatmaps
                    const allAfcValues = analytics.position_inflation.map(pos => pos.avg_raw_A);
                    const allNfcValues = analytics.position_inflation.map(pos => pos.avg_raw_B);
                    const minAfcValue = Math.min(...allAfcValues);
                    const maxAfcValue = Math.max(...allAfcValues);
                    const minNfcValue = Math.min(...allNfcValues);
                    const maxNfcValue = Math.max(...allNfcValues);

                    return (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Position</TableHead>
                            <TableHead className="text-right">AFC Avg</TableHead>
                            <TableHead className="text-right">NFC Avg</TableHead>
                            <TableHead className="text-right">Difference</TableHead>
                            <TableHead className="text-right">% Difference</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analytics.position_inflation.map(pos => {
                            const percentDiff =
                              pos.avg_raw_B > 0
                                ? ((pos.avg_raw_A - pos.avg_raw_B) / pos.avg_raw_B) * 100
                                : 0;

                            const quartileData = analytics.position_quartile_breakdowns?.find(
                              breakdown => breakdown.position === pos.pos,
                            );

                            const isExpanded = expandedPositions.has(pos.pos);

                            return (
                              <React.Fragment key={pos.pos}>
                                {/* Main position row */}
                                <TableRow
                                  className="cursor-pointer bg-muted/30 hover:bg-muted/50 border-b-2 border-border/50 transition-colors duration-200"
                                  onClick={() => togglePosition(pos.pos)}
                                >
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className={getPositionColor(pos.pos)}
                                      >
                                        {pos.pos}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {isExpanded ? '▼ Click to collapse' : '▶ Click to expand'}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell
                                    className={`text-right font-medium ${getContrastingTextColor(
                                      getRedHeatmapColor(pos.avg_raw_A, minAfcValue, maxAfcValue),
                                    )}`}
                                    style={{
                                      backgroundColor: getRedHeatmapColor(
                                        pos.avg_raw_A,
                                        minAfcValue,
                                        maxAfcValue,
                                      ),
                                    }}
                                  >
                                    ${pos.avg_raw_A}
                                  </TableCell>
                                  <TableCell
                                    className={`text-right font-medium ${getContrastingTextColor(
                                      getRedHeatmapColor(pos.avg_raw_B, minNfcValue, maxNfcValue),
                                    )}`}
                                    style={{
                                      backgroundColor: getRedHeatmapColor(
                                        pos.avg_raw_B,
                                        minNfcValue,
                                        maxNfcValue,
                                      ),
                                    }}
                                  >
                                    ${pos.avg_raw_B}
                                  </TableCell>
                                  <TableCell
                                    className={`text-right font-medium ${getContrastingTextColor(
                                      pos.delta_avg_raw !== 0
                                        ? getRdYlGnColorForDiff(pos.delta_avg_raw, -10, 10)
                                        : 'transparent',
                                    )}`}
                                    style={{
                                      backgroundColor:
                                        pos.delta_avg_raw !== 0
                                          ? getRdYlGnColorForDiff(pos.delta_avg_raw, -10, 10)
                                          : 'transparent',
                                    }}
                                  >
                                    {pos.delta_avg_raw >= 0 ? '+' : ''}${pos.delta_avg_raw}
                                  </TableCell>
                                  <TableCell
                                    className={`text-right font-medium ${getContrastingTextColor(
                                      percentDiff !== 0
                                        ? getRdYlGnColorForDiff(percentDiff, -50, 50)
                                        : 'transparent',
                                    )}`}
                                    style={{
                                      backgroundColor:
                                        percentDiff !== 0
                                          ? getRdYlGnColorForDiff(percentDiff, -50, 50)
                                          : 'transparent',
                                    }}
                                  >
                                    {percentDiff >= 0 ? '+' : ''}
                                    {percentDiff.toFixed(1)}%
                                  </TableCell>
                                </TableRow>

                                {/* Quartile breakdown rows */}
                                <tr className="transition-all duration-150 ease-in-out">
                                  <td colSpan={5} className="p-0">
                                    <div
                                      className={`overflow-hidden transition-all duration-150 ease-in-out ${
                                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                      }`}
                                    >
                                      {quartileData &&
                                        (() => {
                                          // Calculate min/max values for quartile heatmaps
                                          const allQuartileAfcValues =
                                            analytics.position_quartile_breakdowns?.flatMap(
                                              breakdown => breakdown.league_A.map(q => q.avgPrice),
                                            ) || [];
                                          const allQuartileNfcValues =
                                            analytics.position_quartile_breakdowns?.flatMap(
                                              breakdown => breakdown.league_B.map(q => q.avgPrice),
                                            ) || [];
                                          const minQuartileAfcValue = Math.min(
                                            ...allQuartileAfcValues,
                                          );
                                          const maxQuartileAfcValue = Math.max(
                                            ...allQuartileAfcValues,
                                          );
                                          const minQuartileNfcValue = Math.min(
                                            ...allQuartileNfcValues,
                                          );
                                          const maxQuartileNfcValue = Math.max(
                                            ...allQuartileNfcValues,
                                          );

                                          return (
                                            <table className="w-full">
                                              <tbody>
                                                {quartileData.league_A.map((quartile, index) => {
                                                  const correspondingB =
                                                    quartileData.league_B[index];
                                                  const qDiff =
                                                    quartile.avgPrice -
                                                    (correspondingB?.avgPrice || 0);
                                                  const qPercentDiff =
                                                    correspondingB?.avgPrice > 0
                                                      ? ((quartile.avgPrice -
                                                          correspondingB.avgPrice) /
                                                          correspondingB.avgPrice) *
                                                        100
                                                      : 0;

                                                  return (
                                                    <tr
                                                      key={`${pos.pos}-${quartile.label}`}
                                                      className="bg-slate-50 dark:bg-slate-800/50"
                                                    >
                                                      <td className="py-1.5 pl-8 text-sm text-muted-foreground">
                                                        {quartile.label} ({quartile.count} players)
                                                      </td>
                                                      <td
                                                        className={`text-right text-sm py-1.5 pr-6 font-medium ${getContrastingTextColor(
                                                          getRedHeatmapColor(
                                                            quartile.avgPrice,
                                                            minQuartileAfcValue,
                                                            maxQuartileAfcValue,
                                                          ),
                                                        )}`}
                                                        style={{
                                                          backgroundColor: getRedHeatmapColor(
                                                            quartile.avgPrice,
                                                            minQuartileAfcValue,
                                                            maxQuartileAfcValue,
                                                          ),
                                                        }}
                                                      >
                                                        ${Math.round(quartile.avgPrice)}
                                                      </td>
                                                      <td
                                                        className={`text-right text-sm py-1.5 pr-6 font-medium ${getContrastingTextColor(
                                                          getRedHeatmapColor(
                                                            correspondingB?.avgPrice || 0,
                                                            minQuartileNfcValue,
                                                            maxQuartileNfcValue,
                                                          ),
                                                        )}`}
                                                        style={{
                                                          backgroundColor: getRedHeatmapColor(
                                                            correspondingB?.avgPrice || 0,
                                                            minQuartileNfcValue,
                                                            maxQuartileNfcValue,
                                                          ),
                                                        }}
                                                      >
                                                        ${Math.round(correspondingB?.avgPrice || 0)}
                                                      </td>
                                                      <td
                                                        className={`text-right text-sm py-1.5 pr-6 font-medium ${getContrastingTextColor(
                                                          qDiff !== 0
                                                            ? getRdYlGnColorForDiff(qDiff, -10, 10)
                                                            : 'transparent',
                                                        )}`}
                                                        style={{
                                                          backgroundColor:
                                                            qDiff !== 0
                                                              ? getRdYlGnColorForDiff(
                                                                  qDiff,
                                                                  -10,
                                                                  10,
                                                                )
                                                              : 'transparent',
                                                        }}
                                                      >
                                                        {qDiff >= 0 ? '+' : ''}${Math.round(qDiff)}
                                                      </td>
                                                      <td
                                                        className={`text-right text-sm py-1.5 pr-6 font-medium ${getContrastingTextColor(
                                                          qPercentDiff !== 0
                                                            ? getRdYlGnColorForDiff(
                                                                qPercentDiff,
                                                                -50,
                                                                50,
                                                              )
                                                            : 'transparent',
                                                        )}`}
                                                        style={{
                                                          backgroundColor:
                                                            qPercentDiff !== 0
                                                              ? getRdYlGnColorForDiff(
                                                                  qPercentDiff,
                                                                  -50,
                                                                  50,
                                                                )
                                                              : 'transparent',
                                                        }}
                                                      >
                                                        {qPercentDiff >= 0 ? '+' : ''}
                                                        {qPercentDiff.toFixed(1)}%
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          );
                                        })()}
                                    </div>
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </TableBody>
                      </Table>
                    );
                  })()}
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
          <section id="managers" className="py-12 px-4 bg-muted/20">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">👥 Manager-Level Analysis</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Individual spending behavior, build types, and strategic patterns
                </p>
              </div>

              {/* Manager Analysis Component */}
              <ManagerAnalysis analytics={managerAnalytics} />
            </div>
          </section>

          {/* 🏆 Team Directory Section */}
          <section id="teams" className="py-12 px-4 bg-background">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">🏆 Team Directory</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Complete roster breakdown organized by league and division
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AFC Teams */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-red-600" />
                      AFC Teams ({draft1.name})
                    </CardTitle>
                    <CardDescription>All teams from the AFC draft</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {draft1.teams.map(team => (
                        <div key={`${draft1.id}-${team.teamId}`} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-lg">{team.teamName}</h4>
                            <div className="text-right">
                              <div className="font-bold">${team.totalSpent}</div>
                              <div className="text-xs text-muted-foreground">
                                {team.picks.length} picks
                              </div>
                            </div>
                          </div>
                          {(() => {
                            // Calculate price ranges for heatmap coloring
                            const allPrices = team.picks.map(pick => pick.actualPrice);
                            const maxPrice = Math.max(...allPrices);
                            const minPrice = Math.min(...allPrices);

                            const getHeatmapColor = (price: number) => {
                              if (maxPrice === minPrice) return 'bg-muted/30';
                              const intensity = (price - minPrice) / (maxPrice - minPrice);
                              // Use red intensity scale for high prices (anchors)
                              const opacity = 0.1 + intensity * 0.4; // 0.1 to 0.5 opacity
                              return `rgba(239, 68, 68, ${opacity})`; // red with variable opacity
                            };

                            const starters = inferStarters(team.picks).starters;
                            const bench = inferStarters(team.picks).bench;

                            return (
                              <>
                                {/* Starters */}
                                <div className="mb-3">
                                  <h5 className="font-medium text-sm text-muted-foreground mb-2">
                                    Starters
                                  </h5>
                                  <div className="grid grid-cols-2 gap-1 text-xs">
                                    {starters.map(pick => (
                                      <div
                                        key={`${draft1.id}-${team.teamId}-${pick.pickNumber}`}
                                        className="flex items-center justify-between rounded p-1 text-black dark:text-white"
                                        style={{
                                          backgroundColor: getHeatmapColor(pick.actualPrice),
                                        }}
                                      >
                                        <div className="flex items-center gap-1">
                                          <Badge variant="outline" className="text-[10px] px-1">
                                            {pick.player.position}
                                          </Badge>
                                          <span className="truncate">
                                            {pick.player.name.split(' ').slice(-1)[0]}
                                          </span>
                                        </div>
                                        <span className="font-medium">${pick.actualPrice}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Bench */}
                                <div>
                                  <h5 className="font-medium text-sm text-muted-foreground mb-2">
                                    Bench
                                  </h5>
                                  <div className="grid grid-cols-2 gap-1 text-xs">
                                    {bench.map(pick => (
                                      <div
                                        key={`${draft1.id}-${team.teamId}-${pick.pickNumber}`}
                                        className="flex items-center justify-between rounded p-1 text-black dark:text-white"
                                        style={{
                                          backgroundColor: getHeatmapColor(pick.actualPrice),
                                        }}
                                      >
                                        <div className="flex items-center gap-1">
                                          <Badge variant="outline" className="text-[10px] px-1">
                                            {pick.player.position}
                                          </Badge>
                                          <span className="truncate">
                                            {pick.player.name.split(' ').slice(-1)[0]}
                                          </span>
                                        </div>
                                        <span className="font-medium">${pick.actualPrice}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* NFC Teams */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-blue-600" />
                      NFC Teams ({draft2.name})
                    </CardTitle>
                    <CardDescription>All teams from the NFC draft</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {draft2.teams.map(team => (
                        <div key={`${draft2.id}-${team.teamId}`} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-lg">{team.teamName}</h4>
                            <div className="text-right">
                              <div className="font-bold">${team.totalSpent}</div>
                              <div className="text-xs text-muted-foreground">
                                {team.picks.length} picks
                              </div>
                            </div>
                          </div>
                          {(() => {
                            // Calculate price ranges for heatmap coloring
                            const allPrices = team.picks.map(pick => pick.actualPrice);
                            const maxPrice = Math.max(...allPrices);
                            const minPrice = Math.min(...allPrices);

                            const getHeatmapColor = (price: number) => {
                              if (maxPrice === minPrice) return 'bg-muted/30';
                              const intensity = (price - minPrice) / (maxPrice - minPrice);
                              // Use red intensity scale for high prices (anchors)
                              const opacity = 0.1 + intensity * 0.4; // 0.1 to 0.5 opacity
                              return `rgba(239, 68, 68, ${opacity})`; // red with variable opacity
                            };

                            const starters = inferStarters(team.picks).starters;
                            const bench = inferStarters(team.picks).bench;

                            return (
                              <>
                                {/* Starters */}
                                <div className="mb-3">
                                  <h5 className="font-medium text-sm text-muted-foreground mb-2">
                                    Starters
                                  </h5>
                                  <div className="grid grid-cols-2 gap-1 text-xs">
                                    {starters.map(pick => (
                                      <div
                                        key={`${draft2.id}-${team.teamId}-${pick.pickNumber}`}
                                        className="flex items-center justify-between rounded p-1 text-black dark:text-white"
                                        style={{
                                          backgroundColor: getHeatmapColor(pick.actualPrice),
                                        }}
                                      >
                                        <div className="flex items-center gap-1">
                                          <Badge variant="outline" className="text-[10px] px-1">
                                            {pick.player.position}
                                          </Badge>
                                          <span className="truncate">
                                            {pick.player.name.split(' ').slice(-1)[0]}
                                          </span>
                                        </div>
                                        <span className="font-medium">${pick.actualPrice}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Bench */}
                                <div>
                                  <h5 className="font-medium text-sm text-muted-foreground mb-2">
                                    Bench
                                  </h5>
                                  <div className="grid grid-cols-2 gap-1 text-xs">
                                    {bench.map(pick => (
                                      <div
                                        key={`${draft2.id}-${team.teamId}-${pick.pickNumber}`}
                                        className="flex items-center justify-between rounded p-1 text-black dark:text-white"
                                        style={{
                                          backgroundColor: getHeatmapColor(pick.actualPrice),
                                        }}
                                      >
                                        <div className="flex items-center gap-1">
                                          <Badge variant="outline" className="text-[10px] px-1">
                                            {pick.player.position}
                                          </Badge>
                                          <span className="truncate">
                                            {pick.player.name.split(' ').slice(-1)[0]}
                                          </span>
                                        </div>
                                        <span className="font-medium">${pick.actualPrice}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* 📋 Complete Draft Data Section */}
          <section id="data" className="py-12 px-4 bg-muted/20">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">📋 Complete Draft Data</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Comprehensive table of all picks with filtering and search capabilities
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
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
                  <div className="space-y-4">
                    {/* Filter Controls */}
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Label>League:</Label>
                        <Select value={leagueFilter} onValueChange={setLeagueFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="AFC">AFC</SelectItem>
                            <SelectItem value="NFC">NFC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label>Position:</Label>
                        <Select value={positionFilter} onValueChange={setPositionFilter}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="QB">QB</SelectItem>
                            <SelectItem value="RB">RB</SelectItem>
                            <SelectItem value="WR">WR</SelectItem>
                            <SelectItem value="TE">TE</SelectItem>
                            <SelectItem value="DEF">DEF</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="starters-only"
                          checked={startersOnly}
                          onCheckedChange={handleStartersOnlyChange}
                        />
                        <Label htmlFor="starters-only">Starters Only</Label>
                      </div>
                    </div>

                    {/* Draft Picks Table */}
                    <div className="rounded-md border max-h-96 overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>Pos</TableHead>
                            <TableHead>League</TableHead>
                            <TableHead>Manager</TableHead>
                            <TableHead className="text-right">Pick #</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-center">Starter</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            // Process all picks from both drafts
                            const allPicks = [...draft1.teams, ...draft2.teams]
                              .flatMap((team, teamIndex) => {
                                const { starters } = inferStarters(team.picks);
                                const starterPickNumbers = new Set(starters.map(s => s.pickNumber));

                                return team.picks.map((pick, _pickIndex) => ({
                                  ...pick,
                                  league: teamIndex < draft1.teams.length ? 'AFC' : 'NFC',
                                  teamName: team.teamName,
                                  isStarter: starterPickNumbers.has(pick.pickNumber),
                                }));
                              })
                              .filter(pick => {
                                // Apply filters
                                if (leagueFilter !== 'all' && pick.league !== leagueFilter)
                                  return false;
                                if (
                                  positionFilter !== 'all' &&
                                  pick.player.position !== positionFilter
                                )
                                  return false;
                                if (startersOnly && !pick.isStarter) return false;
                                return true;
                              })
                              .sort((a, b) => a.pickNumber - b.pickNumber); // Sort by draft order

                            return allPicks.map((pick, _index) => (
                              <TableRow key={`${pick.league}-${pick.pickNumber}`}>
                                <TableCell>
                                  <div className="font-medium">{pick.player.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {pick.player.team}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
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
                                <TableCell className="text-sm">{pick.teamName}</TableCell>
                                <TableCell className="text-right font-mono">
                                  #{pick.pickNumber}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  ${pick.actualPrice}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    variant={pick.isStarter ? 'default' : 'outline'}
                                    className="text-xs"
                                  >
                                    {pick.isStarter ? 'Start' : 'Bench'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ));
                          })()}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="text-sm text-muted-foreground text-center py-2">
                      Showing all filtered picks. Use controls above to narrow results.
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
