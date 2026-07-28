import { Suspense } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  ClipboardList,
  CrosshairIcon,
  Crown,
  DollarSign,
  ExternalLink,
  FileText,
  Flame,
  Medal,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { LeagueStructureVisual } from './_components/league-structure';
import { RULES_2026_PATH } from './_content/rules-2026';
import { ProposalForm, RegistrationForm, ReturnForm } from './_components/forms';
import { ProposalsDisplay } from './_components/proposals-display';
import { GauntletLogo } from '@/components/gauntlet-logo';
import { fetchSeasonStats } from '@/lib/year-in-review/season-stats';
import type { SeasonStats } from '@/lib/year-in-review/season-stats';

// Campaign page with three forms that collect names and emails: excluded from
// indexing by the policy in `@/lib/site`. `robots.ts` disallows the path; this
// states the same thing in the document for crawlers that reach the URL from a
// shared link.
export const metadata = {
  title: 'Year One — The Gauntlet',
  description: 'Season 2025 in review. Champions crowned. Money won. The Gauntlet enters Year Two.',
  robots: { index: false, follow: false },
};

const StatCard = ({ value, label }: { value: string; label: string }) => {
  return (
    <div className="flex flex-col items-center justify-center border border-white/10 rounded-lg p-6 bg-white/5">
      <span className="text-3xl sm:text-4xl font-bold text-[#d4af37] font-geizer tracking-wide">
        {value}
      </span>
      <span className="text-white/50 text-xs uppercase tracking-widest mt-2 text-center">
        {label}
      </span>
    </div>
  );
};

const AwardCard = ({
  Icon,
  award,
  winner,
  detail,
}: {
  Icon: LucideIcon;
  award: string;
  winner: string;
  detail?: string;
}) => {
  return (
    <div className="border border-white/10 hover:border-[#d4af37]/40 rounded-lg p-5 bg-white/5 transition-colors group">
      <Icon className="w-5 h-5 text-[#d4af37]/60 mb-3" strokeWidth={1.5} />
      <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-widest mb-1">{award}</p>
      <p className="text-white font-semibold text-base">{winner}</p>
      {detail && <p className="text-white/50 text-sm mt-1">{detail}</p>}
    </div>
  );
};

const ChampionCard = ({
  league,
  champion,
  runnerUp,
  thirdPlace,
}: {
  league: string;
  champion: string | null;
  runnerUp: string | null;
  thirdPlace: string | null;
}) => {
  const shortLeague = league.replace('Gauntlet ', '');
  return (
    <div className="border border-[#d4af37]/30 rounded-xl p-6 sm:p-8 bg-gradient-to-b from-[#d4af37]/5 to-transparent">
      <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-widest mb-1">
        {shortLeague} Conference
      </p>
      <div className="flex items-start gap-3 mt-4">
        <Crown className="w-6 h-6 text-[#d4af37] shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="text-white/50 text-xs uppercase tracking-wider">Champion · $3,000</p>
          <p className="text-white text-xl font-bold mt-0.5">{champion ?? 'TBD'}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Medal className="w-4 h-4 text-white/40" strokeWidth={1.5} />
            <span className="text-white/70 text-sm">{runnerUp ?? 'TBD'}</span>
          </div>
          <span className="text-[#d4af37]/70 text-xs font-semibold">$1,000</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Medal className="w-4 h-4 text-white/25" strokeWidth={1.5} />
            <span className="text-white/70 text-sm">{thirdPlace ?? 'TBD'}</span>
          </div>
          <span className="text-[#d4af37]/70 text-xs font-semibold">$500</span>
        </div>
      </div>
    </div>
  );
};

const PayoutRow = ({ label, amount, note }: { label: string; amount: string; note?: string }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        {note && <p className="text-white/40 text-xs mt-0.5">{note}</p>}
      </div>
      <span className="text-[#d4af37] font-bold text-sm tabular-nums">{amount}</span>
    </div>
  );
};

