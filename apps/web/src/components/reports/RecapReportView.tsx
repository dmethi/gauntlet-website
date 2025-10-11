/**
 * RecapReportView Component
 *
 * Renders a WeeklyRecapReport in a user-friendly format.
 * Handles all section types and gracefully degrades for partial failures.
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageHeader } from '@gauntlet/ui';
import { AlertCircle, Award, Skull, Star, TrendingUp, Trophy } from 'lucide-react';
import type { WeeklyRecapReport } from '@/lib/reports/recap/types';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import { WinProbChart, ScoreChart } from '@/components/matchup-charts';

interface RecapReportViewProps {
  report: WeeklyRecapReport;
}

export const RecapReportView = ({ report }: RecapReportViewProps) => {
  const { metadata, sections } = report;
  const hof = (sections as any).hallOfFame;
  const hos = (sections as any).hallOfShame;

  return (
    <div className="px-2 md:px-4 py-6 space-y-8 overflow-x-hidden">
      {/* Header */}
      <PageHeader
        title={`Week ${metadata.week} Report — ${metadata.season}`}
        subtitle={`Generated ${new Date(metadata.generatedAt).toLocaleDateString()}`}
      />

      {/* Status Banner */}
      {metadata.status !== 'success' && (
        <Alert variant={metadata.status === 'partial' ? 'default' : 'destructive'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {metadata.status === 'partial' ? 'Partial Report' : 'Generation Failed'}
          </AlertTitle>
          <AlertDescription>
            {metadata.status === 'partial'
              ? 'Some sections could not be generated. The report may be incomplete.'
              : 'This report failed to generate properly.'}
            {metadata.errors && metadata.errors.length > 0 && (
              <div className="mt-2 text-xs space-y-1">
                {metadata.errors.map((error, idx) => (
                  <div key={idx}>• {error}</div>
                ))}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* League Overview */}
      {sections.leagueOverview && (
        <section className="space-y-4">
          <h2 className="text-2xl font-geizer font-bold">League Overview</h2>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap leading-relaxed">
              {sections.leagueOverview.narrative}
            </p>
          </div>
          {sections.leagueOverview.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-muted-foreground text-xs">Total Games</div>
                <div className="text-lg font-bold">{sections.leagueOverview.stats.totalGames}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-muted-foreground text-xs">Avg Score</div>
                <div className="text-lg font-bold">
                  {sections.leagueOverview.stats.averageScore.toFixed(1)}
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-muted-foreground text-xs">High Score</div>
                <div className="text-lg font-bold text-green-600">
                  {sections.leagueOverview.stats.highestScore.toFixed(1)}
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-muted-foreground text-xs">Close Games</div>
                <div className="text-lg font-bold">{sections.leagueOverview.stats.closeGames}</div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Matchup Narratives */}
      {sections.matchupNarratives && sections.matchupNarratives.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-geizer font-bold">Matchup Recaps</h2>
          <div className="space-y-6">
            {sections.matchupNarratives.map((matchup, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6 space-y-4">
                  {/* Matchup Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge variant="outline" className="text-xs">
                          {(() => {
                            const leagueId = matchup.boxScore?.team1?.leagueId || matchup.matchupId;
                            if (typeof leagueId === 'string') {
                              // Check if it's already "AFC" or "NFC"
                              if (leagueId.toUpperCase().includes('AFC')) return 'AFC';
                              if (leagueId.toUpperCase().includes('NFC')) return 'NFC';
                              // Check if it's the full league ID (AFC contains '44')
                              if (leagueId.includes('44')) return 'AFC';
                              return 'NFC';
                            }
                            return 'Unknown';
                          })()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Matchup {matchup.matchupId}
                        </span>
                      </div>
                      <div className="text-lg font-bold">
                        {matchup.boxScore.team1.teamName} vs {matchup.boxScore.team2.teamName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Final: {matchup.boxScore.finalScore.team1.toFixed(1)} -{' '}
                        {matchup.boxScore.finalScore.team2.toFixed(1)} (Margin:{' '}
                        {matchup.boxScore.margin.toFixed(1)})
                      </div>
                    </div>
                  </div>

                  {/* Narrative */}
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap leading-relaxed">{matchup.narrative}</p>
                  </div>

                  {/* Charts - Win Probability and Score Over Time */}
                  {matchup.timeSeries && matchup.timeSeries.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Win Probability Over Time</h4>
                        <WinProbChart
                          series={matchup.timeSeries}
                          teamAName={matchup.boxScore.team1.teamName || 'Team 1'}
                          teamBName={matchup.boxScore.team2.teamName || 'Team 2'}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Score Over Time</h4>
                        <ScoreChart
                          series={matchup.timeSeries}
                          teamAName={matchup.boxScore.team1.teamName || 'Team 1'}
                          teamBName={matchup.boxScore.team2.teamName || 'Team 2'}
                        />
                      </div>
                    </div>
                  )}

                  {/* Game Flow Stats */}
                  {matchup.gameFlow && (
                    <div className="text-xs text-muted-foreground pt-2">
                      Combined:{' '}
                      {matchup.boxScore.finalScore.team1 + matchup.boxScore.finalScore.team2} •
                      Margin: {matchup.boxScore.margin.toFixed(1)}
                      {matchup.gameFlow.leadChanges > 0 && (
                        <> • Lead changes: {matchup.gameFlow.leadChanges}</>
                      )}
                    </div>
                  )}

                  {/* Box Score - All Players */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-xs font-semibold mb-2 text-muted-foreground">
                        {matchup.boxScore.team1.teamName}
                      </div>
                      <div className="space-y-1">
                        {matchup.boxScore.team1.topPerformers.map((player, pidx) => (
                          <div key={pidx} className="flex items-center justify-between text-xs">
                            <span className="truncate">
                              <span className="text-muted-foreground mr-1">{player.position}</span>
                              {player.playerName}
                            </span>
                            <span className="font-medium">{player.points.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold mb-2 text-muted-foreground">
                        {matchup.boxScore.team2.teamName}
                      </div>
                      <div className="space-y-1">
                        {matchup.boxScore.team2.topPerformers.map((player, pidx) => (
                          <div key={pidx} className="flex items-center justify-between text-xs">
                            <span className="truncate">
                              <span className="text-muted-foreground mr-1">{player.position}</span>
                              {player.playerName}
                            </span>
                            <span className="font-medium">{player.points.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Power Rankings */}
      {sections.powerRankings && (
        <section className="space-y-4">
          <h2 className="text-2xl font-geizer font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Power Rankings
          </h2>
          {sections.powerRankings.narrative && (
            <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
              <p className="whitespace-pre-wrap leading-relaxed">
                {sections.powerRankings.narrative}
              </p>
            </div>
          )}
          {sections.powerRankings.rankings.length > 0 &&
            (() => {
              // Calculate min/max power scores for gradient mapping
              const powerScores = sections.powerRankings.rankings.map(t => t.powerScore || 0);
              const minScore = Math.min(...powerScores);
              const maxScore = Math.max(...powerScores);

              // Map power score to RdYlGn color palette (11 colors from red to green)
              const rdylgn = [
                '#a50026',
                '#d73027',
                '#f46d43',
                '#fdae61',
                '#fee08b',
                '#ffffbf',
                '#d9ef8b',
                '#a6d96a',
                '#66bd63',
                '#1a9850',
                '#006837',
              ];

              const getPowerScoreColor = (powerScore: number) => {
                // Normalize score to 0-1 range
                const normalized = (powerScore - minScore) / (maxScore - minScore);
                // Map to color index (0-10)
                const colorIndex = Math.floor(normalized * (rdylgn.length - 1));
                return rdylgn[colorIndex];
              };

              return (
                <div className="space-y-6">
                  {/* Group rankings by tier */}
                  {Object.entries(
                    sections.powerRankings.rankings.reduce(
                      (acc, team) => {
                        const tier = team.tier || 1;
                        if (!acc[tier]) acc[tier] = [];
                        acc[tier].push(team);
                        return acc;
                      },
                      {} as Record<number, typeof sections.powerRankings.rankings>,
                    ),
                  )
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([tier, teams]) => (
                      <div key={tier} className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Tier {tier}
                        </h3>
                        <div className="space-y-1.5">
                          {teams.map((team, idx) => {
                            const bgColor = getPowerScoreColor(team.powerScore || 0);
                            const textColor = getTextColor(bgColor);

                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between py-2 px-3 rounded-md transition-all hover:scale-[1.005]"
                                style={{ backgroundColor: bgColor }}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="text-base font-bold w-6 flex-shrink-0"
                                    style={{ color: textColor }}
                                  >
                                    #{team.rank}
                                  </div>
                                  <div className="min-w-0">
                                    <div
                                      className="font-semibold text-sm"
                                      style={{ color: textColor }}
                                    >
                                      {team.teamName}
                                    </div>
                                    <div
                                      className="text-xs opacity-70"
                                      style={{ color: textColor }}
                                    >
                                      {team.record} • {team.points.toFixed(1)} PF
                                      {team.powerScore && (
                                        <> • {team.powerScore.toFixed(2)} power</>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="text-sm font-mono font-bold"
                                    style={{ color: textColor }}
                                  >
                                    {team.powerScore?.toFixed(2) || '0.00'}
                                  </div>
                                  {team.movementAmount && team.movementAmount > 0 && (
                                    <div
                                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                        team.movement === 'up'
                                          ? 'bg-green-600 text-white'
                                          : team.movement === 'down'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-500 text-white'
                                      }`}
                                    >
                                      {team.movement === 'up' && '↑'}
                                      {team.movement === 'down' && '↓'}
                                      {team.movement === 'same' && '—'}
                                      {team.movement !== 'same' && ` ${team.movementAmount}`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              );
            })()}
        </section>
      )}

      {/* Standings */}
      {sections.standings && (
        <section className="space-y-4">
          <h2 className="text-2xl font-geizer font-bold">Standings</h2>
          {sections.standings.narrative && (
            <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
              <p className="whitespace-pre-wrap leading-relaxed">{sections.standings.narrative}</p>
            </div>
          )}
          {/* Check if we have standingsData with divisions (new format) or flat standings (old format) */}
          {(report as any).standingsData ? (
            <div className="grid md:grid-cols-2 gap-6">
              {(report as any).standingsData.map((league: any) => (
                <div key={league.leagueId} className="space-y-3">
                  <h3 className="font-semibold">{league.leagueName}</h3>
                  {Object.entries(league.divisions).map(([divName, teams]) => (
                    <div key={divName} className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">{divName}</h4>
                      <div className="space-y-1">
                        {(teams as any[]).map((team: any) => (
                          <div key={team.rosterId} className="flex items-center justify-between">
                            <div className="truncate text-xs">
                              {team.teamName || team.name}
                              <span className="text-xs text-muted-foreground ml-2">
                                PR #
                                {sections.powerRankings?.rankings?.find(
                                  (p: any) =>
                                    p.leagueId === league.leagueId &&
                                    String(p.rosterId) === String(team.rosterId),
                                )?.rank ?? '-'}
                              </span>
                            </div>
                            <div className="text-xs ml-2">
                              {team.wins}-{team.losses} • {team.points.toFixed(1)} pts
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(sections.standings.standings).map(([leagueName, teams]) => (
                <Card key={leagueName}>
                  <CardHeader>
                    <CardTitle className="text-lg">{leagueName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {teams.map((team, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
                        >
                          <div className="truncate">
                            <span className="font-medium">{team.teamName}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{team.record}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Upcoming Matchups */}
      {sections.upcoming && sections.upcoming.matchups && sections.upcoming.matchups.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-geizer font-bold">Upcoming Matchups</h2>
          <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
            <p className="whitespace-pre-wrap leading-relaxed">{sections.upcoming.narrative}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {sections.upcoming.matchups.map((matchup, idx) => (
              <Card key={idx}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="truncate">
                      <div className="font-semibold">{matchup.team1}</div>
                    </div>
                    <div className="text-muted-foreground px-4">vs</div>
                    <div className="truncate text-right">
                      <div className="font-semibold">{matchup.team2}</div>
                    </div>
                  </div>
                  {matchup.storyline && (
                    <div className="text-xs text-muted-foreground mt-2">{matchup.storyline}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Hall of Fame & Shame */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.hallOfFame && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gauntlet-gold">
                <Trophy className="h-5 w-5" />
                Hall of Fame
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap leading-relaxed text-sm">
                  {sections.hallOfFame.narrative}
                </p>
              </div>
              {/* New Records / Top-10 All-Time (enhanced) */}
              {(hof?.records || hof?.highlights?.records) && (
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <Star className="h-3.5 w-3.5" />
                    New Records & Top-10 All-Time
                  </div>
                  <div className="space-y-2">
                    {(hof?.records || hof?.highlights?.records || [])
                      .slice(0, 50)
                      .map((r: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 bg-gauntlet-gold/10 rounded text-xs flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold truncate">
                              {r.categoryName || r.categoryId}
                            </div>
                            <div className="text-muted-foreground truncate">
                              {r.teamName} • {r.league} • Rank {r.weekRank || r.rank}
                            </div>
                          </div>
                          <div className="font-medium">
                            {(r.weekValue ?? r.value)?.toFixed?.(2) ?? r.weekValue ?? r.value}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Top performers by position (enhanced or basic) */}
              {(hof?.highlights?.topPerformers || hof?.topPerformersByPosition) && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Top 5 by Position
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(position => {
                      // Prefer formatted highlights.topPerformers (has real names) over raw topPerformersByPosition
                      const formatted = hof?.highlights?.topPerformers?.[position];
                      const raw = hof?.topPerformersByPosition?.[position];
                      const list = formatted || raw || [];
                      if (!list || list.length === 0) return null;
                      return (
                        <div key={position} className="p-3 rounded bg-muted/40">
                          <div className="text-xs font-semibold mb-2">{position}</div>
                          <div className="space-y-1">
                            {list.slice(0, 5).map((p: any, i: number) => (
                              <div
                                key={i}
                                className="flex items-start justify-between text-xs gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="truncate">
                                    {p.playerName || p.name || p.player || p.player_id}
                                    <span className="text-muted-foreground ml-1">
                                      {p.position ? `(${p.position})` : ''}
                                    </span>
                                  </div>
                                  <div className="text-muted-foreground truncate">
                                    {p.ownership
                                      ? p.ownership
                                          .map(
                                            (o: any) =>
                                              `${o.league}: ${o.teamName} (${o.manager})${o.status === 'benched' ? ' [B]' : ''}`,
                                          )
                                          .join(' • ')
                                      : p.ownedBy || ''}
                                  </div>
                                </div>
                                <div className="font-medium whitespace-nowrap">
                                  {(p.points ?? p.value)?.toFixed?.(2) ?? p.points ?? p.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {sections.hallOfShame && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gauntlet-crimson">
                <AlertCircle className="h-5 w-5" />
                Hall of Shame
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap leading-relaxed text-sm">
                  {sections.hallOfShame.narrative}
                </p>
              </div>

              {/* Biggest projection misses (Top 10) */}
              {hos?.lowlights?.biggestBusts && hos?.lowlights?.biggestBusts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <Skull className="h-3.5 w-3.5" />
                    Biggest Projection Misses (Top 10)
                  </div>
                  <div className="space-y-1">
                    {[...hos.lowlights.biggestBusts]
                      .map((p: any) => ({
                        name: p.playerName || p.name || p.player,
                        team: p.team || p.teamName,
                        points: p.points ?? 0,
                        projection: p.projection ?? 0,
                        under: (p.projection ?? 0) - (p.points ?? 0),
                      }))
                      .sort((a: any, b: any) => b.under - a.under)
                      .slice(0, 10)
                      .map((p: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded bg-gauntlet-crimson/5 text-xs"
                        >
                          <div className="truncate">
                            <span className="font-medium">{i + 1}.</span> {p.name}
                            {p.team ? (
                              <span className="text-muted-foreground"> — {p.team}</span>
                            ) : null}
                          </div>
                          <div className="whitespace-nowrap">
                            <span className="text-muted-foreground mr-2">
                              Proj {p.projection.toFixed(1)}
                            </span>
                            <span className="mr-2">Actual {p.points.toFixed(1)}</span>
                            <span className="font-semibold text-gauntlet-crimson">
                              −{p.under.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Closing Commentary */}
      {sections.closing && (
        <section className="space-y-4">
          <h2 className="text-2xl font-geizer font-bold">Closing Thoughts</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap leading-relaxed">{sections.closing.narrative}</p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Footer Metadata */}
      <div className="pt-8 border-t text-xs text-muted-foreground space-y-1">
        <div>Report generated: {new Date(metadata.generatedAt).toLocaleString()}</div>
        <div>Generation time: {(metadata.generationTime / 1000).toFixed(1)}s</div>
        {metadata.tokensUsed > 0 && <div>Tokens used: {metadata.tokensUsed.toLocaleString()}</div>}
        <div>Version: {metadata.version}</div>
      </div>
    </div>
  );
};
