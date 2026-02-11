/**
 * @file Breadcrumbs module - chronological trail of events before an error. Custom breadcrumbs only (HawkCatcher.breadcrumbs.add()). Possible future auto-capture: outgoing HTTP, unhandledRejection/uncaughtException, console.log/intercept, DB query hooks.
 */
import type { Breadcrumb } from '@hawk.so/types';

/**
 * Default maximum number of breadcrumbs to store
 */
const DEFAULT_MAX_BREADCRUMBS = 15;

/**
 * Hint object passed to beforeBreadcrumb callback (same concept as in JS catcher; in Node no event/response yet, use for custom context)
 */
export interface BreadcrumbHint {
  [key: string]: unknown;
}

/**
 * Configuration options for breadcrumbs (same shape as @hawk.so/javascript; no trackFetch/trackNavigation/trackClicks in Node)
 */
export interface BreadcrumbsOptions {
  /**
   * Maximum number of breadcrumbs to store (FIFO). When the limit is reached, oldest are removed.
   * @default 15
   */
  maxBreadcrumbs?: number;

  /**
   * Hook called before each breadcrumb is stored.
   * - Return modified breadcrumb — it will be stored instead of the original.
   * - Return `false` — the breadcrumb will be discarded.
   * - Any other value is invalid — the original breadcrumb is stored as-is (a warning is logged).
   * @param breadcrumb - Breadcrumb to store (can be mutated and returned)
   * @param hint - Optional context (e.g. for filtering)
   */
  beforeBreadcrumb?: (breadcrumb: Breadcrumb, hint?: BreadcrumbHint) => Breadcrumb | false | void;
}

/**
 * Breadcrumb input - timestamp optional (auto-generated if omitted). Same as @hawk.so/javascript BreadcrumbInput.
 */
// eslint-disable-next-line jsdoc/require-jsdoc -- type alias documented above
export type BreadcrumbInput = Omit<Breadcrumb, 'timestamp'> & { timestamp?: Breadcrumb['timestamp'] };

/**
 * Internal breadcrumbs options (all fields set during init from BreadcrumbsOptions)
 */
interface InternalBreadcrumbsOptions {
  /** Maximum number of breadcrumbs to keep (FIFO) */
  maxBreadcrumbs: number;

  /** Optional hook before storing each breadcrumb */
  beforeBreadcrumb?: BreadcrumbsOptions['beforeBreadcrumb'];
}

/**
 * Runtime check that value is a valid Breadcrumb-like object.
 * Must be a plain object with a numeric timestamp.
 * @param v - value to validate
 */
function isValidBreadcrumb(v: unknown): v is Breadcrumb {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) {
    return false;
  }

  const candidate = v as Record<string, unknown>;

  if (typeof candidate.message !== 'string' || candidate.message.trim() === '') {
    return false;
  }

  if (candidate.timestamp !== undefined && typeof candidate.timestamp !== 'number') {
    return false;
  }

  return true;
}

/**
 * Manages breadcrumb buffer and add/get/clear API
 */
export class BreadcrumbManager {
  private static instance: BreadcrumbManager | null = null;

  private readonly breadcrumbs: Breadcrumb[] = [];

  private options: InternalBreadcrumbsOptions = {
    maxBreadcrumbs: DEFAULT_MAX_BREADCRUMBS,
  };

  private isInitialized = false;

  /**
   * Private constructor for singleton
   */
  private constructor() {}

  /**
   * Get singleton instance (created on first call).
   * @returns The shared BreadcrumbManager
   */
  public static getInstance(): BreadcrumbManager {
    if (BreadcrumbManager.instance === null) {
      BreadcrumbManager.instance = new BreadcrumbManager();
    }

    return BreadcrumbManager.instance;
  }

  /**
   * Initialize with options. Call once when HawkCatcher.init() runs.
   * @param options - Configuration (maxBreadcrumbs, beforeBreadcrumb)
   */
  public init(options: BreadcrumbsOptions = {}): void {
    if (this.isInitialized) {
      return;
    }

    this.options = {
      maxBreadcrumbs: options.maxBreadcrumbs ?? DEFAULT_MAX_BREADCRUMBS,
      beforeBreadcrumb: options.beforeBreadcrumb,
    };

    this.isInitialized = true;
  }

  /**
   * Add a breadcrumb. Timestamp is set to Date.now() if omitted.
   * @param breadcrumb - Breadcrumb data (type, message, category, level, data)
   * @param hint - Optional hint for beforeBreadcrumb callback
   */
  public addBreadcrumb(breadcrumb: BreadcrumbInput, hint?: BreadcrumbHint): void {
    const bc: Breadcrumb = {
      ...breadcrumb,
      timestamp: breadcrumb.timestamp ?? Date.now(),
    };

    if (this.options.beforeBreadcrumb) {
      let breadcrumbClone: Breadcrumb;

      try {
        breadcrumbClone = structuredClone(bc);
      } catch {
        /**
         * structuredClone may fail on non-cloneable values in breadcrumb.data
         * Fall back to passing the original — hook may mutate it, but breadcrumb storage won't crash
         */
        breadcrumbClone = bc;
      }

      const result = this.options.beforeBreadcrumb(breadcrumbClone, hint);

      /**
       * false means discard
       */
      if (result === false) {
        return;
      }

      /**
       * Valid breadcrumb → apply changes from hook
       */
      if (isValidBreadcrumb(result)) {
        Object.assign(bc, result);
      } else {
        /**
         * Anything else is invalid — warn, bc stays untouched (hook only received a clone)
         */
        console.warn('[Hawk] Invalid beforeBreadcrumb value. It should return breadcrumb or false. Breadcrumb is stored without changes.');
      }
    }

    this.breadcrumbs.push(bc);

    if (this.breadcrumbs.length > this.options.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Snapshot of current breadcrumbs (oldest to newest)
   */
  public getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  /**
   * Clear all breadcrumbs (e.g. after sending an event)
   */
  public clear(): void {
    this.breadcrumbs.length = 0;
  }
}
