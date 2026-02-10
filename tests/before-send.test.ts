import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Buffer } from 'buffer';
import HawkCatcher from '../src/index.js';
import axios from 'axios';

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
function initWithBeforeSend(beforeSend: Parameters<typeof HawkCatcher.init>[0] extends string ? never : NonNullable<Exclude<Parameters<typeof HawkCatcher.init>[0], string>['beforeSend']>): void {
  HawkCatcher.init({
    token: TEST_TOKEN,
    disableGlobalErrorsHandling: true,
    beforeSend,
  });
}

describe('beforeSend processing', () => {
  beforeEach(() => {
    vi.mocked(axios.post).mockClear();
  });

  it('sends event when beforeSend returns it unchanged', () => {
    initWithBeforeSend((event) => event);

    HawkCatcher.send(new Error('test'));

    expect(axios.post).toHaveBeenCalledOnce();
  });

  it('sends modified event when beforeSend returns modified payload', () => {
    initWithBeforeSend((event) => {
      event.context = { filtered: true };

      return event;
    });

    HawkCatcher.send(new Error('test'));

    expect(axios.post).toHaveBeenCalledOnce();
    const sentPayload = vi.mocked(axios.post).mock.calls[0][1] as { payload: { context: unknown } };

    expect(sentPayload.payload.context).toEqual({ filtered: true });
  });

  it('drops event when beforeSend returns false', () => {
    initWithBeforeSend(() => false);

    HawkCatcher.send(new Error('test'));

    expect(axios.post).not.toHaveBeenCalled();
  });

  it('sends original payload and warns when beforeSend returns undefined (no return)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    initWithBeforeSend(() => {
      /* no return */
    });

    HawkCatcher.send(new Error('test'));

    expect(axios.post).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith('[Hawk] beforeSend returned nothing, sending original event.');
    warnSpy.mockRestore();
  });

  it('sends original payload and warns when beforeSend returns null', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initWithBeforeSend((() => null) as any);

    HawkCatcher.send(new Error('test'));

    expect(axios.post).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith('[Hawk] beforeSend returned nothing, sending original event.');
    warnSpy.mockRestore();
  });

  it('sends original payload and warns when beforeSend returns invalid value', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initWithBeforeSend((() => true) as any);

    HawkCatcher.send(new Error('test'));

    expect(axios.post).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it('sends original payload and warns when beforeSend returns empty object', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initWithBeforeSend((() => ({})) as any);

    HawkCatcher.send(new Error('test'));

    expect(axios.post).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it('warns when beforeSend mutates payload to invalid state', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    initWithBeforeSend((event) => {
      event.title = '';
    });

    HawkCatcher.send(new Error('test'));

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(axios.post).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it('warns when beforeSend deletes required field', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    initWithBeforeSend((event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (event as any).title;
    });

    HawkCatcher.send(new Error('test'));

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(axios.post).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it('sends when beforeSend removes optional fields', () => {
    initWithBeforeSend((event) => {
      delete event.release;
      delete event.context;

      return event;
    });

    HawkCatcher.send(new Error('test'));

    expect(axios.post).toHaveBeenCalledOnce();
  });
});
