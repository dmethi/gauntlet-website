import { z } from 'zod';
import { NFL_TEAM_CODES } from './constants';

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform(value => value || null);

export const profileInputSchema = z.object({
  identityKey: z.string().trim().min(1).max(160),
  fullName: z.string().trim().min(2).max(80),
  jobTitle: optionalText(100),
  city: optionalText(100),
  favoriteNflTeam: z
    .union([z.enum(NFL_TEAM_CODES), z.literal('')])
    .transform(value => value || null),
  favoritePlayer: optionalText(100),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
