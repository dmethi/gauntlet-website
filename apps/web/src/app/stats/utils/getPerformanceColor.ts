import { colors } from '../../../../../../brand/colors';

export function getPerformanceColor(value: number, isPositive: boolean): string {
  if (value === 0) return colors.rdylgn[5]; // neutral
  return isPositive ? colors.rdylgn[8] : colors.rdylgn[2]; // green or red
}
