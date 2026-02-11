import type { EventData, NodeJSAddons } from '@hawk.so/types';
import type { BreadcrumbsOptions } from '../src/modules/breadcrumbs.js';

export type { BreadcrumbsOptions };

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
   * This Method allows you to filter any data you don't want sending to Hawk.
   *
   * - Return modified event — it will be sent instead of the original.
   * - Return `false` — the event will be dropped entirely.
   * - Any other value is invalid — the original event is sent as-is (a warning is logged).
   */
  beforeSend?(event: EventData<NodeJSAddons>): EventData<NodeJSAddons> | false | void;

  /**
   * Do not initialize global errors handling
   * This options still allow you send events manually
   */
  disableGlobalErrorsHandling?: boolean;

  /**
   * Pass false to disable breadcrumbs. Pass options object to configure maxBreadcrumbs and beforeBreadcrumb hook.
   * @default { maxBreadcrumbs: 15 }
   */
  breadcrumbs?: false | BreadcrumbsOptions;
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
