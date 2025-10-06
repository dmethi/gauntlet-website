import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithRetry, retryAsync } from '@/lib';

global.fetch = vi.fn();

describe('retry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchWithRetry', () => {
    it('should succeed on first attempt', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const response = await fetchWithRetry('https://api.example.com');
      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 500 error', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const response = await fetchWithRetry('https://api.example.com', {
        maxRetries: 2,
        initialDelayMs: 10,
      });

      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 404 error', async () => {
      (global.fetch as any).mockResolvedValueOnce({ ok: false, status: 404 });

      const response = await fetchWithRetry('https://api.example.com');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should exhaust retries and return last response', async () => {
      (global.fetch as any).mockResolvedValue({ ok: false, status: 500 });

      const response = await fetchWithRetry('https://api.example.com', {
        maxRetries: 2,
        initialDelayMs: 10,
      });

      expect(response.ok).toBe(false);
      expect(global.fetch).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should retry on 502 error', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 502 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const response = await fetchWithRetry('https://api.example.com', {
        maxRetries: 2,
        initialDelayMs: 10,
      });

      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on 503 error', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 503 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const response = await fetchWithRetry('https://api.example.com', {
        maxRetries: 2,
        initialDelayMs: 10,
      });

      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on network error', async () => {
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const response = await fetchWithRetry('https://api.example.com', {
        maxRetries: 2,
        initialDelayMs: 10,
      });

      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw on exhausted network retries', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      await expect(
        fetchWithRetry('https://api.example.com', {
          maxRetries: 2,
          initialDelayMs: 10,
        })
      ).rejects.toThrow('Network error');

      expect(global.fetch).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });

  describe('retryAsync', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValueOnce('success');

      const result = await retryAsync(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on error', async () => {
      const fn = vi.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce('success');

      const result = await retryAsync(fn, {
        maxRetries: 2,
        initialDelayMs: 10,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should exhaust retries and throw', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      await expect(
        retryAsync(fn, {
          maxRetries: 2,
          initialDelayMs: 10,
        })
      ).rejects.toThrow('fail');

      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should handle multiple retries before success', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValueOnce('success');

      const result = await retryAsync(fn, {
        maxRetries: 3,
        initialDelayMs: 10,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });
});
