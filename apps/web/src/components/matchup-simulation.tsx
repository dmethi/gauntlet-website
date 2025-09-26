'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
// Note: Slider component not available, using input range instead
import {
  AlertCircle,
  BarChart3,
  Clock,
  DollarSign,
  Info,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Inline Score Box Plot Component
interface ScoreBoxPlotProps {
  scores: {
    mean: number;
    median: number;
    p10: number;
    p90: number;
  };
  maxScale: number;
  teamColor: string;
  width?: number;
  height?: number;
}

function ScoreBoxPlot({
  scores,
  maxScale,
  teamColor,
  width = 200,
  height = 20,
}: ScoreBoxPlotProps) {
  // Calculate percentages based on scale from 0 to maxScale
  const p10Percent = (scores.p10 / maxScale) * 100;
  const p25Percent = ((scores.p10 + scores.median) / 2 / maxScale) * 100; // Approximate P25
  const medianPercent = (scores.median / maxScale) * 100;
  const p75Percent = ((scores.median + scores.p90) / 2 / maxScale) * 100; // Approximate P75
  const p90Percent = (scores.p90 / maxScale) * 100;
  const meanPercent = (scores.mean / maxScale) * 100;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='relative cursor-help' style={{ width, height }}>
            {/* Background with scale */}
            <div className='w-full h-full bg-muted/20 rounded relative flex items-center'>
              {/* Scale markers */}
              <div className='absolute bottom-0 left-0 text-[8px] text-muted-foreground/60'>0</div>
              <div className='absolute bottom-0 right-0 text-[8px] text-muted-foreground/60'>
                {maxScale.toFixed(0)}
              </div>

              {/* Box plot container centered vertically */}
              <div className='relative w-full h-3'>
                {/* Whisker line (P10-P90) */}
                <div
                  className='absolute top-1/2 h-0.5 -translate-y-1/2 rounded'
                  style={{
                    left: `${p10Percent}%`,
                    width: `${p90Percent - p10Percent}%`,
                    backgroundColor: teamColor,
                    opacity: 0.7,
                  }}
                />

                {/* Left whisker cap (P10) */}
                <div
                  className='absolute top-1/2 w-0.5 h-2 -translate-y-1/2'
                  style={{
                    left: `${p10Percent}%`,
                    backgroundColor: teamColor,
                  }}
                />

                {/* Right whisker cap (P90) */}
                <div
                  className='absolute top-1/2 w-0.5 h-2 -translate-y-1/2'
                  style={{
                    left: `${p90Percent}%`,
                    backgroundColor: teamColor,
                  }}
                />

                {/* IQR Box (P25-P75 approximation) */}
                <div
                  className='absolute top-1/2 h-3 -translate-y-1/2 rounded border'
                  style={{
                    left: `${p25Percent}%`,
                    width: `${p75Percent - p25Percent}%`,
                    backgroundColor: teamColor,
                    opacity: 0.25,
                    borderColor: teamColor,
                  }}
                />

                {/* Median line */}
                <div
                  className='absolute top-1/2 w-0.5 h-3 -translate-y-1/2 rounded'
                  style={{
                    left: `${medianPercent}%`,
                    backgroundColor: teamColor,
                  }}
                />

                {/* Mean marker (diamond) */}
                <div
                  className='absolute top-1/2 w-1 h-1 -translate-y-1/2 -translate-x-1/2 rounded-full border border-white'
                  style={{
                    left: `${meanPercent}%`,
                    backgroundColor: teamColor,
                  }}
                />
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side='top' className='text-xs'>
          <div className='space-y-1'>
            <div>P10: {scores.p10.toFixed(1)} pts</div>
            <div>P90: {scores.p90.toFixed(1)} pts</div>
            <div>Median: {scores.median.toFixed(1)} pts</div>
            <div>Mean: {scores.mean.toFixed(1)} pts</div>
            <div className='text-foreground/70'>Scale: 0 - {maxScale.toFixed(0)} pts</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface SimulationData {
  team1WinPct: number;
  team2WinPct: number;
  medianMargin: number;
  team1Scores: {
    mean: number;
    median: number;
    p10: number;
    p90: number;
  };
  team2Scores: {
    mean: number;
    median: number;
    p10: number;
    p90: number;
  };
  impliedOdds: {
    team1MoneyLine: number;
    team2MoneyLine: number;
    spread: number;
    total: number;
  };
  teams: Array<{
    rosterId: number;
    teamName: string;
    ownerName: string;
    avatar?: string;
    players: Array<{
      id: string;
      name: string;
      position: string;
      projection: number;
    }>;
  }>;
}

interface MatchupSimulationProps {
  leagueId: string;
  week: number;
  matchupId: number;
  className?: string;
}

export function MatchupSimulation({
  leagueId,
  week,
  matchupId,
  className = '',
}: MatchupSimulationProps) {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marginSlider, setMarginSlider] = useState([0]); // Centered at 0 (push)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSimulation = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await fetch(`/api/matchups/${leagueId}/${week}/${matchupId}/simulate`);

      if (!response.ok) {
        throw new Error(`Failed to fetch simulation: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Simulation failed');
      }

      setSimulationData(data.simulation);
      setLastUpdated(new Date());

      // Initialize slider with simulation data (use actual spread from simulation)
      if (data.simulation.impliedOdds) {
        setMarginSlider([data.simulation.impliedOdds.spread || 0]); // Start at the simulated spread
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load simulation');
      console.error('Simulation error:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, [leagueId, week, matchupId]);

  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const calculateWinProbFromSpread = (spread: number): { team1: number; team2: number } => {
    if (!simulationData) return { team1: 0.5, team2: 0.5 };

    // Calculate probability of winning by the specified margin or more
    // This is different from overall win probability - it's margin-based

    const meanMargin = simulationData.team1Scores.mean - simulationData.team2Scores.mean;
    const marginStdDev = (simulationData.team1Scores.p90 - simulationData.team1Scores.p10) / 2.56; // Approximate std dev

    if (spread === 0) {
      // At push, return overall win probabilities
      return {
        team1: simulationData.team1WinPct,
        team2: simulationData.team2WinPct,
      };
    }

    // Calculate z-score for the margin
    // Positive spread = team1 needs to win by that much
    // Negative spread = team2 needs to win by that much (absolute value)

    let team1Prob, team2Prob;

    if (spread > 0) {
      // Team1 winning by 'spread' points or more
      const zScore = (spread - meanMargin) / marginStdDev;
      team1Prob = Math.max(0.01, 0.5 - zScore * 0.34); // Normal distribution approximation
      team2Prob = Math.max(0.01, 1 - team1Prob - 0.02); // Leave small gap for ties
    } else {
      // Team2 winning by abs(spread) points or more
      const absSpread = Math.abs(spread);
      const zScore = (absSpread + meanMargin) / marginStdDev; // Note: + because we flip the margin
      team2Prob = Math.max(0.01, 0.5 - zScore * 0.34);
      team1Prob = Math.max(0.01, 1 - team2Prob - 0.02);
    }

    // Normalize to ensure they sum close to 1
    const total = team1Prob + team2Prob;
    team1Prob = team1Prob / total;
    team2Prob = team2Prob / total;

    return {
      team1: Math.min(0.99, Math.max(0.01, team1Prob)),
      team2: Math.min(0.99, Math.max(0.01, team2Prob)),
    };
  };

  const getOverUnderDisplay = (): { over: number; under: number; total: number } => {
    if (!simulationData) return { over: 0.5, under: 0.5, total: 250 };

    const projectedTotal = simulationData.team1Scores.mean + simulationData.team2Scores.mean;
    const lineTotal = simulationData.impliedOdds.total;

    // Simple linear model based on difference from line
    const diff = projectedTotal - lineTotal;
    let overPct = 0.5 + diff * 0.01; // ~1% per point difference
    overPct = Math.min(0.95, Math.max(0.05, overPct));

    return { over: overPct, under: 1 - overPct, total: lineTotal };
  };

  if (loading && !simulationData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 font-geizer tracking-wide'>
            <Zap className='h-5 w-5' />
            Monte Carlo Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-20 w-full' />
          <Skeleton className='h-16 w-full' />
          <Skeleton className='h-24 w-full' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 font-geizer tracking-wide text-red-600'>
            <AlertCircle className='h-5 w-5' />
            Simulation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground mb-4'>{error}</p>
          <Button onClick={() => fetchSimulation()} variant='outline'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!simulationData) {
    return null;
  }

  const winProbs = calculateWinProbFromSpread(marginSlider[0]);
  const ouDisplay = getOverUnderDisplay();

  // Color scale utilities (RdYlGn)
  const getWinProbColor = (prob: number): string => {
    if (prob > 0.65) return 'text-green-600 dark:text-green-400';
    if (prob > 0.55) return 'text-yellow-600 dark:text-yellow-400';
    if (prob > 0.45) return 'text-yellow-500 dark:text-yellow-500';
    if (prob > 0.35) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 font-geizer tracking-wide'>
            <Zap className='h-5 w-5 text-yellow-500' />
            Monte Carlo Simulation
            <Badge variant='outline' className='ml-2'>
              20,000 sims
            </Badge>
          </CardTitle>
          <div className='flex items-center gap-2'>
            {lastUpdated && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className='h-4 w-4 text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              onClick={() => fetchSimulation(false)}
              variant='ghost'
              size='sm'
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Win Probabilities */}
        <div className='grid grid-cols-2 gap-4'>
          <Card>
            <CardContent className='pt-4'>
              <div className='text-center space-y-2'>
                <div className='font-semibold text-sm'>{simulationData.teams[0].teamName}</div>
                <div
                  className={`text-3xl font-bold ${getWinProbColor(simulationData.team1WinPct)}`}
                >
                  {(simulationData.team1WinPct * 100).toFixed(1)}%
                </div>
                <Badge variant='outline' className='text-xs'>
                  {formatOdds(simulationData.impliedOdds.team1MoneyLine)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-4'>
              <div className='text-center space-y-2'>
                <div className='font-semibold text-sm'>{simulationData.teams[1].teamName}</div>
                <div
                  className={`text-3xl font-bold ${getWinProbColor(simulationData.team2WinPct)}`}
                >
                  {(simulationData.team2WinPct * 100).toFixed(1)}%
                </div>
                <Badge variant='outline' className='text-xs'>
                  {formatOdds(simulationData.impliedOdds.team2MoneyLine)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Projections */}
        <div className='space-y-3'>
          <h4 className='font-semibold flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            Score Ranges
          </h4>

          <div className='grid grid-cols-2 gap-4'>
            {/* Team 1 */}
            <div className='space-y-2'>
              <div className='text-sm font-medium'>{simulationData.teams[0].teamName}</div>
              <div className='text-2xl font-bold'>
                {simulationData.team1Scores.median.toFixed(1)}
              </div>
              <div className='text-xs text-muted-foreground'>
                Range: {simulationData.team1Scores.p10.toFixed(1)} -{' '}
                {simulationData.team1Scores.p90.toFixed(1)}
              </div>
              {/* Inline Box Plot for Team 1 */}
              <div className='mt-2'>
                <ScoreBoxPlot
                  scores={simulationData.team1Scores}
                  maxScale={Math.max(
                    200,
                    simulationData.team1Scores.p90,
                    simulationData.team2Scores.p90
                  )}
                  teamColor='rgb(99, 102, 241)' // Indigo for team 1
                  width={300}
                  height={24}
                />
              </div>
            </div>

            {/* Team 2 */}
            <div className='space-y-2'>
              <div className='text-sm font-medium'>{simulationData.teams[1].teamName}</div>
              <div className='text-2xl font-bold'>
                {simulationData.team2Scores.median.toFixed(1)}
              </div>
              <div className='text-xs text-muted-foreground'>
                Range: {simulationData.team2Scores.p10.toFixed(1)} -{' '}
                {simulationData.team2Scores.p90.toFixed(1)}
              </div>
              {/* Inline Box Plot for Team 2 */}
              <div className='mt-2'>
                <ScoreBoxPlot
                  scores={simulationData.team2Scores}
                  maxScale={Math.max(
                    200,
                    simulationData.team1Scores.p90,
                    simulationData.team2Scores.p90
                  )}
                  teamColor='rgb(16, 185, 129)' // Emerald for team 2
                  width={300}
                  height={24}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Betting Lines */}
        <div className='space-y-4'>
          <h4 className='font-semibold flex items-center gap-2'>
            <DollarSign className='h-4 w-4' />
            Win Margin Calculator
          </h4>

          {/* Spread Slider */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Win Margin</span>
              <Badge variant='outline'>
                {marginSlider[0] === 0
                  ? 'Win Outright'
                  : marginSlider[0] > 0
                    ? `${simulationData.teams[0].teamName} by ${marginSlider[0]}+`
                    : `${simulationData.teams[1].teamName} by ${Math.abs(marginSlider[0])}+`}
              </Badge>
            </div>

            <input
              type='range'
              value={marginSlider[0]}
              onChange={e => setMarginSlider([parseFloat(e.target.value)])}
              min={-21}
              max={21}
              step={0.5}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider'
              aria-label='Point spread margin slider'
            />

            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='text-center'>
                <div className='font-medium'>{simulationData.teams[0].teamName}</div>
                <div className={getWinProbColor(winProbs.team1)}>
                  {(winProbs.team1 * 100).toFixed(1)}%
                </div>
                <div className='text-xs text-muted-foreground'>
                  {formatOdds(
                    winProbs.team1 > 0.5
                      ? -Math.round((winProbs.team1 / (1 - winProbs.team1)) * 100)
                      : Math.round(((1 - winProbs.team1) / winProbs.team1) * 100)
                  )}
                </div>
              </div>
              <div className='text-center'>
                <div className='font-medium'>{simulationData.teams[1].teamName}</div>
                <div className={getWinProbColor(winProbs.team2)}>
                  {(winProbs.team2 * 100).toFixed(1)}%
                </div>
                <div className='text-xs text-muted-foreground'>
                  {formatOdds(
                    winProbs.team2 > 0.5
                      ? -Math.round((winProbs.team2 / (1 - winProbs.team2)) * 100)
                      : Math.round(((1 - winProbs.team2) / winProbs.team2) * 100)
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Over/Under Display (no slider) */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Total Points</span>
              <Badge variant='outline'>O/U {ouDisplay.total}</Badge>
            </div>

            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='text-center p-3 bg-muted/30 rounded-lg'>
                <div className='font-medium flex items-center justify-center gap-1'>
                  <TrendingUp className='h-3 w-3' />
                  Over {ouDisplay.total}
                </div>
                <div className={`text-lg font-semibold ${getWinProbColor(ouDisplay.over)}`}>
                  {(ouDisplay.over * 100).toFixed(1)}%
                </div>
                <div className='text-xs text-muted-foreground'>
                  {formatOdds(
                    ouDisplay.over > 0.5
                      ? -Math.round((ouDisplay.over / (1 - ouDisplay.over)) * 100)
                      : Math.round(((1 - ouDisplay.over) / ouDisplay.over) * 100)
                  )}
                </div>
              </div>
              <div className='text-center p-3 bg-muted/30 rounded-lg'>
                <div className='font-medium flex items-center justify-center gap-1'>
                  <TrendingDown className='h-3 w-3' />
                  Under {ouDisplay.total}
                </div>
                <div className={`text-lg font-semibold ${getWinProbColor(ouDisplay.under)}`}>
                  {(ouDisplay.under * 100).toFixed(1)}%
                </div>
                <div className='text-xs text-muted-foreground'>
                  {formatOdds(
                    ouDisplay.under > 0.5
                      ? -Math.round((ouDisplay.under / (1 - ouDisplay.under)) * 100)
                      : Math.round(((1 - ouDisplay.under) / ouDisplay.under) * 100)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NFL Game Context - Transparency Section */}
        {(simulationData as any).nflGameContext && (
          <div className='pt-4 border-t'>
            <h4 className='font-semibold mb-3 flex items-center gap-2 text-sm'>
              <Clock className='h-4 w-4' />
              NFL Game Progress
              <Badge variant='outline' className='text-xs'>
                {((simulationData as any).nflGameContext.averageGameProgress * 100).toFixed(0)}%
                Complete
              </Badge>
            </h4>

            <div className='space-y-3'>
              {/* Summary Stats */}
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div className='bg-muted/30 p-3 rounded-lg text-center'>
                  <div className='font-medium'>Avg. Minutes Remaining</div>
                  <div className='text-lg font-semibold text-blue-600'>
                    {(simulationData as any).nflGameContext.averageMinutesRemaining.toFixed(1)}m
                  </div>
                </div>
                <div className='bg-muted/30 p-3 rounded-lg text-center'>
                  <div className='font-medium'>NFL Games</div>
                  <div className='text-lg font-semibold text-green-600'>
                    {(simulationData as any).nflGameContext.totalNflGames}
                  </div>
                </div>
              </div>

              {/* Game States */}
              <div className='space-y-2'>
                <div className='text-xs font-medium text-muted-foreground'>Game States:</div>
                <div className='flex flex-wrap gap-2'>
                  {(simulationData as any).nflGameContext.gameStates.map((state: any) => (
                    <Badge
                      key={state.team}
                      variant={
                        state.state === 'post'
                          ? 'destructive'
                          : state.state === 'in'
                            ? 'default'
                            : 'secondary'
                      }
                      className='text-xs'
                    >
                      {state.team}:{' '}
                      {state.state === 'post'
                        ? 'Final'
                        : state.state === 'in'
                          ? state.gameDescription
                          : 'Scheduled'}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div className='text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded border-l-2 border-blue-200'>
                <strong>Minutes-Based Projections:</strong> Player projections are automatically
                adjusted based on actual NFL game time remaining. Completed games = 0 projection
                remaining, live games = proportional to time left.
              </div>
            </div>
          </div>
        )}

        {/* Simulation Stats */}
        <div className='pt-4 border-t'>
          <div className='grid grid-cols-3 gap-4 text-center text-sm'>
            <div>
              <div className='font-medium'>Median Margin</div>
              <div className='text-muted-foreground'>
                {Math.abs(simulationData.medianMargin).toFixed(1)} pts
              </div>
            </div>
            <div>
              <div className='font-medium'>Projected Total</div>
              <div className='text-muted-foreground'>
                {(simulationData.team1Scores.mean + simulationData.team2Scores.mean).toFixed(1)}
              </div>
            </div>
            <div>
              <div className='font-medium'>Method</div>
              <div className='text-muted-foreground'>Minutes-Based</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
