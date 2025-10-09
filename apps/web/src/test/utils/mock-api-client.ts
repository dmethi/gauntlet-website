import { vi } from 'vitest';

/**
 * Mock API client for testing
 *
 * @example
 * ```typescript
 * import { createMockAPIClient } from '@/test/utils';
 *
 * it('fetches league data', async () => {
 *   const mockClient = createMockAPIClient({
 *     fetchLeague: vi.fn().mockResolvedValue({ id: '123', name: 'Test League' }),
 *   });
 *
 *   const result = await mockClient.fetchLeague('123');
 *   expect(result.name).toBe('Test League');
 * });
 * ```
 */
export const createMockAPIClient = (
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  fetchLeague: vi.fn(),
  fetchRosters: vi.fn(),
  fetchMatchups: vi.fn(),
  fetchPlayers: vi.fn(),
  fetchNFLState: vi.fn(),
  ...overrides,
});

/**
 * Mock fetch function with custom responses
 *
 * @example
 * ```typescript
 * import { mockFetch } from '@/test/utils';
 *
 * it('handles API responses', async () => {
 *   mockFetch({
 *     '/api/league/123': { id: '123', name: 'Test League' },
 *     '*': { error: 'Not found' }, // Default response
 *   });
 *
 *   const response = await fetch('/api/league/123');
 *   const data = await response.json();
 *   expect(data.name).toBe('Test League');
 * });
 * ```
 */
export const mockFetch = (responses: Record<string, unknown>): void => {
  global.fetch = vi.fn((input: string | URL | Request) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;
    const response = responses[url] || responses['*'];

    return Promise.resolve({
      ok: true,
      json: async (): Promise<unknown> => response,
      text: async (): Promise<string> => JSON.stringify(response),
      status: 200,
      statusText: 'OK',
    } as unknown as Response);
  }) as typeof fetch;
};
