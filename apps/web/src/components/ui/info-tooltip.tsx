'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InfoTooltipProps {
  title: string;
  description: string;
  interpretation?: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  description,
  interpretation,
  className = '',
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info
            className={`h-4 w-4 text-muted-foreground hover:text-foreground cursor-help ${className}`}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm p-4 bg-background text-foreground border">
          <div className="space-y-2">
            <div className="font-semibold text-sm text-foreground">{title}</div>
            <div className="text-xs text-foreground/80">{description}</div>
            {interpretation && (
              <div className="text-xs border-t pt-2 font-medium border-border">
                <span className="text-foreground/60">Interpretation: </span>
                <span className="text-foreground">{interpretation}</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
