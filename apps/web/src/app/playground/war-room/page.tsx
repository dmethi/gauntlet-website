'use client';

/**
 * PROTOTYPE — throwaway "Modern War Room" pilot, dev-only.
 * Visualizes the new design-system direction (packages/tokens + globals.css
 * already updated) against a realistic Competition-overview layout, fed by
 * mock data so it's not coupled to real fetching. Structural reference is
 * the shared design-system board; nav is anchored top-left, legion cards +
 * stat row + matchups + activity feed mirror the real /competition page's
 * shape. Not wired into the real route — this is a look/feel check only.
 */

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  BarChart3,
  Crown,
  Home,
  Moon,
  Scroll,
  Star,
  Sun,
  Swords,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import { GauntletLogo } from '@/components/gauntlet-logo';
import { Badge } from '@/components/ui/badge';

export default function WarRoomPlaygroundPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  return <CompetitionPilot />;
}

const NAV_ITEMS = [
  { label: 'Competition', Icon: Home, active: true },
  { label: 'Stats Hub', Icon: BarChart3 },
  { label: 'Matchups', Icon: Swords },
  { label: 'Hall of Fame', Icon: Star },
  { label: 'Year in Review', Icon: Scroll },
  { label: 'Archive', Icon: Archive },
];

const LEGIONS = [
  {
    name: 'Legion I: The Throne',
    tier: 1,
    standings: [
      { rank: 1, team: 'dmethi', record: '0-0-0', pf: 0, pa: 0, pts: 0 },
      { rank: 2, team: 'Team 2', record: '0-0-0', pf: 0, pa: 0, pts: 0 },
      { rank: 3, team: 'Team 3', record: '0-0-0', pf: 0, pa: 0, pts: 0 },
    ],
  },
  {
    name: 'Legion II: The Keep',
    tier: 2,
    standings: [
      { rank: 1, team: 'dmethi', record: '0-0-0', pf: 0, pa: 0, pts: 0 },
      { rank: 2, team: 'Team 2', record: '0-0-0', pf: 0, pa: 0, pts: 0 },
      { rank: 3, team: 'Team 3', record: '0-0-0', pf: 0, pa: 0, pts: 0 },
    ],
  },
  {
    name: 'Legion III: The Forge',
    tier: 3,
    standings: [
      { rank: 1, team: 'dmethi', record: '0-0-0', pf: 0, pa: 0, pts: 0 },
      { rank: 2, team: 'Team 2', record: '0-0-0', pf: 0, pa: 0, pts: 0 },
      { rank: 3, team: 'Team 3', record: '0-0-0', pf: 0, pa: 0, pts: 0 },
    ],
  },
];

const STAT_TILES = [
  { label: 'Teams', value: '36', Icon: Users },
  { label: 'Leagues', value: '3', Icon: Trophy },
  { label: 'Points For', value: '108', Icon: BarChart3 },
  { label: 'Prize Pool', value: '$18,000', Icon: Wallet },
  { label: 'Buy-In', value: '$550', Icon: Wallet },
];

const MATCHUPS = [
  {
    legion: 'Legion I',
    home: 'Karma Krew',
    away: 'Gridiron Ghosts',
    homeScore: 126.4,
    awayScore: 102.36,
    time: 'Sun 1:00 PM',
  },
  {
    legion: 'Legion II',
    home: 'Red Zone Renegades',
    away: '4th & Chaos',
    homeScore: 118.22,
    awayScore: 97.58,
    time: 'Sun 1:00 PM',
  },
  {
    legion: 'Legion III',
    home: 'Forged in Fire',
    away: 'No Mercy',
    homeScore: 93.14,
    awayScore: 105.87,
    time: 'Sun 1:00 PM',
  },
];

const ACTIVITY = [
  { text: 'dmethi made a roster move', time: '4m ago' },
  { text: 'Team 2 claimed a waiver', time: '12m ago' },
  { text: 'Team 3 updated lineup', time: '18m ago' },
  { text: 'Team 4 made a trade', time: '24m ago' },
];

const legionIcons = [
  '/leagues/legion-i-throne.svg',
  '/leagues/legion-ii-keep.svg',
  '/leagues/legion-iii-forge.svg',
];

const tierColor = (tier: number) =>
  tier === 1
    ? 'text-primary border-primary/40'
    : tier === 2
      ? 'text-secondary border-secondary/40'
      : 'text-muted-foreground border-border';

