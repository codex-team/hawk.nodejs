/**
 * @file Breadcrumbs module - chronological trail of events before an error
 *
 * Current: custom breadcrumbs only (HawkCatcher.breadcrumbs.add()).
 * Possible future auto-capture: outgoing HTTP (patch http.request / https.request or
 * undici), unhandledRejection/uncaughtException as last breadcrumb before send,
 * optional console.log/intercept, DB query hooks (driver-specific).
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
   *
   * @default 15
   */
  maxBreadcrumbs?: number;

  /**
   * Hook called before each breadcrumb is stored.
   * Return null to discard the breadcrumb. Return modified breadcrumb to store it.
   */
  beforeBreadcrumb?: (breadcrumb: Breadcrumb, hint?: BreadcrumbHint) => Breadcrumb | null;
}

/**
 * Breadcrumb input - timestamp optional (auto-generated if omitted). Same as @hawk.so/javascript BreadcrumbInput.
 */
export type BreadcrumbInput = Omit<Breadcrumb, 'timestamp'> & { timestamp?: Breadcrumb['timestamp'] };

interface InternalBreadcrumbsOptions {
  maxBreadcrumbs: number;
  beforeBreadcrumb?: BreadcrumbsOptions['beforeBreadcrumb'];
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

  private constructor() {}

  public static getInstance(): BreadcrumbManager {
    if (BreadcrumbManager.instance === null) {
      BreadcrumbManager.instance = new BreadcrumbManager();
    }

    return BreadcrumbManager.instance;
  }

  /**
   * Initialize with options. Call once when HawkCatcher.init() runs.
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
   */
  public addBreadcrumb(breadcrumb: BreadcrumbInput, hint?: BreadcrumbHint): void {
    const bc: Breadcrumb = {
      ...breadcrumb,
      timestamp: breadcrumb.timestamp ?? Date.now(),
    };

    if (this.options.beforeBreadcrumb) {
      const result = this.options.beforeBreadcrumb(bc, hint);

      if (result === null) {
        return;
      }

      Object.assign(bc, result);
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

  /**
   * Reset singleton (for tests)
   */
  public static resetInstance(): void {
    BreadcrumbManager.instance = null;
  }
}
