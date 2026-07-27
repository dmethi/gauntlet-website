'use client';

/**
 * PROTOTYPE — throwaway visual identity exploration, dev-only.
 * Four directions for global nav / page header / loading state, switchable via
 * ?variant=A|B|C|D. All variants are theme-aware (light/dark via the existing
 * --background/--primary CSS vars + ThemeToggle) — none are dark-only.
 * D synthesizes the feedback round: Command Deck's structured header + icon nav,
 * the Aurora/Crest loader combo, and a floating auto-hide rail instead of the
 * persistent sidebar. Not wired into the real app shell — pick a direction, fold
 * the winner into the real layout, then throw this file away.
 */

import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home,
  Scroll,
  Star,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react';
import { GauntletLogo } from '@/components/gauntlet-logo';
import { ThemeToggle } from '@/components/theme-toggle';

const VARIANTS = [
  { key: 'A', name: 'Aurora Glass' },
  { key: 'B', name: 'Command Deck' },
  { key: 'C', name: 'Emblem Crest' },
  { key: 'D', name: 'Command Crest (synthesis)' },
] as const;

type VariantKey = (typeof VARIANTS)[number]['key'];

export default function IdentityPlaygroundPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <IdentitySwitcher />
    </Suspense>
  );
}

const IdentitySwitcher = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get('variant')?.toUpperCase() as VariantKey) || 'A';
  const index = VARIANTS.findIndex(v => v.key === current);
  const active = index === -1 ? VARIANTS[0] : VARIANTS[index];

  const go = (delta: number) => {
    const nextIndex =
      (VARIANTS.findIndex(v => v.key === active.key) + delta + VARIANTS.length) % VARIANTS.length;
    router.replace(`/playground/identity?variant=${VARIANTS[nextIndex].key}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable)
        return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.key]);

  return (
    <>
      {active.key === 'A' && <VariantA />}
      {active.key === 'B' && <VariantB />}
      {active.key === 'C' && <VariantC />}
      {active.key === 'D' && <VariantD />}

      {/* Floating variant switcher — prototype-only chrome */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 rounded-full bg-black text-white px-2 py-2 shadow-2xl ring-2 ring-yellow-400/80">
        <button
          onClick={() => go(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Previous variant"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono px-2 min-w-[9rem] text-center">
          {active.key} — {active.name}
        </span>
        <button
          onClick={() => go(1)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Next variant"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

/* ────────────────────────────────────────────────────────────────
 * Variant A — "Aurora Glass"
 * Soft, motion-forward: blurred glass nav + the year-in-review orb
 * technique, but recolored off theme tokens so it works in both modes.
 * ──────────────────────────────────────────────────────────────── */
const VariantA = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-background/70 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <GauntletLogo size="sm" />
          <span className="font-geizer tracking-widest text-sm">THE GAUNTLET</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hidden sm:block">
            Competition
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hidden sm:block">
            Stats Hub
          </span>
          <ThemeToggle />
        </div>
      </nav>

      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="hero-orb-a absolute rounded-full"
            style={{
              width: '60vw',
              height: '60vw',
              top: '-10%',
              left: '-10%',
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.20) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="hero-orb-b absolute rounded-full"
            style={{
              width: '45vw',
              height: '45vw',
              bottom: '-5%',
              right: '-5%',
              background:
                'radial-gradient(circle, hsl(var(--secondary) / 0.18) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">
            Week 4 · Regular Season
          </p>
          <h1 className="font-geizer text-5xl sm:text-7xl tracking-widest uppercase leading-none mb-4">
            Matchups
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            A soft, glassy header — the year-in-review orb treatment, decoupled from dark mode.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1400);
            }}
            className="mt-8 text-xs font-semibold uppercase tracking-widest bg-gauntlet-crimson hover:opacity-90 text-white px-5 py-2.5 rounded-full transition-opacity"
          >
            Simulate loading
          </button>
        </div>
      </section>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ background: 'hsl(var(--primary) / 0.35)' }}
              />
              <GauntletLogo size="xl" className="relative" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
 * Variant B — "Command Deck"
 * Sharp, structured dashboard header: no blur, a live stat strip,
 * split hero, top progress-bar loader (YouTube-style) + skeletons.
 * ──────────────────────────────────────────────────────────────── */
const VariantB = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent overflow-hidden">
          <motion.div
            className="h-full bg-gauntlet-crimson"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      <div className="border-b border-border bg-card px-6 py-1.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>Season 2 · Week 4 · Live</span>
        <span className="hidden sm:block">3 leagues · 24 managers</span>
      </div>

      <nav className="flex items-center justify-between px-6 py-4 border-b-2 border-gauntlet-crimson bg-background">
        <div className="flex items-center gap-3">
          <GauntletLogo size="sm" />
          <span className="font-geizer tracking-widest text-sm">THE GAUNTLET</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs font-semibold uppercase tracking-widest border-b-2 border-primary pb-1">
            Competition
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Stats Hub
          </span>
          <ThemeToggle />
        </div>
      </nav>

      <section className="px-6 py-14 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center max-w-6xl mx-auto">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3 font-mono">
            /matchups
          </p>
          <h1 className="font-geizer text-5xl sm:text-6xl tracking-widest uppercase leading-none mb-4">
            Matchups
          </h1>
          <p className="text-muted-foreground max-w-md">
            A structured command-center header — data-dense, no motion for motion&apos;s sake.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1400);
            }}
            className="mt-6 text-xs font-semibold uppercase tracking-widest bg-gauntlet-crimson hover:opacity-90 text-white px-5 py-2.5 rounded transition-opacity"
          >
            Simulate loading
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-border rounded-md p-4 h-20 bg-muted/40 animate-pulse"
                />
              ))
            : [
                { label: 'Leader', value: 'Throne', Icon: Trophy },
                { label: 'Top Score', value: '182.4', Icon: Zap },
                { label: 'Closest', value: '1.2 pts', Icon: Swords },
                { label: 'Playoffs In', value: '9 wks', Icon: Trophy },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="border border-border rounded-md p-4 bg-card">
                  <Icon className="w-4 h-4 text-primary mb-2" strokeWidth={1.5} />
                  <p className="font-geizer text-xl tracking-wide">{value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    {label}
                  </p>
                </div>
              ))}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
 * Variant C — "Emblem Crest"
 * Centered, symmetrical, icon-driven: legion glyphs flank a pill nav,
 * a coat-of-arms hero frames the mark, loader is a crest fill-reveal.
 * ──────────────────────────────────────────────────────────────── */
const VariantC = () => {
  const [loading, setLoading] = useState(false);

  const legions = [
    '/leagues/legion-i-throne.svg',
    '/leagues/legion-ii-keep.svg',
    '/leagues/legion-iii-forge.svg',
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pt-6 flex justify-center px-6">
        <nav className="flex items-center gap-5 rounded-full bg-card border border-border shadow-sm px-5 py-2.5">
          <Image src={legions[0]} alt="" width={18} height={18} className="opacity-60" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Competition
          </span>
          <GauntletLogo size="sm" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Stats Hub
          </span>
          <Image src={legions[1]} alt="" width={18} height={18} className="opacity-60" />
          <ThemeToggle />
        </nav>
      </div>

      <section className="relative flex flex-col items-center justify-center text-center px-6 py-20 max-w-2xl mx-auto">
        <div className="relative w-40 h-40 mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
          <div className="absolute inset-3 rounded-full border border-secondary/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            {loading ? (
              <motion.div
                className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <GauntletLogo size="lg" />
            )}
          </div>
          {legions.map((src, i) => {
            const angle = (i / legions.length) * 2 * Math.PI - Math.PI / 2;
            const r = 76;
            return (
              <Image
                key={src}
                src={src}
                alt=""
                width={22}
                height={22}
                className="absolute opacity-70"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * r}px - 11px)`,
                  top: `calc(50% + ${Math.sin(angle) * r}px - 11px)`,
                }}
              />
            );
          })}
        </div>

        <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3">
          Three Legions, One Gauntlet
        </p>
        <h1 className="font-geizer text-4xl sm:text-6xl tracking-widest uppercase leading-none mb-4">
          Matchups
        </h1>
        <p className="text-muted-foreground max-w-sm">
          A centered, crest-like header built from the existing legion glyphs.
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1600);
          }}
          className="mt-8 text-xs font-semibold uppercase tracking-widest bg-gauntlet-crimson hover:opacity-90 text-white px-5 py-2.5 rounded-full transition-opacity"
        >
          Simulate loading
        </button>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
 * Variant D — "Command Crest" (synthesis of feedback round 1)
 * - Header: Command Deck's structured split-hero + stat tiles, but the
 *   nav is icon+label (not text-only) — same glyph language as the
 *   current sidebar (Home, BarChart3, Swords, Star, Scroll, Archive).
 * - Sidebar: replaced with a floating icon rail that lives mostly off
 *   the left edge and slides fully into view on hover — "hidden when
 *   you're not actively on it."
 * - Loader: the Aurora glow-pulse behind the mark + Crest's orbiting
 *   legion glyphs, combined per feedback ("the combination... amazing").
 * ──────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Competition', Icon: Home, href: '#' },
  { label: 'Stats Hub', Icon: BarChart3, href: '#' },
  { label: 'Matchups', Icon: Swords, href: '#' },
  { label: 'Hall of Fame', Icon: Star, href: '#' },
  { label: 'Year in Review', Icon: Scroll, href: '#' },
  { label: '2025 Archive', Icon: Archive, href: '#' },
];

