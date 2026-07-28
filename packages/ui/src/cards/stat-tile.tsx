import * as React from 'react';
import type { NavIcon } from '../nav/types';

type Props = {
  label: string;
  value: string;
  icon: NavIcon;
  loading?: boolean;
};

export function StatTile({ label, value, icon: Icon, loading }: Props) {
  if (loading) {
    return (
      <div className='rounded-lg border border-border bg-card p-4 h-20 bg-muted/40 animate-pulse' />
    );
  }
  return (
    <div className='rounded-lg border border-border bg-card p-4'>
      <Icon className='w-4 h-4 text-primary mb-2' strokeWidth={1.5} />
      <p className='font-geizer text-xl tracking-wide tabular-nums'>{value}</p>
      <p className='text-[10px] uppercase tracking-widest text-muted-foreground mt-1'>{label}</p>
    </div>
  );
}
