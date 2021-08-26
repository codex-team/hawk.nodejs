import { HawkEvent, HawkNodeJSInitialSettings } from '../types/index';
import { EventContext, AffectedUser, EncodedIntegrationToken, DecodedIntegrationToken, EventData, NodeJSAddons } from '@hawk.so/types';
import EventPayload from './modules/event';
import axios, { AxiosResponse } from 'axios';
import { VERSION } from './version';

/**
 * Class for throwing errors inside unhandledRejection processor
 */
class UnhandledRejection extends Error {}

/**
 * Instance of HawkCatcher for singleton
 */
let _instance: Catcher;

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
  private readonly token: EncodedIntegrationToken;

  /**
   * Collector's url
   */
  private readonly collectorEndpoint: string;

  /**
   * Release identifier
   */
  private readonly release?: string;

  /**
   * Any other information to send with event
   */
  private readonly context?: EventContext;

  /**
   * This Method allows developer to filter any data you don't want sending to Hawk
   */
  private readonly beforeSend?: (event: EventData<NodeJSAddons>) => EventData<NodeJSAddons>;

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
    this.context = settings.context || undefined;
    this.release = settings.release || undefined;
    this.beforeSend = settings.beforeSend;

    if (!this.token) {
      throw new Error('Integration Token is missed. You can get it on https://hawk.so at Project Settings.');
    }

    this.collectorEndpoint = settings.collectorEndpoint || `https://${this.getIntegrationId()}.k1.hawk.so/`;

    /**
     * Set global handlers
     */
    if (!settings.disableGlobalErrorsHandling) {
      this.initGlobalHandlers();
    }
  }

  /**
   * Catcher package version
   */
  private static getVersion(): string {
    return VERSION || '';
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
   * @param {EventContext} context — event context
   * @param {AffectedUser} user - User identifier
   */
  public send(error: Error, context?: EventContext, user?: AffectedUser): void {
    /**
     * Compose and send a request to Hawk
     */
    this.formatAndSend(error, context, user);
  }

  /**
   * Returns integration id from integration token
   */
  private getIntegrationId(): string {
    const decodedIntegrationTokenAsString = Buffer
      .from(this.token, 'base64')
      .toString('utf-8');
    const decodedIntegrationToken: DecodedIntegrationToken = JSON.parse(decodedIntegrationTokenAsString);
    const integrationId = decodedIntegrationToken.integrationId;

    if (!integrationId || integrationId === '') {
      throw new Error('Invalid integration token. There is no integration ID.');
    }

    return integrationId;
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
   * @param {EventContext} context — event context
   * @param {AffectedUser} user - User identifier
   */
  private formatAndSend(err: Error, context?: EventContext, user?: AffectedUser): void {
    const eventPayload = new EventPayload(err);
    let payload: EventData<NodeJSAddons> = {
      title: eventPayload.getTitle(),
      type: eventPayload.getType(),
      backtrace: eventPayload.getBacktrace(),
      user: this.getUser(user),
      context: JSON.stringify(this.getContext(context)),
      release: this.release,
      catcherVersion: Catcher.getVersion(),
    };

    /**
     * Filter sensitive data
     */
    if (typeof this.beforeSend === 'function') {
      payload = this.beforeSend(payload);
    }

    this.sendErrorFormatted({
      token: this.token,
      catcherType: this.type,
      payload,
    });
  }

  /**
   * Sends formatted EventData<NodeJSAddons> to the Collector
   *
   * @param {EventData<NodeJSAddons>>} eventFormatted - formatted event to send
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sendErrorFormatted(eventFormatted: HawkEvent): Promise<void | AxiosResponse<any>> | void {
    return axios.post(this.collectorEndpoint, eventFormatted)
      .catch((err: Error) => {
        console.error(`[Hawk] Cannot send an event because of ${err.toString()}`);
      });
  }

  /**
   * Compose User object
   *
   * @param {AffectedUser} user - User identifier
   * @returns {AffectedUser|undefined}
   * @private
   */
  private getUser(user?: AffectedUser): AffectedUser|undefined {
    return user;
  }

  /**
   * Compose context object
   *
   * @param {EventContext} context - Any other information to send with event
   * @returns {EventContext}
   */
  private getContext(context?: EventContext): object {
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
   * @param {EventContext} context — event context
   * @param {AffectedUser} user - User identifier
   */
  public static send(error: Error, context?: EventContext, user?: AffectedUser): void {
    /**
     * If instance is undefined then do nothing
     */
    if (_instance) {
      return _instance.send(error, context, user);
    }
  }
}

export {
  HawkNodeJSInitialSettings
};
