import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, unwrap, unwrapOr, Result } from '../result';

describe('Result type utilities', () => {
  describe('ok', () => {
    it('should create Ok result', () => {
      const result = ok(42);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(42);
      }
    });
  });

  describe('err', () => {
    it('should create Err result', () => {
      const result = err(new Error('test error'));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('test error');
      }
    });
  });

  describe('isOk', () => {
    it('should return true for Ok result', () => {
      const result = ok(42);
      expect(isOk(result)).toBe(true);
    });

    it('should return false for Err result', () => {
      const result = err(new Error('test'));
      expect(isOk(result)).toBe(false);
    });
  });

  describe('isErr', () => {
    it('should return false for Ok result', () => {
      const result = ok(42);
      expect(isErr(result)).toBe(false);
    });

    it('should return true for Err result', () => {
      const result = err(new Error('test'));
      expect(isErr(result)).toBe(true);
    });
  });

  describe('unwrap', () => {
    it('should return value for Ok result', () => {
      const result = ok(42);
      expect(unwrap(result)).toBe(42);
    });

    it('should throw error for Err result', () => {
      const result = err(new Error('test error'));
      expect(() => unwrap(result)).toThrow('test error');
    });
  });

  describe('unwrapOr', () => {
    it('should return value for Ok result', () => {
      const result = ok(42);
      expect(unwrapOr(result, 0)).toBe(42);
    });

    it('should return default for Err result', () => {
      const result: Result<number, Error> = err(new Error('test'));
      expect(unwrapOr(result, 0)).toBe(0);
    });
  });
});

