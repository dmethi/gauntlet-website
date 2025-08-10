import * as React from 'react';

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div
      className='bg-muted/20 border border-border rounded-md w-full animate-pulse'
      style={{ height }}
    />
  );
}
