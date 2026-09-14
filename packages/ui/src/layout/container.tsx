import * as React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Remove this container's mobile gutter when an app shell already provides one. */
  flushOnMobile?: boolean;
};

export function Container({ children, className = '', flushOnMobile = false }: Props) {
  const gutter = flushOnMobile ? 'px-0 md:px-4' : 'px-4';
  return <div className={`container mx-auto ${gutter} ${className}`}>{children}</div>;
}
