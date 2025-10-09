import { describe, expect, it } from 'vitest';
import { hexToRgb, mixHex } from './helpers';

describe('hexToRgb', () => {
  it('should convert red hex to RGB', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should convert green hex to RGB', () => {
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('should convert blue hex to RGB', () => {
    expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('should convert white hex to RGB', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('should convert black hex to RGB', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('should handle lowercase hex values', () => {
    expect(hexToRgb('#abc123')).toEqual({ r: 171, g: 193, b: 35 });
  });
});

describe('mixHex', () => {
  it('should return first color when t=0', () => {
    const result = mixHex('#ff0000', '#0000ff', 0);
    expect(result).toBe('#ff0000');
  });

  it('should return second color when t=1', () => {
    const result = mixHex('#ff0000', '#0000ff', 1);
    expect(result).toBe('#0000ff');
  });

  it('should mix red and blue to purple at t=0.5', () => {
    const result = mixHex('#ff0000', '#0000ff', 0.5);
    expect(result).toBe('#800080'); // 255*0.5 = 127.5 rounds to 128 (0x80)
  });

  it('should mix white and black to gray at t=0.5', () => {
    const result = mixHex('#ffffff', '#000000', 0.5);
    expect(result).toBe('#808080'); // 255*0.5 = 127.5 rounds to 128 (0x80)
  });

  it('should handle fractional interpolation', () => {
    const result = mixHex('#ff0000', '#00ff00', 0.25);
    // 25% of the way from red to green: r=191, g=64, b=0
    expect(result).toBe('#bf4000');
  });

  it('should pad hex values with leading zeros', () => {
    const result = mixHex('#010101', '#000000', 0.5);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
});