const VariantD = () => {
  const [loading, setLoading] = useState(false);
  const [railOpen, setRailOpen] = useState(false);

  const legions = [
    '/leagues/legion-i-throne.svg',
    '/leagues/legion-ii-keep.svg',
    '/leagues/legion-iii-forge.svg',
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Floating auto-hide rail — pinned at the logo's own top-left position,
          expands downward from there instead of hanging off the edge */}
      <div
        className="fixed top-4 left-4 z-40"
        onMouseEnter={() => setRailOpen(true)}
        onMouseLeave={() => setRailOpen(false)}
      >
        <div className="flex items-center gap-2 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-xl px-3 py-2.5 w-52">
          <GauntletLogo size="sm" />
          <span className="font-geizer tracking-widest text-xs">GAUNTLET</span>
        </div>
        <motion.div
          initial={false}
          animate={
            railOpen
              ? { height: 'auto', opacity: 1, marginTop: 8 }
              : { height: 0, opacity: 0, marginTop: 0 }
          }
          transition={{ duration: 0.22, ease: [0.215, 0.61, 0.355, 1] }}
          className="overflow-hidden rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-xl w-52"
        >
          <div className="flex flex-col gap-1 p-2">
            {NAV_ITEMS.map(({ label, Icon }) => (
              <a
                key={label}
                href="#"
                className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-card-foreground hover:bg-muted/60 transition-colors"
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span>{label}</span>
              </a>
            ))}
            <div className="px-2 pt-1">
              <ThemeToggle />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top bar keeps Command Deck's structure, now icon-led instead of text-only */}
      <div className="border-b border-border bg-card px-6 py-1.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground pl-64">
        <span>Season 2 · Week 4 · Live</span>
        <span className="hidden sm:block">3 leagues · 24 managers</span>
      </div>
      <div className="flex items-center justify-between px-6 py-3 border-b-2 border-gauntlet-crimson bg-background pl-64">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
          <Home className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
          <span className="border-b-2 border-primary pb-1">Competition</span>
        </div>
        <span className="text-[10px] text-muted-foreground hidden md:block">
          hover the logo for navigation
        </span>
      </div>

      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent overflow-hidden">
          <motion.div
            className="h-full bg-gauntlet-crimson"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      <section className="px-6 py-14 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center max-w-6xl mx-auto">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3 font-mono">
            /matchups
          </p>
          <h1 className="font-geizer text-5xl sm:text-6xl tracking-widest uppercase leading-none mb-4">
            Matchups
          </h1>
          <p className="text-muted-foreground max-w-md">
            Command Deck&apos;s structure, icon-led nav, and a floating rail that stays out of the
            way until you reach for it.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1800);
            }}
            className="mt-6 text-xs font-semibold uppercase tracking-widest bg-gauntlet-crimson hover:opacity-90 text-white px-5 py-2.5 rounded transition-opacity"
          >
            Simulate loading
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-border rounded-md p-4 h-20 bg-muted/40 animate-pulse"
                />
              ))
            : [
                { label: 'Leader', value: 'Throne', Icon: Trophy },
                { label: 'Top Score', value: '182.4', Icon: Zap },
                { label: 'Closest', value: '1.2 pts', Icon: Swords },
                { label: 'Playoffs In', value: '9 wks', Icon: Trophy },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="border border-border rounded-md p-4 bg-card">
                  <Icon className="w-4 h-4 text-primary mb-2" strokeWidth={1.5} />
                  <p className="font-geizer text-xl tracking-wide">{value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    {label}
                  </p>
                </div>
              ))}
        </div>
      </section>

      {/* Loader: Aurora's glow-pulse + Crest's orbiting legion glyphs, combined */}
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
                {legions.map((src, i) => {
                  const angle = (i / legions.length) * 2 * Math.PI - Math.PI / 2;
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
