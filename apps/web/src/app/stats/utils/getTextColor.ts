import { colors } from '../../../../../../brand/colors';

export function getTextColor(backgroundColor: string): string {
  // Determine if text should be white or black based on background brightness
  // For yellow/orange colors, use black text. For green/red, use white text.
  const lightColors = [colors.rdylgn[3], colors.rdylgn[4], colors.rdylgn[5], colors.rdylgn[6]]; // orange and yellow range
  return lightColors.includes(backgroundColor) ? '#000000' : '#ffffff';
}
