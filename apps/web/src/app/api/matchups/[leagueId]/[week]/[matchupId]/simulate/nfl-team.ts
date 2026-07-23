export const normalizeNflTeamAbbreviation = (abbreviation?: string | null): string | undefined => {
  if (!abbreviation) return undefined;
  // Normalize various provider codes to a consistent set (prefer ESPN/Sleeper modern codes)
  const mapping: Record<string, string> = {
    // Washington / Jacksonville
    WSH: 'WAS',
    JAC: 'JAX',
    // Legacy franchises
    SD: 'LAC',
    STL: 'LAR',
    OAK: 'LV',
    // Occasionally-seen alternates
    LVR: 'LV',
    GBP: 'GB',
    KCC: 'KC',
    SFO: 'SF',
    TAM: 'TB',
    NOR: 'NO',
    NWE: 'NE',
    // Ambiguous LA fallback (rare in data but safe)
    LA: 'LAR',
  };
  return mapping[abbreviation] || abbreviation;
};
