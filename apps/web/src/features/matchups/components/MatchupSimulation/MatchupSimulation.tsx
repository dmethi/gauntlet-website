'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Info, RefreshCw, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SimulationData } from '@/features/matchups/types';
import { SimulationSummary } from './SimulationSummary';
import { ScoreRangesDisplay } from './ScoreRangesDisplay';
import { WinMarginCalculator } from './WinMarginCalculator';
import { OverUnderDisplay } from './OverUnderDisplay';
import { NFLGameContext } from './NFLGameContext';
import { SimulationStats } from './SimulationStats';

interface MatchupSimulationProps {
  leagueId: string;
  week: number;
  matchupId: number;
  className?: string;
}

/**
 * MatchupSimulation - Main component for displaying Monte Carlo simulation results
 * Shows win probabilities, score distributions, betting lines, and interactive calculators
 */
export const MatchupSimulation = ({
  leagueId,
  week,
  matchupId,
  className = '',
}: MatchupSimulationProps) => {
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

      // Initialize slider with simulation data
      if (data.simulation.impliedOdds) {
        setMarginSlider([data.simulation.impliedOdds.spread || 0]);
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

  // Loading state
  if (loading && !simulationData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-geizer tracking-wide">
            <Zap className="h-5 w-5" />
            Monte Carlo Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-geizer tracking-wide text-red-600">
            <AlertCircle className="h-5 w-5" />
            Simulation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchSimulation()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!simulationData) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-geizer tracking-wide">
            <Zap className="h-5 w-5 text-yellow-500" />
            Monte Carlo Simulation
            <Badge variant="outline" className="ml-2">
              20,000 sims
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              onClick={() => fetchSimulation(false)}
              variant="ghost"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Win Probabilities */}
        <SimulationSummary simulationData={simulationData} />

        {/* Score Projections */}
        <ScoreRangesDisplay simulationData={simulationData} />

        {/* Interactive Betting Lines */}
        <div className="space-y-4">
          <WinMarginCalculator
            simulationData={simulationData}
            marginSlider={marginSlider}
            onMarginChange={setMarginSlider}
          />

          {/* Over/Under Display */}
          <OverUnderDisplay simulationData={simulationData} />
        </div>

        {/* NFL Game Context */}
        <NFLGameContext simulationData={simulationData} />

        {/* Simulation Stats */}
        <SimulationStats simulationData={simulationData} />
      </CardContent>
    </Card>
  );
};
