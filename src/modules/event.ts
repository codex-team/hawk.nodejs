import { BacktraceFrame } from '../../types';
import BacktraceHelper from './backtrace';

/**
 * Helper for getting error data
 */
export default class ErrorEvent {
  /**
   * Error to be processed
   */
  public err: Error;

  /**
   * Initialize a class
   *
   * @param {Error} err — error event to be processed
   */
  constructor(err: Error) {
    this.err = err;
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
    if (this.err && this.err.toString) {
      return this.err.toString();
    }

    return '<unknown>';
  }

  /**
   * Return event type
   *
   * @returns {string}
   */
  public getType(): string {
    if (this.err && this.err.name) {
      return this.err.name;
    }

    return '<UnknownType>';
  }

  /**
   * Return event's backtrace
   *
   * @returns {BacktraceFrame[]}
   */
  public getBacktrace(): BacktraceFrame[] {
    const backtrace = new BacktraceHelper(this.err);

    return backtrace.getBacktrace();
  }
}
