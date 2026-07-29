import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Shared authorization guard for cron route handlers.
 *
 * Both cron endpoints previously used `if (cronSecret && authHeader !== ...)`,
 * which fails *open*: with `CRON_SECRET` unset, any caller could trigger a live
 * odds snapshot or a paid AI recap generation by fetching the URL. This guard
 * fails closed instead.
 *
 * The two outcomes are deliberately distinct:
 *
 * - **503** when `CRON_SECRET` is absent. That is a deployment misconfiguration,
 *   not a client error, and a 401 would send the operator looking for a bad
 *   token instead of a missing environment variable.
 * - **401** when the bearer is wrong or absent. The caller is at fault.
 *
 * @returns a response to short-circuit with, or `null` when the request is
 *   authorized.
 */
export const requireCronAuth = (request: NextRequest): NextResponse | null => {
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (!cronSecret) {
    console.error('[cron-auth] CRON_SECRET is not configured; refusing to run the job.');
    return NextResponse.json({ error: 'Cron authentication is not configured' }, { status: 503 });
  }

  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
};
