import type { BacktraceFrame, NodeJSAddons } from '@hawk.so/types';
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

  /**
   * Extract additional error information for NodeJS addons
   * Includes error codes, system error fields, and any custom properties
   */
  public getAddons(): NodeJSAddons {
    if (this.error === undefined) {
      return {};
    }

    const addons: NodeJSAddons = {};

    // Get all own properties of the error (including non-enumerable ones)
    const errorProps = Object.getOwnPropertyNames(this.error);

    // Standard properties to skip (already captured elsewhere)
    const skipProps = new Set(['name', 'message', 'stack']);

    // Extract all additional properties from the error
    for (const prop of errorProps) {
      if (skipProps.has(prop)) {
        continue;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (this.error as any)[prop];

        // Only include serializable values
        if (value !== undefined && value !== null) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (addons as any)[prop] = value;
        }
      } catch {
        // Skip properties that can't be accessed
      }
    }

    return addons;
  }
}
