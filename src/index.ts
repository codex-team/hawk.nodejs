import type { HawkEvent } from '../types/index.js';
import type { HawkNodeJSInitialSettings } from '../types/index.js';
import { Buffer } from 'buffer';
import process from 'process';
import type {
  EventContext,
  AffectedUser,
  EncodedIntegrationToken,
  DecodedIntegrationToken,
  EventData,
  NodeJSAddons,
  Json
} from '@hawk.so/types';
import EventPayload from './modules/event.js';
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import { VERSION } from './version.js';

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
 * @copyright CodeX
 */
class Catcher {
  /**
   * Type is a family name of a catcher
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
   * @param settings - If settings is a string, it means an Integration Token
   */
  constructor(settings: HawkNodeJSInitialSettings | string) {
    if (typeof settings === 'string') {
      settings = {
        token: settings,
      } as HawkNodeJSInitialSettings;
    }

    this.token = settings.token;
    this.context = settings.context ?? undefined;
    this.release = settings.release ?? undefined;
    this.beforeSend = settings.beforeSend?.bind(undefined);

    if (!this.token) {
      throw new Error('Integration Token is missed. You can get it on https://hawk.so at Project Settings.');
    }

    try {
      const integrationId = this.getIntegrationId();

      this.collectorEndpoint = settings.collectorEndpoint ?? `https://${integrationId}.k1.hawk.so/`;

      /**
       * Set global handlers
       */
      if (settings.disableGlobalErrorsHandling !== true) {
        this.initGlobalHandlers();
      }
    } catch (_error) {
      throw new Error('Invalid integration token');
    }
  }

  /**
   * Catcher package version
   */
  private static getVersion(): string {
    if (VERSION !== undefined && VERSION !== null) {
      return String(VERSION);
    }

    return '';
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
   * @param error - error to catch
   * @param context — event context
   * @param user - User identifier
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
    const decodedIntegrationToken = JSON.parse(decodedIntegrationTokenAsString) as DecodedIntegrationToken;
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
    process.on('uncaughtException', (err: Error) => {
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
    process.on('unhandledRejection', (error: Error | string) => {
      /**
       * Correct reject processing
       */
      if (error instanceof Error) {
        if (_instance !== undefined) {
          _instance.send(error);
        }
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

        if (_instance !== undefined) {
          _instance.send(new UnhandledRejection(reason));
        }
      }

      /**
       * If we know nothing about an error
       */
      if (error === undefined) {
        const reason = 'Unhandled rejection';

        if (_instance !== undefined) {
          _instance.send(new UnhandledRejection(reason));
        }
      }

      console.error('Error occurred without a catch block inside the asynchronous function, or because a promise was rejected that was not processed using .catch().\nPromise rejected due to:', error);
    });
  };

  /**
   * Format and send an error
   * @param err - error to send
   * @param context — event context
   * @param user - User identifier
   */
  private formatAndSend(err: Error, context?: EventContext, user?: AffectedUser): void {
    const eventPayload = new EventPayload(err);
    const addons = eventPayload.getAddons();
    let payload: EventData<NodeJSAddons> = {
      title: eventPayload.getTitle(),
      type: eventPayload.getType(),
      backtrace: eventPayload.getBacktrace(),
      addons: Object.keys(addons).length > 0 ? addons : undefined,
      user: this.getUser(user),
      context: this.getContext(context),
      release: this.release,
      catcherVersion: Catcher.getVersion(),
    };

    /**
     * Filter sensitive data
     */
    if (typeof this.beforeSend === 'function') {
      payload = this.beforeSend(payload);
    }

    void this.sendErrorFormatted({
      token: this.token,
      catcherType: this.type,
      payload,
    });
  }

  /**
   * Sends formatted EventData<NodeJSAddons> to the Collector
   * @param eventFormatted - prepared and formatted event to send
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sendErrorFormatted(eventFormatted: HawkEvent): Promise<void | AxiosResponse<any>> {
    return axios.post(this.collectorEndpoint, eventFormatted)
      .catch((err: Error) => {
        console.error(`[Hawk] Cannot send an event because of ${err.toString()}`);
      });
  }

  /**
   * Compose User object
   * @param user - User identifier
   */
  private getUser(user?: AffectedUser): AffectedUser | undefined {
    return user;
  }

  /**
   * Compose context object
   * @param context - Any other information to send with event
   */
  private getContext(context?: EventContext): Json {
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
   * @param settings - If settings is a string, it means an Integration Token
   */
  public static init(settings: HawkNodeJSInitialSettings | string): void {
    _instance = new Catcher(settings);
  }

  /**
   * Wrapper for HawkCatcher.send() method
   *
   * This method prepares and sends an Error to Hawk
   * User can fire it manually on try-catch
   * @param error - error to catch
   * @param context — event context
   * @param user - User identifier
   */
  public static send(error: Error, context?: EventContext, user?: AffectedUser): void {
    /**
     * If instance is undefined then do nothing
     */
    if (_instance !== undefined) {
      return _instance.send(error, context, user);
    }
  }
}

export type {
  HawkNodeJSInitialSettings
};
