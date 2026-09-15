import * as React from 'react';

import { cn } from '@/lib/utils';

interface TableViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: 'plain' | 'responsive';
  scrollLabel?: string;
}

const TableViewport = React.forwardRef<HTMLDivElement, TableViewportProps>(
  ({ className, surface = 'plain', scrollLabel, ...props }, ref) => (
    <div
      ref={ref}
      role={scrollLabel ? 'region' : undefined}
      aria-label={scrollLabel}
      tabIndex={scrollLabel ? 0 : undefined}
      className={cn(
        'relative w-full overflow-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        surface === 'responsive' &&
          'border-y border-border/70 bg-transparent sm:rounded-md sm:border sm:bg-card',
        className,
      )}
      {...props}
    />
  ),
);
TableViewport.displayName = 'TableViewport';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
  surface?: TableViewportProps['surface'];
  scrollLabel?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, surface, scrollLabel, ...props }, ref) => (
    <TableViewport className={containerClassName} surface={surface} scrollLabel={scrollLabel}>
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm tabular-nums', className)}
        {...props}
      />
    </TableViewport>
  ),
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-10 whitespace-nowrap px-2 text-left align-middle text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground sm:px-3 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'px-2 py-2 align-middle sm:px-3 sm:py-2.5 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableViewport,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
