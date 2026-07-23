import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStatsClient } from './unified-client';

// A hand-authored fixture — this test exercises the read/parse mechanism,
// not real Sleeper data shape, so hand-authoring it is fine (unlike
// SLEEPER_FIXTURES dev-replay fixtures, which must come from the real API
// via apps/web/src/scripts/capture-sleeper-fixtures.ts).
const CAPTURED_FIXTURE_LEAGUE_ID = '1234567890123456789';

describe('UnifiedSleeperClient ID validation', () => {
  it('rejects a non-numeric league ID', async () => {
    const client = createStatsClient();
    await expect(client.fetchLeague('not-a-number')).rejects.toThrow(/Invalid Sleeper league ID/);
  });

  it('rejects a non-numeric draft ID', async () => {
    const client = createStatsClient();
    await expect(client.fetchDraft('not-a-number')).rejects.toThrow(/Invalid Sleeper draft ID/);
  });

  it('accepts a numeric-string league ID and proceeds to fetch', async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ league_id: '123' }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = createStatsClient();
    await client.fetchLeague('123');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});

describe('SLEEPER_FIXTURES replay', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('reads a captured fixture instead of calling fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('SLEEPER_FIXTURES', '1');

    const client = createStatsClient();
    const league = await client.fetchLeague(CAPTURED_FIXTURE_LEAGUE_ID);

    expect(league.league_id).toBe(CAPTURED_FIXTURE_LEAGUE_ID);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws a clear error for a league with no captured fixture', async () => {
    vi.stubEnv('SLEEPER_FIXTURES', '1');
    const client = createStatsClient();
    await expect(client.fetchLeague('9999999999999999999')).rejects.toThrow(/No fixture recorded/);
  });

  it('does not enable fixture mode for non-"1" truthy-looking values', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ league_id: CAPTURED_FIXTURE_LEAGUE_ID }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('SLEEPER_FIXTURES', 'false');

    const client = createStatsClient();
    await client.fetchLeague(CAPTURED_FIXTURE_LEAGUE_ID);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refuses to replay fixtures when VERCEL is set (Preview/Production)', async () => {
    vi.stubEnv('SLEEPER_FIXTURES', '1');
    vi.stubEnv('VERCEL', '1');
    const client = createStatsClient();
    await expect(client.fetchLeague(CAPTURED_FIXTURE_LEAGUE_ID)).rejects.toThrow(/local-dev-only/);
  });
});
