import { BacktraceFrame } from '@hawk.so/types';
import BacktraceHelper from './backtrace';

/**
 * Helper for getting error data
 */
export default class EventPayload {
  /**
   * Error to be processed
   */
  public error: Error;

  /**
   * Initialize a class
   *
   * @param {Error} error — error event to be processed
   */
  constructor(error: Error) {
    this.error = error;
  }

  /**
   * Return event title
   *
   * @returns {string}
   */
  public getTitle(): string {
    /**
     * Built-it wrapper for error title string
     * `${error.type}: ${error.message}`
     */
    if (this.error && this.error.toString) {
      return this.error.toString();
    }

    return '<unknown>';
  }

  /**
   * Return event type
   *
   * @returns {string}
   */
  public getType(): string {
    if (this.error && this.error.name) {
      return this.error.name;
    }

    return '<UnknownType>';
  }

  /**
   * Return event's backtrace
   *
   * @returns {BacktraceFrame[]}
   */
  public getBacktrace(): BacktraceFrame[] {
    const backtrace = new BacktraceHelper(this.error);

    return backtrace.getBacktrace();
  }
}
