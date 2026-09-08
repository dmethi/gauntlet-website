'use client';

import Image from 'next/image';
import { useState } from 'react';

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0] ?? '')
    .join('')
    .toUpperCase();

export const nflTeamLogoUrl = (team: string): string =>
  `https://sleepercdn.com/images/team_logos/nfl/${team.toLowerCase()}.png`;

export const playerHeadshotUrl = (playerId: string): string =>
  `https://sleepercdn.com/content/nfl/players/${playerId}.jpg`;

export const TeamAvatar = ({
  src,
  name,
  size = 44,
}: {
  src: string | null;
  name: string;
  size?: number;
}) => {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border border-border bg-muted"
      style={{ width: size, height: size }}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={`${name} avatar`}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
          {initials(name)}
        </span>
      )}
    </div>
  );
};

export const NflTeamMark = ({ team, size = 24 }: { team: string | null; size?: number }) => {
  const [failed, setFailed] = useState(false);
  if (!team || failed) return null;
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <Image
        src={nflTeamLogoUrl(team)}
        alt={`${team} logo`}
        fill
        sizes={`${size}px`}
        className="object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
};

export const PlayerPortrait = ({
  playerId,
  playerName,
  nflTeam,
  size = 46,
}: {
  playerId: string;
  playerName: string;
  nflTeam: string | null;
  size?: number;
}) => {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-md bg-muted"
      style={{ width: size, height: size }}
    >
      {!failed ? (
        <Image
          src={playerHeadshotUrl(playerId)}
          alt={`${playerName} headshot`}
          fill
          sizes={`${size}px`}
          className="object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-muted-foreground">
          {initials(playerName)}
        </span>
      )}
      {nflTeam ? (
        <span className="absolute bottom-0 right-0 flex size-5 items-center justify-center rounded-tl bg-background/90 p-0.5">
          <NflTeamMark team={nflTeam} size={16} />
        </span>
      ) : null}
    </div>
  );
};
