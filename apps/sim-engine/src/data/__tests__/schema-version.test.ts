import { describe, it, expect } from 'vitest';
import {
  validateSchemaVersion,
  CURRENT_SCHEMA_VERSION,
  MIN_SUPPORTED_SCHEMA_VERSION,
  getSchemaMigrationGuidance,
} from '../schema-version';

describe('validateSchemaVersion', () => {
  it('should accept current schema version', () => {
    const result = validateSchemaVersion(CURRENT_SCHEMA_VERSION);
    expect(result.valid).toBe(true);
    expect(result.requiresMigration).toBe(false);
    expect(result.message).toContain('current');
  });

  it('should reject schema versions below minimum', () => {
    const result = validateSchemaVersion(MIN_SUPPORTED_SCHEMA_VERSION - 1);
    expect(result.valid).toBe(false);
    expect(result.requiresMigration).toBe(true);
    expect(result.message).toContain('no longer supported');
  });

  it('should accept older supported versions', () => {
    if (MIN_SUPPORTED_SCHEMA_VERSION < CURRENT_SCHEMA_VERSION) {
      const result = validateSchemaVersion(MIN_SUPPORTED_SCHEMA_VERSION);
      expect(result.valid).toBe(true);
      expect(result.requiresMigration).toBe(false);
    }
  });

  it('should warn about newer schema versions', () => {
    const result = validateSchemaVersion(CURRENT_SCHEMA_VERSION + 1);
    expect(result.valid).toBe(true);
    expect(result.requiresMigration).toBe(false);
    expect(result.message).toContain('newer');
  });

  it('should accept schema version 1 (backwards compatibility)', () => {
    const result = validateSchemaVersion(1);
    expect(result.valid).toBe(true);
    expect(result.requiresMigration).toBe(false);
  });
});

describe('getSchemaMigrationGuidance', () => {
  it('should provide migration guidance from v1 to v2', () => {
    const guidance = getSchemaMigrationGuidance(1, 2);
    expect(guidance).toContain('Schema v1 → v2 Migration');
    expect(guidance).toContain('dataQuality');
    expect(guidance).toContain('weeksCovered');
    expect(guidance).toContain('season');
    expect(guidance).toContain('update-variance');
  });

  it('should provide default guidance for unknown migration paths', () => {
    const guidance = getSchemaMigrationGuidance(5, 10);
    expect(guidance).toContain('not defined');
    expect(guidance).toContain('regenerate');
  });
});
