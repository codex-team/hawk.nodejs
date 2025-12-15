import type { BacktraceFrame } from '@hawk.so/types';
import BacktraceHelper from './backtrace.js';

/**
 * Helper for getting error data
 */
export default class EventPayload {
  /**
   * Error to be processed
   */
  public error: Error | undefined;

  /**
   * Initialize a class
   * @param error — error event to be processed
   */
  constructor(error: Error) {
    this.error = error;
  }

  /**
   * Return event title
   */
  public getTitle(): string {
    /**
     * Built-it wrapper for error title string
     * `${error.type}: ${error.message}`
     */
    if (this.error && typeof this.error.toString === 'function') {
      return this.error.toString();
    }

    return '<unknown>';
  }

  /**
   * Return event type
   */
  public getType(): string {
    if (this.error && this.error.name) {
      return this.error.name;
    }

    return '<UnknownType>';
  }

  /**
   * Return event's backtrace
   */
  public getBacktrace(): BacktraceFrame[] {
    if (this.error === undefined) {
      return [];
    }

    const backtrace = new BacktraceHelper(this.error);

    return backtrace.getBacktrace();
  }
}
