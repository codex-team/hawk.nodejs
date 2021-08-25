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
   * Any other information to send with events
   */
  context?: HawkNodeJSEventContext;
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