const ThemeToggleButton = ({ floating }: { floating?: boolean }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={
        floating
          ? 'fixed top-4 right-4 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-xl text-muted-foreground hover:text-card-foreground transition-colors'
          : 'flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-card-foreground hover:bg-muted/60 transition-colors'
      }
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

const CompetitionPilot = () => {
  const [railOpen, setRailOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const simulateLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop: a real sticky top bar, in normal document flow — this is
          the page's anchor. Hidden below md, where there's no room for it. */}
      <div className="hidden md:flex sticky top-0 z-40 items-center justify-between px-6 py-3 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <GauntletLogo size="sm" />
          <nav className="flex items-center gap-6">
            {NAV_ITEMS.map(({ label, Icon, active }) => (
              <a
                key={label}
                href="#"
                className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest pb-1 border-b-2 transition-colors ${
                  active
                    ? 'text-foreground border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live
          </span>
          <ThemeToggleButton />
        </div>
      </div>

      {/* Mobile: floating logo trigger — click/tap opens a drawer over a
          backdrop instead of reserving layout space (no room for a full bar). */}
      <div className="md:hidden">
        <button
          onClick={() => setRailOpen(o => !o)}
          aria-label={railOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={railOpen}
          className="fixed top-4 left-4 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-xl"
        >
          <GauntletLogo size="sm" />
        </button>
        <ThemeToggleButton floating />

        <AnimatePresence>
          {railOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setRailOpen(false)}
                className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
              />
              <motion.nav
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.215, 0.61, 0.355, 1] }}
                className="fixed top-4 left-4 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
              >
                <div className="flex flex-col gap-1 p-2">
                  {NAV_ITEMS.map(({ label, Icon, active }) => (
                    <a
                      key={label}
                      href="#"
                      className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors ${
                        active
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                      <span>{label}</span>
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                    </a>
                  ))}
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Page header — title + the two actions that actually do something here.
          Visual weight comes from a crest watermark, an accent rule, and a
          divider — not more text. */}
      <header className="relative overflow-hidden border-b border-border">
        <Image
          src="/gauntlet_logo.svg"
          alt=""
          width={280}
          height={280}
          className="pointer-events-none select-none absolute -right-10 -top-16 opacity-[0.04] dark:opacity-[0.06] grayscale"
        />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.215, 0.61, 0.355, 1] }}
          className="relative px-6 pt-20 md:pt-8 pb-6 max-w-7xl mx-auto"
        >
          <span className="block w-10 h-1 bg-primary rounded-full mb-3" />
          <h1 className="font-geizer text-4xl sm:text-6xl tracking-widest uppercase leading-none">
            Competition
          </h1>
        </motion.div>
      </header>

      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      <main className="px-6 pt-10 pb-16 max-w-7xl mx-auto space-y-10">
        {/* Legion cards */}
        <section className="grid md:grid-cols-3 gap-4">
          {LEGIONS.map((legion, i) => (
            <div key={legion.name} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Image src={legionIcons[i]} alt="" width={20} height={20} />
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    {legion.name}
                  </span>
                </div>
                <Badge variant="outline" className={`text-[10px] ${tierColor(legion.tier)}`}>
                  Tier {legion.tier}
                </Badge>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Season 2026 Standings
              </p>
              <table className="w-full text-xs tabular-nums">
                <tbody>
                  {legion.standings.map(row => (
                    <tr key={row.rank} className="border-t border-border first:border-0">
                      <td className="py-1.5 pr-2 text-muted-foreground w-5">{row.rank}</td>
                      <td className="py-1.5 font-medium">{row.team}</td>
                      <td className="py-1.5 text-right text-muted-foreground">{row.record}</td>
                      <td className="py-1.5 pl-3 text-right font-semibold">{row.pts.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-primary hover:underline">
                Full standings →
              </button>
            </div>
          ))}
        </section>

        {/* Stat tiles */}
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-4 h-20 bg-muted/40 animate-pulse"
                />
              ))
            : STAT_TILES.map(({ label, value, Icon }) => (
                <div key={label} className="rounded-lg border border-border bg-card p-4">
                  <Icon className="w-4 h-4 text-primary mb-2" strokeWidth={1.5} />
                  <p className="font-geizer text-xl tracking-wide tabular-nums">{value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    {label}
                  </p>
                </div>
              ))}
        </section>

        {/* Matchups + activity */}
        <section className="grid md:grid-cols-[1.6fr_1fr] gap-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest">
                Upcoming Matchups <span className="text-muted-foreground">· Week 1</span>
              </span>
              <button className="text-[10px] font-semibold uppercase tracking-widest text-primary hover:underline">
                View all →
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {MATCHUPS.map(m => (
                <div key={m.legion} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {m.legion}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{m.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium truncate">{m.home}</span>
                    <span className="tabular-nums font-semibold text-primary">
                      {m.homeScore.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate">{m.away}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {m.awayScore.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground/70 mt-2">
                    Projected
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest">
                Recent Activity
              </span>
              <button className="text-[10px] font-semibold uppercase tracking-widest text-primary hover:underline">
                View all →
              </button>
            </div>
            <div className="space-y-3">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5 text-secondary shrink-0" strokeWidth={1.5} />
                    <span>{a.text}</span>
                  </div>
                  <span className="text-muted-foreground shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <button
          onClick={simulateLoad}
          className="text-xs font-semibold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded transition-opacity"
        >
          Simulate loading
        </button>
      </main>

      {/* Loader: aurora glow-pulse + orbiting legion crests */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="relative w-40 h-40">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: 'hsl(var(--primary) / 0.35)' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <GauntletLogo size="lg" />
              </div>
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              >
                {legionIcons.map((src, i) => {
                  const angle = (i / legionIcons.length) * 2 * Math.PI - Math.PI / 2;
                  const r = 76;
                  return (
                    <motion.div
                      key={src}
                      className="absolute"
                      style={{
                        left: `calc(50% + ${Math.cos(angle) * r}px - 11px)`,
                        top: `calc(50% + ${Math.sin(angle) * r}px - 11px)`,
                      }}
                      animate={{ rotate: -360 }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    >
                      <Image src={src} alt="" width={22} height={22} className="opacity-80" />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
