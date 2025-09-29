import { RDYLGN } from '../constants/RDYLGN';
import { mixHex } from './mixHex';

export const getDivergingBg = (normalized: number) => {
  const t = Math.max(-1, Math.min(1, normalized));
  const u = (t + 1) / 2;
  const n = RDYLGN.length - 1;
  const idx = Math.max(0, Math.min(n - 1, Math.floor(u * n)));
  const frac = u * n - idx;
  const from = RDYLGN[idx];
  const to = RDYLGN[idx + 1] ?? RDYLGN[idx];
  return mixHex(from, to, frac);
};
