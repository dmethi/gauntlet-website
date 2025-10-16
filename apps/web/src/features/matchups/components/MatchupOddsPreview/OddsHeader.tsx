import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

export interface OddsHeaderProps {
  readonly iterationCount?: number;
}

/**
 * Header section showing live odds indicator and simulation count
 *
 * @example
 * ```tsx
 * <OddsHeader iterationCount={10000} />
 * ```
 */
export const OddsHeader = memo<OddsHeaderProps>(props => {
  const { iterationCount = 10000 } = props;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Zap className="h-3 w-3" />
        Live Odds
      </div>
      <Badge variant="outline" className="text-xs px-1 py-0">
        {iterationCount >= 1000 ? `${iterationCount / 1000}k` : iterationCount} sims
      </Badge>
    </div>
  );
});

OddsHeader.displayName = 'OddsHeader';
