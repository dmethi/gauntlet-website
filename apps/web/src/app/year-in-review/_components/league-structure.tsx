'use client';

import { useEffect, useState } from 'react';

interface TeamSlot {
  name: string;
  wins: number;
  losses: number;
  pts: number;
  isOpen?: boolean;
  isConfirmed?: boolean;
  isWaitlist?: boolean;
  waitlistPosition?: number;
  divDest?: 1 | 2;
}

interface LeagueBox {
  leagueName: string;
  teams: TeamSlot[];
}

interface Zones {
  divI: { relegation: number };
  divII: { promotion: number; relegation: number };
  divIII: { promotion: number };
}

interface StructureData {
  year1: LeagueBox[];
  year2: {
    divisionI: LeagueBox;
    divisionII: LeagueBox;
    divisionIIIA: LeagueBox;
    divisionIIIB: LeagueBox;
    zones: Zones;
  };
}

// ─── shared ──────────────────────────────────────────────────────────────────

function TierConnector() {
  return (
    <div className="flex items-center gap-2 py-0.5 text-white/18 text-[9px] uppercase tracking-widest select-none">
      <div className="flex-1 border-t border-dashed border-white/8" />
      <span className="shrink-0">↕ promo · relegation</span>
      <div className="flex-1 border-t border-dashed border-white/8" />
    </div>
  );
}

function Skeleton({ rows = 12 }: { rows?: number }) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-[#0d0d0d] animate-pulse">
      <div className="px-3 py-2 border-b border-white/5">
        <div className="h-2.5 bg-white/10 rounded w-20" />
      </div>
      <div className="px-2 py-1.5 space-y-1">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-2 py-1">
            <div className="w-4 h-2.5 bg-white/5 rounded" />
            <div className="flex-1 h-2.5 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── YEAR 1 (shared for both panels, shown once) ──────────────────────────────

function Year1Row({ team, rank }: { team: TeamSlot; rank: number }) {
  const isConfirmed = team.isConfirmed;
  return (
    <div
      className={`flex items-center gap-1.5 py-1 border-b border-white/5 last:border-0 px-1 rounded ${
        isConfirmed ? 'bg-[#ef4444]/12' : ''
      }`}
    >
      <span className="w-4 text-[10px] text-white/25 tabular-nums shrink-0">{rank}</span>
      <span
        className={`flex-1 text-xs truncate ${
          isConfirmed ? 'text-[#f87171]' : 'text-[#d4af37]/70'
        }`}
      >
        {team.name}
      </span>
      <span className="text-[10px] text-white/25 tabular-nums shrink-0">
        {team.wins}–{team.losses}
      </span>
      {isConfirmed && (
        <span className="text-[8px] font-bold uppercase tracking-widest text-[#f87171]/85 shrink-0">
          Back
        </span>
      )}
      {team.divDest && (
        <span
          className={`text-[9px] font-bold shrink-0 ml-0.5 ${team.divDest === 1 ? 'text-[#d4af37]/50' : 'text-white/20'}`}
        >
          {team.divDest === 1 ? '↑I' : '↓II'}
        </span>
      )}
    </div>
  );
}

function Year1Card({
  league,
  accent,
  label,
}: {
  league: LeagueBox;
  accent: string;
  label: string;
}) {
  return (
    <div className={`border ${accent} rounded-lg overflow-hidden bg-[#0d0d0d] flex-1 min-w-0`}>
      <div className="px-3 py-2 border-b border-white/5">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${label}`}>
          {league.leagueName.replace('Gauntlet ', '')}
        </span>
        <span className="text-white/20 text-[10px] ml-1.5">12 teams</span>
      </div>
      <div className="px-2 py-1">
        {league.teams.map((t, i) => (
          <Year1Row key={i} team={t} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

// ─── STRUCTURE panel — individual rows with zone highlighting ────────────────

function ZoneDivider({ label, direction }: { label: string; direction: 'up' | 'down' }) {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <div className="flex-1 h-px border-t border-dashed border-white/12" />
      <span className="text-[9px] font-bold uppercase tracking-widest text-white/25 shrink-0">
        {direction === 'up' ? '↑' : '↓'} {label}
      </span>
      <div className="flex-1 h-px border-t border-dashed border-white/12" />
    </div>
  );
}

type ZoneType = 'promotion' | 'safe' | 'relegation';

function zoneFor(rank: number, promoCutoff?: number, safeEnd?: number): ZoneType {
  if (promoCutoff && rank <= promoCutoff) return 'promotion';
  if (safeEnd && rank > safeEnd) return 'relegation';
  return 'safe';
}

const ZONE_STYLES: Record<ZoneType, { row: string; bar: string; icon: string; iconColor: string }> =
  {
    promotion: {
      row: 'bg-[#22c55e]/8 border-l-2 border-[#22c55e]/35',
      bar: 'bg-[#22c55e]/30',
      icon: '↑',
      iconColor: 'text-[#4ade80]/70',
    },
    safe: { row: 'border-l-2 border-transparent', bar: 'bg-white/10', icon: '', iconColor: '' },
    relegation: {
      row: 'bg-[#ef4444]/8 border-l-2 border-[#ef4444]/30',
      bar: 'bg-[#ef4444]/25',
      icon: '↓',
      iconColor: 'text-[#f87171]/70',
    },
  };

function StructRow({ rank, zone }: { rank: number; zone: ZoneType }) {
  const s = ZONE_STYLES[zone];
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 border-b border-white/5 last:border-0 ${s.row}`}
    >
      <span className="w-5 text-[10px] text-white/25 tabular-nums shrink-0">{rank}</span>
      <div className={`flex-1 h-2 rounded-full ${s.bar}`} />
      {s.icon && <span className={`text-[10px] font-bold shrink-0 ${s.iconColor}`}>{s.icon}</span>}
    </div>
  );
}

