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

  it.each([
    { label: 'undefined', value: undefined },
    { label: 'null', value: null },
    { label: 'number (42)', value: 42 },
    { label: 'string ("oops")', value: 'oops' },
    { label: 'true', value: true },
    { label: 'empty object', value: {} },
  ])('sends original payload and warns when beforeSend returns $label', ({ value }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initWithBeforeSend(() => value as any);

    HawkCatcher.send(new Error('test-invalid'));

    expect(axios.post).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(
      '[Hawk] Invalid beforeSend value. It should return event or false. Event is sent without changes.'
    );

    const payload = getSentPayload();

    expect(payload.title).toBe('Error: test-invalid');
    expect(payload.backtrace).toBeInstanceOf(Array);
  });

  it('sends original payload and warns when beforeSend mutates title to empty string', () => {
    initWithBeforeSend((event) => {
      event.title = '';

      return event;
    });

    HawkCatcher.send(new Error('test-mutated'));

    expect(axios.post).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(
      '[Hawk] Invalid beforeSend value. It should return event or false. Event is sent without changes.'
    );

    // structuredClone restores original payload
    const payload = getSentPayload();

    expect(payload.title).toBe('Error: test-mutated');
    expect(payload.backtrace).toBeInstanceOf(Array);
  });

  it('sends original payload and warns when beforeSend deletes required field (title)', () => {
    initWithBeforeSend((event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (event as any).title;

      return event;
    });

    HawkCatcher.send(new Error('test-deleted'));

    expect(axios.post).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(
      '[Hawk] Invalid beforeSend value. It should return event or false. Event is sent without changes.'
    );

    // structuredClone restores original payload
    const payload = getSentPayload();

    expect(payload.title).toBe('Error: test-deleted');
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
