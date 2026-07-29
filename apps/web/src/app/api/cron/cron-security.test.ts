import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const runLiveSnapshot = vi.fn(async () => ({
  duration: 1,
  savedCount: 1,
  skippedCount: 0,
  failedCount: 0,
  totalProcessed: 1,
}));
const runRecapGeneration = vi.fn(async () => ({
  week: 1,
  season: 2026,
  status: 'completed',
  saved: true,
  errors: [],
}));

vi.mock('./live-odds/snapshot-runner', () => ({ runLiveSnapshot }));
vi.mock('./recap-report/runner', () => ({ runRecapGeneration }));

const request = (path: string, token?: string): NextRequest =>
  new NextRequest(`https://gauntlet.test${path}`, {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });

describe.each([
  {
    name: 'live odds',
    path: '/api/cron/live-odds',
    load: () => import('./live-odds/route'),
    runner: runLiveSnapshot,
  },
  {
    name: 'recap report',
    path: '/api/cron/recap-report',
    load: () => import('./recap-report/route'),
    runner: runRecapGeneration,
  },
])('$name cron command', ({ path, load, runner }) => {
  beforeEach(() => {
    vi.resetModules();
    process.env.CRON_SECRET = 'a-secure-cron-secret';
    runner.mockClear();
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it('fails closed when CRON_SECRET is absent', async () => {
    delete process.env.CRON_SECRET;
    const route = await load();

    const response = await route.POST(request(path));

    expect(response.status).toBe(503);
    expect(runner).not.toHaveBeenCalled();
  });

  it('rejects missing and invalid bearer credentials', async () => {
    const route = await load();

    expect((await route.POST(request(path))).status).toBe(401);
    expect((await route.POST(request(path, 'wrong-secret'))).status).toBe(401);
    expect(runner).not.toHaveBeenCalled();
  });

  it('does not export a state-changing GET handler', async () => {
    const route = await load();

    expect('GET' in route).toBe(false);
  });

  it('rejects an immediate replay without re-running the command', async () => {
    const route = await load();

    expect((await route.POST(request(path, 'a-secure-cron-secret'))).status).toBe(200);
    const replay = await route.POST(request(path, 'a-secure-cron-secret'));
    expect(replay.status).toBe(429);
    expect(Number(replay.headers.get('retry-after'))).toBeGreaterThanOrEqual(120);
    expect(runner).toHaveBeenCalledTimes(1);
  });
});

describe('recap response sanitization', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.CRON_SECRET = 'a-secure-cron-secret';
    runRecapGeneration.mockClear();
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it('does not expose runner error details', async () => {
    runRecapGeneration.mockResolvedValueOnce({
      week: 1,
      season: 2026,
      status: 'failed',
      saved: false,
      errors: ['provider response contained a private detail'],
    });
    const { POST } = await import('./recap-report/route');

    const response = await POST(request('/api/cron/recap-report', 'a-secure-cron-secret'));
    const body: unknown = await response.json();

    expect(body).toEqual({
      success: true,
      week: 1,
      season: 2026,
      status: 'failed',
      saved: false,
      duration: expect.any(Number),
      triggeredAt: expect.any(String),
    });
  });
});
