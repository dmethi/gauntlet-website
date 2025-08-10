import * as React from 'react';

type Props = {
  children: React.ReactNode;
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  className?: string;
};

function gapClass(gap: NonNullable<Props['gap']>) {
  const map: Record<NonNullable<Props['gap']>, string> = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    7: 'gap-7',
    8: 'gap-8',
  };
  return map[gap];
}

export function Stack({ children, gap = 4, className = '' }: Props) {
  return <div className={`flex flex-col ${gapClass(gap)} ${className}`}>{children}</div>;
}

export function Inline({ children, gap = 4, className = '' }: Props) {
  return <div className={`flex items-center ${gapClass(gap)} ${className}`}>{children}</div>;
}
