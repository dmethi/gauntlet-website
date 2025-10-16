'use client';

import { memo, ReactNode } from 'react';

interface BracketRoundProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  flowIndicator?: ReactNode;
  align?: 'start' | 'center';
}

export const BracketRound = memo(
  ({ title, subtitle, children, flowIndicator, align = 'center' }: BracketRoundProps) => {
    return (
      <div className="flex flex-col space-y-6">
        <div className={align === 'start' ? 'text-left' : 'text-center'}>
          <h3 className="font-medium text-sm mb-2">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="space-y-8 relative">
          {children}
          {flowIndicator}
        </div>
      </div>
    );
  },
);

BracketRound.displayName = 'BracketRound';
