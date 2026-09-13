export interface MarketAuctionValue {
  playerId: string;
  playerName: string;
  position: string;
  nflTeam: string;
  budgetPercentage: number;
  value: number;
}

export interface MarketAuctionSnapshot {
  sampleSize: number;
  updatedAt: string;
  values: MarketAuctionValue[];
}

const decodeHtml = (value: string): string =>
  value
    .replace(/<[^>]*>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replaceAll('&amp;', '&')
    .replaceAll('&apos;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&nbsp;', ' ')
    .trim();

const round = (value: number): number => Math.round(value * 10) / 10;

export const parseYafsbAuctionSnapshot = (html: string, budget = 200): MarketAuctionSnapshot => {
  const caption = html.match(
    /across the\s+(\d+)\s+most recent qualifying Sleeper auction drafts\.\s*Last updated\s+([^.]+)\./i,
  );
  if (!caption) throw new Error('YAFSB auction snapshot metadata was not found');

  const table = html.match(/<table[^>]*id=["']auction["'][^>]*>([\s\S]*?)<\/table>/i)?.[1];
  if (!table) throw new Error('YAFSB auction values table was not found');

  const values = Array.from(
    table.matchAll(/<tr[^>]*data-player-id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/tr>/gi),
    row => {
      const cells = Array.from(row[2].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi), cell =>
        decodeHtml(cell[1]),
      );
      const budgetPercentage = Number(cells[4]?.replace('%', ''));
      if (cells.length < 5 || !Number.isFinite(budgetPercentage)) {
        throw new Error(`Invalid YAFSB auction row for player ${row[1]}`);
      }
      return {
        playerId: row[1],
        playerName: cells[1],
        position: cells[2].toUpperCase(),
        nflTeam: cells[3].toUpperCase(),
        budgetPercentage,
        value: round((budgetPercentage / 100) * budget),
      };
    },
  );

  return {
    sampleSize: Number(caption[1]),
    updatedAt: caption[2].trim(),
    values,
  };
};
