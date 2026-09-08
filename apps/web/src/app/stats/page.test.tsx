import { describe, expect, it } from 'vitest';
import StatsPage from './page';

describe('StatsPage', () => {
  it('renders the live 2026 stats experience by default', async () => {
    const page = await StatsPage({ searchParams: Promise.resolve({}) });

    expect(page.props.season).toBe('2026');
    expect(page.props.searchParams).toEqual({});
  });
});
