/**
 * Hawk Event format
 *
 * @copyright CodeX
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
  payload: EventData;
}

/**
 * Information about event
 * That object will be send as 'payload' to the Collector
 */
export interface EventData {
  /**
   * Event title
   */
  title: string;

  /**
   * Event type: TypeError, ReferenceError etc
   */
  type?: string;

  /**
   * Stack
   */
  backtrace?: string;

  /**
   * Current release (aka version, revision) of an application
   */
  release?: string;

  /**
   * Any other information to send with event
   */
  context?: object;

  /**
   * Some useful details
   */
  addons?: object;
}