function StructCard({
  divLabel,
  accent,
  labelColor,
  teams,
  promoCutoff,
  safeEnd,
  tier = 2,
}: {
  divLabel: string;
  accent: string;
  labelColor: string;
  teams: number;
  promoCutoff?: number;
  safeEnd?: number;
  tier?: 1 | 2 | 3;
}) {
  const tierBorder = tier === 1 ? 'border-2' : tier === 2 ? 'border' : 'border border-dashed';
  const labelSize = tier === 1 ? 'text-[11px]' : tier === 2 ? 'text-[10px]' : 'text-[9px]';
  const rows: React.ReactNode[] = [];

  for (let i = 0; i < teams; i++) {
    const rank = i + 1;
    const zone = zoneFor(rank, promoCutoff, safeEnd);
    const prevZone = i > 0 ? zoneFor(rank - 1, promoCutoff, safeEnd) : zone;

    // Insert zone label when we cross a boundary
    if (i === 0 && zone === 'promotion') {
      rows.push(
        <ZoneDivider key="d-promo" label={`Promotion zone · ${promoCutoff}`} direction="up" />,
      );
    } else if (zone !== prevZone) {
      if (zone === 'safe') {
        rows.push(<ZoneDivider key="d-safe" label="Safe" direction="up" />);
      } else if (zone === 'relegation') {
        rows.push(
          <ZoneDivider
            key="d-rel"
            label={`Relegation zone · ${teams - (safeEnd ?? teams)}`}
            direction="down"
          />,
        );
      }
    }

    rows.push(<StructRow key={rank} rank={rank} zone={zone} />);
  }

  return (
    <div className={`${tierBorder} ${accent} rounded-lg overflow-hidden bg-[#0d0d0d]`}>
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
        <span className={`${labelSize} font-bold uppercase tracking-widest ${labelColor}`}>
          {divLabel}
        </span>
        <span className="text-white/18 text-[9px]">12</span>
      </div>
      <div>{rows}</div>
    </div>
  );
}

// ─── ROSTER panel (chips + CTAs) ─────────────────────────────────────────────

