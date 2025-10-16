import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ScoreBoxPlotProps } from '@/features/matchups/types';

/**
 * ScoreBoxPlot - Visualizes score distribution as a box plot
 * Displays P10, P25, median, P75, P90, and mean on a scaled axis
 */
export const ScoreBoxPlot = memo<ScoreBoxPlotProps>(props => {
  const { scores, maxScale, teamColor, width = 200, height = 20 } = props;

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
          <div className="relative cursor-help" style={{ width, height }}>
            {/* Background with scale */}
            <div className="w-full h-full bg-muted/20 rounded relative flex items-center">
              {/* Scale markers */}
              <div className="absolute bottom-0 left-0 text-[8px] text-muted-foreground/60">0</div>
              <div className="absolute bottom-0 right-0 text-[8px] text-muted-foreground/60">
                {maxScale.toFixed(0)}
              </div>

              {/* Box plot container centered vertically */}
              <div className="relative w-full h-3">
                {/* Whisker line (P10-P90) */}
                <div
                  className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded"
                  style={{
                    left: `${p10Percent}%`,
                    width: `${p90Percent - p10Percent}%`,
                    backgroundColor: teamColor,
                    opacity: 0.7,
                  }}
                />

                {/* Left whisker cap (P10) */}
                <div
                  className="absolute top-1/2 w-0.5 h-2 -translate-y-1/2"
                  style={{
                    left: `${p10Percent}%`,
                    backgroundColor: teamColor,
                  }}
                />

                {/* Right whisker cap (P90) */}
                <div
                  className="absolute top-1/2 w-0.5 h-2 -translate-y-1/2"
                  style={{
                    left: `${p90Percent}%`,
                    backgroundColor: teamColor,
                  }}
                />

                {/* IQR Box (P25-P75 approximation) */}
                <div
                  className="absolute top-1/2 h-3 -translate-y-1/2 rounded border"
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
                  className="absolute top-1/2 w-0.5 h-3 -translate-y-1/2 rounded"
                  style={{
                    left: `${medianPercent}%`,
                    backgroundColor: teamColor,
                  }}
                />

                {/* Mean marker (diamond) */}
                <div
                  className="absolute top-1/2 w-1 h-1 -translate-y-1/2 -translate-x-1/2 rounded-full border border-white"
                  style={{
                    left: `${meanPercent}%`,
                    backgroundColor: teamColor,
                  }}
                />
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="space-y-1">
            <div>P10: {scores.p10.toFixed(1)} pts</div>
            <div>P90: {scores.p90.toFixed(1)} pts</div>
            <div>Median: {scores.median.toFixed(1)} pts</div>
            <div>Mean: {scores.mean.toFixed(1)} pts</div>
            <div className="text-foreground/70">Scale: 0 - {maxScale.toFixed(0)} pts</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

ScoreBoxPlot.displayName = 'ScoreBoxPlot';
