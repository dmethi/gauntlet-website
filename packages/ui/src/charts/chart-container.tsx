import * as React from 'react';

type Props = {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  height?: number | string;
  empty?: boolean;
};

export function ChartContainer({
  title,
  description,
  actions,
  children,
  height = 384,
  empty,
}: Props) {
  return (
    <div className='bg-card border border-border rounded-lg'>
      {(title || description || actions) && (
        <div className='flex items-center justify-between p-4 border-b border-border'>
          <div>
            {title && <h3 className='text-sm font-semibold text-card-foreground'>{title}</h3>}
            {description && <p className='text-xs text-muted-foreground mt-1'>{description}</p>}
          </div>
          {actions && <div className='ml-4'>{actions}</div>}
        </div>
      )}
      <div className='p-4' style={{ height }}>
        {empty ? (
          <div className='h-full flex items-center justify-center text-muted-foreground text-sm'>
            No data available
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