function RosterRow({ team }: { team: TeamSlot }) {
  if (team.isOpen) {
    return (
      <a
        href="#waitlist"
        className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 last:border-0 bg-[#d4af37]/4 hover:bg-[#d4af37]/10 transition-colors group"
      >
        <span className="text-[#d4af37]/40 text-[9px] italic">Open</span>
        <span className="text-[#d4af37] text-[9px] font-bold uppercase tracking-wide group-hover:translate-x-0.5 transition-transform">
          Waitlist →
        </span>
      </a>
    );
  }
  if (team.isWaitlist) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 last:border-0 bg-[#d4af37]/8">
        <span className="text-[10px] truncate text-[#f3d37a]">{team.name}</span>
        <span className="text-[9px] font-bold uppercase tracking-wide text-[#d4af37]/65">
          Waitlist {team.waitlistPosition}
        </span>
      </div>
    );
  }

  const bg = team.isConfirmed ? 'bg-[#ef4444]/10' : '';
  const color = team.isConfirmed ? 'text-[#f87171]' : 'text-[#d4af37]/65';
  return (
    <div
      className={`flex items-center justify-between px-3 py-1.5 border-b border-white/5 last:border-0 ${bg}`}
    >
      <span className={`text-[10px] truncate ${color}`}>{team.name}</span>
      {team.isConfirmed && (
        <span className="text-[9px] font-bold uppercase tracking-wide text-[#f87171]/80">
          Confirmed
        </span>
      )}
    </div>
  );
}

