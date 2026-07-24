import Link from 'next/link';
import { ArrowLeft, Gavel, Shield, Trophy } from 'lucide-react';
import { GauntletLogo } from '@/components/gauntlet-logo';
import {
  rules2026CommissionerPowers,
  rules2026Governance,
  rules2026LeagueOps,
  rules2026Meta,
  rules2026PayoutRows,
  rules2026PlayoffNotes,
  rules2026PromotionNotes,
  rules2026PromotionRows,
  rules2026Roster,
  rules2026Schedule,
  rules2026ScoringGroups,
  rules2026Structure,
  rules2026WeeklyPrizeNotes,
} from '../_content/rules-2026';

export const metadata = {
  title: '2026 Rules & Format — The Gauntlet',
  description:
    'The Year Two format for The Gauntlet: three leagues, 36 teams, promotion and relegation, scoring, playoffs, payouts, and commissioner governance.',
};

const SectionHeading = ({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body?: string;
}) => {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-[0.28em] mb-3">
        {kicker}
      </p>
      <h2 className="font-geizer text-3xl sm:text-4xl tracking-widest uppercase text-white">
        {title}
      </h2>
      {body && <p className="mt-4 text-sm leading-7 text-white/58">{body}</p>}
    </div>
  );
};

const DetailList = ({ items }: { items: string[] }) => {
  return (
    <div className="space-y-3">
      {items.map(item => (
        <div
          key={item}
          className="border border-white/8 bg-white/[0.03] rounded-xl px-4 py-4 text-sm leading-7 text-white/70"
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export default function Rules2026Page() {
  return (
    <div className="min-h-screen bg-[#111] text-white overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#111]/85 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <GauntletLogo size="sm" />
          <span className="hidden sm:block font-geizer tracking-widest text-sm text-white/80">
            THE GAUNTLET
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/year-in-review"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Year in Review
          </Link>
          <a
            href="#full-rules"
            className="inline-flex items-center gap-2 rounded border border-[#d4af37]/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
          >
            Jump to Rules
          </a>
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 pt-28 pb-20 sm:pb-28">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="hero-orb-a absolute rounded-full"
            style={{
              width: '72vw',
              height: '72vw',
              top: '-18%',
              left: '-18%',
              background: 'radial-gradient(circle, rgba(139,21,56,0.2) 0%, transparent 72%)',
              filter: 'blur(48px)',
            }}
          />
          <div
            className="hero-orb-b absolute rounded-full"
            style={{
              width: '46vw',
              height: '46vw',
              top: '12%',
              right: '-8%',
              background: 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, transparent 72%)',
              filter: 'blur(56px)',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_22rem] lg:items-end">
            <div>
              <div className="mb-8 flex items-center gap-5">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#d4af37]/20 bg-white/[0.03] shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                  <GauntletLogo
                    size="xl"
                    className="h-14 w-14 drop-shadow-[0_0_20px_rgba(212,175,55,0.18)]"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-[0.32em]">
                    {rules2026Meta.seasonLabel}
                  </p>
                  <p className="text-white/45 text-sm uppercase tracking-[0.18em]">
                    Foundational Rules + Format
                  </p>
                </div>
              </div>

              <h1 className="max-w-4xl font-geizer text-4xl leading-none tracking-[0.12em] text-white uppercase sm:text-6xl lg:text-7xl">
                {rules2026Meta.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
                {rules2026Meta.subtitle}
              </p>

              <div className="mt-8 inline-flex max-w-3xl items-start gap-3 rounded-2xl border border-[#d4af37]/18 bg-[#d4af37]/[0.05] px-5 py-4 text-sm leading-7 text-white/72">
                <Shield className="mt-1 h-4 w-4 shrink-0 text-[#d4af37]/75" strokeWidth={1.6} />
                <span>{rules2026Meta.banner}</span>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/year-in-review#return"
                  className="inline-flex items-center justify-center gap-2 rounded bg-[#8b1538] px-7 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#a31621]"
                >
                  Returning Manager
                </Link>
                <Link
                  href="/year-in-review#registration"
                  className="inline-flex items-center justify-center gap-2 rounded border border-[#d4af37] px-7 py-4 text-sm font-semibold uppercase tracking-widest text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
                >
                  Register for League 3
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.035] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/42">
                Quick Read
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {rules2026Meta.highlights.map(item => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/8 bg-black/20 px-4 py-5"
                  >
                    <p className="font-geizer text-3xl tracking-wide text-[#d4af37]">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-white/8 pt-6 text-sm leading-7 text-white/58">
                This page is the base layer for all 2026 rule discussions and proposal reviews.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="full-rules" className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            kicker="1. League Description"
            title="How Year Two Is Built"
            body="The Gauntlet is a high-stakes, multi-league fantasy football system. Promotion and relegation are the connective tissue, so each manager is playing for this season and next season at the same time."
          />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <DetailList items={rules2026Structure} />
            <div className="rounded-[1.5rem] border border-white/8 bg-[#0d0d0d] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4af37]">
                Promotion + Relegation
              </p>
              <div className="mt-6 space-y-3">
                {rules2026PromotionRows.map(row => (
                  <div
                    key={row.league}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                      {row.league}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white/60">
                      <span className="text-[#d4af37]">Up:</span> {row.promoted}
                    </p>
                    <p className="text-sm leading-7 text-white/60">
                      <span className="text-[#d4af37]">Down:</span> {row.relegated}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10">
            <DetailList items={rules2026PromotionNotes} />
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-[#0d0d0d] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            kicker="2. Scoring Settings"
            title="Auction Draft, Deep Lineups, Balanced Scoring"
            body="The draft stays auction-based, the benches stay meaningful, and the scoring keeps multiple paths to building a strong team."
          />

          <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <div className="rounded-[1.5rem] border border-[#d4af37]/20 bg-[#d4af37]/[0.04] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4af37]">
                Roster
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {rules2026Roster.map(slot => (
                  <div
                    key={slot}
                    className="rounded-xl border border-white/8 bg-black/20 px-3 py-3 text-sm uppercase tracking-[0.16em] text-white/72"
                  >
                    {slot}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-white/55">
                Draft format: auction, with a $200 budget for every team.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {rules2026ScoringGroups.map(group => (
                <div
                  key={group.title}
                  className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-6"
                >
                  <h3 className="text-lg font-semibold text-white">{group.title}</h3>
                  <div className="mt-4 space-y-2 text-sm leading-7 text-white/62">
                    {group.rows.map(row => (
                      <p key={row}>{row}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            kicker="3–6. League Ops"
            title="Trading, Waivers, Schedule, and Playoff Logic"
            body="A few rules matter more than the rest because they shape the season rhythm. This is the operating backbone."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {rules2026LeagueOps.map(item => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4af37]">
                  {item.title}
                </p>
                <p className="mt-4 text-sm leading-7 text-white/60">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/8 bg-[#0d0d0d] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4af37]">
                Schedule Format
              </p>
              <div className="mt-5 space-y-3">
                {rules2026Schedule.map(item => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/68"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-[#0d0d0d] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4af37]">
                Playoff Structure
              </p>
              <div className="mt-5 space-y-3">
                {rules2026PlayoffNotes.map(item => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/68"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-[#0d0d0d] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            kicker="7. Payout Structure"
            title="Where the $18,000 Goes"
            body="League podiums still matter, but Year Two also pays for weekly performance and full-pool dominance across all 36 teams."
          />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_24rem]">
            <div className="rounded-[1.75rem] border border-[#d4af37]/20 bg-[#d4af37]/[0.04] p-6 sm:p-8">
              <div className="space-y-3">
                {rules2026PayoutRows.map(row => (
                  <div
                    key={row.category}
                    className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-black/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{row.category}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">
                        {row.note}
                      </p>
                    </div>
                    <p className="font-geizer text-3xl tracking-wide text-[#d4af37]">
                      {row.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-6">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-[#d4af37]/70" strokeWidth={1.6} />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
                    Weekly Cross-League Prizes
                  </p>
                </div>
                <div className="mt-5 space-y-3 text-sm leading-7 text-white/64">
                  {rules2026WeeklyPrizeNotes.map(item => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-6 text-sm leading-7 text-white/64">
                All payouts are sent by Wednesday of the week after the qualifying event. Default
                payout method matches the manager&apos;s buy-in method unless another arrangement is
                made.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            kicker="8–10. Governance"
            title="Fees, Rule Changes, and Commissioner Authority"
            body="The system only works if the operating rules are clear and the fallback authority is defined in advance."
          />

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Gavel className="h-5 w-5 text-[#d4af37]/75" strokeWidth={1.6} />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
                  Governance Rules
                </p>
              </div>
              <div className="mt-6 space-y-3">
                {rules2026Governance.map(item => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/8 bg-black/20 px-4 py-4 text-sm leading-7 text-white/66"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/8 bg-[#0d0d0d] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-[#d4af37]/75" strokeWidth={1.6} />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
                  Commissioner Responsibilities
                </p>
              </div>
              <div className="mt-6 space-y-3">
                {rules2026CommissionerPowers.map(item => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/66"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-[1.75rem] border border-[#8b1538]/35 bg-[#8b1538]/[0.08] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4af37]">
              Closing Clause
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/70">
              This document is the base from which all 2026 rule change proposals will be evaluated.
              It defines the starting format for Year Two and the standards managers are agreeing to
              play under.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/year-in-review#return"
                className="inline-flex items-center justify-center gap-2 rounded bg-[#8b1538] px-6 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#a31621]"
              >
                Confirm Your Return
              </Link>
              <Link
                href="/year-in-review#registration"
                className="inline-flex items-center justify-center gap-2 rounded border border-[#d4af37] px-6 py-4 text-sm font-semibold uppercase tracking-widest text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
              >
                Register for League 3
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-12 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <GauntletLogo size="sm" />
          <span className="font-geizer tracking-widest text-sm text-white/40">THE GAUNTLET</span>
        </div>
        <p className="text-xs text-white/30">
          Year Two format locked in here.{' '}
          <Link href="/year-in-review" className="transition-colors hover:text-white/60">
            Back to the year in review
          </Link>
          {' · '}
          <Link href="/archive/2025/competition" className="transition-colors hover:text-white/60">
            Enter the app
          </Link>
        </p>
      </footer>
    </div>
  );
}
