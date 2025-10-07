import { logger } from '../lib/logger';

/**
 * Current schema version supported by this codebase.
 * Increment on breaking changes to data format.
 */
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Minimum schema version that can be read.
 * Older versions require migration.
 */
export const MIN_SUPPORTED_SCHEMA_VERSION = 1;

/**
 * Schema version validation result.
 */
export interface SchemaValidation {
  valid: boolean;
  requiresMigration: boolean;
  message: string;
}

/**
 * Validate schema version compatibility.
 *
 * @param dataSchemaVersion - Schema version from loaded data
 * @returns Validation result with migration guidance
 */
export const validateSchemaVersion = (dataSchemaVersion: number): SchemaValidation => {
  if (dataSchemaVersion === CURRENT_SCHEMA_VERSION) {
    return {
      valid: true,
      requiresMigration: false,
      message: 'Schema version is current',
    };
  }

  if (dataSchemaVersion < MIN_SUPPORTED_SCHEMA_VERSION) {
    logger.error(
      {
        event: 'schema_version_too_old',
        dataVersion: dataSchemaVersion,
        minSupported: MIN_SUPPORTED_SCHEMA_VERSION,
        current: CURRENT_SCHEMA_VERSION,
      },
      `Variance data schema v${dataSchemaVersion} is too old (minimum: v${MIN_SUPPORTED_SCHEMA_VERSION})`
    );

    return {
      valid: false,
      requiresMigration: true,
      message: `Schema version ${dataSchemaVersion} is no longer supported. Please regenerate variance data.`,
    };
  }

  if (dataSchemaVersion > CURRENT_SCHEMA_VERSION) {
    logger.warn(
      {
        event: 'schema_version_newer',
        dataVersion: dataSchemaVersion,
        current: CURRENT_SCHEMA_VERSION,
      },
      `Variance data schema v${dataSchemaVersion} is newer than supported v${CURRENT_SCHEMA_VERSION}`
    );

    return {
      valid: true,
      requiresMigration: false,
      message: `Data uses newer schema v${dataSchemaVersion}. May have compatibility issues.`,
    };
  }

  // dataSchemaVersion is between MIN_SUPPORTED and CURRENT
  logger.info(
    {
      event: 'schema_version_older_supported',
      dataVersion: dataSchemaVersion,
      current: CURRENT_SCHEMA_VERSION,
    },
    `Variance data schema v${dataSchemaVersion} is supported but older than current v${CURRENT_SCHEMA_VERSION}`
  );

  return {
    valid: true,
    requiresMigration: false,
    message: `Using older schema v${dataSchemaVersion}. Consider regenerating for latest format.`,
  };
};

/**
 * Migration guidance for schema upgrades.
 */
export const getSchemaMigrationGuidance = (fromVersion: number, toVersion: number): string => {
  if (fromVersion === 1 && toVersion === 2) {
    return `
Schema v1 → v2 Migration:
- Added: dataQuality field with metrics
- Added: weeksCovered array
- Added: season number field
- No breaking changes to existing fields

Action: Regenerate variance data with update-variance-models job
Command: pnpm --filter @gauntlet/server run update-variance
    `.trim();
  }

  return `Migration path from v${fromVersion} to v${toVersion} not defined. Please regenerate variance data.`;
};
