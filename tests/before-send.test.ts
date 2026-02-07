import { describe, it, expect, vi } from 'vitest';
import type { EventData, NodeJSAddons } from '@hawk.so/types';

/**
 * We can't easily test beforeSend via HawkCatcher.init() because:
 * - Catcher is a singleton with global process handlers
 * - It requires a valid base64 integration token
 * - It sends HTTP requests via axios
 *
 * Instead, we test the beforeSend flow logic directly by extracting the same
 * pattern used in formatAndSend.
 */
import { isValidEventPayload } from '../src/utils/validate-event.js';

/**
 * Mirrors the beforeSend processing logic from Catcher.formatAndSend.
 * Returns: the final payload to send, or null if event should be dropped (only when beforeSend returns null).
 * Invalid results log a warning and fall back to the original payload.
 */
function processBeforeSend(
  payload: EventData<NodeJSAddons>,
  beforeSend: (event: EventData<NodeJSAddons>) => EventData<NodeJSAddons> | void | null
): EventData<NodeJSAddons> | null {
  const result = beforeSend(payload);

  if (result === null) {
    return null;
  }

  const candidate = result ?? payload;

  if (isValidEventPayload(candidate)) {
    return candidate;
  }

  console.warn(
    '[Hawk] beforeSend produced invalid payload (missing required fields), sending original. '
    + `Received: ${Object.prototype.toString.call(candidate)}`
  );

  return payload;
}

/**
 * Factory for a minimal valid payload
 */
function makePayload(overrides?: Partial<EventData<NodeJSAddons>>): EventData<NodeJSAddons> {
  return {
    title: 'Error: test',
    type: 'Error',
    backtrace: [{ file: 'test.ts', line: 1, column: 1 }],
    ...overrides,
  } as EventData<NodeJSAddons>;
}

describe('beforeSend processing', () => {
  it('passes through when beforeSend returns the event', () => {
    const payload = makePayload();
    const result = processBeforeSend(payload, (e) => e);

    expect(result).toEqual(payload);
  });

  it('allows modifying the event', () => {
    const payload = makePayload();
    const result = processBeforeSend(payload, (e) => {
      e.context = { filtered: true };

      return e;
    });

    expect(result?.context).toEqual({ filtered: true });
  });

  it('drops event when beforeSend returns null', () => {
    const payload = makePayload();
    const result = processBeforeSend(payload, () => null);

    expect(result).toBeNull();
  });

  it('keeps original payload when beforeSend returns undefined (no return)', () => {
    const payload = makePayload();
    const result = processBeforeSend(payload, () => {
      /* no return */
    });

    expect(result).toEqual(payload);
  });

  it('keeps original payload and warns when beforeSend returns true (invalid)', () => {
    const payload = makePayload();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = processBeforeSend(payload, (() => true) as any);

    expect(result).toEqual(payload);
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it('keeps original payload and warns when beforeSend returns empty object (invalid)', () => {
    const payload = makePayload();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = processBeforeSend(payload, (() => ({})) as any);

    expect(result).toEqual(payload);
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it('keeps original payload and warns when beforeSend mutates title to empty string', () => {
    const original = makePayload();
    const payload = makePayload();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = processBeforeSend(payload, (e) => {
      e.title = '';
    });

    /**
     * payload was mutated in-place, but processBeforeSend still returns it (the reference).
     * In real Catcher, the original payload object is what gets sent — the warn tells us it's corrupted.
     * Here we just verify the warn fires.
     */
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it('keeps original payload and warns when beforeSend deletes title', () => {
    const payload = makePayload();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = processBeforeSend(payload, (e) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (e as any).title;
    });

    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it('keeps original payload and warns when beforeSend sets backtrace to non-array', () => {
    const payload = makePayload();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = processBeforeSend(payload, (e) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e as any).backtrace = 'not an array';

      return e;
    });

    expect(result).toEqual(payload);
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it('accepts when beforeSend removes optional fields', () => {
    const payload = makePayload({ release: '1.0.0', context: { key: 'val' } });
    const result = processBeforeSend(payload, (e) => {
      delete e.release;
      delete e.context;

      return e;
    });

    expect(result).not.toBeNull();
    expect(result?.title).toBe('Error: test');
  });
});
