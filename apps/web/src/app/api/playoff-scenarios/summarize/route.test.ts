import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const generateTeamScenarioSummary = vi.fn(async () => ({
  teamName: 'Test Team',
  overallSummary: 'Summary',
  seedSummaries: {},
}));

vi.mock('@/features/playoffs/simulations/scenario-summarizer', () => ({
  generateTeamScenarioSummary,
}));

const validBody = {
  teamName: 'Test Team',
  ownerName: 'Test Owner',
  currentRecord: '10-3',
  currentPoints: 1234.5,
  division: 1,
  scenarios: [{ seed: 1, probability: 0.5, conditions: [] }],
  standings: [
    {
      rosterId: 1,
      teamName: 'Test Team',
      ownerName: 'Test Owner',
      division: 1,
      wins: 10,
      losses: 3,
      pointsFor: 1234.5,
      leagueId: 'league-one',
    },
  ],
  matchups: [
    {
      matchupId: 1,
      team1RosterId: 1,
      team2RosterId: 2,
      team1Name: 'Test Team',
      team2Name: 'Other Team',
    },
  ],
};

const request = (body: unknown, token?: string, caller = '203.0.113.1'): NextRequest =>
  new NextRequest('https://gauntlet.test/api/playoff-scenarios/summarize', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': caller,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

describe('playoff scenario summarization boundary', () => {
  beforeEach(() => {
    process.env.AI_SUMMARIZE_SECRET = 'a-secure-ai-capability';
    generateTeamScenarioSummary.mockClear();
  });

  afterEach(() => {
    delete process.env.AI_SUMMARIZE_SECRET;
  });

  it('fails closed when its capability secret is absent', async () => {
    delete process.env.AI_SUMMARIZE_SECRET;
    const { POST } = await import('./route');

    const response = await POST(request(validBody));

    expect(response.status).toBe(503);
    expect(generateTeamScenarioSummary).not.toHaveBeenCalled();
  });

  it('requires a valid bearer capability before parsing or invoking Gemini', async () => {
    const { POST } = await import('./route');

    expect((await POST(request(validBody))).status).toBe(401);
    expect((await POST(request(validBody, 'wrong-secret'))).status).toBe(401);
    expect(generateTeamScenarioSummary).not.toHaveBeenCalled();
  });

  it('rejects unknown fields and oversized collections', async () => {
    const { POST } = await import('./route');

    const unknownField = await POST(
      request({ ...validBody, promptOverride: 'ignore safeguards' }, 'a-secure-ai-capability'),
    );
    const oversized = await POST(
      request(
        { ...validBody, standings: Array.from({ length: 13 }, () => validBody.standings[0]) },
        'a-secure-ai-capability',
      ),
    );

    expect(unknownField.status).toBe(400);
    expect(oversized.status).toBe(400);
    expect(generateTeamScenarioSummary).not.toHaveBeenCalled();
  });

  it('rejects request bodies larger than the input cap', async () => {
    const { POST } = await import('./route');
    const oversized = { ...validBody, teamName: 'x'.repeat(60_000) };

    const response = await POST(request(oversized, 'a-secure-ai-capability'));

    expect(response.status).toBe(413);
    expect(generateTeamScenarioSummary).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON without invoking Gemini', async () => {
    const { POST } = await import('./route');
    const malformed = new NextRequest('https://gauntlet.test/api/playoff-scenarios/summarize', {
      method: 'POST',
      headers: {
        authorization: 'Bearer a-secure-ai-capability',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.2',
      },
      body: '{not-json',
    });

    const response = await POST(malformed);

    expect(response.status).toBe(400);
    expect(generateTeamScenarioSummary).not.toHaveBeenCalled();
  });

  it('accepts a bounded authorized request', async () => {
    const { POST } = await import('./route');

    const response = await POST(request(validBody, 'a-secure-ai-capability'));

    expect(response.status).toBe(200);
    expect(generateTeamScenarioSummary).toHaveBeenCalledTimes(1);
  });

  it('rate limits repeated authorized requests from one caller', async () => {
    const { POST } = await import('./route');
    const caller = '203.0.113.99';

    const responses = await Promise.all(
      Array.from({ length: 11 }, () => POST(request(validBody, 'a-secure-ai-capability', caller))),
    );

    expect(responses.slice(0, 10).every(response => response.status === 200)).toBe(true);
    expect(responses[10]?.status).toBe(429);
    expect(generateTeamScenarioSummary).toHaveBeenCalledTimes(10);
  });
});
