import { describe, expect, it } from 'vitest';
import { formatStatKey, formatStatValue } from './stats';

describe('formatStatKey', () => {
  it('formats passing stats', () => {
    expect(formatStatKey('pass_yd')).toBe('Pass Yds');
    expect(formatStatKey('pass_td')).toBe('Pass TD');
    expect(formatStatKey('pass_int')).toBe('INT');
  });

  it('formats rushing stats', () => {
    expect(formatStatKey('rush_yd')).toBe('Rush Yds');
    expect(formatStatKey('rush_td')).toBe('Rush TD');
  });

  it('formats receiving stats', () => {
    expect(formatStatKey('rec')).toBe('Rec');
    expect(formatStatKey('rec_yd')).toBe('Rec Yds');
    expect(formatStatKey('rec_td')).toBe('Rec TD');
  });

  it('formats defensive stats', () => {
    expect(formatStatKey('pts_allow')).toBe('PA');
    expect(formatStatKey('sack')).toBe('Sacks');
    expect(formatStatKey('int')).toBe('INT');
    expect(formatStatKey('fum_rec')).toBe('FR');
    expect(formatStatKey('def_td')).toBe('TD');
    expect(formatStatKey('safe')).toBe('Sfty');
  });

  it('formats fumble stats', () => {
    expect(formatStatKey('fum_lost')).toBe('Fum');
  });

  it('returns original key for unknown stats', () => {
    expect(formatStatKey('unknown_stat')).toBe('unknown_stat');
  });
});

describe('formatStatValue', () => {
  it('formats counting stats with no decimals', () => {
    expect(formatStatValue(5.7, 'rec')).toBe('6');
    expect(formatStatValue(3.2, 'pass_td')).toBe('3');
    expect(formatStatValue(2.8, 'rush_td')).toBe('3');
    expect(formatStatValue(1.5, 'rec_td')).toBe('2');
    expect(formatStatValue(2.1, 'int')).toBe('2');
    expect(formatStatValue(4.9, 'sack')).toBe('5');
  });

  it('formats yardage stats with one decimal', () => {
    expect(formatStatValue(245.67, 'pass_yd')).toBe('245.7');
    expect(formatStatValue(89.23, 'rush_yd')).toBe('89.2');
    expect(formatStatValue(156.89, 'rec_yd')).toBe('156.9');
  });

  it('formats other stats with one decimal', () => {
    expect(formatStatValue(28.456, 'pts_allow')).toBe('28.5');
    expect(formatStatValue(1.234, 'fum_lost')).toBe('1.2');
  });

  it('handles zero values', () => {
    expect(formatStatValue(0, 'rec')).toBe('0');
    expect(formatStatValue(0, 'pass_yd')).toBe('0.0');
  });

  it('handles negative values', () => {
    expect(formatStatValue(-5, 'pass_yd')).toBe('-5.0');
  });
});
