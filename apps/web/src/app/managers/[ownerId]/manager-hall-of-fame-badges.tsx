'use client';

import Link from 'next/link';
import {
  findManagerHallOfFameBadges,
  type ManagerRosterKey,
  useHallOfFameEnhanced,
} from '@/hooks/useHallOfFameEnhanced';
import { getRankEmoji } from '@/features/hall-of-fame/utils';

export const ManagerHallOfFameBadges = ({
  rosterKeys,
}: {
  rosterKeys: ManagerRosterKey[];
}): JSX.Element | null => {
  const { data, isLoading } = useHallOfFameEnhanced();

  if (isLoading || !data) return null;

  const badges = findManagerHallOfFameBadges(data, rosterKeys);
  if (badges.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-card-foreground mb-4">Hall of Fame</h2>
      <div className="flex flex-wrap gap-2">
        {badges.map(badge => (
          <Link
            key={badge.categoryId}
            href="/hall-of-fame-enhanced"
            className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-xs hover:bg-secondary/20 transition-colors"
          >
            <span className="font-mono">{getRankEmoji(badge.rank)}</span>
            <span className="font-medium">{badge.label}</span>
            <span className="text-muted-foreground">
              &middot; {badge.value} &middot; {badge.season}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
