import { Prisma } from '@prisma/client';
import type { GauntletProfile } from '@gauntlet/types';
import { webDb } from '@/lib/db';

export interface ProfileWrite {
  clerkUserId: string;
  sleeperUserId: string;
  leagueId: string;
  rosterId: number;
  fullName: string;
  jobTitle: string | null;
  city: string | null;
  favoriteNflTeam: string | null;
  favoritePlayer: string | null;
}

export interface ProfileRepository {
  findByClerkUserId(clerkUserId: string): Promise<GauntletProfile | null>;
  findBySleeperUserId(sleeperUserId: string): Promise<GauntletProfile | null>;
  list(): Promise<GauntletProfile[]>;
  upsert(profile: ProfileWrite): Promise<GauntletProfile>;
}

export const profileRepository: ProfileRepository = {
  findByClerkUserId: clerkUserId => webDb.profile.findUnique({ where: { clerkUserId } }),
  findBySleeperUserId: sleeperUserId => webDb.profile.findUnique({ where: { sleeperUserId } }),
  list: () => webDb.profile.findMany({ orderBy: { fullName: 'asc' } }),
  upsert: profile =>
    webDb.profile.upsert({
      where: { clerkUserId: profile.clerkUserId },
      create: profile,
      update: profile,
    }),
};

export const isProfileIdentityConflict = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
