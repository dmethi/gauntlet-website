import { describe, expect, it, vi } from 'vitest';
import { fetchPlayerLoader } from './useWaiverAnalytics';

describe('fetchPlayerLoader', () => {
  it('loads only the requested players from the batch endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        players: {
          player1: { full_name: 'Player One', position: 'RB' },
          player2: { full_name: 'Player Two', position: 'WR' },
        },
      }),
    });

    const loader = await fetchPlayerLoader(new Set(['player1', 'player2']));

    expect(global.fetch).toHaveBeenCalledWith('/api/players/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerIds: ['player1', 'player2'] }),
    });
    expect(loader('player1')).toEqual({
      playerId: 'player1',
      playerName: 'Player One',
      position: 'RB',
    });
    expect(loader('missing')).toBeNull();
  });

  it('throws rather than silently dropping waiver transactions when the lookup fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });

    await expect(fetchPlayerLoader(new Set(['player1']))).rejects.toThrow(
      'Player batch lookup failed with HTTP 503',
    );
  });

  it('throws rather than silently dropping a requested player omitted by the batch response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ players: {} }),
    });

    await expect(fetchPlayerLoader(new Set(['player1']))).rejects.toThrow(
      'Player batch lookup returned incomplete or malformed player data',
    );
  });
});