export default async function YearInReviewPage() {
  const data: SeasonStats | null = await fetchSeasonStats().catch(() => null);

  const totals = data?.totals;
  const champions = data?.champions ?? [];
  const awards = data?.awards;

  const afcChamp = champions.find(c => c.leagueName.includes('AFC'));
  const nfcChamp = champions.find(c => c.leagueName.includes('NFC'));

  return (
    <div className="min-h-screen bg-[#111] text-white overflow-x-hidden">
      {/* Nav bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#111]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <GauntletLogo size="sm" />
          <span className="font-geizer tracking-widest text-sm text-white/80 hidden sm:block">
            THE GAUNTLET
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={RULES_2026_PATH}
            className="text-xs font-semibold uppercase tracking-widest text-white/60 hover:text-white transition-colors hidden md:block"
          >
            2026 Rules
          </Link>
          <a
            href="#return"
            className="text-xs font-semibold uppercase tracking-widest text-white/60 hover:text-white transition-colors hidden sm:block"
          >
            I&apos;m Back
          </a>
          <a
            href="#registration"
            className="text-xs font-semibold uppercase tracking-widest bg-[#d4af37] hover:bg-[#ebb748] text-black px-4 py-2 rounded transition-colors"
          >
            Register
          </a>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="hero-orb-a absolute rounded-full"
            style={{
              width: '70vw',
              height: '70vw',
              top: '-10%',
              left: '-10%',
              background: 'radial-gradient(circle, rgba(139,21,56,0.22) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="hero-orb-b absolute rounded-full"
            style={{
              width: '50vw',
              height: '50vw',
              bottom: '-5%',
              right: '-5%',
              background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
          <div
            className="hero-orb-c absolute rounded-full"
            style={{
              width: '40vw',
              height: '40vw',
              top: '30%',
              right: '10%',
              background: 'radial-gradient(circle, rgba(107,20,38,0.15) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[#d4af37]/25 bg-white/[0.03] shadow-[0_0_60px_rgba(212,175,55,0.08)] sm:h-32 sm:w-32">
              <GauntletLogo
                size="xl"
                className="h-20 w-20 sm:h-24 sm:w-24 drop-shadow-[0_0_20px_rgba(212,175,55,0.18)]"
              />
            </div>
          </div>
          <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-[0.3em] mb-6">
            Season 2025
          </p>
          <h1 className="font-geizer text-5xl sm:text-7xl lg:text-8xl tracking-widest uppercase text-white leading-none mb-4">
            Year One
          </h1>
          <p className="text-white/50 text-lg sm:text-xl mt-4 leading-relaxed max-w-xl mx-auto">
            Two leagues. 24 managers. $12,000 on the line. The inaugural season of the Gauntlet is
            complete.
          </p>
          <p className="mt-5 text-sm uppercase tracking-[0.2em] text-white/45">
            Year Two format is live: three leagues, 36 teams, and an $18,000 prize pool.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href="#return"
              className="w-full sm:w-auto bg-[#8b1538] hover:bg-[#a31621] text-white font-semibold px-8 py-4 rounded text-sm uppercase tracking-widest transition-colors"
            >
              I&apos;m Back for Year Two
            </a>
            <a
              href="#registration"
              className="w-full sm:w-auto border border-[#d4af37] hover:bg-[#d4af37]/10 text-[#d4af37] font-semibold px-8 py-4 rounded text-sm uppercase tracking-widest transition-colors"
            >
              Register for League 3
            </a>
            <Link
              href={RULES_2026_PATH}
              className="w-full sm:w-auto border border-white/15 hover:border-white/30 text-white/80 hover:text-white font-semibold px-8 py-4 rounded text-sm uppercase tracking-widest transition-colors"
            >
              Read the 2026 Rules
            </Link>
          </div>
        </div>
      </section>

      {/* ── BY THE NUMBERS ───────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 text-center">
            By the Numbers
          </p>
          <h2 className="font-geizer text-3xl sm:text-4xl tracking-widest uppercase text-center mb-12">
            Season 2025
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard value="24" label="Managers" />
            <StatCard value="$12,000" label="Prize Pool" />
            <StatCard value="2" label="Leagues" />
            <StatCard value="$500" label="Buy-in" />
            <StatCard
              value={totals ? totals.totalGames.toLocaleString() : '—'}
              label="Matchups Played"
            />
            <StatCard
              value={totals ? Math.round(totals.totalPointsScored).toLocaleString() : '—'}
              label="Total Points Scored"
            />
          </div>
        </div>
      </section>

      {/* ── CHAMPIONS ────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 text-center">
            The Champions
          </p>
          <h2 className="font-geizer text-3xl sm:text-4xl tracking-widest uppercase text-center mb-12">
            Who Took the Crown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ChampionCard
              league={afcChamp?.leagueName ?? 'Gauntlet AFC'}
              champion={afcChamp?.champion.name ?? null}
              runnerUp={afcChamp?.runnerUp.name ?? null}
              thirdPlace={afcChamp?.thirdPlace.name ?? null}
            />
            <ChampionCard
              league={nfcChamp?.leagueName ?? 'Gauntlet NFC'}
              champion={nfcChamp?.champion.name ?? null}
              runnerUp={nfcChamp?.runnerUp.name ?? null}
              thirdPlace={nfcChamp?.thirdPlace.name ?? null}
            />
          </div>
        </div>
      </section>

      {/* ── WHO GOT PAID ─────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 text-center">
            Payouts
          </p>
          <h2 className="font-geizer text-3xl sm:text-4xl tracking-widest uppercase text-center mb-4">
            The Money
          </h2>
          <p className="text-white/50 text-center text-sm mb-12">
            $12,000 in real stakes. Multiple ways to get paid.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: 'Per League (×2)', subtitle: 'AFC & NFC each' },
              { title: 'Cross-League', subtitle: 'Head-to-head competition' },
            ].map((col, i) => (
              <div key={i} className="border border-white/10 rounded-xl p-6 bg-[#0d0d0d]">
                <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-widest mb-1">
                  {col.title}
                </p>
                <p className="text-white/40 text-xs mb-4">{col.subtitle}</p>
                {i === 0 ? (
                  <>
                    <PayoutRow label="Champion" amount="$3,000" />
                    <PayoutRow label="Runner-up" amount="$1,000" />
                    <PayoutRow label="3rd Place" amount="$500" />
                  </>
                ) : (
                  <>
                    <PayoutRow
                      label="Weekly Top Scorer"
                      amount="$1,400"
                      note="$100 per week × 14 regular season weeks"
                    />
                    <PayoutRow
                      label="Interleague Contest"
                      amount="$1,200"
                      note="Week 14 head-to-head · winning league splits $100/team"
                    />
                    <PayoutRow
                      label="Playoff Top Scorer"
                      amount="$400"
                      note="Any team eligible across all 3 playoff weeks"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEASON AWARDS ────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#0d0d0d]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 text-center">
            Season Awards
          </p>
          <h2 className="font-geizer text-3xl sm:text-4xl tracking-widest uppercase text-center mb-12">
            More Ways to Win
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.bestRecords.map(r => (
              <AwardCard
                key={r.leagueId}
                Icon={Trophy}
                award={`${r.leagueName.replace('Gauntlet ', '')} — Best Record`}
                winner={r.managerName ?? 'TBD'}
                detail={`${r.wins}-${r.losses} · ${r.points.toFixed(1)} pts`}
              />
            ))}
            {awards?.allTimeHighScore && (
              <AwardCard
                Icon={Zap}
                award="Highest Single-Week Score"
                winner={awards.allTimeHighScore.managerName}
                detail={`${awards.allTimeHighScore.points.toFixed(2)} pts · Week ${awards.allTimeHighScore.week} (${awards.allTimeHighScore.leagueName.replace('Gauntlet ', '')})`}
              />
            )}
            {awards?.topPointsScorer && (
              <AwardCard
                Icon={TrendingUp}
                award="Most Points, Regular Season"
                winner={awards.topPointsScorer.managerName}
                detail={`${awards.topPointsScorer.points.toFixed(1)} total pts · ${awards.topPointsScorer.leagueName.replace('Gauntlet ', '')}`}
              />
            )}
            {awards?.weeklyWarrior && (
              <AwardCard
                Icon={Swords}
                award="Weekly Warrior"
                winner={awards.weeklyWarrior.managerName}
                detail={`Won top scorer ${awards.weeklyWarrior.wins}× across the league`}
              />
            )}
            {awards?.narrowestVictory && (
              <AwardCard
                Icon={CrosshairIcon}
                award="Razor's Edge"
                winner={awards.narrowestVictory.managerName}
                detail={`Beat ${awards.narrowestVictory.opponentName} by ${awards.narrowestVictory.margin.toFixed(2)} pts · Week ${awards.narrowestVictory.week}`}
              />
            )}
            {awards?.biggestBlowout && (
              <AwardCard
                Icon={Flame}
                award="The Blitz"
                winner={awards.biggestBlowout.managerName}
                detail={`Crushed ${awards.biggestBlowout.opponentName} by ${awards.biggestBlowout.margin.toFixed(2)} pts · Week ${awards.biggestBlowout.week}`}
              />
            )}
            {!data && (
              <>
                <AwardCard
                  Icon={Trophy}
                  award="Best Regular Season Record"
                  winner="TBD"
                  detail="Season data loading..."
                />
                <AwardCard Icon={Zap} award="Highest Single-Week Score" winner="TBD" detail="—" />
                <AwardCard
                  Icon={Swords}
                  award="Weekly Warrior"
                  winner="TBD"
                  detail="Most weekly top scorer wins"
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── YEAR TWO VISION ──────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 text-center">
            Year Two
          </p>
          <h2 className="font-geizer text-3xl sm:text-4xl tracking-widest uppercase text-center mb-4">
            The Gauntlet Expands
          </h2>
          <p className="text-white/50 text-center text-sm max-w-xl mx-auto mb-16">
            Year One proved the concept. Year Two is about building something that lasts — a real
            ecosystem for football fanatics who play to win.
          </p>

          {/* League structure visual */}
          <div className="mb-16">
            <LeagueStructureVisual />
          </div>

          {/* Platform features */}
          <div className="mt-16">
            <p className="text-white/35 text-xs uppercase tracking-widest text-center mb-8">
              What&apos;s already built
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  Icon: Activity,
                  title: 'Live Win Probability',
                  desc: 'Real-time odds charts as games unfold. Watch your lead hold — or evaporate.',
                },
                {
                  Icon: FileText,
                  title: 'Weekly Reports',
                  desc: 'AI-written narrative recaps for every matchup with stats, story, and context.',
                },
                {
                  Icon: BarChart3,
                  title: 'Pre-Game Odds',
                  desc: 'Spreads, projections, and win percentages for every matchup before Sunday.',
                },
                {
                  Icon: DollarSign,
                  title: '$100 Every Week',
                  desc: 'Top scorer across both leagues earns $100. Fourteen chances across the regular season.',
                },
                {
                  Icon: Swords,
                  title: 'Interleague Showdowns',
                  desc: 'Week 14 pits both leagues head-to-head. League pride and $1,200 on the line.',
                },
                {
                  Icon: Trophy,
                  title: 'Hall of Fame',
                  desc: 'Every all-time record tracked — highest score, narrowest win, biggest collapse.',
                },
                {
                  Icon: Target,
                  title: 'Start/Sit Grades',
                  desc: 'See how many points your lineup decisions cost or earned you each week.',
                },
                {
                  Icon: ClipboardList,
                  title: 'Draft Analysis',
                  desc: 'Post-draft grades by position, value picks flagged, efficiency scored.',
                },
              ].map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="border border-white/8 rounded-lg p-4 bg-white/3 hover:border-white/15 hover:bg-white/5 transition-all"
                >
                  <Icon className="w-4 h-4 text-[#d4af37]/50 mb-3" strokeWidth={1.5} />
                  <h3 className="text-white/90 font-semibold text-sm mb-1.5">{title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Backlink to the app */}
            <div className="mt-10 flex items-center justify-center">
              <Link
                href="/archive/2025/competition"
                className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 rounded-lg px-6 py-3 text-white/60 hover:text-white text-sm transition-all group"
              >
                Explore the Year One platform
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY PROPOSALS ──────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#0d0d0d]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-[0.3em] mb-3 text-center">
            Community
          </p>
          <h2 className="font-geizer text-3xl sm:text-4xl tracking-widest uppercase text-center mb-4">
            Shape Year Two
          </h2>
          <p className="text-white/50 text-center text-sm max-w-xl mx-auto mb-12">
            The best ideas come from the people playing. Submit a proposal — if it&apos;s good,
            it&apos;ll show up here for everyone to see.
          </p>

          <Suspense fallback={null}>
            <ProposalsDisplay />
          </Suspense>

          <div className="mt-16 border border-white/10 rounded-xl p-6 sm:p-8">
            <h3 className="text-white font-semibold text-lg mb-1">Submit a Proposal</h3>
            <p className="text-white/40 text-sm mb-6">
              Ideas are reviewed before they go live. Be specific — vague ideas don&apos;t make the
              cut.
            </p>
            <ProposalForm />
          </div>
        </div>
      </section>

      {/* ── 2026 RULES ──────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#0d0d0d]">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-[0.3em] mb-3">
                2026 Rules + Format
              </p>
              <h2 className="font-geizer text-3xl sm:text-4xl tracking-widest uppercase mb-4">
                Year Two Is Officially Taking Shape
              </h2>
              <p className="text-white/50 text-sm leading-7 max-w-2xl">
                The full Year Two rules are now on-site: league structure, promotion and relegation,
                scoring, playoff logic, payout distribution, fees, and commissioner authority. If
                you&apos;re deciding whether to run it back or jump in fresh, this is the document
                to read.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href={RULES_2026_PATH}
                  className="inline-flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#ebb748] text-black font-semibold px-7 py-4 rounded text-sm uppercase tracking-widest transition-colors"
                >
                  Open the 2026 Rules
                  <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                </Link>
                <Link
                  href="/year-in-review#return"
                  className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-semibold px-7 py-4 rounded text-sm uppercase tracking-widest transition-colors"
                >
                  Returning Managers Start Here
                </Link>
              </div>
            </div>

            <div className="border border-white/10 rounded-[1.5rem] bg-white/[0.03] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/40">
                Quick Snapshot
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4">
                {[
                  ['36', 'Teams'],
                  ['3', 'Leagues'],
                  ['$18K', 'Prize Pool'],
                  ['$500', 'Buy-In'],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/8 bg-black/20 px-4 py-4"
                  >
                    <p className="font-geizer text-3xl tracking-wide text-[#d4af37]">{value}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/45">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTAs ───────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-geizer text-3xl sm:text-4xl tracking-widest uppercase text-center mb-4">
            Your Move
          </h2>
          <p className="text-white/50 text-center text-sm mb-16">
            Year Two starts forming now. Spots are limited.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Return */}
            <div
              id="return"
              className="border border-[#8b1538]/50 rounded-xl p-6 sm:p-8 bg-[#8b1538]/5 scroll-mt-24"
            >
              <p className="text-[#8b1538] text-xs font-semibold uppercase tracking-widest mb-1">
                Returning Manager
              </p>
              <h3 className="text-white text-xl font-bold mb-2">I&apos;m Back</h3>
              <p className="text-white/50 text-sm mb-6">
                Confirm your interest in returning. You&apos;ll hear from us before spots open to
                newcomers.
              </p>
              <ReturnForm />
            </div>

            {/* Registration */}
            <div
              id="registration"
              className="border border-[#d4af37]/30 rounded-xl p-6 sm:p-8 bg-[#d4af37]/3 scroll-mt-24"
            >
              <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-widest mb-1">
                New to The Gauntlet
              </p>
              <h3 className="text-white text-xl font-bold mb-2">Register for League 3</h3>
              <p className="text-white/50 text-sm mb-6">
                Think you have what it takes? Register for an open League 3 slot and we&apos;ll
                follow up with next steps.
              </p>
              <RegistrationForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <GauntletLogo size="sm" />
          <span className="font-geizer tracking-widest text-sm text-white/40">THE GAUNTLET</span>
        </div>
        <p className="text-white/30 text-xs">
          High-stakes fantasy football ·{' '}
          <Link href="/archive/2025/competition" className="hover:text-white/60 transition-colors">
            Enter the app
          </Link>
        </p>
      </footer>
    </div>
  );
}
