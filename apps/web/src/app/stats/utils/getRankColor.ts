import { colors } from '../../../../../../brand/colors';

export function getRankColor(rank: number, total: number): string {
  const percentile = (total - rank + 1) / total;
  if (percentile >= 0.9) return colors.rdylgn[9]; // top 10% - dark green
  if (percentile >= 0.75) return colors.rdylgn[8]; // top 25% - green
  if (percentile >= 0.5) return colors.rdylgn[7]; // top 50% - light green
  if (percentile >= 0.25) return colors.rdylgn[5]; // middle 50% - yellow
  if (percentile >= 0.1) return colors.rdylgn[3]; // bottom 25% - orange
  return colors.rdylgn[1]; // bottom 10% - red
}
