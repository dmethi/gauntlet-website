import React from 'react';
import { badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function VolatilityBadge({ label }: { label: 'Chalk' | 'Balanced' | 'Chaos' }) {
  const variant =
    label === 'Chaos' ? 'destructive' : label === 'Balanced' ? 'secondary' : 'default';
  const extra = label === 'Chaos' ? 'text-white' : '';
  const emoji = label === 'Chaos' ? '🔥' : label === 'Balanced' ? '⚖️' : '✅';
  return (
    <span className={cn(badgeVariants({ variant }), 'text-xxs font-geizer tracking-wide', extra)}>
      {emoji} {label}
    </span>
  );
}

export function DerbyBadge({ text }: { text: string }) {
  return (
    <span
      className={cn(badgeVariants({ variant: 'secondary' }), 'text-xxs font-geizer tracking-wide')}
    >
      🏁 {text}
    </span>
  );
}

type TipProps = { text: string; title?: string };

export function FineTag({ text, title = 'Scribe Fine' }: TipProps) {
  return (
    <span
      className={cn(badgeVariants({ variant: 'default' }), 'text-xxs font-geizer tracking-wide')}
      title={text}
    >
      🧾 {title}
    </span>
  );
}

export function CurseTag({ text, title = 'Gauntlet Curse' }: TipProps) {
  return (
    <span
      className={cn(badgeVariants({ variant: 'secondary' }), 'text-xxs font-geizer tracking-wide')}
      title={text}
    >
      🔮 {title}
    </span>
  );
}
