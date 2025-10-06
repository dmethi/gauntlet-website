/* eslint-disable prettier/prettier */
/**
 * Result type for functional error handling.
 * Represents either success (Ok) or failure (Err).
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

/**
 * Create a successful Result.
 */
// prettier-ignore
export const ok = <T,>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

/**
 * Create a failed Result.
 */
// prettier-ignore
export const err = <E,>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

/**
 * Check if Result is Ok.
 */
export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } => {
  return result.ok;
};

/**
 * Check if Result is Err.
 */
export const isErr = <T, E>(result: Result<T, E>): result is { ok: false; error: E } => {
  return !result.ok;
};

/**
 * Unwrap Result value or throw error.
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.ok) {
    return result.value;
  }
  throw result.error;
};

/**
 * Unwrap Result value or return default.
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  if (result.ok) {
    return result.value;
  }
  return defaultValue;
};
