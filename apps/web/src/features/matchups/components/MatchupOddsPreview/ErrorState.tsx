import { memo } from 'react';
import { AlertCircle } from 'lucide-react';

export interface ErrorStateProps {
  readonly className?: string;
}

/**
 * Error state display for matchup odds
 *
 * @example
 * ```tsx
 * <ErrorState className="p-4" />
 * ```
 */
export const ErrorState = memo<ErrorStateProps>(props => {
  const { className = '' } = props;

  return (
    <div className={`text-xs text-muted-foreground ${className}`}>
      <div className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Odds unavailable
      </div>
    </div>
  );
});

ErrorState.displayName = 'ErrorState';
