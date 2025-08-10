import * as React from 'react';

type LegendItem = { label: string; color: string };

export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
      {items.map(item => (
        <div key={item.label} className='flex items-center gap-2'>
          <span className='inline-block w-3 h-3 rounded-sm' style={{ background: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
