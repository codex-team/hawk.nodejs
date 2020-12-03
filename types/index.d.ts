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
   * From the latest call to the earliest
   */
  backtrace?: BacktraceFrame[];

  /**
   * User identifier
   */
  user?: HawkUser;

  /**
   * Any other information to send with event
   */
  context?: HawkNodeJSEventContext;

  /**
   * Some useful details
   */
  addons?: HawkNodeJSEventAddons;
}

/**
 * Single item of backtrace
 */
export interface BacktraceFrame {
  /**
   * File
   */
  file: string | null;

  /**
   * Line number
   */
  line: number | null;

  /**
   * Column number
   */
  column: number | null;

  /**
   * Sibling source code lines: some above and some below
   */
  sourceCode?: SourceCodeLine[] | null;

  /**
   * Function name extracted from current stack frame
   */
  function?: string | null;

  /**
   * Function arguments extracted from current stack frame
   */
  arguments?: string[];
}

/**
 * Representation of source code line,
 * Used in event.payload.backtrace[].sourceCode
 */
export interface SourceCodeLine {
  /**
   * Line number
   */
  line: number;

  /**
   * Line content
   */
  content: string;
}

/**
 * Any other information to send with event
 */
export interface HawkNodeJSEventContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface HawkNodeJSEventAddons {}

/**
 * Represents User object
 */
export interface HawkUser {
  /**
   * Internal user's identifier inside an app
   */
  id: string|number;

  /**
   * User public name
   */
  name?: string;

  /**
   * URL for user's details page
   */
  url?: string;

  /**
   * User's public picture
   */
  image?: string;
}
