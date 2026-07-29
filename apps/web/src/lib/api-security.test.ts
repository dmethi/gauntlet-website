import { describe, expect, it } from 'vitest';
import { authorizeBearer, createFixedWindowGate, readBoundedBody } from './api-security';

describe('authorizeBearer', () => {
  it('fails closed without a configured secret', () => {
    expect(authorizeBearer('Bearer presented', undefined)).toBe('misconfigured');
  });

  it('rejects malformed and incorrect credentials', () => {
    expect(authorizeBearer(null, 'configured')).toBe('unauthorized');
    expect(authorizeBearer('Basic configured', 'configured')).toBe('unauthorized');
    expect(authorizeBearer('Bearer ', 'configured')).toBe('unauthorized');
    expect(authorizeBearer('Bearer wrong', 'configured')).toBe('unauthorized');
  });

  it('accepts an exact credential, including non-ASCII secrets', () => {
    expect(authorizeBearer('Bearer configured', 'configured')).toBe('authorized');
    expect(authorizeBearer('Bearer sécure-🔐', 'sécure-🔐')).toBe('authorized');
  });
});

describe('createFixedWindowGate', () => {
  it('enforces limits independently per key and resets at the boundary', () => {
    const gate = createFixedWindowGate({ limit: 2, windowMs: 100 });

    expect(gate.allow('one', 1_000)).toBe(true);
    expect(gate.allow('one', 1_001)).toBe(true);
    expect(gate.allow('one', 1_099)).toBe(false);
    expect(gate.allow('two', 1_099)).toBe(true);
    expect(gate.allow('one', 1_100)).toBe(true);
  });

  it('cleans expired keys but fails closed when all key slots are active', () => {
    const gate = createFixedWindowGate({ limit: 1, windowMs: 100, maxKeys: 1 });

    expect(gate.allow('one', 1_000)).toBe(true);
    expect(gate.allow('two', 1_050)).toBe(false);
    expect(gate.allow('two', 1_100)).toBe(true);
  });
});

describe('readBoundedBody', () => {
  it('reads a chunked body without relying on Content-Length', async () => {
    const body = new globalThis.ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"ok":'));
        controller.enqueue(new TextEncoder().encode('true}'));
        controller.close();
      },
    });

    await expect(readBoundedBody(body, 11)).resolves.toEqual({
      status: 'ok',
      text: '{"ok":true}',
    });
  });

  it('cancels a chunked body as soon as it crosses the byte cap', async () => {
    let cancelled = false;
    const body = new globalThis.ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(6));
      },
      cancel() {
        cancelled = true;
      },
    });

    await expect(readBoundedBody(body, 5)).resolves.toEqual({ status: 'too-large' });
    expect(cancelled).toBe(true);
  });
});
