import { HawkEvent, HawkNodeJSInitialSettings } from 'index';
import EventPayload from './modules/event';
const axios = require('axios').default;

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
    this.catch(fakeEvent);
  }

  /**
   * This method prepares and sends an Error to Hawk
   * User can fire it manually on try-catch
   *
   * @param {Error} error - error to catch
   */
  public catch(error: Error): void {
    /**
     * Compose and send a request to Hawk
     */
    this.formatAndSend(error);
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
      this.catch(err);
    });

    /**
     * Catch unhandled rejections
     */
    global.process.on('unhandledRejection', (err: Error | undefined) => {
      console.error('Error occurred without a catch block inside the asynchronous function, or because a promise was rejected that was not processed using .catch().\nPromise rejected due to:', err);
    });
  };

  /**
   * Format and send an error
   *
   * @param {Error} err - error to send
   */
  private formatAndSend(err: Error): void {
    const eventPayload = new EventPayload(err);

    this.sendErrorFormatted({
      token: this.token,
      catcherType: this.type,
      payload: {
        title: eventPayload.getTitle(),
        type: eventPayload.getType(),
        backtrace: eventPayload.getBacktrace(),
      },
    });
  }

  /**
   * Sends formatted HawkEvent to the Collector
   *
   * @param {HawkEvent} eventFormatted - formatted event to send
   */
  private async sendErrorFormatted(eventFormatted: HawkEvent): Promise<void> {
    return axios.post(this.collectorEndpoint, eventFormatted)
      .then(
        /** Well done, do nothing */
      )
      .catch((err: Error) => {
        console.error(`[Hawk] Cannot send an event because of ${err.toString()}`);
      });
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
   * Wrapper for HawkCatcher.catch() method
   *
   * This method prepares and sends an Error to Hawk
   * User can fire it manually on try-catch
   *
   * @param {Error} error - error to catch
   */
  public static catch(error: Error): void {
    if (!_instance) {
      throw new Error('HawkCatcher: cannot catch an error because of instance was not set up. Check HawkCatcher.init() method.');
    }

    return _instance.catch(error);
  }
}
