import source from './week-six-rankings-source.json';
import { buildLeagueRankings, rankReturns } from './report-rankings';

// Every baseline and ownership calculation stays within its Legion. Combine only the finished rows.
const leagues = source.leagues.map(league => buildLeagueRankings(league, source.players));
const drafts = leagues.flatMap(league => league.drafts);
const picks = leagues.flatMap(league => league.draftPicks);
const transactions = leagues.flatMap(league => league.transactions);
const positions = leagues.flatMap(league => league.positions);
const teams = leagues.flatMap(league => league.teamOutliers);

export const WEEK_SIX_RANKINGS = {
  leagues,
  drafts: rankReturns(drafts, row => row.vorpPerDollar),
  picks: rankReturns(picks, row => row.surplus),
  transactions: rankReturns(transactions, row => row.score),
  positions: rankReturns(positions, row => row.edge),
  byPosition: ['QB', 'RB', 'WR', 'TE', 'DEF'].map(position => ({
    position,
    ...rankReturns(
      positions.filter(row => row.position === position),
      row => row.edge,
      1,
    ),
  })),
  volatility: rankReturns(teams, row => row.volatility, 1),
  concentration: rankReturns(teams, row => row.concentration, 1),
  benchBomb: rankReturns(
    leagues.flatMap(league => league.benchBombs),
    row => row.points,
    1,
  ).best[0],
  unstartedClaim: rankReturns(
    transactions.filter(row => row.starts === 0),
    row => row.cost,
    1,
  ).best[0],
  trades: leagues.flatMap(league => league.trades),
  totalTransactions: transactions.length,
};
