import React from 'react';

type CalloutProps = {
  by?: 'Editor' | 'Scribe' | 'Commissioner';
  tone?: 'info' | 'warn' | 'spice';
  title?: string;
  compact?: boolean;
  children: React.ReactNode;
  className?: string;
};

const toneStyles: Record<NonNullable<CalloutProps['tone']>, string> = {
  info: 'border-blue-500/30 bg-blue-500/10',
  warn: 'border-yellow-500/30 bg-yellow-500/10',
  spice: 'border-red-500/30 bg-red-500/10',
};

export function Callout({
  by = 'Editor',
  tone = 'info',
  title,
  compact,
  children,
  className,
}: CalloutProps) {
  const defaultTitle =
    by === 'Editor' ? '✍️ Editor’s Note' : by === 'Scribe' ? '🪶 Scribe’s Note' : '⚖️ Commish Note';
  const heading = title || defaultTitle;
  const size = compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm';
  return (
    <aside className={`rounded-md border ${size} ${toneStyles[tone]} ${className || ''}`}>
      <div className="mb-1 font-semibold opacity-80">{heading}</div>
      <div className="leading-relaxed">{children}</div>
    </aside>
  );
}
