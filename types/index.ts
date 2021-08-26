import { EventData, NodeJSAddons } from '@hawk.so/types';

/**
 * Initial settings object
 */
export interface HawkNodeJSInitialSettings {
  /**
   * Project's token
   */
  token: string;

  /**
   * Custom collector's URL
   */
  collectorEndpoint?: string;

  /**
   * Release identifier
   */
  release?: string;

  /**
   * Any other information to send with events
   */
  context?: HawkNodeJSEventContext;

  /**
   * This Method allows you to filter any data you don't want sending to Hawk
   */
  beforeSend?(event: EventData<NodeJSAddons>): EventData<NodeJSAddons>;

  /**
   * Do not initialize global errors handling
   * This options still allow you send events manually
   */
  disableGlobalErrorsHandling?: boolean;
}

/**
 * Hawk Event format
 */
export interface HawkEvent {
  /**
   * User project's Integration Token
   */
  token: string;

  /**
   * Hawk Catcher name
   */
  catcherType: string;

  /**
   * All information about the event
   */
  payload: EventData<NodeJSAddons>;
}

/**
 * Any other information to send with event
 */
export interface HawkNodeJSEventContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
