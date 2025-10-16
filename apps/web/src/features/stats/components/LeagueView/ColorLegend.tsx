'use client';

import { memo } from 'react';
import { colors } from '../../../../../../../brand/colors';

export const ColorLegend = memo(() => {
  return (
    <div className="mt-4 p-3 bg-muted/20 rounded-md text-xs">
      <h4 className="font-semibold mb-2">Position Color Guide</h4>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-muted-foreground">
        <div className="flex items-center">
          <span
            className="inline-block w-4 h-4 rounded mr-2"
            style={{ backgroundColor: colors.rdylgn[9] }}
          ></span>
          <strong>Top 10%</strong>
        </div>
        <div className="flex items-center">
          <span
            className="inline-block w-4 h-4 rounded mr-2"
            style={{ backgroundColor: colors.rdylgn[8] }}
          ></span>
          <strong>Top 25%</strong>
        </div>
        <div className="flex items-center">
          <span
            className="inline-block w-4 h-4 rounded mr-2"
            style={{ backgroundColor: colors.rdylgn[7] }}
          ></span>
          <strong>Top 50%</strong>
        </div>
        <div className="flex items-center">
          <span
            className="inline-block w-4 h-4 rounded mr-2"
            style={{ backgroundColor: colors.rdylgn[5] }}
          ></span>
          <strong>Middle</strong>
        </div>
        <div className="flex items-center">
          <span
            className="inline-block w-4 h-4 rounded mr-2"
            style={{ backgroundColor: colors.rdylgn[3] }}
          ></span>
          <strong>Bottom 25%</strong>
        </div>
        <div className="flex items-center">
          <span
            className="inline-block w-4 h-4 rounded mr-2"
            style={{ backgroundColor: colors.rdylgn[1] }}
          ></span>
          <strong>Bottom 10%</strong>
        </div>
      </div>
    </div>
  );
});

ColorLegend.displayName = 'ColorLegend';
