/**
 * NodeJS Catcher initial settings
 */
export interface HawkInitialSettings {
  /**
   * User project's Integration Token
   */
  token: string;

  /**
   * Hawk Collector endpoint.
   * Can be overwritten for development purposes.
   * @example http://localhost:3000/
   */
  collectorEndpoint?: string;
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
   * Some useful details
   */
  addons?: object;
}

/**
 * Single item of backtrace
 */
export interface BacktraceFrame {
  /**
   * File
   */
  file: string;

  /**
   * Line number
   */
  line: number;

  /**
   * Column number
   */
  column: number;

  /**
   * Sibling source code lines: some above and some below
   */
  sourceCode?: SourceCodeLine[];

  /**
   * Function name extracted from current stack frame
   */
  function?: string;

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
