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
    expect((await route.POST(request(path, 'a-secure-cron-secret'))).status).toBe(429);
    expect(runner).toHaveBeenCalledTimes(1);
  });
});
