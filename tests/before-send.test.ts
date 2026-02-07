import { describe, it, expect, vi, beforeEach } from 'vitest';
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
 * Mirrors the beforeSend processing logic from Catcher.formatAndSend
 * Returns: the final payload, or null if event should be dropped
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

  if (!isValidEventPayload(candidate)) {
    return null;
  }

  return candidate;
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

  it('drops event when beforeSend returns true (invalid)', () => {
    const payload = makePayload();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = processBeforeSend(payload, (() => true) as any);

    expect(result).toBeNull();
  });

  it('drops event when beforeSend returns empty object (invalid)', () => {
    const payload = makePayload();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = processBeforeSend(payload, (() => ({})) as any);

    expect(result).toBeNull();
  });

  it('drops event when beforeSend mutates title to empty string', () => {
    const payload = makePayload();
    const result = processBeforeSend(payload, (e) => {
      e.title = '';
    });

    expect(result).toBeNull();
  });

  it('drops event when beforeSend deletes title', () => {
    const payload = makePayload();
    const result = processBeforeSend(payload, (e) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (e as any).title;
    });

    expect(result).toBeNull();
  });

  it('drops event when beforeSend sets backtrace to non-array', () => {
    const payload = makePayload();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = processBeforeSend(payload, (e) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e as any).backtrace = 'not an array';

      return e;
    });

    expect(result).toBeNull();
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
