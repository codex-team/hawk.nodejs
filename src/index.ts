import { HawkEvent, HawkNodeJSInitialSettings, HawkNodeJSEventContext } from '../types/index';
import EventPayload from './modules/event';
import axios, { AxiosResponse } from 'axios';

/**
 * Class for throwing errors inside unhandledRejection processor
 */
class UnhandledRejection extends Error {}

/**
 * Instance of HawkCatcher for singleton
 */
let _instance: Catcher;

/**
 * Default Collector's URL
 */
const DEFAULT_EVENT_COLLECTOR_URL = 'https://k1.hawk.so/';

/**
 * Hawk NodeJS Catcher
 * Module for errors and exceptions tracking
 *
 * @copyright CodeX
 */
class Catcher {
  /**
   * Catcher Type
   */
  private readonly type: string = 'errors/nodejs';

  /**
   * User project's Integration Token
   */
  private readonly token: string;

  /**
   * Collector's url
   */
  private readonly collectorEndpoint: string;

  /**
   * Any other information to send with event
   */
  private readonly context?: HawkNodeJSEventContext;

  /**
   * Catcher constructor
   *
   * @param {HawkNodeJSInitialSettings|string} settings - If settings is a string, it means an Integration Token
   */
  constructor(settings: HawkNodeJSInitialSettings | string) {
    if (typeof settings === 'string') {
      settings = {
        token: settings,
      } as HawkNodeJSInitialSettings;
    }

    this.token = settings.token;
    this.collectorEndpoint = settings.collectorEndpoint || DEFAULT_EVENT_COLLECTOR_URL;
    this.context = settings.context || undefined;

    if (!this.token) {
      throw new Error('Integration Token is missed. You can get it on https://hawk.so at Project Settings.');
    }

    /**
     * Set handlers
     */
    this.initGlobalHandlers();
  }

  /**
   * Send test event from client
   */
  public test(): void {
    /**
     * Create a dummy error event
     * Error: Hawk NodeJS Catcher test message
     */
    const fakeEvent = new Error('Hawk NodeJS Catcher test message');

    /**
     * Catch it and send to Hawk
     */
    this.send(fakeEvent);
  }

  /**
   * This method prepares and sends an Error to Hawk
   * User can fire it manually on try-catch
   *
   * @param {Error} error - error to catch
   * @param {HawkNodeJSEventContext} context — event context
   */
  public send(error: Error, context?: HawkNodeJSEventContext): void {
    /**
     * Compose and send a request to Hawk
     */
    this.formatAndSend(error, context);
  }

  /**
   * Define own error handlers
   */
  private initGlobalHandlers(): void {
    /**
     * Catch unhandled exceptions
     */
    global.process.on('uncaughtException', (err: Error) => {
      /**
       * Show error data in console
       */
      console.error(err);

      /**
       * Process error catching
       */
      this.send(err);
    });

    /**
     * Catch unhandled rejections
     */
    global.process.on('unhandledRejection', (error: Error | string) => {
      /**
       * Correct reject processing
       */
      if (error instanceof Error) {
        HawkCatcher.send(error);
      }

      /**
       * If only error string was passed on reject
       */
      if (typeof error === 'string') {
        /**
         * Event is a string with reject info
         *
         * Promise.reject('Wrong database key')
         * will throw: 'Wrong database key'
         */
        const reason = `Unhandled rejection: ${error}`;

        HawkCatcher.send(new UnhandledRejection(reason));
      }

      /**
       * If we know nothing about an error
       */
      if (!error) {
        const reason = 'Unhandled rejection';

        HawkCatcher.send(new UnhandledRejection(reason));
      }

      console.error('Error occurred without a catch block inside the asynchronous function, or because a promise was rejected that was not processed using .catch().\nPromise rejected due to:', error);
    });
  };

  /**
   * Format and send an error
   *
   * @param {Error} err - error to send
   * @param {HawkNodeJSEventContext} context — event context
   */
  private formatAndSend(err: Error, context?: HawkNodeJSEventContext): void {
    const eventPayload = new EventPayload(err);

    this.sendErrorFormatted({
      token: this.token,
      catcherType: this.type,
      payload: {
        title: eventPayload.getTitle(),
        type: eventPayload.getType(),
        backtrace: eventPayload.getBacktrace(),
        context: this.getContext(context),
      },
    });
  }

  /**
   * Sends formatted HawkEvent to the Collector
   *
   * @param {HawkEvent} eventFormatted - formatted event to send
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sendErrorFormatted(eventFormatted: HawkEvent): Promise<void | AxiosResponse<any>> | void {
    return axios.post(this.collectorEndpoint, eventFormatted)
      .catch((err: Error) => {
        console.error(`[Hawk] Cannot send an event because of ${err.toString()}`);
      });
  }

  /**
   * Compose context object
   *
   * @param {HawkNodeJSEventContext} context - Any other information to send with event
   */
  private getContext(context?: HawkNodeJSEventContext): object {
    const contextMerged = {};

    if (this.context !== undefined) {
      Object.assign(contextMerged, this.context);
    }

    if (context !== undefined) {
      Object.assign(contextMerged, context);
    }

    return contextMerged;
  }
}

/**
 * Wrapper for Hawk NodeJS Catcher
 */
export default class HawkCatcher {
  /**
   * Wrapper for HawkCatcher constructor
   *
   * @param {HawkNodeJSInitialSettings|string} settings - If settings is a string, it means an Integration Token
   */
  public static init(settings: HawkNodeJSInitialSettings | string): void {
    _instance = new Catcher(settings);
  }

  /**
   * Wrapper for HawkCatcher.send() method
   *
   * This method prepares and sends an Error to Hawk
   * User can fire it manually on try-catch
   *
   * @param {Error} error - error to catch
   * @param {HawkNodeJSEventContext} context — event context
   */
  public static send(error: Error, context?: HawkNodeJSEventContext): void {
    /**
     * If instance is undefined then do nothing
     */
    if (_instance) {
      return _instance.send(error, context);
    }
  }
}

export {
  HawkNodeJSInitialSettings
};
