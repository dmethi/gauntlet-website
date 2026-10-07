import { describe, expect, it } from 'vitest';
import snapshot from './week-four-deep-dive-data.json';
import { finishIndex, rankGames, rankScheduleLuck, thrillerIndex } from './week-four-deep-dives';

describe('Week 4 deep dives', () => {
  it('keeps the source snapshot complete and gives Sid the largest schedule advantage', () => {
    expect(snapshot.teams).toHaveLength(36);
    expect(snapshot.games).toHaveLength(72);

    const { luckiest, unluckiest } = rankScheduleLuck(snapshot.teams);
    expect(luckiest[0]).toMatchObject({ league: 'Forge', rosterId: 5, wins: 4 });
    expect(luckiest[0].scheduleLuck).toBeCloseTo(2.029, 3);
    expect(unluckiest[0]).toMatchObject({ league: 'Forge', rosterId: 7, wins: 0 });
    expect(unluckiest[0].scheduleLuck).toBeCloseTo(-1.6, 3);
  });

  it('ranks the two highest-scoring close games first', () => {
    const { thrillers } = rankGames(snapshot.games);
    expect(
      thrillers.map(({ game }) => [game.league, game.week, game.matchupId]).slice(0, 2),
    ).toEqual([
      ['Forge', 2, 3],
      ['Forge', 4, 5],
    ]);
    expect(thrillerIndex(thrillers[0].game, snapshot.games)).toBe(thrillers[0].index);
  });

  it('only ranks late rescues whose final feed matches Sleeper', () => {
    const { finishes } = rankGames(snapshot.games);
    expect(finishes[0].game).toMatchObject({ league: 'Forge', week: 4, matchupId: 5 });
    expect(finishes.every(({ game }) => game.finalFeedAligned)).toBe(true);
    expect(finishes.every(({ game }) => game.lateRescue?.progress >= 0.95)).toBe(true);
    expect(finishes.every(({ game }) => finishIndex(game) !== null)).toBe(true);
  });
});
