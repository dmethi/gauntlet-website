'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export type TransactionLink = { label: string; href?: string };

export type TransactionViewModel = {
  id: string;
  type: string;
  status?: string;
  createdAt: string;
  adds?: TransactionLink[];
  drops?: TransactionLink[];
  waiverBid?: number | null;
};

function formatTransactionType(type: string) {
  switch (type) {
    case 'free_agent':
      return 'Free Agent';
    case 'waiver':
      return 'Waiver';
    case 'trade':
      return 'Trade';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  }
}

export function TransactionList({ items }: { items: TransactionViewModel[] }) {
  if (!items?.length) {
    return <div className="text-sm text-muted-foreground">No transactions found.</div>;
  }
  return (
    <div className="rounded-md border border-border bg-card px-4 py-1">
      {items.map(t => (
        <div key={t.id} className="py-2 border-b last:border-b-0 border-border/50">
          <div className="flex items-start gap-2 mb-1">
            <span className="font-medium text-sm">{formatTransactionType(t.type)}</span>
            {t.type === 'waiver' && t.waiverBid != null && (
              <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                ${t.waiverBid}
              </span>
            )}
            {t.status && <Badge variant="outline">{t.status}</Badge>}
          </div>

          <div className="text-sm space-y-1">
            {t.adds?.length ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-green-500 dark:text-green-400 font-semibold">+</span>
                <span className="text-muted-foreground">
                  {t.adds.map((a, i) => (
                    <span key={`a-${i}`} className="mr-1">
                      {a.href ? (
                        <Link
                          href={a.href}
                          className="underline underline-offset-2 hover:text-foreground"
                        >
                          {a.label}
                        </Link>
                      ) : (
                        a.label
                      )}
                      {i < (t.adds?.length ?? 0) - 1 ? ',' : ''}
                    </span>
                  ))}
                </span>
              </div>
            ) : null}
            {t.drops?.length ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-red-500 dark:text-red-400 font-semibold">−</span>
                <span className="text-muted-foreground">
                  {t.drops.map((d, i) => (
                    <span key={`d-${i}`} className="mr-1">
                      {d.href ? (
                        <Link
                          href={d.href}
                          className="underline underline-offset-2 hover:text-foreground"
                        >
                          {d.label}
                        </Link>
                      ) : (
                        d.label
                      )}
                      {i < (t.drops?.length ?? 0) - 1 ? ',' : ''}
                    </span>
                  ))}
                </span>
              </div>
            ) : null}
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            {new Date(t.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// Adapter for team page league transactions → view model
export function TeamTransactionsList({
  transactions,
  league,
}: {
  transactions: Array<{
    id: string;
    type: string;
    status: string;
    createdAt: string;
    adds?: Array<{ rosterId: number; players: Array<{ fullName: string }> }>;
    drops?: Array<{ rosterId: number; players: Array<{ fullName: string }> }>;
    settings?: { waiver_bid?: number } | null;
  }>;
  league?: {
    rosters?: Array<{
      id: string | number;
      owner?: {
        metadata?: { team_name?: string };
        displayName?: string;
        username?: string;
      };
    }>;
  };
}) {
  // Create roster ID to team name mapping (with reverse mapping for original IDs)
  const rosterMap = new Map<number, string>();
  if (league?.rosters) {
    league.rosters.forEach((r: any) => {
      const name =
        r?.owner?.metadata?.team_name ||
        r?.owner?.displayName ||
        r?.owner?.username ||
        `Team ${r.id}`;
      // Map unique roster ID (e.g., 1001, 2001)
      rosterMap.set(Number(r.id), name);

      // Map original Sleeper ID: AFC 1001-1012 -> 1-12, NFC 2001-2012 -> 1-12
      const rosterId = Number(r.id);
      let originalId: number;
      if (rosterId >= 2000) {
        originalId = rosterId - 2000; // NFC: 2001 -> 1, 2012 -> 12
      } else if (rosterId >= 1000) {
        originalId = rosterId - 1000; // AFC: 1001 -> 1, 1012 -> 12
      } else {
        originalId = rosterId; // Fallback for old IDs
      }
      rosterMap.set(originalId, name);
    });
  }

  const items: TransactionViewModel[] = (transactions || []).map(t => ({
    id: t.id,
    type: t.type,
    status: t.status,
    createdAt: t.createdAt,
    adds:
      t.adds
        ?.flatMap(a =>
          a.players.map(p => ({
            label: `${p.fullName} to ${rosterMap.get(a.rosterId) || `Team ${a.rosterId}`}`,
          })),
        )
        .filter(Boolean) ?? undefined,
    drops:
      t.drops
        ?.flatMap(d =>
          d.players.map(p => ({
            label: `${p.fullName} from ${rosterMap.get(d.rosterId) || `Team ${d.rosterId}`}`,
          })),
        )
        .filter(Boolean) ?? undefined,
    waiverBid: t.settings?.waiver_bid ?? null,
  }));
  return <TransactionList items={items} />;
}

// Adapter for player-centric transactions (draft modal) → view model
export function PlayerTransactionsList({
  transactions,
}: {
  transactions: Array<{
    id: string;
    type: string;
    status: string;
    createdAt: string;
    addedTo: Array<{ id: number; name: string }>;
    droppedFrom: Array<{ id: number; name: string }>;
    waiver?: { waiver_bid?: number } | unknown;
  }>;
}) {
  const items: TransactionViewModel[] = (transactions || []).map(t => ({
    id: t.id,
    type: t.type,
    status: t.status,
    createdAt: t.createdAt,
    adds: t.addedTo?.map(x => ({ label: `Added to ${x.name}`, href: `/team/${x.id}` })),
    drops: t.droppedFrom?.map(x => ({ label: `Dropped from ${x.name}`, href: `/team/${x.id}` })),
    waiverBid:
      t && typeof t.waiver === 'object' && t.waiver && 'waiver_bid' in (t.waiver as any)
        ? Number((t.waiver as any).waiver_bid)
        : null,
  }));
  return <TransactionList items={items} />;
}
