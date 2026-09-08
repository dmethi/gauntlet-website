import { describe, expect, it } from 'vitest';
import { NAV_ITEMS } from './site-navigation';

describe('site navigation', () => {
  it('promotes the reports hub instead of a single draft report', () => {
    expect(NAV_ITEMS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Reports', href: '/competition/reports' }),
      ]),
    );
    expect(NAV_ITEMS).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ label: 'Draft Analysis' })]),
    );
  });
});
