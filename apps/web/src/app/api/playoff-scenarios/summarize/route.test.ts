// @vitest-environment node

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
    {
      rosterId: 2,
      teamName: 'Other Team',
      ownerName: 'Other Owner',
      division: 2,
      wins: 7,
      losses: 6,
      pointsFor: 1100,
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
    vi.resetModules();
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

  it('rejects mixed-league standings before prompt construction', async () => {
    const { POST } = await import('./route');
    const mixedLeague = {
      ...validBody,
      standings: validBody.standings.map((standing, index) =>
        index === 1 ? { ...standing, leagueId: 'league-two' } : standing,
      ),
    };

    const response = await POST(request(mixedLeague, 'a-secure-ai-capability'));

    expect(response.status).toBe(400);
    expect(generateTeamScenarioSummary).not.toHaveBeenCalled();
  });

  it('rejects matchup and target references inconsistent with the standings', async () => {
    const { POST } = await import('./route');
    const unknownRoster = {
      ...validBody,
      matchups: [{ ...validBody.matchups[0], team2RosterId: 999 }],
    };
    const mismatchedTarget = { ...validBody, ownerName: 'Different Owner' };

    expect((await POST(request(unknownRoster, 'a-secure-ai-capability'))).status).toBe(400);
    expect((await POST(request(mismatchedTarget, 'a-secure-ai-capability'))).status).toBe(400);
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

  it('does not let invalid requests consume the provider-call allowance', async () => {
    const { POST } = await import('./route');

    for (let index = 0; index < 10; index += 1) {
      expect(
        (await POST(request({ ...validBody, unknown: index }, 'a-secure-ai-capability'))).status,
      ).toBe(400);
    }

    expect((await POST(request(validBody, 'a-secure-ai-capability'))).status).toBe(200);
    expect(generateTeamScenarioSummary).toHaveBeenCalledTimes(1);
  });

  it('accepts a bounded authorized request', async () => {
    const { POST } = await import('./route');

    const response = await POST(request(validBody, 'a-secure-ai-capability'));

    expect(response.status).toBe(200);
    expect(generateTeamScenarioSummary).toHaveBeenCalledTimes(1);
  });

  it('uses a global process-local rate gate that spoofed forwarding headers cannot bypass', async () => {
    const { POST } = await import('./route');

    const responses = await Promise.all(
      Array.from({ length: 11 }, (_, index) =>
        POST(request(validBody, 'a-secure-ai-capability', `203.0.113.${index + 1}`)),
      ),
    );

    expect(responses.slice(0, 10).every(response => response.status === 200)).toBe(true);
    expect(responses[10]?.status).toBe(429);
    expect(generateTeamScenarioSummary).toHaveBeenCalledTimes(10);
  });
});
