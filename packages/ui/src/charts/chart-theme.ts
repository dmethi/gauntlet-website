import { dataVizColors } from '../../../../brand/colors';

export type ChartTheme = {
  colors: string[];
  grid: { stroke: string; opacity?: number };
  axis: { tickColor: string; labelColor: string };
  tooltip: { bg: string; fg: string; border: string };
};

export const chartTheme: ChartTheme = {
  colors: dataVizColors.categorical,
  grid: { stroke: 'hsl(var(--muted))', opacity: 0.5 },
  axis: { tickColor: 'hsl(var(--muted-foreground))', labelColor: 'hsl(var(--muted-foreground))' },
  tooltip: {
    bg: 'hsl(var(--card))',
    fg: 'hsl(var(--card-foreground))',
    border: 'hsl(var(--border))',
  },
};
