import { describe, expect, it } from 'vitest';
import { parseYafsbAuctionSnapshot } from './market-auction-values';

describe('parseYafsbAuctionSnapshot', () => {
  it('converts Sleeper market percentages into values for a $200 budget', () => {
    const html = `
      <p class="table-caption">Half PPR · 12-team · 1QB — average % of budget spent across the 100 most recent qualifying Sleeper auction drafts. Last updated 2026-09-07 03:36.</p>
      <table id="auction"><tbody>
        <tr id="p-7564" data-player-id="7564">
          <td>3</td><td>Ja&#x27;Marr Chase</td><td>WR</td><td>CIN</td><td>30.6%</td>
        </tr>
        <tr id="p-LAR" data-player-id="LAR">
          <td>108</td><td>LAR</td><td>DEF</td><td>LAR</td><td>2.0%</td>
        </tr>
      </tbody></table>
    `;

    expect(parseYafsbAuctionSnapshot(html)).toEqual({
      sampleSize: 100,
      updatedAt: '2026-09-07 03:36',
      values: [
        {
          playerId: '7564',
          playerName: "Ja'Marr Chase",
          position: 'WR',
          nflTeam: 'CIN',
          budgetPercentage: 30.6,
          value: 61.2,
        },
        {
          playerId: 'LAR',
          playerName: 'LAR',
          position: 'DEF',
          nflTeam: 'LAR',
          budgetPercentage: 2,
          value: 4,
        },
      ],
    });
  });
});
