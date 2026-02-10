import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Buffer } from 'buffer';
import HawkCatcher from '../src/index.js';
import type { HawkNodeJSInitialSettings } from '../types/index.js';
import axios from 'axios';
import type { EventData, NodeJSAddons } from '@hawk.so/types';

/**
 * beforeSend hook type extracted from settings
 */
type BeforeSendHook = NonNullable<HawkNodeJSInitialSettings['beforeSend']>;

/**
 * Valid base64-encoded integration token for tests
 */
const TEST_TOKEN = Buffer.from(JSON.stringify({ integrationId: 'test-integration' })).toString('base64');

/**
 * Mock axios so no real HTTP requests are made
 */
vi.mock('axios', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ status: 200 })),
  },
}));

/**
 * Helper: init HawkCatcher with a given beforeSend hook
 */
function initWithBeforeSend(beforeSend: BeforeSendHook): void {
  HawkCatcher.init({
    token: TEST_TOKEN,
    disableGlobalErrorsHandling: true,
    beforeSend,
  });
}

/**
 * Extract the payload that was sent via axios.post
 */
function getSentPayload(): EventData<NodeJSAddons> {
  const call = vi.mocked(axios.post).mock.calls[0];

  return (call[1] as { payload: EventData<NodeJSAddons> }).payload;
}

describe('beforeSend processing', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.mocked(axios.post).mockClear();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('sends event as is when beforeSend does not change it', () => {
    initWithBeforeSend((event) => event);

    HawkCatcher.send(new Error('test'));

    expect(axios.post).toHaveBeenCalledOnce();

    const payload = getSentPayload();

    expect(payload.title).toBe('Error: test');
    expect(payload.backtrace).toBeInstanceOf(Array);
  });

  it('sends modified event when beforeSend returns modified payload', () => {
    initWithBeforeSend((event) => {
      event.context = { filtered: true };

      return event;
    });

    HawkCatcher.send(new Error('test'));

    expect(axios.post).toHaveBeenCalledOnce();

    const payload = getSentPayload();

    expect(payload.title).toBe('Error: test');
    expect(payload.context).toEqual({ filtered: true });
  });

  it('drops event when beforeSend returns false', () => {
    initWithBeforeSend(() => false);

    HawkCatcher.send(new Error('test'));

    expect(axios.post).not.toHaveBeenCalled();
  });

  it('sends original payload and warns when beforeSend returns undefined (no return)', () => {
    initWithBeforeSend(() => {
      /* no return */
    });

    HawkCatcher.send(new Error('test-undefined'));

    expect(axios.post).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(
      '[Hawk] Invalid beforeSend value: (undefined). It should return event or false. Event is sent without changes.'
    );

    const payload = getSentPayload();

    expect(payload.title).toBe('Error: test-undefined');
    expect(payload.backtrace).toBeInstanceOf(Array);
  });

  it('sends original payload and warns when beforeSend returns null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initWithBeforeSend((() => null) as any);

    HawkCatcher.send(new Error('test-null'));

    expect(axios.post).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(
      '[Hawk] Invalid beforeSend value: (null). It should return event or false. Event is sent without changes.'
    );

    const payload = getSentPayload();

    expect(payload.title).toBe('Error: test-null');
    expect(payload.backtrace).toBeInstanceOf(Array);
  });

  it('sends original payload and warns when beforeSend returns invalid value', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initWithBeforeSend((() => true) as any);

    HawkCatcher.send(new Error('test-invalid'));

    expect(axios.post).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledOnce();

    const payload = getSentPayload();

    expect(payload.title).toBe('Error: test-invalid');
    expect(payload.backtrace).toBeInstanceOf(Array);
  });

  it('sends original payload and warns when beforeSend returns empty object', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initWithBeforeSend((() => ({})) as any);

    HawkCatcher.send(new Error('test-empty-obj'));

    expect(axios.post).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledOnce();

    const payload = getSentPayload();

    expect(payload.title).toBe('Error: test-empty-obj');
    expect(payload.backtrace).toBeInstanceOf(Array);
  });

  it('warns when beforeSend mutates payload to invalid state', () => {
    initWithBeforeSend((event) => {
      event.title = '';
    });

    HawkCatcher.send(new Error('test-mutated'));

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(axios.post).toHaveBeenCalledOnce();

    const payload = getSentPayload();

    /**
     * payload was mutated in-place (title = ''), so the sent object has the corrupted title.
     * The warn is the signal — we verify it fired above.
     * We still check that backtrace survived to confirm the rest of the payload is intact.
     */
    expect(payload.backtrace).toBeInstanceOf(Array);
  });

  it('sends event as is and warns when beforeSend deletes required field', () => {
    initWithBeforeSend((event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (event as any).title;
    });

    HawkCatcher.send(new Error('test-deleted'));

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(axios.post).toHaveBeenCalledOnce();

    const payload = getSentPayload();

    /**
     * title was deleted in-place, so it's undefined on the sent object.
     * The warn signals the problem. We verify the rest of the payload is intact.
     */
    expect(payload.backtrace).toBeInstanceOf(Array);
  });

  it('sends event without optional fields when beforeSend deletes them', () => {
    initWithBeforeSend((event) => {
      delete event.release;
      delete event.context;

      return event;
    });

    HawkCatcher.send(new Error('test-optional'));

    expect(axios.post).toHaveBeenCalledOnce();

    const payload = getSentPayload();

    expect(payload.title).toBe('Error: test-optional');
    expect(payload.release).toBeUndefined();
    expect(payload.context).toBeUndefined();
    expect(payload.backtrace).toBeInstanceOf(Array);
  });
});
