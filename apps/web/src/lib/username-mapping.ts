/**
 * Username to Real Name Mapping Utility
 *
 * Provides consistent name resolution for all report generation.
 * Uses the reference mapping generated from Sleeper API data.
 */

import usernameData from '../../data/username-mapping.json';

interface UserMapping {
  userId: string;
  username?: string;
  displayName: string;
  realName: string;
  teamName?: string;
  leagueId: string;
  rosterId: number;
  record?: string;
}

interface UsernameReference {
  generatedAt: string;
  season: string;
  users: UserMapping[];
}

const typedData = usernameData as UsernameReference;

/**
 * Get real name from user ID
 */
export const getRealNameByUserId = (userId: string): string | undefined => {
  const user = typedData.users.find(u => u.userId === userId);
  return user?.realName;
};

/**
 * Get real name from display name
 */
export const getRealNameByDisplayName = (displayName: string): string | undefined => {
  const user = typedData.users.find(u => u.displayName === displayName);
  return user?.realName;
};

/**
 * Get real name from roster ID and league ID
 */
export const getRealNameByRoster = (leagueId: string, rosterId: number): string | undefined => {
  const user = typedData.users.find(u => u.leagueId === leagueId && u.rosterId === rosterId);
  return user?.realName;
};

/**
 * Get real name from team name
 */
export const getRealNameByTeamName = (teamName: string): string | undefined => {
  const user = typedData.users.find(u => u.teamName === teamName);
  return user?.realName;
};

/**
 * Get user mapping by any identifier
 * Tries userId, displayName, teamName, and roster combo
 */
export const getUserMapping = (identifier: {
  userId?: string;
  displayName?: string;
  teamName?: string;
  leagueId?: string;
  rosterId?: number;
}): UserMapping | undefined => {
  if (identifier.userId) {
    const user = typedData.users.find(u => u.userId === identifier.userId);
    if (user) return user;
  }

  if (identifier.displayName) {
    const user = typedData.users.find(u => u.displayName === identifier.displayName);
    if (user) return user;
  }

  if (identifier.teamName) {
    const user = typedData.users.find(u => u.teamName === identifier.teamName);
    if (user) return user;
  }

  if (identifier.leagueId && identifier.rosterId !== undefined) {
    const user = typedData.users.find(
      u => u.leagueId === identifier.leagueId && u.rosterId === identifier.rosterId,
    );
    if (user) return user;
  }

  return undefined;
};

/**
 * Get all users for a specific league
 */
export const getUsersByLeague = (leagueId: string): UserMapping[] => {
  return typedData.users.filter(u => u.leagueId === leagueId);
};

/**
 * Get all user mappings
 */
export const getAllUserMappings = (): UserMapping[] => {
  return typedData.users;
};

/**
 * Get metadata about the mapping
 */
export const getMappingMetadata = (): {
  generatedAt: string;
  season: string;
  totalUsers: number;
} => {
  return {
    generatedAt: typedData.generatedAt,
    season: typedData.season,
    totalUsers: typedData.users.length,
  };
};

/**
 * Export types for use in other modules
 */
export type { UserMapping, UsernameReference };
