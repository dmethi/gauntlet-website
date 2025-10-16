import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap } from 'lucide-react';

export interface LoadingStateProps {
  readonly className?: string;
}

/**
 * Loading skeleton display for matchup odds
 *
 * @example
 * ```tsx
 * <LoadingState className="p-4" />
 * ```
 */
export const LoadingState = memo<LoadingStateProps>(props => {
  const { className = '' } = props;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Zap className="h-3 w-3" />
        Loading odds...
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
});

LoadingState.displayName = 'LoadingState';
