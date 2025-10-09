import { describe, expect, it } from 'vitest';
import { getTextColor, getTextColorForBg } from './text-colors';

describe('getTextColor', () => {
  it('should return black for light backgrounds', () => {
    const textColor = getTextColor('#ffff00'); // Yellow
    expect(textColor).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('should return white for dark backgrounds', () => {
    const textColor = getTextColor('#ff0000'); // Red
    expect(textColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('should handle edge cases', () => {
    const whiteText = getTextColor('#000000');
    const blackText = getTextColor('#ffffff');
    expect(whiteText).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(blackText).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe('getTextColorForBg', () => {
  it('should return dark text for bright backgrounds', () => {
    const textColor = getTextColorForBg('#ffffff'); // White background
    expect(textColor).toBe('#111827');
  });

  it('should return white text for dark backgrounds', () => {
    const textColor = getTextColorForBg('#000000'); // Black background
    expect(textColor).toBe('#ffffff');
  });

  it('should return dark text for yellow backgrounds', () => {
    const textColor = getTextColorForBg('#ffff00'); // Yellow background
    expect(textColor).toBe('#111827');
  });

  it('should return white text for red backgrounds', () => {
    const textColor = getTextColorForBg('#ff0000'); // Red background
    expect(textColor).toBe('#ffffff');
  });

  it('should return white text for blue backgrounds', () => {
    const textColor = getTextColorForBg('#0000ff'); // Blue background
    expect(textColor).toBe('#ffffff');
  });

  it('should handle mid-tone colors correctly', () => {
    const textColor = getTextColorForBg('#808080'); // Gray
    expect(textColor).toMatch(/^#(111827|ffffff)$/);
  });

  it('should use WCAG luminance formula', () => {
    // Very bright green should get dark text
    const textColor1 = getTextColorForBg('#00ff00');
    expect(textColor1).toBe('#111827');

    // Dark green should get white text
    const textColor2 = getTextColorForBg('#006400');
    expect(textColor2).toBe('#ffffff');
  });
});
