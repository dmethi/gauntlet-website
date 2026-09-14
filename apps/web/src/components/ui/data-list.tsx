import * as React from 'react';

import { cn } from '@/lib/utils';

const DataList = React.forwardRef<React.ElementRef<'ol'>, React.ComponentPropsWithoutRef<'ol'>>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn('divide-y divide-border/70 border-y border-border/70', className)}
      {...props}
    />
  ),
);
DataList.displayName = 'DataList';

interface DataListItemProps extends React.ComponentPropsWithoutRef<'li'> {
  interactive?: boolean;
}

const DataListItem = React.forwardRef<React.ElementRef<'li'>, DataListItemProps>(
  ({ className, interactive = false, ...props }, ref) => (
    <li
      ref={ref}
      data-interactive={interactive || undefined}
      className={cn(
        'relative py-4 transition-colors duration-150 ease-out data-[interactive=true]:active:bg-muted/50 sm:px-4',
        className,
      )}
      {...props}
    />
  ),
);
DataListItem.displayName = 'DataListItem';

const DataListHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex min-w-0 items-start justify-between gap-3', className)}
      {...props}
    />
  ),
);
DataListHeader.displayName = 'DataListHeader';

const DataListTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('min-w-0 font-semibold leading-tight', className)} {...props} />
  ),
);
DataListTitle.displayName = 'DataListTitle';

const DataListDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-1 text-xs leading-relaxed text-muted-foreground', className)}
      {...props}
    />
  ),
);
DataListDescription.displayName = 'DataListDescription';

const DataListMetrics = React.forwardRef<
  React.ElementRef<'dl'>,
  React.ComponentPropsWithoutRef<'dl'>
>(({ className, ...props }, ref) => (
  <dl ref={ref} className={cn('mt-3 grid grid-cols-3 gap-x-4 gap-y-3', className)} {...props} />
));
DataListMetrics.displayName = 'DataListMetrics';

const DataListMetric = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('min-w-0', className)} {...props} />
  ),
);
DataListMetric.displayName = 'DataListMetric';

const DataListMetricLabel = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <dt
      ref={ref}
      className={cn(
        'text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground',
        className,
      )}
      {...props}
    />
  ),
);
DataListMetricLabel.displayName = 'DataListMetricLabel';

const DataListMetricValue = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <dd
      ref={ref}
      className={cn('mt-0.5 text-sm font-semibold tabular-nums', className)}
      {...props}
    />
  ),
);
DataListMetricValue.displayName = 'DataListMetricValue';

export {
  DataList,
  DataListItem,
  DataListHeader,
  DataListTitle,
  DataListDescription,
  DataListMetrics,
  DataListMetric,
  DataListMetricLabel,
  DataListMetricValue,
};
