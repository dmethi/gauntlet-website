'use client';

import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { neutralBadgeClass } from '@/lib/stat-colors';
import type { DraftPickReport, DraftReport } from './draft-report';
import { PlayerPortrait, TeamAvatar } from './OpeningReportMedia';

const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

const percent = (value: number): string => `${Math.round(value * 100)}%`;
const signedMoney = (value: number): string => `${value >= 0 ? '+' : '−'}$${Math.abs(value)}`;

const allPicksFor = (report: DraftReport): DraftPickReport[] =>
  report.teamGrades.flatMap(team => team.picks);

export const DraftLegacyAnalytics = ({ report }: { report: DraftReport }) => {
  const positions = report.marketAnalytics.positionMarkets.map(market => market.position);
  const [curvePosition, setCurvePosition] = useState(positions[0] ?? 'QB');
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [startersOnly, setStartersOnly] = useState(false);
  const [pickSearch, setPickSearch] = useState('');

  const allPicks = useMemo(() => allPicksFor(report), [report]);
  const starterIdsByTeam = useMemo(
    () => new Map(report.teamGrades.map(team => [team.teamId, new Set(team.starterPlayerIds)])),
    [report.teamGrades],
  );
  const filteredPicks = useMemo(() => {
    const query = pickSearch.trim().toLowerCase();
    return allPicks
      .filter(pick => leagueFilter === 'all' || pick.leagueId === leagueFilter)
      .filter(pick => positionFilter === 'all' || pick.position === positionFilter)
      .filter(pick => !startersOnly || starterIdsByTeam.get(pick.teamId)?.has(pick.playerId))
      .filter(
        pick =>
          query.length === 0 ||
          `${pick.playerName} ${pick.teamName} ${pick.managerName} ${pick.nflTeam ?? ''}`
            .toLowerCase()
            .includes(query),
      )
      .sort((a, b) => a.leagueName.localeCompare(b.leagueName) || a.pickNo - b.pickNo);
  }, [allPicks, leagueFilter, pickSearch, positionFilter, starterIdsByTeam, startersOnly]);

  const curveData = useMemo(() => {
    const prices = report.leagues.map(league => ({
      league,
      values: allPicks
        .filter(pick => pick.leagueId === league.leagueId && pick.position === curvePosition)
        .sort((a, b) => b.price - a.price),
    }));
    const count = Math.max(0, ...prices.map(item => item.values.length));
    return Array.from({ length: count }, (_, index) => ({
      rank: index + 1,
      ...Object.fromEntries(
        prices.map(item => [item.league.leagueName, item.values[index]?.price ?? null]),
      ),
    }));
  }, [allPicks, curvePosition, report.leagues]);

  const consensusPlayers = useMemo(() => {
    const players = new Map<string, DraftPickReport[]>();
    allPicks.forEach(pick =>
      players.set(pick.playerId, [...(players.get(pick.playerId) ?? []), pick]),
    );
    return [...players.values()]
      .map(picks => ({
        playerId: picks[0].playerId,
        playerName: picks[0].playerName,
        position: picks[0].position,
        nflTeam: picks[0].nflTeam,
        leagues: new Set(picks.map(pick => pick.leagueId)).size,
        averagePrice: picks.reduce((sum, pick) => sum + pick.price, 0) / picks.length,
        prices: picks.sort((a, b) => a.leagueName.localeCompare(b.leagueName)),
      }))
      .filter(player => player.leagues >= 2)
      .sort(
        (a, b) =>
          b.leagues - a.leagues ||
          b.averagePrice - a.averagePrice ||
          a.playerName.localeCompare(b.playerName),
      );
  }, [allPicks]);

  const selectedMarket = report.marketAnalytics.positionMarkets.find(
    market => market.position === curvePosition,
  );
  const selectedTopTier = [...(selectedMarket?.leagues ?? [])].sort(
    (a, b) => (b.quartiles[0]?.averagePrice ?? 0) - (a.quartiles[0]?.averagePrice ?? 0),
  )[0];
  const selectedDepth = [...(selectedMarket?.leagues ?? [])].sort(
    (a, b) => (b.quartiles.at(-1)?.averagePrice ?? 0) - (a.quartiles.at(-1)?.averagePrice ?? 0),
  )[0];
  const concentratedManagers = [...report.managerAnalytics].sort(
    (a, b) => b.giniSpend - a.giniSpend,
  );
  const widestConsensus = [...consensusPlayers].sort((a, b) => {
    const spread = (picks: DraftPickReport[]) =>
      Math.max(...picks.map(pick => pick.price)) - Math.min(...picks.map(pick => pick.price));
    return spread(b.prices) - spread(a.prices);
  })[0];

  return (
    <>
      <section className="border-t border-border py-14" aria-labelledby="position-market">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">By position</p>
        <h2 id="position-market" className="mt-2 font-geizer text-3xl uppercase tracking-wider">
          Spending table and price curves
        </h2>

        <div className="mt-8 space-y-2">
          {report.marketAnalytics.positionMarkets.map(market => (
            <details
              key={market.position}
              className="group border-y border-border"
              open={market.position === 'QB'}
            >
              <summary className="grid cursor-pointer list-none grid-cols-[5rem_repeat(3,minmax(0,1fr))] items-center gap-3 py-4">
                <Badge className={neutralBadgeClass}>{market.position}</Badge>
                {market.leagues.map(league => (
                  <span key={league.leagueId} className="text-right text-sm">
                    <span className="block font-geizer text-xl">${league.averagePrice}</span>
                    <span className="text-xs text-muted-foreground">{league.leagueName} avg</span>
                  </span>
                ))}
              </summary>
              <div className="overflow-x-auto pb-5">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-3">Price tier</th>
                      {market.leagues.map(league => (
                        <th key={league.leagueId} className="px-3 py-2 text-right">
                          {league.leagueName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {market.leagues[0]?.quartiles.map((quartile, index) => (
                      <tr key={quartile.label} className="border-t border-border">
                        <td className="py-3 pr-3 font-medium">{quartile.label}</td>
                        {market.leagues.map(league => (
                          <td key={league.leagueId} className="px-3 py-3 text-right">
                            ${league.quartiles[index]?.averagePrice ?? 0}{' '}
                            <span className="text-xs text-muted-foreground">
                              ({league.quartiles[index]?.count ?? 0})
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>

        <aside className="mt-6 bg-muted/50 px-5 py-4 text-sm leading-6">
          <strong>What the table says.</strong> The top-tier rows isolate the handful of players who
          drove each positional market; the depth row shows where rooms kept paying after the
          obvious starters were gone. Expand a position to see whether a room&apos;s apparent
          premium was concentrated at the top or persisted through the player pool.
        </aside>

        <div className="mt-10 border border-border p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-geizer text-xl uppercase tracking-wide">
                Positional spending curve
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Price by within-position rank in each room.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {positions.map(position => (
                <button
                  key={position}
                  type="button"
                  aria-pressed={curvePosition === position}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    curvePosition === position
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setCurvePosition(position)}
                >
                  {position}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curveData} margin={{ top: 8, right: 12, left: -12, bottom: 8 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="rank"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={value => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                  formatter={value => [`$${value}`, 'Price']}
                />
                <Legend />
                {report.leagues.map((league, index) => (
                  <Line
                    key={league.leagueId}
                    type="monotone"
                    dataKey={league.leagueName}
                    stroke={chartColors[index]}
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-5 border-l-2 border-primary pl-4 text-sm leading-6 text-muted-foreground">
            <strong className="text-foreground">Reading {curvePosition}:</strong>{' '}
            {selectedTopTier?.leagueName ?? 'No room'} set the strongest top-tier market
            {selectedTopTier
              ? ` at $${selectedTopTier.quartiles[0]?.averagePrice ?? 0} on average`
              : ''}
            , while {selectedDepth?.leagueName ?? 'no room'} paid the most for depth
            {selectedDepth ? ` at $${selectedDepth.quartiles.at(-1)?.averagePrice ?? 0}` : ''}. A
            steep early drop signals a stars-and-scrubs position; flatter curves show more sustained
            spending through the middle class.
          </p>
        </div>
      </section>

      <section className="border-t border-border py-14" aria-labelledby="manager-profiles">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          Manager behavior
        </p>
        <h2 id="manager-profiles" className="mt-2 font-geizer text-3xl uppercase tracking-wider">
          Concentration and positional allocation
        </h2>
        <div className="mt-8 max-h-[34rem] overflow-auto border-y border-border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="sticky top-0 bg-background text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 pr-4">Team</th>
                <th className="px-3 py-3">League</th>
                <th className="px-3 py-3 text-right">Gini</th>
                <th className="px-3 py-3 text-right">Top 1</th>
                <th className="px-3 py-3 text-right">Top 3</th>
                <th className="px-3 py-3 text-right">Starter $</th>
                <th className="py-3 pl-3 text-right">Bench $</th>
              </tr>
            </thead>
            <tbody>
              {[...report.managerAnalytics]
                .sort((a, b) => b.giniSpend - a.giniSpend)
                .map(manager => (
                  <tr key={manager.teamId} className="border-t border-border">
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-3">
                        <TeamAvatar src={manager.avatarUrl} name={manager.teamName} size={34} />
                        <span>
                          <span className="block font-semibold">{manager.teamName}</span>
                          <span className="block text-xs text-muted-foreground">
                            {manager.managerName}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{manager.leagueName}</td>
                    <td className="px-3 py-3 text-right font-mono">
                      {manager.giniSpend.toFixed(3)}
                    </td>
                    <td className="px-3 py-3 text-right">{percent(manager.top1Share)}</td>
                    <td className="px-3 py-3 text-right">{percent(manager.top3Share)}</td>
                    <td className="px-3 py-3 text-right">${manager.starterSpend}</td>
                    <td className="py-3 pl-3 text-right">${manager.benchSpend}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 max-h-[38rem] overflow-auto border-y border-border">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="sticky top-0 bg-background text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 pr-4">Team</th>
                {positions.map(position => (
                  <th key={position} className="px-3 py-3 text-right">
                    {position}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.managerAnalytics.map(manager => (
                <tr key={manager.teamId} className="border-t border-border">
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-3">
                      <TeamAvatar src={manager.avatarUrl} name={manager.teamName} size={32} />
                      <span>
                        <span className="block font-semibold">{manager.teamName}</span>
                        <span className="block text-xs text-muted-foreground">
                          {manager.leagueName}
                        </span>
                      </span>
                    </span>
                  </td>
                  {positions.map(position => {
                    const value = manager.positionSpend[position] ?? 0;
                    return (
                      <td key={position} className="px-3 py-3 text-right">
                        <span
                          className="inline-block min-w-14 rounded-sm px-2 py-1"
                          style={{
                            backgroundColor: `hsl(var(--primary) / ${Math.min(0.62, 0.08 + value / 150)})`,
                          }}
                        >
                          ${value}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 max-w-4xl text-sm leading-6 text-muted-foreground">
          <strong className="text-foreground">Takeaway:</strong> {concentratedManagers[0]?.teamName}{' '}
          produced the most star-heavy allocation with a{' '}
          {concentratedManagers[0]?.giniSpend.toFixed(3)} Gini;{' '}
          {concentratedManagers.at(-1)?.teamName} was the most balanced at{' '}
          {concentratedManagers.at(-1)?.giniSpend.toFixed(3)}. The heatmap beneath the table shows
          where that concentration landed by position, making zero-RB, WR-heavy and premium-QB
          constructions visible without reading every roster.
        </p>
      </section>

      <section className="border-t border-border py-14" aria-labelledby="consensus-board">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          Player overlap
        </p>
        <h2 id="consensus-board" className="mt-2 font-geizer text-3xl uppercase tracking-wider">
          Multi-room consensus board
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          One row per player, one price column per Legion. Darker cells mark the highest price in
          that player&apos;s row; blanks mean the player was not selected in that room.
        </p>
        <div className="mt-8 max-h-96 overflow-auto border-y border-border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 bg-background text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 pr-4">Player</th>
                {report.leagues.map(league => (
                  <th key={league.leagueId} className="px-3 py-3 text-right">
                    {league.leagueName.replace(/:.*$/, '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consensusPlayers.map(player => (
                <tr key={player.playerId} className="border-t border-border">
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-3">
                      <PlayerPortrait
                        playerId={player.playerId}
                        playerName={player.playerName}
                        nflTeam={player.nflTeam}
                        size={38}
                      />
                      <span>
                        <span className="block font-semibold">{player.playerName}</span>
                        <span className="text-xs text-muted-foreground">{player.position}</span>
                      </span>
                    </span>
                  </td>
                  {report.leagues.map(league => {
                    const pick = player.prices.find(
                      candidate => candidate.leagueId === league.leagueId,
                    );
                    const rowPrices = player.prices.map(candidate => candidate.price);
                    const low = Math.min(...rowPrices);
                    const high = Math.max(...rowPrices);
                    const intensity = pick
                      ? high === low
                        ? 0.18
                        : 0.08 + ((pick.price - low) / (high - low)) * 0.34
                      : 0;
                    return (
                      <td
                        key={league.leagueId}
                        className="px-3 py-3 text-right font-geizer text-lg"
                        style={
                          pick
                            ? { backgroundColor: `hsl(var(--primary) / ${intensity})` }
                            : undefined
                        }
                      >
                        {pick ? `$${pick.price}` : <span className="text-muted-foreground">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {widestConsensus ? (
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            <strong className="text-foreground">Takeaway:</strong> {widestConsensus.playerName} is
            the clearest consensus-board fault line, spanning $
            {Math.min(...widestConsensus.prices.map(pick => pick.price))}
            –${Math.max(...widestConsensus.prices.map(pick => pick.price))} across the rooms that
            drafted him.
          </p>
        ) : null}
      </section>

      <section className="border-t border-border py-14" aria-labelledby="team-directory">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          Team directory
        </p>
        <h2 id="team-directory" className="mt-2 font-geizer text-3xl uppercase tracking-wider">
          Every roster, starters and bench
        </h2>
        <div className="mt-8 space-y-10">
          {report.leagues.map(league => (
            <div key={league.leagueId}>
              <h3 className="border-b-2 border-foreground pb-3 font-geizer text-xl uppercase tracking-wide">
                {league.leagueName}
              </h3>
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {report.teamGrades
                  .filter(team => team.leagueId === league.leagueId)
                  .map(team => {
                    const starters = new Set(team.starterPlayerIds);
                    return (
                      <details key={team.teamId} className="border border-border p-4">
                        <summary className="cursor-pointer list-none">
                          <span className="flex items-center gap-3">
                            <TeamAvatar src={team.avatarUrl} name={team.teamName} size={40} />
                            <span>
                              <span className="block font-semibold">{team.teamName}</span>
                              <span className="mt-1 block text-xs text-muted-foreground">
                                ${team.spend} spent · {team.grade} grade · expand roster
                              </span>
                            </span>
                          </span>
                        </summary>
                        {(['Starters', 'Bench'] as const).map(role => (
                          <div key={role} className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              {role}
                            </p>
                            <ul className="mt-2 space-y-1.5">
                              {team.picks
                                .filter(
                                  pick => starters.has(pick.playerId) === (role === 'Starters'),
                                )
                                .sort((a, b) => b.price - a.price)
                                .map(pick => (
                                  <li
                                    key={pick.playerId}
                                    className="grid grid-cols-[2.5rem_1fr_auto_auto] gap-2 text-xs"
                                  >
                                    <Badge className={neutralBadgeClass}>{pick.position}</Badge>
                                    <span className="truncate">{pick.playerName}</span>
                                    <span>${pick.price}</span>
                                    <span className="text-muted-foreground">
                                      /
                                      {pick.benchmarkValue === null
                                        ? '—'
                                        : `$${pick.benchmarkValue}`}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        ))}
                      </details>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-14" aria-labelledby="all-picks">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          Complete data
        </p>
        <h2 id="all-picks" className="mt-2 font-geizer text-3xl uppercase tracking-wider">
          All {allPicks.length} draft picks
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <input
            value={pickSearch}
            onChange={event => setPickSearch(event.target.value)}
            placeholder="Search player, team, manager…"
            className="h-10 min-w-64 flex-1 rounded-md border border-input bg-background px-3 text-sm"
          />
          <select
            aria-label="League filter"
            value={leagueFilter}
            onChange={event => setLeagueFilter(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All Legions</option>
            {report.leagues.map(league => (
              <option key={league.leagueId} value={league.leagueId}>
                {league.leagueName}
              </option>
            ))}
          </select>
          <select
            aria-label="Position filter"
            value={positionFilter}
            onChange={event => setPositionFilter(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All positions</option>
            {positions.map(position => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          <label className="flex h-10 items-center gap-2 rounded-md border border-input px-3 text-sm">
            <input
              type="checkbox"
              checked={startersOnly}
              onChange={event => setStartersOnly(event.target.checked)}
            />{' '}
            Starters only
          </label>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Showing {filteredPicks.length} of {allPicks.length} purchases.
        </p>
        <div className="mt-4 max-h-[38rem] overflow-auto border-y border-border">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="sticky top-0 bg-background text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 pr-3">Player</th>
                <th className="px-3 py-3">Pos</th>
                <th className="px-3 py-3">League</th>
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3 text-right">Pick</th>
                <th className="px-3 py-3 text-right">Price</th>
                <th className="px-3 py-3 text-right">Benchmark</th>
                <th className="py-3 pl-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredPicks.map(pick => (
                <tr key={`${pick.teamId}:${pick.pickNo}`} className="border-t border-border">
                  <td className="py-3 pr-3">
                    <span className="font-semibold">{pick.playerName}</span>
                    <span className="block text-xs text-muted-foreground">
                      {pick.nflTeam ?? 'FA'} ·{' '}
                      {starterIdsByTeam.get(pick.teamId)?.has(pick.playerId) ? 'Starter' : 'Bench'}
                    </span>
                  </td>
                  <td className="px-3 py-3">{pick.position}</td>
                  <td className="px-3 py-3">{pick.leagueName}</td>
                  <td className="px-3 py-3">
                    <span className="font-medium">{pick.teamName}</span>
                    <span className="block text-xs text-muted-foreground">{pick.managerName}</span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono">#{pick.pickNo}</td>
                  <td className="px-3 py-3 text-right font-mono">${pick.price}</td>
                  <td className="px-3 py-3 text-right font-mono">
                    {pick.benchmarkValue === null ? '—' : `$${pick.benchmarkValue}`}
                  </td>
                  <td className="py-3 pl-3 text-right font-mono">
                    {pick.valueDelta === null ? '—' : signedMoney(pick.valueDelta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};
