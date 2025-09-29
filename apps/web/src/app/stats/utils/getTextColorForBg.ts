import { hexToRgb } from './hexToRgb';

export const getTextColorForBg = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return L > 0.5 ? '#111827' : '#ffffff';
};
