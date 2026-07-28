import * as React from 'react';
import Link from 'next/link';

export type StandingsRow = {
  rank: number;
  team: string;
  record?: string;
  points: number;
};

type Props = {
  title: string;
  /** Small icon/crest rendered before the title. */
  icon?: React.ReactNode;
  /** Slot for a tier/conference badge — bring your own Badge component. */
  badge?: React.ReactNode;
  caption?: string;
  rows: StandingsRow[];
  footer?: { href: string; label: string };
};

export function LegionStandingsCard({ title, icon, badge, caption, rows, footer }: Props) {
  return (
    <div className='rounded-lg border border-border bg-card p-5'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          {icon}
          <span className='text-sm font-semibold uppercase tracking-wide'>{title}</span>
        </div>
        {badge}
      </div>
      {caption && (
        <p className='text-[10px] uppercase tracking-widest text-muted-foreground mb-2'>
          {caption}
        </p>
      )}
      <table className='w-full text-xs tabular-nums'>
        <tbody>
          {rows.map(row => (
            <tr key={row.rank} className='border-t border-border first:border-0'>
              <td className='py-1.5 pr-2 text-muted-foreground w-5'>{row.rank}</td>
              <td className='py-1.5 font-medium'>{row.team}</td>
              {row.record !== undefined && (
                <td className='py-1.5 text-right text-muted-foreground'>{row.record}</td>
              )}
              <td className='py-1.5 pl-3 text-right font-semibold'>{row.points.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {footer && (
        <Link
          href={footer.href}
          className='mt-3 inline-block text-[10px] font-semibold uppercase tracking-widest text-primary hover:underline'
        >
          {footer.label} →
        </Link>
      )}
    </div>
  );
}