function RosterCard({
  divLabel,
  accent,
  labelColor,
  teams,
  tier = 2,
}: {
  divLabel: string;
  accent: string;
  labelColor: string;
  teams: TeamSlot[];
  tier?: 1 | 2 | 3;
}) {
  const tierBorder = tier === 1 ? 'border-2' : tier === 2 ? 'border' : 'border border-dashed';
  const labelSize = tier === 1 ? 'text-[11px]' : tier === 2 ? 'text-[10px]' : 'text-[9px]';
  return (
    <div className={`${tierBorder} ${accent} rounded-lg overflow-hidden bg-[#0d0d0d]`}>
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
        <span className={`${labelSize} font-bold uppercase tracking-widest ${labelColor}`}>
          {divLabel}
        </span>
        <span className="text-white/18 text-[9px]">12</span>
      </div>
      <div>
        {teams.map((t, i) => (
          <RosterRow key={i} team={t} />
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function LeagueStructureVisual() {
  const [data, setData] = useState<StructureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<'structure' | 'roster'>('structure');

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      fetch('/api/year-in-review/league-structure', { cache: 'no-store' })
        .then(r => r.json())
        .then(d => d.ok && setData(d.data))
        .finally(() => setLoading(false));
    };

    const handleRefresh = () => loadData();

    loadData();
    window.addEventListener('year-in-review:refresh-structure', handleRefresh);

    return () => {
      window.removeEventListener('year-in-review:refresh-structure', handleRefresh);
    };
  }, []);

  const z = data?.year2.zones;

  // Shared narrow-cube pyramid layout
  const CUBE_W = 'w-48'; // 192px — all cubes same width
  const D3_W = 'w-40'; // 160px — D3 cubes slightly narrower

  const structurePanel = loading ? (
    <div className="flex flex-col items-center gap-2">
      <div className={`${CUBE_W} animate-pulse`}>
        <Skeleton rows={12} />
      </div>
      <div className={`${CUBE_W} animate-pulse`}>
        <Skeleton rows={12} />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center gap-2">
      <div className={CUBE_W}>
        <StructCard
          divLabel="Division I"
          accent="border-[#d4af37]/55"
          labelColor="text-[#d4af37]/80"
          teams={12}
          safeEnd={z?.divI.relegation ?? 6}
          tier={1}
        />
      </div>
      <TierConnector />
      <div className={CUBE_W}>
        <StructCard
          divLabel="Division II"
          accent="border-[#ef4444]/30"
          labelColor="text-[#ef4444]/60"
          teams={12}
          promoCutoff={z?.divII.promotion ?? 6}
          safeEnd={z?.divII.relegation ?? 6}
          tier={2}
        />
      </div>
      <TierConnector />
      <div className="flex gap-2">
        {['Div III A', 'Div III B'].map(name => (
          <div key={name} className={D3_W}>
            <StructCard
              divLabel={name}
              accent="border-white/15"
              labelColor="text-white/35"
              teams={12}
              promoCutoff={z?.divIII.promotion ?? 3}
              tier={3}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const rosterPanel = loading ? (
    <div className="flex flex-col items-center gap-2">
      <div className={`${CUBE_W} animate-pulse`}>
        <Skeleton rows={12} />
      </div>
      <div className={`${CUBE_W} animate-pulse`}>
        <Skeleton rows={12} />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center gap-2">
      <div className={CUBE_W}>
        <RosterCard
          divLabel="Division I"
          accent="border-[#d4af37]/55"
          labelColor="text-[#d4af37]/80"
          teams={data!.year2.divisionI.teams}
          tier={1}
        />
      </div>
      <TierConnector />
      <div className={CUBE_W}>
        <RosterCard
          divLabel="Division II"
          accent="border-[#ef4444]/30"
          labelColor="text-[#ef4444]/60"
          teams={data!.year2.divisionII.teams}
          tier={2}
        />
      </div>
      <TierConnector />
      <div className="flex gap-2">
        {[data!.year2.divisionIIIA, data!.year2.divisionIIIB].map((league, i) => (
          <div key={i} className={D3_W}>
            <RosterCard
              divLabel={i === 0 ? 'Div III A' : 'Div III B'}
              accent="border-white/15"
              labelColor="text-white/35"
              teams={league.teams}
              tier={3}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* ── YEAR 1 ── */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[#d4af37] text-[10px] font-bold uppercase tracking-widest">
            Year 1 — 2025 Season
          </span>
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/25 text-[10px]">24 managers · 2 leagues</span>
        </div>
        {/* Stack on mobile, side by side on sm+ */}
        <div className="flex flex-col sm:flex-row gap-3">
          {loading ? (
            <>
              <Skeleton />
              <Skeleton />
            </>
          ) : (
            data?.year1.map((league, i) => (
              <Year1Card
                key={i}
                league={league}
                accent={i === 0 ? 'border-[#d4af37]/35' : 'border-[#ef4444]/20'}
                label={i === 0 ? 'text-[#d4af37]/65' : 'text-[#ef4444]/45'}
              />
            ))
          )}
        </div>
      </div>

      {/* Year 2 divider */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-white/8" />
        <div className="relative bg-[#111] px-4 flex items-center gap-2">
          <div className="w-px h-5 bg-[#d4af37]/30" />
          <span className="text-[#d4af37]/55 text-[10px] font-bold uppercase tracking-widest">
            Year 2 Expansion
          </span>
          <div className="w-px h-5 bg-[#d4af37]/30" />
        </div>
      </div>

      {/* ── YEAR 2 ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[#d4af37] text-[10px] font-bold uppercase tracking-widest">
            Year 2 — 2026 Season
          </span>
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/25 text-[10px]">48 managers · 4 leagues</span>
        </div>

        {/* Mobile tab switcher — hidden on lg+ */}
        <div className="flex lg:hidden border border-white/10 rounded-lg p-1 mb-4 gap-1">
          {(['structure', 'roster'] as const).map(panel => (
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              className={`flex-1 py-2 rounded text-xs font-semibold uppercase tracking-widest transition-colors ${
                activePanel === panel
                  ? 'bg-white/10 text-white'
                  : 'text-white/35 hover:text-white/60'
              }`}
            >
              {panel === 'structure' ? 'Structure' : 'Roster'}
            </button>
          ))}
        </div>

        {/* Mobile: single active panel */}
        <div className="lg:hidden">
          {activePanel === 'structure' ? structurePanel : rosterPanel}
        </div>

        {/* Desktop: side-by-side panels with headers */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-6 mb-2">
            {['Structure', 'Roster'].map(label => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">
                  {label}
                </span>
                <div className="flex-1 h-px bg-white/8" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>{structurePanel}</div>
            <div>{rosterPanel}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-4 text-[10px] uppercase tracking-widest text-white/30">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/30" />
            Returning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/30" />
            Confirmed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#d4af37]/25 border border-[#d4af37]/40" />
            Waitlist
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded border border-[#d4af37]/30 inline-block" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#4ade80]/50">↑</span> Promotion
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-red-400/40">↓</span> Relegation
          </span>
        </div>
      </div>
    </div>
  );
}
